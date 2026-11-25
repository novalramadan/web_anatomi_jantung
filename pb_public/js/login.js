/* js/login.js — halaman login & register: layout split 50:50 fixed tanpa scroll (form kiri, jantung 3D kanan). */
(function () {
  "use strict";

  var ICON = {
    mail: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
    lock: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    user: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    badge: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
    eye: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.3-.5 4.6-1.2"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    arrow: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    drag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>'
  };

  function field(id, label, type, icon, auto, extra) {
    return '<label class="field auth-field" for="' + id + '"><span class="lbl">' + label + '</span>' +
      '<span class="auth-input">' + icon +
        '<input type="' + type + '" id="' + id + '" class="input" autocomplete="' + auto + '" ' + (extra || "") + '>' +
        (type === "password" ? '<button type="button" class="pw-toggle" data-for="' + id + '" aria-label="Tampilkan password">' + ICON.eye + '</button>' : "") +
      '</span></label>';
  }

  function shell(app, mode) {
    var isLogin = mode === "login";
    var html = '<section class="auth-split">' +
      // ===== kiri: form =====
      '<div class="auth-left"><div class="auth-left-in">' +
        '<div class="auth-brand">' +
          '<span class="auth-brand-mark" aria-hidden="true">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 8.5c0-2.5-2-4.5-4.5-4.5-1.6 0-3 .9-3.8 2.2C11.5 4.9 10.1 4 8.5 4 6 4 4 6 4 8.5c0 5 8 9.5 8 9.5s8-4.5 8-9.5z"/><path d="M3.5 12h4l1.5-3 2 5 1.5-2.5h4"/></svg>' +
          '</span>' +
          '<span class="auth-brand-name">' + App.escapeHtml(window.CONFIG.namaWeb || "Medical-U") + '</span>' +
        '</div>' +
        '<div class="auth-head">' +
          '<span class="eyebrow">' + (isLogin ? "Portal Pembelajaran" : "Akun Baru") + '</span>' +
          '<h1>' + (isLogin ? "Selamat datang kembali" : "Mulai perjalanan belajar") + '</h1>' +
          '<p class="lead">' + (isLogin
            ? "Masuk untuk melanjutkan modul Fisiologi Jantung, kuis, dan progres belajar Anda."
            : "Buat akun mahasiswa untuk menyimpan progres materi, skor kuis, dan kasus klinis.") + '</p>' +
        '</div>' +
        '<nav class="auth-tabs" aria-label="Pilih mode">' +
          '<a href="#/login" class="' + (isLogin ? "on" : "") + '"' + (isLogin ? ' aria-current="page"' : "") + '>Masuk</a>' +
          '<a href="#/register" class="' + (!isLogin ? "on" : "") + '"' + (!isLogin ? ' aria-current="page"' : "") + '>Daftar</a>' +
        '</nav>' +
        '<form id="authForm" novalidate>';
    if (!isLogin) {
      html += '<div class="auth-grid-2">' +
        field("aNama", "Nama lengkap", "text", ICON.user, "name", 'required placeholder="Nama Anda"') +
        '<label class="field auth-field" for="aRole"><span class="lbl">Peran</span><span class="auth-input">' + ICON.badge +
          '<select id="aRole" class="input" disabled><option value="mahasiswa">Mahasiswa</option></select></span></label>' +
      '</div>';
    }
    html += field("aEmail", "Email", "email", ICON.mail, "email", 'required placeholder="nama@kampus.ac.id"');
    html += field("aPw", "Password", "password", ICON.lock, isLogin ? "current-password" : "new-password", 'required minlength="6" placeholder="Minimal 6 karakter"');
    if (!isLogin) {
      html += '<div class="auth-row"><span class="tiny dim">Peran dosen diberikan melalui Dashboard PocketBase.</span></div>';
    } else {
      html += '<div class="auth-row"><span class="tiny dim">Lupa password? Hubungi dosen pengampu.</span></div>';
    }
    html += '<div class="auth-msg" id="authMsg" aria-live="polite"></div>' +
        '<button type="submit" class="btn btn-primary btn-block auth-submit"><span class="lbl-txt">' + (isLogin ? "Masuk" : "Buat Akun") + '</span>' + ICON.arrow + '<span class="spin" aria-hidden="true"></span></button>' +
        '</form>';
    if (isLogin) {
      html += '<div class="auth-or"><span>Akun demo</span></div>' +
        '<div class="demo-acc">' +
          '<button type="button" class="demo-btn" data-email="dosen@medicalu.local" data-pw="dosen12345"><b>Dosen</b><span>dosen@medicalu.local</span></button>' +
          '<button type="button" class="demo-btn" data-email="mahasiswa@medicalu.local" data-pw="mahasiswa12345"><b>Mahasiswa</b><span>mahasiswa@medicalu.local</span></button>' +
        '</div>';
    }
    html += '<p class="small muted auth-foot">' + (isLogin
        ? 'Belum punya akun? <a href="#/register" class="text-brand">Daftar</a>'
        : 'Sudah punya akun? <a href="#/login" class="text-brand">Masuk</a>') + '</p>' +
      '</div></div>' +
      // ===== kanan: anatomi manusia 3D =====
      '<div class="auth-right" id="authVisual">' +
        '<div class="auth-grid" aria-hidden="true"></div>' +
        '<div class="auth-glow" aria-hidden="true"></div>' +
        '<div class="auth-stage" id="heartStage" role="img" aria-label="Model 3D anatomi tubuh manusia interaktif"></div>' +
        '<div class="auth-top">' +
          '<span class="live-chip"><i></i>Anatomi 3D · Multi-Lapisan</span>' +
          '<span class="auth-mob-bpm"><i class="bpm-dot"></i><b id="heartBpmMob">72</b> bpm</span>' +
          '<span class="drag-hint">' + ICON.drag + 'Seret / klik organ</span>' +
        '</div>' +
        '<div class="organ-card" id="organCard" hidden>' +
          '<button type="button" class="organ-close" id="organClose" aria-label="Tutup info">&times;</button>' +
          '<div class="organ-card-sys" id="organSys"></div>' +
          '<h4 id="organName"></h4>' +
          '<p id="organDesc"></p>' +
        '</div>' +
        '<div class="auth-card">' +
          '<div class="auth-card-head">' +
            '<div><div class="tiny auth-card-k">Fisiologi & Lapisan</div><div class="bpm"><b id="heartBpm">72</b><span>bpm</span><i class="bpm-dot"></i></div></div>' +
            '<div class="auth-card-ctrl">' +
              '<button type="button" class="hud-btn" id="anatPlay" aria-label="Jeda animasi">Jeda</button>' +
              '<button type="button" class="hud-btn" id="anatReset" aria-label="Reset kamera">Reset</button>' +
            '</div>' +
          '</div>' +
          '<div class="layer-pills" id="layerPills">' +
            '<button type="button" class="layer-pill on" data-layer="skin" aria-pressed="true">Kulit</button>' +
            '<button type="button" class="layer-pill on" data-layer="skeleton" aria-pressed="true">Rangka</button>' +
            '<button type="button" class="layer-pill on" data-layer="cardio" aria-pressed="true">Kardio & Paru</button>' +
            '<button type="button" class="layer-pill on" data-layer="digestive" aria-pressed="true">Pencernaan</button>' +
            '<button type="button" class="layer-pill on" data-layer="nervous" aria-pressed="true">Saraf</button>' +
          '</div>' +
          '<div class="hud-sliders">' +
            '<label class="hud-slider"><span>Exploded View</span><input type="range" id="anatExplode" min="0" max="1" step="0.02" value="0"></label>' +
            '<label class="hud-slider"><span>Kecepatan (<b id="anatSpdLbl">1.0×</b>)</span><input type="range" id="anatSpeed" min="0.4" max="2.5" step="0.1" value="1"></label>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
    app.innerHTML = html;

    // mode halaman penuh fixed tanpa scroll
    document.body.classList.add("auth-page");

    // toggle password
    app.querySelectorAll(".pw-toggle").forEach(function (b) {
      b.addEventListener("click", function () {
        var inp = document.getElementById(b.dataset.for);
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        b.innerHTML = show ? ICON.eyeOff : ICON.eye;
        b.setAttribute("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
      });
    });

    // isi akun demo
    app.querySelectorAll(".demo-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        document.getElementById("aEmail").value = b.dataset.email;
        document.getElementById("aPw").value = b.dataset.pw;
        app.querySelectorAll(".demo-btn").forEach(function (x) { x.classList.toggle("on", x === b); });
        showMsg("Akun demo terisi. Tekan Masuk.", true);
      });
    });

    // anatomi 3D
    var stage = document.getElementById("heartStage");
    var anat = null;
    var card = document.getElementById("organCard");
    if (window.Anatomy3D) {
      try {
        anat = Anatomy3D.mount(stage, {
          bpmEl: document.getElementById("heartBpm"),
          bpmMobEl: document.getElementById("heartBpmMob"),
          glowEl: document.getElementById("authVisual"),
          reserveTop: 56,
          reserveBottom: app.querySelector(".auth-card"),
          onOrganSelect: function (info) {
            if (!card) return;
            if (!info) { card.hidden = true; return; }
            document.getElementById("organSys").textContent = info.system;
            document.getElementById("organName").textContent = info.name;
            document.getElementById("organDesc").textContent = info.desc;
            card.hidden = false;
          }
        });
        var closeBtn = document.getElementById("organClose");
        if (closeBtn && card) closeBtn.addEventListener("click", function () { card.hidden = true; });
        app.querySelectorAll(".layer-pill").forEach(function (b) {
          b.addEventListener("click", function () {
            var on = !b.classList.contains("on");
            b.classList.toggle("on", on);
            b.setAttribute("aria-pressed", String(on));
            if (anat) anat.setLayer(b.dataset.layer, on);
          });
        });
        var ex = document.getElementById("anatExplode");
        if (ex && anat) ex.addEventListener("input", function () { anat.setExplode(ex.value); });
        var sp = document.getElementById("anatSpeed");
        var spLbl = document.getElementById("anatSpdLbl");
        if (sp && anat) sp.addEventListener("input", function () {
          var v = anat.setSpeed(sp.value);
          if (spLbl) spLbl.textContent = v.toFixed(1) + "×";
        });
        var btnPlay = document.getElementById("anatPlay");
        if (btnPlay && anat) btnPlay.addEventListener("click", function () {
          var playing = anat.togglePlay();
          btnPlay.textContent = playing ? "Jeda" : "Putar";
          btnPlay.setAttribute("aria-pressed", String(!playing));
        });
        var btnReset = document.getElementById("anatReset");
        if (btnReset && anat) btnReset.addEventListener("click", function () { anat.resetCamera(); });
      } catch (e) { console.error("Anatomy3D gagal:", e); }
    }
    if (App.onLeave) App.onLeave(function () { if (anat) anat.destroy(); });

    setTimeout(function () { var f = document.getElementById(isLogin ? "aEmail" : "aNama"); if (f) f.focus({ preventScroll: true }); }, 60);
    return app.querySelector("#authForm");
  }

  function showMsg(msg, ok) {
    var el = document.getElementById("authMsg");
    if (!el) return;
    el.textContent = msg;
    el.className = "auth-msg " + (ok ? "ok" : "err");
  }

  function busy(form, on) {
    var b = form.querySelector(".auth-submit");
    if (!b) return;
    b.disabled = on;
    b.classList.toggle("is-busy", on);
  }

  function afterAuth(u) {
    App.toast("Selamat datang, " + (u.nama || u.email) + ".");
    location.hash = u.role === "dosen" || u.role === "admin" ? "#/admin" : "#/beranda";
    App.render();
  }

  function renderLogin(app) {
    var form = shell(app, "login");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("aEmail").value.trim();
      var pw = document.getElementById("aPw").value;
      if (!email || !pw) { showMsg("Email dan password wajib diisi.", false); return; }
      showMsg("Memproses…", true);
      busy(form, true);
      Auth.login(email, pw).then(afterAuth).catch(function (err) { busy(form, false); showMsg(err.message, false); });
    });
  }

  function renderRegister(app) {
    var form = shell(app, "register");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("aEmail").value.trim();
      var pw = document.getElementById("aPw").value;
      var nama = document.getElementById("aNama").value.trim();
      var role = document.getElementById("aRole").value;
      if (!nama || !email || pw.length < 6) { showMsg("Lengkapi nama, email, dan password (min. 6 karakter).", false); return; }
      showMsg("Mendaftarkan…", true);
      busy(form, true);
      Auth.register(email, pw, nama, role).then(afterAuth).catch(function (err) { busy(form, false); showMsg(err.message, false); });
    });
  }

  App.add("login", renderLogin);
  App.add("register", renderRegister);
})();
