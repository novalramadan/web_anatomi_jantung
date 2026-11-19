/* js/auth.js — auth demo: email+password di localStorage (SHA-256 via SubtleCrypto).
   Ganti implementasi AuthProvider ke Firebase/Supabase saat deploy online. */
(function () {
  "use strict";

  var USERS_KEY = "Medical-U_users";
  var SESSION_KEY = "Medical-U_session";

  // ---------- provider interface (tukar di sini saat deploy) ----------
  var AuthProvider = {
    listUsers: function () {
      try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
      catch (e) { return []; }
    },
    saveUsers: function (users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); },
    setSession: function (u) { localStorage.setItem(SESSION_KEY, JSON.stringify({ id: u.id, email: u.email, role: u.role, nama: u.nama })); },
    getSession: function () {
      try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
      catch (e) { return null; }
    },
    clearSession: function () { localStorage.removeItem(SESSION_KEY); },
    hash: function (pw) {
      if (!window.crypto || !crypto.subtle) {
        // fallback demo bila tanpa crypto.subtle (file:// lama) — bukan untuk produksi
        return Promise.resolve("plain:" + pw);
      }
      var data = new TextEncoder().encode("cv:" + pw);
      return crypto.subtle.digest("SHA-256", data).then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      });
    }
  };

  // ---------- seed admin ----------
  function seedAdmin() {
    var users = AuthProvider.listUsers();
    if (users.some(function (u) { return u.role === "admin"; })) return;
    AuthProvider.hash("admin123").then(function (h) {
      users.push({ id: "u_admin", nama: "Admin", email: "admin@Medical-U.local", pw: h, role: "admin", dibuat: new Date().toISOString() });
      AuthProvider.saveUsers(users);
    });
  }

  // ---------- api publik ----------
  function register(email, password, nama, role) {
    email = String(email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Promise.reject(new Error("Format email tidak valid."));
    if (!password || String(password).length < 6) return Promise.reject(new Error("Password minimal 6 karakter."));
    var users = AuthProvider.listUsers();
    if (users.some(function (u) { return u.email === email; })) return Promise.reject(new Error("Email sudah terdaftar."));
    var r = (role === "admin") ? "admin" : "mahasiswa";
    return AuthProvider.hash(password).then(function (h) {
      var u = { id: "u_" + Date.now().toString(36), nama: nama || email.split("@")[0], email: email, pw: h, role: r, dibuat: new Date().toISOString() };
      users.push(u);
      AuthProvider.saveUsers(users);
      AuthProvider.setSession(u);
      return sanitize(u);
    });
  }

  function login(email, password) {
    email = String(email || "").trim().toLowerCase();
    var u = AuthProvider.listUsers().find(function (x) { return x.email === email; });
    if (!u) return Promise.reject(new Error("Email tidak terdaftar."));
    return AuthProvider.hash(password).then(function (h) {
      if (h !== u.pw) throw new Error("Password salah.");
      AuthProvider.setSession(u);
      return sanitize(u);
    });
  }

  function logout() { AuthProvider.clearSession(); }
  function currentUser() { return AuthProvider.getSession(); }
  function isAdmin() { var u = currentUser(); return !!u && u.role === "admin"; }
  function requireRole(role) {
    var u = currentUser();
    if (!u) { location.hash = "#/login"; return false; }
    if (role && u.role !== role) { location.hash = "#/beranda"; return false; }
    return true;
  }

  // daftar user untuk panel admin
  function listUsers() { return AuthProvider.listUsers().map(sanitize); }
  function updateUser(id, patch) {
    var users = AuthProvider.listUsers();
    var u = users.find(function (x) { return x.id === id; });
    if (!u) return false;
    if (patch.role) u.role = patch.role === "admin" ? "admin" : "mahasiswa";
    if (patch.nama !== undefined) u.nama = patch.nama;
    if (patch.password) { u._newpw = patch.password; } // di-hash async di bawah
    if (u._newpw) {
      return AuthProvider.hash(u._newpw).then(function (h) {
        u.pw = h; delete u._newpw;
        AuthProvider.saveUsers(users);
        return true;
      });
    }
    AuthProvider.saveUsers(users);
    return Promise.resolve(true);
  }
  function deleteUser(id) {
    var users = AuthProvider.listUsers().filter(function (x) { return x.id !== id; });
    AuthProvider.saveUsers(users);
  }

  function sanitize(u) { return { id: u.id, email: u.email, role: u.role, nama: u.nama }; }

  window.Auth = {
    register: register, login: login, logout: logout,
    currentUser: currentUser, isAdmin: isAdmin, requireRole: requireRole,
    listUsers: listUsers, updateUser: updateUser, deleteUser: deleteUser,
    seedAdmin: seedAdmin
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", seedAdmin);
  else seedAdmin();
})();
