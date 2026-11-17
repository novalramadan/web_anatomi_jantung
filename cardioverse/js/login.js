/* js/login.js — halaman login & register (demo auth lokal). */
(function () {
  "use strict";

  function shell(app, mode) {
    var html = '<div class="auth-wrap">' +
      '<div class="card auth-card">' +
        '<div class="card-head"><h2>' + (mode === "login" ? "Masuk" : "Daftar Akun") + '</h2></div>' +
        '<form id="authForm" novalidate>';
    html += mode === "register"
      ? '<label class="field"><span class="lbl">Nama</span><input type="text" id="aNama" autocomplete="name" required></label>'
      : '';
    html += '<label class="field"><span class="lbl">Email</span><input type="email" id="aEmail" autocomplete="email" required></label>' +
      '<label class="field"><span class="lbl">Password</span><input type="password" id="aPw" autocomplete="' + (mode === "login" ? "current-password" : "new-password") + '" required minlength="6"></label>';
    if (mode === "register") {
      html += '<label class="field"><span class="lbl">Daftar sebagai</span><select id="aRole"><option value="mahasiswa">Mahasiswa</option><option value="admin">Admin</option></select></label>';
    }
    html += '<div class="auth-msg" id="authMsg" aria-live="polite"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">' + (mode === "login" ? "Masuk" : "Buat Akun") + '</button>' +
      '</form>' +
      '<p class="small muted" style="margin-top:14px">' +
        (mode === "login"
          ? 'Belum punya akun? <a href="#/register">Daftar</a> · <a href="#/beranda">Lewati & lihat sebagai tamu</a>'
          : 'Sudah punya akun? <a href="#/login">Masuk</a>') +
      '</p>' +
      (mode === "login" ? '<p class="tiny dim">Demo: admin@cardioverse.local / admin123</p>' : '') +
      '</div></div>';
    app.innerHTML = html;
    return app.querySelector("#authForm");
  }

  function showMsg(msg, ok) {
    var el = document.getElementById("authMsg");
    if (!el) return;
    el.textContent = msg;
    el.className = "auth-msg " + (ok ? "ok" : "err");
  }

  function afterAuth(u) {
    App.toast("Selamat datang, " + (u.nama || u.email) + ".");
    location.hash = u.role === "admin" ? "#/admin" : "#/beranda";
    App.render();
  }

  function renderLogin(app) {
    var form = shell(app, "login");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("aEmail").value;
      var pw = document.getElementById("aPw").value;
      showMsg("Memproses…", true);
      Auth.login(email, pw).then(afterAuth).catch(function (err) { showMsg(err.message, false); });
    });
  }

  function renderRegister(app) {
    var form = shell(app, "register");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("aEmail").value;
      var pw = document.getElementById("aPw").value;
      var nama = document.getElementById("aNama").value;
      var role = document.getElementById("aRole").value;
      showMsg("Mendaftarkan…", true);
      Auth.register(email, pw, nama, role).then(afterAuth).catch(function (err) { showMsg(err.message, false); });
    });
  }

  App.add("login", renderLogin);
  App.add("register", renderRegister);
})();
