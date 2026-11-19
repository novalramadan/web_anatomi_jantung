/* js/login.js — halaman login & register (demo auth lokal). */
(function () {
  "use strict";

  function shell(app, mode) {
    var html = '<div class="grid min-h-[60vh] place-items-center px-4 py-8">' +
      '<div class="surface-card w-full max-w-[440px] p-6 sm:p-7">' +
        '<div class="mb-4"><h2 class="m-0">' + (mode === "login" ? "Masuk" : "Daftar Akun") + '</h2></div>' +
        '<form id="authForm" novalidate>';
    html += mode === "register"
      ? '<label class="field"><span class="lbl">Nama</span><input type="text" id="aNama" class="input" autocomplete="name" required></label>'
      : '';
    html += '<label class="field"><span class="lbl">Email</span><input type="email" id="aEmail" class="input" autocomplete="email" required></label>' +
      '<label class="field"><span class="lbl">Password</span><input type="password" id="aPw" class="input" autocomplete="' + (mode === "login" ? "current-password" : "new-password") + '" required minlength="6"></label>';
    if (mode === "register") {
      html += '<label class="field"><span class="lbl">Daftar sebagai</span><select id="aRole" class="input"><option value="mahasiswa">Mahasiswa</option><option value="admin">Admin</option></select></label>';
    }
    html += '<div class="auth-msg" id="authMsg" aria-live="polite"></div>' +
      '<button type="submit" class="btn btn-primary btn-block">' + (mode === "login" ? "Masuk" : "Buat Akun") + '</button>' +
      '</form>' +
      '<p class="small muted mt-4">' +
        (mode === "login"
          ? 'Belum punya akun? <a href="#/register" class="text-brand">Daftar</a> · <a href="#/beranda" class="text-brand">Lewati & lihat sebagai tamu</a>'
          : 'Sudah punya akun? <a href="#/login" class="text-brand">Masuk</a>') +
      '</p>' +
      (mode === "login" ? '<p class="tiny dim mt-2">Demo: admin@cardioverse.local / admin123</p>' : '') +
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
