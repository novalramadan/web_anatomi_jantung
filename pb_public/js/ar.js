/* js/ar.js — AR Scanner: QR code (jsQR) + render model GLB (Three.js) di atasnya.
   Tidak memakai AR.js/A-Frame. Kamera hanya satu, video langsung di dalam .ar-video-wrap. */
(function () {
  "use strict";

  var video = null, stream = null, scanTimer = null;
  var renderer = null, scene3d = null, camera3d = null, model3d = null, gltfLoader = null;
  var glbCache = {};
  var camFacing = "environment";
  var ctrl = null;
  var gen3d = 0;
  var camGen = 0;
  var loadedKey = null;

  // ============================================================
  // Halaman AR utama
  // ============================================================
  function renderAR(app, mode) {
    mode = mode === "3d" ? "3d" : "cam";
    var lead = mode === "3d"
      ? "Jelajahi model 3D jantung tanpa kamera: seret latar untuk memutar, gulir untuk zoom."
      : "Arahkan kamera ke QR code marker (lihat halaman Cetak Marker). Model 3D jantung akan muncul di atas layar. Butuh izin kamera dan HTTPS/localhost.";
    var html = '<div class="mb-6"><div class="eyebrow mb-2"><span>AR Scanner</span></div><h1 class="mb-3">Scan QR Marker Jantung</h1>' +
      '<p class="lead">' + lead + '</p></div>';
    html += arTabs(mode);
    if (mode === "3d") {
      html += '<div id="arView" class="ar-shell" role="region" aria-label="Model 3D"></div>';
      app.innerHTML = html;
      render3DView();
      return;
    }
    html += '<div id="arView" class="ar-shell" role="region" aria-label="Pemindai AR">' +
      '<div id="arVideo" class="ar-video-wrap">' +
      '<video id="camVideo" playsinline muted autoplay></video>' +
      '<div class="ar-frame"><span class="corner-br"></span><span class="corner-tr"></span></div>' +
      '<div class="ar-status" id="arStatus">Menunggu kamera…</div>' +
      '<button class="btn btn-sm ar-camswitch" id="camSwitch" type="button" title="Ganti kamera">&#128247; Ganti</button>' +
      '<canvas id="glbCanvas"></canvas>' +
      '<div class="flex gap-1 absolute top-3 right-3 z-10" id="gzBar">' +
      '<button class="btn btn-sm" id="gzReset" type="button" title="Posisi awal">↺ Reset</button>' +
      '<button class="btn btn-sm" id="gzZoomIn" type="button" title="Perbesar">+</button>' +
      '<button class="btn btn-sm" id="gzZoomOut" type="button" title="Perkecil">−</button>' +
      '</div>' +
      '<div id="gzPanel" class="absolute right-3 z-10" style="top:3.2rem"></div>' +
      '</div>' +
      '<div id="arInfo" class="ar-info"><div id="arInfoBody"></div></div>' +
      '</div>';
    app.innerHTML = html;
    // init Three.js overlay SEKARANG agar canvas sudah berukuran saat QR ditemukan.
    // Guard: batal bila pengguna sudah pindah rute sebelum timer ini menyala.
    setTimeout(function () {
      if (location.hash !== "#/ar") return;
      if (!document.getElementById("glbCanvas") || !document.getElementById("camVideo")) return;
      ensure3D();
      startCamera();
    }, 60);
  }

  // Tab bar bersama: satu sumber markup untuk kamera, 3D, dan cetak.
  // Tab aktif = btn-primary + aria-current="page"; nonaktif tetap .btn agar seragam.
  function arTabs(active) {
    var cls = function (key) { return "btn btn-sm" + (active === key ? " btn-primary" : ""); };
    var cur = function (key) { return active === key ? ' aria-current="page"' : ""; };
    return '<nav class="ar-mode-tabs" aria-label="Mode AR Scanner">' +
      '<a class="' + cls("cam") + '" id="tabCam" href="#/ar"' + cur("cam") + '>Kamera</a>' +
      '<a class="' + cls("3d") + '" id="tab3d" href="#/ar/3d"' + cur("3d") + '>Mode 3D Tanpa Kamera</a>' +
      '<a class="' + cls("cetak") + '" id="tabCetak" href="#/ar/cetak"' + cur("cetak") + '>Cetak Marker</a>' +
      '</nav>';
  }

  // ============================================================
  // Kamera + QR scanner
  // ============================================================
  function startCamera() {
    var status = document.getElementById("arStatus");
    var wrap = document.getElementById("arVideo");
    var gen = camGen;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      leaveCameraTo3D("Kamera tidak didukung browser ini — beralih ke mode 3D.");
      return;
    }
    if (wrap) wrap.style.display = "block";
    var sw = document.getElementById("camSwitch");
    if (sw) sw.onclick = function () {
      camFacing = camFacing === "environment" ? "user" : "environment";
      App.toast(camFacing === "user" ? "Kamera depan" : "Kamera belakang");
      stopCamera();
      startCamera();
    };
    if (status) { status.textContent = "Meminta izin kamera…"; status.className = "ar-status"; }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: camFacing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then(function (s) {
        if (gen !== camGen) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        stream = s;
        video = document.getElementById("camVideo");
        video.srcObject = s;
        video.setAttribute("playsinline", "");
        video.play();
        if (status) { status.textContent = "Arahkan ke QR code marker…"; status.className = "ar-status"; }
        startQRScan();
      })
      .catch(function (err) {
        if (gen !== camGen) return; // sudah pindah halaman/mode: jangan ubah tampilan
        var msg = "Izin kamera ditolak/tidak tersedia. ";
        if (location.protocol === "file:") msg += "Buka lewat HTTPS/localhost.";
        else if (!window.isSecureContext) msg += "Butuh HTTPS.";
        else msg += "(" + err.name + ")";
        leaveCameraTo3D(msg + " Beralih ke mode 3D.");
      });
  }

  // Kamera gagal/tak didukung: tampilkan mode 3D lewat rute agar tab aktif konsisten.
  function leaveCameraTo3D(msg) {
    if (msg) App.toast(msg, 3600);
    stopCamera();
    App.navigate("#/ar/3d");
  }

  function startQRScan() {
    if (!window.jsQR) {
      var st = document.getElementById("arStatus");
      if (st) { st.textContent = "jsQR belum dimuat."; st.className = "ar-status err"; }
      return;
    }
    var c2d = document.createElement("canvas");
    c2d.width = 640; c2d.height = 480;
    var ctx = c2d.getContext("2d", { willReadFrequently: true });
    clearInterval(scanTimer);
    scanTimer = setInterval(function () {
      if (!video || video.readyState < 2) return;
      var vw = video.videoWidth, vh = video.videoHeight;
      if (!vw) return;
      ctx.drawImage(video, 0, 0, c2d.width, c2d.height);
      var img = ctx.getImageData(0, 0, c2d.width, c2d.height);
      var code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
      if (code && code.data) onQRFound(code.data);
    }, 250);
  }

  function onQRFound(data) {
    var marker = window.DATA_MARKER.find(function (m) { return String(m.nilai_barcode) === data.trim(); });
    if (!marker) {
      var st = document.getElementById("arStatus");
      if (st) { st.textContent = "QR tidak dikenali: " + data; st.className = "ar-status err"; }
      return;
    }
    var st2 = document.getElementById("arStatus");
    if (st2) { st2.textContent = marker.nama + " ditemukan"; st2.className = "ar-status found"; }
    // dedup: hanya muat ulang bila marker BERBEDA. Tanpa ini, scan tiap 250ms me-reset objek
    if (loadedKey === String(marker.nilai_barcode) && model3d) return;
    loadedKey = String(marker.nilai_barcode);
    showInfo(marker);
    loadModelToOverlay(marker);
  }

  // ============================================================
  // Three.js overlay di atas video
  // ============================================================
  function ensure3D() {
    if (renderer) return;
    var gen = gen3d;
    var canvas = document.getElementById("glbCanvas");
    if (!canvas) return;
    if (!window.THREE) { console.error("THREE belum dimuat"); return; }
    var w = canvas.clientWidth || canvas.parentElement.clientWidth || 640;
    var h = canvas.clientHeight || canvas.parentElement.clientHeight || 480;
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    scene3d = new THREE.Scene();
    camera3d = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera3d.position.set(0, 0, 4);
    scene3d.add(new THREE.AmbientLight(0xffffff, 0.85));
    var d = new THREE.DirectionalLight(0xffffff, 0.9);
    d.position.set(2, 3, 4);
    scene3d.add(d);
    if (window.THREE && THREE.GLTFLoader) gltfLoader = new THREE.GLTFLoader();
    else if (window.GLTFLoader) gltfLoader = new window.GLTFLoader();
    // controller: objek hanya bergerak via panel kontrol
    ctrl = new TransformController(null, camera3d);
    bindPanelBar();
    bindCanvasDrag(canvas);
    buildGizmoPanel(document.getElementById("gzPanel"), {
      onMove: function (a, amt) { if (ctrl) ctrl.onMove(a, amt); },
      onRotate: function (a, amt) { if (ctrl) ctrl.onRotate(a, amt); },
      onReset: function () { if (ctrl) ctrl.reset(); },
      onZoom: function (d) { if (ctrl) ctrl.onZoom(d); }
    });
    requestAnimationFrame(function () { tick(gen); });
  }

  // bar atas: Reset + Zoom In/Out (overlay kamera)
  function bindPanelBar() {
    var doZoom = function (dir) {
      if (ctrl) ctrl.onZoom(dir);
    };
    var bR = document.getElementById("gzReset");
    var bO = document.getElementById("gzZoomOut");
    var bI = document.getElementById("gzZoomIn");
    if (bR) bR.addEventListener("click", function () { if (ctrl) ctrl.reset(); });
    if (bO) bO.addEventListener("click", function () { doZoom(1); });
    if (bI) bI.addEventListener("click", function () { doZoom(-1); });
  }

  // tarik di canvas langsung: biasa = geser X/Y; tahan Shift = putar Y/X
  function bindCanvasDrag(canvas) {
    if (!canvas) return;
    var D = { mode: null, lx: 0, ly: 0 };
    canvas.addEventListener("pointerdown", function (e) {
      if (!model3d || !ctrl) return;
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      D.mode = e.shiftKey ? "rotate" : "move";
      D.lx = e.clientX; D.ly = e.clientY;
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!D.mode || !ctrl) return;
      var dx = e.clientX - D.lx, dy = e.clientY - D.ly;
      D.lx = e.clientX; D.ly = e.clientY;
      if (D.mode === "move") {
        ctrl.onMoveScreen(dx, dy);
      } else {
        if (dx) ctrl.onRotate("y", dx * 0.02);
        if (dy) ctrl.onRotate("x", -dy * 0.02);
      }
    });
    function endDrag() { D.mode = null; }
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }

  function resize3D() {
    if (!renderer) return;
    var canvas = document.getElementById("glbCanvas");
    if (!canvas) return;
    var w = canvas.clientWidth || 640, h = canvas.clientHeight || 480;
    renderer.setSize(w, h, false);
    camera3d.aspect = w / h;
    camera3d.updateProjectionMatrix();
  }

  function tick(gen) {
    if (gen !== gen3d || !renderer) return;
    requestAnimationFrame(function () { tick(gen); });
    camera3d.lookAt(model3d ? model3d.position : new THREE.Vector3(0, 0, 0));
    renderer.render(scene3d, camera3d);
  }

  function loadModelToOverlay(marker) {
    if (!renderer) ensure3D();
    if (!renderer) { App.toast("Renderer 3D belum siap."); return; }
    var asset = marker.aset_3d || null;
    if (!asset || !asset.file_glb) { App.toast("Marker belum memiliki aset GLB."); return; }
    PB.fileUrl("aset_3d", asset.id, asset.file_glb).then(function (url) {
      loadModelUrl(marker, url);
    }).catch(function (err) { App.toast("Gagal membuat URL file: " + err.message); });
  }

  function loadModelUrl(marker, url, gen) {
    var cacheKey = marker.aset_3d ? marker.aset_3d.id : marker.model;
    var stale = function () { return gen !== undefined && gen !== gen3d; };
    var finish = function (obj) {
      if (stale()) return;
      obj.scale.setScalar(1.6);
      obj.position.set(0, 0, 0);
      model3d = obj;
      scene3d.add(obj);
      if (ctrl) ctrl.attach(obj);
      resize3D();
      var shell = document.getElementById("arView");
      if (shell) shell.classList.add("with-model");
      var st = document.getElementById("arStatus");
      if (st) { st.textContent = "Model " + marker.nama + " tampil"; st.className = "ar-status found"; }
      var ms = document.getElementById("modelStatus");
      if (ms) ms.textContent = "Model " + marker.nama + " tampil.";
    };
    if (glbCache[cacheKey]) { finish(glbCache[cacheKey].clone(true)); return; }
    if (!gltfLoader) {
      if (window.THREE && THREE.GLTFLoader) gltfLoader = new THREE.GLTFLoader();
      else if (window.GLTFLoader) gltfLoader = new window.GLTFLoader();
    }
    if (!gltfLoader) { App.toast("GLTFLoader belum dimuat. Periksa assets/lib/GLTFLoader.js"); return; }
    gltfLoader.load(url, function (gltf) {
      if (stale()) return;
      var root = gltf.scene || (gltf.scenes && gltf.scenes[0]);
      if (!root) { App.toast("GLB tidak berisi scene."); return; }
      glbCache[cacheKey] = root;
      finish(root.clone(true));
    }, function (progress) {
      if (stale()) return;
      if (progress.total) {
        var pct = Math.round(progress.loaded / progress.total * 100);
        var st2 = document.getElementById("arStatus");
        if (st2) { st2.textContent = "Memuat model " + pct + "%"; st2.className = "ar-status"; }
        var ms = document.getElementById("modelStatus");
        if (ms) ms.textContent = "Memuat model " + pct + "%…";
      }
    }, function (err) {
      if (stale()) return;
      console.error("Gagal load GLB:", err);
      App.toast("Gagal memuat GLB: " + url);
      var st3 = document.getElementById("arStatus");
      if (st3) { st3.textContent = "Gagal memuat model"; st3.className = "ar-status err"; }
      var ms2 = document.getElementById("modelStatus");
      if (ms2) ms2.textContent = "Gagal memuat model. Periksa koneksi file.";
    });
  }

  function dispose3D() {
    gen3d++;
    ctrl = null;
    if (model3d && scene3d) { scene3d.remove(model3d); model3d = null; }
    if (renderer) { renderer.dispose(); renderer = null; scene3d = null; camera3d = null; }
  }

  function stopCamera() {
    camGen++; // pembatalan: callback getUserMedia lama jadi basi
    clearInterval(scanTimer);
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (video) { video.srcObject = null; }
  }

  // ============================================================
  // Panel info
  // ============================================================
  function showInfo(marker) {
    var body = document.getElementById("arInfoBody");
    var infoEl = document.getElementById("arInfo");
    if (!marker) { infoEl.classList.remove("show"); return; }
    // Marker yang dibuat otomatis bisa belum punya pertemuan terkait
    // (`pertemuan_terkait: []`); jangan tampilkan tautan "#/materi/undefined".
    var terkait = Array.isArray(marker.pertemuan_terkait) ? marker.pertemuan_terkait : [];
    var pid = terkait.length ? terkait[0] : null;
    var links = pid != null
      ? '<div class="mt-3 flex flex-wrap gap-2"><a class="btn btn-sm" href="#/materi/' + encodeURIComponent(pid) + '">Buka Materi</a>' +
        '<a class="btn btn-sm" href="#/kuis/p/' + encodeURIComponent(pid) + '">Kuis</a></div>'
      : "";
    var html = '<h3 class="m-0 mb-1 text-brand">' + App.escapeHtml(marker.nama) + '</h3>' +
      '<p class="small muted m-0">' + App.escapeHtml(marker.deskripsi) + '</p>' + links;
    body.innerHTML = html;
    infoEl.classList.add("show");
  }

  // ============================================================
  // Viewer 3D tanpa kamera
  // ============================================================
  function render3DView(preferredId) {
    var vw = document.getElementById("arView");
    var viewGen = gen3d;
    if (!window.THREE) {
      vw.innerHTML = '<div class="ar-fallback">Three.js belum dimuat. Periksa assets/lib/three.min.js.</div>';
      return;
    }
    var playable = (window.DATA_MARKER || []).filter(function (m) {
      return m && m.aset_3d && m.aset_3d.file_glb;
    });
    if (!playable.length) {
      vw.innerHTML = '<div class="ar-fallback">Belum ada marker dengan file GLB. Tambah aset 3D lewat panel dosen, lalu cetak QR-nya.</div>';
      return;
    }
    var selected = preferredId
      ? playable.find(function (m) { return String(m.id) === String(preferredId); })
      : null;
    if (!selected) {
      selected = playable.slice().sort(function (a, b) {
        return (Number(a.nilai_barcode) || 0) - (Number(b.nilai_barcode) || 0);
      }).pop();
    }
    var picker = "";
    if (playable.length > 1) {
      picker = '<div class="mb-3 flex flex-wrap items-center justify-center gap-2">' +
        '<label class="tiny" for="markerPick" style="color:#A7B5C3">Pilih model</label>' +
        '<select class="input" id="markerPick" style="max-width:340px">' +
        playable.map(function (m) {
          return '<option value="' + App.escapeHtml(m.id) + '"' + (m === selected ? " selected" : "") + '>' +
            App.escapeHtml(m.nama) + ' · QR ' + App.escapeHtml(m.nilai_barcode) + '</option>';
        }).join("") + '</select></div>';
    }
    vw.innerHTML =
      '<div class="mb-4" style="color:#fff;text-align:center"><div class="eyebrow mb-2">Mode 3D</div><h3 style="color:#fff">' +
      App.escapeHtml(selected.nama || "Model 3D") + ' — geser, putar &amp; zoom</h3></div>' +
      picker +
      '<div id="modelStatus" class="tiny mb-2" style="color:#A7B5C3;text-align:center">Memuat model…</div>' +
      '<div class="viewer3d" id="viewer3d" style="height:460px"><div class="hint3d">Putar kamera: seret latar · gulir: zoom</div></div>';
    var el = document.getElementById("viewer3d");
    var cv = document.createElement("canvas");
    cv.style.width = "100%"; cv.style.height = "100%"; cv.style.display = "block";
    el.appendChild(cv);
    var r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setSize(el.clientWidth, el.clientHeight, false);
    var sc = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
    cam.position.set(0, 0.4, 4);
    // loadModelUrl/finish/dispose3D operate on these module-level handles.
    renderer = r;
    scene3d = sc;
    camera3d = cam;
    sc.add(new THREE.AmbientLight(0xffffff, 0.85));
    var d = new THREE.DirectionalLight(0xffffff, 0.9);
    d.position.set(2, 3, 4);
    sc.add(d);
    // controller: objek hanya bergerak via panel / tarikan canvas
    ctrl = new TransformController(null, cam);
    bindCanvasDrag(cv);
    var asset = selected.aset_3d;
    PB.fileUrl("aset_3d", asset.id, asset.file_glb).then(function (url) {
      if (viewGen !== gen3d) return;
      loadModelUrl(selected, url, viewGen);
    }).catch(function (err) {
      if (viewGen !== gen3d) return;
      var msg = err && err.message ? err.message : String(err);
      console.error("[AR] Gagal menyiapkan model:", err);
      App.toast("Gagal menyiapkan model: " + msg);
      var st = document.getElementById("modelStatus");
      if (st) st.textContent = "Gagal menyiapkan model: " + msg;
    });
    if (playable.length > 1) {
      var pick = document.getElementById("markerPick");
      if (pick) pick.addEventListener("change", function () {
        dispose3D();
        render3DView(pick.value);
      });
    }
    // bar Reset + Zoom, panel geser/putar di bawahnya (kanan atas)
    var bar = document.createElement("div");
    bar.className = "flex gap-1 absolute top-3 right-3 z-10";
    bar.innerHTML = '<button class="btn btn-sm" id="gzReset2" type="button" title="Posisi awal">↺ Reset</button>' +
      '<button class="btn btn-sm" id="gzZoomIn2" type="button" title="Perbesar">+</button>' +
      '<button class="btn btn-sm" id="gzZoomOut2" type="button" title="Perkecil">−</button>';
    var phost = document.createElement("div");
    phost.id = "gzPanel2";
    phost.className = "absolute right-3 z-10";
    phost.style.top = "3.2rem";
    el.style.position = "relative";
    el.appendChild(bar);
    el.appendChild(phost);
    bar.querySelector("#gzReset2").addEventListener("click", function () { ctrl.reset(); });
    bar.querySelector("#gzZoomOut2").addEventListener("click", function () { ctrl.onZoom(1); });
    bar.querySelector("#gzZoomIn2").addEventListener("click", function () { ctrl.onZoom(-1); });
    buildGizmoPanel(phost, {
      onMove: function (a, amt) { ctrl.onMove(a, amt); },
      onRotate: function (a, amt) { ctrl.onRotate(a, amt); },
      onReset: function () { ctrl.reset(); },
      onZoom: function (dd) { ctrl.onZoom(dd); }
    });
    // latar kanvas beku: tak ada drag/zoom — semua kontrol via panel
    cam.lookAt(0, 0, 0);
    (function loop() {
      if (viewGen !== gen3d || renderer !== r) return;
      requestAnimationFrame(loop);
      r.render(sc, cam);
    })();
    window.addEventListener("resize", function () {
      if (viewGen !== gen3d || renderer !== r) return;
      r.setSize(el.clientWidth, el.clientHeight, false);
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
    });
  }

  // ============================================================
  // Cetak marker QR
  // ============================================================
  function renderCetak(app) {
    var html = '<div class="mb-6"><div class="eyebrow mb-2">Cetak Marker</div><h1 class="mb-3">Cetak QR Marker</h1>' +
      '<p class="lead">QR code ini berisi nilai barcode yang dikenali scanner. Cetak minimal 4×4 cm.</p></div>';
    html += arTabs("cetak");
    html += '<div class="mb-4"><button class="btn btn-primary" id="printBtn" type="button">Cetak / Simpan</button></div>';
    html += '<div class="marker-print" id="markerPrint">';
    window.DATA_MARKER.forEach(function (m) {
      html += '<div class="marker-cell" role="img" aria-label="QR marker ' + App.escapeHtml(m.nama) + '">' +
        '<canvas data-mid="' + m.id + '" width="360" height="360"></canvas>' +
        '<div class="nm">' + App.escapeHtml(m.nama) + '</div><div class="id">QR: ' + m.nilai_barcode + '</div></div>';
    });
    html += '</div>';
    app.innerHTML = html;
    window.DATA_MARKER.forEach(function (m) {
      var cv = app.querySelector('[data-mid="' + m.id + '"]');
      if (cv) drawQR(cv, String(m.nilai_barcode));
    });
    document.getElementById("printBtn").addEventListener("click", function () { window.print(); });
  }

  function drawQR(canvas, text) {
    if (!window.qrcode) { // fallback: tampilkan teks
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000"; ctx.font = "16px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      return;
    }
    var qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount();
    var cell = Math.floor(canvas.width / n);
    var ctx2 = canvas.getContext("2d");
    ctx2.fillStyle = "#fff"; ctx2.fillRect(0, 0, canvas.width, canvas.height);
    ctx2.fillStyle = "#000";
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) ctx2.fillRect(c * cell, r * cell, cell, cell);
      }
    }
  }

  // ============================================================
  // Router
  // ============================================================
  App.add("ar", function (app, params) {
    var sub = params && params[0];
    stopCamera();
    dispose3D();
    if (sub === "cetak") { renderCetak(app); return; }
    renderAR(app, sub === "3d" ? "3d" : "cam");
  });
  window.addEventListener("hashchange", stopCamera);
})();
