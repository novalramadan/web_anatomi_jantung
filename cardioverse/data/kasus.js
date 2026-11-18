/* data/kasus.js — buku bercabang "Fisiologi Jantung – Kasus Klinis Bercabang".
   Isi kasus A, B, C disalin apa adanya dari "tes buku/data.js".
   Kasus D (draf BHD) ditambahkan sebagai halaman 18-22 dengan pola yang sama. */

var IMG = {
  book: '<svg viewBox="0 0 220 180">' +
    '<path d="M20 45 q45 -15 90 5 v105 q-45 -20 -90 -5 z"/>' +
    '<path d="M200 45 q-45 -15 -90 5 v105 q45 -20 90 -5 z"/>' +
    '<path d="M35 65 q30 -8 60 3 M35 85 q30 -8 60 3 M35 105 q30 -8 60 3"/>' +
    '<path class="blue" d="M155 60 v25 M155 85 l-20 20 M155 85 l20 20"/>' +
    '<circle class="blue" cx="135" cy="112" r="6"/><circle class="blue" cx="175" cy="112" r="6"/>' +
    '<circle class="red" cx="155" cy="55" r="6"/>' +
    '</svg>',

  tree: '<svg viewBox="0 0 220 180">' +
    '<circle class="red" cx="110" cy="150" r="14"/>' +
    '<path class="red" d="M104 147 q6 8 12 0 q-6 -8 -12 0"/>' +
    '<path d="M110 136 V100 M110 100 L45 55 M110 100 V55 M110 100 L175 55"/>' +
    '<circle cx="45" cy="40" r="17"/><circle cx="110" cy="40" r="17"/><circle cx="175" cy="40" r="17"/>' +
    '<text x="40" y="45">A</text><text x="105" y="45">B</text><text x="170" y="45">C</text>' +
    '</svg>',

  crash: '<svg viewBox="0 0 220 180">' +
    '<rect x="125" y="15" width="85" height="62" rx="6"/>' +
    '<text class="red" x="133" y="36">TD 75/45</text>' +
    '<text class="red" x="133" y="53">N 130</text>' +
    '<path class="blue" d="M132 66 h10 l4 -8 l4 12 l4 -4 h10 l4 -8 l4 12 l4 -4 h10"/>' +
    '<path d="M10 118 q40 -12 70 -6 l40 4 q20 2 22 18 q-2 14 -22 14 l-40 -2 q-30 -2 -70 6"/>' +
    '<path class="red" d="M62 112 l6 8 l-6 8 l6 8 l-6 8"/>' +
    '<path class="red fill-red" d="M66 150 q-5 9 0 12 q5 -3 0 -12 M78 152 q-4 7 0 10 q4 -3 0 -10 M54 154 q-4 7 0 10 q4 -3 0 -10"/>' +
    '</svg>',

  tourniquet: '<svg viewBox="0 0 220 180">' +
    '<rect x="140" y="12" width="52" height="68" rx="8"/>' +
    '<path class="fill-red red" d="M142 46 h48 v26 q0 6 -6 6 h-36 q-6 0 -6 -6 z"/>' +
    '<text x="150" y="35">DARAH</text>' +
    '<path d="M166 80 v20 q0 25 -35 32"/>' +
    '<path d="M10 112 h120 q14 0 14 15 q0 15 -14 15 h-120"/>' +
    '<rect class="blue" x="55" y="104" width="16" height="46" rx="3"/>' +
    '<path class="blue" d="M63 104 l14 -22 M70 86 l14 2"/>' +
    '<path class="red" d="M105 120 l8 10"/>' +
    '</svg>',

  mapFormula: '<svg viewBox="0 0 220 180">' +
    '<text x="30" y="40" style="font-size:20px">MAP ≈ CO × SVR</text>' +
    '<text class="red" x="38" y="70" style="font-size:18px">↓↓</text>' +
    '<text class="red" x="98" y="70" style="font-size:18px">↓</text>' +
    '<text class="red" x="160" y="70" style="font-size:18px">↓</text>' +
    '<path d="M20 105 q90 -20 180 0 M20 160 q90 20 180 0"/>' +
    '<path class="blue" d="M40 132 h40 M70 124 l10 8 l-10 8 M120 132 h40 M150 124 l10 8 l-10 8"/>' +
    '<text x="70" y="182" style="font-size:11px">vasodilatasi</text>' +
    '</svg>',

  constrict: '<svg viewBox="0 0 220 180">' +
    '<path d="M15 60 q50 0 70 28 q25 20 50 0 q20 -28 70 -28"/>' +
    '<path d="M15 140 q50 0 70 -28 q25 -20 50 0 q20 28 70 28"/>' +
    '<path class="red" d="M40 100 h18 M48 92 l10 8 l-10 8"/>' +
    '<text class="red" x="70" y="35">SVR ↑</text>' +
    '<text x="62" y="170">volume tetap kurang</text>' +
    '</svg>',

  observe: '<svg viewBox="0 0 220 180">' +
    '<circle cx="50" cy="40" r="13"/>' +
    '<path d="M50 53 v45 h30 v45 M50 70 l25 10 l10 -10"/>' +
    '<rect x="84" y="62" width="10" height="16" rx="2"/>' +
    '<path d="M30 98 h55 M30 98 v50"/>' +
    '<path d="M120 30 v115 h90"/>' +
    '<path class="red" d="M125 45 q25 5 40 30 t40 60"/>' +
    '<text x="128" y="28">MAP</text>' +
    '</svg>',

  clipboard: '<svg viewBox="0 0 220 180">' +
    '<rect x="55" y="20" width="110" height="150" rx="8"/>' +
    '<rect x="85" y="12" width="50" height="18" rx="4"/>' +
    '<path class="blue" d="M70 60 l6 6 l10 -12 M70 95 l6 6 l10 -12 M70 130 l6 6 l10 -12"/>' +
    '<path d="M95 60 h55 M95 95 h55 M95 130 h55"/>' +
    '</svg>',

  stairs: '<svg viewBox="0 0 220 180">' +
    '<path d="M10 165 h40 v-25 h40 v-25 h40 v-25 h40 v-25 h40"/>' +
    '<circle cx="40" cy="125" r="10"/>' +
    '<path d="M50 128 l45 6 M70 131 l-8 18 M95 134 l20 -4 M80 133 l10 16"/>' +
    '<path class="red" d="M30 105 l-6 -8 M40 100 v-10 M50 105 l6 -8"/>' +
    '<path class="blue" d="M170 30 q10 -10 20 0 q-10 15 -20 0" />' +
    '</svg>',

  murmurAS: '<svg viewBox="0 0 220 180">' +
    '<path d="M10 110 h200"/>' +
    '<path d="M40 75 v70 M44 75 v70"/>' +
    '<text x="32" y="65">S1</text>' +
    '<path class="red fill-red" d="M55 110 L105 70 L155 110 L105 150 Z"/>' +
    '<path d="M172 98 v24"/>' +
    '<text x="162" y="90">S2</text>' +
    '<text x="40" y="172" style="font-size:11px">crescendo–decrescendo</text>' +
    '<text x="58" y="30" style="font-size:11px">ICS 2 kanan → leher</text>' +
    '</svg>',

  murmurMR: '<svg viewBox="0 0 220 180">' +
    '<path d="M10 110 h200"/>' +
    '<path d="M40 75 v70 M44 75 v70 M172 75 v70 M176 75 v70"/>' +
    '<text x="32" y="65">S1</text><text x="164" y="65">S2</text>' +
    '<rect class="red fill-red" x="52" y="88" width="112" height="44"/>' +
    '<text x="62" y="165" style="font-size:11px">holosistolik · apeks → aksila</text>' +
    '</svg>',

  ecgAF: '<svg viewBox="0 0 220 180">' +
    '<path d="M5 100 q4 -3 8 0 t8 0 l4 -40 l5 55 l4 -15 q6 -3 10 0 t10 0 l4 -40 l5 55 l4 -15 q4 3 8 0 t8 0 t8 0 t8 0 l4 -40 l5 55 l4 -15 q4 -3 8 0 l4 -40 l5 55 l4 -15 q4 3 8 0 t8 0 t8 0"/>' +
    '<text x="40" y="150" style="font-size:12px">R–R ireguler</text>' +
    '<path class="red" d="M30 30 l15 15 M45 30 l-15 15"/>' +
    '<text class="red" x="55" y="43" style="font-size:11px">tanpa murmur ejeksi</text>' +
    '</svg>',

  stetho: '<svg viewBox="0 0 220 180">' +
    '<path d="M70 20 v40 q0 35 40 35 q40 0 40 -35 v-40"/>' +
    '<path d="M62 20 h16 M142 20 h16"/>' +
    '<path d="M110 95 v30 q0 25 30 25 q25 0 25 -25 v-10"/>' +
    '<circle class="blue" cx="165" cy="105" r="12"/>' +
    '<text x="20" y="160">S2 ↓ (A2 hilang)</text>' +
    '</svg>',

  ecgST: '<svg viewBox="0 0 220 180">' +
    '<path d="M5 100 h20 q5 -10 10 0 h8 l4 8 l6 -55 l6 60 q2 -15 20 -18 q15 -2 22 14 h20 q5 -10 10 0 h8 l4 8 l6 -55 l6 60 q2 -15 20 -18 q15 -2 22 14 h10"/>' +
    '<path class="red" d="M58 92 q14 -8 26 0" stroke-dasharray="3 4"/>' +
    '<text class="red" x="25" y="150">ST ↑ : II, III, aVF, V4R</text>' +
    '<text x="25" y="30">HR 44 · TD 85/55</text>' +
    '</svg>',

  heartRCA: '<svg viewBox="0 0 220 180">' +
    '<path d="M110 165 C45 120 30 70 62 52 C84 40 102 52 110 66 C118 52 136 40 158 52 C190 70 175 120 110 165 Z"/>' +
    '<path d="M95 50 v-30 M125 50 v-25 q0 -10 15 -10"/>' +
    '<path class="red" d="M96 62 q-30 10 -38 40 q-2 25 20 45" style="stroke-width:4"/>' +
    '<text class="red" x="10" y="100">RCA</text>' +
    '<path class="blue" d="M124 62 q8 40 -4 80" style="stroke-width:1.5"/>' +
    '</svg>',

  heartLAD: '<svg viewBox="0 0 220 180">' +
    '<path d="M110 165 C45 120 30 70 62 52 C84 40 102 52 110 66 C118 52 136 40 158 52 C190 70 175 120 110 165 Z"/>' +
    '<path d="M95 50 v-30 M125 50 v-25 q0 -10 15 -10"/>' +
    '<path class="red" d="M120 62 q10 45 -8 95" style="stroke-width:4"/>' +
    '<text class="red" x="140" y="110">LAD</text>' +
    '<path class="blue" d="M96 62 q-30 10 -38 40" style="stroke-width:1.5"/>' +
    '</svg>',

  lungs: '<svg viewBox="0 0 220 180">' +
    '<path d="M100 30 v40 M100 70 q-10 5 -20 15 M100 70 q10 5 20 15"/>' +
    '<path d="M80 60 q-45 0 -50 70 q0 25 25 25 q25 0 30 -25 v-60"/>' +
    '<path d="M120 60 q45 0 50 70 q0 25 -25 25 q-25 0 -30 -25 v-60"/>' +
    '<text class="blue" x="45" y="125">bersih</text>' +
    '<path class="red" d="M190 90 v-60 M182 40 l8 -10 l8 10"/>' +
    '<text class="red" x="170" y="105">JVP</text>' +
    '</svg>',

  aed: '<svg viewBox="0 0 220 180">' +
    '<rect x="25" y="35" width="170" height="120" rx="10"/>' +
    '<path class="red" d="M95 60 h30 l-6 6 h-30 z"/>' +
    '<path class="red" d="M110 70 l-12 24 h9 l-4 20 l14 -26 h-9 z"/>' +
    '<path class="blue" d="M45 130 h50 M45 145 h70"/>' +
    '<text x="130" y="140" style="font-size:13px">AED</text>' +
    '</svg>'
};

var STATUS_LABEL = {
  tepat: "✔ Tepat",
  kurang: "! Kurang tepat",
  "kurang-sesuai": "! Kurang sesuai",
  keliru: "✘ Keliru",
  bahaya: "⚠ Berbahaya",
  evaluasi: "Evaluasi"
};

var BOOK = {
  title: "Fisiologi Jantung – Kasus Klinis Bercabang",
  // metadata per kasus untuk rak sampul
  kasus: [
    {
      id: "A", start: 3,
      judul: "Perdarahan Masif setelah Kecelakaan",
      pertemuan_terkait: [1, 3, 13, 15],
      status_validasi: "sesuai lampiran",
      ringkasan: "Pria 35 tahun, fraktur femur terbuka kanan, perdarahan aktif. Pilih langkah pertama yang fisiologis."
    },
    {
      id: "B", start: 9,
      judul: "Sinkop saat Naik Tangga pada Lansia",
      pertemuan_terkait: [5, 7, 11, 13],
      status_validasi: "sesuai lampiran",
      ringkasan: "Perempuan 72 tahun pingsan saat naik tangga. Murmur sistolik kasar di sela iga 2 kanan."
    },
    {
      id: "C", start: 14,
      judul: "Nyeri Dada dengan Bradikardia dan Hipotensi",
      pertemuan_terkait: [4, 6, 12, 14],
      status_validasi: "sesuai lampiran",
      ringkasan: "Pria 58 tahun, nyeri dada menjalar ke rahang, elevasi ST inferior, bradikardia, hipotensi."
    },
    {
      id: "D", start: 18,
      judul: "Henti Jantung Mendadak di Tempat Umum",
      pertemuan_terkait: [1, 9, 15, 16],
      status_validasi: "draf, perlu divalidasi dosen",
      ringkasan: "Draf latihan bantuan hidup dasar: pria dewasa kolaps di area publik. Tanpa dosis obat."
    }
  ],

  pages: {
    1: {
      tag: "Pendahuluan",
      title: "Cara Membaca Buku Ini",
      story:
        '<p>Buku ini berisi <b>kasus klinis bercabang</b> untuk latihan integrasi fisiologi jantung (cocok untuk Pertemuan 8 dan 16).</p>' +
        '<ol><li>Baca halaman awal kasus.</li><li>Pilih satu opsi jawaban.</li><li>Lanjut ke halaman yang ditunjuk dan bandingkan hasilnya dengan prediksimu.</li></ol>' +
        '<p class="note">Tidak ada dosis obat; fokus pada <b>alasan fisiologis</b> di balik setiap keputusan.</p>',
      image: IMG.book,
      choices: [{ text: "Lihat daftar kasus", goto: 2 }]
    },

    2: {
      tag: "Daftar Kasus",
      title: "Pilih Kasus",
      story: '<p>Setiap kasus dimulai dari satu pasien. Keputusanmu menentukan halaman berikutnya. Pilih kasus yang ingin kamu kerjakan.</p>',
      image: IMG.tree,
      choices: [
        { text: "Kasus A · Perdarahan masif setelah kecelakaan", goto: 3 },
        { text: "Kasus B · Sinkop saat naik tangga pada lansia", goto: 9 },
        { text: "Kasus C · Nyeri dada dengan bradikardia dan hipotensi", goto: 14 },
        { text: "Kasus D · Henti jantung mendadak (draf)", goto: 18 }
      ]
    },

    // ================= KASUS A =================
    3: {
      tag: "Kasus A · Halaman A1",
      title: "Perdarahan Masif",
      vitals: ["TD <b>75/45</b>", "MAP ± <b>55</b>", "Nadi <b>130</b> lemah", "RR 28", "CRT &gt; 4 dtk", "GCS 14"],
      story: '<p>Pria 35 tahun dibawa ke IGD setelah kecelakaan sepeda motor, <b>fraktur femur terbuka kanan</b> dengan perdarahan aktif. Akral dingin dan pucat.</p><p><b>Apa langkah pertamamu?</b></p>',
      image: IMG.crash,
      choices: [
        { text: "Hentikan perdarahan (tekanan langsung/torniket), pasang dua akses IV besar, resusitasi terbatas dengan produk darah, target tekanan permisif", goto: 4 },
        { text: "Beri vasodilator arteri untuk menurunkan SVR karena akral dingin", goto: 5 },
        { text: "Beri vasopresor dosis tinggi segera tanpa volume", goto: 6 },
        { text: "Duduk dan minum, observasi", goto: 7 }
      ]
    },

    4: {
      tag: "Kasus A · Halaman A2",
      status: "tepat",
      title: "Hentikan Perdarahan",
      story:
        '<p>Sumber perdarahan dikendalikan sehingga volume tidak terus hilang. Pemberian darah menggantikan volume dan kapasitas pengangkut O₂ tanpa mengencerkan faktor pembekuan; preload dan CO pulih sehingga simpatis dapat mereda.</p>' +
        '<p>Target tekanan permisif (sistolik ± 80–90 mmHg atau MAP ± 50–65 mmHg, kecuali cedera kepala) menghindari tekanan tinggi yang memecah bekuan sebelum sumber perdarahan tertutup.</p>' +
        '<p><b>Evaluasi:</b> HR turun, CRT membaik, urin &gt; 0,5 mL/kg/jam, laktat turun. Cegah <i>lethal triad</i>: hipotermia, asidosis, koagulopati.</p>' +
        '<p class="note"><b>Mengapa fisiologis:</b> ΔP dikembalikan lewat volume, bukan lewat mengubah resistensi.</p>',
      image: IMG.tourniquet,
      choices: [{ text: "Lanjut ke evaluasi kasus", goto: 8 }]
    },

    5: {
      tag: "Kasus A · Halaman A3",
      status: "keliru",
      title: "Vasodilator",
      story:
        '<p>Vasodilator menurunkan SVR; karena CO sudah turun akibat preload rendah, <b>MAP anjlok</b> (MAP ≈ CO × SVR). Perfusi otak dan koroner turun, pasien kehilangan kesadaran.</p>' +
        '<p class="note">Akral dingin adalah <b>kompensasi</b> (SVR ↑), bukan masalah yang harus dikoreksi.</p>' +
        '<p>Hentikan vasodilator, kendalikan perdarahan dan ganti volume.</p>',
      image: IMG.mapFormula,
      choices: [{ text: "Hentikan vasodilator, kendalikan perdarahan dan ganti volume", goto: 4 }]
    },

    6: {
      tag: "Kasus A · Halaman A4",
      status: "kurang",
      title: "Vasopresor Tanpa Volume",
      story:
        '<p>Vasopresor menaikkan SVR tetapi <b>tidak menambah volume</b>. Pada hipovolemia, vasokonstriksi tambahan memperburuk perfusi jaringan perifer dan ginjal, dan menaikkan tekanan tanpa menghentikan perdarahan.</p>' +
        '<p class="note">Vasopresor bukan lini pertama pada syok hemoragik; digunakan terbatas bila hipotensi mengancam jiwa saat resusitasi volume berlangsung.</p>',
      image: IMG.constrict,
      choices: [{ text: "Kendalikan perdarahan dan ganti volume", goto: 4 }]
    },

    7: {
      tag: "Kasus A · Halaman A5",
      status: "bahaya",
      title: "Hanya Observasi",
      story:
        '<p>Tanpa kontrol perdarahan dan volume, preload turun terus, simpatis maksimal, aliran ke ginjal dan splangnikus menurun (oliguria), asidosis laktat, lalu <b>dekompensasi (syok ireversibel)</b>.</p>' +
        '<p>Minum juga berisiko bila pasien perlu operasi segera.</p>',
      image: IMG.observe,
      choices: [{ text: "Segera kendalikan perdarahan dan ganti volume", goto: 4 }]
    },

    8: {
      tag: "Kasus A · Halaman A6",
      status: "evaluasi",
      title: "Evaluasi Kasus A",
      story:
        '<p>Setelah operasi, pasien stabil. <b>Diskusikan:</b></p>' +
        '<ol><li>Mengapa tekanan nadi menyempit pada awal syok?</li><li>Mengapa hematokrit awal dapat tampak normal?</li><li>Bagaimana kurva venous return bergeser pada perdarahan dan pada pemberian darah?</li><li>Mengapa kristaloid dalam jumlah besar dapat merugikan?</li></ol>',
      image: IMG.clipboard,
      choices: [
        { text: "Lanjut ke Kasus B", goto: 9 },
        { text: "Kembali ke daftar kasus", goto: 2, alt: true }
      ]
    },

    // ================= KASUS B =================
    9: {
      tag: "Kasus B · Halaman B1",
      title: "Pingsan di Tangga",
      vitals: ["TD <b>110/85</b>", "Tekanan nadi sempit", "Nadi 78 lambat, lemah", "S2 tunggal melemah"],
      story:
        '<p>Perempuan 72 tahun pingsan saat naik tangga. Sebelumnya nyeri dada tertekan dan sesak saat aktivitas selama 6 bulan.</p>' +
        '<p>Auskultasi: <b>murmur sistolik crescendo–decrescendo kasar</b> di sela iga 2 kanan menjalar ke leher.</p>' +
        '<p><b>Apa penjelasan fisiologis yang paling mungkin?</b></p>',
      image: IMG.stairs,
      choices: [
        { text: "Stenosis aorta: afterload tinggi tetap, CO tidak dapat naik saat aktivitas", goto: 10 },
        { text: "Regurgitasi mitral: darah kembali ke atrium kiri sepanjang sistol", goto: 11 },
        { text: "Fibrilasi atrium paroksismal dengan respons ventrikel cepat", goto: 12 }
      ]
    },

    10: {
      tag: "Kasus B · Halaman B2",
      status: "tepat",
      title: "Stenosis Aorta",
      story:
        '<p>Gradien tekanan besar melintasi katup, <b>wall stress σ ↑</b> (Laplace) sehingga LV menebal (hipertrofi konsentrik).</p>' +
        '<p><b>Tiga gejala klasik:</b> angina (MVO₂ ↑, perfusi subendokardium ↓), sinkop (saat latihan SVR turun tetapi CO tidak dapat naik melewati katup sempit → MAP ↓ → perfusi otak ↓), dan gagal jantung.</p>' +
        '<p>Tekanan nadi sempit dan nadi <i>parvus et tardus</i> mencerminkan SV yang terbatas. Loop P–V: tekanan sistolik LV sangat tinggi, ESV ↑, SV ↓.</p>' +
        '<p class="note">Hindari vasodilator kuat dan dehidrasi; terapi definitif adalah penggantian katup.</p>',
      image: IMG.murmurAS,
      choices: [{ text: "Pertanyaan: mengapa S2 melemah dan tunggal?", goto: 13 }]
    },

    11: {
      tag: "Kasus B · Halaman B3",
      status: "kurang-sesuai",
      title: "Regurgitasi Mitral?",
      story:
        '<p>Regurgitasi mitral menghasilkan <b>murmur holosistolik di apeks</b> yang menjalar ke aksila.</p>' +
        '<p>Di kasus ini murmur ejeksi di basis menjalar ke karotis dan S2 melemah, sehingga lebih sesuai <b>stenosis aorta</b>.</p>',
      image: IMG.murmurMR,
      choices: [{ text: "Pertimbangkan stenosis aorta", goto: 10 }]
    },

    12: {
      tag: "Kasus B · Halaman B4",
      status: "kurang-sesuai",
      title: "Fibrilasi Atrium?",
      story:
        '<p>Fibrilasi atrium memberi <b>nadi ireguler</b> tanpa murmur ejeksi khas.</p>' +
        '<p>Nadi pasien ini teratur (78/menit), sehingga penjelasan ini kurang sesuai.</p>',
      image: IMG.ecgAF,
      choices: [{ text: "Pertimbangkan stenosis aorta", goto: 10 }]
    },

    13: {
      tag: "Kasus B · Halaman B5",
      status: "evaluasi",
      title: "Evaluasi Kasus B",
      story:
        '<p>S2 melemah karena komponen aorta (A2) hampir tidak terdengar akibat katup kaku/kalsifikasi dan gerak daun katup berkurang.</p>' +
        '<p class="note"><b>Diskusi:</b> bandingkan loop P–V stenosis aorta dengan regurgitasi aorta (preload dan afterload).</p>',
      image: IMG.stetho,
      choices: [
        { text: "Lanjut ke Kasus C", goto: 14 },
        { text: "Kembali ke daftar kasus", goto: 2, alt: true }
      ]
    },

    // ================= KASUS C =================
    14: {
      tag: "Kasus C · Halaman C1",
      title: "Nyeri Dada & Bradikardia",
      vitals: ["TD <b>85/55</b>", "HR <b>44</b>", "JVP ↑", "Paru bersih"],
      story:
        '<p>Pria 58 tahun dengan nyeri dada menjalar ke rahang selama 40 menit, mual, keringat dingin.</p>' +
        '<p>EKG: <b>elevasi ST di II, III, aVF</b>; sadapan kanan V4R juga menunjukkan elevasi ST.</p>' +
        '<p><b>Apa penjelasan fisiologisnya?</b></p>',
      image: IMG.ecgST,
      choices: [
        { text: "Infark inferior (RCA) dengan infark ventrikel kanan dan refleks Bezold–Jarisch", goto: 15 },
        { text: "Infark anterior luas (LAD) dengan syok kardiogenik", goto: 16 }
      ]
    },

    15: {
      tag: "Kasus C · Halaman C2",
      status: "tepat",
      title: "Infark Inferior + RV",
      story:
        '<p>RCA memperdarahi dinding inferior, ventrikel kanan, nodus SA, dan nodus AV. <b>Bradikardia</b> timbul oleh iskemia nodus dan refleks Bezold–Jarisch (rangsangan vagal).</p>' +
        '<p>Infark RV menurunkan pengisian ventrikel kiri sehingga CO ↓ dan hipotensi, dengan paru bersih dan JVP ↑.</p>' +
        '<p class="note">RV sangat bergantung pada preload: hindari nitrat dan diuretik; cairan hati-hati bila pengisian LV kurang, dan reperfusi segera.</p>',
      image: IMG.heartRCA,
      choices: [{ text: "Pertanyaan: mengapa paru bersih meski CO turun?", goto: 17 }]
    },

    16: {
      tag: "Kasus C · Halaman C3",
      status: "kurang-sesuai",
      title: "Infark Anterior?",
      story:
        '<p>Infark LAD memberi <b>elevasi ST di V1–V4</b> dan biasanya kongesti paru (ronki) karena LV gagal.</p>' +
        '<p>Di sini paru bersih, JVP tinggi, dan lokasi inferior, sehingga lebih sesuai <b>infark RCA</b>.</p>',
      image: IMG.heartLAD,
      choices: [{ text: "Pertimbangkan infark inferior (RCA)", goto: 15 }]
    },

    17: {
      tag: "Kasus C · Halaman C4",
      status: "evaluasi",
      title: "Evaluasi Kasus C",
      story:
        '<p>Paru bersih karena kegagalan ventrikel kanan membatasi aliran ke paru, sehingga tekanan kapiler paru tidak naik; kongesti terjadi di sisi <b>vena sistemik</b> (JVP ↑).</p>' +
        '<p class="note"><b>Diskusi:</b> kurva Frank–Starling ventrikel kanan dan interdependensi ventrikel.</p>',
      image: IMG.lungs,
      choices: [
        { text: "Kembali ke daftar kasus", goto: 2, alt: true },
        { text: "Tutup buku (kembali ke sampul)", goto: 0, alt: true }
      ]
    },

    // ================= KASUS D (draf) =================
    18: {
      tag: "Kasus D · Halaman D1",
      title: "Kolaps di Area Publik",
      vitals: ["Tidak sadar", "Napas tidak normal", "Nadi karotis tidak teraba"],
      story: '<p>Seorang pria dewasa tiba-tiba terjatuh di area publik. Tidak ada respons saat dipanggil dan digoyang ringan.</p><p><b>Apa tindakan pertamamu?</b></p>',
      image: IMG.aed,
      choices: [
        { text: "Pastikan keamanan, cek respons dan napas, panggil bantuan, mulai kompresi dada", goto: 19 },
        { text: "Tunggu ambulans sambil memantau", goto: 20 },
        { text: "Beri minum dan dudukkan pasien", goto: 21 }
      ]
    },

    19: {
      tag: "Kasus D · Halaman D2",
      status: "tepat",
      title: "Rantai Bertahan Hidup",
      story: '<p>Keamanan lokasi dipastikan. Respons dan napas diperiksa cepat (≤ 10 detik). Bantuan dipanggil, AED diminta, kompresi dada dimulai segera.</p><p>Kompresi 100–120/menit, kedalaman 5–6 cm, recoil penuh, interupsi minimal. AED dipasang begitu tersedia dan instruksinya diikuti.</p>',
      image: IMG.aed,
      choices: [{ text: "Lanjut ke evaluasi kasus", goto: 22 }]
    },

    20: {
      tag: "Kasus D · Halaman D3",
      status: "bahaya",
      title: "Menunggu Tanpa Kompresi",
      story: '<p>Setiap menit tanpa kompresi menurunkan peluang bertahan hidup sekitar 7–10%. Menunggu ambulans tanpa kompresi membuang waktu saat aliran darah nol.</p>',
      image: IMG.observe,
      choices: [{ text: "Mulai kompresi dada sekarang", goto: 19 }]
    },

    21: {
      tag: "Kasus D · Halaman D4",
      status: "bahaya",
      title: "Memberi Minum",
      story: '<p>Pada pasien tidak sadar, memberi minum berisiko aspirasi dan tidak memperbaiki sirkulasi. Henti jantung butuh kompresi, bukan minuman.</p>',
      image: IMG.observe,
      choices: [{ text: "Hentikan, mulai kompresi dada", goto: 19 }]
    },

    22: {
      tag: "Kasus D · Halaman D5",
      status: "evaluasi",
      title: "Evaluasi Kasus D",
      story: '<p><b>Diskusikan:</b></p><ol><li>Mengapa kompresi dada menunda disosiasi elektromekanis?</li><li>Peran AED pada fibrilasi ventrikel.</li><li>Kapan kompresi dihentikan saat bantuan datang?</li></ol><p class="note">Kasus ini draf latihan. Ikuti pedoman BHD resmi dan validasi dosen.</p>',
      image: IMG.clipboard,
      choices: [
        { text: "Kembali ke daftar kasus", goto: 2, alt: true },
        { text: "Tutup buku (kembali ke sampul)", goto: 0, alt: true }
      ]
    }
  }
};

window.BOOK = BOOK;
window.STATUS_LABEL = STATUS_LABEL;

/* ------------------------------------------------------------------
   Lapisan kompatibilitas: DATA_KASUS bentuk lama (kasus -> halaman)
   diturunkan dari BOOK supaya home/profil/admin/tests tetap jalan.
------------------------------------------------------------------ */
(function buildCompat() {
  var TIPE = {
    "": "awal",
    "tepat": "tepat",
    "kurang": "kurang_tepat",
    "kurang-sesuai": "kurang_tepat",
    "keliru": "keliru",
    "bahaya": "berbahaya",
    "evaluasi": "evaluasi"
  };
  var LABEL = {
    "awal": "Awal",
    "tepat": "Tepat",
    "kurang_tepat": "Kurang Tepat",
    "keliru": "Keliru",
    "berbahaya": "Berbahaya",
    "evaluasi": "Evaluasi"
  };

  window.DATA_KASUS = BOOK.kasus.map(function (meta) {
    var start = meta.start;
    // batas atas = halaman sebelum kasus berikutnya (atau halaman terakhir)
    var all = BOOK.kasus;
    var idx = all.indexOf(meta);
    var nextStart = (idx >= 0 && all[idx + 1]) ? all[idx + 1].start - 1 : 22;
    var end = nextStart;

    function pageNumberToId(num) {
      var p = BOOK.pages[num];
      if (!p) return "";
      var mm = /Halaman\s+([A-Z]\d+)/.exec(p.tag || "");
      return mm ? mm[1] : "";
    }

    var halaman = [];
    for (var n = start; n <= end; n++) {
      var page = BOOK.pages[n];
      if (!page) continue;
      var m = /Halaman\s+([A-Z]\d+)/.exec(page.tag || "");
      var id = m ? m[1] : ("P" + n);
      var tipe = TIPE[page.status || ""] || "awal";
      halaman.push({
        id: id,
        nomor: n,
        tipe: tipe,
        label: LABEL[tipe],
        judul: page.title,
        cerita: page.story,
        gambar: page.image || "",
        vital: page.vitals || [],
        adegan: [{ pembicara: "Narasi", teks: (page.story || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() }],
        efek_vital: null,
        pilihan: (page.choices || []).map(function (c) {
          return { teks: c.text, tujuan: pageNumberToId(c.goto), alt: !!c.alt };
        }).filter(function (o) {
          // buang tautan lintas-kasus (mis. "Lanjut ke Kasus B") dari bentuk kompat;
          // alur lintas kasus hanya dipakai mesin BOOK.
          return o.tujuan !== "" && o.tujuan.charAt(0) === (meta.id === "D" ? "D" : meta.id);
        })
      });
    }

    return {
      id: meta.id,
      judul: meta.judul,
      pertemuan_terkait: meta.pertemuan_terkait,
      status_validasi: meta.status_validasi,
      ringkasan: meta.ringkasan,
      halaman: halaman
    };
  });
})();
