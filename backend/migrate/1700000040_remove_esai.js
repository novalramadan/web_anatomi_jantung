// 1700000040_remove_esai.js
// Remove retired essay data and remedial/essay progress from existing installs.
migrate((app) => {
  try { app.delete(app.findCollectionByNameOrId("esai")); } catch (e) {}
  try {
    for (const record of app.findRecordsByFilter("progres", "", "", 0, 0)) {
      const payload = record.get("payload") || {};
      delete payload.soal_salah;
      delete payload.esai_jawaban;
      record.set("payload", payload);
      app.save(record);
    }
  } catch (e) {}
}, (app) => {});
