/* js/vn.js — Visual Novel engine: ketik, pilihan, HUD vital, simpan/muat, log, auto, Skip, bintang, refleksi. */
(function () {
  "use strict";

  var S = {
    kasus: null,
    halaman: null,
    idx: 0,
    typing: false,
    choicesShown: false,
    kesalahan: 0,
    readPages: {},
    auto: false,
    log: [],
    animTimer: null,
    autoTimer: null
  };

  var BG = {
    "jalan_raya": { sky: "#1b2337", street: "#0d1420", accent: "#d34a5f" },
    "igd": { sky: "#12202f", street: "#0b141f", accent: "#35d6a4" },
    "ruang_periksa": { sky: "#1c2840", street: "#111a2a", accent: "#57b0e8" }
  };

  function bgSvg(latar) {
    var c = BG[latar] || BG.igd;
    return '<svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<rect width="800" height="360" fill="' + c.sky + '"/>' +
      '<circle cx="600" cy="70" r="16" fill="' + c.accent + '" opacity=".5"/>' +
      '<rect x="0" y="270" width="800" height="90" fill="' + c.street + '"/>' +
      '<line x1="0" y1="270" x2="800" y2="270" stroke="' + c.accent + '" stroke-opacity=".18" stroke-width="2"/>' +
      (latar === "jalan_raya"
        ? '<rect x="40" y="150" width="120" height="70" rx="6" fill="#26334d"/><rect x="150" y="120" width="90" height="100" rx="6" fill="#2c3b58"/><rect x="360" y="180" width="70" height="40" rx="6" fill="#2c3b58"/>'
        : latar === "igd"
        ? '<rect x="30" y="140" width="200" height="24" rx="4" fill="#1d2c40"/><rect x="30" y="164" width="200" height="10" rx="4" fill="#1d2c40"/><circle cx="620" cy="70" r="6" fill="#ff5a5a" opacity=".9"/>'
        : '<rect x="40" y="120" width="150" height="8" rx="4" fill="#26334d"/><rect x="40" y="140" width="150" height="8" rx="4" fill="#26334d"/><rect x="40" y="160" width="150" height="8" rx="4" fill="#26334d"/><rect x="300" y="190" width="200" height="60" rx="6" fill="#24314d"/>') +
      '</svg>';
  }

  function spriteSvg(role) {
    var c = "#e0c79a";
    var shirt = { mahasiswa: "#35a0e8", pasien: "#d98c9a", perawat: "#f2f2f2", dokter: "#3ec5a2", saksi: "#c9a86a" }[role] || "#999";
    return '<svg viewBox="0 0 120 180" aria-hidden="true">' +
      '<circle cx="60" cy="26" r="22" fill="' + c + '"/>' +
      '<path d="M60 40 v44" stroke="' + c + '" stroke-width="5"/>' +
      '<rect x="40" y="84" width="40" height="14" rx="7" fill="' + c + '"/>' +
      '<path d="M60 88 l16 34 h-32 z" fill="' + shirt + '"/>' +
      '<path d="M44 86 v30 M76 86 v30" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>' +
      '</svg>';
  }

  function starHtml(n) {
    var s = "";
    for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= n ? "" : "off") + '">★</span>';
    return s;
  }

  // ---------- daftar kasus ----------
  function listHtml(app) {
    var p = Storage.load();
    var h = '<div class="section-head"><div class="eyebrow">Visual Novel</div><h1>Kasus Kardiovaskular</h1><p class="lead">Kamu berperan sebagai mahasiswa kedokteran. Setiap keputusan mengubah monitor pasien. Bintang 3 bila langsung tepat, 2 bila satu kesalahan, 1 bila dua atau lebih.</p></div>';
    h += '<div class="grid grid-2">';
    window.DATA_KASUS.forEach(function (k) {
      var star = (p.kasus_selesai || {})[k.id] || 0;
      var ref = (p.refleksi || {})[k.id];
      var started = (p.vn_posisi || {})[k.id];
      h += '<div class="card">' +
        '<div class="card-head"><h2>Kasus ' + k.id + '</h2>' + (k.status_validasi.indexOf("draf") !== -1 ? '<span class="draf-badge">Draf</span>' : '') + '</div>' +
        '<p class="small muted">' + App.escapeHtml(k.ringkasan || k.judul) + '</p>' +
        '<div class="chip-row" style="margin:6px 0">' + k.pertemuan_terkait.map(function (x) { return '<a class="badge" href="#/materi/' + x + '">P' + x + '</a>'; }).join('') + '</div>' +
        '<div class="vn-stars">' + starHtml(star) + '</div>' +
        '<div class="btn-row"><a class="btn btn-primary" href="#/vn/' + k.id + '">' + (started ? "Lanjutkan" : "Mulai") + '</a>' +
        (star ? '<span class="badge badge-teal">Selesai</span>' : '') + '</div>' +
        (ref ? '<p class="tiny dim" style="margin-top:8px">Refleksi: ' + App.escapeHtml(ref.slice(0, 60)) + (ref.length > 60 ? "…" : "") + '</p>' : '') +
        '</div>';
    });
    h += '</div>';
    h += '<div class="callout" style="margin-top:16px"><strong>Catatan Penanganan:</strong> kasus A–C berasal dari lampiran; Kasus D (henti jantung mendadak) adalah draf latihan bantuan hidup dasar dan <em>perlu divalidasi dosen</em>. ' + (window.CONFIG.disclaimer || "") + '</div>';
    app.innerHTML = h;
  }

  // ---------- start ----------
  function start(app, id) {
    var k = App.byId(window.DATA_KASUS, id);
    if (!k) { App.navigate("#/vn"); return; }
    S.kasus = k;
    S.kesalahan = 0; S.log = []; S.auto = false; S.readPages = {};
    goPage(app, k.halaman[0]);
  }

  function goPage(app, hal) {
    S.halaman = hal;
    S.idx = 0;
    S.choicesShown = false;
    S.readPages[hal.id] = true;
    S.log.push({ pembicara: "—", teks: "[Halaman " + hal.id + " · " + hal.tipe + "]" });
    savePosisi();
    renderStage(app);
  }

  function savePosisi() {
    Storage.update(function (p) {
      p.vn_posisi = p.vn_posisi || {};
      p.vn_posisi[S.kasus.id] = { halaman: S.halaman.id, kesalahan: S.kesalahan };
    });
  }

  function hudHtml(hal) {
    var v = hal.efek_vital;
    if (!v) return '<div class="vn-hud"><div class="row"><span class="lab">HR</span><span>—</span></div><div class="row"><span class="lab">TD</span><span>—</span></div><div class="row"><span class="lab">MAP</span><span>—</span></div><div class="stab"><div class="lab">STATUS</div><div class="bar"><i style="width:0%"></i></div></div></div>';
    return '<div class="vn-hud' + (v.stabilitas < 30 ? " bad" : "") + '" aria-label="Monitor pasien">' +
      '<div class="row"><span class="lab">HR</span><span>' + v.hr + '</span></div>' +
      '<div class="row"><span class="lab">TD</span><span>' + App.escapeHtml(v.td) + '</span></div>' +
      '<div class="row"><span class="lab">MAP</span><span>' + v.map + '</span></div>' +
      '<div class="stab"><div class="lab">STABILITAS</div><div class="bar"><i style="width:' + v.stabilitas + '%"></i></div></div>' +
      '</div>';
  }

  function renderStage(app) {
    var hal = S.halaman;
    var ade = hal.adegan[S.idx];
    var p = Storage.load();

    var html = '<div class="section-head"><div class="btn-row" style="justify-content:space-between"><div class="eyebrow">Kasus ' + S.kasus.id + '</div>' +
      '<div class="btn-row"><span class="badge">Halaman ' + hal.id + '</span><span class="badge ' + (hal.tipe === "tepat" ? "badge-teal" : hal.tipe === "evaluasi" ? "badge-amber" : "badge-accent") + '">' + tipeLabel(hal.tipe) + '</span>' +
      (S.kasus.status_validasi.indexOf("draf") !== -1 ? '<span class="draf-badge">Draf</span>' : '') +
      '<a class="btn btn-sm btn-ghost" href="#/vn">Keluar</a></div></div></div>';

    html += '<div class="vn-stage">' +
      '<div class="vn-bg">' + bgSvg(hal.latar) + '</div>';

    var who = ade ? ade.pembicara : "";
    if (who === "Kamu") html += '<div class="vn-sprite s-mahasiswa">' + spriteSvg("mahasiswa") + '</div>';
    else if (who === "Pasien") html += '<div class="vn-sprite s-pasien">' + spriteSvg("pasien") + '</div>';
    else if (who === "Perawat") html += '<div class="vn-sprite s-perawat">' + spriteSvg("perawat") + '</div>';
    else if (who === "Dokter jaga") html += '<div class="vn-sprite s-dokter">' + spriteSvg("dokter") + '</div>';
    else if (who === "Saksi") html += '<div class="vn-sprite s-saksi">' + spriteSvg("saksi") + '</div>';

    html += hudHtml(hal);

    html += '<div class="vn-dialog">' +
      '<div class="who">' + (ade ? App.escapeHtml(ade.pembicara) : "") + '</div>' +
      '<div class="txt"><span id="vnTxt">' + (ade ? App.escapeHtml(ade.teks) : "") + '</span><span class="caret" aria-hidden="true"></span></div>' +
      '<div class="hint"><span class="kbd">Spasi</span> / klik lanjut <span class="dim">·</span> <span id="vnautoState">auto: ' + (S.auto ? "nyala" : "mati") + '</span> <span class="dim">·</span> <span>Skip hanya untuk halaman terbaca</span></div>' +
      '</div>';

    if (hal.pilihan && hal.pilihan.length && S.idx >= hal.adegan.length - 1 && !S.typing) {
      S.choicesShown = true;
    }
    if (S.choicesShown && hal.pilihan && hal.pilihan.length) {
      html += '<div class="vn-choices" role="group" aria-label="Pilihan keputusan">';
      hal.pilihan.forEach(function (op, i) {
        html += '<button type="button" class="btn" data-go="' + op.tujuan + '"><span class="no">' + (i + 1) + '.</span> ' + App.escapeHtml(op.teks) + '</button>';
      });
      html += '</div>';
    }

    html += '</div>';

    html += '<div class="vn-toolbar">' +
      '<button class="btn btn-sm' + (S.auto ? " btn-teal" : "") + '" id="vnauto" type="button" aria-pressed="' + S.auto + '">auto</button>' +
      '<button class="btn btn-sm" id="vnSkip" type="button">Skip</button>' +
      '<button class="btn btn-sm" id="vnLog" type="button">Log</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-sm" id="vnSave" type="button">Simpan</button>' +
      '<button class="btn btn-sm" id="vnLoad" type="button">Muat</button>' +
      '<button class="btn btn-sm" id="vnMenu" type="button">Menu</button>' +
      '</div>';

    html += '<div class="callout" style="margin-top:10px">' + App.escapeHtml(window.CONFIG.disclaimer || "") + '</div>';

    app.innerHTML = html;

    // ketik
    var txtEl = document.getElementById("vnTxt");
    var full = ade ? ade.teks : "";
    S.typing = true;
    var i = 0;
    if (S.animTimer) clearInterval(S.animTimer);
    if (S.autoTimer) clearTimeout(S.autoTimer);
    S.animTimer = setInterval(function () {
      i++;
      if (txtEl) txtEl.textContent = full.slice(0, i);
      if (i >= full.length) {
        clearInterval(S.animTimer);
        S.animTimer = null;
        S.typing = false;
        if (S.auto) scheduleauto(app);
        else if (hal.pilihan && hal.pilihan.length && S.idx >= hal.adegan.length - 1) {
          S.choicesShown = true;
          renderStage(app);
        }
      }
    }, 16);

    // klik / spasi
    app.querySelector(".vn-stage").addEventListener("click", function (e) {
      if (e.target.closest(".vn-choices")) return;
      if (S.typing) { finishTyping(txtEl, full, app); return; }
      advance(app);
    });

    app.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () { pick(app, btn.dataset.go); });
    });

    wireButtons(app);
  }

  function tipeLabel(t) {
    return { awal: "Awal", tepat: "Tepat", kurang_tepat: "Kurang Tepat", keliru: "Keliru", berbahaya: "Berbahaya", evaluasi: "Evaluasi" }[t] || t;
  }

  function finishTyping(txtEl, full, app) {
    if (S.animTimer) { clearInterval(S.animTimer); S.animTimer = null; }
    if (txtEl) txtEl.textContent = full;
    S.typing = false;
    var hal = S.halaman;
    if (hal.pilihan && hal.pilihan.length && S.idx >= hal.adegan.length - 1) {
      S.choicesShown = true;
      renderStage(app);
    } else if (S.auto) {
      scheduleauto(app);
    }
  }

  function scheduleauto(app) {
    if (!S.auto) return;
    if (S.autoTimer) clearTimeout(S.autoTimer);
    S.autoTimer = setTimeout(function () { advance(app); }, 1300);
  }

  function advance(app) {
    var hal = S.halaman;
    if (hal.pilihan && hal.pilihan.length) return; // tunggu pilihan
    S.idx++;
    if (S.idx < hal.adegan.length) {
      S.log.push(hal.adegan[S.idx]);
      renderStage(app);
    } else {
      // halaman tanpa pilihan tapi bukan evaluasi: kembali ke halaman tepat
      if (hal.tipe !== "evaluasi") {
        var tepat = S.kasus.halaman.find(function (h) { return h.tipe === "tepat"; });
        if (tepat) goPage(app, tepat);
        else finishCase(app);
      } else {
        finishCase(app);
      }
    }
  }

  function pick(app, tujuan) {
    var target = S.kasus.halaman.find(function (h) { return h.id === tujuan; });
    if (!target) return;
    if (target.tipe !== "tepat" && target.tipe !== "evaluasi") S.kesalahan++;
    S.log.push({ pembicara: "Kamu", teks: "[memilih: " + tujuan + "]" });
    goPage(app, target);
  }

  function wireButtons(app) {
    var auto = document.getElementById("vnauto");
    if (auto) auto.addEventListener("click", function () {
      S.auto = !S.auto;
      auto.setAttribute("aria-pressed", S.auto);
      auto.classList.toggle("btn-teal", S.auto);
      document.getElementById("vnautoState").textContent = "auto: " + (S.auto ? "nyala" : "mati");
      if (S.auto && !S.typing) scheduleauto(app);
      else if (!S.auto && S.autoTimer) clearTimeout(S.autoTimer);
    });
    var skip = document.getElementById("vnSkip");
    if (skip) skip.addEventListener("click", function () { doSkip(app); });
    var vlog = document.getElementById("vnLog");
    if (vlog) vlog.addEventListener("click", function () { showLog(app); });
    var save = document.getElementById("vnSave");
    if (save) save.addEventListener("click", doSave);
    var load = document.getElementById("vnLoad");
    if (load) load.addEventListener("click", function () { doLoad(app); });
    var menu = document.getElementById("vnMenu");
    if (menu) menu.addEventListener("click", function () { App.navigate("#/vn"); });
  }

  function doSkip(app) {
    var hal = S.halaman;
    if (!S.readPages[hal.id]) { App.toast("Halaman belum pernah dibaca — Skip dilarang."); return; }
    if (hal.pilihan && hal.pilihan.length) { App.toast("Pilihan harus diambil sendiri."); return; }
    if (hal.tipe === "evaluasi") { finishCase(app); return; }
    if (S.animTimer) { clearInterval(S.animTimer); S.animTimer = null; }
    S.typing = false;
    advance(app);
  }

  function showLog(app) {
    var wrap = document.createElement("div");
    wrap.className = "modal-back show";
    var html = '<div class="modal"><div class="card-head"><h2>Log Dialog</h2><button class="btn btn-sm btn-ghost" id="closeLog">Tutup</button></div>';
    html += '<div class="vn-log">';
    S.log.forEach(function (e) {
      html += '<div class="entry"><span class="who ' + (e.pembicara === "Narasi" ? "nar" : "") + '">' + App.escapeHtml(e.pembicara || "Narasi") + '</span> — ' + App.escapeHtml(e.teks) + '</div>';
    });
    html += '</div></div>';
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    document.getElementById("closeLog").addEventListener("click", function () { wrap.remove(); });
    wrap.addEventListener("click", function (ev) { if (ev.target === wrap) wrap.remove(); });
  }

  function doSave() {
    Storage.update(function (p) {
      p.vn_save = { kasus: S.kasus.id, halaman: S.halaman.id, kesalahan: S.kesalahan, tanggal: new Date().toLocaleString("id-ID") };
    });
    App.toast("Simpan kasus " + S.kasus.id + " halaman " + S.halaman.id + " selesai.");
  }

  function doLoad(app) {
    var p = Storage.load();
    if (!p.vn_save) { App.toast("Belum ada simpanan."); return; }
    var k = App.byId(window.DATA_KASUS, p.vn_save.kasus);
    if (!k) { App.toast("Simpanan tidak valid."); return; }
    var hal = k.halaman.find(function (h) { return h.id === p.vn_save.halaman; });
    S.kasus = k; S.kesalahan = p.vn_save.kesalahan || 0; S.log = []; S.auto = false;
    goPage(app, hal);
    App.toast("Memuat simpanan kasus " + k.id);
  }

  function finishCase(app) {
    var stars = S.kesalahan === 0 ? 3 : (S.kesalahan === 1 ? 2 : 1);
    Storage.update(function (p) {
      p.kasus_selesai = p.kasus_selesai || {};
      if (stars > (p.kasus_selesai[S.kasus.id] || 0)) p.kasus_selesai[S.kasus.id] = stars;
      p.vn_posisi = p.vn_posisi || {};
      delete p.vn_posisi[S.kasus.id];
    });
    renderEnd(app, stars);
  }

  function renderEnd(app, stars) {
    var k = S.kasus;
    var badge = stars === 3
      ? { c: "b-3", t: "Keputusan tepat sepanjang kasus" }
      : stars === 2 ? { c: "b-2", t: "Satu kesalahan — pelajari pembahasannya" }
      : { c: "b-1", t: "Dua kesalahan atau lebih — ulangi materi" };
    var p = Storage.load();
    var ref = (p.refleksi || {})[k.id] || "";

    var html = '<div class="section-head"><div class="eyebrow">Kasus ' + k.id + ' selesai</div><h1>' + App.escapeHtml(k.judul) + '</h1></div>';
    html += '<div class="vn-end">';
    html += '<div class="vn-badge ' + badge.c + '">' + badge.t + '</div>';
    html += '<div class="vn-stars">' + starHtml(stars) + '</div>';
    html += '<p class="muted small">Kesalahan: ' + S.kesalahan + ' · Bintang: ' + stars + '/3</p>';

    var ev = k.halaman.find(function (h) { return h.tipe === "evaluasi"; });
    if (ev) {
      html += '<h3>Refleksi & Pertanyaan Diskusi</h3><div class="callout c-teal" style="text-align:left">' +
        ev.adegan.map(function (a) { return '<p><strong>' + App.escapeHtml(a.pembicara) + ':</strong> ' + App.escapeHtml(a.teks) + '</p>'; }).join('') + '</div>';
    }

    html += '<div class="refleksi-box"><p class="small muted">Refleksi singkat (tersimpan di perangkat ini):</p><textarea id="refleksiInput" aria-label="Refleksi">' + App.escapeHtml(ref) + '</textarea></div>';
    html += '<div class="btn-row" style="justify-content:center"><button class="btn btn-primary" id="refSave" type="button">Simpan Refleksi</button><a class="btn" href="#/vn">Kembali</a></div>';
    html += '<div class="btn-row" style="justify-content:center;margin-top:8px">' +
      k.pertemuan_terkait.map(function (x) { return '<a class="badge" href="#/materi/' + x + '">Buka Pertemuan ' + x + '</a>'; }).join('') + '</div>';
    html += '</div>';
    app.innerHTML = html;

    var refInput = document.getElementById("refleksiInput");
    refInput.addEventListener("input", function () {
      Storage.update(function (pp) { pp.refleksi = pp.refleksi || {}; pp.refleksi[k.id] = refInput.value; });
    });
    document.getElementById("refSave").addEventListener("click", function () {
      Storage.update(function (pp) { pp.refleksi = pp.refleksi || {}; pp.refleksi[k.id] = refInput.value; });
      App.toast("Refleksi disimpan.");
    });
  }

  App.add("vn", function (app, params) {
    if (!window.DATA_KASUS || !window.DATA_KASUS.length) { app.innerHTML = "<p>Tidak ada kasus.</p>"; return; }
    if (S.autoTimer) clearTimeout(S.autoTimer);
    S.auto = false;
    if (!params || !params.length) { listHtml(app); return; }
    start(app, params[0]);
  });

  document.addEventListener("keydown", function (e) {
    if (e.target && (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT")) return;
    if (e.code === "Space" && location.hash.indexOf("#/vn/") === 0) {
      e.preventDefault();
      var app = document.getElementById("app");
      if (app.querySelector(".vn-choices")) return;
      var txtEl = document.getElementById("vnTxt");
      if (S.typing && txtEl) finishTyping(txtEl, S.halaman.adegan[S.idx].teks, app);
      else advance(app);
    }
  });
})();
