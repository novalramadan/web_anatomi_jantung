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
      ["isi", "J", "Isi materi", false, null, "pertemuan_isi"],
      ["bacaan", "T", "Bacaan"], ["label_integrasi", "B", "Label integrasi"],
      ["urutan", "N", "Urutan"]],
    soal: [
      ["id_lokal", "N", "ID lokal", true], ["pertemuan", "N", "No. pertemuan"],
      ["level", "S", "Level", false, ["C2", "C3", "C4"]],
      ["pertanyaan", "T", "Pertanyaan", true], ["opsi", "J", "Opsi jawaban (A–E)", false, null, "soal_opsi"],
      ["kunci", "S", "Kunci", false, ["A", "B", "C", "D", "E"]],
      ["pembahasan", "T", "Pembahasan"], ["gambar", "F", "Gambar"]],
    kasus: [
      ["id_lokal", "T", "ID lokal (teks)", true], ["judul", "T", "Judul", true],
      ["ringkasan", "T", "Ringkasan"], ["status_validasi", "T", "Status validasi"],
      ["halaman", "J", "Halaman kasus", false, null, "kasus_halaman"]],
    // `marker` sengaja tidak ada di sini: marker AR + barcode dibuat/diperbarui
    // otomatis oleh hook PocketBase saat aset_3d (GLB) disimpan. Cetak QR ada
    // di halaman AR → Cetak Marker, bukan di panel dosen.
    aset_3d: [
      ["nama", "T", "Nama", true], ["file_glb", "F", "File GLB"], ["keterangan", "T", "Keterangan"]],
    glosarium: [["istilah", "T", "Istilah", true], ["definisi", "T", "Definisi", true]],
    rumus: [["nama", "T", "Nama", true], ["rumus", "T", "Rumus"], ["keterangan", "T", "Keterangan"]],
    normal: [["parameter", "T", "Parameter", true], ["nilai_normal", "T", "Nilai normal"]],
    pustaka: [["kutipan", "T", "Kutipan", true]]
  };
  var LABELS = {
    pertemuan: "Pertemuan", soal: "Soal", kasus: "Kasus",
    aset_3d: "Aset 3D", glosarium: "Glosarium",
    rumus: "Rumus", normal: "Nilai normal", pustaka: "Pustaka"
  };
  // Catatan pendek di dalam form (bukan koleksi).
  var NOTES = {
    aset_3d: "Marker AR dan barcode dibuat/diperbarui otomatis saat aset ini disimpan dengan file GLB. " +
      "Cetak QR di menu AR → Cetak Marker. Menghapus aset juga menghapus marker terkait."
  };
  // PocketBase 0.40 rejects `sort=-created` on these collections. Collections
  // with id_lokal use it; the rest keep PocketBase's default order.
  var SORT = {
    pertemuan: "id_lokal", soal: "id_lokal",
    kasus: "id_lokal"
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
    app.innerHTML = '<div class="mb-6"><div class="eyebrow mb-2">Kelola Konten</div>' +
      '<div class="flex flex-wrap items-center justify-between gap-3"><h1 class="m-0">Panel Dosen</h1>' +
      '<a href="#/kuis" id="previewKuis" class="btn btn-sm">Preview Kuis</a></div>' +
      '<p class="small muted">Perubahan tersimpan langsung di PocketBase.</p></div>' +
      '<div class="flex flex-wrap gap-2 mb-4" id="collectionTabs"></div><div id="recordsPanel">Memuat…</div>';
    var tabs = app.querySelector("#collectionTabs");
    Object.keys(SCHEMA).forEach(function (name) {
      var btn = document.createElement("button");
      btn.className = "btn btn-sm" + (selected === name ? " btn-primary" : "");
      btn.textContent = LABELS[name];
      btn.addEventListener("click", function () { selected = name; currentPage = 1; render(app); });
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

  // Hitung ID lokal berikutnya dari seluruh koleksi (bukan hanya halaman ini).
  // N: max(nilai numerik) + 1, mulai 1 bila kosong.
  // T: huruf A–Z pertama yang belum dipakai, lalu K1, K2, … bila habis.
  function nextLocalId(collection, type) {
    return PB.request("/api/collections/" + collection + "/records?perPage=500&sort=id_lokal").then(function (res) {
      var items = (res && res.items) || [];
      if (type === "N") {
        var max = 0;
        items.forEach(function (r) {
          if (r.id_lokal == null || r.id_lokal === "") return;
          var n = Number(r.id_lokal);
          if (isFinite(n) && n > max) max = n;
        });
        return max + 1;
      }
      var used = Object.create(null);
      items.forEach(function (r) {
        var s = r.id_lokal == null ? "" : String(r.id_lokal).trim().toUpperCase();
        if (s) used[s] = true;
      });
      for (var i = 0; i < 26; i++) {
        var letter = String.fromCharCode(65 + i);
        if (!used[letter]) return letter;
      }
      var k = 1;
      while (used[("K" + k).toUpperCase()]) k++;
      return "K" + k;
    });
  }

  // ── Editor JSON terstruktur ───────────────────────────────────────────
  // Spesifikasi field boleh menyebut editor pada elemen ke-6. Editor adalah
  // { initial(raw), mount(host, state), read(state) } dan memutasi JSON hasil
  // parse di tempat agar kunci tak dikenal tetap utuh saat disimpan.
  var KASUS_TIPE = ["awal", "tepat", "keliru", "kurang_tepat", "berbahaya", "evaluasi"];
  var OPSI_KEYS = ["A", "B", "C", "D", "E"];

  function jeParse(raw) {
    if (raw == null || raw === "") return null;
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch (e) { return null; }
    }
    return raw;
  }
  function jeArr(v) { return Array.isArray(v) ? v : []; }
  function jeObj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function jeEmpty(text) { return '<p class="tiny muted m-0">' + esc(text) + '</p>'; }

  // Daftar string generik: dipakai untuk list isi pertemuan dan vital halaman.
  function jeList(st, target, pi) {
    if (target === "vital") {
      var page = st.data[pi];
      if (!page) return [];
      if (!Array.isArray(page.vital)) page.vital = [];
      return page.vital;
    }
    if (!Array.isArray(st.data[target])) st.data[target] = [];
    return st.data[target];
  }

  function jeMoveBtns(upAct, downAct, delAct, attrs, i, total) {
    return '<button type="button" class="btn btn-sm" data-act="' + upAct + '" data-i="' + i + '"' + attrs + ' title="Naik"' + (i === 0 ? " disabled" : "") + '>↑</button>' +
      '<button type="button" class="btn btn-sm" data-act="' + downAct + '" data-i="' + i + '"' + attrs + ' title="Turun"' + (i === total - 1 ? " disabled" : "") + '>↓</button>' +
      '<button type="button" class="btn btn-sm btn-danger" data-act="' + delAct + '" data-i="' + i + '"' + attrs + ' title="Hapus">×</button>';
  }

  function jeStringList(st, target, title, pi, emptyText) {
    var list = jeList(st, target, pi);
    var attrs = ' data-target="' + esc(target) + '"' + (pi == null ? "" : ' data-pi="' + pi + '"');
    var rows = list.map(function (v, i) {
      return '<div class="je-row"><textarea class="input" rows="2" data-str="' + esc(target) + '" data-i="' + i + '"' + (pi == null ? "" : ' data-pi="' + pi + '"') + '>' + esc(v) + '</textarea>' +
        '<div class="je-rowbtns">' + jeMoveBtns("str-up", "str-down", "str-del", attrs, i, list.length) + '</div></div>';
    }).join("");
    return '<div class="je-subhead"><span class="lbl m-0">' + esc(title) + '</span>' +
      '<button type="button" class="btn btn-sm" data-act="str-add"' + attrs + '>+ Tambah</button></div>' +
      (rows || jeEmpty(emptyText || "Belum ada isian."));
  }

  // ── A. pertemuan.isi ─────────────────────────────────────────────────
  function jeTableHtml(st, ci, ti) {
    var table = st.data.konsep_inti[ci].tabel[ti];
    var kolom = jeArr(table.kolom), baris = jeArr(table.baris);
    var ths = kolom.map(function (k, ki) {
      return '<th><div class="je-cellwrap"><input class="input je-cell" data-col="1" data-ci="' + ci + '" data-ti="' + ti + '" data-ki="' + ki + '" value="' + esc(k) + '" aria-label="Kolom ' + (ki + 1) + '">' +
        '<button type="button" class="btn btn-sm btn-danger" data-act="col-del" data-ci="' + ci + '" data-ti="' + ti + '" data-ki="' + ki + '" title="Hapus kolom"' + (kolom.length <= 1 ? " disabled" : "") + '>×</button></div></th>';
    }).join("");
    var trs = baris.map(function (row, ri) {
      row = jeArr(row);
      var tds = kolom.map(function (_, ki) {
        return '<td><input class="input je-cell" data-cell="1" data-ci="' + ci + '" data-ti="' + ti + '" data-ri="' + ri + '" data-ki="' + ki + '" value="' + esc(row[ki]) + '"></td>';
      }).join("");
      return '<tr>' + tds + '<td><button type="button" class="btn btn-sm btn-danger" data-act="row-del" data-ci="' + ci + '" data-ti="' + ti + '" data-ri="' + ri + '" title="Hapus baris">×</button></td></tr>';
    }).join("");
    return '<div class="je-nested">' +
      '<div class="je-row"><input class="input" data-tfield="judul" data-ci="' + ci + '" data-ti="' + ti + '" value="' + esc(table.judul) + '" placeholder="Judul tabel">' +
      '<button type="button" class="btn btn-sm btn-danger" data-act="table-del" data-ci="' + ci + '" data-ti="' + ti + '">Hapus tabel</button></div>' +
      '<div class="je-subhead"><span class="lbl m-0">Kolom</span><button type="button" class="btn btn-sm" data-act="col-add" data-ci="' + ci + '" data-ti="' + ti + '">+ Kolom</button></div>' +
      '<div class="je-grid-scroll"><table class="je-grid-table"><thead><tr>' + ths + '<th></th></tr></thead><tbody>' + trs + '</tbody></table></div>' +
      '<button type="button" class="btn btn-sm mt-2" data-act="row-add" data-ci="' + ci + '" data-ti="' + ti + '">+ Baris</button></div>';
  }

  function jeConceptHtml(st, ci, open) {
    var c = st.data.konsep_inti[ci];
    var tables = jeArr(c.tabel).map(function (_, ti) { return jeTableHtml(st, ci, ti); }).join("");
    return '<details class="acc je-card" data-ci="' + ci + '"' + (open ? " open" : "") + '>' +
      '<summary><span class="je-sum-title"><strong>Konsep #' + (ci + 1) + '</strong> — <span data-concept-label>' + esc(c.judul || "(tanpa judul)") + '</span></span>' +
      '<span class="je-sumbtns">' + jeMoveBtns("concept-up", "concept-down", "concept-del", ' data-ci="' + ci + '"', ci, st.data.konsep_inti.length) + '</span></summary>' +
      '<div class="je-body">' +
      '<label class="field mb-0"><span class="lbl">Judul</span><input class="input" data-cfield="judul" data-ci="' + ci + '" value="' + esc(c.judul) + '"></label>' +
      '<label class="field"><span class="lbl">Isi</span><textarea rows="4" class="input" data-cfield="isi" data-ci="' + ci + '">' + esc(c.isi) + '</textarea></label>' +
      '<div class="je-subhead"><span class="lbl m-0">Tabel</span><button type="button" class="btn btn-sm" data-act="table-add" data-ci="' + ci + '">+ Tambah tabel</button></div>' +
      (tables || jeEmpty("Belum ada tabel.")) +
      '</div></details>';
  }

  function pertemuanIsiHtml(st, open) {
    var data = st.data;
    var konsep = data.konsep_inti.map(function (_, ci) { return jeConceptHtml(st, ci, open.indexOf(ci) !== -1); }).join("");
    return '<div class="je-section">' + jeStringList(st, "tujuan", "Tujuan pembelajaran", null, "Belum ada tujuan.") + '</div>' +
      '<div class="je-section"><div class="je-subhead"><span class="lbl m-0">Konsep inti</span>' +
      '<button type="button" class="btn btn-sm" data-act="concept-add">+ Tambah konsep</button></div>' +
      (konsep || jeEmpty("Belum ada konsep inti.")) + '</div>' +
      '<div class="je-section">' + jeStringList(st, "korelasi_klinis", "Korelasi klinis", null, "Belum ada korelasi klinis.") + '</div>' +
      '<div class="je-section">' + jeStringList(st, "pertanyaan_penuntun", "Pertanyaan penuntun", null, "Belum ada pertanyaan penuntun.") + '</div>' +
      '<div class="je-section">' + jeStringList(st, "rangkuman", "Rangkuman", null, "Belum ada rangkuman.") + '</div>';
  }

  // ── B. soal.opsi ─────────────────────────────────────────────────────
  function soalOpsiHtml(st) {
    var data = st.data;
    var extras = Object.keys(data).filter(function (k) { return OPSI_KEYS.indexOf(k) === -1; });
    return '<div class="grid gap-3 je-opsi-grid">' + OPSI_KEYS.map(function (k) {
      return '<label class="field mb-0"><span class="lbl">Opsi ' + k + '</span>' +
        '<textarea rows="2" class="input" data-opsi="' + k + '">' + esc(data[k]) + '</textarea></label>';
    }).join("") + '</div>' +
      (extras.length ? '<p class="tiny muted mt-2 mb-0">Kunci tambahan dipertahankan: ' + esc(extras.join(", ")) + '.</p>' : "");
  }

  // ── C. kasus.halaman ─────────────────────────────────────────────────
  function jePageHead(p) {
    var id = p.id == null || String(p.id) === "" ? "(tanpa id)" : String(p.id);
    var judul = p.judul == null || String(p.judul) === "" ? "(tanpa judul)" : String(p.judul);
    return id + " — " + judul;
  }
  function jePageNo(p) { return p.nomor == null || p.nomor === "" ? "Nomor —" : "Nomor " + p.nomor; }

  function jeNewPage(nomor) {
    return {
      id: "", nomor: nomor, tipe: "awal", label: "", judul: "", cerita: "",
      gambar: "", vital: [], adegan: [], efek_vital: null, pilihan: []
    };
  }
  function jeNextNomor(pages) {
    var n = 0;
    pages.forEach(function (p) { var v = Number(p.nomor); if (isFinite(v) && v > n) n = v; });
    return n + 1;
  }

  function jeTargetOptions(st, current) {
    var ids = [];
    st.data.forEach(function (p) {
      var id = p.id == null ? "" : String(p.id);
      if (id !== "" && ids.indexOf(id) === -1) ids.push(id);
    });
    var cur = current == null ? "" : String(current);
    if (cur !== "" && ids.indexOf(cur) === -1) ids.push(cur);
    var html = cur === "" ? '<option value="">— pilih halaman —</option>' : "";
    html += ids.map(function (id) {
      var match = st.data.find(function (p) { return String(p.id == null ? "" : p.id) === id; });
      var judul = match && match.judul ? String(match.judul) : "";
      return '<option value="' + esc(id) + '"' + (id === cur ? " selected" : "") + '>' + esc(judul ? id + " — " + judul : id) + '</option>';
    }).join("");
    return html;
  }

  function jePageInput(label, field, value, pi, extra) {
    return '<label class="field mb-0"><span class="lbl">' + esc(label) + '</span>' +
      '<input class="input" data-pfield="' + field + '" data-pi="' + pi + '"' + (extra || "") + ' value="' + esc(value == null ? "" : value) + '"></label>';
  }

  function jeTipeSelect(st, pi) {
    var cur = st.data[pi].tipe == null ? "" : String(st.data[pi].tipe);
    var list = KASUS_TIPE.slice();
    if (cur !== "" && list.indexOf(cur) === -1) list.push(cur);
    var opts = cur === "" ? '<option value="">— pilih —</option>' : "";
    opts += list.map(function (v) {
      return '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + '>' + esc(v) + '</option>';
    }).join("");
    return '<label class="field mb-0"><span class="lbl">Tipe</span><select class="input" data-pfield="tipe" data-pi="' + pi + '">' + opts + '</select></label>';
  }

  function jeAdeganHtml(st, pi) {
    var list = jeArr(st.data[pi].adegan);
    var rows = list.map(function (a, ai) {
      var attrs = ' data-pi="' + pi + '" data-ai="' + ai + '"';
      return '<div class="je-nested"><div class="je-row">' +
        '<input class="input je-w-sm" data-afield="pembicara" data-pi="' + pi + '" data-ai="' + ai + '" value="' + esc(a.pembicara) + '" placeholder="Pembicara">' +
        '<textarea class="input" rows="2" data-afield="teks" data-pi="' + pi + '" data-ai="' + ai + '">' + esc(a.teks) + '</textarea>' +
        '<div class="je-rowbtns">' + jeMoveBtns("ade-up", "ade-down", "ade-del", attrs, ai, list.length) + '</div>' +
        '</div></div>';
    }).join("");
    return '<div class="je-subhead"><span class="lbl m-0">Adegan</span>' +
      '<button type="button" class="btn btn-sm" data-act="ade-add" data-pi="' + pi + '">+ Tambah adegan</button></div>' +
      (rows || jeEmpty("Belum ada adegan."));
  }

  function jePilihanHtml(st, pi) {
    var list = jeArr(st.data[pi].pilihan);
    var rows = list.map(function (q, qi) {
      var attrs = ' data-pi="' + pi + '" data-qi="' + qi + '"';
      return '<div class="je-nested"><div class="flex justify-between items-center gap-2 mb-1">' +
        '<span class="tiny muted">Pilihan #' + (qi + 1) + '</span>' +
        '<div class="je-rowbtns">' + jeMoveBtns("pil-up", "pil-down", "pil-del", attrs, qi, list.length) + '</div></div>' +
        '<label class="field mb-0"><span class="lbl">Teks</span><textarea rows="2" class="input" data-qfield="teks" data-pi="' + pi + '" data-qi="' + qi + '">' + esc(q.teks) + '</textarea></label>' +
        '<div class="je-grid-cols mt-2">' +
        '<label class="field mb-0"><span class="lbl">Tujuan halaman</span><select class="input" data-qfield="tujuan" data-pi="' + pi + '" data-qi="' + qi + '">' + jeTargetOptions(st, q.tujuan) + '</select></label>' +
        '<label class="flex items-center gap-2 mt-2"><input type="checkbox" data-qalt="1" data-pi="' + pi + '" data-qi="' + qi + '"' + (q.alt ? " checked" : "") + '> <span class="tiny">Alternatif</span></label>' +
        '</div></div>';
    }).join("");
    return '<div class="je-subhead"><span class="lbl m-0">Pilihan</span>' +
      '<button type="button" class="btn btn-sm" data-act="pil-add" data-pi="' + pi + '">+ Tambah pilihan</button></div>' +
      (rows || jeEmpty("Belum ada pilihan."));
  }

  function kasusPageHtml(st, pi, open) {
    var p = st.data[pi];
    return '<details class="acc je-card" data-pi="' + pi + '"' + (open ? " open" : "") + '>' +
      '<summary><span class="je-sum-title"><strong data-pageheader>' + esc(jePageHead(p)) + '</strong>' +
      '<span class="tiny muted" data-pagenomor> · ' + esc(jePageNo(p)) + '</span></span>' +
      '<span class="je-sumbtns">' + jeMoveBtns("page-up", "page-down", "page-del", ' data-pi="' + pi + '"', pi, st.data.length) + '</span></summary>' +
      '<div class="je-body">' +
      '<div class="je-grid-cols">' +
      jePageInput("ID halaman", "id", p.id, pi) +
      jePageInput("Nomor", "nomor", p.nomor, pi, ' type="number"') +
      jeTipeSelect(st, pi) +
      jePageInput("Label", "label", p.label, pi) +
      jePageInput("Judul", "judul", p.judul, pi) +
      '</div>' +
      '<label class="field"><span class="lbl">Cerita (HTML)</span><textarea rows="5" class="input mono" data-pfield="cerita" data-pi="' + pi + '">' + esc(p.cerita) + '</textarea></label>' +
      '<label class="field"><span class="lbl">Gambar (markup SVG/HTML)</span><textarea rows="4" class="input mono" data-pfield="gambar" data-pi="' + pi + '">' + esc(p.gambar) + '</textarea></label>' +
      jeStringList(st, "vital", "Vital", pi, "Belum ada nilai vital.") +
      jeAdeganHtml(st, pi) + jePilihanHtml(st, pi) +
      '</div></details>';
  }

  function kasusHalamanHtml(st, open) {
    var pages = st.data.map(function (_, pi) { return kasusPageHtml(st, pi, open.indexOf(pi) !== -1); }).join("");
    return '<div class="je-section"><div class="je-subhead"><span class="lbl m-0">Halaman</span>' +
      '<button type="button" class="btn btn-sm" data-act="page-add">+ Tambah halaman</button></div>' +
      (pages || jeEmpty("Belum ada halaman.")) + '</div>';
  }

  function jeSwap(list, i, j) {
    var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
  }

  var JSON_EDITORS = {
    pertemuan_isi: {
      initial: function (raw) {
        var data = jeObj(jeParse(raw));
        ["tujuan", "konsep_inti", "korelasi_klinis", "rangkuman", "pertanyaan_penuntun"].forEach(function (k) {
          if (!Array.isArray(data[k])) data[k] = [];
        });
        data.konsep_inti = data.konsep_inti.map(function (c) {
          var concept = jeObj(c);
          if (Array.isArray(concept.tabel)) {
            concept.tabel = concept.tabel.map(function (t) {
              var table = jeObj(t);
              if (!Array.isArray(table.kolom)) table.kolom = [];
              if (!Array.isArray(table.baris)) table.baris = [];
              return table;
            });
          }
          return concept;
        });
        return { data: data };
      },
      mount: function (host, st) {
        function captureOpen() {
          var list = [];
          host.querySelectorAll("details[data-ci]").forEach(function (d) {
            if (d.open) list.push(Number(d.getAttribute("data-ci")));
          });
          return list;
        }
        function render(extraOpen, focusSel) {
          var open = captureOpen().concat(extraOpen || []);
          host.innerHTML = pertemuanIsiHtml(st, open);
          if (focusSel) {
            var f = host.querySelector(focusSel);
            if (f) f.focus();
          }
        }
        function tableAt(el) {
          var ci = Number(el.getAttribute("data-ci")), ti = Number(el.getAttribute("data-ti"));
          var c = st.data.konsep_inti[ci];
          return c && Array.isArray(c.tabel) ? c.tabel[ti] : null;
        }

        host.addEventListener("input", function (e) {
          var el = e.target;
          if (!el || !el.getAttribute) return;
          if (el.getAttribute("data-str") != null) {
            var list = jeList(st, el.getAttribute("data-str"), null);
            var i = Number(el.getAttribute("data-i"));
            if (i >= 0 && i < list.length) list[i] = el.value;
            return;
          }
          var cf = el.getAttribute("data-cfield");
          if (cf) {
            var c = st.data.konsep_inti[Number(el.getAttribute("data-ci"))];
            if (!c) return;
            c[cf] = el.value;
            if (cf === "judul") {
              var card = el.closest("details[data-ci]");
              var lab = card && card.querySelector("[data-concept-label]");
              if (lab) lab.textContent = el.value || "(tanpa judul)";
            }
            return;
          }
          var tf = el.getAttribute("data-tfield");
          if (tf) {
            var t = tableAt(el);
            if (t) t[tf] = el.value;
            return;
          }
          if (el.getAttribute("data-col") != null) {
            var tc = tableAt(el);
            if (tc) tc.kolom[Number(el.getAttribute("data-ki"))] = el.value;
            return;
          }
          if (el.getAttribute("data-cell") != null) {
            var td = tableAt(el);
            var row = td && jeArr(td.baris)[Number(el.getAttribute("data-ri"))];
            if (Array.isArray(row)) row[Number(el.getAttribute("data-ki"))] = el.value;
          }
        });

        host.addEventListener("click", function (e) {
          var btn = e.target.closest ? e.target.closest("button[data-act]") : null;
          if (!btn) return;
          if (btn.closest("summary")) e.preventDefault();
          var act = btn.getAttribute("data-act");
          if (act.indexOf("str-") === 0) {
            var target = btn.getAttribute("data-target");
            var list = jeList(st, target, null);
            var i = Number(btn.getAttribute("data-i"));
            var focus = -1;
            if (act === "str-add") { list.push(""); focus = list.length - 1; }
            else if (act === "str-up" && i > 0) { jeSwap(list, i, i - 1); focus = i - 1; }
            else if (act === "str-down" && i < list.length - 1) { jeSwap(list, i, i + 1); focus = i + 1; }
            else if (act === "str-del") list.splice(i, 1);
            render(null, focus >= 0 ? '[data-str="' + target + '"][data-i="' + focus + '"]' : null);
            return;
          }
          if (act === "concept-add") {
            st.data.konsep_inti.push({ judul: "", isi: "" });
            var ni = st.data.konsep_inti.length - 1;
            render([ni], '[data-ci="' + ni + '"] [data-cfield="judul"]');
            return;
          }
          var ci = Number(btn.getAttribute("data-ci"));
          if (act === "concept-up" && ci > 0) { jeSwap(st.data.konsep_inti, ci, ci - 1); render(); return; }
          if (act === "concept-down" && ci < st.data.konsep_inti.length - 1) { jeSwap(st.data.konsep_inti, ci, ci + 1); render(); return; }
          if (act === "concept-del") { st.data.konsep_inti.splice(ci, 1); render(); return; }
          var c = st.data.konsep_inti[ci];
          if (!c) return;
          if (act === "table-add") {
            if (!Array.isArray(c.tabel)) c.tabel = [];
            c.tabel.push({ judul: "", kolom: ["", ""], baris: [["", ""]] });
            render(null, '[data-ci="' + ci + '"] [data-ti="' + (c.tabel.length - 1) + '"] [data-tfield="judul"]');
            return;
          }
          var ti = Number(btn.getAttribute("data-ti"));
          var t = Array.isArray(c.tabel) ? c.tabel[ti] : null;
          if (!t) return;
          if (act === "table-del") { c.tabel.splice(ti, 1); render(); return; }
          if (!Array.isArray(t.kolom)) t.kolom = [];
          if (!Array.isArray(t.baris)) t.baris = [];
          if (act === "col-add") {
            t.kolom.push("");
            t.baris.forEach(function (r) { if (Array.isArray(r)) r.push(""); });
            render();
            return;
          }
          if (act === "col-del") {
            var ki = Number(btn.getAttribute("data-ki"));
            if (t.kolom.length <= 1) return;
            t.kolom.splice(ki, 1);
            t.baris.forEach(function (r) { if (Array.isArray(r) && ki < r.length) r.splice(ki, 1); });
            render();
            return;
          }
          if (act === "row-add") {
            if (!t.kolom.length) t.kolom.push("");
            t.baris.push(t.kolom.map(function () { return ""; }));
            render();
            return;
          }
          if (act === "row-del") { t.baris.splice(Number(btn.getAttribute("data-ri")), 1); render(); }
        });

        render();
      },
      read: function (st) { return st.data; }
    },

    soal_opsi: {
      initial: function (raw) {
        var data = jeObj(jeParse(raw));
        OPSI_KEYS.forEach(function (k) { if (data[k] == null) data[k] = ""; });
        return { data: data };
      },
      mount: function (host, st) {
        function render() { host.innerHTML = soalOpsiHtml(st); }
        host.addEventListener("input", function (e) {
          var el = e.target;
          if (!el || !el.getAttribute) return;
          var key = el.getAttribute("data-opsi");
          if (key != null) st.data[key] = el.value;
        });
        render();
      },
      read: function (st) { return st.data; }
    },

    kasus_halaman: {
      initial: function (raw) {
        var parsed = jeParse(raw);
        var pages = Array.isArray(parsed) ? parsed : [];
        pages = pages.map(function (p) {
          var page = jeObj(p);
          if (!Array.isArray(page.vital)) page.vital = [];
          if (!Array.isArray(page.adegan)) page.adegan = [];
          if (!Array.isArray(page.pilihan)) page.pilihan = [];
          page.adegan = page.adegan.map(function (a) { return jeObj(a); });
          page.pilihan = page.pilihan.map(function (q) { return jeObj(q); });
          return page;
        });
        return { data: pages };
      },
      mount: function (host, st) {
        function captureOpen() {
          var list = [];
          host.querySelectorAll("details[data-pi]").forEach(function (d) {
            if (d.open) list.push(Number(d.getAttribute("data-pi")));
          });
          return list;
        }
        function updateHeader(pi) {
          var card = host.querySelector('details.je-card[data-pi="' + pi + '"]');
          var page = st.data[pi];
          if (!card || !page) return;
          var h = card.querySelector("[data-pageheader]");
          var n = card.querySelector("[data-pagenomor]");
          if (h) h.textContent = jePageHead(page);
          if (n) n.textContent = " · " + jePageNo(page);
        }
        function refreshTargets() {
          host.querySelectorAll('select[data-qfield="tujuan"]').forEach(function (sel) {
            sel.innerHTML = jeTargetOptions(st, sel.value);
          });
        }
        function render(extraOpen, focusSel) {
          var open = captureOpen().concat(extraOpen || []);
          host.innerHTML = kasusHalamanHtml(st, open);
          if (focusSel) {
            var f = host.querySelector(focusSel);
            if (f) f.focus();
          }
        }

        host.addEventListener("input", function (e) {
          var el = e.target;
          if (!el || !el.getAttribute) return;
          var piAttr = el.getAttribute("data-pi");
          if (piAttr == null) return;
          var pi = Number(piAttr);
          var page = st.data[pi];
          if (!page) return;
          if (el.getAttribute("data-str") != null) {
            var list = jeList(st, "vital", pi);
            var i = Number(el.getAttribute("data-i"));
            if (i >= 0 && i < list.length) list[i] = el.value;
            return;
          }
          if (el.getAttribute("data-qalt") != null) {
            var q = page.pilihan[Number(el.getAttribute("data-qi"))];
            if (q) q.alt = el.checked;
            return;
          }
          var qf = el.getAttribute("data-qfield");
          if (qf) {
            var q2 = page.pilihan[Number(el.getAttribute("data-qi"))];
            if (q2) q2[qf] = el.value;
            return;
          }
          var af = el.getAttribute("data-afield");
          if (af) {
            var a = page.adegan[Number(el.getAttribute("data-ai"))];
            if (a) a[af] = el.value;
            return;
          }
          var pf = el.getAttribute("data-pfield");
          if (!pf) return;
          if (pf === "nomor") page.nomor = el.value === "" ? null : Number(el.value);
          else page[pf] = el.value;
          if (pf === "id" || pf === "judul") { refreshTargets(); updateHeader(pi); }
          else if (pf === "nomor") updateHeader(pi);
        });

        host.addEventListener("click", function (e) {
          var btn = e.target.closest ? e.target.closest("button[data-act]") : null;
          if (!btn) return;
          if (btn.closest("summary")) e.preventDefault();
          var act = btn.getAttribute("data-act");
          if (act === "page-add") {
            st.data.push(jeNewPage(jeNextNomor(st.data)));
            var np = st.data.length - 1;
            render([np], '[data-pi="' + np + '"] [data-pfield="id"]');
            return;
          }
          var pi = Number(btn.getAttribute("data-pi"));
          if (act === "page-up" && pi > 0) { jeSwap(st.data, pi, pi - 1); render(); return; }
          if (act === "page-down" && pi < st.data.length - 1) { jeSwap(st.data, pi, pi + 1); render(); return; }
          if (act === "page-del") { st.data.splice(pi, 1); render(); return; }
          var page = st.data[pi];
          if (!page) return;
          if (act.indexOf("str-") === 0) {
            var list = jeList(st, "vital", pi);
            var i = Number(btn.getAttribute("data-i"));
            var focus = -1;
            if (act === "str-add") { list.push(""); focus = list.length - 1; }
            else if (act === "str-up" && i > 0) { jeSwap(list, i, i - 1); focus = i - 1; }
            else if (act === "str-down" && i < list.length - 1) { jeSwap(list, i, i + 1); focus = i + 1; }
            else if (act === "str-del") list.splice(i, 1);
            render(null, focus >= 0 ? '[data-pi="' + pi + '"] [data-str][data-i="' + focus + '"]' : null);
            return;
          }
          if (act === "ade-add") {
            if (!Array.isArray(page.adegan)) page.adegan = [];
            page.adegan.push({ pembicara: "", teks: "" });
            render(null, '[data-pi="' + pi + '"] [data-afield="pembicara"][data-ai="' + (page.adegan.length - 1) + '"]');
            return;
          }
          var ai = Number(btn.getAttribute("data-ai"));
          if (act === "ade-up" && ai > 0) { jeSwap(page.adegan, ai, ai - 1); render(); return; }
          if (act === "ade-down" && ai < page.adegan.length - 1) { jeSwap(page.adegan, ai, ai + 1); render(); return; }
          if (act === "ade-del") { page.adegan.splice(ai, 1); render(); return; }
          if (act === "pil-add") {
            if (!Array.isArray(page.pilihan)) page.pilihan = [];
            page.pilihan.push({ teks: "", tujuan: "", alt: false });
            render(null, '[data-pi="' + pi + '"] [data-qfield="teks"][data-qi="' + (page.pilihan.length - 1) + '"]');
            return;
          }
          var qi = Number(btn.getAttribute("data-qi"));
          if (act === "pil-up" && qi > 0) { jeSwap(page.pilihan, qi, qi - 1); render(); return; }
          if (act === "pil-down" && qi < page.pilihan.length - 1) { jeSwap(page.pilihan, qi, qi + 1); render(); return; }
          if (act === "pil-del") { page.pilihan.splice(qi, 1); render(); }
        });

        render();
      },
      read: function (st) {
        var seen = Object.create(null);
        st.data.forEach(function (p, i) {
          var id = p.id == null ? "" : String(p.id);
          if (id.trim() === "") throw new Error("Halaman ke-" + (i + 1) + ": id wajib diisi.");
          if (seen[id]) throw new Error('Halaman kasus: id "' + id + '" dipakai lebih dari satu kali.');
          seen[id] = true;
        });
        st.data.forEach(function (p) {
          var id = p.id == null ? "" : String(p.id);
          jeArr(p.pilihan).forEach(function (q, qi) {
            var target = q.tujuan == null ? "" : String(q.tujuan);
            if (target.trim() === "") throw new Error('Halaman "' + id + '", pilihan #' + (qi + 1) + ': tujuan wajib dipilih.');
            if (!seen[target]) throw new Error('Halaman "' + id + '", pilihan #' + (qi + 1) + ': tujuan "' + target + '" tidak ada di daftar halaman.');
          });
        });
        return st.data;
      }
    }
  };

  function fieldHtml(key, spec, record, assets) {
    var t = spec[1], label = spec[2], req = !!spec[3], opts = spec[4];
    var v = record ? record[key] : "";
    var star = req ? ' <span class="text-danger">*</span>' : "";
    // id_lokal selalu otomatis: tampil agar dosen tahu, tapi tidak bisa diubah.
    if (key === "id_lokal") {
      return '<label class="field"><span class="lbl">' + esc(label) + star +
        ' <span class="tiny muted">(otomatis)</span></span>' +
        '<input type="' + (t === "N" ? "number" : "text") + '" class="input" data-field="' + esc(key) +
        '" value="' + esc(record ? v : "") + '" readonly aria-readonly="true"></label>';
    }
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
      var kind = spec[5];
      if (kind && JSON_EDITORS[kind]) {
        return '<div class="field" data-json-editor="' + esc(key) + '"><span class="lbl">' + esc(label) + star + '</span></div>';
      }
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
    if (typeof item === "string") return { filename: item };
    return item && item.filename ? item : { filename: "(berkas)" };
  }

  function mountJsonEditors(panel, fields, record) {
    panel.__jsonEditors = {};
    fields.forEach(function (f) {
      var ed = f[1] === "J" && f[5] ? JSON_EDITORS[f[5]] : null;
      if (!ed) return;
      var host = panel.querySelector('[data-json-editor="' + f[0] + '"]');
      if (!host) return;
      var st = ed.initial(record ? record[f[0]] : null);
      ed.mount(host, st);
      panel.__jsonEditors[f[0]] = { ed: ed, state: st };
    });
  }

  var formDialog = null;

  // Tambah/Edit tampil sebagai pop up ber-backdrop blur: halaman tidak lagi
  // menggulir ke form di bawah tabel, dan scroll halaman dikunci dialog.
  function openForm(app, record) {
    var collection = selected;
    var fields = SCHEMA[collection];
    var rel = fields.some(function (f) { return f[1] === "R"; });
    var idSpec = fields.find(function (f) { return f[0] === "id_lokal"; });
    var closed = false;
    if (formDialog) formDialog.close();
    var dialog = App.modal({
      id: "adminFormModal",
      title: (record ? "Edit " : "Tambah ") + LABELS[collection],
      subtitle: "Perubahan tersimpan langsung di PocketBase.",
      kind: record ? "info" : "success",
      size: "lg",
      body: '<p class="small muted m-0">Memuat…</p>',
      footer: '<button type="button" class="btn" id="formCancel" data-dialog-close>Batal</button>' +
        '<button type="submit" form="entForm" class="btn btn-primary" id="formSave" disabled>Simpan</button>',
      onClose: function () { closed = true; if (formDialog === dialog) formDialog = null; }
    });
    formDialog = dialog;
    var panel = dialog.el;
    panel.__jsonEditors = {};
    var make = function (assets, autoId) {
      // Dialog bisa ditutup atau tab berganti selama fetch.
      if (closed || selected !== collection) return;
      var body = fields.map(function (f) { return fieldHtml(f[0], f, record, assets); }).join("");
      var note = NOTES[collection] ? '<p class="small muted" data-note="' + esc(collection) + '">' + esc(NOTES[collection]) + '</p>' : "";
      panel.querySelector(".modal-body").innerHTML =
        '<form id="entForm" novalidate data-ent="' + esc(collection) + '">' + note + body + '</form>';
      if (idSpec) {
        var idEl = panel.querySelector('[data-field="id_lokal"]');
        if (idEl) idEl.value = record ? (record.id_lokal == null ? "" : record.id_lokal) : autoId;
      }
      mountJsonEditors(panel, fields, record);
      var saveBtn = panel.querySelector("#formSave");
      if (saveBtn) saveBtn.disabled = false;
      panel.querySelector("#entForm").addEventListener("submit", function (e) {
        e.preventDefault();
        saveForm(app, panel, dialog, record);
      });
    };
    Promise.all([
      rel ? relationOptions() : Promise.resolve([]),
      !record && idSpec ? nextLocalId(collection, idSpec[1]) : Promise.resolve(null)
    ]).then(function (r) { make(r[0], r[1]); })
      .catch(function (e) { fail(e); if (!closed) dialog.close(); });
  }

  function collect(panel, schema, record) {
    var json = {}, fd = new FormData(), hasFile = false;
    var bad = null;
    var editors = panel.__jsonEditors || {};
    Object.keys(editors).forEach(function (key) {
      try {
        var value = editors[key].ed.read(editors[key].state);
        if (value !== undefined) json[key] = value;
      } catch (err) { bad = bad || err.message; }
    });
    panel.querySelectorAll("[data-field]").forEach(function (el) {
      var key = el.dataset.field, spec = schema.find(function (f) { return f[0] === key; }), t = spec[1];
      if (spec[5]) return; // editor terstruktur dibaca di atas
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

  function saveForm(app, panel, dialog, record) {
    if (busy) return;
    var btn = panel.querySelector("#formSave");
    var body;
    try { body = collect(panel, SCHEMA[selected], record); }
    catch (err) { App.toast(err.message); return; }
    busy = true;
    if (btn) btn.disabled = true;
    var url = "/api/collections/" + selected + "/records" + (record ? "/" + encodeURIComponent(record.id) : "");
    PB.request(url, { method: record ? "PATCH" : "POST", body: body }).then(function () {
      App.toast("Tersimpan.");
      dialog.close();
      panel.__jsonEditors = {};
      return PB.reload();
    }).then(function () { loadRecords(app); })
      .catch(fail)
      .then(function () { busy = false; if (btn) btn.disabled = false; });
  }

  function deleteRecord(app, id) {
    var r = records.find(function (x) { return x.id === id; });
    var label = LABELS[selected];
    return App.confirm("Hapus " + label + " \"" + (r ? title(r) : id) + "\"?", {
      title: "Hapus " + label,
      confirmText: "Hapus",
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      return PB.request("/api/collections/" + selected + "/records/" + encodeURIComponent(id), { method: "DELETE" })
        .then(function () {
          App.toast("Dihapus.");
          return PB.reload();
        })
        .then(function () { loadRecords(app); })
        .catch(fail);
    });
  }

  App.add("admin", render);
  if (App.onLeave) App.onLeave(function () { if (formDialog) formDialog.close(); });
})();
