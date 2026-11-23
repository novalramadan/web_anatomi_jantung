// tools/compare_seed.js — compare backend seeded records against cardioverse/data/*.js.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const B = process.argv[2] || "http://127.0.0.1:8090";

async function api(url, token, options = {}) {
  const r = await fetch(B + url, {
    method: options.method || "GET",
    headers: { ...(token ? { Authorization: token } : {}), ...(options.body ? { "Content-Type": "application/json" } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const t = await r.text();
  let d; try { d = JSON.parse(t); } catch (e) { d = t; }
  return { status: r.status, data: d };
}

(async () => {
  // ---- load source data via Node vm (same extraction as build script) ----
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const name of ["pertemuan", "soal", "esai", "kasus", "marker", "glosarium"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, "cardioverse", "data", name + ".js"), "utf8"), ctx);
  }
  const W = ctx.window;

  // ---- login superuser ----
  const su = (await api("/api/collections/_superusers/auth-with-password", null, {
    method: "POST",
    body: { identity: "admin@medicalu.local", password: "Admin123456!" },
  })).data;
  if (!su.token) { console.log("LOGIN FAILED:", JSON.stringify(su).slice(0, 200)); process.exit(2); }
  const T = su.token;

  // deep-equal that ignores JSON key order (PocketBase/Go map serialization reorders keys)
  const deepEq = (a, b) => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => deepEq(v, b[i]));
    }
    if (a && b && typeof a === "object" && typeof b === "object") {
      const ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      return ka.every((k) => deepEq(a[k], b[k]));
    }
    return false;
  };

  const summary = [];
  const allItems = async (col) => {
    const first = await api(`/api/collections/${col}/records?perPage=500`, T);
    return first.data.items || [];
  };

  const cmp = (label, ok, detail) => { summary.push({ label, ok, detail }); };

  // ---------- pertemuan ----------
  {
    const src = W.DATA_PERTEMUAN;
    const db = await allItems("pertemuan");
    cmp("pertemuan count", db.length === src.length, `db=${db.length} src=${src.length}`);
    const byId = Object.fromEntries(db.map((r) => [String(r.id_lokal), r]));
    let bad = [];
    for (const p of src) {
      const r = byId[String(p.id)];
      if (!r) { bad.push(`missing id ${p.id}`); continue; }
      if (r.judul !== (p.judul || "")) bad.push(`id ${p.id} judul`);
      if (r.blok !== (p.blok || "")) bad.push(`id ${p.id} blok`);
      if (r.ringkasan !== (p.ringkasan || "")) bad.push(`id ${p.id} ringkasan`);
      if ((r.bacaan || "") !== (p.bacaan || "")) bad.push(`id ${p.id} bacaan`);
      if (Boolean(r.label_integrasi) !== Boolean(p.label_integrasi)) bad.push(`id ${p.id} label_integrasi`);
      const isi = r.isi || {};
      const srcIsi = {
        tujuan: p.tujuan || [], konsep_inti: p.konsep_inti || [],
        korelasi_klinis: p.korelasi_klinis || [], rangkuman: p.rangkuman || [],
        pertanyaan_penuntun: p.pertanyaan_penuntun || [],
      };
      for (const k of Object.keys(srcIsi)) {
        if (!deepEq(isi[k], srcIsi[k])) bad.push(`id ${p.id} isi.${k}`);
      }
    }
    cmp("pertemuan content parity", bad.length === 0, bad.slice(0, 6).join("; ") || "all fields match");
  }

  // ---------- soal ----------
  {
    const src = W.DATA_SOAL;
    const db = await allItems("soal");
    cmp("soal count", db.length === src.length, `db=${db.length} src=${src.length}`);
    const byId = Object.fromEntries(db.map((r) => [String(r.id_lokal), r]));
    let bad = [];
    for (const s of src) {
      const r = byId[String(s.id)];
      if (!r) { bad.push(`missing id ${s.id}`); continue; }
      if (Number(r.pertemuan) !== Number(s.pertemuan)) bad.push(`id ${s.id} pertemuan`);
      if (r.level !== s.level) bad.push(`id ${s.id} level`);
      if (r.pertanyaan !== s.pertanyaan) bad.push(`id ${s.id} pertanyaan`);
      if (!deepEq(r.opsi, s.opsi)) bad.push(`id ${s.id} opsi`);
      if (r.kunci !== s.kunci) bad.push(`id ${s.id} kunci`);
      if ((r.pembahasan || "") !== (s.pembahasan || "")) bad.push(`id ${s.id} pembahasan`);
    }
    cmp("soal content parity", bad.length === 0, bad.slice(0, 6).join("; ") || "all fields match");
  }

  // ---------- esai ----------
  {
    const src = W.DATA_ESAI;
    const db = await allItems("esai");
    cmp("esai count", db.length === src.length, `db=${db.length} src=${src.length}`);
    const byId = Object.fromEntries(db.map((r) => [String(r.id_lokal), r]));
    let bad = [];
    for (const e of src) {
      const r = byId[String(e.id)];
      if (!r) { bad.push(`missing id ${e.id}`); continue; }
      if (!deepEq(r.pertemuan_terkait, e.pertemuan || [])) bad.push(`id ${e.id} pertemuan_terkait`);
      if (r.pertanyaan !== e.pertanyaan) bad.push(`id ${e.id} pertanyaan`);
      if ((r.jawaban_model || "") !== (e.jawaban_model || "")) bad.push(`id ${e.id} jawaban_model`);
      if (!deepEq(r.checklist, e.checklist || [])) bad.push(`id ${e.id} checklist`);
    }
    cmp("esai content parity", bad.length === 0, bad.slice(0, 6).join("; ") || "all fields match");
  }

  // ---------- kasus ----------
  {
    const src = W.DATA_KASUS;
    const db = await allItems("kasus");
    cmp("kasus count", db.length === src.length, `db=${db.length} src=${src.length}`);
    const byId = Object.fromEntries(db.map((r) => [String(r.id_lokal), r]));
    let bad = [];
    for (const k of src) {
      const r = byId[String(k.id)];
      if (!r) { bad.push(`missing id ${k.id}`); continue; }
      if (r.judul !== k.judul) bad.push(`id ${k.id} judul`);
      if ((r.ringkasan || "") !== (k.ringkasan || "")) bad.push(`id ${k.id} ringkasan`);
      if ((r.status_validasi || "") !== (k.status_validasi || "")) bad.push(`id ${k.id} status_validasi`);
      if (!deepEq(r.halaman, k.halaman || [])) bad.push(`id ${k.id} halaman`);
    }
    cmp("kasus content parity", bad.length === 0, bad.slice(0, 6).join("; ") || "all fields match");
  }

  // ---------- marker ----------
  {
    const src = W.DATA_MARKER;
    const db = await allItems("marker");
    cmp("marker count", db.length === src.length, `db=${db.length} src=${src.length}`);
    const byId = Object.fromEntries(db.map((r) => [String(r.id_lokal), r]));
    let bad = [];
    for (const m of src) {
      const r = byId[String(m.id)];
      if (!r) { bad.push(`missing id ${m.id}`); continue; }
      if (Number(r.nilai_barcode) !== Number(m.nilai_barcode)) bad.push(`id ${m.id} nilai_barcode`);
      if (r.nama !== m.nama) bad.push(`id ${m.id} nama`);
      if ((r.deskripsi || "") !== (m.deskripsi || "")) bad.push(`id ${m.id} deskripsi`);
      if (!deepEq(r.pertemuan_terkait, m.pertemuan_terkait || [])) bad.push(`id ${m.id} pertemuan_terkait`);
      if (!deepEq(r.lapisan, m.lapisan || [])) bad.push(`id ${m.id} lapisan`);
      if (!r.aset_3d) bad.push(`id ${m.id} aset_3d not linked`);
    }
    cmp("marker content parity", bad.length === 0, bad.slice(0, 6).join("; ") || "all fields match");
  }

  // ---------- glosarium / rumus / normal / pustaka ----------
  {
    const L = W.DATA_LAMPIRAN;
    const g = await allItems("glosarium");
    cmp("glosarium count", g.length === L.glosarium.length, `db=${g.length} src=${L.glosarium.length}`);
    const map = new Map(g.map((r) => [r.istilah, r.definisi]));
    let bad = [];
    for (const [istilah, definisi] of L.glosarium) {
      if (map.get(istilah) !== definisi) bad.push(`glosarium "${istilah}"`);
    }
    cmp("glosarium content parity", bad.length === 0, bad.slice(0, 4).join("; ") || "match");

    const rset = new Set((await allItems("rumus")).map((r) => r.nama));
    bad = L.rumus.filter(([nama]) => !rset.has(nama)).map(([n]) => n);
    cmp("rumus count+names", bad.length === 0, `missing: ${bad.slice(0, 4).join(", ")}`);

    const nset = new Set((await allItems("normal")).map((r) => r.parameter));
    bad = L.normal.filter(([p]) => !nset.has(p)).map(([p]) => p);
    cmp("normal count+names", bad.length === 0, `missing: ${bad.slice(0, 4).join(", ")}`);

    const pset = new Set((await allItems("pustaka")).map((r) => r.kutipan));
    bad = L.pustaka.filter((c) => !pset.has(c));
    cmp("pustaka count+quotes", bad.length === 0, `missing: ${bad.length} quotes`);
  }

  // ---------- print ----------
  console.log("");
  let fails = 0;
  for (const s of summary) {
    const tag = s.ok ? "PASS" : "FAIL";
    if (!s.ok) fails++;
    console.log(`${tag} ${s.label}${s.ok ? "" : " — " + s.detail}`);
  }
  console.log(`\nRESULT: ${summary.length - fails}/${summary.length} parity checks passed`);
  process.exit(fails > 0 ? 1 : 0);
})().catch((e) => { console.error("COMPARE ERROR:", e.message); process.exit(2); });
