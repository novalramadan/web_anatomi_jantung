/* js/kuis.js — kuis pilihan ganda (latihan/ujian) dan kuis campuran. */
(function () {
  "use strict";

  var state = null; // sesi kuis aktif

  function isStaff() {
    var u = (window.Auth && Auth.currentUser && Auth.currentUser()) || null;
    return !!(u && (u.role === "dosen" || u.role === "admin"));
  }

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
    return { id: s.id, pertemuan: s.pertemuan, level: s.level, pertanyaan: s.pertanyaan, opsi: opsiBaru, kunci: kunciBaru, pembahasan: s.pembahasan, gambar: s.gambar || s.image || null, keteranganGambar: s.keterangan_gambar || s.caption || "", _recordId: s._recordId || "", _fileName: s._fileName || "" };
  }


  // ---------- pilih mode ----------
  function renderPick(app) {
    var staff = isStaff();
    var p = staff ? null : Storage.load();
    var html = '<div class="mb-6"><div class="eyebrow mb-2"><span>Kuis</span></div><h1 class="mb-3">' + (staff ? 'Pratinjau Kuis' : 'Pilih Mode Kuis') + '</h1><p class="lead">' +
      (staff ? 'Mode dosen: pilihan jawaban tidak bisa dipilih dan skor tidak disimpan. Pilih pertemuan untuk melihat soal beserta kunci dan pembahasan.'
             : 'Latihan atau Ujian (timer ' + window.CONFIG.timerUjianDetik + ' detik per soal). Kunci dan pembahasan tidak tampil saat mengerjakan, hanya setelah kuis selesai.') + '</p></div>';
    if (staff) {
      html += '<div class="callout mb-4"><strong>Mode Dosen · Pratinjau</strong><p class="small mt-1">Pilihan jawaban tidak bisa dipilih dan skor tidak disimpan.</p></div>';
    }
    html += '<div class="grid gap-4' + (staff ? '' : ' lg:grid-cols-2') + '">';

    // kuis pertemuan
    html += '<div class="surface-card min-w-0 p-5"><div class="mb-3"><h2 class="m-0">Kuis per Pertemuan</h2></div><div class="grid gap-2">';
    window.DATA_PERTEMUAN.forEach(function (m) {
      var n = soalForPertemuan(m.id).length;
      var isInt = m.label_integrasi;
      var best = staff ? null : p.skor_kuis[m.id];
      var badge = best ? '<span class="badge ' + (best.persen >= window.CONFIG.ambangLulus * 100 ? 'badge-success' : 'badge-warn') + '">Terbaik ' + best.persen + '%</span>' : '';
      html += '<a class="qrow" href="#/kuis/p/' + m.id + '"><span class="qn">P' + m.id + '</span><span class="qt">' + (isInt ? '<span class="badge badge-warn mr-1.5">Integrasi</span>' : '') + App.escapeHtml(m.judul) + '</span><span class="qm"><span class="small dim">' + (isInt ? '10 soal acak' : n + ' soal') + '</span>' + badge + '</span></a>';
    });
    html += '</div></div>';

    // kuis campuran (mahasiswa saja)
    if (!staff) {
      html += '<div class="grid gap-4">';
      html += '<div class="surface-card p-5"><div class="mb-3"><h3 class="m-0">Kuis Campuran</h3></div>' +
        '<label class="field"><span class="lbl">Pertemuan</span><select id="mixP" class="input"><option value="0">Semua</option>' + window.DATA_PERTEMUAN.filter(function (m) { return !m.label_integrasi; }).map(function (m) { return '<option value="' + m.id + '">P' + m.id + ' · ' + App.escapeHtml(m.judul) + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span class="lbl">Jumlah soal</span><select id="mixN" class="input"><option selected>10</option></select></label>' +
        '<label class="field"><span class="lbl">Level</span><select id="mixL" class="input"><option value="">Semua</option><option value="C2">C2</option><option value="C3">C3</option><option value="C4">C4</option></select></label>' +
        '<button class="btn btn-primary btn-block" id="mixStart" type="button">Mulai Kuis Campuran</button></div>';
      html += '</div>';
    }
    html += '</div>';

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
      timerIdx: null,
      sisa: window.CONFIG.timerUjianDetik,
      locked: false,
      preview: false
    };
    renderSoal(app);
  }

  // ---------- pratinjau dosen (read-only) ----------
  function startPreview(app, soalList, opts) {
    state = {
      soal: soalList.map(normalizeSoal),
      idx: 0,
      jawaban: [],
      mode: "pratinjau",
      judul: opts.judul || "",
      timer: null,
      timerIdx: null,
      sisa: window.CONFIG.timerUjianDetik,
      locked: true,
      preview: true
    };
    renderSoal(app);
  }

  function renderSoal(app) {
    var s = state.soal[state.idx];
    var preview = !!state.preview;
    var letters = ["A", "B", "C", "D", "E"];
    var isLast = state.idx === state.soal.length - 1;

    var m = App.byId(window.DATA_PERTEMUAN, s.pertemuan);
    var subTitle = m ? m.judul : "";

    // —— panel kiri: media (sage) ——
    var hasDbImage = !!(s.gambar && s._recordId && s._fileName);
    var imgSrc = hasDbImage ? null : "assets/img/Sick.jpg";
    var imgCaption = hasDbImage ? "Gambar pendukung soal" : "Gambar pendukung (pratinjau)";
    var imageUrlPromise = hasDbImage ? PB.fileUrl("soal", s._recordId, s._fileName) : null;

    function imageStage() {
      if (hasDbImage) return '<div id="quizDbImg" class="quiz-img-loading">Memuat gambar…</div>';
      if (imgSrc) return '<img src="' + App.escapeHtml(imgSrc) + '" alt="Ilustrasi soal" loading="lazy">';
      return '<div class="quiz-img-placeholder"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>'
        + '<p>Ilustrasi untuk soal ini belum tersedia.</p></div>';
    }

    var numberLabel = (state.idx + 1) < 10 ? "0" + (state.idx + 1) : String(state.idx + 1);
    var mediaHtml = '<aside class="quiz-media">' +
      '<span class="quiz-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>Ilustrasi Soal #' + numberLabel + '</span>' +
      '<div class="quiz-img-stage">' + imageStage() + '</div>' +
      (imgCaption ? '<p class="quiz-caption">' + App.escapeHtml(imgCaption) + '</p>' : '') +
      '</aside>';

    // —— toolbar atas + stepper nomor soal ——
    var pillText = App.escapeHtml(state.judul || "Kuis");
    if (preview) pillText += " · Mode Dosen · Pratinjau";
    var topBar = '<div class="quiz-topbar">' +
      '<div class="quiz-topbar-left">' +
      '<button type="button" class="quiz-back" id="quitQuiz">← Kembali</button>' +
      '</div>' +
      '<div class="quiz-topbar-mid">' +
      '<span class="quiz-mode-pill">' + pillText + '</span>' +
      (!preview && state.mode === "ujian" ? '<span class="quiz-timer" id="timerBadge" aria-live="off">&#9201; ' + state.sisa + 's</span>' : '') +
      '</div>' +
      '<div class="quiz-topbar-right">' +
      (preview ? '' : '<button type="button" class="quiz-btn-primary quiz-end" id="endQuiz">Akhiri</button>') +
      '</div></div>';

    var stepsHtml = "";
    for (var si = 0; si < state.soal.length; si++) {
      var scls = "quiz-step" + (state.jawaban[si] ? " done" : "") + (si === state.idx ? " now" : "");
      stepsHtml += '<span class="' + scls + '" title="Soal ' + (si + 1) + (state.jawaban[si] ? ' (dijawab)' : '') + '">' + (si + 1) + '</span>';
    }
    var stepper = '<div class="quiz-stepper"><div class="quiz-steps" aria-label="Nomor soal">' + stepsHtml + '</div>' +
      '<div class="quiz-count">Pertanyaan ' + (state.idx + 1) + ' dari ' + state.soal.length + '</div></div>';

    var optHtml = '<div class="quiz-options">';
    letters.forEach(function (L) {
      var answered = state.jawaban[state.idx];
      var chosen = !preview && answered && answered.pilih === L;
      var isKey = L === s.kunci;
      var cls = "quiz-opt";
      var disabled = "";
      if (preview) {
        disabled = " disabled";
        if (isKey) cls += " is-correct";
      } else if (chosen) {
        cls += " is-selected";
      }
      optHtml += '<button type="button" class="' + cls + '" data-opt="' + L + '"' + disabled + '><span class="quiz-opt-key">' + L + '</span><span class="quiz-opt-text">' + App.escapeHtml(s.opsi[L]) + '</span></button>';
    });
    optHtml += '</div>';

    var feedbackHtml;
    if (preview) {
      feedbackHtml = '<div class="callout mt-5"><strong>Kunci: ' + s.kunci + '. ' + App.escapeHtml(s.opsi[s.kunci]) + '</strong>' +
        '<p class="small mt-1">' + App.escapeHtml(s.pembahasan || "Belum ada pembahasan.") + '</p></div>';
    } else {
      feedbackHtml = '<p class="quiz-hint small dim mt-5">Kamu bisa mengganti atau membatalkan pilihan sebelum menekan Selanjutnya/Selesai Kuis.</p>';
    }

    var nextLabel = isLast ? (preview ? "Selesai Preview" : "Selesai Kuis") : "Selanjutnya";
    var nextIcon = isLast ? "&#10003;" : "&#8594;";
    var footHtml = '<footer class="quiz-foot">' +
      '<button class="quiz-btn-ghost" id="prevBtn" type="button"' + (state.idx === 0 ? " disabled" : "") + '>&#8592; Sebelumnya</button>' +
      '<button class="quiz-btn-primary" id="nextBtn" type="button">' + nextLabel + ' ' + nextIcon + '</button>' +
      '</footer>';

    var typeLabel = "Pilihan Ganda" + (s.level ? " · " + s.level : "");
    var contentHtml = '<section class="quiz-content">' +
      '<header class="quiz-head">' +
        '<span class="quiz-eyebrow">' + App.escapeHtml(typeLabel) + '</span>' +
        '<p class="quiz-instruction">Pilih satu jawaban yang paling tepat.</p>' +
        '<h1 class="quiz-title">' + App.escapeHtml(s.pertanyaan) + '</h1>' +
        (subTitle ? '<div class="quiz-subtitle">Pertemuan ' + s.pertemuan + ' · ' + App.escapeHtml(subTitle) + '</div>' : '') +
      '</header>' +
      optHtml +
      feedbackHtml +
      footHtml +
      '</section>';

    var html = '<div class="quiz-wrap">' + topBar + stepper + '<div class="quiz-split">' + mediaHtml + contentHtml + '</div></div>';

    app.innerHTML = html;

    if (imageUrlPromise) {
      imageUrlPromise.then(function (url) {
        var slot = document.getElementById("quizDbImg");
        if (slot) slot.innerHTML = '<img src="' + App.escapeHtml(url) + '" alt="Ilustrasi soal" loading="lazy">';
      }).catch(function () {
        var slot = document.getElementById("quizDbImg");
        if (slot) slot.textContent = "Gambar gagal dimuat.";
      });
    }

    if (!preview) {
      app.querySelectorAll("[data-opt]").forEach(function (b) {
        b.addEventListener("click", function () { answer(b.dataset.opt); });
      });
    }
    var nb = document.getElementById("nextBtn");
    if (nb) nb.addEventListener("click", function () {
      state.idx++;
      if (state.idx >= state.soal.length) {
        if (preview) {
          state = null;
          App.navigate("#/kuis");
        } else {
          renderResult(app);
        }
      } else {
        renderSoal(app);
      }
      if (window.scrollTo) window.scrollTo({ top: 0, behavior: "auto" });
    });
    var pb = document.getElementById("prevBtn");
    if (pb) pb.addEventListener("click", function () {
      if (state.idx > 0) { state.idx--; renderSoal(app); if (window.scrollTo) window.scrollTo({ top: 0, behavior: "auto" }); }
    });
    var quit = function () {
      stopTimer();
      state = null;
      App.navigate("#/kuis");
    };
    var qb = document.getElementById("quitQuiz");
    if (qb) qb.addEventListener("click", quit);
    var eb = document.getElementById("endQuiz");
    if (eb) eb.addEventListener("click", quit);

    if (!preview && state.mode === "ujian" && state.timerIdx !== state.idx) startTimer(app);
  }

  function answer(L) {
    if (!state || state.preview || state.locked) return;
    var s = state.soal[state.idx];
    var current = state.jawaban[state.idx];
    if (current && current.pilih === L) {
      delete state.jawaban[state.idx];
    } else {
      state.jawaban[state.idx] = { id: s.id, pilih: L, benar: L === s.kunci };
    }
    var app = document.getElementById("app");
    if (app) renderSoal(app);
  }

  function startTimer(app) {
    stopTimer();
    state.timerIdx = state.idx;
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
      if (state.sisa <= 10) { b.classList.add("is-danger"); }
    }
  }

  // ---------- hasil ----------
  function renderResult(app) {
    if (!state || state.preview) return;
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
    if (pids.length === 1 && state.judul.indexOf("Campuran") === -1) {
      var pid = pids[0];
      Storage.update(function (p) {
        var old = p.skor_kuis[pid];
        if (!old || persen > old.persen) p.skor_kuis[pid] = { persen: persen, benar: benar, total: total, tanggal: new Date().toISOString().slice(0, 10) };
      });
    }

    var html = '<div class="mb-6"><div class="eyebrow mb-2"><span>Hasil Kuis</span></div><h1>' + (lulus ? 'Selamat, Lulus!' : 'Belum Mencapai Ambang') + '</h1></div>';
    html += '<div class="surface-card p-6 text-center"><div class="mb-1 text-5xl font-extrabold" style="color:' + (lulus ? 'var(--success)' : 'var(--danger)') + '">' + persen + '%</div>' +
      '<p class="muted">' + benar + ' dari ' + total + ' soal benar · mode ' + state.mode + (state.judul ? ' · ' + App.escapeHtml(state.judul) : '') + '</p>' +
      '<div class="bar lg mx-auto mt-3" style="max-width:420px"><i style="width:' + persen + '%"></i></div>' +
      '<p class="small dim mt-2">Ambang lulus: ' + Math.round(window.CONFIG.ambangLulus * 100) + '%</p></div>';

    html += '<div class="surface-card mt-4 p-5"><h3 class="mb-3">Ringkasan per Pertemuan</h3><div class="table-wrap"><table><thead><tr><th>Pertemuan</th><th>Benar</th><th>Skor</th><th>Rekomendasi</th></tr></thead><tbody>';
    pids.sort(function (a, b) { return a - b; }).forEach(function (pid) {
      var d = perP[pid];
      var skor = App.pct(d.benar, d.total);
      var rec = skor >= 70 ? '<span class="badge badge-success">OK</span>' : '<a class="badge badge-warn no-underline" href="#/materi/' + pid + '">Ulangi P' + pid + '</a>';
      html += '<tr><td>P' + pid + '</td><td>' + d.benar + '/' + d.total + '</td><td>' + skor + '%</td><td>' + rec + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    var salahList = state.soal.filter(function (s, i) { var j = state.jawaban[i]; return !j || !j.benar; });
    if (salahList.length) {
      html += '<div class="surface-card mt-4 p-5"><h3 class="mb-3">Soal Salah &amp; Pembahasan</h3>';
      salahList.forEach(function (s) {
        var j = state.jawaban[state.soal.indexOf(s)];
        html += '<div class="callout c-red mb-3"><strong>Soal ' + s.id + ' (P' + s.pertemuan + ', ' + s.level + ')</strong><p>' + App.escapeHtml(s.pertanyaan) + '</p>' +
          '<p class="small">Jawabanmu: <strong>' + (j && j.pilih ? j.pilih + '. ' + App.escapeHtml(s.opsi[j.pilih]) : 'tidak dijawab (waktu habis)') + '</strong><br>Kunci: <strong>' + s.kunci + '. ' + App.escapeHtml(s.opsi[s.kunci]) + '</strong></p>' +
          '<p class="small">' + App.escapeHtml(s.pembahasan) + '</p></div>';
      });
      html += '</div>';
    }

    html += '<div class="mt-5 flex flex-wrap gap-3"><button class="btn btn-primary" id="retryBtn" type="button">Ulangi Kuis Ini</button><a class="btn" href="#/kuis">Pilih Kuis Lain</a><a class="btn" href="#/beranda">Beranda</a></div>';
    app.innerHTML = html;

    document.getElementById("retryBtn").addEventListener("click", function () {
      var pool = state.soal.map(function (s) { return window.DATA_SOAL.find(function (x) { return x.id === s.id; }); });
      startSession(app, App.shuffle(pool.filter(Boolean)), { mode: state.mode, judul: state.judul });
    });

    state = null;
  }

  // ---------- router ----------
  App.add("kuis", function (app, params) {
    if (!params || !params.length) { renderPick(app); return; }
    if (params[0] === "p") {
      var pid = Number(params[1]);
      var m = App.byId(window.DATA_PERTEMUAN, pid);
      if (!m) { App.navigate("#/kuis"); return; }
      var isInt = m.label_integrasi;
      var judul = isInt ? "Kuis Integrasi P" + pid : "Kuis P" + pid;
      if (isStaff()) startPreview(app, soalForPertemuan(pid), { judul: judul });
      else startSession(app, soalForPertemuan(pid), { mode: "latihan", judul: judul });
      return;
    }
    renderPick(app);
  });
})();
