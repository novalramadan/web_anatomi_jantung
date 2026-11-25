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
//   4. Block deletion of an aset_3d still referenced by a marker (HTTP 400).

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
// Block delete of an aset_3d still referenced by any marker. Returns HTTP 400
// with a clear message.
// ---------------------------------------------------------------------------
onRecordDeleteRequest((e) => {
  if (e.record.collection().name !== "aset_3d") return e.next();

  const asetId = String(e.record.id);
  const markers = $app.findRecordsByFilter("marker", "", "", 0, 0);
  const blockers = [];
  for (const m of markers) {
    if (String(m.get("aset_3d")) === asetId) {
      blockers.push(String(m.get("nama")) + " (id_lokal=" + String(m.get("id_lokal")) + ")");
    }
  }
  if (blockers.length > 0) {
    throw new BadRequestError(
      "Aset 3D ini masih dipakai oleh marker berikut, hapus relasinya dulu: " + blockers.join(", ")
    );
  }
  return e.next();
}, "aset_3d");
