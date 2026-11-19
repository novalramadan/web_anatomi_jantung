/* js/home.js — beranda: hero, 4 kartu besar, progres, lanjutkan belajar */
(function () {
  var SVG_LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M16 28S4 20.5 4 12.8C4 8.9 7 6 10.6 6c2.4 0 4.3 1.2 5.4 3 1.1-1.8 3-3 5.4-3C25 6 28 8.9 28 12.8 28 20.5 16 28 16 28z" fill="url(#g)"/><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset="1" stop-color="#35d6a4"/></linearGradient></defs></svg>';

  function ekgPath() {
    // path EKG dipakai untuk aksen kecil di hero
    var w = 320, h = 60, pts = [];
    var base = 32;
    pts.push("M0," + base);
    var x = 0;
    function seg(dx, dy) { x += dx; pts.push("L" + x + "," + (base + dy)); }
    while (x < w) {
      seg(14, 0);
      seg(4, -4); seg(4, 4);
      seg(7, 0);
      seg(3, -3);
      seg(5, -25);
      seg(5, 28);
      seg(4, 0); seg(3, -2); seg(4, 0);
      seg(5, -7); seg(6, 7);
      seg(14, 0);
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

    var next = window.DATA_PERTEMUAN.find(function (x) { return p.materi_selesai.indexOf(x.id) === -1; }) || window.DATA_PERTEMUAN[0];

    function statItem(value, label) {
      return '<div class="stat"><span class="k">' + value + '</span><span class="v">' + label + '</span></div>';
    }

    function modCard(title, href, desc, stat, isDone) {
      return '<a class="surface-card group relative flex flex-col gap-3 p-5 no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-pop" href="#/' + href + '">' +
        '<div class="flex items-start justify-between gap-3">' +
          '<div class="grid h-10 w-10 place-items-center rounded-xl ' + (isDone ? 'bg-success-soft text-success' : 'bg-brand-soft text-brand') + '">' +
            modIcon(href) +
          '</div>' +
          (isDone ? '<span class="badge badge-success" aria-label="Selesai">&#10003;</span>' : '') +
        '</div>' +
        '<h3 class="m-0 text-lg font-bold text-ink">' + title + '</h3>' +
        '<p class="m-0 text-sm text-ink-2 leading-relaxed">' + desc + '</p>' +
        '<div class="mt-auto pt-2"><span class="badge ' + (isDone ? 'badge-success' : 'badge-brand') + '">' + stat + '</span></div>' +
      '</a>';
    }

    function modIcon(href) {
      var icons = {
        "Materi": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/></svg>',
        "Kuis": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="3"/></svg>',
        "vn": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/></svg>',
        "ar": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>'
      };
      return icons[href] || icons["Materi"];
    }

    var html = '' +
    '<section class="surface-card relative overflow-hidden p-6 sm:p-8 md:p-10 mb-8">' +
      '<div class="pointer-events-none absolute right-0 top-0 h-40 w-40 opacity-[.06]" aria-hidden="true">' +
        '<svg viewBox="0 0 320 60" preserveAspectRatio="none" class="ekg-mini h-full w-full"><path d="' + ekgPath() + '" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
      '</div>' +
      '<div class="relative">' +
        '<div class="eyebrow mb-3"><span>Fisiologi Jantung</span></div>' +
        '<h1 class="max-w-[22ch] mb-3">' + App.escapeHtml(window.CONFIG.namaWeb) + '</h1>' +
        '<p class="lead">Empat jalur belajar yang saling terhubung — baca modul, uji pemahaman dengan kuis, tangani kasus di Visual Novel, dan jelajahi jantung dalam 3D lewat AR Scanner.</p>' +
        '<div class="mt-6 flex flex-wrap gap-3">' +
          '<a class="btn btn-primary btn-lg" href="#/materi/' + next.id + '">Lanjutkan Belajar &rarr; P' + next.id + '</a>' +
          '<a class="btn btn-lg" href="#/kuis">Mulai Kuis</a>' +
        '</div>' +
        '<div class="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4">' +
          statItem(done + '/' + total, 'Materi selesai') +
          statItem(kuisTertinggi + '%', 'Skor kuis terbaik') +
          statItem(kasusSelesai + '/' + window.DATA_KASUS.length, 'Kasus VN') +
          statItem(markerDip + '/' + window.DATA_MARKER.length, 'Marker AR') +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div class="mb-5 flex items-end justify-between gap-4">' +
      '<div><div class="eyebrow mb-2"><span>Modul Belajar</span></div><h2 class="m-0">Empat Modul</h2></div>' +
      '<div class="hidden sm:block"><span class="badge">' + pctDone + '% keseluruhan</span></div>' +
    '</div>' +

    '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">' +
      modCard("Materi", "Materi", "16 pertemuan, 5 blok. Ringkasan, tujuan, konsep inti, korelasi klinis.", done + " / " + total + " selesai", done === total) +
      modCard("Kuis", "Kuis", "41 soal PG, 6 esai, mode latihan & ujian. Daftar remedial otomatis.", kuisTertinggi + "% terbaik", kuisTertinggi >= (window.CONFIG.ambangLulus * 100)) +
      modCard("Visual Novel", "vn", "Kasus kardiovaskular bercabang. Keputusanmu mengubah monitor pasien.", kasusSelesai + " / " + window.DATA_KASUS.length + " selesai", kasusSelesai === window.DATA_KASUS.length) +
      modCard("AR Scanner", "ar", "Arahkan kamera ke marker barcode. Model 3D jantung muncul di tanganmu.", markerDip + " / " + window.DATA_MARKER.length, markerDip === window.DATA_MARKER.length) +
    '</div>';

    app.innerHTML = html;
  }

  App.add("beranda", render);
  App.add("", render);
  App.define("beranda", render);
})();
