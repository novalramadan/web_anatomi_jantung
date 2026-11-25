(function () {
  "use strict";

  // Field types drive both form controls and serialization.
  // T = text, N = number, B = bool, J = json (textarea), S = select,
  // R = relation, F = file. Every collection needs at least one non-file
  // field so a record has a readable title.
  var SCHEMA = {
    pertemuan: [
      ["id_lokal", "N", "ID lokal", true], ["judul", "T", "Judul", true],
      ["blok", "T", "Blok"], ["ringkasan", "T", "Ringkasan"],
      ["isi", "J", "Isi (JSON: tujuan, konsep_inti, …)"],
      ["bacaan", "T", "Bacaan"], ["label_integrasi", "B", "Label integrasi"],
      ["urutan", "N", "Urutan"]],
    soal: [
      ["id_lokal", "N", "ID lokal", true], ["pertemuan", "N", "No. pertemuan"],
      ["level", "S", "Level", false, ["C2", "C3", "C4"]],
      ["pertanyaan", "T", "Pertanyaan", true], ["opsi", "J", "Opsi (JSON {A..E})"],
      ["kunci", "S", "Kunci", false, ["A", "B", "C", "D", "E"]],
      ["pembahasan", "T", "Pembahasan"], ["gambar", "F", "Gambar"]],
    esai: [
      ["id_lokal", "N", "ID lokal", true], ["pertemuan_terkait", "J", "Pertemuan terkait (JSON array)"],
      ["pertanyaan", "T", "Pertanyaan", true], ["jawaban_model", "T", "Jawaban model"],
      ["checklist", "J", "Checklist (JSON)"]],
    kasus: [
      ["id_lokal", "T", "ID lokal (teks)", true], ["judul", "T", "Judul", true],
      ["ringkasan", "T", "Ringkasan"], ["status_validasi", "T", "Status validasi"],
      ["halaman", "J", "Halaman (JSON)"]],
    marker: [
      ["id_lokal", "N", "ID lokal", true], ["nilai_barcode", "N", "Nilai barcode"],
      ["nama", "T", "Nama", true], ["deskripsi", "T", "Deskripsi"],
      ["pertemuan_terkait", "J", "Pertemuan terkait (JSON array)"],
      ["lapisan", "J", "Lapisan (JSON)"], ["aset_3d", "R", "Aset 3D"]],
    aset_3d: [
      ["nama", "T", "Nama", true], ["file_glb", "F", "File GLB"], ["keterangan", "T", "Keterangan"]],
    glosarium: [["istilah", "T", "Istilah", true], ["definisi", "T", "Definisi", true]],
    rumus: [["nama", "T", "Nama", true], ["rumus", "T", "Rumus"], ["keterangan", "T", "Keterangan"]],
    normal: [["parameter", "T", "Parameter", true], ["nilai_normal", "T", "Nilai normal"]],
    pustaka: [["kutipan", "T", "Kutipan", true]]
  };
  var LABELS = {
    pertemuan: "Pertemuan", soal: "Soal", esai: "Esai", kasus: "Kasus",
    marker: "Marker AR", aset_3d: "Aset 3D", glosarium: "Glosarium",
    rumus: "Rumus", normal: "Nilai normal", pustaka: "Pustaka"
  };
  // PocketBase 0.40 rejects `sort=-created` on these collections. Collections
  // with id_lokal use it; the rest keep PocketBase's default order.
  var SORT = {
    pertemuan: "id_lokal", soal: "id_lokal", esai: "id_lokal",
    kasus: "id_lokal", marker: "id_lokal"
  };
  var selected = "pertemuan";
  var records = [];
  var currentPage = 1;
  var busy = false;

  function esc(s) { return App.escapeHtml(s == null ? "" : typeof s === "object" ? JSON.stringify(s) : String(s)); }
  function fail(e) { App.toast(e && e.message ? e.message : "Permintaan gagal."); }

  function title(r) {
    return r.judul || r.nama || r.istilah || r.parameter || r.kutipan ||
      r.pertanyaan || (r.id_lokal != null ? "ID " + r.id_lokal : r.id);
  }

  // dosen-only; server rules stay the real guard.
  function render(app) {
    if (!Auth.requireRole("dosen")) return;
    app.innerHTML = '<div class="mb-6"><div class="eyebrow mb-2">Kelola Konten</div><h1>Panel Dosen</h1>' +
      '<p class="small muted">Perubahan tersimpan langsung di PocketBase.</p></div>' +
      '<div class="flex flex-wrap gap-2 mb-4" id="collectionTabs"></div><div id="recordsPanel">Memuat…</div><div id="recordForm"></div>';
    var tabs = app.querySelector("#collectionTabs");
    Object.keys(SCHEMA).forEach(function (name) {
      var btn = document.createElement("button");
      btn.className = "btn btn-sm" + (selected === name ? " btn-primary" : "");
      btn.textContent = LABELS[name];
      btn.addEventListener("click", function () { selected = name; currentPage = 1; app.querySelector("#recordForm").innerHTML = ""; render(app); });
      tabs.appendChild(btn);
    });
    loadRecords(app);
  }

  function loadRecords(app) {
    var sort = SORT[selected] ? "&sort=" + SORT[selected] : "";
    PB.request("/api/collections/" + selected + "/records?perPage=20&page=" + currentPage + sort)
      .then(function (res) {
        records = res.items || [];
        drawRecords(app, res);
      }).catch(fail);
  }

  function drawRecords(app, res) {
    var panel = app.querySelector("#recordsPanel");
    if (!panel) return;
    var rows = records.map(function (r) {
      var brief = SCHEMA[selected].map(function (f) { return f[0]; })
        .filter(function (k) { return r[k] != null && r[k] !== "" && k !== "id_lokal"; })
        .map(function (k) { return k + ": " + (typeof r[k] === "object" ? "[json]" : String(r[k]).slice(0, 40)); })
        .join(" · ");
      return '<tr><td><strong>' + esc(title(r)) + '</strong><div class="tiny muted">' + esc(brief) + '</div></td>' +
        '<td><div class="flex gap-2"><button class="btn btn-sm" data-edit="' + esc(r.id) + '">Edit</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + esc(r.id) + '">Hapus</button></div></td></tr>';
    }).join("");
    panel.innerHTML = '<div class="surface-card p-5"><div class="flex items-center justify-between gap-3 mb-3">' +
      '<h2 class="m-0">' + esc(LABELS[selected]) + ' (' + res.totalItems + ')</h2>' +
      '<button class="btn btn-primary btn-sm" id="newItem">+ Tambah</button></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Record</th><th>Aksi</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="2">Belum ada data.</td></tr>') + '</tbody></table></div>' +
      '<div class="flex justify-between mt-3"><button class="btn btn-sm" id="prevPage"' + (currentPage <= 1 ? " disabled" : "") + '>Sebelumnya</button>' +
      '<span class="tiny muted">Halaman ' + res.page + ' / ' + res.totalPages + '</span>' +
      '<button class="btn btn-sm" id="nextPage"' + (currentPage >= res.totalPages ? " disabled" : "") + '>Berikutnya</button></div></div>';
    panel.querySelector("#newItem").addEventListener("click", function () { openForm(app, null); });
    panel.querySelectorAll("[data-edit]").forEach(function (b) {
      b.addEventListener("click", function () { openForm(app, records.find(function (r) { return r.id === b.dataset.edit; })); });
    });
    panel.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () { deleteRecord(app, b.dataset.del); });
    });
    panel.querySelector("#prevPage").addEventListener("click", function () { if (currentPage > 1) { currentPage--; loadRecords(app); } });
    panel.querySelector("#nextPage").addEventListener("click", function () { if (currentPage < res.totalPages) { currentPage++; loadRecords(app); } });
  }

  function relationOptions() {
    return PB.request("/api/collections/aset_3d/records?perPage=500&sort=nama").then(function (res) { return res.items || []; });
  }

  function fieldHtml(key, spec, record, assets) {
    var t = spec[1], label = spec[2], req = !!spec[3], opts = spec[4];
    var v = record ? record[key] : "";
    var star = req ? ' <span class="text-danger">*</span>' : "";
    if (t === "F") {
      var has = record && record[key];
      return '<label class="field"><span class="lbl">' + esc(label) + (has ? ' (terisi: ' + esc(fileField(record[key]).filename) + ')' : "") + star + '</span>' +
        '<input type="file" class="input" data-field="' + esc(key) + '" accept="' + (key === "file_glb" ? ".glb" : "image/*") + '"></label>';
    }
    if (t === "B") {
      return '<label class="flex items-center gap-2 my-2"><input type="checkbox" data-field="' + esc(key) + '"' + (v ? " checked" : "") + '> <span>' + esc(label) + '</span></label>';
    }
    if (t === "S") {
      return '<label class="field"><span class="lbl">' + esc(label) + star + '</span><select class="input" data-field="' + esc(key) + '">' +
        '<option value="">— pilih —</option>' + opts.map(function (o) {
          return '<option value="' + esc(o) + '"' + (v === o ? " selected" : "") + '>' + esc(o) + '</option>';
        }).join("") + '</select></label>';
    }
    if (t === "R") {
      return '<label class="field"><span class="lbl">' + esc(label) + star + '</span><select class="input" data-field="' + esc(key) + '">' +
        '<option value="">— tanpa aset —</option>' + assets.map(function (a) {
          return '<option value="' + esc(a.id) + '"' + (v === a.id ? " selected" : "") + '>' + esc(a.nama) + '</option>';
        }).join("") + '</select></label>';
    }
    if (t === "J") {
      var text = v == null ? "" : typeof v === "string" ? v : JSON.stringify(v, null, 2);
      return '<label class="field"><span class="lbl">' + esc(label) + star + '</span>' +
        '<textarea rows="5" class="input mono" data-field="' + esc(key) + '" placeholder="Kosongkan bila tidak dipakai">' + esc(text) + '</textarea></label>';
    }
    if (t === "N") {
      return '<label class="field"><span class="lbl">' + esc(label) + star + '</span>' +
        '<input type="number" class="input" data-field="' + esc(key) + '" value="' + esc(v) + '"></label>';
    }
    return '<label class="field"><span class="lbl">' + esc(label) + star + '</span>' +
      '<input class="input" data-field="' + esc(key) + '" value="' + esc(v) + '"></label>';
  }

  function fileField(value) {
    var item = Array.isArray(value) ? value[0] : value;
    return item && item.filename ? item : { filename: "(berkas)" };
  }

  function openForm(app, record) {
    var panel = app.querySelector("#recordForm");
    var fields = SCHEMA[selected];
    var rel = fields.some(function (f) { return f[1] === "R"; });
    var make = function (assets) {
      var body = fields.map(function (f) { return fieldHtml(f[0], f, record, assets); }).join("");
      panel.innerHTML = '<div class="surface-card mt-4 p-5"><div class="flex justify-between items-center mb-2">' +
        '<h3 class="m-0">' + (record ? "Edit" : "Tambah") + " " + esc(LABELS[selected]) + '</h3>' +
        '<button type="button" class="btn btn-sm" id="cancelForm">Tutup</button></div>' +
        '<form id="entForm" novalidate data-ent="' + esc(selected) + '">' + body +
        '<div class="flex gap-2 mt-3"><button class="btn btn-primary" type="submit" id="formSave">Simpan</button>' +
        '<button class="btn" type="button" id="formCancel">Batal</button></div></form></div>';
      var close = function () { panel.innerHTML = ""; };
      panel.querySelector("#cancelForm").addEventListener("click", close);
      panel.querySelector("#formCancel").addEventListener("click", close);
      panel.querySelector("#entForm").addEventListener("submit", function (e) {
        e.preventDefault();
        saveForm(app, panel, record);
      });
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    (rel ? relationOptions() : Promise.resolve([])).then(make).catch(fail);
  }

  function collect(panel, schema, record) {
    var json = {}, fd = new FormData(), hasFile = false;
    var bad = null;
    panel.querySelectorAll("[data-field]").forEach(function (el) {
      var key = el.dataset.field, spec = schema.find(function (f) { return f[0] === key; }), t = spec[1];
      if (t === "F") {
        if (el.files[0]) {
          if (key === "file_glb" && !el.files[0].name.toLowerCase().endsWith(".glb")) { bad = "File aset harus berformat .glb."; return; }
          if (key === "gambar" && !el.files[0].type.startsWith("image/")) { bad = "Berkas gambar harus berupa image."; return; }
          fd.append(key, el.files[0]); hasFile = true;
        }
        else if (spec[3] && !record) bad = key + " wajib diisi.";
        return;
      }
      if (t === "B") { json[key] = el.checked; return; }
      var val = String(el.value == null ? "" : el.value);
      if (spec[3] && !val.trim()) { bad = key + " wajib diisi."; return; }
      if (t === "N") {
        // PocketBase rejects explicit null on a required field; omit it instead.
        if (val === "") { if (spec[3]) bad = key + " wajib diisi."; return; }
        json[key] = Number(val);
      }
      else if (t === "J") {
        // JSON null is a real value in PB; omit the key when the box is empty.
        if (val.trim() === "") { if (spec[3]) bad = key + " wajib diisi."; return; }
        else { try { json[key] = JSON.parse(val); } catch (err) { bad = key + ": JSON tidak valid — " + err.message; } }
      } else if (t === "R") json[key] = val === "" ? null : val;
      // Send an empty string only when the field already has a value; otherwise
      // PocketBase rejects "" on newer required-less text fields.
      else if (val !== "" || (record && record[key])) json[key] = val;
    });
    if (bad) throw new Error(bad);
    if (hasFile) {
      Object.keys(json).forEach(function (k) {
        fd.append(k, json[k] == null ? "" : typeof json[k] === "object" ? JSON.stringify(json[k]) : String(json[k]));
      });
      return fd;
    }
    return json;
  }

  function saveForm(app, panel, record) {
    if (busy) return;
    var btn = panel.querySelector("#formSave");
    var body;
    try { body = collect(panel, SCHEMA[selected], record); }
    catch (err) { App.toast(err.message); return; }
    busy = true;
    btn.disabled = true;
    var url = "/api/collections/" + selected + "/records" + (record ? "/" + encodeURIComponent(record.id) : "");
    PB.request(url, { method: record ? "PATCH" : "POST", body: body }).then(function () {
      App.toast("Tersimpan.");
      panel.innerHTML = "";
      return PB.reload();
    }).then(function () { loadRecords(app); })
      .catch(fail)
      .then(function () { busy = false; btn.disabled = false; });
  }

  function deleteRecord(app, id) {
    var r = records.find(function (x) { return x.id === id; });
    if (!confirm("Hapus " + LABELS[selected] + " \"" + (r ? title(r) : id) + "\"?")) return;
    PB.request("/api/collections/" + selected + "/records/" + encodeURIComponent(id), { method: "DELETE" })
      .then(function () {
        App.toast("Dihapus.");
        return PB.reload();
      })
      .then(function () { loadRecords(app); })
      .catch(fail);
  }

  App.add("admin", render);
})();
