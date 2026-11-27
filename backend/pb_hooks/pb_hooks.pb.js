// pb_hooks/pb_hooks.pb.js — Medical-U backend hooks
// Loaded by `pocketbase serve` via --hooksDir (or default pb_hooks/).
//
// NOTE ON SCOPE: the PocketBase goja runtime invokes each registered hook in its
// own isolated scope, so top-level `var` / `globalThis.X` declared in this file
// are NOT visible inside hook closures. Therefore the CONFIG block is repeated
// verbatim inside every hook below. Edit every copy when changing values — they
// are kept identical on purpose.
//
// Responsibilities:
//   1. Seed the superuser + two demo accounts on first run.
//   2. Normalize role on user create: accept mahasiswa/dosen, else default mahasiswa.
//   3. Prevent non-dosen edits of their own `role` field via the API.
//   4. Auto-manage marker records for aset_3d:
//        create -> marker auto-created when file_glb is set
//        update -> marker kept in sync (nama/deskripsi), created if missing+GLB
//        delete -> cascade-delete all markers referencing the asset
//      An existing *unlinked* marker whose nama matches the asset nama
//      (case-insensitive, trimmed) is adopted instead of allocating a new one;
//      this keeps seed marker id_lokal/nilai_barcode = 1 reusable.
//      Barcode/id_lokal stay stable for the lifetime of a marker.
//
// NOTE ON HOOK CHOICE (PocketBase v0.40.6, verified): neither hook family rolls
// back an already-persisted record when a hook throws after the record write.
//   - `onRecord*Request`: an error after `e.next()` is only logged and the
//     client still receives HTTP 200 with the created record.
//   - `onRecordAfter*Success`: an error is returned as HTTP 4xx, but the record
//     write is already committed and is NOT rolled back.
// Create/update therefore use the after-success hooks (they see the persisted
// record, which the marker relation needs). A marker failure cannot undo the
// already-committed asset write:
//   - create: the hook compensates by deleting the just-created asset before
//     rethrowing, so the HTTP 4xx leaves no asset without a marker;
//   - update: the hook can only return HTTP 4xx; the asset update persists and
//     the marker stays stale until the next successful asset save (the backfill
//     migration can also repair it).
// Delete uses the request hook: its pre-`e.next()` work is rolled back when the
// request fails, and it deletes the markers before the asset row.

// ---------------------------------------------------------------------------
// Seed the superuser. Idempotent. Runs at bootstrap — safe because the
// _superusers collection is built-in (no dependency on migrations).
//
// NOTE: demo users are seeded in migrate/1700000015_seed_users.js, not here.
// Bootstrap fires BEFORE migrations run, so role/nama would be dropped.
// ---------------------------------------------------------------------------
onBootstrap((e) => {
  // CONFIG — edit here.
  const superuserEmail = "admin@medicalu.local";
  const superuserPassword = "Admin123456!";
  // -------------------------------------------------------------------------

  e.next();

  try {
    $app.findAuthRecordByEmail("_superusers", superuserEmail);
  } catch (err) {
    const suColl = $app.findCollectionByNameOrId("_superusers");
    const su = new Record(suColl);
    su.set("email", superuserEmail);
    su.set("password", superuserPassword);
    $app.save(su);
    console.log("[seed] superuser created:", superuserEmail);
  }
});

// ---------------------------------------------------------------------------
// Normalize role on user create: accept a valid role from the request body
// (mahasiswa | dosen), otherwise default to mahasiswa.
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  // CONFIG — keep in sync with the other hooks.
  const defaultRole = "mahasiswa";
  const validRoles = ["mahasiswa", "dosen"];
  // -------------------------------------------------------------------------

  if (e.record.collection().name !== "users") return e.next();
  const requestedRole = String(e.record.get("role") || "").trim().toLowerCase();
  e.record.set(
    "role",
    validRoles.indexOf(requestedRole) !== -1 ? requestedRole : defaultRole
  );
  return e.next();
}, "users");

// ---------------------------------------------------------------------------
// role is immutable via the API: restore the persisted value unless the caller
// is a superuser (only Dashboard).
// ---------------------------------------------------------------------------
onRecordUpdateRequest((e) => {
  if (e.record.collection().name !== "users") return e.next();
  if (e.hasSuperuserAuth()) return e.next();

  let original;
  try {
    original = $app.findRecordById("users", e.record.id);
  } catch (err) {
    return e.next();
  }
  if (String(e.record.get("role")) !== String(original.get("role"))) {
    e.record.set("role", original.get("role"));
  }
  return e.next();
}, "users");

// ---------------------------------------------------------------------------
// aset_3d created: after the record is persisted, ensure it has a marker when a
// GLB file was uploaded. The record write is already committed and PocketBase
// cannot roll it back from this hook, so on marker failure this hook deletes
// the just-created asset before rethrowing; the client receives HTTP 4xx.
// ---------------------------------------------------------------------------
onRecordAfterCreateSuccess((e) => {
  // CONFIG — keep in sync with the other aset_3d hooks.
  const markerCollection = "marker";
  const maxAllocAttempts = 5;
  // -------------------------------------------------------------------------
  // Helpers are duplicated inside each hook on purpose (see scope note above).

  function readFileName(value) {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.length > 0 ? readFileName(value[0]) : "";
    if (typeof value === "object") {
      const name = value.name || value.filename || value.id;
      return name ? String(name) : "";
    }
    return String(value);
  }

  function findMarkers(app, asetId) {
    const all = app.findRecordsByFilter(markerCollection, "", "id_lokal", 0, 0);
    const out = [];
    for (const m of all) {
      if (String(m.get("aset_3d") || "") === asetId) out.push(m);
    }
    return out;
  }

  function findUnlinkedMarker(app, aset) {
    const target = String(aset.get("nama") || "").trim().toLowerCase();
    if (target === "") return null;
    const all = app.findRecordsByFilter(markerCollection, "", "id_lokal", 0, 0);
    for (const m of all) {
      if (String(m.get("aset_3d") || "") !== "") continue;
      if (String(m.get("nama") || "").trim().toLowerCase() === target) return m;
    }
    return null;
  }

  function nextMarkerNumber(app) {
    const all = app.findRecordsByFilter(markerCollection, "", "", 0, 0);
    let max = 0;
    for (const m of all) {
      const idLokal = Number(m.get("id_lokal") || 0);
      const barcode = Number(m.get("nilai_barcode") || 0);
      if (isFinite(idLokal) && idLokal > max) max = idLokal;
      if (isFinite(barcode) && barcode > max) max = barcode;
    }
    return max + 1;
  }

  function markerName(aset, fallbackNumber) {
    const nama = String(aset.get("nama") || "");
    return nama.trim() !== "" ? nama : "Marker AR " + fallbackNumber;
  }

  function syncMarker(app, marker, aset) {
    const nama = markerName(aset, marker.get("id_lokal"));
    const deskripsi = String(aset.get("keterangan") || "");
    if (String(marker.get("nama") || "") !== nama ||
        String(marker.get("deskripsi") || "") !== deskripsi) {
      marker.set("nama", nama);
      marker.set("deskripsi", deskripsi);
      app.save(marker);
    }
  }

  // Idempotent: never creates a second marker for the same asset.
  function ensureMarker(app, aset) {
    const asetId = String(aset.id);
    const existing = findMarkers(app, asetId);
    if (existing.length > 0) {
      syncMarker(app, existing[0], aset);
      return existing[0];
    }

    // Reuse a matching unlinked marker (seed migrations create marker 1 before
    // the asset and link it afterwards). Its id_lokal/barcode are preserved.
    const candidate = findUnlinkedMarker(app, aset);
    if (candidate) {
      candidate.set("aset_3d", asetId);
      candidate.set("nama", markerName(aset, candidate.get("id_lokal")));
      candidate.set("deskripsi", String(aset.get("keterangan") || ""));
      if (Number(candidate.get("nilai_barcode") || 0) <= 0) {
        candidate.set("nilai_barcode", Number(candidate.get("id_lokal") || 0));
      }
      // Save unconditionally: syncMarker() skips identical nama/deskripsi, so
      // relying on it here would silently drop the new aset_3d relation.
      app.save(candidate);
      return candidate;
    }

    let lastErr = null;
    for (let attempt = 0; attempt < maxAllocAttempts; attempt++) {
      const n = nextMarkerNumber(app);
      const marker = new Record(app.findCollectionByNameOrId(markerCollection));
      marker.set("id_lokal", n);
      marker.set("nilai_barcode", n);
      marker.set("nama", markerName(aset, n));
      marker.set("deskripsi", String(aset.get("keterangan") || ""));
      marker.set("pertemuan_terkait", []);
      marker.set("lapisan", []);
      marker.set("aset_3d", asetId);
      try {
        app.save(marker);
        return marker;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  }
  // -------------------------------------------------------------------------
  // No e.next() call here: the after-success hook already runs past the record
  // write and has nothing further to chain.

  if (e.record.collection().name !== "aset_3d") return;
  if (readFileName(e.record.get("file_glb")) === "") return;

  const app = e.app || $app;
  try {
    ensureMarker(app, e.record);
  } catch (err) {
    // The asset row is already committed at this point; delete it so a failed
    // marker never leaves an asset without its marker (see hook-choice note).
    try {
      app.delete(e.record);
    } catch (delErr) {
      console.error("[aset_3d] marker creation failed and rollback delete failed:", String(delErr));
    }
    throw err;
  }
}, "aset_3d");

// ---------------------------------------------------------------------------
// aset_3d updated: keep the linked marker's nama/deskripsi in sync with the
// asset. If the asset has a GLB but no marker yet, create/adopt it. A marker is
// never deleted here (removing file_glb leaves the marker untouched).
// On marker failure the update is already committed: the client gets HTTP 4xx
// and the marker stays stale until the next successful asset save.
// ---------------------------------------------------------------------------
onRecordAfterUpdateSuccess((e) => {
  // CONFIG — keep in sync with the other aset_3d hooks.
  const markerCollection = "marker";
  const maxAllocAttempts = 5;
  // -------------------------------------------------------------------------

  function readFileName(value) {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.length > 0 ? readFileName(value[0]) : "";
    if (typeof value === "object") {
      const name = value.name || value.filename || value.id;
      return name ? String(name) : "";
    }
    return String(value);
  }

  function findMarkers(app, asetId) {
    const all = app.findRecordsByFilter(markerCollection, "", "id_lokal", 0, 0);
    const out = [];
    for (const m of all) {
      if (String(m.get("aset_3d") || "") === asetId) out.push(m);
    }
    return out;
  }

  function findUnlinkedMarker(app, aset) {
    const target = String(aset.get("nama") || "").trim().toLowerCase();
    if (target === "") return null;
    const all = app.findRecordsByFilter(markerCollection, "", "id_lokal", 0, 0);
    for (const m of all) {
      if (String(m.get("aset_3d") || "") !== "") continue;
      if (String(m.get("nama") || "").trim().toLowerCase() === target) return m;
    }
    return null;
  }

  function nextMarkerNumber(app) {
    const all = app.findRecordsByFilter(markerCollection, "", "", 0, 0);
    let max = 0;
    for (const m of all) {
      const idLokal = Number(m.get("id_lokal") || 0);
      const barcode = Number(m.get("nilai_barcode") || 0);
      if (isFinite(idLokal) && idLokal > max) max = idLokal;
      if (isFinite(barcode) && barcode > max) max = barcode;
    }
    return max + 1;
  }

  function markerName(aset, fallbackNumber) {
    const nama = String(aset.get("nama") || "");
    return nama.trim() !== "" ? nama : "Marker AR " + fallbackNumber;
  }

  function syncMarker(app, marker, aset) {
    const nama = markerName(aset, marker.get("id_lokal"));
    const deskripsi = String(aset.get("keterangan") || "");
    if (String(marker.get("nama") || "") !== nama ||
        String(marker.get("deskripsi") || "") !== deskripsi) {
      marker.set("nama", nama);
      marker.set("deskripsi", deskripsi);
      app.save(marker);
    }
  }

  function ensureMarker(app, aset) {
    const asetId = String(aset.id);
    const existing = findMarkers(app, asetId);
    if (existing.length > 0) {
      syncMarker(app, existing[0], aset);
      return existing[0];
    }

    const candidate = findUnlinkedMarker(app, aset);
    if (candidate) {
      candidate.set("aset_3d", asetId);
      candidate.set("nama", markerName(aset, candidate.get("id_lokal")));
      candidate.set("deskripsi", String(aset.get("keterangan") || ""));
      if (Number(candidate.get("nilai_barcode") || 0) <= 0) {
        candidate.set("nilai_barcode", Number(candidate.get("id_lokal") || 0));
      }
      // Save unconditionally: syncMarker() skips identical nama/deskripsi, so
      // relying on it here would silently drop the new aset_3d relation.
      app.save(candidate);
      return candidate;
    }

    let lastErr = null;
    for (let attempt = 0; attempt < maxAllocAttempts; attempt++) {
      const n = nextMarkerNumber(app);
      const marker = new Record(app.findCollectionByNameOrId(markerCollection));
      marker.set("id_lokal", n);
      marker.set("nilai_barcode", n);
      marker.set("nama", markerName(aset, n));
      marker.set("deskripsi", String(aset.get("keterangan") || ""));
      marker.set("pertemuan_terkait", []);
      marker.set("lapisan", []);
      marker.set("aset_3d", asetId);
      try {
        app.save(marker);
        return marker;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr;
  }
  // -------------------------------------------------------------------------
  // No e.next() call here: the after-success hook already runs past the record
  // write and has nothing further to chain.

  if (e.record.collection().name !== "aset_3d") return;

  const app = e.app || $app;
  const hasFile = readFileName(e.record.get("file_glb")) !== "";
  const existing = findMarkers(app, String(e.record.id));

  // Sync when a marker already exists; create/adopt only when a GLB is present.
  if (existing.length > 0 || hasFile) {
    ensureMarker(app, e.record);
  }
}, "aset_3d");

// ---------------------------------------------------------------------------
// aset_3d delete: cascade-delete every marker that references the asset, then
// delete the asset. Runs inside the request transaction, so a failed asset
// delete also restores the markers.
// ---------------------------------------------------------------------------
onRecordDeleteRequest((e) => {
  // CONFIG — keep in sync with the other aset_3d hooks.
  const markerCollection = "marker";
  // -------------------------------------------------------------------------

  function findMarkers(app, asetId) {
    const all = app.findRecordsByFilter(markerCollection, "", "id_lokal", 0, 0);
    const out = [];
    for (const m of all) {
      if (String(m.get("aset_3d") || "") === asetId) out.push(m);
    }
    return out;
  }
  // -------------------------------------------------------------------------

  if (e.record.collection().name !== "aset_3d") return e.next();

  const app = e.app || $app;
  const asetId = String(e.record.id);
  for (const marker of findMarkers(app, asetId)) {
    app.delete(marker);
  }
  return e.next();
}, "aset_3d");
