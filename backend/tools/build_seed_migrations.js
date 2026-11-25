/**
 * tools/build_seed_migrations.js
 *
 * Reads cardioverse/data/*.js via a Node vm sandbox, extracts window.DATA_* arrays,
 * and emits idempotent PocketBase JS migration files under backend/migrate/ with the
 * seed payload inlined (the PB goja runtime cannot require("fs")).
 *
 * Idempotency strategy: PocketBase's filter parser does not resolve custom field names
 * inside migrations, so this generator NEVER filters by custom fields. Instead it loads
 * all records of a collection with an empty filter and builds a key->record map in JS.
 *
 * Run: node tools/build_seed_migrations.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "cardioverse", "data");
const OUT_DIR = path.join(__dirname, "seed");
const MIG_DIR = path.join(ROOT, "backend", "migrate");

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(MIG_DIR, { recursive: true });

// ---------- Load data ----------
const ctx = { window: {} };
vm.createContext(ctx);
for (const name of ["pertemuan", "soal", "kasus", "marker", "glosarium"]) {
  vm.runInContext(fs.readFileSync(path.join(DATA_DIR, name + ".js"), "utf8"), ctx, { filename: name + ".js" });
}
const W = ctx.window;
const L = W.DATA_LAMPIRAN;

const counts = {
  pertemuan: W.DATA_PERTEMUAN.length,
  soal: W.DATA_SOAL.length,
  kasus: W.DATA_KASUS.length,
  marker: W.DATA_MARKER.length,
  glosarium: L.glosarium.length,
  rumus: L.rumus.length,
  normal: L.normal.length,
  pustaka: L.pustaka.length,
};

const jsonLiteral = (v) => JSON.stringify(v, null, 2);

// ---------- Migration 1: collections ----------
function migCollections() {
  return `// 1700000010_collections.js
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
      { name: "file_glb", type: "file", maxSelect: 1, maxSize: 52428800,
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
  for (const name of ["progres", "pustaka", "normal", "rumus", "glosarium", "marker", "kasus", "soal", "pertemuan", "aset_3d"]) {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch (e) {}
  }
});
`;
}

// ---------- Migration 2: seed content ----------
function migSeed() {
  const payload = {
    pertemuan: W.DATA_PERTEMUAN,
    soal: W.DATA_SOAL,
    kasus: W.DATA_KASUS,
    marker: W.DATA_MARKER,
    glosarium: L.glosarium,
    rumus: L.rumus,
    normal: L.normal,
    pustaka: L.pustaka,
  };

  return `// 1700000020_seed_content.js
// Seeds every content collection from cardioverse/data. Idempotent.
// NOTE: custom-field filters are unreliable inside migrations, so we load all
// records with an empty filter and key them in JS.
migrate((app) => {
  const SEED = ${jsonLiteral(payload)};

  const all = (collName) => {
    try { return app.findRecordsByFilter(collName, "", "", 0, 0); } catch (e) { return []; }
  };
  const keyOf = (rec, field) => String(rec.get(field));

  const upsert = (collName, idField, idValue, fieldMap) => {
    const pool = all(collName);
    const existing = pool.find((r) => keyOf(r, idField) === String(idValue));
    if (existing) {
      for (const k of Object.keys(fieldMap)) existing.set(k, fieldMap[k]);
      app.save(existing);
      return;
    }
    const rec = new Record(app.findCollectionByNameOrId(collName));
    rec.set(idField, idValue);
    for (const k of Object.keys(fieldMap)) rec.set(k, fieldMap[k]);
    app.save(rec);
  };

  for (const p of SEED.pertemuan) {
    upsert("pertemuan", "id_lokal", p.id, {
      judul: p.judul || "",
      blok: p.blok || "",
      ringkasan: p.ringkasan || "",
      isi: {
        tujuan: p.tujuan || [],
        konsep_inti: p.konsep_inti || [],
        korelasi_klinis: p.korelasi_klinis || [],
        rangkuman: p.rangkuman || [],
        pertanyaan_penuntun: p.pertanyaan_penuntun || [],
      },
      bacaan: p.bacaan || "",
      label_integrasi: !!p.label_integrasi,
      urutan: p.id || 0,
    });
  }

  for (const s of SEED.soal) {
    upsert("soal", "id_lokal", s.id, {
      pertemuan: s.pertemuan || 0,
      level: s.level || "C2",
      pertanyaan: s.pertanyaan || "",
      opsi: s.opsi || {},
      kunci: s.kunci || "A",
      pembahasan: s.pembahasan || "",
    });
  }

  for (const k of SEED.kasus) {
    upsert("kasus", "id_lokal", k.id, {
      judul: k.judul || "",
      ringkasan: k.ringkasan || "",
      status_validasi: k.status_validasi || "",
      halaman: k.halaman || [],
    });
  }

  for (const m of SEED.marker) {
    upsert("marker", "id_lokal", m.id, {
      nilai_barcode: m.nilai_barcode || 0,
      nama: m.nama || "",
      deskripsi: m.deskripsi || "",
      pertemuan_terkait: m.pertemuan_terkait || [],
      lapisan: m.lapisan || [],
    });
  }

  for (const g of SEED.glosarium) {
    upsert("glosarium", "istilah", g[0], { istilah: g[0], definisi: g[1] || "" });
  }
  for (const r of SEED.rumus) {
    upsert("rumus", "nama", r[0], { nama: r[0], rumus: r[1] || "", keterangan: r[2] || "" });
  }
  for (const n of SEED.normal) {
    upsert("normal", "parameter", n[0], { parameter: n[0], nilai_normal: n[1] || "" });
  }
  for (const c of SEED.pustaka) {
    upsert("pustaka", "kutipan", c, { kutipan: c });
  }
}, (app) => {
  for (const name of ["pertemuan", "soal", "kasus", "marker", "glosarium", "rumus", "normal", "pustaka"]) {
    try { for (const r of app.findRecordsByFilter(name, "", "", 0, 0)) app.delete(r); } catch (e) {}
  }
});
`;
}

// ---------- Migration 3: seed aset_3d + link marker ----------
function migAset3d() {
  const glbRel = "cardioverse/assets/models/jantung.glb";
  return `// 1700000030_seed_aset_3d.js
// Creates the first aset_3d record from cardioverse/assets/models/jantung.glb and
// links it to marker id_lokal = 1. Idempotent: skips when marker 1 is already linked.
migrate((app) => {
  const markers = app.findRecordsByFilter("marker", "", "", 0, 0);
  const target = markers.find((r) => String(r.get("id_lokal")) === "1");
  if (!target) { console.log("seed_aset_3d: marker id_lokal=1 not found, skipping"); return; }
  if (target.get("aset_3d")) { console.log("seed_aset_3d: already linked, skipping"); return; }

  const file = $filesystem.fileFromPath(${JSON.stringify(glbRel)});
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
`;
}

// ---------- Write ----------
const files = {
  "1700000010_collections.js": migCollections(),
  "1700000020_seed_content.js": migSeed(),
  "1700000030_seed_aset_3d.js": migAset3d(),
  "1700000040_remove_esai.js": `// 1700000040_remove_esai.js
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
`,
};
for (const [name, src] of Object.entries(files)) {
  fs.writeFileSync(path.join(MIG_DIR, name), src, "utf8");
  console.log("wrote", "backend/migrate/" + name, (src.length / 1024).toFixed(1) + " KB");
}
fs.writeFileSync(path.join(OUT_DIR, "counts.json"), JSON.stringify(counts, null, 2), "utf8");
console.log("counts:", JSON.stringify(counts));
