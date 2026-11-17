/* data/pertemuan.js — 16 pertemuan. Sumber: "Fisiologi Jantung – Modul Materi 16 Pertemuan.docx".
   Format .js + variabel global agar terbaca saat index.html dibuka lewat file:// (fetch JSON diblokir). */
window.DATA_PERTEMUAN = window.DATA_PERTEMUAN || [];
/* data/pertemuan.js — 16 pertemuan, sumber: "Fisiologi Jantung – Modul Materi 16 Pertemuan.docx"
   Jangan ubah angka/rumus. Format .js (bukan JSON) agar terbaca pada file:// */


window.DATA_PERTEMUAN.push({
  id: 1,
  judul: "Pengantar Sistem Kardiovaskular dan Organisasi Sirkulasi",
  blok: "Fondasi",
  ringkasan: "Sistem kardiovaskular adalah sistem transpor bertekanan: satu pompa ganda mendorong darah melalui pembuluh yang tersusun seri dan paralel sehingga setiap jaringan menerima O₂ dan nutrisi sesuai kebutuhannya.",
  tujuan: [
    "Menjelaskan fungsi sistem kardiovaskular dan komponen-komponennya (jantung, arteri, arteriol, kapiler, venula, vena, limfatik, darah).",
    "Membedakan sirkulasi sistemik dan pulmonal serta menjelaskan mengapa curah kedua ventrikel harus sama.",
    "Menjelaskan konsekuensi fisiologis susunan seri dan paralel.",
    "Menggambarkan profil tekanan, luas penampang, dan kecepatan aliran di sepanjang pohon vaskular.",
    "Menjelaskan fungsi pembuluh resistensi, pertukaran, dan kapasitansi serta distribusi volume darah."
  ],
  konsep_inti: [
    {
      judul: "1. Fungsi sistem kardiovaskular",
      isi: "(a) Mengantar O₂, nutrisi, hormon, dan sel imun ke jaringan; (b) mengangkut CO₂ dan hasil metabolisme ke organ ekskresi; (c) membantu termoregulasi (aliran kulit); (d) menjaga homeostasis cairan lewat pertukaran kapiler. Volume darah dewasa ± 5 L (± 70 mL/kg), hematokrit ± 45% (pria) dan ± 42% (wanita)."
    },
    {
      judul: "2. Sirkulasi ganda",
      isi: "Jantung kanan memompa darah ke paru (sirkulasi pulmonal, tekanan rendah), jantung kiri ke seluruh tubuh (sirkulasi sistemik, tekanan tinggi). Kedua sirkulasi dihubungkan seri, sehingga dalam jangka panjang curah ventrikel kanan = kiri (± 5 L/menit). Selisih sesaat diredam oleh volume darah paru dan mekanisme Frank–Starling (Pertemuan 11). Tekanan paru dijaga rendah agar tidak terjadi filtrasi cairan ke alveolus (edema paru).",
      tabel: [{
        judul: "Perbandingan sirkulasi sistemik dan pulmonal",
        kolom: ["Parameter", "Sistemik", "Pulmonal"],
        baris: [
          ["Tekanan arteri", "120/80 mmHg, rerata ± 93", "25/8–10 mmHg, rerata ± 15"],
          ["Resistensi vaskular", "Tinggi (SVR ± 800–1200 dyne·s/cm⁵)", "Rendah (PVR ± 40–150)"],
          ["Dinding ventrikel", "Tebal", "Tipis"],
          ["Fungsi", "Perfusi jaringan", "Pertukaran gas"]
        ]
      }]
    },
    {
      judul: "3. Susunan seri dan paralel",
      isi: "Seri (jantung kanan → paru → jantung kiri → tubuh): seluruh curah harus melewati tiap segmen; resistensi dijumlahkan. Paralel (otak, jantung, ginjal, hati, otot, kulit memancar dari aorta): setiap organ menerima darah teroksigenasi penuh, aliran tiap organ dapat diatur sendiri tanpa menurunkan organ lain, dan resistensi total lebih kecil daripada resistensi organ mana pun. Distribusi aliran istirahat (perkiraan, % curah jantung): hati dan saluran cerna ± 27, ginjal ± 22, otot istirahat ± 15, otak ± 14, kulit ± 6, jantung ± 4, lain ± 12. Saat latihan, aliran otot bisa mencapai ± 80% curah jantung karena resistensi otot turun, sementara aliran ke ginjal dan saluran cerna ditekan."
    },
    {
      judul: "4. Pohon vaskular: tiga tipe pembuluh",
      isi: "Distribusi volume darah: vena dan venula ± 64%, arteri ± 13%, kapiler ± 7%, jantung ± 7%, paru ± 9%.",
      tabel: [{
        judul: "Tipe pembuluh dan sifat utamanya",
        kolom: ["Fungsi", "Pembuluh", "Sifat utama"],
        baris: [
          ["Penyangga tekanan (konduit)", "Aorta, arteri besar", "Elastis, komplians; menyimpan sebagian SV saat sistol (efek Windkessel)"],
          ["Resistensi", "Arteriol", "Otot polos tebal, jari-jari berubah → pengatur utama tekanan dan distribusi aliran"],
          ["Pertukaran", "Kapiler", "Dinding satu lapis sel endotel; total luas besar, aliran lambat"],
          ["Kapasitansi", "Venula dan vena", "Dinding tipis, sangat komplians; menampung ± 64% volume darah"]
        ]
      }]
    },
    {
      judul: "5. Tekanan, luas penampang, dan kecepatan",
      isi: "Aliran Q (= curah jantung) sama di setiap tingkat pohon vaskular. Menurut prinsip kontinuitas Q = A × v, kecepatan berbanding terbalik dengan total luas penampang. Luas penampang aorta ± 2,5–5 cm², sedangkan total kapiler ± 2500–4500 cm², sehingga kecepatan aliran kapiler ± 1000× lebih lambat daripada aorta. Kecepatan rendah memberi waktu bagi difusi O₂ dan nutrisi.",
      tabel: [{
        judul: "Profil tekanan di sepanjang pohon vaskular",
        kolom: ["Segmen", "Tekanan rerata (mmHg, perkiraan)", "Catatan"],
        baris: [
          ["Aorta dan arteri besar", "± 90–95", "Berdenyut (120/80)"],
          ["Arteriol", "turun dari ± 80 ke ± 35", "Penurunan tekanan terbesar: tempat resistensi utama"],
          ["Kapiler", "± 35 (ujung arteriol) → ± 15 (ujung venula)", "Tidak berdenyut"],
          ["Venula dan vena", "± 10 → 5", "Tekanan rendah, volume besar"],
          ["Vena cava dan atrium kanan", "± 0–8 (CVP)", "Tekanan pengisian jantung kanan"]
        ]
      }]
    }
  ],
  korelasi_klinis: [
    "Syok hipovolemik: volume vena menyusut, venokonstriksi mengalihkan darah dari kapasitansi ke sentral; arteriol berkontraksi memusatkan aliran ke otak dan jantung (susunan paralel memungkinkan pengalihan).",
    "Edema paru: bila tekanan atrium kiri naik (gagal jantung kiri, stenosis mitral), tekanan kapiler paru naik melebihi tekanan onkotik sehingga cairan masuk ke alveolus.",
    "Hipertensi pulmonal: PVR naik → ventrikel kanan yang berdinding tipis kewalahan (cor pulmonale)."
  ],
  rangkuman: [
    "Dua pompa seri, banyak organ paralel: curah kedua ventrikel sama, tetapi aliran antar organ dapat diatur terpisah.",
    "Arteriol = pembuluh resistensi (penurunan tekanan terbesar); vena = pembuluh kapasitansi (cadangan volume).",
    "Kecepatan aliran berbanding terbalik dengan luas penampang total; kapiler paling lambat."
  ],
  pertanyaan_penuntun: [
    "Mengapa tekanan sirkulasi pulmonal ± 5× lebih rendah padahal curahnya sama?",
    "Jelaskan dengan susunan paralel mengapa vasodilatasi otot saat latihan menurunkan SVR.",
    "Apa akibat bila luas penampang total pembuluh tidak membesar di tingkat kapiler?"
  ],
  bacaan: "Guyton & Hall (bab gambaran umum sirkulasi); Costanzo (bab fisiologi kardiovaskular); Klabunde (Cardiovascular Physiology Concepts), bab hemodinamika dasar."
});

window.DATA_PERTEMUAN.push({
  id: 2,
  judul: "Anatomi Fungsional Jantung dan Ultrastruktur Miokardium",
  blok: "Fondasi",
  ringkasan: "Bentuk jantung mengikuti fungsinya: ruang dan katup mengarahkan aliran satu arah, kerangka fibrosa menyekat listrik atrium dari ventrikel, dan struktur sel kardiomiosit (mitokondria padat, dyad, diskus interkalaris) memungkinkan kerja tanpa henti dan kontraksi serentak.",
  tujuan: [
    "Menjelaskan lapisan dinding jantung, ruang, katup, dan fungsi aparatus subvalvular.",
    "Menjelaskan peran kerangka fibrosa jantung dalam fungsi mekanik dan listrik.",
    "Menggambarkan ultrastruktur kardiomiosit dan membandingkannya dengan otot rangka dan otot polos.",
    "Menjelaskan komponen diskus interkalaris dan mekanisme sinsitium fungsional.",
    "Mengklasifikasikan sifat fisiologis miokardium (otomatisitas, kronotropik, batmotropik, dromotropik, inotropik, lusitropik).",
    "Menjelaskan persarafan otonom jantung secara garis besar."
  ],
  konsep_inti: [
    {
      judul: "1. Dinding dan ruang jantung",
      isi: "Dinding terdiri atas endokardium (endotel), miokardium (otot jantung), dan epikardium (lapisan viseral perikardium). Atrium berdinding tipis (tekanan rendah, fungsi penampung dan pompa pembantu); ventrikel berdinding tebal. Ventrikel kiri ± 3× lebih tebal daripada kanan (± 8–11 mm vs ± 3–5 mm) karena bekerja melawan tekanan ± 5× lebih tinggi (Laplace, Pertemuan 3). Serat miokardium ventrikel tersusun berlapis dan berputar spiral dari epikardium ke endokardium sehingga kontraksi memeras sekaligus memutar ventrikel (twist), meningkatkan efisiensi ejeksi."
    },
    {
      judul: "2. Katup",
      isi: "Atrioventrikular (trikuspid, mitral): daun katup diikat korda tendinea ke otot papilaris. Otot papilaris berkontraksi saat sistol untuk menahan daun katup agar tidak prolaps ke atrium. Semilunar (pulmonal, aorta): tiga kantong; menutup oleh aliran balik darah saat tekanan arteri melebihi tekanan ventrikel. Muara arteri koroner berada di sinus Valsalva aorta. Semua katup bekerja pasif, mengikuti gradien tekanan. Gangguan katup menimbulkan stenosis (menghambat aliran maju, beban tekanan) atau regurgitasi (aliran balik, beban volume)."
    },
    {
      judul: "3. Kerangka fibrosa jantung",
      isi: "Anulus fibrosus dan trigona fibrosa membentuk cincin penyangga katup dan menjadi titik lekat otot. Fungsi lain yang sangat penting: kerangka ini adalah isolator listrik antara atrium dan ventrikel. Satu-satunya jalur normal adalah berkas AV (His); jalur aksesori (misalnya berkas Kent pada sindrom Wolff–Parkinson–White) adalah kelainan."
    },
    {
      judul: "4. Ultrastruktur kardiomiosit",
      isi: "Kardiomiosit bergantung penuh pada fosforilasi oksidatif dan mudah iskemia karena kepadatan mitokondria tinggi.",
      tabel: [{
        judul: "Struktur kardiomiosit dan makna fungsional",
        kolom: ["Struktur", "Ciri", "Makna fungsional"],
        baris: [
          ["Bentuk dan inti", "Silindris bercabang, ± 100 µm × 15–25 µm, 1–2 inti di tengah", "Percabangan memudahkan penyebaran gaya dan impuls"],
          ["Mitokondria", "± 30–40% volume sel (otot rangka ± 2–5%)", "Tergantung penuh pada fosforilasi oksidatif; mudah iskemia"],
          ["Sarkomer", "Susunan aktin–miosin seperti otot rangka (garis Z, pita A/I, tropomiosin, troponin); titin menentukan kekakuan pasif", "Dasar striasi dan kurva panjang–gaya"],
          ["Tubulus-T", "Diameter ± 5× otot rangka, pada garis Z", "Membawa potensial aksi ke dalam sel; kanal Ca²⁺ tipe-L terkumpul di sini"],
          ["Retikulum sarkoplasma (SR)", "Lebih kecil dibanding otot rangka; terminal SR membentuk dyad dengan tubulus-T", "Pelepasan Ca²⁺ via RyR2 (Pertemuan 7); juga bergantung pada Ca²⁺ ekstrasel"]
        ]
      }]
    },
    {
      judul: "5. Diskus interkalaris",
      isi: "Sambungan ujung-ke-ujung antar kardiomiosit. Fascia adherens (aktin–kadherin) dan desmosom (filamen intermediet–desmin): sambungan mekanis, menahan gaya tarik tiap denyut. Gap junction: kanal heksamerik connexon (protein connexin) beresistensi listrik sangat rendah, memungkinkan arus ion dan molekul kecil lewat langsung antar sel. Isoform connexin berbeda menurut jaringan: Cx43 di miokardium ventrikel dan atrium; Cx40 di atrium dan sistem His–Purkinje; Cx45 di nodus SA dan AV (konduktansi kecil → konduksi lambat). Gap junction lebih banyak di ujung sel, sehingga konduksi lebih cepat searah panjang serat (anisotropi). Sinsitium fungsional: karena gap junction, depolarisasi satu sel menyebar ke seluruh miokardium. Jantung memiliki dua sinsitium: atrium dan ventrikel, dipisahkan kerangka fibrosa, sehingga atrium berkontraksi lebih dulu dan ventrikel menyusul setelah jeda AV (Pertemuan 5)."
    },
    {
      judul: "6. Sifat fisiologis miokardium",
      isi: "Enam istilah dasar yang dipakai sepanjang modul.",
      tabel: [{
        judul: "Istilah sifat fisiologis miokardium",
        kolom: ["Istilah", "Definisi", "Contoh/lokasi"],
        baris: [
          ["Otomatisitas", "Menghasilkan potensial aksi spontan", "Nodus SA, nodus AV, Purkinje"],
          ["Kronotropik", "Menentukan frekuensi denyut", "Nodus SA; simpatis (+), vagus (−)"],
          ["Batmotropik", "Eksitabilitas terhadap stimulus", "Kanal Na⁺ (ventrikel), Ca²⁺ tipe-L (nodus)"],
          ["Dromotropik", "Kecepatan konduksi impuls", "Nodus AV paling lambat, Purkinje tercepat"],
          ["Inotropik", "Kekuatan kontraksi pada beban tertentu", "Ca²⁺ intrasel dan kepekaan miofilamen"],
          ["Lusitropik", "Kecepatan relaksasi", "SERCA2a, fosfolamban"]
        ]
      }]
    },
    {
      judul: "7. Perbandingan tiga jenis otot",
      isi: "Perbedaan mendasar antara otot jantung, otot rangka, dan otot polos vaskular.",
      tabel: [{
        judul: "Perbandingan otot jantung, rangka, dan polos vaskular",
        kolom: ["Karakteristik", "Jantung", "Rangka", "Polos vaskular"],
        baris: [
          ["Bentuk sel", "Silindris bercabang, 1–2 inti sentral", "Silindris panjang, banyak inti perifer", "Gelendong, 1 inti"],
          ["Striasi", "Ada", "Ada", "Tidak ada"],
          ["Hubungan antar sel", "Diskus interkalaris dan gap junction", "Tidak ada", "Gap junction (tipe single-unit)"],
          ["Sumber Ca²⁺", "Ekstrasel (CICR) + SR", "SR (kopling mekanis)", "Ekstrasel + SR"],
          ["Pengikat Ca²⁺", "Troponin C", "Troponin C", "Kalmodulin → MLCK"],
          ["Persarafan", "Otonom; otoritmik", "Somatik", "Otonom, hormon, lokal"],
          ["Potensial aksi", "± 250–300 ms, plateau", "± 2–5 ms", "Bervariasi"],
          ["Refrakter", "Panjang (≈ kontraksi)", "1–5 ms", "Bervariasi"],
          ["Tetani", "Tidak dapat", "Dapat", "Dapat (tonus)"]
        ]
      }]
    },
    {
      judul: "8. Persarafan otonom (garis besar)",
      isi: "Simpatis: serat preganglionik dari segmen toraks atas (T1–T4/5), ganglion servikal dan toraks atas, mempersarafi nodus SA dan AV, atrium, ventrikel, dan koroner; reseptor utama β₁ (juga β₂ dan α₁). Parasimpatis: nervus vagus (X); asetilkolin bekerja lewat reseptor muskarinik M₂; vagus terutama mempersarafi nodus SA, AV, dan atrium, dengan persarafan ventrikel jauh lebih sedikit. Jantung yang ditransplantasi (denervasi) berdenyut pada frekuensi intrinsik nodus SA (± 100/menit) dan respons latihannya lebih lambat karena bergantung pada katekolamin sirkulasi."
    }
  ],
  korelasi_klinis: [
    "Infark miokard: mitokondria yang padat menjelaskan mengapa miokardium sangat cepat rusak bila suplai O₂ terhenti (puluhan menit).",
    "Prolaps/ruptur korda atau otot papilaris (misalnya pasca infark): regurgitasi mitral akut.",
    "Sindrom WPW: jalur aksesori melewati isolasi fibrosa, memicu takikardia reentri.",
    "Disfungsi gap junction (remodeling Cx43 pada iskemia dan gagal jantung): konduksi lambat dan heterogen, substrat reentri.",
    "Kardiomiopati hipertrofik dan dilatasi: mutasi protein sarkomer atau sitoskeleton."
  ],
  rangkuman: [
    "Katup bekerja pasif; kerangka fibrosa menjadi penyangga dan isolator listrik.",
    "Kardiomiosit: mitokondria padat, tubulus-T lebar, dyad, bergantung pada Ca²⁺ ekstrasel.",
    "Diskus interkalaris = desmosom (mekanis) + gap junction (listrik) → sinsitium fungsional atrium dan ventrikel."
  ],
  pertanyaan_penuntun: [
    "Mengapa penyekat listrik antara atrium dan ventrikel penting bagi pengisian ventrikel?",
    "Apa yang terjadi pada konduksi bila isoform connexin di nodus AV diganti Cx43?",
    "Bagaimana kepadatan mitokondria menjelaskan kerentanan jantung terhadap iskemia?"
  ],
  bacaan: "Guyton & Hall (bab otot jantung); Boron & Boulpaep (bab organisasi sistem kardiovaskular dan elektrofisiologi); buku ajar histologi dan anatomi untuk detail struktur."
});
window.DATA_PERTEMUAN.push({
  id: 3,
  judul: "Biofisika Hemodinamika",
  blok: "Fondasi",
  ringkasan: "Empat hubungan fisika menjelaskan hampir semua perilaku sirkulasi: aliran sebanding dengan selisih tekanan dan berbanding terbalik dengan resistensi (Ohm), resistensi sangat ditentukan jari-jari (Poiseuille), turbulensi menimbulkan bising (Reynolds), dan tegangan dinding bergantung pada tekanan dan jari-jari (Laplace).",
  tujuan: [
    "Menerapkan Q = ΔP/R dan menghitung MAP, SVR, serta PVR.",
    "Menjelaskan faktor penentu resistensi menurut Hagen–Poiseuille dan batas penerapannya.",
    "Menjelaskan peran viskositas dan hematokrit.",
    "Menjelaskan aliran laminar dan turbulen, angka Reynolds, serta korelasinya dengan murmur dan bruit.",
    "Menerapkan Hukum Laplace pada pembuluh dan ventrikel.",
    "Menjelaskan komplians, efek Windkessel, dan penentu tekanan nadi."
  ],
  konsep_inti: [
    {
      judul: "1. Hukum Ohm vaskular",
      isi: "Q = ΔP/R; CO = (MAP − CVP)/SVR ⇒ MAP ≈ CO × SVR. MAP = diastolik + 1/3 (sistolik − diastolik). Contoh 120/80: 80 + 13,3 = 93 mmHg. MAP ≥ 65 mmHg umumnya dianggap batas minimal perfusi organ vital. Untuk satuan klinis: SVR = (MAP − CVP)/CO × 80 dyne·s/cm⁵; contoh MAP 93, CVP 3, CO 6 L/menit → SVR = 1200. PVR = (mPAP − PCWP)/CO × 80; contoh (15 − 8)/6 × 80 ≈ 93."
    },
    {
      judul: "2. Hagen–Poiseuille",
      isi: "R = 8ηL/πr⁴; Q = ΔP·πr⁴/8ηL. Intuisi: dalam pipa, cairan di dekat dinding bergesekan dan nyaris diam; lumen sempit memiliki proporsi cairan \"dinding\" lebih besar, sehingga hambatan naik jauh lebih cepat daripada penyempitan itu sendiri. Hasilnya pangkat empat. Batas model: cairan Newtonian, aliran laminar tunak, tabung kaku lurus. Darah tidak sepenuhnya Newtonian (viskositas turun pada laju geser tinggi dan di pembuluh sangat kecil, efek Fåhræus–Lindqvist), pembuluh elastis, aliran berdenyut. Gunakan hukum ini untuk menalar arah dan besar perubahan, bukan menghitung angka presisi.",
      tabel: [{
        judul: "Pengaruh perubahan jari-jari (ΔP tetap)",
        kolom: ["Perubahan jari-jari", "Resistensi", "Aliran (ΔP tetap)"],
        baris: [
          ["× 0,5", "16×", "6,25%"],
          ["× 0,8", "2,4×", "41%"],
          ["× 1,19", "0,5×", "2×"],
          ["× 2", "1/16", "16×"]
        ]
      }]
    },
    {
      judul: "3. Viskositas dan hematokrit",
      isi: "Viskositas darah ± 3–4× air pada hematokrit normal dan naik tidak linear bila hematokrit naik (polisitemia, dehidrasi: aliran melambat, risiko trombosis); turun pada anemia (aliran lebih mudah, curah jantung meningkat, murmur fungsional). Penentu viskositas: hematokrit, protein plasma, suhu, laju geser."
    },
    {
      judul: "4. Laminar vs turbulen, angka Reynolds",
      isi: "Re = ρvD/η. Re < 2000: laminar (profil parabola, senyap). Re ± 2000–4000: transisi. Re > ± 4000: turbulen (olakan memicu getaran yang terdengar). Re naik oleh kecepatan tinggi (stenosis, koarktasio), diameter besar, dan viskositas rendah (anemia). Aliran turbulen boros energi (menurunkan tekanan lebih banyak) dan merusak endotel. Klinik: murmur (turbulensi di jantung), bruit (di atas arteri menyempit), murmur fungsional pada anemia, demam, tirotoksikosis (curah tinggi). Pada aorta asenden saat puncak ejeksi Re dapat melebihi 4000 sehingga sedikit turbulensi fisiologis dapat terjadi."
    },
    {
      judul: "5. Hukum Laplace",
      isi: "T = P·r; σ_silinder = P·r/h; σ_bola = P·r/2h. T = tegangan dinding (gaya per satuan panjang), σ = wall stress (gaya per satuan luas), P tekanan transmural, r jari-jari, h tebal dinding. Ventrikel diperkirakan sebagai bola. Aplikasi: kapiler tidak pecah karena r sangat kecil, walau dindingnya tipis. Aneurisma: r ↑ → T ↑ → melebar lagi (lingkaran setan) → ruptur; hipertensi mempercepat. Hipertensi kronis: P ↑ → σ ↑ → hipertrofi konsentrik (h ↑) menormalkan σ. Dilatasi ventrikel (r ↑): σ dan kebutuhan O₂ miokardium naik untuk tekanan sistol yang sama."
    },
    {
      judul: "6. Komplians dan tekanan nadi",
      isi: "Komplians C = ΔV/ΔP. Vena ± 8–24× lebih komplians daripada arteri pada ΔP sama. Arteri besar yang elastis menyimpan sebagian stroke volume saat sistol dan melepaskannya saat diastol (efek Windkessel), sehingga aliran ke jaringan hampir kontinu dan tekanan diastol tidak jatuh ke nol. Tekanan nadi (sistolik − diastolik) ditentukan oleh stroke volume dan komplians arteri: SV ↑ atau komplians ↓ → tekanan nadi ↑. Penuaan membuat aorta kaku → tekanan sistolik naik dan diastolik turun (hipertensi sistolik terisolasi)."
    },
    {
      judul: "7. Tegangan geser dan endotel",
      isi: "Aliran menghasilkan tegangan geser pada endotel (∝ ηQ/r³). Tegangan geser laminar memicu pelepasan NO (vasodilatasi) dan menjaga endotel sehat; aliran turbulen atau osilasi di percabangan arteri dikaitkan dengan lokasi aterosklerosis."
    }
  ],
  korelasi_klinis: [
    "Stenosis arteri: penyempitan diameter 50% menurunkan aliran distal menjadi 6,25% pada ΔP tetap. Pada klinik, vasodilatasi distal mengkompensasi sehingga gejala baru muncul pada stenosis berat (≥ 70% luas penampang).",
    "Aneurisma aorta abdominal: Laplace, risiko ruptur naik dengan diameter dan hipertensi.",
    "Anemia berat: viskositas ↓, Re ↑ → murmur sistolik fungsional; curah jantung ↑ untuk menjaga hantaran O₂.",
    "Polisitemia: viskositas ↑, afterload ↑, risiko trombosis."
  ],
  rangkuman: [
    "Q = ΔP/R; MAP ≈ CO × SVR; SVR dan PVR dihitung dari gradien tekanan per curah.",
    "R ∝ 1/r⁴: jari-jari adalah penentu utama; arteriol mengatur tekanan dan distribusi.",
    "Reynolds menjelaskan murmur dan bruit; Laplace menjelaskan hipertrofi, dilatasi, dan aneurisma."
  ],
  pertanyaan_penuntun: [
    "Mengapa penyempitan 20% pada arteri koroner baru bergejala bila sangat berat?",
    "Bagaimana anemia berat memengaruhi viskositas, Re, SVR, dan curah jantung?",
    "Jelaskan, dengan Laplace, mengapa dilatasi ventrikel menaikkan kebutuhan O₂."
  ],
  bacaan: "Guyton & Hall (bab biofisika tekanan, aliran, dan resistensi); Klabunde (bab hemodinamika vaskular); Costanzo (bab hemodinamika)."
});

window.DATA_PERTEMUAN.push({
  id: 4,
  judul: "Elektrofisiologi Jantung I: Potensial Membran dan Potensial Aksi",
  blok: "Listrik dan Kontraksi",
  ringkasan: "Potensial aksi jantung adalah hasil kerja bergilir kanal ion yang membuka dan menutup menurut tegangan dan waktu; memahami urutan arusnya (Na⁺, K⁺, Ca²⁺) menjelaskan refrakter panjang, EKG, efek elektrolit, dan target obat antiaritmia.",
  tujuan: [
    "Menjelaskan asal potensial membran istirahat dengan persamaan Nernst dan peran kanal K⁺.",
    "Menguraikan fase 0–4 potensial aksi sel ventrikel beserta arus ionnya.",
    "Menjelaskan inaktivasi kanal Na⁺ dan periode refrakter absolut, efektif, relatif.",
    "Menjelaskan faktor penentu kecepatan konduksi.",
    "Menjelaskan mengapa potensial aksi plateau mencegah tetani.",
    "Memprediksi efek hiperkalemia, hipokalemia, dan perubahan kalsium pada potensial aksi."
  ],
  konsep_inti: [
    {
      judul: "1. Gradien ion dan potensial keseimbangan",
      isi: "Persamaan Nernst pada 37 °C: E_ion = 61 log ([ion]ₒ/[ion]ᵢ)/z mV. Untuk K⁺: 61 log (4/140) ≈ −94 mV. Gradien dijaga oleh Na⁺/K⁺-ATPase (3 Na⁺ keluar, 2 K⁺ masuk) dan penukar Na⁺/Ca²⁺.",
      tabel: [{
        judul: "Distribusi ion dan potensial keseimbangan",
        kolom: ["Ion", "Ekstrasel (mM)", "Intrasel (mM)", "Potensial keseimbangan (±)"],
        baris: [
          ["Na⁺", "145", "10–15", "+60 hingga +70 mV"],
          ["K⁺", "4", "140", "−94 mV"],
          ["Ca²⁺", "2", "0,0001 (100 nM)", "+120 mV"],
          ["Cl⁻", "110", "5–15", "−70 hingga −80 mV"]
        ]
      }]
    },
    {
      judul: "2. Potensial istirahat",
      isi: "Membran sel ventrikel terutama permeabel terhadap K⁺ saat istirahat (kanal penyearah masuk I_K1), sehingga potensial istirahat ± −85 hingga −90 mV, dekat E_K. Perubahan [K⁺] ekstrasel mengubah E_K dan potensial istirahat (lihat korelasi klinis)."
    },
    {
      judul: "3. Kanal dan gerbangnya",
      isi: "Kanal Na⁺ (Nav1.5) memiliki gerbang aktivasi (cepat membuka saat depolarisasi) dan gerbang inaktivasi (menutup beberapa milidetik kemudian, baru pulih setelah repolarisasi). Kanal Ca²⁺ tipe-L (Cav1.2) membuka lebih lambat dan inaktivasinya lambat sehingga menahan plateau. Kanal K⁺ ada beberapa jenis: I_K1 (istirahat), I_to (fase 1), I_Kr dan I_Ks (fase 3)."
    },
    {
      judul: "4. Potensial aksi sel ventrikel",
      isi: "Durasi total ± 250–300 ms.",
      tabel: [{
        judul: "Fase potensial aksi ventrikel",
        kolom: ["Fase", "Nama", "Arus utama", "Peristiwa"],
        baris: [
          ["0", "Depolarisasi cepat", "I_Na masuk", "Naik ke ± +20 mV; dV/dt tinggi (± 200 V/detik)"],
          ["1", "Repolarisasi awal", "I_to (K⁺ keluar), Na⁺ menginaktivasi", "Takik singkat"],
          ["2", "Plateau", "I_Ca,L masuk ≈ I_Kr/I_Ks keluar; I_K1 menurun saat depolarisasi", "± 200 ms; sumber Ca²⁺ untuk kontraksi"],
          ["3", "Repolarisasi", "I_Kr, I_Ks, I_K1 keluar", "Kembali ke − 85 mV"],
          ["4", "Istirahat", "I_K1 dominan", "Stabil"]
        ]
      }]
    },
    {
      judul: "5. Periode refrakter",
      isi: "Refrakter efektif (absolut): dari fase 0 hingga ± fase 3 awal. Kanal Na⁺ terinaktivasi; stimulus apa pun tidak dapat memicu potensial aksi yang dapat dihantarkan. Refrakter relatif: fase 3 akhir; stimulus kuat dapat memicu potensial aksi dengan dV/dt dan kecepatan hantar lebih rendah (substrat aritmia). Supernormal: jendela singkat dengan ambang rendah. Karena refrakter hampir sepanjang kontraksi (± 250 ms), stimulus berulang tidak menyatukan kontraksi (tetani tidak mungkin), dan jantung sempat terisi di antara denyut. Pada otot rangka potensial aksi hanya 2–5 ms sehingga tetani dapat terjadi."
    },
    {
      judul: "6. Kecepatan konduksi",
      isi: "Ditentukan oleh (a) kecepatan naik fase 0 (dV/dt maks): makin cepat, makin cepat konduksi; (b) potensial istirahat saat stimulus: bila kurang negatif, sebagian kanal Na⁺ terinaktivasi → dV/dt turun; (c) ukuran dan kapasitansi sel serta resistensi gap junction (diameter besar dan resistensi rendah mempercepat); (d) geometri jaringan. Purkinje cepat (± 1,5–4 m/s) karena diameter besar dan Na⁺ tinggi; nodus AV lambat (± 0,02–0,05 m/s) karena fase 0 bergantung Ca²⁺ dan gap junction sedikit."
    },
    {
      judul: "7. Pengaruh elektrolit",
      isi: "Hiperkalemia: potensial istirahat kurang negatif → inaktivasi kanal Na⁺ → dV/dt dan konduksi turun; repolarisasi lebih cepat. EKG: T runcing tinggi, P mendatar, QRS lebar, gelombang sinus, lalu asistol atau VF. Hipokalemia: I_K1 turun, repolarisasi memanjang, gelombang U, ektopi. Hipokalsemia: plateau memanjang → QT memanjang. Hiperkalsemia: plateau memendek → QT memendek."
    },
    {
      judul: "8. Titik kerja obat (konsep)",
      isi: "Kelas I (blok kanal Na⁺): menurunkan dV/dt dan konduksi; kelas II (penyekat β); kelas III (blok kanal K⁺): memperpanjang repolarisasi dan refrakter; kelas IV (blok kanal Ca²⁺): menurunkan konduksi nodus AV dan kontraktilitas."
    }
  ],
  korelasi_klinis: [
    "Hiperkalemia pada gagal ginjal: dasar terapi darurat membrane stabilization dengan kalsium, lalu menurunkan K⁺ serum.",
    "Sindrom QT panjang (kongenital atau akibat obat/hipokalemia): repolarisasi memanjang → early afterdepolarization → torsades de pointes.",
    "Blok kanal Na⁺ (misalnya anestesi lokal toksik): konduksi melambat, QRS melebar."
  ],
  rangkuman: [
    "Potensial istirahat dekat E_K karena I_K1; fase 0 oleh Na⁺; plateau oleh Ca²⁺ masuk; repolarisasi oleh K⁺ keluar.",
    "Refrakter panjang → tidak ada tetani; refrakter relatif → substrat aritmia.",
    "Konduksi tergantung dV/dt, potensial istirahat, dan gap junction."
  ],
  pertanyaan_penuntun: [
    "Mengapa hiperkalemia memperlambat konduksi walau potensial istirahat mendekati ambang?",
    "Bagaimana pemanjangan fase 2 mengubah interval QT?",
    "Mengapa aksi kanal Na⁺ yang cepat penting di ventrikel tetapi tidak di nodus SA?"
  ],
  bacaan: "Guyton & Hall (bab eksitasi ritmik jantung); Boron & Boulpaep (bab elektrofisiologi jantung); Costanzo (bab potensial aksi jantung); Bers (Nature 2002) untuk kalsium; DiFrancesco (Circ Res 2010) untuk arus funny."
});
window.DATA_PERTEMUAN.push({
  id: 5,
  judul: "Elektrofisiologi Jantung II: Pacemaker, Konduksi, Otonom, dan Aritmogenesis",
  blok: "Listrik dan Kontraksi",
  ringkasan: "Denyut jantung berasal dari sel pacemaker yang berdepolarisasi spontan, merambat melalui jalur konduksi dengan kecepatan yang diatur (lambat di nodus AV, cepat di His–Purkinje), dimodulasi sistem otonom, dan dapat terganggu oleh tiga mekanisme dasar aritmia.",
  tujuan: [
    "Menjelaskan potensial aksi nodus SA dan mekanisme depolarisasi diastolik lambat.",
    "Menguraikan jalur konduksi, kecepatan di tiap segmen, dan makna jeda nodus AV.",
    "Menjelaskan hierarki pacemaker, overdrive suppression, dan escape rhythm.",
    "Menjelaskan efek simpatis dan parasimpatis pada jantung sampai tingkat kanal ion.",
    "Menjelaskan tiga mekanisme dasar aritmia.",
    "Mengaitkan blok konduksi dan gangguan irama dengan temuan klinis."
  ],
  konsep_inti: [
    {
      judul: "1. Potensial aksi nodus SA",
      isi: "Sel nodus tidak punya potensial istirahat stabil: potensial diastolik maksimum ± −60 mV lalu naik perlahan ke ambang ± −40 mV. Fase 4 (depolarisasi diastolik lambat): arus funny I_f (kanal HCN4, Na⁺ masuk saat hiperpolarisasi), disusul I_Ca,T (tipe-T), serta pelepasan Ca²⁺ spontan dari SR yang mengaktifkan penukar Na⁺/Ca²⁺ (konsep \"jam kalsium\" dan \"jam membran\" yang berpasangan). Fase 0: dipicu Ca²⁺ tipe-L (bukan Na⁺) → naik lambat, konduksi lambat. Fase 3: K⁺ keluar (I_Kr). Tidak ada fase 1 dan 2 yang jelas; I_K1 hampir tidak ada."
    },
    {
      judul: "2. Hierarki pacemaker",
      isi: "Nodus SA ± 60–100/menit (denyut istirahat ± 70 karena tonus vagus dominan; frekuensi intrinsik ± 100), nodus AV/junctional ± 40–60/menit, Purkinje/ventrikel ± 20–40/menit. Pacemaker tercepat menekan yang lain (overdrive suppression); bila nodus SA gagal, pacemaker di bawahnya menjadi escape rhythm."
    },
    {
      judul: "3. Jalur dan kecepatan konduksi",
      isi: "Nodus SA → atrium (jalur internodal; berkas Bachmann ke atrium kiri) → nodus AV → berkas His → cabang kanan dan kiri → serat Purkinje → miokardium ventrikel. Septum diaktivasi lebih dulu (kiri ke kanan), lalu apeks, dan terakhir basis, sehingga ejeksi bergerak dari apeks ke arah katup.",
      tabel: [{
        judul: "Kecepatan konduksi tiap segmen",
        kolom: ["Segmen", "Kecepatan", "Makna"],
        baris: [
          ["Atrium", "± 0,3–1 m/s", "Depolarisasi atrium ± 80–100 ms (gelombang P)"],
          ["Nodus AV", "± 0,02–0,05 m/s", "Jeda ± 100 ms: ventrikel sempat terisi oleh sistol atrium; menyaring impuls atrium yang sangat cepat"],
          ["His–Purkinje", "± 1,5–4 m/s", "Aktivasi ventrikel serentak dan sinkron (QRS sempit)"],
          ["Otot ventrikel", "± 0,3–1 m/s", "Aktivasi selesai ± 80–100 ms"]
        ]
      }]
    },
    {
      judul: "4. Pengaruh sistem saraf otonom",
      isi: "Pada istirahat tonus vagus dominan. Pada latihan, kenaikan HR awal dihasilkan oleh penarikan tonus vagus, baru kemudian peningkatan simpatis. Atlet terlatih memiliki tonus vagus tinggi (bradikardia istirahat).",
      tabel: [{
        judul: "Efek simpatis dan parasimpatis",
        kolom: ["Efek", "Simpatis (β₁, noradrenalin)", "Parasimpatis (vagus, M₂, asetilkolin)"],
        baris: [
          ["Mekanisme", "↑ cAMP/PKA → ↑ I_f dan I_Ca,L", "↓ cAMP; membuka kanal K⁺ (I_K,ACh) → hiperpolarisasi; ↓ I_f"],
          ["Frekuensi", "↑ (fase 4 lebih curam)", "↓ (fase 4 lebih landai, MDP lebih negatif)"],
          ["Konduksi AV", "↑ (PR memendek)", "↓ (PR memanjang; blok AV pada tonus ekstrem)"],
          ["Kontraktilitas", "↑", "↓ terutama atrium"],
          ["Relaksasi", "↑ (fosforilasi fosfolamban)", "Minimal"]
        ]
      }]
    },
    {
      judul: "5. Tiga mekanisme dasar aritmia",
      isi: "Otomatisitas abnormal: pacemaker ektopik atau peningkatan otomatisitas (iskemia, katekolamin, hipokalemia). Aktivitas picuan (triggered): early afterdepolarization (repolarisasi memanjang, QT panjang) dan delayed afterdepolarization (kelebihan Ca²⁺ intrasel, misalnya intoksikasi digitalis). Reentri: butuh blok searah, jalur konduksi lambat, dan jaringan yang sudah pulih saat impuls kembali. Jalur aksesori, jaringan parut, dan disrupsi gap junction (iskemia) menyediakan substratnya. Reentri adalah mekanisme fibrilasi atrium, takikardia reentri nodal, dan banyak VT."
    },
    {
      judul: "6. Blok konduksi",
      isi: "Klasifikasi blok AV berdasarkan EKG dan lokasinya.",
      tabel: [{
        judul: "Derajat blok AV",
        kolom: ["Tingkat", "Ciri", "Lokasi dan catatan"],
        baris: [
          ["Blok AV derajat 1", "Interval PR > 200 ms, semua P dihantar", "Nodus AV; sering jinak"],
          ["Derajat 2 Mobitz I", "PR memanjang bertahap lalu satu P tak dihantar", "Biasanya di nodus AV"],
          ["Derajat 2 Mobitz II", "P tak dihantar mendadak tanpa pemanjangan PR", "Infranodal; dapat menjadi blok total"],
          ["Derajat 3 (total)", "P dan QRS tak berhubungan", "Disosiasi AV; escape junctional/ventrikel"]
        ]
      }]
    }
  ],
  korelasi_klinis: [
    "Bradikardia sinus pada atlet (vagal) vs sick sinus syndrome (disfungsi nodus).",
    "Fibrilasi atrium: reentri multipel; nodus AV menyaring sehingga respons ventrikel ireguler; sistol atrium hilang menurunkan pengisian ventrikel ± 20% dan memicu stasis atrium kiri (risiko stroke).",
    "Infark inferior (RCA mengaliri nodus SA/AV): bradikardia dan blok AV.",
    "Digoksin: menambah tonus vagus, memperlambat konduksi AV (konsep); toksisitas memicu DAD.",
    "Defibrilasi: depolarisasi serentak seluruh miokardium sehingga memutus reentri."
  ],
  rangkuman: [
    "Fase 4 nodus SA: I_f, I_Ca,T, dan jam kalsium; fase 0 oleh Ca²⁺.",
    "Nodus AV melambatkan konduksi (jeda PR); His–Purkinje mempercepat aktivasi ventrikel.",
    "Simpatis ↑ I_f dan I_Ca,L; vagus ↑ I_K,ACh dan ↓ cAMP.",
    "Aritmia: otomatisitas, aktivitas picuan, reentri."
  ],
  pertanyaan_penuntun: [
    "Mengapa denyut istirahat lebih rendah daripada frekuensi intrinsik nodus SA?",
    "Apa konsekuensi hemodinamik bila jeda nodus AV hilang pada fibrilasi atrium cepat?",
    "Sebutkan syarat terjadinya reentri dan bagaimana iskemia memenuhinya."
  ],
  bacaan: "Guyton & Hall (bab eksitasi ritmik jantung dan EKG); Boron & Boulpaep (bab elektrofisiologi jantung); DiFrancesco (Circ Res 2010)."
});

window.DATA_PERTEMUAN.push({
  id: 6,
  judul: "Elektrokardiogram (EKG) Dasar",
  blok: "Listrik dan Kontraksi",
  ringkasan: "EKG adalah rekaman penjumlahan vektor listrik jantung dari permukaan tubuh; setiap gelombang dan interval merupakan cerminan peristiwa elektrofisiologi Pertemuan 4–5, sehingga membaca EKG berarti menerapkan fisiologi yang sama secara sistematis.",
  tujuan: [
    "Menjelaskan prinsip pembentukan EKG (dipol, vektor, polaritas defleksi).",
    "Menyebutkan sadapan ekstremitas dan prekordial serta dinding jantung yang dilihat masing-masing.",
    "Mengaitkan gelombang P, kompleks QRS, segmen ST, gelombang T, dan interval dengan peristiwa elektrofisiologi.",
    "Menghitung frekuensi jantung dan menentukan aksis QRS secara kasar.",
    "Membaca EKG normal secara sistematis dan mengenali pola abnormal dasar (aritmia, blok, iskemia, hiperkalemia)."
  ],
  konsep_inti: [
    {
      judul: "1. Prinsip",
      isi: "Sel yang depolarisasi menjadi negatif di luar terhadap sel istirahat sehingga terbentuk dipol; jumlah vektor dipol seluruh miokardium menghasilkan vektor resultan yang berubah tiap milidetik. Elektroda positif merekam defleksi positif bila gelombang depolarisasi bergerak menujunya, negatif bila menjauh, bifasik atau isoelektrik bila tegak lurus. Kertas standar: kecepatan 25 mm/detik dan 10 mm/mV; kotak kecil 1 mm = 0,04 detik, kotak besar 5 mm = 0,2 detik."
    },
    {
      judul: "2. Sadapan",
      isi: "Ekstremitas bipolar I, II, III (segitiga Einthoven; hukum Einthoven: II = I + III) dan unipolar aVR, aVL, aVF; keenamnya membentuk sistem heksaksial pada bidang frontal. Prekordial V1–V6 pada bidang horizontal.",
      tabel: [{
        judul: "Sadapan dan dinding yang dilihat",
        kolom: ["Kelompok sadapan", "Dinding yang dilihat", "Arteri"],
        baris: [
          ["II, III, aVF", "Inferior", "RCA (dominan kanan)"],
          ["V1–V2", "Septum", "LAD"],
          ["V3–V4", "Anterior", "LAD"],
          ["I, aVL, V5–V6", "Lateral", "LCx (dan diagonal LAD)"],
          ["V4R", "Ventrikel kanan", "RCA proksimal"]
        ]
      }]
    },
    {
      judul: "3. Gelombang dan interval",
      isi: "QTc (Bazett) = QT/√RR, cenderung over-koreksi pada frekuensi cepat. Gelombang T searah QRS meski repolarisasi adalah proses berlawanan, karena epikardium repolarisasi lebih dulu daripada endokardium (durasi potensial aksi epikardium lebih pendek), sehingga vektor repolarisasi mirip arah depolarisasi. Repolarisasi atrium tersembunyi dalam QRS.",
      tabel: [{
        judul: "Komponen EKG dan peristiwanya",
        kolom: ["Komponen", "Peristiwa", "Normal dewasa"],
        baris: [
          ["Gelombang P", "Depolarisasi atrium", "< 120 ms; tinggi < 2,5 mm"],
          ["Interval PR", "Konduksi atrium + jeda nodus AV", "120–200 ms"],
          ["Kompleks QRS", "Depolarisasi ventrikel (septum dulu → q kecil di sadapan lateral)", "< 120 ms (biasanya 80–100)"],
          ["Segmen ST", "Plateau (fase 2)", "Isoelektrik"],
          ["Gelombang T", "Repolarisasi ventrikel", "Searah QRS pada kebanyakan sadapan"],
          ["Interval QT", "Seluruh potensial aksi ventrikel", "QTc < 450 ms (pria), < 460 ms (wanita)"]
        ]
      }]
    },
    {
      judul: "4. Pendekatan sistematis",
      isi: "Frekuensi: 300 ÷ jumlah kotak besar antar R–R (atau 1500 ÷ kotak kecil); bila ireguler, hitung QRS dalam 6 detik (30 kotak besar) × 10. Irama: apakah tiap P diikuti QRS? P dari nodus SA (positif di II, negatif di aVR)? R–R teratur? Aksis: normal −30° hingga +90° (QRS positif di I dan aVF). Positif di I dan negatif di aVF → deviasi aksis kiri; negatif di I dan positif di aVF → deviasi aksis kanan. Interval dan gelombang: P, PR, QRS, QT. Hipertrofi atau pembesaran ruang. ST–T: elevasi/depresi, inversi, T runcing."
    },
    {
      judul: "5. Pola abnormal dasar",
      isi: "Pola yang paling sering muncul pada ujian dan klinik.",
      tabel: [{
        judul: "Pola EKG abnormal dan dasar fisiologisnya",
        kolom: ["Pola", "Ciri", "Dasar fisiologis"],
        baris: [
          ["Bradikardia/takikardia sinus", "P normal, HR < 60 / > 100", "Fase 4 nodus SA melambat/mempercepat"],
          ["Fibrilasi atrium", "Tanpa P, R–R ireguler tidak beraturan", "Reentri multipel; nodus AV menyaring"],
          ["Blok AV 1 / 2 / 3", "PR > 200; P tak dihantar; disosiasi", "Konduksi nodus AV atau infranodal terganggu"],
          ["Takikardia ventrikel", "QRS lebar, cepat, teratur", "Fokus atau reentri ventrikel"],
          ["Fibrilasi ventrikel", "Gelombang kacau tanpa QRS", "Tak ada kontraksi efektif: henti jantung"],
          ["Hiperkalemia", "T runcing tinggi, P hilang, QRS lebar", "Potensial istirahat kurang negatif"],
          ["Hipokalemia", "T mendatar, U menonjol, QT tampak panjang", "Repolarisasi memanjang"],
          ["STEMI", "Elevasi ST kontigu, T hiperakut, lalu Q patologis", "Arus injuri transmural"],
          ["NSTE-ACS/iskemia subendokardial", "Depresi ST, T inversi", "Iskemia subendokardium"],
          ["LVH", "Voltase QRS tinggi, ST–T strain", "Massa miokardium ↑"]
        ]
      }]
    }
  ],
  korelasi_klinis: [
    "Elevasi ST di II, III, aVF + bradikardia: pikirkan infark RCA dan lakukan sadapan kanan (V4R).",
    "QT panjang: risiko torsades; cek elektrolit dan obat.",
    "EKG tidak menggantikan klinis: EKG selalu dibaca bersama gejala dan pemeriksaan."
  ],
  rangkuman: [
    "P = depolarisasi atrium; PR = jeda AV; QRS = depolarisasi ventrikel; ST = plateau; T = repolarisasi; QT = durasi potensial aksi ventrikel.",
    "Arah defleksi bergantung pada arah vektor terhadap elektroda; lokasi perubahan ST menunjukkan dinding dan arteri.",
    "Pendekatan sistematis (frekuensi, irama, aksis, interval, hipertrofi, ST–T) mencegah temuan terlewat."
  ],
  pertanyaan_penuntun: [
    "Mengapa PR memanjang tidak mengubah durasi QRS pada blok nodus AV?",
    "Mengapa gelombang T searah QRS?",
    "Bagaimana hiperkalemia mengubah P, QRS, dan T secara berurutan?"
  ],
  bacaan: "Guyton & Hall (bab EKG dan interpretasinya); Boron & Boulpaep; buku praktis EKG kampus Anda untuk latihan membaca rekaman."
});

window.DATA_PERTEMUAN.push({
  id: 7,
  judul: "Kopling Eksitasi–Kontraksi dan Metabolisme Miokardium",
  blok: "Listrik dan Kontraksi",
  ringkasan: "Kontraksi jantung dikendalikan oleh Ca²⁺: sedikit Ca²⁺ dari luar sel memicu pelepasan Ca²⁺ jauh lebih besar dari retikulum sarkoplasma (calcium-induced calcium release, CICR); kekuatan kontraksi ditentukan oleh jumlah Ca²⁺ yang tersedia dan kepekaan miofilamen, sementara relaksasi bergantung pada pengembalian Ca²⁺.",
  tujuan: [
    "Menjelaskan mekanisme filamen geser dan siklus jembatan silang aktin–miosin.",
    "Menjelaskan urutan kopling eksitasi–kontraksi (CICR) dan sumber Ca²⁺.",
    "Menjelaskan mekanisme relaksasi (SERCA2a, NCX, fosfolamban).",
    "Menjelaskan regulasi kontraktilitas oleh stimulasi β-adrenergik, digoksin, dan faktor lain.",
    "Menjelaskan hubungan panjang sarkomer–gaya sebagai dasar seluler Frank–Starling.",
    "Menjelaskan metabolisme energi jantung dan determinan kebutuhan O₂ miokardium."
  ],
  konsep_inti: [
    {
      judul: "1. Aparatus kontraktil",
      isi: "Sarkomer: filamen tipis (aktin + tropomiosin + kompleks troponin I/T/C) dan filamen tebal (miosin). Pada keadaan istirahat tropomiosin menutup situs pengikat miosin pada aktin. Ca²⁺ mengikat troponin C → perubahan konformasi → tropomiosin bergeser → kepala miosin berikatan dengan aktin dan menarik filamen (power stroke) dengan memakai ATP; ATP juga dibutuhkan untuk melepas ikatan (rigor tanpa ATP). Titin memberi kekakuan pasif."
    },
    {
      judul: "2. Urutan kopling eksitasi–kontraksi",
      isi: "Potensial aksi menjalar ke tubulus-T; kanal Ca²⁺ tipe-L (reseptor dihidropiridin, Cav1.2) terbuka pada fase 2. Ca²⁺ masuk (jumlah kecil) mengikat reseptor ryanodin (RyR2) pada SR di dyad → SR melepas Ca²⁺ besar-besaran (CICR). Kadar Ca²⁺ sitosol naik dari ± 100 nM ke ± 1 µM. Sumber pada manusia: ± 70–75% dari SR dan ± 25–30% dari influks sarkolema. Ca²⁺ mengikat troponin C → siklus jembatan silang → kontraksi. Relaksasi: Ca²⁺ dikembalikan oleh SERCA2a ke SR (± 70%) dan penukar Na⁺/Ca²⁺ (NCX, ± 28%); Ca²⁺-ATPase sarkolema dan uniporter mitokondria (± 2%). Fosfolamban menghambat SERCA2a; fosforilasinya oleh PKA melepas hambatan → relaksasi lebih cepat dan SR terisi lebih banyak."
    },
    {
      judul: "3. Beda dengan otot rangka",
      isi: "Pada otot rangka DHPR dan RyR1 terhubung secara mekanis, sehingga tidak butuh Ca²⁺ ekstrasel. Pada jantung kopling kimiawi (CICR) membuat kontraksi bergantung pada Ca²⁺ ekstrasel dan peka terhadap penghambat kanal Ca²⁺."
    },
    {
      judul: "4. Regulasi kontraktilitas pada tingkat sel",
      isi: "Kontraktilitas dapat diubah oleh sinyal, obat, dan kondisi metabolik.",
      tabel: [{
        judul: "Regulasi kontraktilitas sel miokardium",
        kolom: ["Perubahan", "Mekanisme", "Hasil"],
        baris: [
          ["Stimulasi β₁", "cAMP ↑ → PKA → fosforilasi kanal tipe-L, RyR2, fosfolamban", "Ca²⁺ transien ↑, inotropik dan lusitropik ↑"],
          ["Digoksin", "Hambat Na⁺/K⁺-ATPase → Na⁺ intrasel ↑ → NCX mengeluarkan Ca²⁺ lebih sedikit", "Ca²⁺ SR ↑, inotropik ↑"],
          ["Penghambat kanal Ca²⁺", "Influks Ca²⁺ ↓", "Inotropik ↓, konduksi AV ↓ (verapamil, diltiazem)"],
          ["Asidosis, hipoksia", "Ca²⁺ ↓ dan kepekaan troponin ↓", "Kontraktilitas ↓"],
          ["Peregangan sarkomer", "Kepekaan troponin C terhadap Ca²⁺ ↑; jarak antar filamen ↓", "Gaya ↑ (Frank–Starling)"],
          ["Frekuensi ↑ (efek tangga Bowditch)", "Ca²⁺ SR ↑", "Kontraktilitas ↑ pada rentang tertentu"]
        ]
      }]
    },
    {
      judul: "5. Hubungan panjang–gaya",
      isi: "Panjang sarkomer optimum ± 2,2 µm. Kurva pasif otot jantung curam karena titin, sehingga sarkomer hampir tak melewati ± 2,3 µm in vivo; ini melindungi jantung dari peregangan berlebih dan menjadi dasar seluler hukum Frank–Starling (Pertemuan 11)."
    },
    {
      judul: "6. Metabolisme dan kebutuhan O₂",
      isi: "Jantung hampir seluruhnya aerob. Bahan bakar istirahat: asam lemak (± 60–70%), ditambah glukosa dan laktat (lebih besar saat latihan). Fosfokreatin menyangga ATP jangka pendek. Ekstraksi O₂ ± 70–75% pada istirahat (saturasi sinus koronarius ± 25–30%), sehingga kenaikan kebutuhan O₂ harus dipenuhi dengan kenaikan aliran koroner (Pertemuan 14). Determinan konsumsi O₂ miokardium (MVO₂): wall stress (beban tekanan jauh lebih mahal daripada beban volume), frekuensi jantung, dan kontraktilitas. Indeks klinis sederhana: rate–pressure product (HR × tekanan sistolik). Iskemia: ATP ↓ → pompa ion gagal (Na⁺ dan Ca²⁺ intrasel ↑) → kontraktilitas ↓, aritmia, lalu nekrosis; troponin I/T bocor ke darah sebagai penanda kerusakan."
    }
  ],
  korelasi_klinis: [
    "Penyekat β: menurunkan cAMP dan Ca²⁺ transien, menurunkan HR, kontraktilitas, dan MVO₂ (konsep).",
    "Digoksin: inotropik positif lewat Na⁺/K⁺-ATPase; intoksikasi memicu aritmia akibat DAD.",
    "Hipoksia dan asidosis pada syok: kontraktilitas menurun sehingga syok memburuk.",
    "Troponin meningkat pada nekrosis miokard (infark), juga pada emboli paru, miokarditis, gagal ginjal."
  ],
  rangkuman: [
    "Ca²⁺ tipe-L memicu CICR; SERCA2a dan NCX mengembalikan Ca²⁺ untuk relaksasi.",
    "Stimulasi β menaikkan inotropik dan lusitropik via PKA; digoksin menaikkan Ca²⁺ via Na⁺/K⁺-ATPase.",
    "Ekstraksi O₂ jantung tinggi: suplai O₂ hanya dapat naik lewat aliran koroner."
  ],
  pertanyaan_penuntun: [
    "Mengapa otot jantung berhenti berkontraksi bila Ca²⁺ ekstrasel dibuang, sedangkan otot rangka tidak?",
    "Mengapa stimulasi β mempercepat relaksasi?",
    "Mengapa beban tekanan lebih mahal O₂ daripada beban volume?"
  ],
  bacaan: "Bers (Nature 2002); Guyton & Hall (bab otot jantung); Boron & Boulpaep (bab kontraktilitas jantung); Klabunde."
});
window.DATA_PERTEMUAN.push({
  id: 8,
  judul: "Integrasi Bagian I dan Evaluasi Tengah Semester",
  blok: "Integrasi",
  label_integrasi: true,
  ringkasan: "Pertemuan ini menyatukan Pertemuan 1–7 menjadi satu alur: dari impuls di nodus SA, melalui jalur konduksi dan EKG, ke kontraksi sel, hingga tekanan dan aliran yang dapat diukur. Tujuannya memastikan pondasi (struktur, hemodinamika, listrik, kontraksi) kokoh sebelum masuk ke siklus dan regulasi pompa.",
  tujuan: [
    "Menyusun urutan peristiwa satu denyut dari impuls nodus SA sampai ejeksi darah.",
    "Menghubungkan tiap peristiwa listrik dengan gelombang EKG dan peristiwa mekanik.",
    "Menerapkan konsep Pertemuan 1–7 untuk menganalisis satu kasus klinis.",
    "Mengidentifikasi kesenjangan pemahaman melalui daftar periksa."
  ],
  konsep_inti: [
    {
      judul: "Konsep inti: dari satu sel ke satu denyut",
      isi: "Hubungan sebab–akibat kunci: listrik mendahului mekanik (EKG sebelum kenaikan tekanan); plateau menunda repolarisasi sehingga refrakter mencakup kontraksi; jeda AV memberi waktu bagi pengisian; arteriol mengatur tekanan di hilir (Pertemuan 3).",
      tabel: [{
        judul: "Urutan peristiwa satu denyut",
        kolom: ["Urutan", "Peristiwa listrik/seluler", "EKG", "Peristiwa mekanik", "Pertemuan terkait"],
        baris: [
          ["1", "Depolarisasi spontan nodus SA (I_f, I_Ca,T, jam kalsium)", "Tidak terlihat", "Belum ada", "5"],
          ["2", "Depolarisasi atrium via jalur internodal dan Bachmann", "Gelombang P", "Sistol atrium dimulai", "5, 6"],
          ["3", "Jeda di nodus AV (konduksi lambat)", "Interval PR", "Atrium mengisi ventrikel (kontribusi ± 20%)", "5"],
          ["4", "His–Purkinje → aktivasi ventrikel serentak", "Kompleks QRS", "Awal kontraksi isovolumetrik", "4, 5, 6"],
          ["5", "Na⁺ masuk (fase 0), lalu Ca²⁺ tipe-L (fase 2)", "Segmen ST (plateau)", "CICR → kontraksi; tekanan > aorta → ejeksi", "4, 7"],
          ["6", "Repolarisasi ventrikel (K⁺ keluar)", "Gelombang T", "Relaksasi: SERCA2a dan NCX mengembalikan Ca²⁺", "4, 7"],
          ["7", "Refrakter berakhir; diastol", "Segmen T–P", "Pengisian ventrikel; aliran koroner puncak", "9, 14"]
        ]
      }]
    },
    {
      judul: "Contoh integrasi",
      isi: "Pasien 70 tahun, bradikardia 38/menit, pusing, PR memanjang lalu P tak dihantar berulang di EKG (Mobitz), tekanan darah 90/55. Mekanisme: konduksi nodus AV terganggu (Pertemuan 5, 6) → frekuensi ventrikel turun. Hemodinamika: CO = HR × SV; HR turun sementara SV tidak dapat naik cukup → CO ↓ → MAP ≈ CO × SVR ↓ (Pertemuan 3). Gejala: perfusi otak ↓ → pusing/sinkop. Penyebab yang dipikirkan: iskemia (RCA mengaliri nodus AV), fibrosis degeneratif, obat yang memperlambat konduksi AV, hiperkalemia."
    },
    {
      judul: "Kesalahan konsep yang sering terjadi",
      isi: "1) Mengira potensial aksi sel nodus sama dengan sel ventrikel (fase 0 nodus oleh Ca²⁺, bukan Na⁺). 2) Menyamakan \"tekanan tinggi\" dengan \"resistensi tinggi\" tanpa melihat curah jantung (MAP = CO × SVR). 3) Menganggap Re > 2000 berarti pasti turbulen (zona transisi, bergantung geometri). 4) Mencampur tegangan dinding (T = P·r) dengan wall stress (σ = P·r/2h). 5) Mengira kontraksi otot jantung dapat tetani seperti otot rangka."
    },
    {
      judul: "Daftar periksa mandiri (jawab tanpa membuka materi)",
      isi: "1) Gambar potensial aksi sel ventrikel dan sel nodus SA dengan arus ion tiap fase. 2) Jelaskan urutan CICR dan tiga jalur pengembalian Ca²⁺. 3) Hitung R bila r turun 25%; hitung MAP dari 140/85; hitung SVR dari data. 4) Sebutkan lima komponen jalur konduksi dan kecepatan masing-masing. 5) Baca EKG normal: frekuensi, irama, aksis, interval. 6) Jelaskan mengapa hiperkalemia mengubah EKG."
    },
    {
      judul: "Evaluasi tengah semester",
      isi: "Cakupan: Pertemuan 1–7. Bentuk yang disarankan: soal pilihan ganda penalaran, esai singkat, dan satu kasus. Contoh soal tersedia di dokumen Bank Soal (bagian Pertemuan 1–7, esai, dan kasus). Bobot topik yang disarankan: hemodinamika dan organisasi sirkulasi (± 25%), elektrofisiologi dan EKG (± 45%), kopling eksitasi–kontraksi dan metabolisme (± 20%), integrasi kasus (± 10%)."
    }
  ],
  korelasi_klinis: [
    "Blok AV total: frekuensi ventrikel sangat lambat; CO turun; pasien tetap hidup karena escape rhythm dari pacemaker bawahan.",
    "Kesalahan mencampur tekanan dan resistensi: hipertensi dengan CO normal berarti SVR tinggi, bukan curah tinggi."
  ],
  rangkuman: [
    "Satu denyut = rangkaian listrik → kalsium → kontraksi → tekanan → aliran.",
    "Kesalahan konsep paling umum berasal dari mencampur nodus dan ventrikel, serta tekanan dan resistensi."
  ],
  pertanyaan_penuntun: [
    "Tuliskan urutan dari depolarisasi nodus SA sampai pembukaan katup aorta lengkap dengan pembuktian dari EKG.",
    "Bagaimana blok AV total memengaruhi curah jantung, dan mengapa pasien tetap hidup?"
  ],
  bacaan: "Ulang bab-bab Pertemuan 1–7; buat peta konsep satu halaman."
});

window.DATA_PERTEMUAN.push({
  id: 9,
  judul: "Siklus Jantung I: Fase, Tekanan, dan Volume",
  blok: "Pompa",
  ringkasan: "Siklus jantung adalah urutan peristiwa listrik, tekanan, volume, dan katup dalam satu denyut; katup membuka dan menutup semata-mata karena perbedaan tekanan, sehingga kurva Wiggers dapat ditelusuri dengan satu pertanyaan sederhana: tekanan mana yang lebih besar saat ini?",
  tujuan: [
    "Menyebutkan tujuh fase siklus jantung dan status katup pada tiap fase.",
    "Menjelaskan perubahan tekanan atrium, ventrikel kiri, aorta, dan volume ventrikel sepanjang siklus (diagram Wiggers).",
    "Menghitung stroke volume, fraksi ejeksi, dan curah jantung dari data volume.",
    "Menjelaskan pengaruh frekuensi jantung terhadap durasi sistol dan diastol.",
    "Menjelaskan perbedaan tekanan jantung kiri dan kanan serta kontribusi sistol atrium.",
    "Menghubungkan siklus jantung dengan EKG dan aliran koroner."
  ],
  konsep_inti: [
    {
      judul: "1. Nilai dasar ventrikel kiri (dewasa, istirahat)",
      isi: "Contoh: EDV 130, ESV 55 → SV 75 mL, EF 58%; pada HR 72/menit CO = 5,4 L/menit.",
      tabel: [{
        judul: "Nilai dasar ventrikel kiri",
        kolom: ["Besaran", "Nilai"],
        baris: [
          ["Frekuensi", "± 60–100/menit (siklus ± 0,8 detik pada 75/menit)"],
          ["Sistol : diastol", "± 0,3 : 0,5 detik pada 75/menit"],
          ["EDV", "± 120 mL (kisaran ± 100–150)"],
          ["ESV", "± 50 mL"],
          ["Stroke volume (SV = EDV − ESV)", "± 70 mL"],
          ["Fraksi ejeksi (EF = SV/EDV)", "± 55–70%"],
          ["Tekanan puncak sistol / LVEDP", "± 120 mmHg / ± 5–12 mmHg"]
        ]
      }]
    },
    {
      judul: "2. Tekanan di tiap ruang (mmHg, perkiraan)",
      isi: "Perbedaan tekanan antar ruang menentukan arah aliran dan status katup.",
      tabel: [{
        judul: "Tekanan normal tiap ruang jantung",
        kolom: ["Ruang", "Tekanan"],
        baris: [
          ["Atrium kanan", "0–5 (rerata)"],
          ["Ventrikel kanan", "25 sistolik / 0–5 diastolik"],
          ["Arteri pulmonalis", "25 / 8–10, rerata ± 15"],
          ["Atrium kiri", "5–12 (rerata, mendekati PCWP)"],
          ["Ventrikel kiri", "120 / 0–10"],
          ["Aorta", "120 / 80, rerata ± 93"]
        ]
      }]
    },
    {
      judul: "3. Tujuh fase",
      isi: "Kunci penalaran: sebuah katup membuka bila tekanan hulu > hilir dan menutup bila terbalik. Dua fase isovolumetrik adalah satu-satunya saat kedua katup (mitral dan aorta) tertutup, dan di situ tekanan berubah paling cepat (dP/dt).",
      tabel: [{
        judul: "Tujuh fase siklus jantung",
        kolom: ["Fase", "Mitral / aorta", "Peristiwa", "Catatan"],
        baris: [
          ["1. Sistol atrium", "Terbuka / tertutup", "Setelah gelombang P; atrium menambah ± 20% pengisian", "Hilang pada fibrilasi atrium; lebih penting pada ventrikel kaku (30–40%)"],
          ["2. Kontraksi isovolumetrik", "Menutup / tertutup", "Mulai QRS; tekanan ventrikel naik tanpa perubahan volume sampai > tekanan aorta (± 80)", "S1"],
          ["3. Ejeksi cepat", "Tertutup / terbuka", "± 70% SV keluar pada sepertiga awal; tekanan puncak", "T mulai di akhir"],
          ["4. Ejeksi lambat", "Tertutup / terbuka", "Aliran menurun; tekanan ventrikel turun", ""],
          ["5. Relaksasi isovolumetrik", "Tertutup / menutup", "Tekanan turun cepat tanpa perubahan volume", "S2; takik dikrotik (inzisura) pada kurva aorta"],
          ["6. Pengisian cepat", "Terbuka / tertutup", "Tekanan ventrikel < atrium; ± 70–80% pengisian pasif", "S3 (fisiologis pada anak)"],
          ["7. Diastasis", "Terbuka / tertutup", "Pengisian lambat", "Hilang saat frekuensi tinggi"]
        ]
      }]
    },
    {
      judul: "4. Membaca kurva Wiggers",
      isi: "Telusuri dari kiri: (a) EKG P → kenaikan kecil tekanan atrium (gelombang a) → volume ventrikel naik sedikit; (b) QRS → tekanan ventrikel naik tajam, volume tetap → mitral menutup (S1); (c) tekanan ventrikel melebihi aorta → katup aorta terbuka, tekanan aorta naik, volume ventrikel turun; (d) gelombang T → ejeksi melemah; tekanan ventrikel jatuh di bawah aorta → katup aorta menutup (S2, inzisura); (e) tekanan ventrikel turun di bawah tekanan atrium → mitral terbuka, volume naik cepat. Tekanan aorta turun perlahan selama diastol karena darah mengalir ke perifer."
    },
    {
      judul: "5. Pengaruh frekuensi jantung",
      isi: "Pada frekuensi naik, siklus memendek dan terutama diastol yang memendek (sistol relatif tetap). Akibat: waktu pengisian ventrikel turun, aliran koroner (terutama diastol) berkurang; pada HR sangat tinggi (> ± 150/menit) SV dan CO menurun. Karena itu takikardia ekstrem berbahaya pada stenosis mitral dan penyakit koroner."
    },
    {
      judul: "6. Jantung kanan vs kiri",
      isi: "Pola fase sama, tetapi tekanan sistol RV ± 25 mmHg sehingga fase isovolumetrik sangat singkat, ejeksi lebih lama, dan aliran koroner RV berlangsung baik saat sistol maupun diastol. Katup pulmonal menutup sedikit setelah aorta saat inspirasi (S2 terpisah, Pertemuan 10)."
    },
    {
      judul: "7. Hubungan dengan aliran koroner",
      isi: "Aliran koroner ventrikel kiri terutama saat diastol (kompresi ekstravaskular saat sistol), sehingga lamanya diastol dan tekanan diastol aorta menentukan perfusi miokardium (Pertemuan 14)."
    }
  ],
  korelasi_klinis: [
    "Fibrilasi atrium: hilangnya sistol atrium menurunkan pengisian; gejala lebih berat pada stenosis mitral atau ventrikel kaku.",
    "Takikardia ekstrem: diastol memendek, SV dan perfusi koroner turun.",
    "Gagal jantung sistolik: EF turun (ESV naik); diastolik: EF normal dengan tekanan pengisian tinggi.",
    "Gelombang tekanan atrium (gelombang a besar pada stenosis trikuspid; gelombang v besar pada regurgitasi trikuspid atau mitral)."
  ],
  rangkuman: [
    "Katup mengikuti gradien tekanan; ada dua fase isovolumetrik tempat kedua katup tertutup.",
    "Nilai pokok LV: EDV ± 120, ESV ± 50, SV ± 70, EF 55–70%.",
    "Frekuensi naik terutama memendekkan diastol, mengurangi pengisian dan perfusi koroner."
  ],
  pertanyaan_penuntun: [
    "Mengapa tekanan aorta tidak jatuh ke nol selama diastol?",
    "Mengapa pengisian ventrikel pada fibrilasi atrium turun ± 20% dan siapa yang paling terdampak?",
    "Telusuri satu denyut pada kurva Wiggers dan tandai kapan setiap katup membuka dan menutup."
  ],
  bacaan: "Guyton & Hall (bab jantung sebagai pompa); Costanzo (bab siklus jantung); Klabunde (bab siklus jantung)."
});

window.DATA_PERTEMUAN.push({
  id: 10,
  judul: "Siklus Jantung II: Bunyi Jantung, Murmur, dan Gelombang Vena Jugularis",
  blok: "Pompa",
  ringkasan: "Bunyi dan murmur adalah \"suara\" hemodinamika: penutupan katup menghasilkan bunyi jantung, aliran turbulen menghasilkan murmur, dan gelombang JVP mencerminkan tekanan atrium kanan sepanjang siklus; membacanya berarti menerapkan fase siklus jantung dan Reynolds pada pasien.",
  tujuan: [
    "Menjelaskan asal bunyi jantung S1–S4 dan lokasi auskultasi.",
    "Menjelaskan pemisahan S2 fisiologis dan kelainan pemisahan.",
    "Menjelaskan mekanisme murmur dan membedakan murmur sistolik dan diastolik berdasarkan lesi katup.",
    "Menjelaskan komponen gelombang JVP dan nadi arteri.",
    "Memprediksi pengaruh manuver (inspirasi, Valsalva, jongkok) terhadap murmur."
  ],
  konsep_inti: [
    {
      judul: "1. Bunyi jantung",
      isi: "Tempat auskultasi (proyeksi): aorta (sela iga 2 kanan), pulmonal (sela iga 2 kiri), trikuspid (tepi kiri sternum bawah), mitral/apeks (sela iga 5 garis midklavikula kiri).",
      tabel: [{
        judul: "Bunyi jantung S1–S4",
        kolom: ["Bunyi", "Asal", "Catatan"],
        baris: [
          ["S1", "Penutupan katup mitral dan trikuspid (awal sistol)", "Keras pada stenosis mitral awal; lemah pada regurgitasi mitral dan PR panjang"],
          ["S2", "Penutupan katup aorta (A2) dan pulmonal (P2) (awal diastol)", "A2 lebih keras; melemah pada stenosis aorta"],
          ["S3", "Pengisian cepat ventrikel yang mengenai dinding ventrikel dilatasi/volume berlebih", "Fisiologis pada anak dan dewasa muda; patologis pada gagal jantung, regurgitasi mitral"],
          ["S4", "Sistol atrium melawan ventrikel kaku", "Selalu patologis pada dewasa (hipertrofi, iskemia); hilang pada fibrilasi atrium"]
        ]
      }]
    },
    {
      judul: "2. Pemisahan S2",
      isi: "Inspirasi menurunkan tekanan intratoraks → venous return ke jantung kanan naik → ejeksi RV memanjang → P2 tertunda → S2 terpisah (A2 lalu P2) pada inspirasi (fisiologis). Wide split: blok cabang berkas kanan, stenosis pulmonal. Fixed split (tak berubah dengan respirasi): defek septum atrium. Paradoxical split (terpisah saat ekspirasi): blok cabang berkas kiri, stenosis aorta berat."
    },
    {
      judul: "3. Murmur",
      isi: "Dihasilkan aliran turbulen (Re tinggi) melewati katup stenotik, katup yang bocor, atau aliran volume besar. Ditandai dengan waktu (sistolik, diastolik), bentuk, lokasi, penjalaran, intensitas (skala Levine 1–6), dan perubahan dengan manuver. Prinsip: murmur sistolik muncul antara S1 dan S2; diastolik antara S2 dan S1.",
      tabel: [{
        judul: "Murmur pada lesi katup",
        kolom: ["Lesi", "Waktu", "Karakter dan lokasi", "Mekanisme"],
        baris: [
          ["Stenosis aorta", "Sistolik", "Crescendo–decrescendo kasar, area aorta, menjalar ke karotis", "Aliran turbulen melintasi katup sempit; LVH konsentrik"],
          ["Regurgitasi mitral", "Sistolik", "Holosistolik, apeks, menjalar ke aksila", "Darah kembali ke atrium kiri sepanjang sistol"],
          ["Stenosis mitral", "Diastolik", "Opening snap lalu rumbling di apeks", "Gradien atrium kiri–ventrikel kiri saat diastol"],
          ["Regurgitasi aorta", "Diastolik", "Decrescendo nada tinggi, tepi kiri sternum; tekanan nadi lebar", "Aliran balik aorta ke ventrikel"],
          ["Defek septum ventrikel", "Sistolik", "Holosistolik, tepi kiri sternum bawah", "Pirau kiri ke kanan"],
          ["Murmur fungsional/aliran", "Sistolik", "Lembut, tanpa kelainan struktur", "Curah tinggi (anemia, demam, kehamilan, anak)"]
        ]
      }]
    },
    {
      judul: "4. Manuver",
      isi: "Perubahan preload dan afterload membedakan lesi.",
      tabel: [{
        judul: "Pengaruh manuver pada murmur",
        kolom: ["Manuver", "Perubahan fisiologis", "Efek pada murmur"],
        baris: [
          ["Inspirasi", "Venous return ke jantung kanan ↑", "Murmur sisi kanan lebih keras (tanda Carvallo)"],
          ["Valsalva (fase tekanan)", "Venous return ↓, preload ↓", "Kebanyakan murmur melemah; HOCM dan prolaps mitral lebih keras"],
          ["Jongkok / angkat kaki", "Venous return ↑, afterload ↑", "Kebanyakan murmur keras; HOCM melemah"],
          ["Genggam tangan (handgrip)", "Afterload ↑", "Regurgitasi mitral dan aorta lebih keras; stenosis aorta dan HOCM melemah"]
        ]
      }]
    },
    {
      judul: "5. Gelombang JVP",
      isi: "JVP > 3–4 cm di atas sudut sternum (pada 45°) menandakan tekanan atrium kanan tinggi (gagal jantung kanan, overload cairan, tamponade).",
      tabel: [{
        judul: "Komponen gelombang vena jugularis",
        kolom: ["Gelombang", "Penyebab", "Klinik"],
        baris: [
          ["a", "Sistol atrium", "Hilang pada fibrilasi atrium; raksasa pada stenosis trikuspid, hipertensi pulmonal, blok AV (cannon a)"],
          ["c", "Tonjolan trikuspid saat kontraksi isovolumetrik", ""],
          ["x (descent)", "Relaksasi atrium dan tarikan dasar jantung ke bawah", "Hilang pada regurgitasi trikuspid"],
          ["v", "Pengisian pasif atrium saat trikuspid masih tertutup", "Raksasa pada regurgitasi trikuspid"],
          ["y (descent)", "Trikuspid terbuka", "Curam pada konstriksi perikardium; landai pada tamponade dan stenosis trikuspid"]
        ]
      }]
    },
    {
      judul: "6. Nadi arteri",
      isi: "Gelombang nadi mencerminkan SV, komplians, dan afterload: parvus et tardus (stenosis aorta), water-hammer atau collapsing (regurgitasi aorta), bisferiens (regurgitasi aorta dengan stenosis atau HOCM), pulsus alternans (gagal jantung berat), pulsus paradoxus (penurunan sistolik > 10 mmHg saat inspirasi; tamponade, asma berat)."
    }
  ],
  korelasi_klinis: [
    "Stenosis aorta: murmur ejeksi kasar, S2 melemah, nadi parvus et tardus; angina, sinkop, dispnea.",
    "Regurgitasi aorta: murmur diastolik, tekanan nadi lebar, nadi water-hammer.",
    "Tamponade: bunyi jantung menjauh, JVP tinggi, hipotensi (trias Beck), pulsus paradoxus.",
    "Gagal jantung: S3, JVP naik, refleks hepatojugular."
  ],
  rangkuman: [
    "S1 dan S2 menandai awal sistol dan diastol; S3 dan S4 menandakan pengisian dan kekakuan ventrikel.",
    "Waktu murmur (sistolik atau diastolik) menunjuk katup mana yang bermasalah.",
    "Manuver mengubah preload dan afterload sehingga membedakan lesi.",
    "Gelombang JVP mencerminkan peristiwa atrium kanan sepanjang siklus."
  ],
  pertanyaan_penuntun: [
    "Mengapa S2 terpisah pada inspirasi, dan apa artinya bila terpisah menetap?",
    "Bagaimana Valsalva mengubah murmur HOCM? Jelaskan dengan preload dan ukuran ventrikel.",
    "Mengapa gelombang a hilang pada fibrilasi atrium?"
  ],
  bacaan: "Guyton & Hall (bab katup dan bunyi jantung); Klabunde; buku praktis pemeriksaan fisik jantung kampus Anda."
});
window.DATA_PERTEMUAN.push({
  id: 11,
  judul: "Mekanika Ventrikel: Preload, Afterload, Kontraktilitas, Frank–Starling, dan Loop P–V",
  blok: "Regulasi dan Adaptasi",
  ringkasan: "Stroke volume ditentukan oleh tiga faktor yang dapat dipisahkan secara konsep: preload (seberapa terisi), afterload (seberapa berat melawan beban), dan kontraktilitas (seberapa kuat otot pada kondisi beban tertentu); pemisahan ini adalah alat berpikir utama untuk gagal jantung, syok, dan farmakologi kardiovaskular.",
  tujuan: [
    "Mendefinisikan preload, afterload, dan kontraktilitas dan faktor penentu masing-masing.",
    "Menjelaskan hukum Frank–Starling, dasar selulernya, dan maknanya.",
    "Menggambar dan menafsirkan loop tekanan–volume ventrikel kiri.",
    "Memprediksi perubahan loop P–V pada perubahan preload, afterload, dan kontraktilitas.",
    "Menjelaskan konsep kerja jantung dan determinan kebutuhan O₂.",
    "Menjelaskan remodeling konsentrik dan eksentrik dengan Hukum Laplace."
  ],
  konsep_inti: [
    {
      judul: "1. Definisi",
      isi: "Tiga faktor penentu stroke volume dan penandanya di klinik.",
      tabel: [{
        judul: "Preload, afterload, dan kontraktilitas",
        kolom: ["Faktor", "Definisi", "Penanda klinis", "Penentu"],
        baris: [
          ["Preload", "Tegangan dinding/panjang sarkomer pada akhir diastol (EDV)", "LVEDP, PCWP, CVP", "Venous return, volume darah, tonus vena, sistol atrium, komplians ventrikel, tekanan intratoraks"],
          ["Afterload", "Wall stress selama ejeksi (σ = P·r/2h)", "Tekanan aorta, SVR; stenosis aorta", "Tekanan arteri, SVR, komplians aorta, radius dan tebal dinding ventrikel"],
          ["Kontraktilitas", "Kemampuan menghasilkan gaya pada preload dan afterload tetap", "EF, dP/dt maks, kemiringan ESPVR (E_es)", "Ca²⁺ intrasel, kepekaan miofilamen, simpatis, obat inotropik, iskemia"]
        ]
      }]
    },
    {
      judul: "2. Hukum Frank–Starling",
      isi: "Semakin besar pengisian diastolik, semakin besar SV pada kontraktilitas dan afterload sama. Dasar selulernya: panjang sarkomer ↑ → kepekaan troponin C ↑ dan jarak antar filamen ↓ (Pertemuan 7). Fungsi: (a) menyamakan curah ventrikel kanan dan kiri denyut demi denyut, (b) menyesuaikan curah dengan venous return tanpa saraf, (c) menjaga keseimbangan saat perubahan postur dan respirasi. Kurva fungsi ventrikel (SV atau CO terhadap preload): inotropik ↑ menggeser kurva ke atas dan kiri; inotropik ↓ (gagal jantung sistolik) ke bawah dan kanan, dan mendatar pada preload tinggi (tekanan pengisian naik tanpa tambahan SV). Fenomena terkait: efek Anrep (SV dipertahankan saat afterload naik mendadak karena kontraktilitas meningkat) dan efek tangga Bowditch (kontraktilitas naik pada frekuensi lebih tinggi)."
    },
    {
      judul: "3. Loop P–V ventrikel kiri",
      isi: "Sumbu x volume, sumbu y tekanan; siklus berjalan berlawanan arah jarum jam. Lebar loop = SV; luas loop = stroke work (≈ SV × tekanan rata-rata ejeksi). Dua garis acuan: ESPVR (hubungan tekanan–volume akhir sistol, kira-kira linear; kemiringan = E_es adalah ukuran kontraktilitas yang relatif bebas beban) dan EDPVR (hubungan tekanan–volume akhir diastol; kurva pasif, naik curam pada volume besar).",
      tabel: [{
        judul: "Segmen loop tekanan–volume",
        kolom: ["Titik/segmen", "Peristiwa"],
        baris: [
          ["Titik 1", "Mitral menutup; volume = EDV (± 120 mL), tekanan = LVEDP"],
          ["1→2", "Kontraksi isovolumetrik"],
          ["Titik 2", "Katup aorta membuka (tekanan = tekanan diastol aorta)"],
          ["2→3", "Ejeksi (volume turun ke ESV ± 50 mL); puncak = tekanan sistol"],
          ["Titik 3", "Katup aorta menutup"],
          ["3→4", "Relaksasi isovolumetrik"],
          ["Titik 4", "Mitral membuka"],
          ["4→1", "Pengisian diastolik"]
        ]
      }, {
        judul: "Perubahan loop P–V",
        kolom: ["Perubahan", "Bentuk loop", "EDV", "ESV", "SV", "Contoh"],
        baris: [
          ["Preload ↑", "Melebar ke kanan", "↑", "sama", "↑", "Infus cairan, regurgitasi aorta"],
          ["Preload ↓", "Menyempit dari kanan", "↓", "sama", "↓", "Perdarahan, venodilatasi"],
          ["Afterload ↑", "Lebih tinggi, lebih sempit", "sama/↑", "↑", "↓", "Hipertensi, stenosis aorta"],
          ["Kontraktilitas ↑", "Titik 3 ke kiri", "sama", "↓", "↑", "Simpatis, dobutamin"],
          ["Kontraktilitas ↓", "Titik 3 ke kanan", "sama/↑", "↑", "↓", "Gagal jantung sistolik, iskemia"]
        ]
      }]
    },
    {
      judul: "4. Kerja jantung dan kebutuhan O₂",
      isi: "Stroke work ≈ SV × MAP; MVO₂ ∝ wall stress × HR × kontraktilitas. Beban tekanan menghabiskan lebih banyak O₂ daripada beban volume pada kerja yang sama karena wall stress tinggi; dilatasi (r ↑) juga menaikkan MVO₂ lewat Laplace."
    },
    {
      judul: "5. Remodeling",
      isi: "Beban tekanan (hipertensi, stenosis aorta): sarkomer ditambah paralel → hipertrofi konsentrik (h ↑, r tetap) → σ normal kembali, tetapi dinding kaku (HFpEF) dan MVO₂ ↑. Beban volume (regurgitasi, anemia kronis, atlet ketahanan): sarkomer ditambah seri → hipertrofi eksentrik (r ↑, h ↑). Bila berlebihan (patologis), dilatasi melebihi penebalan sehingga σ naik dan terjadi gagal jantung sistolik. Pemicu remodeling patologis: aktivasi simpatis dan RAA (Pertemuan 13, 15)."
    },
    {
      judul: "6. Ventrikel kanan",
      isi: "Berdinding tipis, bekerja pada resistensi rendah, dan lebih sensitif terhadap kenaikan afterload (hipertensi pulmonal, emboli paru) daripada preload. Septum menghubungkan kedua ventrikel (interdependensi): dilatasi RV menekan LV dan menurunkan pengisiannya."
    },
    {
      judul: "7. Keterbatasan EF",
      isi: "EF = SV/EDV bergantung pada preload dan afterload; EF \"normal\" tidak menjamin kontraktilitas normal (misalnya regurgitasi mitral: sebagian volume bocor ke atrium kiri tekanan rendah sehingga EF tampak tinggi)."
    }
  ],
  korelasi_klinis: [
    "Diuretik pada HFrEF: bagian mendatar kurva; preload turun mengurangi kongesti tanpa menurunkan SV banyak. Pada hipovolemia (bagian curam kurva) penurunan preload menurunkan SV dan tekanan.",
    "Vasodilator (menurunkan afterload): meningkatkan SV pada gagal jantung sistolik.",
    "Inotropik (dobutamin): menaikkan kontraktilitas, tetapi menaikkan MVO₂.",
    "Stenosis aorta: beban tekanan → konsentrik; regurgitasi aorta: beban volume → eksentrik."
  ],
  rangkuman: [
    "Preload = pengisian; afterload = wall stress saat ejeksi; kontraktilitas = kekuatan intrinsik.",
    "Preload ↑ melebarkan loop P–V; afterload ↑ menaikkan ESV; kontraktilitas ↑ menurunkan ESV.",
    "Beban tekanan → hipertrofi konsentrik; beban volume → hipertrofi eksentrik."
  ],
  pertanyaan_penuntun: [
    "Gambarkan loop P–V normal dan geser untuk (a) perdarahan, (b) hipertensi mendadak, (c) dobutamin.",
    "Mengapa EF dapat tampak normal pada regurgitasi mitral berat?",
    "Mengapa nitrat menurunkan preload dan bagaimana efeknya pada SV pada HFrEF vs hipovolemia?"
  ],
  bacaan: "Guyton & Hall (bab pompa jantung); Klabunde (bab kontraktilitas, preload, afterload); Boron & Boulpaep (bab fungsi pompa jantung)."
});

window.DATA_PERTEMUAN.push({
  id: 12,
  judul: "Curah Jantung dan Venous Return",
  blok: "Regulasi dan Adaptasi",
  ringkasan: "Curah jantung ditentukan bersama oleh kemampuan jantung memompa (kurva fungsi jantung) dan oleh banyaknya darah yang kembali ke jantung (venous return); pada kondisi tunak keduanya sama, dan titik temunya adalah titik keseimbangan.",
  tujuan: [
    "Menghitung curah jantung dengan CO = HR × SV dan prinsip Fick.",
    "Menjelaskan faktor penentu HR dan SV dan interaksinya.",
    "Menjelaskan mean systemic filling pressure dan penentu venous return.",
    "Menggunakan kurva fungsi jantung dan kurva venous return (Guyton) untuk memprediksi perubahan CO dan tekanan atrium kanan.",
    "Menjelaskan pengaruh respirasi terhadap venous return dan tekanan darah."
  ],
  konsep_inti: [
    {
      judul: "1. Definisi dan pengukuran",
      isi: "CO = HR × SV; CI = CO/BSA; MAP ≈ CO × SVR. Nilai normal dewasa istirahat: CO ± 5 L/menit (4–8), CI ± 2,5–4,0 L/menit/m². Contoh: HR 70 × SV 70 = 4,9 L/menit. Prinsip Fick: CO = konsumsi O₂ / (kandungan O₂ arteri − kandungan O₂ vena campuran). Contoh: VO₂ 250 mL/menit; arteri 200 mL/L; vena campuran 150 mL/L → CO = 250/(200 − 150) = 5 L/menit. Metode lain: termodilusi (kateter arteri pulmonalis), ekokardiografi (SV = luas LVOT × VTI), MRI jantung."
    },
    {
      judul: "2. Faktor penentu CO",
      isi: "HR dan SV saling memengaruhi: pada HR terlalu tinggi (> ± 150/menit) pengisian diastol terlalu singkat, SV turun, sehingga CO justru turun.",
      tabel: [{
        judul: "Faktor yang menaikkan dan menurunkan komponen CO",
        kolom: ["Komponen", "Meningkat oleh", "Menurun oleh"],
        baris: [
          ["HR", "Simpatis, demam, hipertiroid, latihan, nyeri", "Vagus, penyekat β, hipotermia, atlet terlatih"],
          ["Preload", "Venous return ↑, volume darah ↑, sistol atrium", "Perdarahan, venodilatasi, takikardia ekstrem, tamponade"],
          ["Kontraktilitas", "Simpatis, digoksin, dobutamin", "Iskemia, kardiomiopati, asidosis, hipoksia"],
          ["Afterload", "Menurunkan SV bila naik: hipertensi, stenosis aorta, vasokonstriksi", "Penurunan afterload menaikkan SV (bila preload dan kontraktilitas cukup)"]
        ]
      }]
    },
    {
      judul: "3. Venous return",
      isi: "Aliran balik vena digerakkan oleh gradien antara mean systemic filling pressure (Pmsf, ± 7 mmHg; tekanan bila jantung berhenti dan darah tersebar merata) dan tekanan atrium kanan (RAP): VR = (P_msf − RAP)/R_VR. Pmsf naik oleh volume darah ↑ atau venokonstriksi. Bila RAP turun di bawah ± 0 mmHg, vena yang masuk ke toraks kolaps sehingga VR mendatar (plateau). VR dibantu oleh pompa otot rangka (dengan katup vena), pompa respirasi, dan venokonstriksi simpatis."
    },
    {
      judul: "4. Interaksi kurva jantung dan kurva venous return (Guyton)",
      isi: "Kurva fungsi jantung (CO naik bila RAP naik) dan kurva VR (VR turun bila RAP naik) berpotongan di titik keseimbangan: CO = VR dan RAP stabil. Pada orang sehat jantung tidak \"memutuskan\" curah sendiri: curah mengikuti venous return, yang terutama diatur oleh kebutuhan jaringan lewat resistensi perifer lokal.",
      tabel: [{
        judul: "Pergeseran kurva Guyton pada berbagai kondisi",
        kolom: ["Kondisi", "Kurva yang bergeser", "Pada titik baru"],
        baris: [
          ["Transfusi, retensi cairan, venokonstriksi", "VR ke kanan/atas (Pmsf ↑)", "CO ↑, RAP ↑"],
          ["Perdarahan, venodilatasi", "VR ke kiri/bawah (Pmsf ↓)", "CO ↓, RAP ↓"],
          ["Inotropik ↑", "Kurva jantung naik", "CO ↑, RAP ↓"],
          ["Gagal jantung sistolik", "Kurva jantung turun", "CO ↓, RAP ↑ (kongesti)"],
          ["Vasodilatasi arteri (SVR ↓), misalnya otot saat latihan", "VR berputar (kemiringan ↑)", "CO ↑"],
          ["Vasokonstriksi arteri (SVR ↑)", "VR berputar (kemiringan ↓)", "CO ↓ sedikit, tekanan arteri ↑"]
        ]
      }]
    },
    {
      judul: "5. Pengaruh respirasi",
      isi: "Inspirasi spontan: tekanan intratoraks turun → VR ke jantung kanan naik → SV RV naik; beberapa denyut kemudian SV LV turun sedikit sehingga tekanan sistolik turun < 10 mmHg. Penurunan > 10 mmHg = pulsus paradoksus (tamponade, asma berat, PPOK berat). Pada ventilasi tekanan positif, VR turun. Aritmia sinus respiratorik (HR naik saat inspirasi) normal, terutama pada anak."
    }
  ],
  korelasi_klinis: [
    "Syok hipovolemik: Pmsf turun → kurva VR bergeser → CO turun walau jantung sehat; terapi mengembalikan volume.",
    "Gagal jantung: kurva jantung turun; retensi cairan menaikkan Pmsf (kompensasi) dan memindahkan titik keseimbangan ke RAP tinggi (kongesti).",
    "Sepsis (distributif): vasodilatasi arteri dan vena menurunkan resistensi dan Pmsf; CO mula-mula tinggi lalu turun.",
    "Ventilasi tekanan positif pada pasien hipovolemik: VR turun lebih lanjut, tekanan turun."
  ],
  rangkuman: [
    "CO = HR × SV; Fick: CO = VO₂ / Δ(a–v) kandungan O₂.",
    "Pada keadaan tunak, CO = venous return; titik keseimbangan = perpotongan dua kurva.",
    "Volume dan tonus vena menggeser kurva VR; kontraktilitas menggeser kurva jantung."
  ],
  pertanyaan_penuntun: [
    "Hitung CO bila VO₂ = 300 mL/menit, kandungan O₂ arteri 190 mL/L dan vena campuran 130 mL/L.",
    "Gambarkan titik keseimbangan baru pada perdarahan dan pada pemberian inotropik.",
    "Mengapa ventilasi tekanan positif dapat menurunkan tekanan darah pada hipovolemia?"
  ],
  bacaan: "Guyton & Hall (bab curah jantung, venous return, dan regulasinya); Klabunde (bab curah jantung); Costanzo."
});

window.DATA_PERTEMUAN.push({
  id: 13,
  judul: "Regulasi Tekanan Darah",
  blok: "Regulasi dan Adaptasi",
  ringkasan: "Tekanan darah dijaga oleh tiga lapis mekanisme dengan skala waktu berbeda: refleks saraf (detik), hormon (menit–jam), dan pengaturan volume oleh ginjal (hari); masing-masing bekerja dengan mengubah curah jantung dan resistensi perifer.",
  tujuan: [
    "Menjelaskan jalur refleks baroreseptor dan responsnya terhadap perubahan tekanan.",
    "Menjelaskan refleks lain (kemoreseptor, Cushing, regang atrium, Bezold–Jarisch).",
    "Menjelaskan sistem RAA, ADH, ANP/BNP, dan hormon vasoaktif lain.",
    "Menjelaskan regulasi jangka panjang melalui natriuresis tekanan.",
    "Menjelaskan autoregulasi aliran darah lokal (miogenik dan metabolik).",
    "Menghubungkan mekanisme ini dengan hipertensi dan syok."
  ],
  konsep_inti: [
    {
      judul: "1. Skala waktu pengendalian",
      isi: "Tiga lapis mekanisme dengan kecepatan berbeda.",
      tabel: [{
        judul: "Skala waktu regulasi tekanan darah",
        kolom: ["Skala waktu", "Mekanisme", "Contoh"],
        baris: [
          ["Detik", "Baroreseptor, kemoreseptor, respons iskemik SSP", "Berdiri tiba-tiba, perdarahan akut"],
          ["Menit–jam", "RAA, ADH, stress relaxation vena, perpindahan cairan transkapiler", "Hipovolemia sedang"],
          ["Hari–minggu", "Natriuresis tekanan, keseimbangan natrium dan air", "Hipertensi esensial, gagal jantung"]
        ]
      }]
    },
    {
      judul: "2. Refleks baroreseptor",
      isi: "Reseptor regang di sinus karotis (aferen N. IX) dan arkus aorta (aferen N. X) mengirim sinyal ke nukleus traktus solitarius (NTS) di batang otak. Tekanan ↑ → laju tembak ↑ → simpatis ↓ dan vagus ↑ → HR ↓, kontraktilitas ↓, vasodilatasi arteri dan vena → tekanan turun. Tekanan ↓ menghasilkan kebalikannya. Paling sensitif pada MAP ± 60–180 mmHg, di sekitar tekanan normal. Respons cepat (detik) tetapi mengalami resetting dalam 1–2 hari pada tekanan tinggi menetap, sehingga tidak cocok untuk pengendalian jangka panjang. Klinik: pemijatan sinus karotis menurunkan HR (dasar manuver vagal); hipersensitivitas sinus karotis menyebabkan sinkop; refleks ini membuat hipotensi ortostatik cepat pulih pada orang sehat."
    },
    {
      judul: "3. Refleks lain",
      isi: "Kemoreseptor (badan karotis dan aorta): dipicu PaO₂ < ± 60 mmHg, PaCO₂ ↑, pH ↓; menaikkan ventilasi dan simpatis; penting saat MAP sangat rendah (< ± 80). Respons iskemik SSP: iskemia pusat vasomotor menimbulkan lonjakan simpatis terkuat. Refleks Cushing: TIK ↑ → iskemia batang otak → hipertensi, bradikardia, napas tidak teratur. Reseptor regang atrium (volume): peregangan atrium melepas ANP, menurunkan ADH dan simpatis ginjal. Refleks Bainbridge: peregangan atrium kanan menaikkan HR (pengaruh terbatas pada manusia). Refleks Bezold–Jarisch: rangsangan reseptor ventrikel (infark inferior, reperfusi) → bradikardia, hipotensi, vasodilatasi."
    },
    {
      judul: "4. Regulasi humoral",
      isi: "BNP dan NT-proBNP adalah penanda gagal jantung (peregangan ventrikel). Penghambat ACE, ARB, antagonis aldosteron, dan penghambat neprilisin bekerja pada jalur ini (konsep).",
      tabel: [{
        judul: "Sistem humoral dan efeknya",
        kolom: ["Sistem", "Pemicu", "Efek", "Waktu"],
        baris: [
          ["Katekolamin adrenal", "Simpatis ↑", "α₁: vasokonstriksi; β₁: HR dan kontraktilitas ↑; β₂: vasodilatasi otot", "Detik–menit"],
          ["RAA", "Tekanan perfusi ginjal ↓, simpatis β₁ ↑, NaCl macula densa ↓", "Angiotensin II (AT₁): vasokonstriksi arteriol, haus, ↑ aldosteron dan ADH; aldosteron: reabsorpsi Na⁺, ekskresi K⁺", "Menit–hari"],
          ["ADH", "Osmolaritas ↑, volume/tekanan ↓", "V₁: vasokonstriksi; V₂: reabsorpsi air", "Menit–jam"],
          ["ANP/BNP", "Peregangan atrium/ventrikel", "Natriuresis, vasodilatasi, ↓ renin dan aldosteron", "Menit–jam"],
          ["Endotel", "Aliran geser, hipoksia", "NO dan prostasiklin (vasodilatasi); endotelin-1 (vasokonstriksi)", "Detik–menit"]
        ]
      }]
    },
    {
      judul: "5. Regulasi jangka panjang: natriuresis tekanan",
      isi: "Ginjal mengubah ekskresi natrium dan air sesuai tekanan arteri: tekanan ↑ → ekskresi ↑ → volume cairan ekstrasel ↓ → CO ↓ → tekanan kembali ke titik setel. Pergeseran kurva natriuresis tekanan ke kanan (retensi natrium, aktivasi RAA, penyakit ginjal) adalah inti patofisiologi hipertensi esensial: tekanan harus lebih tinggi untuk mengeluarkan natrium yang sama."
    },
    {
      judul: "6. Autoregulasi aliran lokal",
      isi: "Miogenik: peregangan dinding arteriol → kontraksi otot polos → aliran konstan saat tekanan berubah. Metabolik: aktivitas jaringan ↑ → adenosin, K⁺, H⁺, CO₂, laktat ↑ dan O₂ ↓ → vasodilatasi (hiperemia aktif); setelah oklusi sementara terjadi hiperemia reaktif. Spesifik organ: koroner dan otak sangat bergantung metabolik/CO₂; ginjal punya umpan balik tubuloglomerulus; kulit untuk termoregulasi."
    }
  ],
  korelasi_klinis: [
    "Hipertensi esensial: kombinasi hiperaktivitas simpatis, aktivasi RAA, retensi natrium, dan pergeseran natriuresis tekanan; terapi menargetkan mekanisme tersebut.",
    "Syok hemoragik: baroreseptor → simpatis ↑ + RAA + ADH menahan tekanan; kegagalan kompensasi → hipotensi.",
    "Hipotensi ortostatik: kegagalan refleks baroreseptor (neuropati diabetik, obat, dehidrasi).",
    "Refleks Cushing: tanda klasik peningkatan TIK.",
    "Gagal jantung: aktivasi simpatis dan RAA awalnya kompensatorik lalu merugikan (remodeling)."
  ],
  rangkuman: [
    "Baroreseptor: cepat tetapi beradaptasi; ginjal (natriuresis tekanan) menentukan tekanan jangka panjang.",
    "Angiotensin II, aldosteron, ADH menaikkan tekanan dan volume; ANP/BNP melawannya.",
    "Autoregulasi lokal mempertahankan aliran organ pada rentang tekanan perfusi tertentu."
  ],
  pertanyaan_penuntun: [
    "Mengapa baroreseptor tidak cukup untuk mengendalikan hipertensi jangka panjang?",
    "Jelaskan urutan respons neurohumoral pada perdarahan 1 L.",
    "Mengapa penyakit ginjal sering menyebabkan hipertensi?"
  ],
  bacaan: "Guyton & Hall (bab regulasi tekanan arteri, peran ginjal); Costanzo (bab regulasi tekanan arteri); Klabunde."
});
window.DATA_PERTEMUAN.push({
  id: 14,
  judul: "Mikrosirkulasi, Limfatik, dan Sirkulasi Khusus",
  blok: "Regulasi dan Adaptasi",
  ringkasan: "Pertukaran cairan di kapiler ditentukan oleh keseimbangan gaya hidrostatik dan onkotik, kelebihan filtrat dikembalikan oleh limfatik, dan tiap organ memiliki sirkulasi dengan ciri aliran sendiri yang menyesuaikan kebutuhannya: koroner (terutama diastol), otak (autoregulasi ketat), serta sirkulasi janin yang berubah drastis saat lahir.",
  tujuan: [
    "Menjelaskan struktur kapiler dan mekanisme pertukaran (difusi, filtrasi, transitosis).",
    "Menerapkan persamaan Starling dan menganalisis penyebab edema.",
    "Menjelaskan fungsi sistem limfatik.",
    "Menjelaskan aliran darah koroner, regulasinya, dan hubungannya dengan iskemia.",
    "Menjelaskan sirkulasi serebral dan autoregulasinya.",
    "Menjelaskan sirkulasi janin dan perubahan saat lahir."
  ],
  konsep_inti: [
    {
      judul: "1. Kapiler",
      isi: "Dinding satu lapis endotel. Tipe: kontinu (otot, otak dengan sawar darah–otak), bercelah/fenestrata (ginjal, usus, kelenjar endokrin), sinusoid (hati, limpa, sumsum tulang). Pertukaran: difusi (O₂, CO₂, zat larut lemak melintasi membran; zat larut air melalui celah), filtrasi dan reabsorpsi (gaya Starling), transitosis (makromolekul). Sfingter prekapiler mengatur jumlah kapiler yang terbuka (vasomotion)."
    },
    {
      judul: "2. Gaya Starling",
      isi: "J_v = K_f [(P_c − P_i) − σ(π_c − π_i)]. P_c tekanan hidrostatik kapiler (± 35 mmHg di ujung arteriol, ± 15–17 di ujung venula), P_i tekanan hidrostatik interstisial (± 0 hingga −2), π_c tekanan onkotik plasma (± 25–28, terutama albumin), π_i (± 8), K_f koefisien filtrasi, σ koefisien refleksi. Ujung arteriol: filtrasi; ujung venula: reabsorpsi sebagian; selisih netto (± 2–4 L/hari) dikembalikan oleh limfatik.",
      tabel: [{
        judul: "Penyebab edema menurut gaya Starling",
        kolom: ["Penyebab edema", "Mekanisme", "Contoh"],
        baris: [
          ["P_c ↑", "Tekanan vena naik", "Gagal jantung kanan, obstruksi vena, kelebihan cairan"],
          ["π_c ↓", "Hipoalbuminemia", "Sindrom nefrotik, sirosis, malnutrisi"],
          ["Permeabilitas ↑", "K_f ↑, σ ↓", "Inflamasi, sepsis, luka bakar, anafilaksis"],
          ["Obstruksi limfatik", "Cairan tak kembali", "Filariasis, diseksi kelenjar, keganasan"]
        ]
      }]
    },
    {
      judul: "3. Limfatik",
      isi: "Kapiler limfe menyerap kelebihan filtrat, protein, dan lemak (dari usus). Aliran dibantu katup, kontraksi pembuluh limfe, pompa otot, dan respirasi; total ± 2–4 L/hari kembali ke vena subklavia. Fungsi imun melalui kelenjar getah bening."
    },
    {
      judul: "4. Sirkulasi koroner",
      isi: "RCA: atrium dan ventrikel kanan, nodus SA (± 60%), nodus AV (± 80–90%), dan pada dominansi kanan (± 85%) cabang desendens posterior. LMCA → LAD (anterior, septum, apeks) dan LCx (lateral). Drainase vena terutama via sinus koronarius. Aliran istirahat ± 225 mL/menit (± 4–5% CO). Aliran LV terutama saat diastol: kontraksi menekan pembuluh intramiokardial (kompresi ekstravaskular) sehingga aliran turun saat sistol, bahkan terbalik sebentar di subendokardium. Aliran RV lebih merata. Tekanan perfusi koroner (CPP) ≈ tekanan diastol aorta − LVEDP; takikardia memendekkan diastol. Subendokardium paling rentan iskemia (kompresi sistolik terbesar, tekanan perfusi terendah, kebutuhan O₂ tertinggi). Ekstraksi O₂ ± 70–75% pada istirahat: kebutuhan naik harus dipenuhi dengan aliran naik (cadangan ± 3–5× pada arteri normal). Regulasi dominan metabolik (adenosin, K⁺, H⁺, CO₂, NO); efek simpatis α langsung vasokonstriksi, tetapi vasodilatasi metabolik tidak langsung mendominasi. Stenosis ≥ ± 70% membatasi cadangan aliran sehingga angina saat aktivitas; ≥ ± 90% membatasi aliran istirahat (Poiseuille, r⁴).",
      tabel: [{
        judul: "Arteri koroner, dinding, dan sadapan",
        kolom: ["Arteri tersumbat", "Dinding terkena", "Sadapan EKG", "Catatan"],
        baris: [
          ["LAD", "Anterior, septum, apeks", "V1–V4", "Gagal pompa berat bila besar"],
          ["LCx", "Lateral", "I, aVL, V5–V6", ""],
          ["RCA", "Inferior, ventrikel kanan, nodus SA/AV", "II, III, aVF", "Bradikardia, blok AV; infark RV sensitif terhadap preload"]
        ]
      }]
    },
    {
      judul: "5. Sirkulasi serebral",
      isi: "Aliran ± 750 mL/menit (± 14–15% CO; ± 50 mL/100 g/menit), otak hanya ± 2% massa tubuh. Autoregulasi kuat pada MAP ± 60–150 mmHg; di luar rentang aliran mengikuti tekanan (hipotensi → iskemia; hipertensi berat → edema otak). PaCO₂ adalah vasodilator kuat (hiperkapnia → aliran ↑; hiperventilasi → vasokonstriksi). Tekanan perfusi otak (CPP) = MAP − TIK. Doktrin Monro–Kellie: volume intrakranial tetap (otak, darah, LCS), kenaikan satu komponen menaikkan TIK. Sawar darah–otak membatasi pertukaran zat."
    },
    {
      judul: "6. Sirkulasi janin dan transisi neonatus",
      isi: "Pada janin PVR sangat tinggi (paru terisi cairan, vasokonstriksi hipoksik) dan SVR rendah (plasenta resistensi rendah). Saat lahir, napas pertama mengembang paru → O₂ ↑ → PVR turun drastis dan aliran paru naik; pemutusan tali pusat menaikkan SVR; tekanan atrium kiri naik dan atrium kanan turun → foramen ovale menutup; O₂ tinggi dan turunnya prostaglandin menutup duktus arteriosus. Kegagalan transisi: PDA, defek septum atrium/ventrikel, hipertensi pulmonal persisten bayi baru lahir. Indometasin dan ibuprofen (penghambat prostaglandin) dapat menutup PDA; prostaglandin E1 mempertahankannya pada lesi bergantung duktus (konsep).",
      tabel: [{
        judul: "Struktur sirkulasi janin dan nasib setelah lahir",
        kolom: ["Struktur", "Fungsi janin", "Setelah lahir"],
        baris: [
          ["Vena umbilikalis", "Membawa darah teroksigenasi (± 80% saturasi) dari plasenta", "Menjadi ligamentum teres"],
          ["Duktus venosus", "Mengalihkan sebagian darah melewati hati ke vena cava inferior", "Menjadi ligamentum venosum"],
          ["Foramen ovale", "Atrium kanan → atrium kiri (melewati paru)", "Menutup fungsional segera (tekanan atrium kiri > kanan)"],
          ["Duktus arteriosus", "Arteri pulmonalis → aorta (melewati paru)", "Menutup dalam hari pertama–ketiga (O₂ ↑, prostaglandin ↓)"],
          ["Arteri umbilikalis", "Membawa darah kembali ke plasenta", "Menjadi ligamentum umbilikalis medial"]
        ]
      }]
    }
  ],
  korelasi_klinis: [
    "Edema (gagal jantung kanan, nefrotik, sirosis, limfedema): cari mekanisme Starling.",
    "Angina dan infark: suplai < kebutuhan; troponin menandai nekrosis; lokasi EKG menunjuk arteri.",
    "Peningkatan TIK: CPP turun; refleks Cushing.",
    "PDA: pirau kiri ke kanan setelah PVR turun; murmur kontinu."
  ],
  rangkuman: [
    "Edema = ketidakseimbangan gaya Starling atau obstruksi limfatik.",
    "Koroner kiri diperfusi terutama saat diastol; CPP = tekanan diastol aorta − LVEDP.",
    "Autoregulasi otak kuat pada MAP 60–150 mmHg; CO₂ vasodilator utama.",
    "Saat lahir PVR turun, SVR naik, foramen ovale dan duktus arteriosus menutup."
  ],
  pertanyaan_penuntun: [
    "Mengapa hipoalbuminemia menyebabkan edema?",
    "Mengapa subendokardium paling rentan iskemia?",
    "Jelaskan perubahan hemodinamika yang menutup foramen ovale setelah lahir."
  ],
  bacaan: "Guyton & Hall (bab sirkulasi mikro dan limfatik, aliran darah koroner dan otak); Boron & Boulpaep (bab mikrosirkulasi); buku embriologi/pediatri untuk sirkulasi janin."
});

window.DATA_PERTEMUAN.push({
  id: 15,
  judul: "Respons Adaptif Kardiovaskular dan Gagal Jantung",
  blok: "Regulasi dan Adaptasi",
  ringkasan: "Latihan, perubahan postur, dan perdarahan adalah uji terpadu seluruh materi sebelumnya: curah jantung, resistensi, preload, dan refleks neurohumoral berubah dengan pola yang dapat diprediksi, dan kegagalan adaptasi itulah yang menghasilkan syok dan gagal jantung.",
  tujuan: [
    "Menjelaskan respons kardiovaskular terhadap latihan dinamis dan statis.",
    "Menjelaskan respons terhadap perubahan postur dan manuver Valsalva.",
    "Menjelaskan tahap kompensasi pada perdarahan dan mengklasifikasikan derajatnya.",
    "Membedakan jenis syok berdasarkan profil hemodinamika.",
    "Menjelaskan patofisiologi gagal jantung (HFrEF dan HFpEF) berdasarkan Pertemuan 7–13."
  ],
  konsep_inti: [
    {
      judul: "1. Latihan dinamis (aerobik)",
      isi: "Aliran ke otot aktif dan koroner meningkat; ke ginjal dan splangnikus menurun. Latihan statis (isometrik) menaikkan afterload tajam (SVR ↑, tekanan ↑↑) dengan CO kurang meningkat (beban tekanan). Atlet ketahanan: hipertrofi eksentrik fisiologis, SV istirahat besar, bradikardia akibat tonus vagus tinggi.",
      tabel: [{
        judul: "Respons kardiovaskular pada latihan aerobik",
        kolom: ["Variabel", "Perubahan", "Mekanisme"],
        baris: [
          ["HR", "↑↑ (maks ≈ 220 − usia, perkiraan kasar)", "Central command, tarikan vagus lalu ↑ simpatis"],
          ["SV", "↑ (plateau pada ± 40–60% kapasitas maksimal)", "Venous return ↑ (pompa otot, venokonstriksi), kontraktilitas ↑"],
          ["CO", "↑↑ (hingga 20–25 L/menit, atlet 30+)", "HR × SV"],
          ["SVR", "↓", "Vasodilatasi metabolik otot (aliran otot hingga ± 80% CO)"],
          ["Sistolik / diastolik", "↑ / tetap atau ↓ sedikit", "CO ↑; SVR ↓"],
          ["MAP", "↑ sedikit", "CO ↑ melebihi penurunan SVR"],
          ["Ekstraksi O₂", "↑", "Kurva disosiasi Hb bergeser kanan"]
        ]
      }]
    },
    {
      judul: "2. Postur dan Valsalva",
      isi: "Berdiri memindahkan ± 500–700 mL darah ke tungkai → VR ↓ → SV, CO, MAP ↓ sesaat → baroreseptor: simpatis ↑, vagus ↓ (HR ↑ ± 10–15/menit, venokonstriksi, vasokonstriksi arteriol) → tekanan pulih dalam detik. Kegagalan = hipotensi ortostatik. Valsalva (4 fase): (1) tekanan intratoraks ↑ → tekanan arteri ↑ sesaat; (2) VR ↓ → tekanan ↓, takikardia refleks; (3) pelepasan → tekanan ↓ sebentar; (4) VR pulih dengan vasokonstriksi masih ada → overshoot tekanan dan bradikardia refleks. Pola abnormal menandakan kegagalan refleks baroreseptor atau gagal jantung."
    },
    {
      judul: "3. Perdarahan",
      isi: "Volume ↓ → VR dan preload ↓ → SV dan CO ↓ → MAP ↓. Kompensasi: (a) detik: baroreseptor → simpatis ↑ → HR ↑, venokonstriksi (Pmsf ↑), vasokonstriksi arteriol di kulit, ginjal, splangnikus (aliran otak dan jantung dipertahankan); (b) menit–jam: RAA, ADH, transcapillary refill (P_c ↓ → cairan interstisial masuk kapiler; hematokrit baru turun setelah proses ini); (c) hari: ginjal menahan Na⁺ dan air; eritropoiesis. Tekanan nadi turun lebih dulu (vasokonstriksi menaikkan diastolik, SV turun); sistolik turun baru pada dekompensasi. Syok lanjut: hipoperfusi → asidosis laktat → vasodilatasi dan respons katekolamin berkurang (syok ireversibel).",
      tabel: [{
        judul: "Klasifikasi perdarahan (ATLS, dewasa 70 kg)",
        kolom: ["Kelas (ATLS, dewasa 70 kg)", "Kehilangan darah", "HR", "Tekanan darah", "Tekanan nadi", "Status mental"],
        baris: [
          ["I", "< 15% (< 750 mL)", "Normal", "Normal", "Normal", "Cemas ringan"],
          ["II", "15–30% (750–1500 mL)", "100–120", "Normal", "↓", "Cemas"],
          ["III", "30–40% (1500–2000 mL)", "120–140", "↓", "↓", "Bingung"],
          ["IV", "> 40% (> 2000 mL)", "> 140", "↓↓", "↓↓", "Letargi"]
        ]
      }]
    },
    {
      judul: "4. Jenis syok",
      isi: "Profil hemodinamika membedakan empat jenis syok.",
      tabel: [{
        judul: "Profil hemodinamika jenis syok",
        kolom: ["Jenis", "Contoh", "CO", "SVR", "Preload (CVP/PCWP)"],
        baris: [
          ["Hipovolemik", "Perdarahan, dehidrasi berat", "↓", "↑", "↓"],
          ["Kardiogenik", "Infark luas, gagal jantung akut", "↓", "↑", "↑"],
          ["Obstruktif", "Tamponade, emboli paru masif, pneumotoraks tension", "↓", "↑", "CVP ↑, PCWP bervariasi"],
          ["Distributif", "Sepsis, anafilaksis, neurogenik", "↑/normal (awal), ↓ (lanjut)", "↓", "↓ atau normal"]
        ]
      }]
    },
    {
      judul: "5. Gagal jantung",
      isi: "Sindrom ketika jantung tidak mampu memenuhi kebutuhan metabolik pada tekanan pengisian normal. Klasifikasi menurut EF ventrikel kiri (pedoman internasional): HFrEF (≤ 40%), HFmrEF (41–49%), HFpEF (≥ 50%). Siklus patofisiologi: CO ↓ → aktivasi simpatis dan RAA (HR ↑, retensi Na⁺ dan air, vasokonstriksi) → jangka pendek mempertahankan tekanan, tetapi aktivasi menetap menaikkan preload dan afterload, memicu remodeling patologis (dilatasi, fibrosis), apoptosis, dan makin menurunkan CO. Gejala kiri: kongesti paru (dispnea, ortopnea, ronki); kanan: JVP ↑, hepatomegali, edema tungkai. Terapi modern memutus aktivasi neurohormonal (penghambat RAA, penyekat β, antagonis mineralokortikoid, SGLT2i) dan mengatasi kongesti (diuretik); lihat pedoman terkini untuk dosis.",
      tabel: [{
        judul: "Perbandingan HFrEF dan HFpEF",
        kolom: ["Aspek", "HFrEF (sistolik)", "HFpEF (diastolik)"],
        baris: [
          ["Masalah utama", "Kontraktilitas ↓; kurva Frank–Starling turun", "Relaksasi dan komplians ↓; EDPVR bergeser ke atas"],
          ["Loop P–V", "Ke kanan; ESV ↑; SV ↓", "EDV kecil/normal, tekanan akhir diastol sangat tinggi"],
          ["Penyebab", "Infark, kardiomiopati dilatasi, hipertensi lama", "Hipertensi/LVH, usia lanjut, diabetes, obesitas"]
        ]
      }]
    }
  ],
  korelasi_klinis: [
    "Syok hipovolemik: tampak dingin dan pucat, nadi cepat lemah, tekanan nadi sempit; terapi menghentikan sumber perdarahan dan mengganti volume (bukan vasodilator; vasopresor bukan lini pertama).",
    "Hipotensi ortostatik: dehidrasi, obat, neuropati otonom.",
    "Gagal jantung: diuretik meredakan kongesti (Pertemuan 11), penyekat β dan penghambat RAA memutus remodeling."
  ],
  rangkuman: [
    "Latihan: CO ↑ lewat HR dan SV; SVR ↓ karena vasodilatasi otot.",
    "Perdarahan: SVR ↑ kompensatorik, tekanan nadi menyempit; hipotensi muncul lambat.",
    "Gagal jantung: lingkaran setan CO ↓ → aktivasi neurohormonal → remodeling."
  ],
  pertanyaan_penuntun: [
    "Mengapa tekanan diastolik tidak naik pada latihan aerobik?",
    "Mengapa tekanan nadi menyempit lebih dulu daripada sistolik turun pada perdarahan?",
    "Mengapa penyekat β yang menurunkan HR dan kontraktilitas justru bermanfaat jangka panjang pada gagal jantung?"
  ],
  bacaan: "Guyton & Hall (bab fisiologi olahraga dan sirkulasi); ATLS Student Course Manual (syok hemoragik); pedoman gagal jantung ESC 2021."
});
window.DATA_PERTEMUAN.push({
  id: 16,
  judul: "Integrasi Klinis dan Evaluasi Akhir",
  blok: "Integrasi",
  label_integrasi: true,
  ringkasan: "Penyakit kardiovaskular dapat dipahami sebagai gangguan pada satu atau lebih komponen yang sudah dipelajari: pengisian (preload), beban (afterload), kontraktilitas, irama, katup, atau perfusi; pertemuan ini memetakan kondisi umum ke komponen tersebut dan menutup modul dengan evaluasi akhir.",
  tujuan: [
    "Memetakan penyakit katup, hipertensi, penyakit jantung iskemik, aritmia, tamponade, dan kardiomiopati ke gangguan fisiologisnya.",
    "Menghubungkan temuan klinis (gejala, bunyi jantung, EKG, hemodinamika) dengan mekanisme.",
    "Menganalisis kasus terpadu menggunakan kerangka preload–afterload–kontraktilitas–irama–katup–perfusi."
  ],
  konsep_inti: [
    {
      judul: "1. Kerangka penalaran",
      isi: "Tanyakan berurutan: apakah masalahnya pada irama (EKG), pengisian (preload, venous return), beban (afterload), kontraktilitas (EF, ESV), katup (murmur, gradien), atau perfusi (koroner, MAP)? Lalu tanyakan kompensasinya (simpatis, RAA, remodeling) dan apakah kompensasi itu menguntungkan atau merugikan."
    },
    {
      judul: "2. Penyakit katup",
      isi: "Setiap lesi katup menentukan beban dan adaptasi ventrikel.",
      tabel: [{
        judul: "Pemetaan penyakit katup",
        kolom: ["Lesi", "Beban", "Adaptasi", "Temuan kunci"],
        baris: [
          ["Stenosis aorta", "Tekanan", "Hipertrofi konsentrik; iskemia subendokardium", "Angina, sinkop saat aktivitas, gagal jantung; parvus et tardus"],
          ["Regurgitasi aorta", "Volume", "Hipertrofi eksentrik; tekanan nadi lebar", "Diastol aorta rendah → CPP ↓; water-hammer"],
          ["Stenosis mitral", "Tekanan di atrium kiri", "Atrium kiri melebar → AF; hipertensi pulmonal", "Dispnea, hemoptisis, rumbling diastolik"],
          ["Regurgitasi mitral", "Volume", "Dilatasi eksentrik; afterload efektif rendah", "Holosistolik; EF \"normal\" menyamarkan disfungsi"]
        ]
      }]
    },
    {
      judul: "3. Hipertensi",
      isi: "Hipertensi esensial: CO normal dengan SVR ↑ (tahap lanjut), disertai pergeseran natriuresis tekanan, hiperaktivitas simpatis, dan RAA. Organ target: LVH (Laplace), aterosklerosis dipercepat, gagal jantung, penyakit ginjal kronis, stroke, retinopati. Hipertensi menaikkan afterload dan menggeser kurva autoregulasi otak dan ginjal ke kanan."
    },
    {
      judul: "4. Penyakit jantung iskemik",
      isi: "Suplai < kebutuhan O₂ miokardium. Angina stabil (stenosis menetap, timbul saat beban naik), sindrom koroner akut (ruptur plak dan trombus). Kaskade iskemia: gangguan relaksasi → gangguan kontraksi → perubahan EKG → nyeri dada. Stunning (disfungsi sementara pasca iskemia singkat) dan hibernation (penurunan fungsi adaptif pada hipoperfusi kronis). Komplikasi: aritmia (reentri, gap junction), gagal pompa, ruptur, remodeling pascainfark."
    },
    {
      judul: "5. Aritmia dan irama",
      isi: "Fibrilasi atrium: hilangnya sistol atrium menurunkan pengisian ± 20%, stasis atrium kiri → trombus dan stroke. VT/VF pada iskemia, QT panjang, jaringan parut; defibrilasi memutus reentri. Bradiaritmia: disfungsi nodus SA, blok AV; pemacu jantung menggantikan jalur konduksi."
    },
    {
      judul: "6. Perikardium, aorta, paru",
      isi: "Tamponade: cairan perikardium menekan ruang jantung → pengisian ↓ → SV ↓ (trias Beck, pulsus paradoksus). Aneurisma aorta abdominal: elastin dan kolagen terdegradasi → r ↑, h ↓ → σ ↑ → ruptur. Diseksi aorta: robekan intima; terapi awal menurunkan HR dan tekanan (dP/dt). Hipertensi pulmonal: PVR ↑ → afterload RV ↑ → cor pulmonale."
    },
    {
      judul: "7. Kardiomiopati",
      isi: "Tiga tipe utama dengan ciri fisiologis berbeda.",
      tabel: [{
        judul: "Tipe kardiomiopati",
        kolom: ["Tipe", "Karakteristik fisiologis"],
        baris: [
          ["Dilatasi", "Ventrikel dilatasi, kontraktilitas ↓ (EF ↓)"],
          ["Hipertrofik", "Dinding menebal, relaksasi terganggu; obstruksi aliran keluar dinamis memburuk bila preload ↓ atau kontraktilitas ↑"],
          ["Restriktif", "Dinding kaku (infiltrasi), pengisian terbatas, EF sering normal"]
        ]
      }]
    },
    {
      judul: "8. Contoh kasus terpadu",
      isi: "Pria 62 tahun, nyeri dada tertekan saat berjalan menanjak, sesak saat berbaring, edema tungkai, JVP meningkat, S3, ronki basah di basal paru, EKG: LVH dan T inversi di sadapan lateral, TD 160/100. Perfusi: LVH dan tekanan tinggi menaikkan MVO₂; stenosis koroner membatasi suplai → angina. Beban: hipertensi lama → afterload ↑ → hipertrofi konsentrik → HFpEF; bila diikuti dilatasi → HFrEF. Kongesti: P_c paru ↑ → dispnea, ortopnea, ronki; P_c vena sistemik ↑ → JVP ↑, edema. Kompensasi: simpatis dan RAA aktif → retensi Na⁺ dan air → preload ↑. Terapi (konsep): turunkan beban dan tekanan (penghambat RAA, diuretik, penyekat β) dan perbaiki perfusi."
    },
    {
      judul: "Evaluasi akhir",
      isi: "Cakupan: seluruh Pertemuan 1–15 dengan penekanan Pertemuan 9–15. Bentuk disarankan: soal pilihan ganda penalaran (60%), esai singkat (25%), dan kasus terpadu (15%). Soal latihan ada di dokumen Bank Soal. Bobot topik yang disarankan: siklus dan mekanika pompa (± 30%), curah jantung dan regulasi (± 25%), mikrosirkulasi dan sirkulasi khusus (± 15%), respons adaptif dan gagal jantung (± 15%), integrasi bagian I (± 15%)."
    }
  ],
  korelasi_klinis: [
    "Kerangka enam komponen (irama, preload, afterload, kontraktilitas, katup, perfusi) dipakai pada semua kasus di Visual Novel dan AR Scanner.",
    "Hampir semua terapi kardiovaskular dapat dijelaskan oleh efeknya pada salah satu variabel di atas."
  ],
  rangkuman: [
    "Klasifikasikan penyakit menurut komponen yang terganggu: irama, preload, afterload, kontraktilitas, katup, perfusi.",
    "Beban tekanan → hipertrofi konsentrik; beban volume → hipertrofi eksentrik; keduanya dapat berakhir pada gagal jantung.",
    "Hampir semua terapi kardiovaskular dapat dijelaskan oleh efeknya pada salah satu variabel di atas."
  ],
  pertanyaan_penuntun: [
    "Bandingkan loop P–V stenosis aorta dan regurgitasi aorta.",
    "Jelaskan mengapa pasien kasus terpadu mengalami kongesti paru dan JVP naik sekaligus.",
    "Pilih satu obat kardiovaskular, jelaskan titik kerjanya dan perubahan variabel yang diharapkan."
  ],
  bacaan: "Ulang seluruh Pertemuan 1–15; kerjakan kasus A–C di Bank Soal dan kuis integrasi."
});
window.DATA_PERTEMUAN.sort(function (a, b) { return a.id - b.id; });
