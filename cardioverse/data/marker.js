/* data/marker.js — 1 marker barcode 2D Hamming63 (ID 1) untuk asset jantung.glb.
   nilai_barcode = decimal barcodeValue AR.js (3x3_HAMMING63). */
window.DATA_MARKER = [
  {
    id: 1,
    nilai_barcode: 1,
    nama: "Jantung dan Katup",
    pertemuan_terkait: [2],
    model: "jantung",
    deskripsi: "Jantung empat ruang dengan katup atrioventrikular dan semilunar. Struktur berdenyut mengikuti irama jantung.",
    lapisan: [
      { kunci: "ruang", nama: "Empat ruang", on: true },
      { kunci: "katup", nama: "Katup", on: true },
      { kunci: "pembuluh", nama: "Pembuluh besar", on: false }
    ]
  }
];