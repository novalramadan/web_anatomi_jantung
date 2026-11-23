/* js/auth.js — PocketBase auth adapter (replaces localStorage demo auth). */
(function () {
  "use strict";

  if (!window.PB) { console.error("PB.js must load before auth.js"); return; }

  var pb = window.PB;
  var user = null;

  function publicUser(rec) {
    return rec ? { id: rec.id, email: rec.email, role: rec.role || "mahasiswa", nama: rec.nama || rec.email } : null;
  }
  function sanitize(u) { return u; }

  function login(email, password) {
    return pb.ready.then(function () {
      return pb.request("/api/collections/users/auth-with-password", {
        method: "POST",
        body: JSON.stringify({ identity: String(email || "").trim().toLowerCase(), password: password })
      }).then(function (res) {
        user = publicUser(res.record);
        return pb.loadData().then(function () { return sanitize(user); });
      });
    });
  }

  function register(email, password, nama) {
    email = String(email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Promise.reject(new Error("Format email tidak valid."));
    if (!password || String(password).length < 8) return Promise.reject(new Error("Password minimal 8 karakter."));
    return pb.ready.then(function () {
      return pb.request("/api/collections/users/records", {
        method: "POST",
        body: JSON.stringify({
          email: email, password: password, passwordConfirm: password,
          nama: nama || email.split("@")[0], role: "mahasiswa"
        })
      }).then(function () { return login(email, password); });
    });
  }

  function logout() {
    user = null;
    if (window.PB) {
      if (window.PB.logout) window.PB.logout();
      if (window.Storage && window.Storage.defaults) window.Storage.save(window.Storage.defaults());
    }
  }

  function currentUser() { return user; }

  function isAdmin() { return !!user && user.role === "dosen"; }

  function requireRole(role) {
    if (!user) { location.hash = "#/login"; return false; }
    if (role && user.role !== role && !(role === "admin" && user.role === "dosen")) {
      location.hash = "#/beranda"; return false;
    }
    return true;
  }

  // admin panel CRUD is server-side; provide async list/update for admin.js
  function listUsers() {
    return pb.ready.then(function () {
      return pb.request("/api/collections/users/records?perPage=500");
    }).then(function (res) {
      return res.items.map(function (u) { return { id: u.id, email: u.email, nama: u.nama, role: u.role }; });
    });
  }

  function updateUser(id, patch) {
    return pb.ready.then(function () {
      var body = {};
      if (patch.role) body.role = patch.role;
      if (patch.nama !== undefined) body.nama = patch.nama;
      if (patch.password) { body.password = patch.password; body.passwordConfirm = patch.password; }
      return pb.request("/api/collections/users/records/" + encodeURIComponent(id), {
        method: "PATCH", body: JSON.stringify(body)
      });
    });
  }

  function deleteUser(id) {
    return pb.ready.then(function () {
      return pb.request("/api/collections/users/records/" + encodeURIComponent(id), { method: "DELETE" });
    });
  }

  // restore session from token stored by PB adapter
  pb.ready.then(function () {
    if (pb.currentUser) user = pb.currentUser();
    else if (pb.restore) { pb.restore().then(function (u) { user = u; }); }
  });

  window.Auth = {
    register: register, login: login, logout: logout,
    currentUser: currentUser, isAdmin: isAdmin, requireRole: requireRole,
    listUsers: listUsers, updateUser: updateUser, deleteUser: deleteUser
  };
})();