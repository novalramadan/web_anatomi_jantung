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
global.document = { getElementById: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, set className(v) {}, set innerHTML(v) {}, appendChild() {}, addEventListener() {}, focus() {}, remove() {} }), body: { appendChild() {} }, addEventListener() {}, removeEventListener() {} };
global.location = { hash: "" };

global.App = {
  escapeHtml: (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  byId: (list, id) => list.find(x => x.id === id) || null,
  toast: () => {},
  pct: (a, b) => (b ? Math.round((a / b) * 100) : 0),
  _handlers: {},
  add: (name, fn) => { global.App._handlers[name] = fn; }
};

require(path.join(root, "js", "materi.js"));

const handler = global.App._handlers.materi;
if (typeof handler !== "function") throw new Error("handler 'materi' tidak terdaftar");
let captured = "";
const fakeApp = { set innerHTML(v) { captured = v; }, get innerHTML() { return captured; } };
// ---- render katalog (#/materi) dan pelajaran per langkah (#/materi/1/N) ----
handler(fakeApp, []);
const catalog = captured;
handler(fakeApp, ["1", "0"]);
const lesson0 = captured;
handler(fakeApp, ["1", "1"]);
const lesson1 = captured;
handler(fakeApp, ["1", "4"]);
const lessonLast = captured;
handler(fakeApp, ["1", "2"]);
const lesson2 = captured;
handler(fakeApp, ["1", "3"]);
const lesson3 = captured;
captured = [lesson0, lesson1, lesson2, lesson3, lessonLast, catalog].join("\n");

const must = [
  // katalog kursus
  'class="cs-banner"', 'Fisiologi Jantung', 'class="cs-course"', 'href="#/materi/1"', 'href="#/materi/2"',
  'id="materiSearch"', 'id="openAppendix"', 'data-search="',
  // pemutar pelajaran: layout 2 kolom, sidebar, artikel
  'lg:grid-cols-[260px_minmax(0,1fr)]', '<aside class="toc', '<article',
  'Jantung Sebagai Pompa</h1>', '<span class="badge">Fondasi</span>',
  // stepper + langkah
  'aria-label="Langkah pelajaran"', 'aria-current="step"',
  'id="tujuan"', 'data-obj="0"', 'ringkasan 1', 't1', 't2',
  'id="konsep"', 'isi a',
  'id="klinis"', 'Korelasi Klinis</h2>', 'class="callout c-red"', 'k1',
  'id="rangkuman"', 'class="callout c-teal"', 'r1',
  'id="pertanyaan"', 'data-note="0"', 'q1', '<details class="acc',
  'id="bacaan"', 'bacaan 1',
  // footer pelajaran
  'id="markDone"', 'Materi Selesai', '<a class="btn" href="#/kuis/1">Mulai Kuis Pertemuan Ini</a>', 'Lulus 80%',
  'aria-label="Navigasi materi"', 'Siklus Jantung',
  'class="cs-lessonnav"',
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
