/* js/home.js — beranda bergaya Modern Healthcare: intro, 4 modul, tentang, progres, keunggulan, CTA */
(function () {
  function ic(path, size) {
    return '<svg width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }
  var P = {
    book: '<path d="M2 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/>',
    quiz: '<path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="3"/>',
    vn: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
    ar: '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
    pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    star: '<path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6L5.7 21l1.5-7L2 9.3l7-.8z"/>',
    cube: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5a3 3 0 0 1 0 6M18 14c2 .7 3.5 2.6 3.5 5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    play: '<path d="M8 5v14l11-7z"/>'
  };

  // ilustrasi jantung bergaya (hijau) — id gradien unik per pemakaian
  function heartSvg(k, light) {
    var a = light ? '#FFFFFF' : '#5CC59A', b = light ? '#BFE3D0' : '#14805A', c = light ? '#8FCFB0' : '#0F4D3A';
    return '<svg class="heart" viewBox="0 0 200 200" aria-hidden="true">' +
      '<defs><linearGradient id="hg' + k + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/></linearGradient>' +
      '<linearGradient id="hv' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/></linearGradient></defs>' +
      '<path d="M84 52V22a9 9 0 0 1 18 0v30z" fill="url(#hv' + k + ')"/>' +
      '<path d="M112 56c4-18 18-34 34-34 4 0 7 3 7 7 0 14-12 24-27 30z" fill="url(#hv' + k + ')" opacity=".9"/>' +
      '<path d="M70 56C50 40 26 50 24 76c-3 38 38 74 76 108 38-34 79-70 76-108-2-26-26-36-46-20-8 6-14 10-30 10S78 62 70 56z" fill="url(#hg' + k + ')"/>' +
      '<path d="M100 70c-3 30-2 66 0 114" stroke="rgba(255,255,255,.28)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M58 86c-8 12-6 30 4 46M140 86c8 12 6 30-4 46" stroke="rgba(255,255,255,.22)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M34 108h26l8-14 12 30 9-18h22" stroke="rgba(255,255,255,.85)" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  }

  function render(app) {
    var u = Auth.currentUser();
    if (!u || !(window.DATA_PERTEMUAN || []).length) {
      // belum login: PB menyembunyikan konten sampai autentikasi sukses
      location.hash = "#/login";
      App.render();
      return;
    }
    var p = Storage.load();
    var total = window.DATA_PERTEMUAN.length;
    var done = p.materi_selesai.length;
    var pctDone = App.pct(done, total);
    var p = Storage.load();
    var total = window.DATA_PERTEMUAN.length;
    var done = p.materi_selesai.length;
    var pctDone = App.pct(done, total);
    var kuisTertinggi = 0;
    Object.keys(p.skor_kuis).forEach(function (k) {
      var v = p.skor_kuis[k]; if (v && v.persen > kuisTertinggi) kuisTertinggi = v.persen;
    });
    var kasusTotal = window.DATA_KASUS.length;
    var kasusSelesai = Object.keys(p.kasus_selesai).length;
    var markerTotal = window.DATA_MARKER.length;
    var markerDip = p.marker_dipindai.length;
    var next = window.DATA_PERTEMUAN.find(function (x) { return p.materi_selesai.indexOf(x.id) === -1; }) || window.DATA_PERTEMUAN[0];
    var nama = App.escapeHtml(window.CONFIG.namaWeb);

    function modCard(cls, title, href, desc, stat, icon) {
      return '<a class="hx-card ' + cls + '" href="#/' + href + '">' +
        '<span class="go" aria-hidden="true">&rarr;</span>' +
        '<span class="ico">' + ic(icon, 32) + '</span>' +
        '<h3>' + title + '</h3>' +
        '<p>' + desc + '</p>' +
        '<span class="pill">' + stat + '</span>' +
      '</a>';
    }

    function stat(icon, value, label) {
      return '<div>' + ic(icon, 34) + '<div><b>' + value + '</b><span>' + label + '</span></div></div>';
    }

    function feat(icon, title, desc) {
      return '<div class="hx-feat"><span class="fi">' + ic(icon, 22) + '</span><h4>' + title + '</h4><p>' + desc + '</p></div>';
    }

    var html = '' +
    /* ===== Intro ===== */
    '<section class="hx-stage hx-reveal mb-8">' +
      '<div class="grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]">' +
        '<div>' +
          '<span class="hx-badge">' + ic(P.pulse, 16) + 'Fisiologi Jantung Interaktif</span>' +
          '<h1 class="hx-title">Pahami Jantung dengan <em>Lebih Hidup</em></h1>' +
          '<p class="lead">Di ' + nama + ', materi, kuis, visual novel kasus klinis, dan AR Scanner 3D hadir dalam satu tempat — dirancang agar belajar fisiologi jantung terasa jelas dan menyenangkan.</p>' +
          '<div class="mt-7 flex flex-wrap items-center gap-3">' +
            '<a class="btn btn-primary btn-lg" href="#/materi/' + next.id + '">Lanjutkan Belajar &middot; P' + next.id + ' &rarr;</a>' +
            '<a class="btn btn-lg" href="#/ar"><span class="grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-brand">' + ic(P.play, 12) + '</span>Coba AR Scanner</a>' +
          '</div>' +
        '</div>' +
        '<div class="hx-blob">' +
          heartSvg('A', false) +
          '<div class="hx-chip" style="top:4%;right:0"><i>' + ic(P.book, 18) + '</i><div><b>' + total + '</b>Pertemuan</div></div>' +
          '<div class="hx-chip" style="bottom:20%;left:-2%"><i>' + ic(P.shield, 18) + '</i><div><b>' + (window.DATA_SOAL ? window.DATA_SOAL.length : 41) + ' Soal</b>Latihan &amp; Ujian</div></div>' +
          '<div class="hx-script">Pahami Jantung,<br>Mulai dari Sini</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* ===== Modul ===== */
    '<div class="mb-5 flex items-end justify-between gap-4">' +
      '<div><span class="hx-badge">Modul Belajar</span><h2 class="hx-h2">Empat Jalur <em>Belajar</em></h2></div>' +
      '<div class="hidden sm:block"><span class="badge badge-brand">' + pctDone + '% keseluruhan</span></div>' +
    '</div>' +
    '<div class="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">' +
      modCard('t1', 'Materi', 'Materi', '16 pertemuan, 5 blok. Ringkasan, tujuan, konsep inti, korelasi klinis.', done + ' / ' + total + ' selesai', P.book) +
      modCard('t2', 'Kuis', 'Kuis', '41 soal PG, 6 esai, mode latihan &amp; ujian. Daftar remedial otomatis.', kuisTertinggi + '% terbaik', P.quiz) +
      modCard('t3', 'Visual Novel', 'vn', 'Kasus kardiovaskular bercabang. Keputusanmu mengubah monitor pasien.', kasusSelesai + ' / ' + kasusTotal + ' selesai', P.vn) +
      modCard('t4', 'AR Scanner', 'ar', 'Arahkan kamera ke marker barcode. Model 3D jantung muncul di tanganmu.', markerDip + ' / ' + markerTotal + ' marker', P.ar) +
    '</div>' +

    /* ===== Tentang ===== */
    '<section class="mb-8 grid items-center gap-8 lg:grid-cols-2">' +
      '<div class="hx-panel">' + heartSvg('B', true) +
        '<div class="hx-chip" style="left:5%;bottom:7%"><i>' + ic(P.cube, 18) + '</i><div><b>Model 3D</b>&amp; AR interaktif</div></div>' +
      '</div>' +
      '<div>' +
        '<span class="hx-badge">Tentang ' + nama + '</span>' +
        '<h2 class="hx-h2">Media Belajar untuk <em>Pemahaman yang Lebih Dalam</em></h2>' +
        '<p class="lead">' + nama + ' membantu mahasiswa memahami fisiologi jantung secara bertahap: dari konsep dasar, latihan soal, simulasi kasus klinis, hingga eksplorasi anatomi jantung dalam 3D.</p>' +
        '<div class="mt-6 flex flex-wrap items-center gap-3">' +
          '<a class="btn btn-primary" href="#/materi">Mulai Materi &rarr;</a>' +
          '<a class="btn" href="#/vn">Coba Visual Novel</a>' +
        '</div>' +
      '</div>' +
    '</section>' +

    /* ===== Progres ===== */
    '<section class="hx-stats mb-12" aria-label="Progres belajar">' +
      stat(P.book, done + '/' + total, 'Materi selesai') +
      stat(P.star, kuisTertinggi + '%', 'Skor kuis terbaik') +
      stat(P.users, kasusSelesai + '/' + kasusTotal, 'Kasus Visual Novel') +
      stat(P.ar, markerDip + '/' + markerTotal, 'Marker AR dipindai') +
    '</section>' +

    /* ===== Keunggulan ===== */
    '<section class="mb-8 grid gap-8 lg:grid-cols-[1fr_2fr]">' +
      '<div>' +
        '<span class="hx-badge">Mengapa ' + nama + '</span>' +
        '<h2 class="hx-h2">Belajar Terarah, <em>Paham Bertahan</em></h2>' +
        '<p class="lead">Setiap fitur disusun untuk satu tujuan: membuat konsep fisiologi jantung mudah dipahami dan diingat.</p>' +
      '</div>' +
      '<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">' +
        feat(P.book, 'Materi Terstruktur', '16 pertemuan dalam 5 blok yang runtut.') +
        feat(P.cube, 'Visual 3D &amp; AR', 'Jelajahi anatomi jantung dari berbagai sudut.') +
        feat(P.target, 'Kuis Adaptif', 'Mode latihan, ujian, dan remedial otomatis.') +
        feat(P.pulse, 'Kasus Klinis', 'Keputusan bercabang yang melatih penalaran.') +
      '</div>' +
    '</section>' +

    /* ===== CTA ===== */
    '<section class="hx-cta">' +
      '<div class="flex items-center gap-4">' +
        '<span class="grid h-12 w-12 flex-none place-items-center rounded-2xl" style="background:rgba(255,255,255,.12)">' + ic(P.pulse, 26) + '</span>' +
        '<div><h3>Langkah pertama menuju pemahaman jantung</h3><p>Mulai dari pertemuan ' + next.id + ' dan lanjutkan sesuai ritmemu.</p></div>' +
      '</div>' +
      '<a class="btn btn-lg" href="#/materi/' + next.id + '">Mulai Belajar &rarr;</a>' +
    '</section>';

    app.innerHTML = html;
  }

  App.add("beranda", render);
  App.add("", render);
  App.define("beranda", render);
})();
