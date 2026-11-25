// tests/kuis.smoke.js — verifikasi layout kuis Modern Healthcare (sage/cream split-screen)
// tanpa menjalankan timer/state penuh.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

global.window = global;
global.CONFIG = { ambangLulus: 0.7, timerUjianDetik: 90 };
global.DATA_PERTEMUAN = [
  { id: 1, judul: "Pengantar Sistem Kardiovaskular", blok: "Fondasi" },
  { id: 2, judul: "Siklus Jantung", blok: "Fondasi" }
];
global.DATA_SOAL = [
  { id: 1, pertemuan: 1, level: "C2", pertanyaan: "Dalam jangka panjang, curah ventrikel …",
    opsi: { A: "Paralel", B: "Seri", C: "Campuran", D: "Resistensi sama", E: "Tekanan sama" },
    kunci: "B", pembahasan: "pembahasan soal 1", gambar: "assets/img/Sick.jpg", keterangan_gambar: "Ilustrasi pasien" }
];
const storageState = { materi_selesai: [], skor_kuis: {}, kasus_selesai: {}, marker_dipindai: [], refleksi: {}, pengaturan: { mode: "terang" } };
global.Storage = { load: () => JSON.parse(JSON.stringify(storageState)), update: (fn) => fn(storageState) };
global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, set className(v) {}, set innerHTML(v) {}, appendChild() {}, addEventListener() {}, focus() {}, remove() {} }),
  body: { appendChild() {} }, addEventListener() {}
};
global.location = { hash: "" };
global.confirm = () => true;

global.App = {
  escapeHtml: (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  byId: (list, id) => list.find(x => x.id === id) || null,
  shuffle: (a) => a.slice(),
  pct: (a, b) => b ? Math.round((a / b) * 100) : 0,
  navigate: () => {},
  toast: () => {},
  _handlers: {},
  add: (name, fn) => { global.App._handlers[name] = fn; }
};

require(path.join(root, "js", "kuis.js"));

let fail = 0;
function ok(cond, msg, det) {
  if (!cond) { fail++; console.error("FAIL:", msg, det ? "— " + det : ""); }
  else console.log("ok  :", msg);
}

// render soal pertama (mode latihan)
const handler = global.App._handlers.kuis;
let captured = "";
const fakeApp = {
  set innerHTML(v) { captured = v; },
  get innerHTML() { return captured; },
  querySelectorAll: () => []
};
handler(fakeApp, ["p", "1"]);

// — struktur split-screen — 
ok(captured.includes('class="quiz-wrap"'), "container quiz-wrap ada");
ok(captured.includes('class="quiz-split"'), "container quiz-split ada");
ok(captured.includes('class="quiz-media"'), "panel media kiri ada");
ok(captured.includes('class="quiz-content"'), "panel konten kanan ada");

// — panel kiri: sage + floating badge + gambar + caption —
ok(captured.includes('id="quitQuiz"'), "tombol kembali (quitQuiz) ada");
ok(captured.includes('← Kembali ke Modul'), "label tombol kembali sesuai");
ok(captured.includes('class="quiz-badge"'), "floating badge ilustrasi ada");
ok(captured.includes('Ilustrasi Soal #01'), "badge memuat nomor soal");
ok(captured.includes('class="quiz-img-stage"'), "panggung gambar ada");
ok(captured.includes('src="assets/img/Sick.jpg"'), "gambar soal dirender (fallback sementara)");
ok(captured.includes('class="quiz-caption"'), "caption gambar ada");

// — header atas + progress bar —
ok(captured.includes('class="quiz-head-bar"'), "header atas ada");
ok(captured.includes('class="quiz-title-bar"'), "judul kuis di header ada");
ok(captured.includes('class="quiz-progress"'), "progress bar ada");

// — panel kanan: pill eyebrow + opsi vertikal + navigasi kapsul —
ok(captured.includes('class="quiz-eyebrow"'), "pill eyebrow ada");
ok(captured.includes('Pertanyaan 1 dari 1'), "pill eyebrow memuat nomor pertanyaan");
ok((captured.match(/class="quiz-dot[ "]/g) || []).length === 1, "bulatan navigasi memuat 1 soal");
ok(captured.includes('Pertemuan 1 · Pengantar Sistem Kardiovaskular'), "subjudul topik dirender");
ok(captured.includes('class="quiz-options"'), "wadah opsi ada");
ok((captured.match(/class="quiz-opt"/g) || []).length === 5, "lima opsi jawaban");
ok(captured.includes('class="quiz-opt-key"'), "key opsi hadir");
ok(captured.includes('class="quiz-btn-ghost"'), "tombol Sebelumnya (kapsul ghost) ada");
ok(captured.includes('Sebelumnya'), "label tombol Sebelumnya");
ok(captured.includes('class="quiz-btn-primary"'), "tombol utama ada");
// hanya 1 soal → isLast=true → tombol jadi "Selesai Kuis ✓" (bukan "Selanjutnya →")
ok(captured.includes('Selesai Kuis'), "label tombol utama sesuai posisi terakhir");

// — tidak boleh ada elemen usang —
for (const legacy of ['class="bar lg mt-3"', 'Soal 1 dari 1', 'class="btn btn-lg justify-start"', 'quiz-imgpanel']) {
  ok(!captured.includes(legacy), `tidak ada sisa: ${legacy}`);
}

if (fail === 0) console.log("\nSEMUA LULUS — layout kuis split-screen sesuai referensi.");
else { console.error(`\n${fail} KONTRAK GAGAL.`); process.exit(1); }
