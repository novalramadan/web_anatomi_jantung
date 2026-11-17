/* js/materi.js — modul materi, daftar isi, pencarian, lampiran rumus/nilai normal. */
(function () {
  "use strict";

  var groups = ["Fondasi", "Listrik dan Kontraksi", "Pompa", "Regulasi dan Adaptasi", "Integrasi"];
  var searchTerm = "";

  function getModule(id) {
    return App.byId(window.DATA_PERTEMUAN, Number(id)) || window.DATA_PERTEMUAN[0];
  }

  function tableHtml(t) {
    var h = '<div class="table-wrap"><table><caption>' + App.escapeHtml(t.judul || "Tabel") + '</caption><thead><tr>';
    (t.kolom || []).forEach(function (c) { h += '<th scope="col">' + App.escapeHtml(c) + '</th>'; });
    h += '</tr></thead><tbody>';
    (t.baris || []).forEach(function (row) {
      h += '<tr>';
      row.forEach(function (cell, i) {
        h += (i === 0 ? '<th scope="row">' : '<td>') + App.escapeHtml(cell) + (i === 0 ? '</th>' : '</td>');
      });
      h += '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  function tocHtml(currentId) {
    var p = Storage.load();
    var html = '<aside class="toc" aria-label="Daftar pertemuan"><h4>Daftar Pertemuan</h4>';
    html += '<div class="searchbar"><input id="materiSearch" type="search" placeholder="Cari materi…" aria-label="Cari materi" value="' + App.escapeHtml(searchTerm) + '"></div>';
    groups.forEach(function (g) {
      var items = window.DATA_PERTEMUAN.filter(function (m) { return m.blok === g; });
      if (!items.length) return;
      html += '<div class="toc-group"><div class="toc-group-title">' + App.escapeHtml(g) + '</div><ol>';
      items.forEach(function (m) {
        var done = p.materi_selesai.indexOf(m.id) !== -1;
        var cur = m.id === currentId;
        var title = App.escapeHtml(m.judul);
        html += '<li data-search="' + App.escapeHtml((m.judul + " " + m.ringkasan).toLowerCase()) + '"><a href="#/materi/' + m.id + '" class="' + (cur ? 'cur ' : '') + (done ? 'done' : '') + '"' + (cur ? ' aria-current="page"' : '') + '>' +
          '<span class="n">' + (done ? '&#10003;' : String(m.id).padStart(2, '0')) + '</span><span>' + title + (m.label_integrasi ? ' <span class="badge badge-amber">Integrasi</span>' : '') + '</span></a></li>';
      });
      html += '</ol></div>';
    });
    html += '<button class="btn btn-ghost btn-sm btn-block" type="button" id="openAppendix">Lampiran: Rumus & Nilai Normal</button>';
    html += '</aside>';
    return html;
  }

  function bodyHtml(m) {
    var html = '';
    html += '<header>' +
      '<div class="eyebrow">Pertemuan ' + m.id + ' <span class="badge">' + App.escapeHtml(m.blok) + '</span>' + (m.label_integrasi ? ' <span class="badge badge-amber">Integrasi</span>' : '') + '</div>' +
      '<h1>' + App.escapeHtml(m.judul) + '</h1>' +
      '<p class="ringkasan">' + App.escapeHtml(m.ringkasan) + '</p>' +
      '<div class="chip-row">' + m.tujuan.map(function (_, i) { return '<span class="badge">' + (i + 1) + ' tujuan</span>'; }).slice(0, 1).join('') +
      '<span class="badge">' + m.tujuan.length + ' tujuan belajar</span></div>' +
    '</header>';

    html += '<section id="tujuan"><h2>Tujuan Pembelajaran</h2><ul class="tujuan">' + m.tujuan.map(function (x) { return '<li>' + App.escapeHtml(x) + '</li>'; }).join('') + '</ul></section>';

    html += '<section id="konsep"><h2>Konsep Inti</h2>';
    m.konsep_inti.forEach(function (c, i) {
      html += '<details class="acc" ' + (i === 0 ? 'open' : '') + '><summary>' + App.escapeHtml(c.judul) + '</summary><div class="acc-body"><p>' + App.escapeHtml(c.isi) + '</p>';
      (c.tabel || []).forEach(function (t) { html += tableHtml(t); });
      html += '</div></details>';
    });
    html += '</section>';

    html += '<section id="klinis"><h2>Korelasi Klinis</h2><div class="callout c-red"><strong>Dalam konteks klinis:</strong><ul class="korelasi">' + m.korelasi_klinis.map(function (x) { return '<li>' + App.escapeHtml(x) + '</li>'; }).join('') + '</ul></div></section>';
    html += '<section id="rangkuman"><h2>Rangkuman</h2><div class="callout c-teal"><ul>' + m.rangkuman.map(function (x) { return '<li>' + App.escapeHtml(x) + '</li>'; }).join('') + '</ul></div></section>';
    html += '<section id="pertanyaan"><details class="acc"><summary>Pertanyaan Penuntun</summary><div class="acc-body"><ol>' + m.pertanyaan_penuntun.map(function (x) { return '<li>' + App.escapeHtml(x) + '</li>'; }).join('') + '</ol></div></details></section>';
    html += '<section id="bacaan"><h2>Bacaan</h2><p class="bacaan">' + App.escapeHtml(m.bacaan) + '</p></section>';

    var p = Storage.load();
    var done = p.materi_selesai.indexOf(m.id) !== -1;
    var score = p.skor_kuis[m.id];
    var passed = score && score.persen >= window.CONFIG.ambangLulus * 100;
    html += '<footer><div class="btn-row">' +
      '<button class="btn ' + (done ? 'btn-teal' : 'btn-primary') + '" id="markDone" type="button">' + (done ? '✓ Materi Selesai' : 'Tandai Selesai') + '</button>' +
      '<a class="btn" href="#/kuis/' + m.id + '">Mulai Kuis Pertemuan Ini</a>' +
      (passed ? '<span class="badge badge-ok">Lulus ' + Math.round(score.persen) + '%</span>' : '') +
      '</div></footer>';

    var prev = m.id > 1 ? App.byId(window.DATA_PERTEMUAN, m.id - 1) : null;
    var next = m.id < 16 ? App.byId(window.DATA_PERTEMUAN, m.id + 1) : null;
    html += '<nav class="pager" aria-label="Navigasi materi">' +
      (prev ? '<a href="#/materi/' + prev.id + '"><span class="dir">← Sebelumnya</span><span class="ttl">P' + prev.id + ' · ' + App.escapeHtml(prev.judul) + '</span></a>' : '<span></span>') +
      (next ? '<a class="next" href="#/materi/' + next.id + '"><span class="dir">Berikutnya →</span><span class="ttl">P' + next.id + ' · ' + App.escapeHtml(next.judul) + '</span></a>' : '') +
      '</nav>';
    return html;
  }

  function render(app, params) {
    if (!window.DATA_PERTEMUAN || !window.DATA_PERTEMUAN.length) {
      app.innerHTML = '<div class="card"><h1>Materi belum tersedia</h1><p>Periksa data/pertemuan.js.</p></div>';
      return;
    }
    var id = Number(params[0]) || 1;
    var m = getModule(id);
    app.innerHTML = '<div class="reader">' + tocHtml(m.id) + '<article class="article">' + bodyHtml(m) + '</article></div>';

    var search = document.getElementById("materiSearch");
    if (search) search.addEventListener("input", function () {
      searchTerm = this.value;
      var q = searchTerm.toLowerCase().trim();
      document.querySelectorAll(".toc li[data-search]").forEach(function (li) {
        li.hidden = q && li.dataset.search.indexOf(q) === -1;
      });
    });

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

  function openAppendix() {
    var old = document.getElementById("appendixModal");
    if (old) { old.remove(); return; }
    var d = window.DATA_LAMPIRAN;
    var overlay = document.createElement("div");
    overlay.id = "appendixModal";
    overlay.className = "modal-back show";
    overlay.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="appTitle">' +
      '<div class="card-head"><h2 id="appTitle">Lampiran Ringkas</h2><button class="btn btn-sm btn-ghost" id="closeAppendix" aria-label="Tutup">Tutup</button></div>' +
      '<details class="acc" open><summary>Rumus ringkas</summary><div class="acc-body">' + tableHtml({ judul: "Rumus", kolom: ["Besaran", "Rumus", "Catatan"], baris: d.rumus }) + '</div></details>' +
      '<details class="acc"><summary>Nilai normal dewasa</summary><div class="acc-body">' + tableHtml({ judul: "Nilai normal (perkiraan)", kolom: ["Parameter", "Nilai"], baris: d.normal }) + '</div></details>' +
      '<details class="acc"><summary>Glosarium</summary><div class="acc-body">' + tableHtml({ judul: "Istilah fisiologi", kolom: ["Istilah", "Definisi"], baris: d.glosarium }) + '</div></details>' +
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById("closeAppendix").focus();
    document.getElementById("closeAppendix").addEventListener("click", function () { overlay.remove(); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
    document.addEventListener("keydown", function closeKey(e) {
      if (e.key === "Escape" && document.getElementById("appendixModal")) {
        document.getElementById("appendixModal").remove();
        document.removeEventListener("keydown", closeKey);
      }
    });
  }

  App.add("materi", render);
})();
