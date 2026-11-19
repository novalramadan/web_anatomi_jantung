/* js/gizmo.js — Panel kontrol transformasi 2D untuk objek 3D (Three.js).
   - Diagram sumbu X/Y/Z: seret panah untuk geser objek.
   - Cincin X/Y/Z: seret cincin untuk memutar objek di sumbu tsb.
   - Tombol Reset (posisi awal) & Zoom +/-.
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
    s += '<polygon points="' + ex + ',' + ey + ' ' + h1x + ',' + h1y + ' ' + h2x + ',' + h2y + '" fill="' + c + '"/>';
    s += '<circle cx="' + ex + '" cy="' + ey + '" r="13" fill="transparent"/>';
    s += '</g>';
    return s;
  }

  function ringSVG(axis) {
    var c = COLORS[axis];
    // tiga cincin sejajar; cincin digambar sebagai elips untuk kesan 3D
    var s = '<g class="gz-r" data-axis="' + axis + '" style="cursor:grab">';
    s += '<ellipse cx="' + (0) + '" cy="0" rx="17" ry="7" fill="none" stroke="' + c + '" stroke-width="3.5"/>';
    s += '<polygon points="17,0 10,-5 10,5" fill="' + c + '"/>';
    s += '<circle cx="0" cy="0" r="26" fill="transparent"/>';
    s += '</g>';
    return s;
  }

  function buildGizmoPanel(host, opts) {
    opts = opts || {};
    host.innerHTML = "";

    var panel = document.createElement("div");
    panel.className = "gz-ctrl";

    // --- Geser: diagram sumbu ---
    var mv = document.createElement("div");
    mv.className = "gz-sec";
    mv.innerHTML = '<div class="gz-title">Geser</div>' +
      '<svg class="gz-svg" width="120" height="120" viewBox="0 0 120 120">' +
      arrowSVG("x") + arrowSVG("y") + arrowSVG("z") + '</svg>';
    panel.appendChild(mv);

    // --- Putar: cincin ---
    var rt = document.createElement("div");
    rt.className = "gz-sec";
    rt.innerHTML = '<div class="gz-title">Putar</div>' +
      '<svg class="gz-svg" width="140" height="90" viewBox="-70 -45 140 90">' +
      '<g transform="translate(-42,0)">' + ringSVG("x") + '</g>' +
      '<g transform="translate(0,0)">' + ringSVG("y") + '</g>' +
      '<g transform="translate(42,0)">' + ringSVG("z") + '</g>' +
      '</svg>';
    panel.appendChild(rt);

    host.appendChild(panel);

    // ===== interaksi geser =====
    var mvSvg = mv.querySelector("svg");
    var dragAxis = null, lastX = 0, lastY = 0;
    mvSvg.addEventListener("pointerdown", function (e) {
      var g = e.target.closest(".gz-h");
      if (!g) return;
      dragAxis = g.dataset.axis;
      lastX = e.clientX; lastY = e.clientY;
      g.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    mvSvg.addEventListener("pointermove", function (e) {
      if (!dragAxis) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      var dir = ARROW_DIR[dragAxis];
      var proj = dx * dir[0] + dy * dir[1];
      if (opts.onMove) opts.onMove(dragAxis, proj);
    });
    var endMv = function () { dragAxis = null; };
    mvSvg.addEventListener("pointerup", endMv);
    mvSvg.addEventListener("pointercancel", endMv);

    // ===== interaksi putar =====
    var rtSvg = rt.querySelector("svg");
    var rotAxis = null, rotLastX = 0;
    rtSvg.addEventListener("pointerdown", function (e) {
      var g = e.target.closest(".gz-r");
      if (!g) return;
      rotAxis = g.dataset.axis;
      rotLastX = e.clientX;
      g.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    rtSvg.addEventListener("pointermove", function (e) {
      if (!rotAxis) return;
      var dx = e.clientX - rotLastX;
      rotLastX = e.clientX;
      if (opts.onRotate) opts.onRotate(rotAxis, dx * 0.02);
    });
    var endRt = function () { rotAxis = null; };
    rtSvg.addEventListener("pointerup", endRt);
    rtSvg.addEventListener("pointercancel", endRt);

    return panel;
  }

  window.buildGizmoPanel = buildGizmoPanel;

  /* Controller: terapkan transformasi panel ke objek Three.js.
     Objek HANYA bergerak melalui fungsi-fungsi ini (tak ada interaksi latar). */
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

  TransformController.prototype.onRotate = function (axis, amt) {
    var o = this.object;
    if (!o) return;
    var q = new THREE.Quaternion().setFromAxisAngle(AXIS[axis], amt);
    o.quaternion.premultiply(q);
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
