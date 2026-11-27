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
const fileUrlCalls = [];
global.PB = {
  fileUrl: (collection, recordId, filename) => {
    fileUrlCalls.push([collection, recordId, filename]);
    return Promise.resolve("blob:img");
  }
};

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
ok(captured.includes('← Kembali'), "label tombol kembali sesuai");
ok(captured.includes('class="quiz-badge"'), "floating badge ilustrasi ada");
ok(captured.includes('Ilustrasi Soal #01'), "badge memuat nomor soal");
ok(captured.includes('class="quiz-img-stage"'), "panggung gambar ada");
ok(captured.includes('src="assets/img/Sick.jpg"'), "gambar soal dirender (fallback sementara)");
ok(captured.includes('class="quiz-caption"'), "caption gambar ada");

// — toolbar atas + stepper (layout referensi) —
ok(captured.includes('class="quiz-topbar"'), "toolbar atas ada");
ok(captured.includes('class="quiz-mode-pill"'), "pill judul kuis di toolbar ada");
ok(captured.includes('id="endQuiz"'), "tombol Akhiri ada");
ok(captured.includes('class="quiz-stepper"'), "stepper nomor soal ada");
ok(captured.includes('class="quiz-count"'), "teks jumlah pertanyaan ada");
ok(captured.includes('Pertanyaan 1 dari 1'), "jumlah pertanyaan sesuai");
ok((captured.match(/class="quiz-step[ "]/g) || []).length === 1, "stepper memuat 1 soal");
ok(captured.includes('class="quiz-step now"'), "stepper menandai soal aktif");

// — panel kanan: pill tipe + instruksi + opsi + navigasi kapsul —
ok(captured.includes('class="quiz-eyebrow"'), "pill tipe soal ada");
ok(captured.includes('Pilihan Ganda'), "pill tipe memuat jenis soal");
ok(captured.includes('class="quiz-instruction"'), "instruksi pengerjaan ada");
ok(captured.includes('Pertemuan 1 · Pengantar Sistem Kardiovaskular'), "subjudul topik dirender");
ok(captured.includes('class="quiz-options"'), "wadah opsi ada");
ok((captured.match(/class="quiz-opt"/g) || []).length === 5, "lima opsi jawaban");
ok(captured.includes('class="quiz-opt-key"'), "key opsi hadir");
ok(captured.includes('class="quiz-btn-ghost"'), "tombol Sebelumnya (kapsul ghost) ada");
ok(captured.includes('Sebelumnya'), "label tombol Sebelumnya");
ok(captured.includes('class="quiz-btn-primary"'), "tombol utama ada");
// hanya 1 soal → isLast=true → tombol jadi "Selesai Kuis ✓" (bukan "Selanjutnya →")
ok(captured.includes('Selesai Kuis'), "label tombol utama sesuai posisi terakhir");

// — gambar dari database: _recordId/_fileName harus ikut normalizeSoal —
global.DATA_SOAL = [Object.assign({}, global.DATA_SOAL[0], {
  gambar: "foto.png", _recordId: "rec1", _fileName: "foto.png"
})];
captured = "";
handler(fakeApp, ["p", "1"]);
ok(captured.includes('id="quizDbImg"'), "gambar DB memakai slot quizDbImg");
ok(!captured.includes('src="assets/img/Sick.jpg"'), "gambar DB tidak memakai fallback");
ok(fileUrlCalls.some((c) => c[0] === "soal" && c[1] === "rec1" && c[2] === "foto.png"),
   "PB.fileUrl dipanggil dengan record & file gambar");

// — mahasiswa: tidak ada kebocoran kunci/pembahasan saat mengerjakan —
for (const leak of ['is-correct', 'is-wrong', 'Kunci:', 'pembahasan soal 1', 'Jawaban terkunci']) {
  ok(!captured.includes(leak), `soal mahasiswa tidak membocorkan: ${leak}`);
}
ok(captured.includes("quiz-hint"), "hint netral tentang mengganti pilihan ada");
ok(!/data-opt="[A-E]" disabled/.test(captured), "opsi mahasiswa tetap aktif (tidak disabled)");

// — tidak boleh ada elemen usang —
for (const legacy of ['class="bar lg mt-3"', 'Soal 1 dari 1', 'class="btn btn-lg justify-start"', 'quiz-imgpanel',
                      'class="quiz-progress"', 'class="quiz-dot"', 'class="quiz-head-bar"', 'class="quiz-title-bar"']) {
  ok(!captured.includes(legacy), `tidak ada sisa: ${legacy}`);
}

// — dosen: picker & pratinjau read-only —
global.Auth = { currentUser: () => ({ role: "dosen" }) };
captured = "";
handler(fakeApp, []);
ok(captured.includes("Mode Dosen · Pratinjau"), "picker dosen menandai mode pratinjau");
ok(captured.includes("skor tidak disimpan"), "picker dosen menjelaskan skor tidak disimpan");
ok(!captured.includes('id="mixStart"'), "picker dosen tanpa kontrol kuis campuran");
ok(!captured.includes("Terbaik"), "picker dosen tanpa badge skor pribadi");

captured = "";
handler(fakeApp, ["p", "1"]);
ok(captured.includes("Mode Dosen · Pratinjau"), "pill soal menandai pratinjau dosen");
ok(!captured.includes('id="timerBadge"'), "pratinjau dosen tanpa timer");
ok(!captured.includes('id="endQuiz"'), "pratinjau dosen tanpa tombol Akhiri");
ok(captured.includes('class="quiz-opt is-correct"'), "opsi benar ditandai di pratinjau");
ok(captured.includes(" disabled"), "opsi pratinjau non-interaktif");
ok(captured.includes("Kunci:"), "pratinjau menampilkan kunci");
ok(captured.includes("pembahasan soal 1"), "pratinjau menampilkan pembahasan");
ok(captured.includes("Selesai Preview"), "tombol akhir pratinjau sesuai");
ok(!captured.includes("Selesai Kuis"), "pratinjau tidak memakai alur selesai kuis");

if (fail === 0) console.log("\nSEMUA LULUS — layout kuis split-screen sesuai referensi.");
else { console.error(`\n${fail} KONTRAK GAGAL.`); process.exit(1); }
