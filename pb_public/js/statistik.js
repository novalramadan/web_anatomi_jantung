/* js/statistik.js — Dasbor dosen: statistik belajar seluruh mahasiswa. */
(function () {
  "use strict";

  var state = { rows: [], query: "" };

  function esc(s) { return App.escapeHtml(s == null ? "" : String(s)); }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  function studentRows(users, progressRecords) {
    var byUser = {};
    progressRecords.forEach(function (r) {
      if (r && r.user) byUser[r.user] = r;
    });
    var totalMateri = (window.DATA_PERTEMUAN || []).length;
    var rows = users.map(function (u) {
      var rec = byUser[u.id];
      var p = (rec && rec.payload) || {};
      var materi = Array.isArray(p.materi_selesai) ? p.materi_selesai.length : 0;
      var skor = p.skor_kuis && typeof p.skor_kuis === "object" ? Object.keys(p.skor_kuis) : [];
      var totalSkor = 0;
      skor.forEach(function (k) {
        var v = p.skor_kuis[k];
        totalSkor += v && isFinite(Number(v.persen)) ? Number(v.persen) : 0;
      });
      var kasus = p.kasus_selesai && typeof p.kasus_selesai === "object" ? Object.keys(p.kasus_selesai).length : 0;
      var marker = Array.isArray(p.marker_dipindai) ? p.marker_dipindai.length : 0;
      return {
        nama: u.nama || u.email || "(tanpa nama)",
        email: u.email || "",
        materi: materi,
        kuis: skor.length,
        rataRata: skor.length ? Math.round(totalSkor / skor.length) : null,
        kasus: kasus,
        marker: marker,
        progress: pct(materi, totalMateri),
        aktif: materi + skor.length + kasus + marker > 0
      };
    });
    rows.sort(function (a, b) {
      return b.progress - a.progress || String(a.nama).localeCompare(String(b.nama), "id");
    });
    return rows;
  }

  // Ambil semua halaman; kelas besar tetap utuh (perPage maksimum = 500).
  function fetchAll(collection, filter) {
    var items = [];
    function page(n) {
      var qs = "?perPage=500&page=" + n + (filter ? "&filter=" + encodeURIComponent(filter) : "");
      return PB.request("/api/collections/" + encodeURIComponent(collection) + "/records" + qs).then(function (res) {
        items = items.concat(res.items || []);
        if (res.totalPages && n < res.totalPages) return page(n + 1);
        return items;
      });
    }
    return page(1);
  }

  function aggregate(rows) {
    var materiTotal = (window.DATA_PERTEMUAN || []).length;
    var aktif = rows.filter(function (r) { return r.aktif; }).length;
    var materi = rows.length ? rows.reduce(function (a, r) { return a + r.materi; }, 0) / rows.length : 0;
    var scored = rows.filter(function (r) { return r.rataRata != null; });
    var skor = scored.length ? Math.round(scored.reduce(function (a, r) { return a + r.rataRata; }, 0) / scored.length) : null;
    return { total: rows.length, aktif: aktif, materi: Math.round(materi), materiTotal: materiTotal, skor: skor };
  }

  function statCard(value, label) {
    return '<div class="stat"><span class="k">' + value + '</span><span class="v">' + label + '</span></div>';
  }

  function match(row, q) {
    if (!q) return true;
    return (row.nama + " " + row.email).toLowerCase().indexOf(q) !== -1;
  }

  function tableRows(rows, query) {
    var shown = rows.filter(function (r) { return match(r, query); });
    if (!shown.length) {
      return '<tr><td colspan="6" class="text-center text-ink-3">' +
        (rows.length ? "Tidak ada mahasiswa yang cocok dengan pencarian." : "Belum ada akun mahasiswa.") + '</td></tr>';
    }
    return shown.map(function (r) {
      var status = r.aktif ? "" : '<span class="badge">Belum mulai</span>';
      return '<tr>' +
        '<td><strong>' + esc(r.nama) + '</strong> ' + status +
          '<div class="tiny muted break-words">' + esc(r.email) + '</div></td>' +
        '<td class="mono">' + r.materi + " / " + (window.DATA_PERTEMUAN || []).length + '</td>' +
        '<td class="mono">' + r.kuis + '</td>' +
        '<td class="mono">' + (r.rataRata == null ? "—" : r.rataRata + "%") + '</td>' +
        '<td class="mono">' + r.kasus + " / " + (window.DATA_KASUS || []).length + '</td>' +
        '<td><div class="flex items-center gap-2"><div class="bar flex-1"><i style="width:' + r.progress + '%"></i></div>' +
          '<span class="tiny mono">' + r.progress + '%</span></div></td>' +
        '</tr>';
    }).join("");
  }

  function drawTable(app) {
    var tbody = app.querySelector("#statRows");
    if (tbody) tbody.innerHTML = tableRows(state.rows, state.query);
    var count = app.querySelector("#statCount");
    if (count) count.textContent = String(state.rows.filter(function (r) { return match(r, state.query); }).length);
  }

  function draw(app) {
    var root = app.querySelector("#statRoot");
    if (!root) return;
    var a = aggregate(state.rows);
    root.innerHTML = '<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">' +
        statCard(a.total, "Mahasiswa") +
        statCard(a.aktif + " / " + a.total, "Aktif belajar") +
        statCard(a.materi + " / " + a.materiTotal, "Rata-rata materi") +
        statCard(a.skor == null ? "—" : a.skor + "%", "Rata-rata skor kuis") +
        '</div>' +
      '<div class="surface-card mt-4 p-5"><div class="flex flex-wrap items-end justify-between gap-3 mb-3">' +
        '<div><h3 class="m-0">Daftar Mahasiswa <span class="tiny muted">(<span id="statCount">' + state.rows.length + '</span>)</span></h3>' +
        '<p class="tiny muted m-0">Tanda — berarti mahasiswa belum mengerjakan kuis.</p></div>' +
        '<label class="field mb-0 w-full sm:w-64"><span class="lbl">Cari mahasiswa</span>' +
        '<input type="search" id="statSearch" class="input" placeholder="Nama atau email" value="' + esc(state.query) + '"></label>' +
        '</div>' +
        '<div class="table-wrap"><table><thead><tr><th>Mahasiswa</th><th>Materi</th><th>Kuis</th><th>Rata-rata</th><th>Kasus</th><th>Progres</th></tr></thead>' +
        '<tbody id="statRows">' + tableRows(state.rows, state.query) + '</tbody></table></div></div>';

    var search = root.querySelector("#statSearch");
    if (search) search.addEventListener("input", function () {
      state.query = this.value.trim().toLowerCase();
      drawTable(app);
    });
  }

  function load(app) {
    var root = app.querySelector("#statRoot");
    var btn = app.querySelector("#statRefresh");
    if (root) root.innerHTML = '<div class="surface-card p-5">Memuat data mahasiswa…</div>';
    if (btn) btn.disabled = true;
    Promise.all([
      fetchAll("users", "role='mahasiswa'"),
      fetchAll("progres", "")
    ]).then(function (all) {
      state.rows = studentRows(all[0], all[1]);
      draw(app);
    }).catch(function (err) {
      if (root) {
        root.innerHTML = '<div class="surface-card p-5"><h3 class="mt-0">Data mahasiswa tidak dapat dimuat</h3>' +
          '<p class="text-ink-2">' + esc(err && err.message ? err.message : "Permintaan gagal.") + '</p>' +
          '<p class="small muted mb-0">Jika server baru diperbarui, jalankan ulang PocketBase agar migrasi aturan akses dosen aktif.</p></div>';
      }
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  }

  function render(app) {
    if (!Auth.requireRole("dosen")) return;
    app.innerHTML = '<div class="mb-6"><div class="flex flex-wrap items-end justify-between gap-3">' +
        '<div><div class="eyebrow mb-2"><span>Statistik</span></div>' +
        '<h1 class="mb-3">Statistik Mahasiswa</h1>' +
        '<p class="lead">Progres belajar seluruh mahasiswa: materi, kuis, kasus, dan capaian tiap akun.</p></div>' +
        '<button type="button" class="btn" id="statRefresh">Muat ulang</button></div></div>' +
      '<div id="statRoot"></div>';
    app.querySelector("#statRefresh").addEventListener("click", function () { load(app); });
    load(app);
  }

  App.add("statistik", render);
})();
