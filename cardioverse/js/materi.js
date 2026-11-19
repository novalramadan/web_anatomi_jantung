/* js/materi.js — modul materi, daftar isi, pencarian, lampiran rumus/nilai normal. */
(function () {
  "use strict";

  var groups = ["Fondasi", "Listrik dan Kontraksi", "Pompa", "Regulasi dan Adaptasi", "Integrasi"];
  var searchTerm = "";

  function getModule(id) {
    return App.byId(window.DATA_PERTEMUAN, Number(id)) || window.DATA_PERTEMUAN[0];
  }

  /* ---------- kecil: potongan HTML reusable ---------- */

  function tableHtml(t) {
    var head = (t.kolom || []).map(function (c) {
      return '<th scope="col">' + App.escapeHtml(c) + '</th>';
    }).join('');

    var body = (t.baris || []).map(function (row) {
      return '<tr>' + row.map(function (cell, i) {
        return (i === 0 ? '<th scope="row">' : '<td>') + App.escapeHtml(cell) + (i === 0 ? '</th>' : '</td>');
      }).join('') + '</tr>';
    }).join('');

    return '<div class="table-wrap"><table><caption>' + App.escapeHtml(t.judul || "Tabel") + '</caption><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function listHtml(items, opts) {
    opts = opts || {};
    var tag = opts.tag || 'ul';
    var cls = opts.cls ? ' class="' + opts.cls + '"' : '';
    return '<' + tag + cls + '>' + items.map(function (x) {
      return '<li>' + App.escapeHtml(x) + '</li>';
    }).join('') + '</' + tag + '>';
  }

  function sectionHtml(id, title, inner) {
    return '<section id="' + id + '" class="mt-10 scroll-mt-24"><h2 class="mb-3">' + title + '</h2>' + inner + '</section>';
  }

  function accordionHtml(summary, inner, open) {
    return '<details class="acc mb-2"' + (open ? ' open' : '') + '><summary>' + App.escapeHtml(summary) + '</summary><div class="acc-body">' + inner + '</div></details>';
  }

  /* ---------- daftar isi ---------- */

  function tocItemHtml(m, currentId, done) {
    var cur = m.id === currentId;
    var num = done ? '&#10003;' : String(m.id).padStart(2, '0');
    var title = App.escapeHtml(m.judul);
    if (m.label_integrasi) title += ' <span class="badge badge-warn ml-1">Integrasi</span>';
    var search = App.escapeHtml((m.judul + " " + m.ringkasan).toLowerCase());

    return '<li data-search="' + search + '">'
      + '<a href="#/materi/' + m.id + '" class="flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm leading-snug no-underline transition-colors duration-150 '
      + (cur ? 'bg-brand-soft text-ink font-semibold' : 'text-ink-2 hover:bg-surface-3 hover:text-ink') + '"'
      + (cur ? ' aria-current="page"' : '') + '>'
      + '<span class="mono mt-0.5 min-w-[18px] text-[.72rem] ' + (cur ? 'text-brand' : 'text-ink-3') + '">' + num + '</span>'
      + '<span>' + title + '</span></a></li>';
  }

  function tocGroupHtml(group, currentId, doneIds) {
    var items = window.DATA_PERTEMUAN.filter(function (m) { return m.blok === group; });
    if (!items.length) return '';
    var lis = items.map(function (m) {
      return tocItemHtml(m, currentId, doneIds.indexOf(m.id) !== -1);
    }).join('');
    return '<div class="toc-group"><div class="px-2 pb-1 pt-3 text-[.7rem] font-extrabold uppercase tracking-widest text-ink-3">' + App.escapeHtml(group) + '</div><ol class="m-0 list-none p-0">' + lis + '</ol></div>';
  }

  function tocHtml(currentId) {
    var doneIds = Storage.load().materi_selesai;
    var html = '<aside class="toc sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto rounded-2xl border border-line bg-surface p-3 shadow-card" aria-label="Daftar pertemuan">'
      + '<div class="px-2 pb-2 text-[.72rem] font-extrabold uppercase tracking-widest text-ink-3">Daftar Pertemuan</div>'
      + '<div class="relative mb-3"><input id="materiSearch" type="search" placeholder="Cari materi…" aria-label="Cari materi" value="' + App.escapeHtml(searchTerm) + '" class="input pl-9"></div>';
    html += groups.map(function (g) {
      return tocGroupHtml(g, currentId, doneIds);
    }).join('');
    html += '<button class="btn btn-ghost btn-sm btn-block mt-2" type="button" id="openAppendix">Lampiran: Rumus &amp; Nilai Normal</button></aside>';
    return html;
  }

  /* ---------- artikel ---------- */

  function headerHtml(m) {
    var badges = '<span class="badge">' + App.escapeHtml(m.blok) + '</span>'
      + (m.label_integrasi ? ' <span class="badge badge-warn">Integrasi</span>' : '');
    var eyebrow = 'Pertemuan ' + m.id + ' ' + badges;
    var chipRow = '<div class="flex flex-wrap gap-2">' + m.tujuan.map(function (_, i) {
      return '<span class="badge">' + (i + 1) + ' tujuan</span>';
    }).slice(0, 1).join('') + '<span class="badge">' + m.tujuan.length + ' tujuan belajar</span></div>';

    return '<header class="mb-6 border-b border-line pb-6">'
      + '<div class="eyebrow mb-2">' + eyebrow + '</div>'
      + '<h1 class="mb-3">' + App.escapeHtml(m.judul) + '</h1>'
      + '<p class="mb-4 border-l-[3px] border-brand pl-4 text-[1.04rem] text-ink-2">' + App.escapeHtml(m.ringkasan) + '</p>'
      + chipRow
      + '</header>';
  }

  function footerHtml(m) {
    var p = Storage.load();
    var done = p.materi_selesai.indexOf(m.id) !== -1;
    var score = p.skor_kuis[m.id];
    var passed = score && score.persen >= window.CONFIG.ambangLulus * 100;

    var doneBtn = done
      ? '<button class="btn btn-primary" id="markDone" type="button" style="background:var(--success);box-shadow:0 6px 18px -6px color-mix(in srgb, var(--success) 55%, transparent)">&#10003; Materi Selesai</button>'
      : '<button class="btn btn-primary" id="markDone" type="button">Tandai Selesai</button>';
    var kuisLink = '<a class="btn" href="#/kuis/' + m.id + '">Mulai Kuis Pertemuan Ini</a>';
    var passBadge = passed ? '<span class="badge badge-success">Lulus ' + Math.round(score.persen) + '%</span>' : '';

    return '<footer class="mt-10 border-t border-line pt-6"><div class="flex flex-wrap items-center gap-3">' + doneBtn + kuisLink + passBadge + '</div></footer>';
  }

  function pagerLinkHtml(m, dir) {
    if (!m) return dir === 'next' ? '' : '<span></span>';
    var label = dir === 'next' ? 'Berikutnya →' : '← Sebelumnya';
    return '<a href="#/materi/' + m.id + '" class="flex flex-1 min-w-0 flex-col gap-0.5 rounded-xl border border-line bg-surface p-4 no-underline transition-colors duration-150 hover:border-line-strong hover:bg-surface-2 ' + (dir === 'next' ? 'text-right items-end' : '') + '">'
      + '<span class="text-[.72rem] font-bold uppercase tracking-wider text-ink-3">' + label + '</span>'
      + '<span class="text-[.92rem] font-semibold text-ink">P' + m.id + ' · ' + App.escapeHtml(m.judul) + '</span></a>';
  }

  function pagerHtml(m) {
    var prev = m.id > 1 ? App.byId(window.DATA_PERTEMUAN, m.id - 1) : null;
    var next = m.id < window.DATA_PERTEMUAN.length ? App.byId(window.DATA_PERTEMUAN, m.id + 1) : null;
    return '<nav class="mt-8 flex flex-wrap justify-between gap-3" aria-label="Navigasi materi">'
      + pagerLinkHtml(prev, 'prev') + pagerLinkHtml(next, 'next')
      + '</nav>';
  }

  function bodyHtml(m) {
    var konsep = m.konsep_inti.map(function (c, i) {
      var body = '<p>' + App.escapeHtml(c.isi) + '</p>' + (c.tabel || []).map(tableHtml).join('');
      return accordionHtml(c.judul, body, i === 0);
    }).join('');

    var html = headerHtml(m);
    html += sectionHtml('tujuan', 'Tujuan Pembelajaran', listHtml(m.tujuan, { cls: 'm-0 list-disc space-y-1 pl-5 text-ink-2' }));
    html += sectionHtml('konsep', 'Konsep Inti', konsep);
    html += sectionHtml('klinis', 'Korelasi Klinis',
      '<div class="callout c-red"><strong>Dalam konteks klinis:</strong>' + listHtml(m.korelasi_klinis, { cls: 'm-0 list-disc space-y-1 pl-5' }) + '</div>');
    html += sectionHtml('rangkuman', 'Rangkuman',
      '<div class="callout c-teal">' + listHtml(m.rangkuman, { cls: 'm-0 list-disc space-y-1 pl-5' }) + '</div>');
    html += '<section id="pertanyaan" class="mt-10 scroll-mt-24">' + accordionHtml('Pertanyaan Penuntun', listHtml(m.pertanyaan_penuntun, { tag: 'ol', cls: 'm-0 list-decimal space-y-1 pl-5' })) + '</section>';
    html += sectionHtml('bacaan', 'Bacaan', '<p class="text-[.9rem] text-ink-2">' + App.escapeHtml(m.bacaan) + '</p>');
    html += footerHtml(m);
    html += pagerHtml(m);
    return html;
  }

  /* ---------- lampiran (modal) ---------- */

  function appendixHtml(d) {
    return '<div class="flex items-center justify-between gap-3 mb-3"><h2 id="appTitle" class="m-0">Lampiran Ringkas</h2>'
      + '<button class="btn btn-ghost btn-sm" id="closeAppendix" aria-label="Tutup">Tutup</button></div>'
      + accordionHtml('Rumus ringkas', tableHtml({ judul: "Rumus", kolom: ["Besaran", "Rumus", "Catatan"], baris: d.rumus }), true)
      + accordionHtml('Nilai normal dewasa', tableHtml({ judul: "Nilai normal (perkiraan)", kolom: ["Parameter", "Nilai"], baris: d.normal }))
      + accordionHtml('Glosarium', tableHtml({ judul: "Istilah fisiologi", kolom: ["Istilah", "Definisi"], baris: d.glosarium }));
  }

  function openAppendix() {
    var old = document.getElementById("appendixModal");
    if (old) { old.remove(); return; }

    var overlay = document.createElement("div");
    overlay.id = "appendixModal";
    overlay.className = "modal-back show";
    overlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="appTitle">' + appendixHtml(window.DATA_LAMPIRAN) + '</div>';
    document.body.appendChild(overlay);

    var closeBtn = document.getElementById("closeAppendix");
    closeBtn.focus();
    closeBtn.addEventListener("click", function () { overlay.remove(); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
    document.addEventListener("keydown", function closeKey(e) {
      if (e.key === "Escape" && document.getElementById("appendixModal")) {
        document.getElementById("appendixModal").remove();
        document.removeEventListener("keydown", closeKey);
      }
    });
  }

  /* ---------- render & event ---------- */

  function bindSearch() {
    var search = document.getElementById("materiSearch");
    if (!search) return;
    search.addEventListener("input", function () {
      searchTerm = this.value;
      var q = searchTerm.toLowerCase().trim();
      document.querySelectorAll(".toc li[data-search]").forEach(function (li) {
        li.hidden = q && li.dataset.search.indexOf(q) === -1;
      });
    });
  }

  function render(app, params) {
    if (!window.DATA_PERTEMUAN || !window.DATA_PERTEMUAN.length) {
      app.innerHTML = '<div class="surface-card p-6"><h1>Materi belum tersedia</h1><p class="text-ink-2">Periksa data/pertemuan.js.</p></div>';
      return;
    }
    var id = Number(params[0]) || 1;
    var m = getModule(id);

    app.innerHTML = '<div class="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">' + tocHtml(m.id) + '<article class="min-w-0 max-w-[72ch]">' + bodyHtml(m) + '</article></div>';

    bindSearch();

    var mark = document.getElementById("markDone");
    if (mark) mark.addEventListener("click", function () {
      Storage.update(function (p) {
        if (p.materi_selesai.indexOf(m.id) === -1) p.materi_selesai.push(m.id);
      });
      App.toast("Pertemuan " + m.id + " ditandai selesai. Lanjutkan dengan kuis.");
      render(app, [String(m.id)]);
    });

    var appendix = document.getElementById("openAppendix");
    if (appendix) appendix.addEventListener("click", openAppendix);
  }

  App.add("materi", render);
})();
