// tests/materi.smoke.js — sanity check: refactor Tailwind menghasilkan struktur & kontrak DOM yang benar.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// ---- mock globals yang dipakai materi.js ----
global.window = global;
global.CONFIG = { ambangLulus: 0.7 };
global.DATA_PERTEMUAN = [
  { id: 1, blok: "Fondasi", judul: "Jantung Sebagai Pompa", ringkasan: "ringkasan 1",
    tujuan: ["t1", "t2"], konsep_inti: [{ judul: "Konsep A", isi: "isi a" }],
    korelasi_klinis: ["k1"], rangkuman: ["r1"], pertanyaan_penuntun: ["q1"], bacaan: "bacaan 1" },
  { id: 2, blok: "Fondasi", judul: "Siklus Jantung", ringkasan: "ringkasan 2",
    tujuan: ["t3"], konsep_inti: [{ judul: "Konsep B", isi: "isi b" }],
    korelasi_klinis: ["k2"], rangkuman: ["r2"], pertanyaan_penuntun: ["q2"], bacaan: "bacaan 2" }
];
global.DATA_LAMPIRAN = {
  rumus: [["CO", "= HR x SV", "L/min"]],
  normal: [["HR", "60–100 bpm"]],
  glosarium: [["Kontraksi", "pemendekan otot"]]
};
const storageState = { materi_selesai: [1], skor_kuis: { 1: { persen: 80 } } };
global.Storage = { load: () => JSON.parse(JSON.stringify(storageState)), update: (fn) => fn(storageState) };
global.document = { getElementById: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, set className(v) {}, set innerHTML(v) {}, appendChild() {}, addEventListener() {}, focus() {}, remove() {} }), body: { appendChild() {} }, addEventListener() {} };
global.location = { hash: "" };

global.App = {
  escapeHtml: (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  byId: (list, id) => list.find(x => x.id === id) || null,
  toast: () => {},
  _handlers: {},
  add: (name, fn) => { global.App._handlers[name] = fn; }
};

require(path.join(root, "js", "materi.js"));

const handler = global.App._handlers.materi;
if (typeof handler !== "function") throw new Error("handler 'materi' tidak terdaftar");
let captured = "";
const fakeApp = { set innerHTML(v) { captured = v; }, get innerHTML() { return captured; } };
handler(fakeApp, ["1"]);

// ---- kontrak struktur & konten (markup Tailwind baru) ----
const must = [
  // layout reader (grid 2 kolom: toc + artikel)
  'lg:grid-cols-[260px_minmax(0,1fr)]',
  '<aside class="toc',
  '<article',
  // header
  'Jantung Sebagai Pompa</h1>',
  '<span class="badge">Fondasi</span>',
  '<span class="badge">1 tujuan</span>',
  '<span class="badge">2 tujuan belajar</span>',
  // sections
  'id="tujuan"', 'id="konsep"', 'id="klinis"', 'id="rangkuman"', 'id="pertanyaan"', 'id="bacaan"',
  'Tujuan Pembelajaran</h2>',
  'Konsep Inti</h2>',
  'Korelasi Klinis</h2>',
  'Rangkuman</h2>',
  'Bacaan</h2>',
  // konten
  'ringkasan 1', 't1', 't2', 'isi a', 'k1', 'r1', 'q1', 'bacaan 1',
  // callout
  'class="callout c-red"', 'class="callout c-teal"',
  // accordion
  '<details class="acc',
  'q1</li>',
  // footer
  'id="markDone"',
  'Materi Selesai',
  '<a class="btn" href="#/kuis/1">Mulai Kuis Pertemuan Ini</a>',
  'Lulus 80%',
  // pager
  'aria-label="Navigasi materi"',
  'href="#/materi/2"',
  'Siklus Jantung',
  // toc
  'id="openAppendix"', 'id="materiSearch"',
];

let fail = 0;
for (const token of must) {
  if (!captured.includes(token)) { console.error("MISSING:", token); fail++; }
}

// kontrak fungsional: id yang di-getElementById
for (const id of ["markDone", "openAppendix", "materiSearch"]) {
  if (!captured.includes(`id="${id}"`)) { console.error("MISSING id:", id); fail++; }
}

// sanity: tidak ada kelas lama yang sudah dihapus dari desain
for (const legacy of ['class="reader', 'class="article"', 'class="pager"', 'btn-teal', 'badge-ok', 'badge-amber']) {
  if (captured.includes(legacy)) { console.error("LEGACY PRESENT:", legacy); fail++; }
}

// data pencarian utk filter TOC
if (!captured.includes('data-search="')) { console.error("MISSING: data-search"); fail++; }

if (fail === 0) console.log("OK — " + must.length + " token ditemukan, struktur & kontrak DOM sesuai.");
else { console.error("FAIL — " + fail + " token bermasalah."); process.exit(1); }
