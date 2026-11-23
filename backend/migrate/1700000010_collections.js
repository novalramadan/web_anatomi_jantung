// 1700000010_collections.js
// Creates content + aset_3d + progres collections. Idempotent per collection name.
// API rules:
//   content + aset_3d : list/view -> any logged-in user; create/update/delete -> role == "dosen"
//   progres           : all ops -> own record only
migrate((app) => {
  const exists = (name) => {
    try { app.findCollectionByNameOrId(name); return true; } catch (e) { return false; }
  };

  const CONTENT_RULES = {
    listRule:   "@request.auth.id != ''",
    viewRule:   "@request.auth.id != ''",
    createRule: "@request.auth.role = 'dosen'",
    updateRule: "@request.auth.role = 'dosen'",
    deleteRule: "@request.auth.role = 'dosen'",
  };
  const base = (name, fields, indexes) => Object.assign({
    type: "base", name, fields, indexes: indexes || [],
  }, CONTENT_RULES);

  // aset_3d first: marker.aset_3d references it.
  if (!exists("aset_3d")) {
    app.save(new Collection(base("aset_3d", [
      { name: "nama", type: "text", required: true, max: 200 },
      { name: "file_glb", type: "file", maxSelect: 1, maxSize: 52428800, protected: true,
        mimeTypes: [".glb", "model/gltf-binary", "application/octet-stream"] },
      { name: "keterangan", type: "text", max: 2000 },
    ])));
  }
  const asetId = app.findCollectionByNameOrId("aset_3d").id;

  const defs = [
    base("pertemuan", [
      { name: "id_lokal", type: "number", required: true },
      { name: "judul", type: "text", required: true, max: 400 },
      { name: "blok", type: "text", max: 100 },
      { name: "ringkasan", type: "text", max: 3000 },
      { name: "isi", type: "json", maxSize: 2000000 },
      { name: "bacaan", type: "text", max: 2000 },
      { name: "label_integrasi", type: "bool" },
      { name: "urutan", type: "number" },
    ], ["CREATE UNIQUE INDEX idx_pertemuan_id_lokal ON pertemuan (id_lokal)"]),

    base("soal", [
      { name: "id_lokal", type: "number", required: true },
      { name: "pertemuan", type: "number" },
      { name: "level", type: "select", values: ["C2", "C3", "C4"], maxSelect: 1 },
      { name: "pertanyaan", type: "text", required: true, max: 4000 },
      { name: "opsi", type: "json", maxSize: 20000 },
      { name: "kunci", type: "select", values: ["A", "B", "C", "D", "E"], maxSelect: 1 },
      { name: "pembahasan", type: "text", max: 4000 },
      { name: "gambar", type: "file", maxSelect: 1, maxSize: 52428800, protected: true,
        mimeTypes: [".jpg", ".jpeg", ".png", ".webp", ".gif", "image/jpeg", "image/png", "image/webp", "image/gif"] },
    ], ["CREATE UNIQUE INDEX idx_soal_id_lokal ON soal (id_lokal)"]),

    base("esai", [
      { name: "id_lokal", type: "number", required: true },
      { name: "pertemuan_terkait", type: "json", maxSize: 10000 },
      { name: "pertanyaan", type: "text", required: true, max: 4000 },
      { name: "jawaban_model", type: "text", max: 8000 },
      { name: "checklist", type: "json", maxSize: 40000 },
    ], ["CREATE UNIQUE INDEX idx_esai_id_lokal ON esai (id_lokal)"]),

    base("kasus", [
      { name: "id_lokal", type: "text", required: true, max: 20 },
      { name: "judul", type: "text", required: true, max: 400 },
      { name: "ringkasan", type: "text", max: 3000 },
      { name: "status_validasi", type: "text", max: 200 },
      { name: "halaman", type: "json", maxSize: 4000000 },
    ], ["CREATE UNIQUE INDEX idx_kasus_id_lokal ON kasus (id_lokal)"]),

    base("marker", [
      { name: "id_lokal", type: "number", required: true },
      { name: "nilai_barcode", type: "number" },
      { name: "nama", type: "text", required: true, max: 200 },
      { name: "deskripsi", type: "text", max: 2000 },
      { name: "pertemuan_terkait", type: "json", maxSize: 10000 },
      { name: "lapisan", type: "json", maxSize: 40000 },
      { name: "aset_3d", type: "relation", collectionId: asetId, maxSelect: 1 },
    ], ["CREATE UNIQUE INDEX idx_marker_id_lokal ON marker (id_lokal)"]),

    base("glosarium", [
      { name: "istilah", type: "text", required: true, max: 200 },
      { name: "definisi", type: "text", required: true, max: 3000 },
    ]),

    base("rumus", [
      { name: "nama", type: "text", required: true, max: 200 },
      { name: "rumus", type: "text", max: 500 },
      { name: "keterangan", type: "text", max: 500 },
    ]),

    base("normal", [
      { name: "parameter", type: "text", required: true, max: 200 },
      { name: "nilai_normal", type: "text", max: 500 },
    ]),

    base("pustaka", [
      { name: "kutipan", type: "text", required: true, max: 1000 },
    ]),
  ];

  for (const def of defs) {
    if (exists(def.name)) continue;
    app.save(new Collection(def));
  }

  if (!exists("progres")) {
    app.save(new Collection({
      type: "base",
      name: "progres",
      listRule:   "@request.auth.id = user",
      viewRule:   "@request.auth.id = user",
      createRule: "@request.auth.id = user",
      updateRule: "@request.auth.id = user",
      deleteRule: "@request.auth.id = user",
      fields: [
        { name: "user", type: "relation", collectionId: "_pb_users_auth_",
          required: true, maxSelect: 1, cascadeDelete: true },
        { name: "payload", type: "json", maxSize: 4000000 },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_progres_user ON progres (user)"],
    }));
  }
}, (app) => {
  for (const name of ["progres", "pustaka", "normal", "rumus", "glosarium", "marker", "kasus", "esai", "soal", "pertemuan", "aset_3d"]) {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch (e) {}
  }
});
