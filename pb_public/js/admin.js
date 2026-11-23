(function () {
  "use strict";

  var collections = ["pertemuan", "soal", "esai", "kasus", "marker", "aset_3d", "glosarium", "rumus", "normal", "pustaka"];
  var labels = { pertemuan: "Pertemuan", soal: "Soal", esai: "Esai", kasus: "Kasus", marker: "Marker AR", aset_3d: "Aset 3D", glosarium: "Glosarium", rumus: "Rumus", normal: "Nilai normal", pustaka: "Pustaka" };
  var selected = "pertemuan";
  var records = [];
  var currentPage = 1;

  function esc(s) { return App.escapeHtml(s == null ? "" : typeof s === "object" ? JSON.stringify(s) : String(s)); }
  function message(e) { App.toast(e && e.message ? e.message : "Permintaan gagal."); }

  function render(app) {
    if (!Auth.requireRole("dosen")) return;
    app.innerHTML = '<div class="mb-6"><div class="eyebrow mb-2">Kelola Konten</div><h1>Panel Dosen</h1><p class="small muted">Perubahan tersimpan langsung di PocketBase.</p></div><div class="flex flex-wrap gap-2 mb-4" id="collectionTabs"></div><div id="recordsPanel">Memuat…</div>';
    var tabs = app.querySelector("#collectionTabs");
    collections.forEach(function (name) {
      var btn = document.createElement("button");
      btn.className = "btn btn-sm" + (selected === name ? " btn-primary" : "");
      btn.textContent = labels[name];
      btn.addEventListener("click", function () { selected = name; currentPage = 1; render(app); });
      tabs.appendChild(btn);
    });
    loadRecords(app);
  }

  function loadRecords(app) {
    PB.request("/api/collections/" + selected + "/records?perPage=100&page=" + currentPage + "&sort=-created").then(function (res) {
      records = res.items || [];
      drawRecords(app, res);
    }).catch(message);
  }

  function drawRecords(app, res) {
    var panel = app.querySelector("#recordsPanel");
    if (!panel) return;
    var rows = records.map(function (r) {
      var title = r.judul || r.nama || r.istilah || r.parameter || r.kutipan || r.pertanyaan || r.id_lokal || r.id;
      var brief = JSON.stringify(r).slice(0, 220);
      return '<tr><td><strong>' + esc(title) + '</strong><div class="tiny muted">' + esc(brief) + '</div></td><td><div class="flex gap-2"><button class="btn btn-sm" data-edit="' + esc(r.id) + '">Edit</button><button class="btn btn-sm btn-danger" data-delete="' + esc(r.id) + '">Hapus</button></div></td></tr>';
    }).join("");
    panel.innerHTML = '<div class="surface-card p-5"><div class="flex items-center justify-between gap-3 mb-3"><h2 class="m-0">' + labels[selected] + ' (' + res.totalItems + ')</h2><button class="btn btn-primary btn-sm" id="newRecord">+ Tambah</button></div><div class="table-wrap"><table><thead><tr><th>Record</th><th>Aksi</th></tr></thead><tbody>' + (rows || '<tr><td colspan="2">Belum ada data.</td></tr>') + '</tbody></table></div><div class="flex justify-between mt-3"><button class="btn btn-sm" id="prevPage"' + (currentPage <= 1 ? " disabled" : "") + '>Sebelumnya</button><span class="tiny muted">Halaman ' + res.page + ' / ' + res.totalPages + '</span><button class="btn btn-sm" id="nextPage"' + (currentPage >= res.totalPages ? " disabled" : "") + '>Berikutnya</button></div></div><div id="recordForm"></div>';
    panel.querySelector("#newRecord").addEventListener("click", function () { openForm(app, null); });
    panel.querySelectorAll("[data-edit]").forEach(function (b) { b.addEventListener("click", function () { openForm(app, records.find(function (r) { return r.id === b.dataset.edit; })); }); });
    panel.querySelectorAll("[data-delete]").forEach(function (b) { b.addEventListener("click", function () { deleteRecord(app, b.dataset.delete); }); });
    panel.querySelector("#prevPage").addEventListener("click", function () { if (currentPage > 1) { currentPage--; loadRecords(app); } });
    panel.querySelector("#nextPage").addEventListener("click", function () { if (currentPage < res.totalPages) { currentPage++; loadRecords(app); } });
  }

  function openForm(app, record) {
    var panel = app.querySelector("#recordForm");
    var r = record || {};
    var fields = Object.keys(r).filter(function (k) { return !["id", "collectionId", "collectionName", "created", "updated", "expand"].includes(k); });
    if (!record) {
      fields = {
        pertemuan: ["id_lokal", "judul", "blok", "ringkasan", "isi", "bacaan", "label_integrasi", "urutan"],
        soal: ["id_lokal", "pertemuan", "level", "pertanyaan", "opsi", "kunci", "pembahasan", "gambar"],
        esai: ["id_lokal", "pertemuan_terkait", "pertanyaan", "jawaban_model", "checklist"],
        kasus: ["id_lokal", "judul", "ringkasan", "status_validasi", "halaman"],
        marker: ["id_lokal", "nilai_barcode", "nama", "deskripsi", "pertemuan_terkait", "lapisan", "aset_3d"],
        aset_3d: ["nama", "file_glb", "keterangan"],
        glosarium: ["istilah", "definisi"], rumus: ["nama", "rumus", "keterangan"],
        normal: ["parameter", "nilai_normal"], pustaka: ["kutipan"]
      }[selected];
    }
    var form = fields.map(function (key) {
      if (key === "gambar" || key === "file_glb") return '<label class="field"><span class="lbl">' + esc(key) + ' (file)</span><input type="file" class="input" data-field="' + key + '" accept="' + (key === "file_glb" ? ".glb" : "image/*") + '"></label>';
      var value = r[key];
      var isJson = value && typeof value === "object";
      if (isJson || ["isi", "opsi", "pertemuan_terkait", "checklist", "halaman", "lapisan"].includes(key)) {
        return '<label class="field"><span class="lbl">' + esc(key) + '</span><textarea rows="5" class="input mono" data-field="' + key + '">' + esc(value == null ? "" : value) + '</textarea></label>';
      }
      if (typeof value === "boolean") return '<label class="flex gap-2"><input type="checkbox" data-field="' + key + '"' + (value ? " checked" : "") + '>' + esc(key) + '</label>';
      return '<label class="field"><span class="lbl">' + esc(key) + '</span><input class="input" data-field="' + key + '" value="' + esc(value) + '"></label>';
    }).join("");
    panel.innerHTML = '<div class="surface-card mt-4 p-5"><div class="flex justify-between"><h3>' + (record ? "Edit " : "Tambah ") + labels[selected] + '</h3><button type="button" class="btn btn-sm" id="closeForm">Tutup</button></div><form id="editForm">' + form + '<button class="btn btn-primary mt-3" type="submit">Simpan</button></form></div>';
    panel.querySelector("#closeForm").addEventListener("click", function () { panel.innerHTML = ""; });
    panel.querySelector("#editForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData();
      var json = {};
      panel.querySelectorAll("[data-field]").forEach(function (el) {
        var key = el.dataset.field;
        if (el.type === "file") { if (el.files[0]) fd.append(key, el.files[0]); return; }
        if (el.type === "checkbox") { json[key] = el.checked; return; }
        var val = el.value;
        if (["id_lokal", "pertemuan", "nilai_barcode", "urutan"].includes(key)) json[key] = Number(val);
        else if (["isi", "opsi", "pertemuan_terkait", "checklist", "halaman", "lapisan"].includes(key)) {
          try { json[key] = val ? JSON.parse(val) : null; } catch (err) { throw new Error(key + ": JSON tidak valid"); }
        } else json[key] = val;
      });
      var body;
      if (fd.has("gambar") || fd.has("file_glb")) {
        Object.keys(json).forEach(function (k) { fd.append(k, typeof json[k] === "object" ? JSON.stringify(json[k]) : String(json[k])); });
        body = fd;
      } else body = JSON.stringify(json);
      var url = "/api/collections/" + selected + "/records" + (record ? "/" + record.id : "");
      PB.request(url, { method: record ? "PATCH" : "POST", body: body }).then(function () { App.toast("Tersimpan."); loadRecords(app); }).catch(message);
    });
  }

  function deleteRecord(app, id) {
    if (!confirm("Hapus record ini?")) return;
    PB.request("/api/collections/" + selected + "/records/" + encodeURIComponent(id), { method: "DELETE" })
      .then(function () { App.toast("Dihapus."); loadRecords(app); })
      .catch(message);
  }

  App.add("admin", render);
})();
