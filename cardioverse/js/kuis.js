/* js/kuis.js — kuis pilihan ganda (latihan/ujian), esai penalaran, daftar remedial. */
(function () {
  "use strict";

  var state = null; // sesi kuis aktif

  function soalForPertemuan(id) {
    if (id === 8) return App.shuffle(window.DATA_SOAL.filter(function (s) { return s.pertemuan >= 1 && s.pertemuan <= 7; })).slice(0, 10);
    if (id === 16) return App.shuffle(window.DATA_SOAL.filter(function (s) { return s.pertemuan >= 1 && s.pertemuan <= 15; })).slice(0, 10);
    return window.DATA_SOAL.filter(function (s) { return s.pertemuan === id; });
  }

  function normalizeSoal(s) {
    var letters = ["A", "B", "C", "D", "E"];
    var entries = letters.map(function (L) { return { teks: s.opsi[L], benar: L === s.kunci }; });
    entries = App.shuffle(entries);
    var opsiBaru = {};
    var kunciBaru = null;
    entries.forEach(function (e, i) {
      opsiBaru[letters[i]] = e.teks;
      if (e.benar) kunciBaru = letters[i];
    });
    return { id: s.id, pertemuan: s.pertemuan, level: s.level, pertanyaan: s.pertanyaan, opsi: opsiBaru, kunci: kunciBaru, pembahasan: s.pembahasan };
  }

  // ---------- pilih mode ----------
  function renderPick(app) {
    var p = Storage.load();
    var html = '<div class="section-head"><div class="eyebrow">Kuis</div><h1>Pilih Mode Kuis</h1><p class="lead">Latihan (pembahasan langsung) atau Ujian (timer ' + window.CONFIG.timerUjianDetik + ' detik per soal, pembahasan di akhir).</p></div>';
    html += '<div class="grid grid-2">';

    // kuis pertemuan
    html += '<div class="card"><div class="card-head"><h2>Kuis per Pertemuan</h2></div><div class="grid" style="grid-template-columns:1fr">';
    window.DATA_PERTEMUAN.forEach(function (m) {
      var n = soalForPertemuan(m.id).length;
      var isInt = m.label_integrasi;
      var best = p.skor_kuis[m.id];
      var badge = best ? '<span class="badge ' + (best.persen >= window.CONFIG.ambangLulus * 100 ? 'badge-teal' : 'badge-amber') + '">Terbaik ' + best.persen + '%</span>' : '';
      html += '<a class="btn btn-block" style="justify-content:space-between" href="#/kuis/p/' + m.id + '"><span>' + (isInt ? '<span class="badge badge-amber">Integrasi</span> ' : '') + 'P' + m.id + ' · ' + App.escapeHtml(m.judul) + '</span><span class="small dim">' + (isInt ? '10 soal acak' : n + ' soal') + ' ' + badge + '</span></a>';
    });
    html += '</div></div>';

    // kuis campuran + remedial + esai
    html += '<div class="grid" style="grid-template-columns:1fr">';
    html += '<div class="card"><div class="card-head"><h3>Kuis Campuran</h3></div>' +
      '<label class="field"><span class="lbl">Pertemuan</span><select id="mixP"><option value="0">Semua</option>' + window.DATA_PERTEMUAN.filter(function (m) { return !m.label_integrasi; }).map(function (m) { return '<option value="' + m.id + '">P' + m.id + ' · ' + App.escapeHtml(m.judul) + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span class="lbl">Jumlah soal</span><select id="mixN"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label>' +
      '<label class="field"><span class="lbl">Level</span><select id="mixL"><option value="">Semua</option><option value="C2">C2</option><option value="C3">C3</option><option value="C4">C4</option></select></label>' +
      '<button class="btn btn-primary btn-block" id="mixStart" type="button">Mulai Kuis Campuran</button></div>';
    var salah = p.soal_salah || [];
    html += '<div class="card"><div class="card-head"><h3>Daftar Remedial</h3><span class="badge">' + salah.length + ' soal</span></div>' +
      (salah.length ? '<p class="small muted">Soal yang pernah salah, siap dilatih ulang.</p><button class="btn btn-teal btn-block" id="remedialStart" type="button">Latih ' + salah.length + ' Soal Salah</button>' : '<p class="small muted">Belum ada soal salah. Kerjakan kuis dulu.</p>') + '</div>';
    html += '<div class="card"><div class="card-head"><h3>Esai Penalaran</h3><span class="badge">' + window.DATA_ESAI.length + ' soal</span></div><p class="small muted">Tulis jawaban, bandingkan dengan jawaban model, lalu nilai dirimu dengan checklist.</p><a class="btn btn-block" href="#/kuis/esai">Buka Esai</a></div>';
    html += '</div></div>';

    app.innerHTML = html;

    var mixBtn = document.getElementById("mixStart");
    if (mixBtn) mixBtn.addEventListener("click", function () {
      var pid = Number(document.getElementById("mixP").value);
      var n = Number(document.getElementById("mixN").value);
      var lv = document.getElementById("mixL").value;
      var pool = window.DATA_SOAL.filter(function (s) {
        return (pid === 0 || s.pertemuan === pid) && (!lv || s.level === lv);
      });
      if (!pool.length) { App.toast("Tidak ada soal untuk kombinasi itu."); return; }
      startSession(app, App.shuffle(pool).slice(0, n), { mode: "latihan", judul: "Kuis Campuran" });
    });

    var remBtn = document.getElementById("remedialStart");
    if (remBtn) remBtn.addEventListener("click", function () {
      var ids = (Storage.load().soal_salah || []);
      var pool = window.DATA_SOAL.filter(function (s) { return ids.indexOf(s.id) !== -1; });
      if (pool.length) startSession(app, App.shuffle(pool), { mode: "latihan", judul: "Remedial" });
    });
  }

  // ---------- sesi soal ----------
  function startSession(app, soalList, opts) {
    state = {
      soal: soalList.map(normalizeSoal),
      idx: 0,
      jawaban: [],
      mode: opts.mode || "latihan",
      judul: opts.judul || "",
      timer: null,
      sisa: window.CONFIG.timerUjianDetik,
      locked: false
    };
    renderSoal(app);
  }

  function renderSoal(app) {
    var s = state.soal[state.idx];
    var letters = ["A", "B", "C", "D", "E"];
    var isLast = state.idx === state.soal.length - 1;

    var html = '<div class="section-head"><div class="eyebrow">' + App.escapeHtml(state.judul || ("Kuis P" + s.pertemuan)) + '</div>' +
      '<div class="btn-row" style="justify-content:space-between"><h2>Soal ' + (state.idx + 1) + ' dari ' + state.soal.length + '</h2>' +
      '<div class="btn-row"><span class="badge">' + s.level + '</span><span class="badge">P' + s.pertemuan + '</span>' +
      (state.mode === "ujian" ? '<span class="badge badge-amber" id="timerBadge" aria-live="off">&#9201; ' + state.sisa + 's</span>' : '') +
      '</div></div>' +
      '<div class="bar lg" role="progressbar" aria-valuenow="' + (state.idx + 1) + '" aria-valuemin="0" aria-valuemax="' + state.soal.length + '" aria-label="Progres soal"><i style="width:' + App.pct(state.idx + 1, state.soal.length) + '%"></i></div>' +
      '</div>';

    html += '<div class="card"><p style="font-size:1.05rem;font-weight:650">' + App.escapeHtml(s.pertanyaan) + '</p><div class="grid" style="grid-template-columns:1fr;gap:10px">';
    letters.forEach(function (L) {
      var answered = state.jawaban[state.idx];
      var chosen = answered && answered.pilih === L;
      var isKey = L === s.kunci;
      var cls = "btn btn-lg";
      var disabled = "";
      if (answered) {
        disabled = " disabled";
        if (isKey) cls += " btn-teal";
        else if (chosen) cls = "btn btn-lg btn-wrong";
      }
      html += '<button type="button" class="' + cls + '" data-opt="' + L + '"' + disabled + '><span class="no mono">' + L + '.</span> ' + App.escapeHtml(s.opsi[L]) + '</button>';
    });
    html += '</div>';

    if (state.jawaban[state.idx] && state.mode === "latihan") {
      var correct = state.jawaban[state.idx].benar;
      html += '<div class="callout ' + (correct ? 'c-teal' : 'c-red') + '" style="margin-top:14px"><strong>' + (correct ? '✓ Benar.' : '✗ Belum tepat. Kunci: ' + s.kunci + '.') + '</strong> ' + App.escapeHtml(s.pembahasan) + '</div>';
    }
    if (state.jawaban[state.idx] && state.mode === "ujian") {
      html += '<p class="small dim" style="margin-top:10px">Jawaban terkunci. Pembahasan tampil di akhir sesi.</p>';
    }
    html += '<div class="btn-row" style="margin-top:16px;justify-content:space-between">' +
      '<button class="btn" id="quitQuiz" type="button">Keluar</button>' +
      (state.jawaban[state.idx] ? '<button class="btn btn-primary" id="nextBtn" type="button">' + (isLast ? 'Lihat Hasil' : 'Soal Berikutnya →') + '</button>' : '') +
      '</div></div>';

    app.innerHTML = html;

    app.querySelectorAll("[data-opt]").forEach(function (b) {
      b.addEventListener("click", function () { answer(b.dataset.opt); });
    });
    var nb = document.getElementById("nextBtn");
    if (nb) nb.addEventListener("click", function () {
      state.idx++;
      if (state.idx >= state.soal.length) renderResult(app);
      else renderSoal(app);
    });
    var qb = document.getElementById("quitQuiz");
    if (qb) qb.addEventListener("click", function () {
      stopTimer();
      state = null;
      App.navigate("#/kuis");
    });

    if (state.mode === "ujian") startTimer(app);
  }

  function answer(L) {
    if (state.locked || state.jawaban[state.idx]) return;
    var s = state.soal[state.idx];
    var benar = L === s.kunci;
    state.jawaban[state.idx] = { id: s.id, pilih: L, benar: benar };
    if (!benar) {
      Storage.update(function (p) {
        if (p.soal_salah.indexOf(s.id) === -1) p.soal_salah.push(s.id);
      });
    } else {
      // keluar dari daftar remedial bila benar
      Storage.update(function (p) {
        var i = p.soal_salah.indexOf(s.id);
        if (i !== -1) p.soal_salah.splice(i, 1);
      });
    }
    var app = document.getElementById("app");
    renderSoal(app);
  }

  function startTimer(app) {
    stopTimer();
    state.sisa = window.CONFIG.timerUjianDetik;
    updateTimerBadge();
    state.timer = setInterval(function () {
      state.sisa--;
      updateTimerBadge();
      if (state.sisa <= 0) {
        // waktu habis = salah, kunci soal
        var s = state.soal[state.idx];
        if (!state.jawaban[state.idx]) {
          state.jawaban[state.idx] = { id: s.id, pilih: null, benar: false };
          Storage.update(function (p) {
            if (p.soal_salah.indexOf(s.id) === -1) p.soal_salah.push(s.id);
          });
        }
        stopTimer();
        var app2 = document.getElementById("app");
        if (state.idx >= state.soal.length - 1) renderResult(app2);
        else { state.idx++; renderSoal(app2); }
      }
    }, 1000);
  }
  function stopTimer() { if (state && state.timer) { clearInterval(state.timer); state.timer = null; } }
  function updateTimerBadge() {
    var b = document.getElementById("timerBadge");
    if (b) {
      b.innerHTML = "&#9201; " + Math.max(0, state.sisa) + "s";
      b.classList.toggle("badge-amber", state.sisa > 10);
      b.style.color = state.sisa <= 10 ? "var(--danger)" : "";
    }
  }

  // ---------- hasil ----------
  function renderResult(app) {
    stopTimer();
    var benar = state.jawaban.filter(function (j) { return j && j.benar; }).length;
    var total = state.soal.length;
    var persen = App.pct(benar, total);
    var lulus = persen >= window.CONFIG.ambangLulus * 100;

    var perP = {};
    state.soal.forEach(function (s, i) {
      var j = state.jawaban[i];
      if (!perP[s.pertemuan]) perP[s.pertemuan] = { benar: 0, total: 0 };
      perP[s.pertemuan].total++;
      if (j && j.benar) perP[s.pertemuan].benar++;
    });

    var pids = Object.keys(perP).map(Number);
    if (pids.length === 1 && state.judul.indexOf("Campuran") === -1 && state.judul.indexOf("Remedial") === -1) {
      var pid = pids[0];
      Storage.update(function (p) {
        var old = p.skor_kuis[pid];
        if (!old || persen > old.persen) p.skor_kuis[pid] = { persen: persen, benar: benar, total: total, tanggal: new Date().toISOString().slice(0, 10) };
      });
    }

    var html = '<div class="section-head"><div class="eyebrow">Hasil Kuis</div><h1>' + (lulus ? 'Selamat, Lulus!' : 'Belum Mencapai Ambang') + '</h1></div>';
    html += '<div class="card center"><div style="font-size:3rem;font-weight:800;color:' + (lulus ? 'var(--teal)' : 'var(--accent)') + '">' + persen + '%</div>' +
      '<p class="muted">' + benar + ' dari ' + total + ' soal benar · mode ' + state.mode + (state.judul ? ' · ' + App.escapeHtml(state.judul) : '') + '</p>' +
      '<div class="bar lg" style="max-width:420px;margin:10px auto"><i style="width:' + persen + '%"></i></div>' +
      '<p class="small dim">Ambang lulus: ' + Math.round(window.CONFIG.ambangLulus * 100) + '%</p></div>';

    html += '<div class="card"><h3>Ringkasan per Pertemuan</h3><div class="table-wrap"><table><thead><tr><th>Pertemuan</th><th>Benar</th><th>Skor</th><th>Rekomendasi</th></tr></thead><tbody>';
    pids.sort(function (a, b) { return a - b; }).forEach(function (pid) {
      var d = perP[pid];
      var skor = App.pct(d.benar, d.total);
      var rec = skor >= 70 ? '<span class="badge badge-teal">OK</span>' : '<a class="badge badge-amber" href="#/materi/' + pid + '">Ulangi P' + pid + '</a>';
      html += '<tr><td>P' + pid + '</td><td>' + d.benar + '/' + d.total + '</td><td>' + skor + '%</td><td>' + rec + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    var salahList = state.soal.filter(function (s, i) { var j = state.jawaban[i]; return !j || !j.benar; });
    if (salahList.length) {
      html += '<div class="card"><h3>Soal Salah & Pembahasan</h3>';
      salahList.forEach(function (s) {
        var j = state.jawaban[state.soal.indexOf(s)];
        html += '<div class="callout c-red"><strong>Soal ' + s.id + ' (P' + s.pertemuan + ', ' + s.level + ')</strong><p>' + App.escapeHtml(s.pertanyaan) + '</p>' +
          '<p class="small">Jawabanmu: <strong>' + (j && j.pilih ? j.pilih + '. ' + App.escapeHtml(s.opsi[j.pilih]) : 'tidak dijawab (waktu habis)') + '</strong><br>Kunci: <strong>' + s.kunci + '. ' + App.escapeHtml(s.opsi[s.kunci]) + '</strong></p>' +
          '<p class="small">' + App.escapeHtml(s.pembahasan) + '</p></div>';
      });
      html += '</div>';
    }

    html += '<div class="btn-row" style="margin-top:16px"><button class="btn btn-primary" id="retryBtn" type="button">Ulangi Kuis Ini</button><a class="btn" href="#/kuis">Pilih Kuis Lain</a><a class="btn" href="#/beranda">Beranda</a></div>';
    app.innerHTML = html;

    document.getElementById("retryBtn").addEventListener("click", function () {
      var pool;
      if (state.judul === "Remedial") {
        pool = window.DATA_SOAL.filter(function (s) { return salahList.map(function (x) { return x.id; }).indexOf(s.id) !== -1; });
      } else {
        pool = state.soal.map(function (s) { return window.DATA_SOAL.find(function (x) { return x.id === s.id; }); });
      }
      startSession(app, App.shuffle(pool.filter(Boolean)), { mode: state.mode, judul: state.judul });
    });

    state = null;
  }

  // ---------- esai ----------
  function renderEsai(app, params) {
    var id = Number(params[0]) || 1;
    var e = App.byId(window.DATA_ESAI, id);
    if (!e) { app.innerHTML = '<p>Esai tidak ditemukan.</p>'; return; }
    var p = Storage.load();
    var saved = (p.esai_jawaban || {})[e.id] || "";
    var showModel = params[1] === "model";

    var html = '<div class="section-head"><div class="eyebrow">Esai Penalaran</div><h1>Esai ' + e.id + ' dari ' + window.DATA_ESAI.length + '</h1>' +
      '<div class="chip-row">' + e.pertemuan.map(function (x) { return '<a class="badge" href="#/materi/' + x + '">P' + x + '</a>'; }).join('') + '</div></div>';

    html += '<div class="card"><p style="font-size:1.05rem;font-weight:650">' + App.escapeHtml(e.pertanyaan) + '</p>' +
      '<label class="field"><span class="lbl">Jawabanmu (tersimpan otomatis di perangkat ini)</span>' +
      '<textarea id="esaiInput" aria-label="Jawaban esai" placeholder="Tulis penalaranmu: mekanisme, arah perubahan, dan alasan…">' + App.escapeHtml(saved) + '</textarea></label>' +
      '<div class="btn-row"><button class="btn btn-primary" id="esaiSave" type="button">Simpan Jawaban</button>' +
      (showModel ? '' : '<button class="btn btn-teal" id="esaiModel" type="button">Buka Jawaban Model</button>') + '</div></div>';

    if (showModel) {
      html += '<div class="card"><h3>Jawaban Model</h3><p>' + App.escapeHtml(e.jawaban_model) + '</p></div>';
      html += '<div class="card"><h3>Nilai Dirimu — checklist poin</h3><p class="small muted">Centang poin yang ada di jawabanmu, lalu bandingkan dengan skor.</p><div id="checklist">';
      e.checklist.forEach(function (c, i) {
        html += '<label class="field" style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" data-ck="' + i + '" style="width:18px;margin-top:4px"><span>' + App.escapeHtml(c) + '</span></label>';
      });
      html += '</div><div class="bar lg" id="ckBar" aria-hidden="true"><i style="width:0%"></i></div><p class="small" id="ckScore">0 dari ' + e.checklist.length + ' poin</p></div>';
    }

    var nav = '<div class="btn-row" style="margin-top:16px">';
    if (e.id > 1) nav += '<a class="btn" href="#/kuis/esai/' + (e.id - 1) + '">← Esai ' + (e.id - 1) + '</a>';
    if (e.id < window.DATA_ESAI.length) nav += '<a class="btn" href="#/kuis/esai/' + (e.id + 1) + '">Esai ' + (e.id + 1) + ' →</a>';
    nav += '<a class="btn btn-ghost" href="#/kuis">Kembali ke Kuis</a></div>';
    html += nav;

    app.innerHTML = html;

    var input = document.getElementById("esaiInput");
    input.addEventListener("input", function () {
      Storage.update(function (pp) { pp.esai_jawaban = pp.esai_jawaban || {}; pp.esai_jawaban[e.id] = input.value; });
    });
    document.getElementById("esaiSave").addEventListener("click", function () {
      Storage.update(function (pp) { pp.esai_jawaban = pp.esai_jawaban || {}; pp.esai_jawaban[e.id] = input.value; });
      App.toast("Jawaban esai disimpan.");
    });
    var mb = document.getElementById("esaiModel");
    if (mb) mb.addEventListener("click", function () { App.navigate("#/kuis/esai/" + e.id + "/model"); });

    if (showModel) {
      var boxes = app.querySelectorAll("[data-ck]");
      function upd() {
        var n = app.querySelectorAll("[data-ck]:checked").length;
        document.getElementById("ckBar").firstElementChild.style.width = App.pct(n, e.checklist.length) + "%";
        document.getElementById("ckScore").textContent = n + " dari " + e.checklist.length + " poin";
      }
      boxes.forEach(function (b) { b.addEventListener("change", upd); });
    }
  }

  // ---------- router ----------
  App.add("kuis", function (app, params) {
    if (!params || !params.length) { renderPick(app); return; }
    if (params[0] === "esai") { renderEsai(app, params.slice(1)); return; }
    if (params[0] === "p") {
      var pid = Number(params[1]);
      var m = App.byId(window.DATA_PERTEMUAN, pid);
      if (!m) { App.navigate("#/kuis"); return; }
      var isInt = m.label_integrasi;
      startSession(app, soalForPertemuan(pid), {
        mode: "latihan",
        judul: isInt ? "Kuis Integrasi P" + pid : "Kuis P" + pid
      });
      return;
    }
    renderPick(app);
  });
})();
