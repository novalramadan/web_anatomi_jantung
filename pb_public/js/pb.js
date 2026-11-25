/* js/pb.js — PocketBase client, auth, progress, and content adapter. */
(function () {
  "use strict";

  var BASE = window.location.origin;
  var TOKEN_KEY = "medicalu_pb_token";
  var token = localStorage.getItem(TOKEN_KEY) || "";
  var progress = defaults();
  var progressId = "";
  var progressQueue = Promise.resolve();
  var user = null;

  function defaults() {
    return {
      nama_pemain: "", materi_selesai: [], skor_kuis: {},
      kasus_selesai: {}, marker_dipindai: [], refleksi: {},
      pengaturan: { ukuranFont: 100, mode: "terang", suara: true }
    };
  }

  function request(path, options) {
    options = options || {};
    var headers = options.headers || {};
    if (token) headers.Authorization = token;
    var body = options.body;
    if (body instanceof FormData) {
      // fetch sets the multipart boundary itself; no Content-Type here.
    } else {
      if (typeof body === "object" && body !== null) body = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    }
    return fetch(BASE + path, Object.assign({}, options, { headers: headers, body: body })).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) {
          var msg = data && data.message ? data.message : "PocketBase request failed (" + res.status + ").";
          var err = new Error(msg);
          err.status = res.status;
          err.data = data && data.data;
          throw err;
        }
        return data;
      });
    });
  }

  var SORTED_BY_ID_LOKAL = ["pertemuan", "soal", "kasus", "marker"];

  function records(collection) {
    var sort = SORTED_BY_ID_LOKAL.indexOf(collection) !== -1 ? "&sort=id_lokal" : "";
    var expand = collection === "marker" ? "&expand=aset_3d" : "";
    return request("/api/collections/" + encodeURIComponent(collection) + "/records?perPage=500" + sort + expand);
  }

  function fileField(value) {
    if (!value) return null;
    var item = Array.isArray(value) ? value[0] : value;
    return item ? { id: item.id, filename: item.filename } : null;
  }

  function toObject(row) {
    var out = {};
    row.forEach(function (item) { out[item[0]] = item.slice(1); });
    return out;
  }

  function loadData() {
    return Promise.all([
      records("pertemuan"), records("soal"), records("kasus"),
      records("marker"), records("glosarium"), records("rumus"), records("normal"), records("pustaka")
    ]).then(function (all) {
      window.DATA_PERTEMUAN = all[0].items.map(function (r) {
        var isi = r.isi || {};
        return {
          id: r.id_lokal, judul: r.judul, blok: r.blok, ringkasan: r.ringkasan,
          tujuan: isi.tujuan || [], konsep_inti: isi.konsep_inti || [],
          korelasi_klinis: isi.korelasi_klinis || [], rangkuman: isi.rangkuman || [],
          pertanyaan_penuntun: isi.pertanyaan_penuntun || [], bacaan: r.bacaan,
          label_integrasi: r.label_integrasi, urutan: r.urutan
        };
      });
      window.DATA_SOAL = all[1].items.map(function (r) {
        var img = fileField(r.gambar);
        return { id: r.id_lokal, pertemuan: r.pertemuan, level: r.level, pertanyaan: r.pertanyaan,
          opsi: r.opsi || {}, kunci: r.kunci, pembahasan: r.pembahasan,
          gambar: img ? img.filename : "", _recordId: img ? img.id : "",
          _fileName: img ? img.filename : "" };
      });
      window.DATA_KASUS = all[2].items.map(function (r) {
        return { id: r.id_lokal, judul: r.judul, ringkasan: r.ringkasan,
          status_validasi: r.status_validasi, halaman: r.halaman || [] };
      });
      window.DATA_MARKER = all[3].items.map(function (r) {
        var asset = r.expand && r.expand.aset_3d;
        if (Array.isArray(asset)) asset = asset[0];
        if (asset) {
          var glb = fileField(asset.file_glb);
          asset.file_glb = glb ? glb.filename : "";
        }
        return { id: r.id_lokal, nilai_barcode: r.nilai_barcode, nama: r.nama,
          deskripsi: r.deskripsi, pertemuan_terkait: r.pertemuan_terkait || [],
          lapisan: r.lapisan || [], model: asset ? asset.id : "", aset_3d: asset || null };
      });
      window.DATA_LAMPIRAN = {
        glosarium: all[4].items.map(function (r) { return [r.istilah, r.definisi]; }),
        rumus: all[5].items.map(function (r) { return [r.nama, r.rumus, r.keterangan]; }),
        normal: all[6].items.map(function (r) { return [r.parameter, r.nilai_normal]; }),
        pustaka: all[7].items.map(function (r) { return r.kutipan; })
      };
    });
  }

  function fetchProgress() {
    if (!user) { progress = defaults(); return Promise.resolve(progress); }
    return request("/api/collections/progres/records?perPage=1&filter=" + encodeURIComponent("user='" + user.id + "'")).then(function (res) {
      var record = res.items && res.items[0];
      progressId = record ? record.id : "";
      progress = Object.assign(defaults(), record && record.payload || {});
      return progress;
    }).catch(function (err) {
      if (err.status === 403 || err.status === 404) { progressId = ""; progress = defaults(); return progress; }
      throw err;
    });
  }

  function flushProgress() {
    if (!user) return Promise.resolve(false);
    var body = { user: user.id, payload: progress };
    progressQueue = progressQueue.then(function () {
      if (progressId) return request("/api/collections/progres/records/" + progressId, { method: "PATCH", body: JSON.stringify(body) });
      return request("/api/collections/progres/records", { method: "POST", body: JSON.stringify(body) }).then(function (r) { progressId = r.id; return r; });
    }).catch(function (err) {
      if (err.status === 400 && progressId) {
        progressId = "";
        return request("/api/collections/progres/records", { method: "POST", body: JSON.stringify(body) }).then(function (r) { progressId = r.id; return r; });
      }
      console.error("Progress sync failed:", err.message);
      return false;
    });
    return progressQueue;
  }

  function publicUser(record) {
    return record ? {
      id: record.id,
      email: record.email,
      role: record.role || "mahasiswa",
      nama: record.nama || record.email,
      created: record.created || "",
      updated: record.updated || ""
    } : null;
  }

  function setAuth(record, nextToken) {
    token = nextToken || "";
    user = publicUser(record);
    if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent("medicalu:auth", { detail: user }));
  }

  function login(email, password) {
    return request("/api/collections/users/auth-with-password", {
      method: "POST", body: JSON.stringify({ identity: String(email || "").trim().toLowerCase(), password: password })
    }).then(function (res) {
      setAuth(res.record, res.token);
      return loadData().then(function () { return fetchProgress().then(function () { return publicUser(res.record); }); });
    });
  }

  function register(email, password, nama) {
    email = String(email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Promise.reject(new Error("Format email tidak valid."));
    if (!password || String(password).length < 8) return Promise.reject(new Error("Password minimal 8 karakter."));
    return request("/api/collections/users/records", {
      method: "POST", body: JSON.stringify({ email: email, password: password, passwordConfirm: password, nama: nama || email.split("@")[0], role: "mahasiswa" })
    }).then(function () { return login(email, password); });
  }

  function logout() {
    setAuth(null, "");
    progressId = "";
    progress = defaults();
    progressQueue = Promise.resolve();
  }

  function restoreAuth() {
    if (!token) return Promise.resolve(null);
    return request("/api/collections/users/auth-refresh", { method: "POST", body: "{}" }).then(function (res) {
      setAuth(res.record, res.token);
      return fetchProgress().then(loadData).then(function () { return user; });
    }).catch(function () { logout(); return null; });
  }

  function fileUrl(collection, recordId, filename) {
    var col = encodeURIComponent(collection), rec = encodeURIComponent(recordId), name = encodeURIComponent(filename);
    return request("/api/files/token", { method: "POST", body: "{}" }).then(function (r) {
      return BASE + "/api/files/" + col + "/" + rec + "/" + name + "?token=" + encodeURIComponent(r.token);
    });
  }

  var ready = restoreAuth().catch(function (err) {
    console.error("Medical-U startup failed:", err.message);
    throw err;
  });

  window.PB = {
    request: request, ready: ready, loadData: loadData, fileUrl: fileUrl,
    getToken: function () { return token; }, currentUser: function () { return user; },
    records: records, flushProgress: flushProgress,
    // Refresh the DATA_* globals after a dosen edit. The glossary index caches term
    // keys, so drop it too or new terms never get tooltips.
    reload: function () { window._glossIdx = null; return loadData(); }
  };

  window.Auth = {
    login: login, register: register, logout: logout,
    currentUser: function () { return user; },
    isAdmin: function () { return !!user && user.role === "dosen"; },
    requireRole: function (role) {
      if (!user) { location.hash = "#/login"; return false; }
      if (role && user.role !== role && !(role === "admin" && user.role === "dosen")) { location.hash = "#/beranda"; return false; }
      return true;
    },
    listUsers: function () { return Promise.reject(new Error("Kelola akun melalui Dashboard PocketBase.")); },
    updateUser: function () { return Promise.reject(new Error("Kelola akun melalui Dashboard PocketBase.")); },
    deleteUser: function () { return Promise.reject(new Error("Kelola akun melalui Dashboard PocketBase.")); }
  };

  window.Storage = {
    defaults: defaults,
    load: function () { return progress; },
    save: function (p) { progress = Object.assign(defaults(), p || {}); return flushProgress(); },
    update: function (fn) { fn(progress); flushProgress(); return progress; },
    reset: function () {
      progress = defaults();
      return flushProgress();
    }
  };
})();
