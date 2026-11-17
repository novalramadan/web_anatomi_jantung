/* data/kasus.js — 3 kasus bercabang dari lampiran (A, B, C) + Kasus D draf (BHD, di luar lampiran).
   Fakta, angka, dan alur cabang wajib sama dengan sumber. Yang dikembangkan hanya gaya penceritaan. */
window.DATA_KASUS = [
  {
    id: "A",
    judul: "Perdarahan Masif setelah Kecelakaan",
    pertemuan_terkait: [1, 3, 13, 15],
    status_validasi: "sesuai lampiran",
    ringkasan: "Pria 35 tahun, fraktur femur terbuka, syok hemoragik. Pilih langkah pertama yang fisiologis.",
    halaman: [
      {
        id: "A1",
        tipe: "awal",
        latar: "igd",
        adegan: [
          { pembicara: "Narasi", teks: "Ambulans berhenti di pintu IGD. Lampu sorot ruang tindakan menyala, dan suara brankar berderit di lantai." },
          { pembicara: "Perawat", teks: "Pria 35 tahun, kecelakaan sepeda motor. Fraktur femur terbuka kanan, perdarahan masih aktif. TD 75/45, MAP sekitar 55." },
          { pembicara: "Kamu", teks: "Nadi?" },
          { pembicara: "Perawat", teks: "130 per menit, lemah. Napas 28, CRT lebih dari 4 detik, akral dingin dan pucat. GCS 14." },
          { pembicara: "Pasien", teks: "Dok… dingin… haus…" },
          { pembicara: "Narasi", teks: "Darah menetes di lantai, membentuk genangan kecil yang terus melebar. Apa langkah pertamamu?" }
        ],
        pilihan: [
          { teks: "Hentikan perdarahan (tekanan langsung/torniket), pasang dua akses IV besar, mulai resusitasi terbatas dengan produk darah, target tekanan permisif.", tujuan: "A2" },
          { teks: "Beri vasodilator arteri untuk menurunkan SVR karena akral dingin.", tujuan: "A3" },
          { teks: "Beri vasopresor dosis tinggi segera tanpa volume.", tujuan: "A4" },
          { teks: "Dudukkan pasien dan beri minum, lalu observasi.", tujuan: "A5" }
        ],
        efek_vital: { hr: 130, td: "75/45", map: 55, stabilitas: 22 }
      },
      {
        id: "A2",
        tipe: "tepat",
        latar: "igd",
        adegan: [
          { pembicara: "Narasi", teks: "Tekanan langsung di luka, lalu torniket di atasnya. Dua akses IV besar terpasang. Kantong darah digantung dan mengalir." },
          { pembicara: "Dokter jaga", teks: "Bagus. Sumber perdarahan dikendalikan, jadi volume tidak terus hilang. Darah menggantikan volume dan kapasitas pengangkut O₂ tanpa mengencerkan faktor pembekuan." },
          { pembicara: "Kamu", teks: "Target tekanan?" },
          { pembicara: "Dokter jaga", teks: "Tekanan permisif: sistolik sekitar 80–90 mmHg atau MAP sekitar 50–65 mmHg, kecuali ada cedera kepala. Tekanan tinggi bisa memecah bekuan sebelum sumber perdarahan tertutup." },
          { pembicara: "Perawat", teks: "Nadi turun ke 108. CRT mulai membaik. Urin mulai ada." },
          { pembicara: "Dokter jaga", teks: "Pantau urin di atas 0,5 mL/kg/jam dan laktat yang turun. Cegah lethal triad: hipotermia, asidosis, koagulopati." },
          { pembicara: "Kamu", teks: "Jadi intinya ΔP dikembalikan lewat volume, bukan lewat mengubah resistensi." },
          { pembicara: "Narasi", teks: "Pasien dibawa ke kamar operasi. Perdarahan terkendali." }
        ],
        pilihan: [{ teks: "Lanjutkan ke evaluasi kasus.", tujuan: "A6" }],
        efek_vital: { hr: 108, td: "92/60", map: 70, stabilitas: 72 }
      },
      {
        id: "A3",
        tipe: "keliru",
        latar: "igd",
        adegan: [
          { pembicara: "Narasi", teks: "Vasodilator masuk lewat jalur IV. Beberapa detik kemudian monitor berubah." },
          { pembicara: "Perawat", teks: "TD turun! 58/32. MAP sekitar 40." },
          { pembicara: "Pasien", teks: "…pusing…" },
          { pembicara: "Narasi", teks: "Mata pasien terpejam. Kesadaran menurun. Perfusi otak dan koroner turun." },
          { pembicara: "Dokter jaga", teks: "Hentikan vasodilator. Akral dingin itu kompensasi, bukan masalah yang harus dikoreksi. Vasodilator menurunkan SVR, sedangkan CO sudah turun karena preload rendah. MAP ≈ CO × SVR, jadi MAP anjlok." },
          { pembicara: "Kamu", teks: "Kita kendalikan perdarahan dan ganti volume." },
          { pembicara: "Narasi", teks: "Kamu kembali ke jalur yang benar." }
        ],
        pilihan: [{ teks: "Kendalikan perdarahan dan ganti volume.", tujuan: "A2" }],
        efek_vital: { hr: 138, td: "58/32", map: 40, stabilitas: 8 }
      },
      {
        id: "A4",
        tipe: "kurang_tepat",
        latar: "igd",
        adegan: [
          { pembicara: "Narasi", teks: "Vasopresor dosis tinggi masuk. Tekanan naik sedikit, tetapi ujung jari pasien makin pucat." },
          { pembicara: "Perawat", teks: "TD 88/58 sekarang. Tapi kaki teraba dingin, urin belum ada." },
          { pembicara: "Dokter jaga", teks: "Vasopresor menaikkan SVR, tetapi tidak menambah volume. Pada hipovolemia, vasokonstriksi tambahan memperburuk perfusi jaringan perifer dan ginjal, dan menaikkan tekanan tanpa menghentikan perdarahan." },
          { pembicara: "Kamu", teks: "Jadi bukan lini pertama pada syok hemoragik?" },
          { pembicara: "Dokter jaga", teks: "Benar. Dipakai terbatas bila hipotensi mengancam jiwa saat resusitasi volume berlangsung. Sekarang kendalikan perdarahan dan ganti volume." }
        ],
        pilihan: [{ teks: "Kendalikan perdarahan dan ganti volume.", tujuan: "A2" }],
        efek_vital: { hr: 126, td: "88/58", map: 68, stabilitas: 30 }
      },
      {
        id: "A5",
        tipe: "berbahaya",
        latar: "igd",
        adegan: [
          { pembicara: "Narasi", teks: "Pasien didudukkan. Gelas air dijejalkan ke tangannya. Tidak ada torniket, tidak ada akses, tidak ada darah." },
          { pembicara: "Perawat", teks: "TD 62/35. Nadi 148, sangat lemah. Urin tidak ada sejak tadi." },
          { pembicara: "Dokter jaga", teks: "Tanpa kontrol perdarahan dan volume, preload turun terus. Simpatis sudah maksimal. Aliran ke ginjal dan splangnikus menurun, timbul oliguria dan asidosis laktat." },
          { pembicara: "Kamu", teks: "Lalu dekompensasi…" },
          { pembicara: "Dokter jaga", teks: "Ya, syok ireversibel. Minum juga berisiko bila perlu operasi segera. Kita harus kembali ke langkah yang benar sekarang." }
        ],
        pilihan: [{ teks: "Kembali: kendalikan perdarahan dan ganti volume.", tujuan: "A2" }],
        efek_vital: { hr: 148, td: "62/35", map: 44, stabilitas: 5 }
      },
      {
        id: "A6",
        tipe: "evaluasi",
        latar: "ruang_periksa",
        adegan: [
          { pembicara: "Narasi", teks: "Beberapa hari kemudian. Pasien sudah dirawat di bangsal, luka operasi bersih, dan ia duduk di tepi tempat tidur." },
          { pembicara: "Pasien", teks: "Dok, saya masih ingat rasa haus waktu itu." },
          { pembicara: "Kamu", teks: "Rasa haus itu tanda tubuh kekurangan volume. Sekarang kita diskusikan apa yang terjadi." },
          { pembicara: "Dokter jaga", teks: "Empat pertanyaan. Satu, jelaskan mengapa tekanan nadi menyempit pada awal syok. Dua, mengapa hematokrit awal dapat tampak normal?" },
          { pembicara: "Dokter jaga", teks: "Tiga, bagaimana kurva venous return bergeser pada perdarahan dan pada pemberian darah? Empat, mengapa kristaloid dalam jumlah besar dapat merugikan?" }
        ],
        pilihan: [],
        efek_vital: { hr: 88, td: "118/74", map: 89, stabilitas: 92 }
      }
    ]
  },

  {
    id: "B",
    judul: "Sinkop saat Naik Tangga pada Lansia",
    pertemuan_terkait: [3, 10, 11, 14, 16],
    status_validasi: "sesuai lampiran",
    ringkasan: "Perempuan 72 tahun pingsan saat naik tangga, murmur ejeksi di basis. Cari penjelasan fisiologis yang paling mungkin.",
    halaman: [
      {
        id: "B1",
        tipe: "awal",
        latar: "ruang_periksa",
        adegan: [
          { pembicara: "Narasi", teks: "Ruang periksa pagi. Seorang perempuan tua duduk dengan mantel masih terpasang, tangannya gemetar ringan." },
          { pembicara: "Pasien", teks: "Saya pingsan waktu naik tangga, Dok. Sebelumnya dada saya terasa tertekan dan sesak kalau naik tangga, sudah enam bulan." },
          { pembicara: "Kamu", teks: "Saat ini TD 110/85, tekanan nadi sempit. Nadi 78, teraba lambat dan lemah." },
          { pembicara: "Narasi", teks: "Stetoskop menyentuh sela iga kedua kanan. Terdengar murmur sistolik crescendo–decrescendo yang kasar, menjalar ke leher. S2 tunggal dan melemah." },
          { pembicara: "Perawat", teks: "Dok, penjelasan fisiologisnya yang paling mungkin apa?" }
        ],
        pilihan: [
          { teks: "Stenosis aorta: afterload tinggi tetap, CO tidak dapat naik saat aktivitas.", tujuan: "B2" },
          { teks: "Regurgitasi mitral: darah kembali ke atrium kiri sepanjang sistol.", tujuan: "B3" },
          { teks: "Fibrilasi atrium paroksismal dengan respons ventrikel cepat.", tujuan: "B4" }
        ],
        efek_vital: { hr: 78, td: "110/85", map: 93, stabilitas: 55 }
      },
      {
        id: "B2",
        tipe: "tepat",
        latar: "ruang_periksa",
        adegan: [
          { pembicara: "Kamu", teks: "Stenosis aorta berat. Gradien tekanan besar melintasi katup, wall stress σ naik menurut Laplace, sehingga LV menebal — hipertrofi konsentrik." },
          { pembicara: "Dokter jaga", teks: "Tiga gejala klasiknya?" },
          { pembicara: "Kamu", teks: "Angina karena MVO₂ naik dan perfusi subendokardium turun akibat LVEDP tinggi dan hipertrofi. Sinkop karena saat latihan SVR turun akibat vasodilatasi otot, tetapi CO tidak dapat naik melewati katup sempit, sehingga MAP turun dan perfusi otak turun. Lalu gagal jantung." },
          { pembicara: "Dokter jaga", teks: "Tekanan nadi sempit dan nadi parvus et tardus mencerminkan SV yang terbatas. Pada loop P–V: tekanan sistolik LV sangat tinggi, ESV naik, SV turun." },
          { pembicara: "Kamu", teks: "Hindari vasodilator kuat dan dehidrasi. Terapi definitifnya penggantian katup." },
          { pembicara: "Dokter jaga", teks: "Satu pertanyaan lagi: mengapa S2 melemah dan tunggal?" }
        ],
        pilihan: [{ teks: "Lanjutkan ke evaluasi kasus.", tujuan: "B5" }],
        efek_vital: { hr: 78, td: "110/85", map: 93, stabilitas: 62 }
      },
      {
        id: "B3",
        tipe: "kurang_tepat",
        latar: "ruang_periksa",
        adegan: [
          { pembicara: "Kamu", teks: "Mungkin regurgitasi mitral. Darah kembali ke atrium kiri sepanjang sistol." },
          { pembicara: "Dokter jaga", teks: "Regurgitasi mitral menghasilkan murmur holosistolik di apeks yang menjalar ke aksila. Di kasus ini murmur ejeksi di basis, menjalar ke karotis, dan S2 melemah." },
          { pembicara: "Pasien", teks: "Jadi bukan itu, Dok?" },
          { pembicara: "Dokter jaga", teks: "Temuan auskultasinya lebih sesuai stenosis aorta. Mari kita kembali ke penjelasan yang tepat." }
        ],
        pilihan: [{ teks: "Kembali ke stenosis aorta.", tujuan: "B2" }],
        efek_vital: { hr: 80, td: "108/84", map: 92, stabilitas: 53 }
      },
      {
        id: "B4",
        tipe: "kurang_tepat",
        latar: "ruang_periksa",
        adegan: [
          { pembicara: "Kamu", teks: "Fibrilasi atrium paroksismal dengan respons ventrikel cepat." },
          { pembicara: "Dokter jaga", teks: "Fibrilasi atrium memberi nadi ireguler tanpa murmur ejeksi khas. Nadi di sini teratur, 78 per menit." },
          { pembicara: "Perawat", teks: "Betul, Dok. Iramanya teratur sejak tadi." },
          { pembicara: "Dokter jaga", teks: "Mari kita kembali ke penjelasan yang paling mungkin." }
        ],
        pilihan: [{ teks: "Kembali ke stenosis aorta.", tujuan: "B2" }],
        efek_vital: { hr: 78, td: "110/85", map: 93, stabilitas: 53 }
      },
      {
        id: "B5",
        tipe: "evaluasi",
        latar: "ruang_periksa",
        adegan: [
          { pembicara: "Kamu", teks: "S2 melemah karena komponen aorta, A2, hampir tidak terdengar akibat katup kaku dan kalsifikasi, serta gerak daun katup berkurang." },
          { pembicara: "Dokter jaga", teks: "Tepat. Sekarang diskusi: bandingkan loop P–V stenosis aorta dengan regurgitasi aorta, dari segi preload dan afterload." },
          { pembicara: "Pasien", teks: "Terima kasih, Dok. Saya jadi mengerti kenapa saya pingsan." },
          { pembicara: "Narasi", teks: "Rujukan ke kardiologi dibuat. Kamu menulis catatan kecil: beban tekanan, bukan beban volume." }
        ],
        pilihan: [],
        efek_vital: { hr: 78, td: "110/85", map: 93, stabilitas: 62 }
      }
    ]
  },

  {
    id: "C",
    judul: "Nyeri Dada dengan Bradikardia dan Hipotensi",
    pertemuan_terkait: [5, 6, 14, 16],
    status_validasi: "sesuai lampiran",
    ringkasan: "Pria 58 tahun, nyeri dada inferior, bradikardia, hipotensi, JVP tinggi, paru bersih. Tentukan mekanismenya.",
    halaman: [
      {
        id: "C1",
        tipe: "awal",
        latar: "igd",
        adegan: [
          { pembicara: "Narasi", teks: "Pukul 03.10. Seorang pria 58 tahun masuk dengan tangan menekan dada, kemeja basah oleh keringat dingin." },
          { pembicara: "Pasien", teks: "Nyeri… menjalar ke rahang… sudah empat puluh menit. Mual." },
          { pembicara: "Perawat", teks: "TD 85/55, HR 44. JVP meninggi. Paru bersih." },
          { pembicara: "Kamu", teks: "EKG?" },
          { pembicara: "Perawat", teks: "Elevasi ST di II, III, aVF. Sadapan kanan V4R juga menunjukkan elevasi ST." },
          { pembicara: "Narasi", teks: "Monitor berbunyi pelan dan teratur. Terlalu pelan." }
        ],
        pilihan: [
          { teks: "Infark inferior (RCA) dengan infark ventrikel kanan dan refleks Bezold–Jarisch.", tujuan: "C2" },
          { teks: "Infark anterior luas (LAD) dengan syok kardiogenik.", tujuan: "C3" }
        ],
        efek_vital: { hr: 44, td: "85/55", map: 65, stabilitas: 26 }
      },
      {
        id: "C2",
        tipe: "tepat",
        latar: "igd",
        adegan: [
          { pembicara: "Kamu", teks: "RCA memperdarahi dinding inferior, ventrikel kanan, nodus SA, dan nodus AV. Bradikardia timbul karena iskemia nodus dan refleks Bezold–Jarisch — rangsangan vagal." },
          { pembicara: "Dokter jaga", teks: "Dan infark RV?" },
          { pembicara: "Kamu", teks: "Menurunkan pengisian ventrikel kiri sehingga CO turun dan hipotensi, dengan paru bersih dan JVP tinggi." },
          { pembicara: "Dokter jaga", teks: "Ventrikel kanan sangat bergantung pada preload. Hindari nitrat dan diuretik yang menurunkan preload. Cairan hati-hati bila pengisian ventrikel kiri kurang, dan reperfusi segera." },
          { pembicara: "Perawat", teks: "TD 96/62 setelah cairan hati-hati. Nadi 58." },
          { pembicara: "Dokter jaga", teks: "Pertanyaan: mengapa paru bersih meski CO turun?" }
        ],
        pilihan: [{ teks: "Lanjutkan ke evaluasi kasus.", tujuan: "C4" }],
        efek_vital: { hr: 58, td: "96/62", map: 73, stabilitas: 58 }
      },
      {
        id: "C3",
        tipe: "kurang_tepat",
        latar: "igd",
        adegan: [
          { pembicara: "Kamu", teks: "Infark anterior luas akibat oklusi LAD, dengan syok kardiogenik." },
          { pembicara: "Dokter jaga", teks: "Infark LAD memberi elevasi ST di V1–V4 dan biasanya kongesti paru, ronki, karena LV gagal. Di sini paru bersih, JVP tinggi, dan elevasi ST di inferior." },
          { pembicara: "Kamu", teks: "Berarti lebih sesuai infark RCA." },
          { pembicara: "Dokter jaga", teks: "Ya. Mari kita susun ulang penalarannya." }
        ],
        pilihan: [{ teks: "Kembali ke infark inferior RCA.", tujuan: "C2" }],
        efek_vital: { hr: 46, td: "84/54", map: 64, stabilitas: 24 }
      },
      {
        id: "C4",
        tipe: "evaluasi",
        latar: "igd",
        adegan: [
          { pembicara: "Kamu", teks: "Paru bersih karena kegagalan ventrikel kanan membatasi aliran ke paru, sehingga tekanan kapiler paru tidak naik. Kongesti terjadi di sisi vena sistemik — JVP tinggi." },
          { pembicara: "Dokter jaga", teks: "Tepat. Diskusi: kurva Frank–Starling ventrikel kanan dan interdependensi ventrikel." },
          { pembicara: "Narasi", teks: "Pasien dibawa ke ruang kateterisasi. Monitor masih pelan, tetapi tekanan mulai stabil." }
        ],
        pilihan: [],
        efek_vital: { hr: 62, td: "100/64", map: 76, stabilitas: 64 }
      }
    ]
  },

  {
    id: "D",
    judul: "Henti Jantung Mendadak di Tempat Umum",
    pertemuan_terkait: [1, 9, 15, 16],
    status_validasi: "draf, perlu divalidasi dosen",
    ringkasan: "Kasus draf bantuan hidup dasar: pria dewasa kolaps di area publik. Susun berdasarkan pedoman BHD (AHA/ERC/PERKI), tanpa dosis obat.",
    halaman: [
      {
        id: "D1",
        tipe: "awal",
        latar: "jalan_raya",
        adegan: [
          { pembicara: "Narasi", teks: "Siang di area publik. Seorang pria dewasa tiba-tiba jatuh di trotoar, tidak bergerak. Kerumunan mulai mengelilingi." },
          { pembicara: "Saksi", teks: "Dia jatuh sendiri! Tiba-tiba saja. Ada yang tahu harus bagaimana?" },
          { pembicara: "Narasi", teks: "Kamu mahasiswa kedokteran. Kamu berada paling dekat. Langkah pertamamu?" }
        ],
        pilihan: [
          { teks: "Pastikan lokasi aman, cek respons dan napas, lalu minta bantuan dan AED.", tujuan: "D2" },
          { teks: "Segera dudukkan dan beri minum agar sadar.", tujuan: "D3" },
          { teks: "Angkat tubuhnya dan bawa sendiri ke klinik terdekat.", tujuan: "D4" },
          { teks: "Raba nadi karotis lama dan tunggu bantuan datang tanpa melakukan apa pun.", tujuan: "D5" }
        ],
        efek_vital: { hr: 0, td: "0/0", map: 0, stabilitas: 0 }
      },
      {
        id: "D2",
        tipe: "tepat",
        latar: "jalan_raya",
        adegan: [
          { pembicara: "Kamu", teks: "Aman untuk saya. Tidak ada lalu lintas. Bapak, apakah Anda mendengar saya?" },
          { pembicara: "Narasi", teks: "Tidak ada respons. Kamu menepuk bahu, menilai napas selama tidak lebih dari sepuluh detik. Tidak ada napas normal — hanya dengkur sesekali." },
          { pembicara: "Kamu", teks: "Tolong panggil bantuan medis sekarang, dan cari AED! Anda, bantu saya menghitung kompresi." },
          { pembicara: "Saksi", teks: "AED ada di lobi, dekat pintu masuk!" },
          { pembicara: "Kamu", teks: "Mulai kompresi dada. Dua tangan di tengah dada, lengan lurus, kedalaman sekitar lima sentimeter, laju 100–120 per menit, dorong penuh dan biarkan dada mengembang." },
          { pembicara: "Narasi", teks: "Kompresi bergantian setiap dua menit bila ada penolong lain. AED tiba, elektroda dipasang, dan perangkat memberi panduan suara." },
          { pembicara: "Kamu", teks: "Semua menjauh dari pasien. Ikuti instruksi perangkat." },
          { pembicara: "Narasi", teks: "Perangkat menganalisis irama. Bantuan medis datang tak lama kemudian." }
        ],
        pilihan: [{ teks: "Lanjutkan ke evaluasi kasus.", tujuan: "D7" }],
        efek_vital: { hr: 0, td: "0/0", map: 0, stabilitas: 30 }
      },
      {
        id: "D3",
        tipe: "keliru",
        latar: "jalan_raya",
        adegan: [
          { pembicara: "Narasi", teks: "Pasien didudukkan dan diberi minum. Cairan menetes dari sudut mulutnya. Tidak ada respons." },
          { pembicara: "Saksi", teks: "Dia tidak menelan! Doks… dia tidak bernapas!" },
          { pembicara: "Kamu", teks: "Henti jantung tidak ditangani dengan minum. Waktu terus berjalan, dan setiap menit tanpa kompresi menurunkan peluang bertahan." },
          { pembicara: "Narasi", teks: "Kamu menyesuaikan diri dan kembali ke urutan yang benar." }
        ],
        pilihan: [{ teks: "Kembali: aman, cek respons dan napas, minta bantuan dan AED.", tujuan: "D2" }],
        efek_vital: { hr: 0, td: "0/0", map: 0, stabilitas: 4 }
      },
      {
        id: "D4",
        tipe: "berbahaya",
        latar: "jalan_raya",
        adegan: [
          { pembicara: "Narasi", teks: "Kamu mengangkat tubuh pasien. Kepala terkulai, dan tubuh terasa berat." },
          { pembicara: "Saksi", teks: "Jangan diangkat sendiri, bisa jatuh!" },
          { pembicara: "Kamu", teks: "Benar. Memindahkan korban henti jantung menunda kompresi dan berisiko cedera. Korban harus tetap di tempat, ditangani di tempat." },
          { pembicara: "Narasi", teks: "Kamu menurunkan tubuh dengan hati-hati dan kembali ke urutan yang benar." }
        ],
        pilihan: [{ teks: "Kembali: aman, cek respons dan napas, minta bantuan dan AED.", tujuan: "D2" }],
        efek_vital: { hr: 0, td: "0/0", map: 0, stabilitas: 3 }
      },
      {
        id: "D5",
        tipe: "kurang_tepat",
        latar: "jalan_raya",
        adegan: [
          { pembicara: "Narasi", teks: "Kamu meraba nadi karotis sambil menunggu. Detik berganti detik. Kerumunan diam." },
          { pembicara: "Saksi", teks: "Sudah lama sekali, Dok. Dia tidak bergerak." },
          { pembicara: "Kamu", teks: "Menilai nadi terlalu lama oleh orang non-profesional menunda kompresi. Untuk penolong pertama, yang dinilai adalah respons dan napas, bukan nadi berkepanjangan." },
          { pembicara: "Narasi", teks: "Kamu segera memperbaiki urutan tindakan." }
        ],
        pilihan: [{ teks: "Kembali: aman, cek respons dan napas, minta bantuan dan AED.", tujuan: "D2" }],
        efek_vital: { hr: 0, td: "0/0", map: 0, stabilitas: 5 }
      },
      {
        id: "D7",
        tipe: "evaluasi",
        latar: "ruang_periksa",
        adegan: [
          { pembicara: "Narasi", teks: "Di ruang tunggu, suasana masih tegang. Saksi duduk di sebelahmu." },
          { pembicara: "Saksi", teks: "Saya tidak menyangka hal seperti itu bisa terjadi di depan mata." },
          { pembicara: "Kamu", teks: "Diskusi. Satu, mengapa kecepatan kompresi dan kedalaman penting untuk perfusi otak? Dua, apa peran AED dalam memutus siklus henti jantung?" },
          { pembicara: "Kamu", teks: "Tiga, mengapa penolong pertama tidak perlu menilai nadi berkepanjangan? Empat, bagaimana kamu akan mengajarkan urutan ini kepada orang awam?" },
          { pembicara: "Narasi", teks: "Kasus ini adalah draf untuk latihan. Pedoman resmi tetap acuan utama." }
        ],
        pilihan: [],
        efek_vital: { hr: 0, td: "0/0", map: 0, stabilitas: 45 }
      }
    ]
  }
];
