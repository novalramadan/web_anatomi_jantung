/* js/gizmo.js — Panel kontrol transformasi 2D untuk objek 3D (Three.js).
   - Diagram sumbu X/Y/Z: seret panah untuk geser objek.
   - Cincin X/Y/Z: seret cincin (baris tak bertumpuk) untuk memutar objek.
   - Tombol ⟲/⟳ per sumbu: kontrol putar utama yang selalu terlihat & mudah ditekan.
   - Tombol Reset (posisi awal) & Zoom +/- (di bar luar).
   Objek hanya bergerak melalui panel ini (pointer di latar tidak menggerakkan objek). */
(function () {
  "use strict";
  if (!window.THREE) return;

  var COLORS = { x: "#e5484d", y: "#34c176", z: "#4d8fe5" };
  var AXIS = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
  };
  var ARROW_DIR = { x: [1, 0], y: [0, -1], z: [-0.72, 0.72] }; // pseudo-3D: Z ke arah kamera bawah-kiri
  var ROT_STEP = 0.22; // radian per klik tombol putar (~12,6°): langkah jelas terlihat
  var ROT_AXES = ["x", "y", "z"];

  function arrowSVG(axis) {
    var c = COLORS[axis];
    var dir = ARROW_DIR[axis];
    var cx = 60, cy = 60, len = 42;
    var ex = cx + dir[0] * len, ey = cy + dir[1] * len;
    // kepala panah
    var ang = Math.atan2(dir[1], dir[0]);
    var h1x = ex - Math.cos(ang - 0.4) * 11, h1y = ey - Math.sin(ang - 0.4) * 11;
    var h2x = ex - Math.cos(ang + 0.4) * 11, h2y = ey - Math.sin(ang + 0.4) * 11;
    var s = '<g class="gz-h" data-axis="' + axis + '" style="cursor:grab">';
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex + '" y2="' + ey + '" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>';
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex + '" y2="' + ey + '" stroke="transparent" stroke-width="18" pointer-events="stroke"/>';
    s += '<polygon points="' + ex + ',' + ey + ' ' + h1x + ',' + h1y + ' ' + h2x + ',' + h2y + '" fill="' + c + '"/>';
    s += '<circle cx="' + ex + '" cy="' + ey + '" r="13" fill="transparent" pointer-events="all"/>';
    s += '</g>';
    return s;
  }

  // Tiga cincin ditumpuk sebagai baris terpisah (bukan tiga lingkaran hit yang
  // saling menutupi): tiap baris punya area seret selebar SVG sehingga X/Y/Z
  // semuanya bisa dijangkau jari di layar ponsel.
  function ringSVG(axis, row) {
    var c = COLORS[axis];
    var cy = 14 + row * 28;
    var cx = 70, rx = 46;
    var s = '<g class="gz-r" data-axis="' + axis + '" style="cursor:grab">';
    // area seret per baris (28px, tanpa tumpang tindih antar sumbu)
    s += '<rect x="2" y="' + (cy - 13) + '" width="128" height="26" fill="transparent" pointer-events="all"/>';
    s += '<text x="12" y="' + (cy + 4) + '" fill="' + c + '" font-size="11" font-weight="700" text-anchor="middle" font-family="system-ui,sans-serif" pointer-events="none">' + axis.toUpperCase() + '</text>';
    s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="9" fill="none" stroke="' + c + '" stroke-width="3"/>';
    // ujung panah: penanda arah putar
    s += '<polygon points="' + (cx + rx + 1) + ',' + cy + ' ' + (cx + rx - 8) + ',' + (cy - 5) + ' ' + (cx + rx - 8) + ',' + (cy + 5) + '" fill="' + c + '" pointer-events="none"/>';
    s += '</g>';
    return s;
  }

  // Tombol putar eksplisit per sumbu: ⟲ (berlawanan arah jarum jam) dan ⟳.
  // Sengaja berupa HTML di luar <svg> agar kein ditelan area seret cincin.
  function rotateButtonsHTML() {
    return ROT_AXES.map(function (axis) {
      var c = COLORS[axis];
      var A = axis.toUpperCase();
      return '<div class="gz-rrow">' +
        '<span class="gz-rlab" style="color:' + c + '">' + A + '</span>' +
        '<button type="button" class="gz-rbtn" data-axis="' + axis + '" data-dir="-1"' +
        ' style="color:' + c + '" title="Putar sumbu ' + A + ' ke kiri" aria-label="Putar sumbu ' + A + ' ke kiri">⟲</button>' +
        '<button type="button" class="gz-rbtn" data-axis="' + axis + '" data-dir="1"' +
        ' style="color:' + c + '" title="Putar sumbu ' + A + ' ke kanan" aria-label="Putar sumbu ' + A + ' ke kanan">⟳</button>' +
        '</div>';
    }).join("");
  }

  function buildGizmoPanel(host, opts) {
    opts = opts || {};
    host.innerHTML = "";

    var panel = document.createElement("div");
    panel.className = "gz-ctrl";

    // --- Geser: diagram sumbu ---
    var mv = document.createElement("div");
    mv.className = "gz-sec";
    mv.innerHTML = '<div class="gz-title">Geser</div><div class="gz-hint">Seret panah</div>' +
      '<svg class="gz-svg gz-mv-svg" width="120" height="120" viewBox="0 0 120 120">' +
      arrowSVG("x") + arrowSVG("y") + arrowSVG("z") + '</svg>';
    panel.appendChild(mv);

    // --- Putar: cincin bertumpuk + tombol per sumbu ---
    var rt = document.createElement("div");
    rt.className = "gz-sec";
    rt.innerHTML = '<div class="gz-title">Putar</div><div class="gz-hint">Seret cincin / klik tombol</div>' +
      '<div class="gz-rot-wrap">' +
      '<svg class="gz-svg" width="132" height="84" viewBox="0 0 132 84" role="group" aria-label="Cincin putar sumbu X, Y, Z">' +
      ringSVG("x", 0) + ringSVG("y", 1) + ringSVG("z", 2) +
      '</svg>' +
      '<div class="gz-rbtns" role="group" aria-label="Tombol putar per sumbu">' + rotateButtonsHTML() + '</div>' +
      '</div>';
    panel.appendChild(rt);

    host.appendChild(panel);

    // ===== interaksi geser =====
    var mvSvg = mv.querySelector("svg");
    mvSvg.addEventListener("pointerdown", function (e) {
      var g = e.target.closest ? e.target.closest(".gz-h") : null;
      if (!g) return;
      e.preventDefault();
      var axis = g.dataset.axis;
      var lastX = e.clientX, lastY = e.clientY;
      var move = function (ev) {
        var dx = ev.clientX - lastX, dy = ev.clientY - lastY;
        lastX = ev.clientX; lastY = ev.clientY;
        var dir = ARROW_DIR[axis];
        var proj = dx * dir[0] + dy * dir[1];
        if (opts.onMove) opts.onMove(axis, proj);
      };
      var end = function () {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", end);
        document.removeEventListener("pointercancel", end);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", end);
      document.addEventListener("pointercancel", end);
    });

    // ===== interaksi putar: tombol (utama, satu klik = satu langkah) =====
    rt.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest(".gz-rbtn") : null;
      if (!btn) return;
      e.preventDefault();
      var axis = btn.getAttribute("data-axis");
      var dir = Number(btn.getAttribute("data-dir")) || 1;
      if (opts.onRotate) opts.onRotate(axis, dir * ROT_STEP);
    });

    // ===== interaksi putar: seret cincin =====
    var rtSvg = rt.querySelector(".gz-svg");
    rtSvg.addEventListener("pointerdown", function (e) {
      var g = e.target.closest ? e.target.closest(".gz-r") : null;
      if (!g) return;
      e.preventDefault();
      var axis = g.dataset.axis;
      var lastX = e.clientX;
      var move = function (ev) {
        var dx = ev.clientX - lastX;
        lastX = ev.clientX;
        if (opts.onRotate) opts.onRotate(axis, dx * 0.02);
      };
      var end = function () {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", end);
        document.removeEventListener("pointercancel", end);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", end);
      document.addEventListener("pointercancel", end);
    });

    return panel;
  }

  window.buildGizmoPanel = buildGizmoPanel;

  /* Controller: terapkan transformasi panel ke objek Three.js.
     Objek HANYA bergerak melalui fungsi-fungsi ini (tak ada interaksi latar). */
  function isInTree(root, node) {
    var p = node;
    while (p) { if (p === root) return true; p = p.parent; }
    return false;
  }

  /* ar.js memuat model dengan gltf.scene.clone(true). Pada Three r128, clone SkinnedMesh
     tetap memakai Skeleton milik model sumber (tulang asli di luar clone). Akibatnya
     matriks objek hasil clone dibatalkan saat skinning: geser/putar tidak terlihat.
     Di sini skeleton diarahkan ke tulang hasil clone dan di-bind ulang pada pose saat ini,
     sehingga transformasi panel benar-benar menggerakkan model. */
  function repairSkinnedClones(root) {
    if (!root || !root.traverse) return false;
    var boneByName = {};
    var repaired = false;
    root.updateMatrixWorld(true);
    root.traverse(function (o) {
      if (o.isBone && o.name && !boneByName[o.name]) boneByName[o.name] = o;
    });
    root.traverse(function (mesh) {
      if (!mesh.isSkinnedMesh || !mesh.skeleton) return;
      var bones = mesh.skeleton.bones || [];
      var shared = bones.some(function (b) { return b && !isInTree(root, b); });
      if (!shared) return;
      var mapped = bones.map(function (b) { return b && boneByName[b.name] ? boneByName[b.name] : null; });
      if (mapped.some(function (b) { return !b; })) return; // nama tidak cocok: biarkan apa adanya
      mesh.bind(new THREE.Skeleton(mapped));
      repaired = true;
    });
    return repaired;
  }

  /* Model hasil clone yang baru diperbaiki bisa jauh lebih besar dari bingkai kamera
     (transformasi root-nya dulu tidak pernah diterapkan). Perkecil hanya bila meluap,
     agar seluruh model terlihat tanpa mengubah zoom/reset. */
  function fitModelToCamera(root, camera) {
    if (!camera || !camera.isPerspectiveCamera) return;
    var box = new THREE.Box3(), size = new THREE.Vector3(), center = new THREE.Vector3();
    for (var pass = 0; pass < 3; pass++) {
      root.updateMatrixWorld(true);
      box.setFromObject(root);
      if (box.isEmpty()) return;
      box.getSize(size);
      box.getCenter(center);
      var dist = camera.position.distanceTo(center);
      var vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      var vw = vh * (camera.aspect || 1);
      var fill = Math.max(size.x / vw, size.y / vh);
      if (!isFinite(fill) || fill <= 0.5) return;
      root.scale.multiplyScalar(0.5 / fill);
    }
  }

  function TransformController(object, camera, bounds) {
    bounds = bounds || {};
    var bnd = {
      pos: bounds.pos || 2.5,
      zoom: { min: bounds.zoomMin || 1.2, max: bounds.zoomMax || 12 },
      scale: { min: bounds.scaleMin || 0.5, max: bounds.scaleMax || 2.5 }
    };
    this._bnd = bnd;
    this.camera = camera;
    this.attach(object);
  }

  TransformController.prototype.attach = function (object) {
    this.object = object;
    if (object) {
      if (repairSkinnedClones(object) && this.camera) fitModelToCamera(object, this.camera);
      this._p0 = object.position.clone();
      this._q0 = object.quaternion.clone();
      this._s0 = object.scale.clone();
    }
    if (this.camera) this._d0 = this.camera.position.length();
  };

  TransformController.prototype.onMove = function (axis, amt) {
    var o = this.object;
    if (!o) return;
    var step = amt * 0.004;
    o.position[axis] = THREE.MathUtils.clamp(o.position[axis] + step, -this._bnd.pos, this._bnd.pos);
  };

  // geser mengikuti layar: sx>0 = kanan, sy>0 = bawah (pakai basis kamera)
  TransformController.prototype.onMoveScreen = function (sx, sy) {
    var o = this.object, cam = this.camera;
    if (!o || !cam) return;
    var right = new THREE.Vector3(), up = new THREE.Vector3(), back = new THREE.Vector3();
    cam.matrixWorld.extractBasis(right, up, back);
    var k = 0.005;
    o.position.addScaledVector(right, sx * k);
    o.position.addScaledVector(up, -sy * k);
    o.position.x = THREE.MathUtils.clamp(o.position.x, -3, 3);
    o.position.y = THREE.MathUtils.clamp(o.position.y, -3, 3);
  };

  TransformController.prototype.onRotate = function (axis, amt) {
    var o = this.object;
    if (!o) return;
    var q = new THREE.Quaternion().setFromAxisAngle(AXIS[axis], amt);
    // Rotasi pada sumbu LOKAL objek: current * q (bukan q * current).
    // Dengan q * current, objek berputar pada sumbu dunia sehingga sumbu yang
    // dipilih tidak lagi sesuai label cincin setelah beberapa rotasi.
    o.quaternion.multiply(q);
  };

  TransformController.prototype.onZoom = function (dir) {
    var cam = this.camera;
    if (!cam) return;
    var dist = cam.position.length();
    var d = THREE.MathUtils.clamp(dist + dir * 0.6, 1.6, 12);
    cam.position.setLength(d);
    cam.lookAt(0, 0, 0);
  };

  TransformController.prototype.reset = function () {
    var o = this.object;
    if (o && this._p0) {
      o.position.copy(this._p0);
      o.quaternion.copy(this._q0);
      o.scale.copy(this._s0);
    }
    if (this.camera && this._d0) this.camera.position.setLength(this._d0);
  };

  window.TransformController = TransformController;
})();
