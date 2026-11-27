/* js/materi.js — Materi bergaya course: katalog kursus, pemutar pelajaran bertahap, progres, pencarian, lampiran. */
(function () {
  "use strict";

  var groups = ["Fondasi", "Listrik dan Kontraksi", "Pompa", "Regulasi dan Adaptasi", "Integrasi"];
  var searchTerm = "";
  var keyHandler = null;

  function esc(s) { return App.escapeHtml(s); }
  function getModule(id) { return App.byId(window.DATA_PERTEMUAN, Number(id)) || window.DATA_PERTEMUAN[0]; }
  function stripNum(s) { return String(s).replace(/^\s*\d+\s*[.)]\s*/, ""); }

  function ic(path, size) {
    return '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }
  var I = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    book: '<path d="M2 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
    pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>'
  };

  /* ---------- data bantu ---------- */

  function steps(m) {
    var s = [{ key: "intro", label: "Pengantar" }];
    m.konsep_inti.forEach(function (c, i) { s.push({ key: "k" + i, label: stripNum(c.judul) }); });
    s.push({ key: "klinis", label: "Korelasi Klinis" });
    s.push({ key: "rangkum", label: "Rangkuman" });
    s.push({ key: "latihan", label: "Latihan & Selesai" });
    return s;
  }

  function minutes(m) {
    var words = JSON.stringify([m.ringkasan, m.tujuan, m.konsep_inti, m.korelasi_klinis, m.rangkuman]).split(/\s+/).length;
    return Math.max(5, Math.round(words / 110));
  }

  function visited(p, id) { return ((p.materi_langkah || {})[id]) || []; }

  function lessonPct(p, m) {
    if (p.materi_selesai.indexOf(m.id) !== -1) return 100;
    return App.pct(visited(p, m.id).length, steps(m).length);
  }

  function paragraphs(text) {
    var parts = String(text).replace(/([.!?])\s+(?=[A-Z(\[])/g, "$1\u0001").split("\u0001");
    var out = [], lead = parts.shift() || "";
    for (var i = 0; i < parts.length; i += 2) out.push(parts.slice(i, i + 2).join(" "));
    return { lead: lead, rest: out };
  }

  /* ---------- komponen kecil ---------- */

  function tableHtml(t) {
    var head = (t.kolom || []).map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('');
    var body = (t.baris || []).map(function (row) {
      return '<tr>' + row.map(function (cell, i) {
        return (i === 0 ? '<th scope="row">' : '<td>') + esc(cell) + (i === 0 ? '</th>' : '</td>');
      }).join('') + '</tr>';
    }).join('');
    return '<div class="table-wrap my-4"><table><caption>' + esc(t.judul || "Tabel") + '</caption><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function listHtml(items, opts) {
    opts = opts || {};
    var tag = opts.tag || 'ul';
    var cls = opts.cls ? ' class="' + opts.cls + '"' : '';
    return '<' + tag + cls + '>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</' + tag + '>';
  }

  function accordionHtml(summary, inner, open) {
    return '<details class="acc mb-2"' + (open ? ' open' : '') + '><summary>' + esc(summary) + '</summary><div class="acc-body">' + inner + '</div></details>';
  }

  function statusIcon(p, m, curId) {
    var done = p.materi_selesai.indexOf(m.id) !== -1;
    if (done) return '<span class="cs-dot done">' + ic(I.check, 12) + '</span>';
    if (m.id === curId) return '<span class="cs-dot now"></span>';
    if (visited(p, m.id).length) return '<span class="cs-dot part"></span>';
    return '<span class="cs-dot">' + m.id + '</span>';
  }

  /* ---------- sidebar kurikulum ---------- */

  function curriculumHtml(curId) {
    var p = Storage.load();
    var total = window.DATA_PERTEMUAN.length;
    var done = p.materi_selesai.length;
    var pct = App.pct(done, total);

    var html = '<aside class="toc cs-side" aria-label="Daftar pertemuan">'
      + '<div class="cs-sidehead"><div class="flex items-center justify-between text-[.78rem] font-bold"><span>Progres kursus</span><span class="text-brand">' + pct + '%</span></div>'
      + '<div class="bar mt-2"><i style="width:' + pct + '%"></i></div>'
      + '<div class="mt-1.5 text-[.74rem] text-ink-3">' + done + ' dari ' + total + ' pertemuan selesai</div></div>'
      + '<div class="relative mb-2"><input id="materiSearch" type="search" placeholder="Cari materi…" aria-label="Cari materi" value="' + esc(searchTerm) + '" class="input"></div>';

    groups.forEach(function (g) {
      var items = window.DATA_PERTEMUAN.filter(function (m) { return m.blok === g; });
      if (!items.length) return;
      var gDone = items.filter(function (m) { return p.materi_selesai.indexOf(m.id) !== -1; }).length;
      var open = items.some(function (m) { return m.id === curId; }) || !curId;
      html += '<details class="cs-group"' + (open ? ' open' : '') + '><summary><span>' + esc(g) + '</span><em>' + gDone + '/' + items.length + '</em></summary><ol class="m-0 list-none p-0">';
      items.forEach(function (m) {
        var cur = m.id === curId;
        var search = esc((m.judul + " " + m.ringkasan).toLowerCase());
        html += '<li data-search="' + search + '"><a href="#/materi/' + m.id + '" class="cs-item' + (cur ? ' cur' : '') + '"' + (cur ? ' aria-current="page"' : '') + '>'
          + statusIcon(p, m, curId)
          + '<span class="min-w-0"><span class="block">' + esc(m.judul) + '</span>'
          + (m.label_integrasi ? '<span class="badge badge-warn mt-1">Integrasi</span>' : '') + '</span></a></li>';
      });
      html += '</ol></details>';
    });
    html += '<button class="btn btn-sm btn-block mt-3" type="button" id="openAppendix">' + ic(I.book, 15) + ' Rumus &amp; Nilai Normal</button></aside>';
    return html;
  }

  /* ---------- halaman katalog kursus ---------- */

  function courseCard(p, m) {
    var pct = lessonPct(p, m);
    var done = p.materi_selesai.indexOf(m.id) !== -1;
    var score = p.skor_kuis[m.id];
    var st = done ? '<span class="badge badge-success">Selesai</span>' : (pct > 0 ? '<span class="badge badge-brand">Berjalan ' + pct + '%</span>' : '<span class="badge">Belum mulai</span>');
    return '<li data-search="' + esc((m.judul + " " + m.ringkasan).toLowerCase()) + '"><a class="cs-course" href="#/materi/' + m.id + '">'
      + '<div class="flex items-center justify-between gap-2"><span class="cs-num">' + String(m.id).padStart(2, '0') + '</span>' + st + '</div>'
      + '<h3>' + esc(m.judul) + '</h3>'
      + '<p>' + esc(m.ringkasan) + '</p>'
      + '<div class="mt-auto"><div class="bar"><i style="width:' + pct + '%"></i></div>'
      + '<div class="cs-meta"><span>' + ic(I.layers, 14) + m.konsep_inti.length + ' konsep</span><span>' + ic(I.clock, 14) + '±' + minutes(m) + ' menit</span>'
      + (score ? '<span>' + ic(I.target, 14) + 'Kuis ' + Math.round(score.persen) + '%</span>' : '') + '</div></div></a></li>';
  }

  function renderCatalog(app) {
    var p = Storage.load();
    var all = window.DATA_PERTEMUAN;
    var done = p.materi_selesai.length;
    var pct = App.pct(done, all.length);
    var next = all.find(function (x) { return p.materi_selesai.indexOf(x.id) === -1; }) || all[0];
    var started = visited(p, next.id).length > 0;
    var totalMin = all.reduce(function (a, m) { return a + minutes(m); }, 0);

    var html = '<section class="cs-banner">'
      + '<div><span class="hx-badge">Kursus</span><h1 class="mt-3 mb-2" style="color:#fff">Fisiologi Jantung</h1>'
      + '<p class="m-0 max-w-[56ch]" style="color:#CFE6DA">' + all.length + ' pertemuan dalam ' + groups.length + ' blok. Belajar bertahap, tandai progresmu, lalu uji pemahaman lewat kuis.</p>'
      + '<div class="cs-bannermeta"><span>' + ic(I.book, 15) + all.length + ' pertemuan</span><span>' + ic(I.clock, 15) + '±' + Math.round(totalMin / 60) + ' jam belajar</span><span>' + ic(I.check, 15) + done + ' selesai</span></div></div>'
      + '<div class="cs-resume"><div class="text-[.72rem] font-extrabold uppercase tracking-widest" style="color:#9FD3BA">' + (started ? 'Lanjutkan belajar' : 'Mulai dari sini') + '</div>'
      + '<div class="mt-1 text-[1.02rem] font-bold leading-snug" style="color:#fff">P' + next.id + ' · ' + esc(next.judul) + '</div>'
      + '<div class="bar mt-3" style="background:rgba(255,255,255,.18)"><i style="width:' + pct + '%;background:#7FD1AA"></i></div>'
      + '<div class="mt-1 text-[.74rem]" style="color:#CFE6DA">Progres kursus ' + pct + '%</div>'
      + '<a class="btn btn-lg mt-4" style="background:#fff;color:#0F4D3A;border-color:transparent" href="#/materi/' + next.id + '">' + ic(I.play, 16) + (started ? 'Lanjutkan' : 'Mulai Belajar') + '</a></div>'
      + '</section>';

    html += '<div class="mb-6 flex flex-wrap items-center gap-3">'
      + '<div class="min-w-[220px] flex-1"><input id="materiSearch" type="search" placeholder="Cari pertemuan atau topik…" aria-label="Cari materi" value="' + esc(searchTerm) + '" class="input"></div>'
      + '<button class="btn" type="button" id="openAppendix">' + ic(I.book, 16) + ' Rumus &amp; Nilai Normal</button></div>';

    groups.forEach(function (g, gi) {
      var items = all.filter(function (m) { return m.blok === g; });
      if (!items.length) return;
      var gDone = items.filter(function (m) { return p.materi_selesai.indexOf(m.id) !== -1; }).length;
      html += '<section class="cs-section mb-8"><div class="mb-3 flex items-end justify-between gap-3"><div><div class="eyebrow mb-1"><span>Blok ' + (gi + 1) + '</span></div><h2 class="m-0">' + esc(g) + '</h2></div><span class="badge">' + gDone + ' / ' + items.length + ' selesai</span></div>'
        + '<ol class="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">' + items.map(function (m) { return courseCard(p, m); }).join('') + '</ol></section>';
    });

    app.innerHTML = html;
    bindSearch(true);
    bindAppendix();
  }

  /* ---------- pemutar pelajaran ---------- */

  function stepperHtml(m, list, cur, vis) {
    return '<nav class="cs-steps" aria-label="Langkah pelajaran">' + list.map(function (s, i) {
      var isDone = vis.indexOf(i) !== -1 && i !== cur;
      return '<a href="#/materi/' + m.id + '/' + i + '" class="cs-step' + (i === cur ? ' cur' : '') + (isDone ? ' done' : '') + '"' + (i === cur ? ' aria-current="step"' : '') + ' title="' + esc(s.label) + '">'
        + '<span class="n">' + (isDone ? ic(I.check, 12) : (i + 1)) + '</span><span class="t">' + esc(s.label) + '</span></a>';
    }).join('') + '</nav>';
  }

  function conceptHtml(c, idx, total) {
    var pr = paragraphs(c.isi);
    var html = '<div class="eyebrow mb-2"><span>Konsep ' + (idx + 1) + ' dari ' + total + '</span></div>'
      + '<h2 class="mb-3">' + esc(stripNum(c.judul)) + '</h2>'
      + '<p class="cs-lead">' + esc(pr.lead) + '</p>'
      + pr.rest.map(function (t) { return '<p class="cs-p">' + esc(t) + '</p>'; }).join('')
      + (c.tabel || []).map(tableHtml).join('');
    return html;
  }

  function objectivesHtml(m, p) {
    var chk = ((p.materi_tujuan || {})[m.id]) || [];
    return '<ul class="cs-obj m-0 list-none p-0">' + m.tujuan.map(function (t, i) {
      var on = chk.indexOf(i) !== -1;
      return '<li><button type="button" class="cs-check' + (on ? ' on' : '') + '" data-obj="' + i + '" aria-pressed="' + on + '"><span class="box">' + (on ? ic(I.check, 14) : '') + '</span><span>' + esc(t) + '</span></button></li>';
    }).join('') + '</ul>';
  }

  function stepBody(m, list, cur, p) {
    var key = list[cur].key;
    var h = '';
    if (key === "intro") {
      h += '<div class="eyebrow mb-2"><span>Pengantar</span></div><h2 class="mb-3">Apa yang akan kamu pelajari</h2>'
        + '<p class="cs-lead">' + esc(m.ringkasan) + '</p>'
        + '<div class="cs-facts"><div><b>' + m.konsep_inti.length + '</b><span>konsep inti</span></div><div><b>±' + minutes(m) + '</b><span>menit</span></div><div><b>' + m.tujuan.length + '</b><span>tujuan belajar</span></div></div>'
        + '<h3 id="tujuan" class="mb-1 mt-6">Tujuan Pembelajaran</h3><p class="small muted mt-0">Centang tujuan yang sudah kamu kuasai.</p>'
        + objectivesHtml(m, p);
    } else if (/^k\d+$/.test(key)) {
      var i = Number(key.slice(1));
      h += '<div id="konsep">' + conceptHtml(m.konsep_inti[i], i, m.konsep_inti.length) + '</div>';
    } else if (key === "klinis") {
      h += '<div class="eyebrow mb-2"><span>Klinis</span></div><h2 id="klinis" class="mb-3">Korelasi Klinis</h2>'
        + '<div class="callout c-red"><strong>Dalam konteks klinis:</strong>' + listHtml(m.korelasi_klinis, { cls: 'm-0 mt-2 list-disc space-y-1.5 pl-5' }) + '</div>';
    } else if (key === "rangkum") {
      h += '<div class="eyebrow mb-2"><span>Ringkas</span></div><h2 id="rangkuman" class="mb-3">Rangkuman</h2>'
        + '<div class="callout c-teal">' + listHtml(m.rangkuman, { cls: 'm-0 list-disc space-y-1.5 pl-5' }) + '</div>';
    } else {
      var done = p.materi_selesai.indexOf(m.id) !== -1;
      var score = p.skor_kuis[m.id];
      var passed = score && score.persen >= window.CONFIG.ambangLulus * 100;
      var notes = (p.materi_catatan || {})[m.id] || {};
      h += '<div class="eyebrow mb-2"><span>Latihan</span></div><h2 class="mb-3">Cek Pemahaman</h2>'
        + '<p class="cs-p">Coba jawab dulu dengan kata-katamu sendiri. Catatanmu tersimpan otomatis di perangkat ini.</p>'
        + '<div id="pertanyaan" class="mb-6">' + m.pertanyaan_penuntun.map(function (q, i) {
          return '<details class="acc mb-2"' + (i === 0 ? ' open' : '') + '><summary>' + ic(I.help, 16) + '<span class="flex-1">' + esc(q) + '</span></summary>'
            + '<div class="acc-body"><textarea class="input" data-note="' + i + '" rows="3" placeholder="Tulis jawabanmu di sini…">' + esc(notes[i] || "") + '</textarea></div></details>';
        }).join('') + '</div>'
        + '<div class="cs-finish"><div><div class="font-extrabold text-ink">' + (done ? 'Pertemuan ini sudah selesai 🎉' : 'Siap menyelesaikan pertemuan ini?') + '</div>'
        + '<div class="small muted mt-0.5">Lanjutkan dengan kuis untuk menguji pemahamanmu.</div></div>'
        + '<div class="flex flex-wrap items-center gap-3">'
        + (done
          ? '<button class="btn btn-primary" id="markDone" type="button" style="background:var(--success)">&#10003; Materi Selesai</button>'
          : '<button class="btn btn-primary" id="markDone" type="button">Tandai Selesai</button>')
        + '<a class="btn" href="#/kuis/' + m.id + '">Mulai Kuis Pertemuan Ini</a>'
        + (passed ? '<span class="badge badge-success">Lulus ' + Math.round(score.persen) + '%</span>' : '') + '</div></div>'
        + '<section id="bacaan" class="mt-6"><h3 class="mb-1">Bacaan</h3><p class="m-0 text-[.9rem] text-ink-2">' + esc(m.bacaan) + '</p></section>';
    }
    return h;
  }

  function lessonNav(m, list, cur) {
    var prevStep = cur > 0 ? '#/materi/' + m.id + '/' + (cur - 1) : (m.id > 1 ? '#/materi/' + (m.id - 1) + '/' + (steps(App.byId(window.DATA_PERTEMUAN, m.id - 1)).length - 1) : null);
    var last = cur === list.length - 1;
    var nextStep = !last ? '#/materi/' + m.id + '/' + (cur + 1) : (m.id < window.DATA_PERTEMUAN.length ? '#/materi/' + (m.id + 1) + '/0' : null);
    var nextLabel = !last ? 'Lanjut' : 'Pertemuan berikutnya';
    return '<div class="cs-lessonnav">'
      + (prevStep ? '<a class="btn" href="' + prevStep + '">' + ic(I.left, 16) + ' Sebelumnya</a>' : '<span></span>')
      + '<span class="cs-hint">gunakan tombol ← → di keyboard</span>'
      + (nextStep ? '<a class="btn btn-primary" href="' + nextStep + '">' + nextLabel + ' ' + ic(I.right, 16) + '</a>' : '<span></span>')
      + '</div>';
  }

  function pagerHtml(m) {
    var prev = m.id > 1 ? App.byId(window.DATA_PERTEMUAN, m.id - 1) : null;
    var next = m.id < window.DATA_PERTEMUAN.length ? App.byId(window.DATA_PERTEMUAN, m.id + 1) : null;
    function link(x, dir) {
      if (!x) return '<span></span>';
      return '<a href="#/materi/' + x.id + '" class="cs-pg' + (dir === 'next' ? ' r' : '') + '"><span class="k">' + (dir === 'next' ? 'Pertemuan berikutnya →' : '← Pertemuan sebelumnya') + '</span><span class="v">P' + x.id + ' · ' + esc(x.judul) + '</span></a>';
    }
    return '<nav class="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Navigasi materi">' + link(prev, 'prev') + link(next, 'next') + '</nav>';
  }

  function renderLesson(app, params) {
    var m = getModule(params[0]);
    var list = steps(m);
    var cur = Math.max(0, Math.min(list.length - 1, parseInt(params[1], 10) || 0));

    Storage.update(function (p) {
      p.materi_langkah = p.materi_langkah || {};
      var v = p.materi_langkah[m.id] = p.materi_langkah[m.id] || [];
      if (v.indexOf(cur) === -1) v.push(cur);
    });
    var p = Storage.load();
    var vis = visited(p, m.id);
    var pct = lessonPct(p, m);
    var badges = '<span class="badge">' + esc(m.blok) + '</span>' + (m.label_integrasi ? ' <span class="badge badge-warn">Integrasi</span>' : '');

    var head = '<header class="cs-lessonhead">'
      + '<div class="cs-crumb"><a href="#/materi">Materi</a><span>›</span><span>' + esc(m.blok) + '</span><span>›</span><span>P' + m.id + '</span></div>'
      + '<div class="mt-2 flex flex-wrap items-center gap-2"><span class="eyebrow">Pertemuan ' + m.id + '</span> ' + badges
      + '<span class="badge">' + m.tujuan.length + ' tujuan belajar</span><span class="badge">±' + minutes(m) + ' menit</span></div>'
      + '<h1 class="mt-2 mb-3">' + esc(m.judul) + '</h1>'
      + '<div class="flex items-center gap-3"><div class="bar lg flex-1"><i style="width:' + pct + '%"></i></div><span class="text-[.8rem] font-bold text-brand">' + pct + '%</span></div>'
      + '</header>';

    app.innerHTML = '<div class="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">' + curriculumHtml(m.id)
      + '<article class="min-w-0">' + head + stepperHtml(m, list, cur, vis)
      + '<div class="cs-card" id="lessonCard">' + stepBody(m, list, cur, p) + '</div>'
      + lessonNav(m, list, cur)
      + (cur === list.length - 1 ? pagerHtml(m) : '')
      + '</article></div>';

    bindSearch(false);
    bindAppendix();

    var mark = document.getElementById("markDone");
    if (mark) mark.addEventListener("click", function () {
      Storage.update(function (st) { if (st.materi_selesai.indexOf(m.id) === -1) st.materi_selesai.push(m.id); });
      App.toast("Pertemuan " + m.id + " selesai. Lanjutkan dengan kuis.");
      renderLesson(app, [String(m.id), String(cur)]);
    });

    document.querySelectorAll("[data-obj]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.dataset.obj);
        Storage.update(function (st) {
          st.materi_tujuan = st.materi_tujuan || {};
          var a = st.materi_tujuan[m.id] = st.materi_tujuan[m.id] || [];
          var k = a.indexOf(i);
          if (k === -1) a.push(i); else a.splice(k, 1);
        });
        var on = b.classList.toggle("on");
        b.setAttribute("aria-pressed", on);
        b.querySelector(".box").innerHTML = on ? ic(I.check, 14) : "";
      });
    });

    document.querySelectorAll("[data-note]").forEach(function (t) {
      t.addEventListener("input", function () {
        var i = t.dataset.note, v = t.value;
        Storage.update(function (st) {
          st.materi_catatan = st.materi_catatan || {};
          var o = st.materi_catatan[m.id] = st.materi_catatan[m.id] || {};
          o[i] = v;
        });
      });
    });

    // navigasi keyboard ← →
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = function (e) {
      if (!/^#\/materi\/\d+/.test(location.hash)) { document.removeEventListener("keydown", keyHandler); keyHandler = null; return; }
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
      if (e.key === "ArrowRight" && cur < list.length - 1) location.hash = "#/materi/" + m.id + "/" + (cur + 1);
      if (e.key === "ArrowLeft" && cur > 0) location.hash = "#/materi/" + m.id + "/" + (cur - 1);
    };
    document.addEventListener("keydown", keyHandler);
  }

  /* ---------- lampiran (modal) ---------- */

  function appendixHtml(d) {
    return accordionHtml('Rumus ringkas', tableHtml({ judul: "Rumus", kolom: ["Besaran", "Rumus", "Catatan"], baris: d.rumus }), true)
      + accordionHtml('Nilai normal dewasa', tableHtml({ judul: "Nilai normal (perkiraan)", kolom: ["Parameter", "Nilai"], baris: d.normal }))
      + accordionHtml('Glosarium', tableHtml({ judul: "Istilah fisiologi", kolom: ["Istilah", "Definisi"], baris: d.glosarium }));
  }

  var appendixModal = null;
  function openAppendix() {
    if (appendixModal) { appendixModal.close(); return; }
    appendixModal = App.modal({
      id: "appendixModal",
      title: "Lampiran Ringkas",
      body: appendixHtml(window.DATA_LAMPIRAN),
      size: "lg",
      confirmText: "Tutup",
      onClose: function () { appendixModal = null; }
    });
  }

  function bindAppendix() {
    var b = document.getElementById("openAppendix");
    if (b) b.addEventListener("click", openAppendix);
  }

  function bindSearch(catalog) {
    var search = document.getElementById("materiSearch");
    if (!search) return;
    function apply() {
      var q = searchTerm.toLowerCase().trim();
      document.querySelectorAll("li[data-search]").forEach(function (li) {
        li.hidden = !!q && li.dataset.search.indexOf(q) === -1;
      });
      if (catalog) document.querySelectorAll(".cs-section").forEach(function (s) {
        var any = Array.prototype.some.call(s.querySelectorAll("li[data-search]"), function (li) { return !li.hidden; });
        s.hidden = !any;
      });
    }
    search.addEventListener("input", function () { searchTerm = this.value; apply(); });
    if (searchTerm) apply();
  }

  /* ---------- router ---------- */

  function render(app, params) {
    if (!window.DATA_PERTEMUAN || !window.DATA_PERTEMUAN.length) {
      app.innerHTML = '<div class="surface-card p-6"><h1>Materi belum tersedia</h1><p class="text-ink-2">Periksa data/pertemuan.js.</p></div>';
      return;
    }
    if (!params || !params.length) return renderCatalog(app);
    renderLesson(app, params);
  }

  App.add("materi", render);
})();
