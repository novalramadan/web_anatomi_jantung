/* js/vn.js — mesin buku bercabang.
   Sumber isi: data/kasus.js (window.BOOK), disalin dari "tes buku/data.js".
   Tambahan di sini: simpan posisi, refleksi, log, progres kasus. */
(function () {
  "use strict";

  var root = null;           // #app
  var page = 0;              // halaman aktif (0 = sampul/rak kasus)
  var kasusAktif = null;     // metadata kasus yang sedang dibuka
  var kesalahan = 0;
  var riwayat = {};          // halaman yang sudah dibaca
  var logEntri = [];

  function book() { return window.BOOK; }

  function pages() { return book() ? book().pages : {}; }
  function kasusList() { return book() ? book().kasus : []; }

  // ---------- rak sampul ----------
  function renderShelf() {
    page = 0;
    kasusAktif = null;
    var p = Storage.load();
    var h = '<div class="section-head"><div class="eyebrow">Visual Novel</div><h1>Kasus Klinis Bercabang</h1>' +
      '<p class="lead">Tiga kasus dari buku latihan, ditambah satu draf bantuan hidup dasar. Setiap keputusan membawamu ke halaman berikutnya. Tidak ada dosis obat; fokus pada alasan fisiologis.</p></div>';

    h += '<div class="vn-shelf">';
    kasusList().forEach(function (k) {
      var star = (p.kasus_selesai || {})[k.id] || 0;
      var started = (p.vn_posisi || {})[k.id];
      var isDraft = (k.status_validasi || "").indexOf("draf") !== -1;
      h += '<article class="vn-cover">' +
        '<div class="vn-cover-top">' +
          '<span class="vn-cover-series">Kasus ' + App.escapeHtml(k.id) + '</span>' +
          '<h2 class="vn-cover-title">' + App.escapeHtml(k.judul) + '</h2>' +
          (star ? '<p class="vn-cover-subtitle">Selesai ' + star + '/3</p>' : '') +
        '</div>' +
        '<div class="vn-cover-bottom">' +
          '<p class="vn-cover-desc">' + App.escapeHtml(k.ringkasan || "") + '</p>' +
          '<div class="vn-cover-meta">' +
            k.pertemuan_terkait.map(function (x) {
              return '<a class="vn-cover-chip" href="#/materi/' + x + '">Pertemuan ' + x + '</a>';
            }).join("") +
            (started ? '<span class="vn-cover-chip">Berjalan</span>' : "") +
            (star ? '<span class="vn-cover-chip done">Selesai</span>' : "") +
            (isDraft ? '<span class="vn-cover-chip draft">Draf</span>' : "") +
          '</div>' +
          '<a class="vn-cover-btn" href="#/vn/' + k.id + '">' + (started ? "Lanjutkan" : "Mulai") + '</a>' +
        '</div>' +
        '</article>';
    });
    h += '</div>';

    h += '<div class="callout" style="margin-top:16px"><strong>Catatan Penanganan:</strong> kasus A–C berasal dari buku latihan; Kasus D (henti jantung mendadak) masih draf dan <em>perlu divalidasi dosen</em>. ' + App.escapeHtml(window.CONFIG.disclaimer || "") + '</div>';

    root.innerHTML = h;
  }

  // ---------- halaman buku ----------
  function renderPage() {
    var P = pages()[page];
    if (!P) { renderShelf(); return; }

    var statusCls = (P.status || "").split("-")[0];
    var statusHtml = P.status
      ? '<span class="vn-status ' + App.escapeHtml(statusCls) + '">' + App.escapeHtml(window.STATUS_LABEL[P.status] || P.status) + '</span>'
      : "";

    var vitalsHtml = (P.vitals && P.vitals.length)
      ? '<div class="vn-vitals">' + P.vitals.map(function (v) { return '<span class="vn-vital">' + v + '</span>'; }).join("") + '</div>'
      : "";

    var illusHtml = P.image ? '<figure class="vn-illustration">' + P.image + '</figure>' : "";

    var choicesHtml = "";
    if (P.choices && P.choices.length) {
      var single = P.choices.length === 1;
      choicesHtml = '<section class="vn-choices" role="group" aria-label="Pilihan">' +
        '<div class="vn-choices-header">' + (single ? "Lanjut" : "Pilihan") + '</div>' +
        '<div class="vn-choices-list">';
      P.choices.forEach(function (c) {
        choicesHtml += '<button type="button" class="vn-choice' + (c.alt ? " alt" : "") + '" data-goto="' + c.goto + '">' +
          '<span class="vn-choice-text">' + App.escapeHtml(c.text) + '</span>' +
          '<span class="vn-choice-goto">' + (c.goto === 0 ? "kembali ke sampul" : "pergi ke halaman " + c.goto) + '</span>' +
          '</button>';
      });
      choicesHtml += '</div></section>';
    }

    // halaman evaluasi = akhir kasus; tampilkan skor + refleksi
    var endHtml = "";
    if (P.status === "evaluasi") {
      finishIfEvaluasi();
      var bintang = kesalahan === 0 ? 3 : (kesalahan === 1 ? 2 : 1);
      var badgeKelas = bintang === 3 ? "tepat" : bintang === 2 ? "kurang" : "bahaya";
      var ref = ((Storage.load().refleksi || {})[kasusAktif ? kasusAktif.id : ""]) || "";
      endHtml = '<div class="vn-end-body">' +
        '<span class="vn-end-badge ' + badgeKelas + '">Kasus selesai</span>' +
        '<p class="vn-score-line">' + bintang + ' dari 3</p>' +
        '<p class="small" style="color:#6b6b6b;margin:0">Kesalahan: ' + kesalahan + '</p>' +
        '</div>' +
        '<div class="vn-end-refleksi"><p>Refleksi singkat (tersimpan di perangkat ini):</p>' +
        '<textarea id="vnRefleksi" aria-label="Refleksi">' + App.escapeHtml(ref) + '</textarea></div>' +
        '<div class="vn-end-nav"><button class="vn-cover-btn" id="vnRefSave" type="button">Simpan Refleksi</button></div>';
    }

    var html = '<div class="section-head"><div class="btn-row" style="justify-content:space-between">' +
      '<div class="eyebrow">Visual Novel</div>' +
      '<a class="btn btn-sm btn-ghost" href="#/vn">Daftar Kasus</a></div></div>';

    html += '<div class="vn-book"><article class="vn-page' + (P.status === "evaluasi" ? " vn-end-page" : "") + '">' +
      '<nav class="vn-page-nav">' +
        '<button type="button" class="vn-nav-btn" id="vnShelf" title="Daftar kasus">&#8962; Kasus</button>' +
        '<span class="vn-case-tag">' + App.escapeHtml(P.tag || "") + '</span>' +
        '<button type="button" class="vn-nav-btn" id="vnLog" title="Log">Log</button>' +
      '</nav>' +
      statusHtml +
      '<h2 class="vn-title">' + App.escapeHtml(P.title || "") + '</h2>' +
      vitalsHtml +
      '<div class="vn-story">' + (P.story || "") + '</div>' +
      illusHtml +
      choicesHtml +
      endHtml +
      '<footer class="vn-page-number">' + page + '</footer>' +
      '</article></div>';

    html += '<div class="vn-toolbar">' +
      '<button type="button" id="vnSave">Simpan</button>' +
      '<button type="button" id="vnLoad">Muat</button>' +
      '</div>';

    root.innerHTML = html;

    root.querySelectorAll("[data-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () { gotoPage(parseInt(btn.dataset.goto, 10)); });
    });
    document.getElementById("vnShelf").addEventListener("click", function () { App.navigate("#/vn"); });
    document.getElementById("vnLog").addEventListener("click", showLog);
    document.getElementById("vnSave").addEventListener("click", doSave);
    document.getElementById("vnLoad").addEventListener("click", doLoad);

    var refSave = document.getElementById("vnRefSave");
    if (refSave) {
      var refInput = document.getElementById("vnRefleksi");
      refInput.addEventListener("input", function () {
        var kid = kasusAktif ? kasusAktif.id : "";
        Storage.update(function (pp) {
          pp.refleksi = pp.refleksi || {};
          pp.refleksi[kid] = refInput.value;
        });
      });
      refSave.addEventListener("click", function () {
        var kid = kasusAktif ? kasusAktif.id : "";
        Storage.update(function (pp) {
          pp.refleksi = pp.refleksi || {};
          pp.refleksi[kid] = refInput.value;
        });
        App.toast("Refleksi disimpan.");
      });
    }
  }

  // ---------- navigasi ----------
  function gotoPage(num) {
    if (!num || !pages()[num]) { renderShelf(); return; }
    var P = pages()[num];
    if (P.status && ["tepat", "kurang", "keliru", "bahaya", "kurang-sesuai"].indexOf(P.status) !== -1) {
      if (P.status !== "tepat") kesalahan++;
    }
    riwayat[num] = true;
    logEntri.push({ who: "Halaman", teks: num + " · " + (P.title || "") });
    page = num;
    var m = /Halaman\s+([A-Z])\d+/.exec(P.tag || "");
    if (m) {
      var k = kasusList().find(function (x) { return x.id === m[1]; });
      if (k) kasusAktif = k;
    }
    savePosisi();
    renderPage();
  }

  function savePosisi() {
    if (!kasusAktif) return;
    Storage.update(function (p) {
      p.vn_posisi = p.vn_posisi || {};
      p.vn_posisi[kasusAktif.id] = { halaman: page, kesalahan: kesalahan };
    });
  }

  function finishIfEvaluasi() {
    // evaluasi = akhir kasus, skor 3/2/1 dari jumlah kesalahan
    var stars = kesalahan === 0 ? 3 : (kesalahan === 1 ? 2 : 1);
    if (!kasusAktif) return;
    Storage.update(function (p) {
      p.kasus_selesai = p.kasus_selesai || {};
      if (stars > (p.kasus_selesai[kasusAktif.id] || 0)) p.kasus_selesai[kasusAktif.id] = stars;
      p.vn_posisi = p.vn_posisi || {};
      delete p.vn_posisi[kasusAktif.id];
    });
  }

  function showLog() {
    var wrap = document.createElement("div");
    wrap.className = "modal-back show";
    var html = '<div class="modal"><div class="card-head"><h2>Log Buku</h2><button class="btn btn-sm btn-ghost" id="closeLog">Tutup</button></div><div class="vn-log-book">';
    logEntri.forEach(function (e) {
      html += '<div class="entry"><span class="who ' + (e.who === "Halaman" ? "nar" : "") + '">' + App.escapeHtml(e.who) + '</span>' + App.escapeHtml(e.teks) + '</div>';
    });
    html += '</div></div>';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    document.getElementById("closeLog").addEventListener("click", function () { wrap.remove(); });
    wrap.addEventListener("click", function (ev) { if (ev.target === wrap) wrap.remove(); });
  }

  function doSave() {
    if (!kasusAktif) { App.toast("Buka kasus dulu."); return; }
    Storage.update(function (p) {
      p.vn_save = { kasus: kasusAktif.id, halaman: page, kesalahan: kesalahan, tanggal: new Date().toLocaleString("id-ID") };
    });
    App.toast("Disimpan: kasus " + kasusAktif.id + " halaman " + page + ".");
  }

  function doLoad() {
    var p = Storage.load();
    if (!p.vn_save) { App.toast("Belum ada simpanan."); return; }
    var k = kasusList().find(function (x) { return x.id === p.vn_save.kasus; });
    if (!k) { App.toast("Simpanan tidak valid."); return; }
    kasusAktif = k;
    kesalahan = p.vn_save.kesalahan || 0;
    gotoPage(p.vn_save.halaman);
    App.toast("Memuat kasus " + k.id + " halaman " + p.vn_save.halaman + ".");
  }

  // ---------- routing ----------
  App.add("vn", function (app, params) {
    root = app;
    if (!window.BOOK || !window.BOOK.pages) { app.innerHTML = "<p>Data buku belum dimuat.</p>"; return; }
    if (!params || !params.length) { renderShelf(); return; }

    var slug = params[0];
    var k = kasusList().find(function (x) { return x.id === slug; });
    if (!k) { renderShelf(); return; }

    var p = Storage.load();
    var pos = (p.vn_posisi || {})[k.id];
    kasusAktif = k;
    kesalahan = pos ? (pos.kesalahan || 0) : 0;
    riwayat = {}; logEntri = [];
    gotoPage(pos ? pos.halaman : k.start);
  });
})();
