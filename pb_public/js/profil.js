/* js/profil.js — Profil: statistik, lencana, dan pengaturan. */
(function () {
  "use strict";

  function lencana(p) {
    var l = [];
    var done = p.materi_selesai.length;
    var total = window.DATA_PERTEMUAN.length;
    if (done >= 1) l.push(["Pembuka Jalan", "Menyelesaikan 1 pertemuan"]);
    if (done >= total / 2) l.push(["Setengah Jalan", "8 pertemuan selesai"]);
    if (done === total) l.push(["Fisiolog Ulang", "Seluruh 16 pertemuan selesai"]);
    var kuisLulus = Object.keys(p.skor_kuis).filter(function (k) { return p.skor_kuis[k].persen >= window.CONFIG.ambangLulus * 100; }).length;
    if (kuisLulus >= 1) l.push(["Lulus Pertama", "Lulus kuis pertemuan pertama"]);
    if (kuisLulus >= 5) l.push(["Rajin Menguji", "Lulus 5 kuis"]);
    var tigaBintang = Object.keys(p.kasus_selesai).filter(function (k) { return p.kasus_selesai[k] === 3; }).length;
    if (tigaBintang >= 1) l.push(["Klinis Teliti", "Kasus dengan 3 bintang"]);
    if (tigaBintang >= window.DATA_KASUS.length) l.push(["Mahasiswa Andalan", "Semua kasus 3 bintang"]);
    if ((p.marker_dipindai || []).length >= window.DATA_MARKER.length) l.push(["Penjelajah AR", "Semua marker dipindai"]);
    return l;
  }

  function render(app) {
    var p = Storage.load();
    var u = (window.Auth && Auth.currentUser()) || null;
    var roleLabel = !u ? "" : u.role === "dosen" ? "Dosen" : u.role === "admin" ? "Admin" : "Mahasiswa";
    var idLabel = roleLabel ? "Nama " + roleLabel.toLowerCase() + " (opsional)" : "Nama (opsional)";
    var idPlaceholder = roleLabel === "Dosen" ? "Tulis nama dosen" : roleLabel === "Admin" ? "Tulis nama admin" : "Tulis namamu";
    var done = p.materi_selesai.length;
    var total = window.DATA_PERTEMUAN.length;
    var kuisDiambil = Object.keys(p.skor_kuis).length;
    var rataRata = kuisDiambil ? Math.round(Object.keys(p.skor_kuis).reduce(function (a, k) { return a + p.skor_kuis[k].persen; }, 0) / kuisDiambil) : 0;
    var kasus = Object.keys(p.kasus_selesai).length;

    function statCard(v, label) {
      return '<div class="stat"><span class="k">' + v + '</span><span class="v">' + label + '</span></div>';
    }

    var html = '<div class="mb-6"><div class="eyebrow mb-2"><span>Profil</span></div><h1 class="mb-3">Profil & Pengaturan</h1><p class="lead">Semua data tersimpan di perangkat ini (localStorage). Tidak ada yang dikirim ke server.</p></div>';

    // data akun yang sedang login
    if (u) {
      html += '<div class="surface-card p-5"><h3 class="mb-3">Data Pengguna</h3><dl class="grid grid-cols-1 gap-3 sm:grid-cols-3">' +
        '<div><dt class="small dim">Nama</dt><dd class="m-0 font-semibold">' + App.escapeHtml(u.nama || u.email || "-") + '</dd></div>' +
        '<div><dt class="small dim">Email</dt><dd class="m-0 font-semibold break-words">' + App.escapeHtml(u.email || "-") + '</dd></div>' +
        '<div><dt class="small dim">Peran</dt><dd class="m-0 font-semibold">' + App.escapeHtml(roleLabel) + '</dd></div>' +
        '<div><dt class="small dim">ID Akun</dt><dd class="m-0 font-semibold mono break-all">' + App.escapeHtml(u.id || "-") + '</dd></div>' +
        '<div><dt class="small dim">Dibuat</dt><dd class="m-0 font-semibold">' + (u.created ? App.escapeHtml(new Date(u.created).toLocaleString("id-ID")) : "-") + '</dd></div>' +
        '<div><dt class="small dim">Diperbarui</dt><dd class="m-0 font-semibold">' + (u.updated ? App.escapeHtml(new Date(u.updated).toLocaleString("id-ID")) : "-") + '</dd></div>' +
        '</dl></div>';
    }

    // nama pemain
    html += '<div class="surface-card p-5"><h3 class="mb-3">Identitas</h3><label class="field"><span class="lbl">' + App.escapeHtml(idLabel) + '</span><input type="text" id="namaPemain" class="input" value="' + App.escapeHtml(p.nama_pemain || "") + '" placeholder="' + App.escapeHtml(idPlaceholder) + '"></label></div>';

    // statistik
    html += '<div class="surface-card mt-4 p-5"><h3 class="mb-3">Statistik</h3><div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">' +
      statCard(done + "/" + total, "Materi selesai") +
      statCard(kuisDiambil, "Kuis diambil") +
      statCard(rataRata + "%", "Rata-rata skor") +
      statCard(kasus + "/" + window.DATA_KASUS.length, "Kasus selesai") +
      '</div>' +
      '<div class="mt-4"><div class="small dim mb-1">Progres keseluruhan</div><div class="bar lg"><i style="width:' + App.totalProgress() + '%"></i></div></div></div>';

    // lencana
    html += '<div class="surface-card mt-4 p-5"><h3 class="mb-3">Lencana</h3><div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">';
    var owned = lencana(p);
    var allBadges = [["Pembuka Jalan", "Menyelesaikan 1 pertemuan"], ["Setengah Jalan", "8 pertemuan selesai"], ["Fisiolog Ulang", "16 pertemuan selesai"], ["Lulus Pertama", "Kuis pertama lulus"], ["Rajin Menguji", "Lulus 5 kuis"], ["Klinis Teliti", "Kasus 3 bintang"], ["Mahasiswa Andalan", "Semua kasus 3 bintang"], ["Penjelajah AR", "Semua marker dipindai"]];
    allBadges.forEach(function (b) {
      var has = owned.some(function (o) { return o[0] === b[0]; });
      html += '<div class="surface-card p-4' + (has ? '' : ' opacity-40') + '"><strong class="' + (has ? 'text-brand' : 'text-ink-3') + '">' + (has ? "★" : "☆") + " " + b[0] + '</strong><p class="tiny muted m-0">' + b[1] + '</p></div>';
    });
    html += '</div></div>';

    // pengaturan
    var s = p.pengaturan || {};
    html += '<div class="surface-card mt-4 p-5"><h3 class="mb-3">Pengaturan Tampilan</h3>' +
      '<label class="field"><span class="lbl">Ukuran font: <strong id="fontVal">' + (s.ukuranFont || 100) + '%</strong></span><input type="range" id="fontRange" min="80" max="140" step="5" value="' + (s.ukuranFont || 100) + '" aria-label="Ukuran font"></label>' +
      '<label class="field"><span class="lbl">Mode warna</span><select id="themeSel" class="input"><option value="terang"' + (s.mode !== "gelap" ? " selected" : "") + '>Terang</option><option value="gelap"' + (s.mode === "gelap" ? " selected" : "") + '>Gelap</option></select></label>' +
      '<label class="flex items-center gap-3"><input type="checkbox" id="soundCk"' + (s.suara !== false ? " checked" : "") + ' style="accent-color:var(--brand)"><span>Efek suara (jika tersedia)</span></label>' +
      '</div>';

    app.innerHTML = html;

    // bindings
    document.getElementById("namaPemain").addEventListener("change", function () {
      Storage.update(function (pp) { pp.nama_pemain = this.value; }.bind(this));
      App.toast("Nama disimpan.");
    });
    var fr = document.getElementById("fontRange");
    fr.addEventListener("input", function () { document.getElementById("fontVal").textContent = this.value + "%"; App.setFont(Number(this.value)); });
    document.getElementById("themeSel").addEventListener("change", function () { App.setTheme(this.value); });
    document.getElementById("soundCk").addEventListener("change", function () {
      Storage.update(function (pp) { pp.pengaturan.suara = this.checked; }.bind(this));
    });

  }

  App.add("profil", render);
})();
