/* js/config.js — SEMUA pengaturan yang perlu diganti dosen ada di sini. */
window.CONFIG = {
  // ==== GANTI MANUAL ====
  namaWeb: "CardioVerse",                       // nama web
  logo: "assets/img/logo.svg",                  // logo (SVG/PNG)
  institusi: "[Nama Institusi]",                // nama institusi
  dosen: "[Nama Dosen Pengampu]",               // nama dosen
  tautanBacaan: {                               // tautan bacaan (kosongkan bila tidak ada)
    // "Guyton & Hall": "https://...",
  },
  ambangLulus: 0.7,                             // ambang kelulusan kuis (0–1), default 70%
  timerUjianDetik: 90,                          // timer per soal mode Ujian (detik)
  modelGLB: {                                   // ganti dengan file GLB bila disediakan; kosong = model prosedural
    jantung: "assets/models/jantung.glb"
  },
  disclaimer: "Hanya untuk pembelajaran; bukan pengganti penilaian klinis dan pedoman resmi.",
  kunciStorage: "cardioverse_progres",
  versi: "1.0.1"
};
