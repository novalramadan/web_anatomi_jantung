// 1700000030_seed_aset_3d.js
// Creates the first aset_3d record from cardioverse/assets/models/jantung.glb and
// links it to marker id_lokal = 1. Idempotent: skips when marker 1 is already linked.
migrate((app) => {
  const markers = app.findRecordsByFilter("marker", "", "", 0, 0);
  const target = markers.find((r) => String(r.get("id_lokal")) === "1");
  if (!target) { console.log("seed_aset_3d: marker id_lokal=1 not found, skipping"); return; }
  if (target.get("aset_3d")) { console.log("seed_aset_3d: already linked, skipping"); return; }

  const file = $filesystem.fileFromPath("cardioverse/assets/models/jantung.glb");
  const aset = new Record(app.findCollectionByNameOrId("aset_3d"));
  aset.set("nama", "Jantung dan Katup");
  aset.set("keterangan", "Model 3D jantung empat ruang dengan katup atrioventrikular dan semilunar. Dipakai fitur AR Scanner untuk marker id_lokal = 1.");
  aset.set("file_glb", file);
  app.save(aset);

  target.set("aset_3d", aset.id);
  app.save(target);
  console.log("seed_aset_3d: created " + aset.id + " linked to marker " + target.id);
}, (app) => {
  try {
    const markers = app.findRecordsByFilter("marker", "", "", 0, 0);
    const t = markers.find((r) => String(r.get("id_lokal")) === "1");
    if (t) { t.set("aset_3d", null); app.save(t); }
  } catch (e) {}
  try { for (const r of app.findRecordsByFilter("aset_3d", "", "", 0, 0)) app.delete(r); } catch (e) {}
});
