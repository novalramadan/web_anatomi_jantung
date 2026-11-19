/* js/admin.js — panel admin: CRUD pertemuan, soal, esai, kasus, marker + kelola user. */
(function () {
  "use strict";

  // ---- skema entitas ----
  var ENTITIES = [
    { key: "pertemuan", label: "Pertemuan", data: "DATA_PERTEMUAN", store: "cv_extra_pertemuan",
      fields: [
        { n: "id", l: "ID", t: "number", req: true },
        { n: "judul", l: "Judul", t: "text", req: true },
        { n: "blok", l: "Blok", t: "text", req: true },
        { n: "ringkasan", l: "Ringkasan", t: "textarea" },
        { n: "bacaan", l: "Bacaan", t: "textarea" },
        { n: "label_integrasi", l: "Integrasi", t: "checkbox" }
      ] },
    { key: "soal", label: "Soal", data: "DATA_SOAL", store: "cv_extra_soal",
      fields: [
        { n: "id", l: "ID", t: "number", req: true },
        { n: "pertemuan", l: "Pertemuan", t: "number", req: true },
        { n: "level", l: "Level", t: "select", opts: ["C2", "C3", "C4"] },
        { n: "pertanyaan", l: "Pertanyaan", t: "textarea", req: true },
        { n: "opsi", l: "Opsi (JSON: {A,B,C,D,E})", t: "json" },
        { n: "kunci", l: "Kunci", t: "select", opts: ["A", "B", "C", "D", "E"] },
        { n: "pembahasan", l: "Pembahasan", t: "textarea" }
      ] },
    { key: "esai", label: "Esai", data: "DATA_ESAI", store: "cv_extra_esai",
      fields: [
        { n: "id", l: "ID", t: "number", req: true },
        { n: "pertemuan", l: "Pertemuan terkait (JSON: [1,2])", t: "json" },
        { n: "pertanyaan", l: "Pertanyaan", t: "textarea", req: true },
        { n: "jawaban_model", l: "Jawaban model", t: "textarea" },
        { n: "checklist", l: "Checklist (JSON: [..])", t: "json" }
      ] },
    { key: "kasus", label: "Kasus", data: "DATA_KASUS", store: "cv_extra_kasus",
      fields: [
        { n: "id", l: "ID", t: "text", req: true },
        { n: "judul", l: "Judul", t: "text" },
        { n: "ringkasan", l: "Ringkasan", t: "textarea" },
        { n: "status_validasi", l: "Status validasi", t: "text" },
        { n: "halaman", l: "Halaman (JSON kompleks)", t: "json" }
      ] },
    { key: "marker", label: "Marker AR", data: "DATA_MARKER", store: "cv_extra_marker",
      fields: [
        { n: "id", l: "ID", t: "number", req: true },
        { n: "nilai_barcode", l: "Nilai barcode (1–64)", t: "number", req: true },
        { n: "nama", l: "Nama", t: "text", req: true },
        { n: "model", l: "Model (GLB key)", t: "text" },
        { n: "deskripsi", l: "Deskripsi", t: "textarea" },
        { n: "pertemuan_terkait", l: "Pertemuan terkait (JSON: [2])", t: "json" },
        { n: "lapisan", l: "Lapisan (JSON: [{kunci,nama,on}])", t: "json" }
      ] }
  ];

  var state = { ent: ENTITIES[0], editingId: null };

  // ---- load merged (bawaan + tambahan admin) ----
  function merged(ent) {
    var base = window[ent.data] || [];
    var extra = loadExtra(ent.store);
    return base.concat(extra);
  }
  function loadExtra(store) {
    try { return JSON.parse(localStorage.getItem(store) || "[]"); }
    catch (e) { return []; }
  }
  function saveExtra(ent, list) {
    localStorage.setItem(ent.store, JSON.stringify(list));
  }
  // hapus item (bawaan -> tandai di deleted list, tambahan -> hapus)
  function deletedKey(ent) { return ent.store + "_deleted"; }
  function loadDeleted(ent) {
    try { return JSON.parse(localStorage.getItem(deletedKey(ent)) || "[]"); }
    catch (e) { return []; }
  }
  function saveDeleted(ent, list) { localStorage.setItem(deletedKey(ent), JSON.stringify(list)); }

  function visibleItems(ent) {
    var del = loadDeleted(ent);
    return merged(ent).filter(function (x) { return del.indexOf(x.id) === -1; });
  }

  // ---- render ----
  function render(app) {
    if (!Auth.requireRole("admin")) return;
    var u = Auth.currentUser();
    var tabs = '<nav class="mb-4 flex flex-wrap gap-1.5" aria-label="Pilih entitas">' + ENTITIES.map(function (e) {
      return '<button type="button" class="btn btn-sm' + (e.key === state.ent.key ? " btn-primary" : "") + '" data-ent="' + e.key + '">' + e.label + '</button>';
    }).join("") + '<button type="button" class="btn btn-sm" data-ent="__users">User</button></nav>';

    var body = state.ent.key === "__users" || state.tab === "__users" ? usersTable() : itemsTable(state.ent);

    app.innerHTML = '<div class="mb-6"><div class="eyebrow mb-2"><span>Admin</span></div><h1 class="mb-2">Panel Admin</h1>' +
      '<p class="small muted">Masuk sebagai <strong>' + App.escapeHtml(u.email) + '</strong> (' + u.role + '). Perubahan disimpan di perangkat ini (demo).</p></div>' +
      '<div id="adminBody">' + tabs + body + '</div>';

    app.querySelectorAll("[data-ent]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.ent;
        if (k === "__users") { state.tab = "__users"; }
        else { state.tab = null; state.ent = ENTITIES.find(function (e) { return e.key === k; }); }
        render(app);
      });
    });

    wireTable(app);
  }

  function itemsTable(ent) {
    var items = visibleItems(ent);
    var cols = ent.fields.slice(0, 4);
    var rows = items.map(function (x) {
      return '<tr>' + cols.map(function (f) {
        var v = x[f.n];
        var s = (v === null || v === undefined) ? "" : (typeof v === "object" ? JSON.stringify(v).slice(0, 60) : String(v).slice(0, 60));
        return '<td>' + App.escapeHtml(s) + '</td>';
      }).join("") +
        '<td><div class="flex flex-wrap gap-1.5"><button class="btn btn-sm" data-edit="' + x.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + x.id + '">Hapus</button></div></td></tr>';
    }).join("");

    return '<div class="surface-card p-5"><div class="mb-3 flex items-center justify-between gap-3"><h3 class="m-0">' + ent.label + ' (' + items.length + ')</h3>' +
      '<button class="btn btn-primary btn-sm" id="newItem">+ Tambah</button></div>' +
      '<div class="table-wrap"><table><thead><tr>' +
      cols.map(function (f) { return '<th>' + App.escapeHtml(f.l) + '</th>'; }).join("") +
      '<th>Aksi</th></tr></thead><tbody>' + (rows || '<tr><td colspan="99">Belum ada data.</td></tr>') + '</tbody></table></div></div>' +
      '<div id="formArea"></div>';
  }

  function usersTable() {
    var users = Auth.listUsers();
    var rows = users.map(function (u) {
      return '<tr><td>' + App.escapeHtml(u.email) + '</td><td>' + App.escapeHtml(u.nama || "") + '</td>' +
        '<td><span class="badge' + (u.role === "admin" ? " badge-warn" : "") + '">' + u.role + '</span></td>' +
        '<td><div class="flex flex-wrap gap-1.5">' +
        '<button class="btn btn-sm" data-role="' + u.id + '">' + (u.role === "admin" ? "→ Mahasiswa" : "→ Admin") + '</button>' +
        '<button class="btn btn-sm" data-editpw="' + u.id + '">Reset Password</button>' +
        '<button class="btn btn-sm btn-danger" data-deluser="' + u.id + '">Hapus</button></div></td></tr>';
    }).join("");
    return '<div class="surface-card p-5"><div class="mb-3"><h3 class="m-0">User (' + users.length + ')</h3></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Email</th><th>Nama</th><th>Role</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="tiny dim mt-3">Registrasi mahasiswa publik; role admin dikendalikan dari sini.</p></div>' +
      '<div id="formArea"></div>';
  }

  // ---- form editor ----
  function openForm(ent, item) {
    var isNew = !item;
    item = item || {};
    var area = document.getElementById("formArea");
    var fields = ent.fields.map(function (f) {
      var v = item[f.n];
      var val = v === undefined || v === null ? "" : (typeof v === "object" ? JSON.stringify(v, null, 2) : String(v));
      var checked = (f.t === "checkbox" && v) ? " checked" : "";
      if (f.t === "textarea") return '<label class="field"><span class="lbl">' + App.escapeHtml(f.l) + '</span><textarea data-f="' + f.n + '" rows="4" class="input">' + App.escapeHtml(val) + '</textarea></label>';
      if (f.t === "json") return '<label class="field"><span class="lbl">' + App.escapeHtml(f.l) + '</span><textarea data-f="' + f.n + '" rows="5" class="input mono">' + App.escapeHtml(val) + '</textarea></label>';
      if (f.t === "select") {
        var opts = f.opts.map(function (o) { return '<option' + (o === v ? " selected" : "") + '>' + o + '</option>'; }).join("");
        return '<label class="field"><span class="lbl">' + App.escapeHtml(f.l) + '</span><select data-f="' + f.n + '" class="input">' + opts + '</select></label>';
      }
      if (f.t === "checkbox") return '<label class="flex items-center gap-3"><input type="checkbox" data-f="' + f.n + '" style="accent-color:var(--brand)"' + checked + '><span>' + App.escapeHtml(f.l) + '</span></label>';
      return '<label class="field"><span class="lbl">' + App.escapeHtml(f.l) + '</span><input type="' + (f.t === "number" ? "number" : "text") + '" data-f="' + f.n + '" class="input" value="' + App.escapeHtml(val) + '"></label>';
    }).join("");

    area.innerHTML = '<div class="surface-card mt-4 p-5"><div class="mb-3 flex items-center justify-between gap-3"><h3 class="m-0">' + (isNew ? "Tambah" : "Edit") + ' ' + ent.label + '</h3>' +
      '<button class="btn btn-sm btn-ghost" id="cancelForm">Batal</button></div>' +
      '<form id="entForm">' + fields + '<div class="mt-2 flex flex-wrap gap-3"><button type="submit" class="btn btn-primary">Simpan</button></div></form></div>';
    area.scrollIntoView({ behavior: "smooth", block: "nearest" });

    document.getElementById("cancelForm").addEventListener("click", function () { area.innerHTML = ""; });
    document.getElementById("entForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var obj = {};
      var bad = null;
      ent.fields.forEach(function (f) {
        var el = area.querySelector('[data-f="' + f.n + '"]');
        if (!el) return;
        if (f.t === "checkbox") { obj[f.n] = el.checked; return; }
        var raw = el.value;
        if (f.t === "number") obj[f.n] = Number(raw);
        else if (f.t === "json") {
          if (!raw.trim()) { obj[f.n] = null; return; }
          try { obj[f.n] = JSON.parse(raw); } catch (err) { bad = f.l + ": JSON tidak valid."; }
        } else obj[f.n] = raw;
      });
      if (bad) { App.toast(bad); return; }
      var missing = ent.fields.filter(function (f) { return f.req && (obj[f.n] === undefined || obj[f.n] === "" || obj[f.n] === null); });
      if (missing.length) { App.toast("Wajib diisi: " + missing.map(function (f) { return f.l; }).join(", ")); return; }

      // simpan
      var del = loadDeleted(ent);
      var extras = loadExtra(ent.store);
      var idx = extras.findIndex(function (x) { return String(x.id) === String(obj.id); });
      if (idx !== -1) extras[idx] = obj;
      else extras.push(obj);
      saveExtra(ent, extras);
      // kalau mengedit bawaan, tandai bawaan itu "ditimpa" — cukup tambahkan di extras; bawaan tetap tampil, ambil extras dulu di runtime
      saveDeleted(ent, del.filter(function (d) { return String(d) !== String(obj.id); }));
      App.toast((isNew ? "Ditambahkan: " : "Diperbarui: ") + obj.id);
      area.innerHTML = "";
      App.render();
    });
  }

  // ---- wiring aksi tabel ----
  function wireTable(app) {
    var newBtn = document.getElementById("newItem");
    if (newBtn) newBtn.addEventListener("click", function () { openForm(state.ent, null); });

    app.querySelectorAll("[data-edit]").forEach(function (b) {
      b.addEventListener("click", function () {
        var item = visibleItems(state.ent).find(function (x) { return String(x.id) === b.dataset.edit; });
        if (item) openForm(state.ent, item);
      });
    });

    app.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Hapus item " + b.dataset.del + "?")) return;
        var del = loadDeleted(state.ent);
        if (del.indexOf(b.dataset.del) === -1) del.push(isNaN(Number(b.dataset.del)) ? b.dataset.del : Number(b.dataset.del));
        saveDeleted(state.ent, del);
        // buang dari extras juga
        saveExtra(state.ent, loadExtra(state.ent).filter(function (x) { return String(x.id) !== b.dataset.del; }));
        App.toast("Dihapus.");
        App.render();
      });
    });

    app.querySelectorAll("[data-role]").forEach(function (b) {
      b.addEventListener("click", function () {
        var u = Auth.listUsers().find(function (x) { return x.id === b.dataset.role; });
        if (!u) return;
        var next = u.role === "admin" ? "mahasiswa" : "admin";
        if (!confirm("Ubah role " + u.email + " menjadi " + next + "?")) return;
        Auth.updateUser(u.id, { role: next }).then(function () { App.toast("Role diubah."); App.render(); });
      });
    });

    app.querySelectorAll("[data-editpw]").forEach(function (b) {
      b.addEventListener("click", function () {
        var pw = prompt("Password baru (min 6 karakter):");
        if (!pw || pw.length < 6) return;
        Auth.updateUser(b.dataset.editpw, { password: pw }).then(function () { App.toast("Password direset."); });
      });
    });

    app.querySelectorAll("[data-deluser]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm("Hapus user ini?")) return;
        Auth.deleteUser(b.dataset.deluser);
        App.toast("User dihapus.");
        App.render();
      });
    });
  }

  // ---- router ----
  App.add("admin", render);
})();
