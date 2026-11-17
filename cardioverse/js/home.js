/* js/home.js — beranda: hero, 4 kartu besar, progres, lanjutkan belajar */
(function () {
  var SVG_LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M16 28S4 20.5 4 12.8C4 8.9 7 6 10.6 6c2.4 0 4.3 1.2 5.4 3 1.1-1.8 3-3 5.4-3C25 6 28 8.9 28 12.8 28 20.5 16 28 16 28z" fill="url(#g)"/><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset="1" stop-color="#35d6a4"/></linearGradient></defs></svg>';

  function ekgPath() {
    var w = 600, h = 130, pts = [];
    var base = 70;
    pts.push("M0," + base);
    var x = 0;
    function seg(dx, dy) { x += dx; pts.push("L" + x + "," + (base + dy)); }
    while (x < w) {
      seg(28, 0);
      seg(8, -8); seg(8, 8); // P
      seg(14, 0);
      seg(6, -6); // Q
      seg(10, -50); // R
      seg(10, 56); // S
      seg(8, 0); seg(6, -4); seg(8, 0); // back to base + T
      seg(10, -14); seg(12, 14);
      seg(28, 0);
    }
    return pts.join(" ");
  }

  function render(app, params) {
    var p = Storage.load();
    var total = window.DATA_PERTEMUAN.length;
    var done = p.materi_selesai.length;
    var pctDone = App.pct(done, total);
    var kuisTertinggi = 0;
    Object.keys(p.skor_kuis).forEach(function (k) {
      var v = p.skor_kuis[k]; if (v && v.persen > kuisTertinggi) kuisTertinggi = v.persen;
    });
    var kasusSelesai = Object.keys(p.kasus_selesai).length;
    var markerDip = p.marker_dipindai.length;

    // next unfinished pertemuan
    var next = window.DATA_PERTEMUAN.find(function (x) { return p.materi_selesai.indexOf(x.id) === -1; }) || window.DATA_PERTEMUAN[0];

    var html = '' +
    '<section class="hero">' +
      '<div class="pulse-trace" aria-hidden="true"><svg viewBox="0 0 600 130" preserveAspectRatio="none"><path d="' + ekgPath() + '"/></svg></div>' +
      '<div class="eyebrow"><span>Fisiologi Jantung</span></div>' +
      '<h1>' + App.escapeHtml(window.CONFIG.namaWeb) + '</h1>' +
      '<p class="lead">Empat jalur belajar yang saling terhubung — baca modul, uji pemahaman dengan kuis, tangani kasus di Visual Novel, dan jelajahi jantung dalam 3D lewat AR Scanner.</p>' +
      '<div class="hero-actions">' +
        '<a class="btn btn-primary btn-lg" href="#/materi/' + next.id + '">Lanjutkan Belajar &rarr; P' + next.id + '</a>' +
        '<a class="btn btn-lg" href="#/kuis">Mulai Kuis</a>' +
      '</div>' +
      '<div class="hero-meta">' +
        '<div><span class="k">' + done + '/' + total + '</span><span class="v">Materi selesai</span></div>' +
        '<div><span class="k">' + kuisTertinggi + '%</span><span class="v">Skor kuis terbaik</span></div>' +
        '<div><span class="k">' + kasusSelesai + '/' + window.DATA_KASUS.length + '</span><span class="v">Kasus VN</span></div>' +
        '<div><span class="k">' + markerDip + '/' + window.DATA_MARKER.length + '</span><span class="v">Marker AR</span></div>' +
      '</div>' +
    '</section>' +
    '<div class="section-head"><h2>Empat Modul</h2></div>' +
      '<div class="mod-grid">' +
      modCard("Materi", "Materi", "16 pertemuan, 5 blok. Ringkasan, tujuan, konsep inti, korelasi klinis.", p.materi_selesai.length + " / " + total + " selesai", p.materi_selesai.length === total) +
      modCard("Kuis", "Kuis", "41 soal PG, 6 esai, mode latihan & ujian. Daftar remedial otomatis.", kuisTertinggi + "% terbaik", kuisTertinggi >= (window.CONFIG.ambangLulus * 100)) +
      modCard("Visual Novel", "vn", "Kasus kardiovaskular bercabang. Keputusanmu mengubah monitor pasien.", kasusSelesai + " / " + window.DATA_KASUS.length + " selesai", kasusSelesai === window.DATA_KASUS.length) +
      modCard("AR Scanner", "ar", "Arahkan kamera ke marker barcode. Model 3D jantung muncul di tanganmu.", markerDip + " / " + window.DATA_MARKER.length, markerDip === window.DATA_MARKER.length) +
    '</div>';

    app.innerHTML = html;

    function modCard(title, href, desc, stat, isDone) {
      return '' +
      '<a class="mod-card ' + (isDone ? 'is-done' : '') + '" href="#/' + href + '">' +
        '<span class="num">' + title.toUpperCase() + '</span>' +
        '<h3>' + title + '</h3>' +
        '<p class="small muted">' + desc + '</p>' +
        '<div class="meta"><span class="badge ' + (isDone ? 'badge-teal' : '') + '">' + stat + '</span></div>' +
        (isDone ? '<span class="tick" aria-label="selesai">&#10003;</span>' : '') +
      '</a>';
    }
  }

  App.add("beranda", render);
  App.add("", render);
  App.define("beranda", render);
})();
