// 1700000050_auto_markers.js
// Backfill one marker for every aset_3d that has a file_glb but no marker yet.
// Idempotent: assets already referenced by a marker are skipped. Numbering
// matches the runtime hook: n = max(id_lokal, nilai_barcode) + 1, new markers
// get both fields = n. A pre-existing unlinked marker whose nama matches the
// asset is adopted (seed marker 1 case) instead of allocating a new number.
// Down migration is a no-op (deleting backfilled markers could destroy user
// edits made after the upgrade).
migrate((app) => {
  const MAX_ALLOC_ATTEMPTS = 5;

  function nextMarkerNumber() {
    const all = app.findRecordsByFilter("marker", "", "", 0, 0);
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

  function findUnlinkedMarker(aset) {
    const target = String(aset.get("nama") || "").trim().toLowerCase();
    if (target === "") return null;
    const all = app.findRecordsByFilter("marker", "", "id_lokal", 0, 0);
    for (const m of all) {
      if (String(m.get("aset_3d") || "") !== "") continue;
      if (String(m.get("nama") || "").trim().toLowerCase() === target) return m;
    }
    return null;
  }

  let linked = {};
  for (const m of app.findRecordsByFilter("marker", "", "", 0, 0)) {
    const asetId = String(m.get("aset_3d") || "");
    if (asetId !== "") linked[asetId] = true;
  }

  let adopted = 0;
  let created = 0;
  for (const aset of app.findRecordsByFilter("aset_3d", "", "", 0, 0)) {
    if (String(aset.get("file_glb") || "") === "") continue;
    if (linked[String(aset.id)]) continue;

    const candidate = findUnlinkedMarker(aset);
    if (candidate) {
      candidate.set("aset_3d", aset.id);
      if (Number(candidate.get("nilai_barcode") || 0) <= 0) {
        candidate.set("nilai_barcode", Number(candidate.get("id_lokal") || 0));
      }
      candidate.set("nama", markerName(aset, candidate.get("id_lokal")));
      candidate.set("deskripsi", String(aset.get("keterangan") || ""));
      app.save(candidate);
      linked[String(aset.id)] = true;
      adopted++;
      continue;
    }

    let lastErr = null;
    for (let attempt = 0; attempt < MAX_ALLOC_ATTEMPTS; attempt++) {
      const n = nextMarkerNumber();
      const marker = new Record(app.findCollectionByNameOrId("marker"));
      marker.set("id_lokal", n);
      marker.set("nilai_barcode", n);
      marker.set("nama", markerName(aset, n));
      marker.set("deskripsi", String(aset.get("keterangan") || ""));
      marker.set("pertemuan_terkait", []);
      marker.set("lapisan", []);
      marker.set("aset_3d", aset.id);
      try {
        app.save(marker);
        linked[String(aset.id)] = true;
        created++;
        break;
      } catch (err) {
        lastErr = err;
        if (attempt === MAX_ALLOC_ATTEMPTS - 1) throw lastErr;
      }
    }
  }

  console.log("1700000050_auto_markers: created " + created + " marker(s), adopted " + adopted);
}, (app) => {
  // No-op: backfilled markers may since have been edited; leave them alone.
});

