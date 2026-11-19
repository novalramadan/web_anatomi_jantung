/* js/profil.js — Profil: statistik, lencana, pengaturan (font, tema, suara), impor/ekspor, reset. */
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
    var done = p.materi_selesai.length;
    var total = window.DATA_PERTEMUAN.length;
    var kuisDiambil = Object.keys(p.skor_kuis).length;
    var rataRata = kuisDiambil ? Math.round(Object.keys(p.skor_kuis).reduce(function (a, k) { return a + p.skor_kuis[k].persen; }, 0) / kuisDiambil) : 0;
    var kasus = Object.keys(p.kasus_selesai).length;
    var remedial = (p.soal_salah || []).length;
    var esaiTerjawab = Object.keys(p.esai_jawaban || {}).filter(function (k) { return (p.esai_jawaban[k] || "").trim().length; }).length;

    function statCard(v, label) {
      return '<div class="stat"><span class="k">' + v + '</span><span class="v">' + label + '</span></div>';
    }

    var html = '<div class="mb-6"><div class="eyebrow mb-2"><span>Profil</span></div><h1 class="mb-3">Profil & Pengaturan</h1><p class="lead">Semua data tersimpan di perangkat ini (localStorage). Tidak ada yang dikirim ke server.</p></div>';

    // nama pemain
    html += '<div class="surface-card p-5"><h3 class="mb-3">Identitas</h3><label class="field"><span class="lbl">Nama mahasiswa (opsional)</span><input type="text" id="namaPemain" class="input" value="' + App.escapeHtml(p.nama_pemain || "") + '" placeholder="Tulis namamu"></label></div>';

    // statistik
    html += '<div class="surface-card mt-4 p-5"><h3 class="mb-3">Statistik</h3><div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">' +
      statCard(done + "/" + total, "Materi selesai") +
      statCard(kuisDiambil, "Kuis diambil") +
      statCard(rataRata + "%", "Rata-rata skor") +
      statCard(kasus + "/" + window.DATA_KASUS.length, "Kasus selesai") +
      statCard(remedial, "Soal remedial") +
      statCard(esaiTerjawab + "/" + window.DATA_ESAI.length, "Esai terjawab") +
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

    // ekspor / impor
    html += '<div class="surface-card mt-4 p-5"><h3 class="mb-2">Ekspor & Impor Materi/Soal Tambahan</h3>' +
      '<p class="small muted">Ekspor progres kamu ke berkas. Impor JSON tambahan dari dosen untuk menambah materi atau soal (tidak menimpa data bawaan).</p>' +
      '<div class="mt-3 flex flex-wrap gap-3"><button class="btn" id="expProgres" type="button">Ekspor Progres (JSON)</button>' +
      '<button class="btn" id="expData" type="button">Ekspor Soal+Materi Saat Ini</button></div>' +
      '<label class="field mt-4"><span class="lbl">Impor berkas JSON (progres, materi, atau soal tambahan)</span><input type="file" id="impFile" class="input" accept="application/json,.json" aria-label="Pilih berkas JSON"></label>' +
      '<div id="impMsg" class="small" aria-live="polite"></div></div>';

    // reset
    html += '<div class="surface-card mt-4 p-5"><h3 class="mb-2 text-danger">Reset Data</h3><p class="small muted">Menghapus seluruh progres, kuis, kasus, dan refleksi dari perangkat ini. Tindakan ini tidak dapat dibatalkan.</p>' +
      '<button class="btn btn-danger" id="resetBtn" type="button">Hapus Semua Data</button></div>';

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

    document.getElementById("expProgres").addEventListener("click", function () {
      downloadJSON(Storage.load(), "cardioverse_progres.json");
    });
    document.getElementById("expData").addEventListener("click", function () {
      downloadJSON({ soal: window.DATA_SOAL, esai: window.DATA_ESAI, pertemuan: window.DATA_PERTEMUAN.map(function (m) { return { id: m.id, judul: m.judul, blok: m.blok }; }) }, "cardioverse_data.json");
    });
    document.getElementById("impFile").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return;
      var msg = document.getElementById("impMsg");
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var obj = JSON.parse(reader.result);
          var added = importJSON(obj);
          msg.innerHTML = '<span class="badge badge-success">Impor sukses: ' + added + ' item.</span>';
          App.toast("Impor berhasil (" + added + " item).");
        } catch (err) {
          msg.innerHTML = '<span class="badge badge-danger">Gagal: ' + App.escapeHtml(err.message) + '</span>';
          App.toast("Impor gagal — format JSON tidak valid.");
        }
      };
      reader.readAsText(f);
    });

    document.getElementById("resetBtn").addEventListener("click", function () {
      if (!confirm("Hapus seluruh data CardioVerse di perangkat ini? Tindakan ini tidak dapat dibatalkan.")) return;
      if (!confirm("Yakin? Semua progres, kuis, kasus, esai, dan refleksi akan hilang.")) return;
      Storage.reset();
      App.toast("Semua data dihapus.");
      App.render();
    });
  }

  function downloadJSON(obj, filename) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    App.toast("Berkas " + filename + " diunduh.");
  }

  function importJSON(obj) {
    var count = 0;
    // progres
    if (obj.materi_selesai && Array.isArray(obj.materi_selesai)) {
      Storage.update(function (p) {
        obj.materi_selesai.forEach(function (id) { if (p.materi_selesai.indexOf(id) === -1) p.materi_selesai.push(id); });
      });
      count += obj.materi_selesai.length;
    }
    if (obj.skor_kuis && typeof obj.skor_kuis === "object") {
      Storage.update(function (p) {
        Object.keys(obj.skor_kuis).forEach(function (k) {
          var v = obj.skor_kuis[k];
          if (!v || typeof v.persen !== "number") return;
          if (!p.skor_kuis[k] || v.persen > p.skor_kuis[k].persen) p.skor_kuis[k] = v;
        });
      });
      count += Object.keys(obj.skor_kuis).length;
    }
    // soal tambahan
    if (obj.soal && Array.isArray(obj.soal)) {
      var extra = window.DATA_SOAL || [];
      obj.soal.forEach(function (s) {
        if (!extra.find(function (x) { return x.id === s.id; })) extra.push(s);
      });
      window.DATA_SOAL = extra;
      Storage.update(function (p) { p.impSoal = p.impSoal || []; p.impSoal = p.impSoal.concat(obj.soal.map(function (x) { return x.id; })); });
      count += obj.soal.length;
    }
    // materi tambahan
    if (obj.pertemuan_tambahan && Array.isArray(obj.pertemuan_tambahan)) {
      window._pertemuanTambahan = (window._pertemuanTambahan || []).concat(obj.pertemuan_tambahan);
      count += obj.pertemuan_tambahan.length;
    }
    if (count === 0) throw new Error("Berkas tidak berisi progres/soal/materi yang dikenal.");
    return count;
  }

  App.add("profil", render);
})();
