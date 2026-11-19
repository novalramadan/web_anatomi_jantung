/* js/gizmo.js — Gizmo transformasi 3D kustom (translate & rotate) untuk Three.js.
   Dipakai viewer 3D di js/ar.js. Klik tarik panah = geser di sumbu, klik tarik cincin = putar di sumbu.
   Tidak butuh TransformControls (tidak ada di three.min.js bundle). */
(function () {
  "use strict";
  if (!window.THREE) return;

  var AXIS = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
  };
  var COLORS = { x: 0xe5484d, y: 0x34c176, z: 0x4d8fe5, hover: 0xffffff };
  // orientasi geometri: memetakan +Y lokal ke sumbu dunia
  var ALIGN = {
    x: [0, 0, -Math.PI / 2],
    y: [0, 0, 0],
    z: [Math.PI / 2, 0, 0]
  };
  var RING_ALIGN = {
    x: [0, Math.PI / 2, 0],
    y: [Math.PI / 2, 0, 0],
    z: [0, 0, 0]
  };

  function TransformGizmo(camera, domElement) {
    this.camera = camera;
    this.dom = domElement;
    this.object = null;
    this.mode = "translate";
    this.enabled = true;
    this.dragging = false;
    this.size = 0.22;

    this.group = new THREE.Group();
    this.group.renderOrder = 999;
    this.handles = [];
    this.mats = { x: {}, y: {}, z: {} };
    this.raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._plane = new THREE.Plane();
    this._hit = new THREE.Vector3();
    this._v0 = new THREE.Vector3();
    this._v1 = new THREE.Vector3();
    this._cross = new THREE.Vector3();
    this._q = new THREE.Quaternion();

    this._build();
    this._bind();
  }

  TransformGizmo.prototype._mat = function (axis, type) {
    var m = new THREE.MeshBasicMaterial({
      color: COLORS[axis], depthTest: false, depthWrite: false,
      transparent: true, opacity: 0.95
    });
    this.mats[axis][type] = m;
    return m;
  };

  TransformGizmo.prototype._ghostMat = function () {
    return new THREE.MeshBasicMaterial({ visible: false });
  };

  TransformGizmo.prototype._add = function (mesh, axis, type) {
    mesh.userData.axis = axis;
    mesh.userData.type = type;
    mesh.renderOrder = 999;
    this.group.add(mesh);
    this.handles.push(mesh);
    return mesh;
  };

  TransformGizmo.prototype._build = function () {
    var shaftGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.82, 12);
    shaftGeo.translate(0, 0.41, 0);
    var headGeo = new THREE.ConeGeometry(0.1, 0.24, 18);
    var ringGeo = new THREE.TorusGeometry(0.72, 0.028, 10, 56);
    var pickShaftGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.9, 8);
    pickShaftGeo.translate(0, 0.45, 0);
    var pickRingGeo = new THREE.TorusGeometry(0.72, 0.08, 8, 40);
    var ghost = this._ghostMat();

    ["x", "y", "z"].forEach(function (a) {
      var dir = AXIS[a];
      // translate: batang + kepala panah
      var tm = this._mat(a, "translate");
      var shaft = new THREE.Mesh(shaftGeo, tm);
      shaft.rotation.set.apply(shaft.rotation, ALIGN[a]);
      this._add(shaft, a, "translate");
      var head = new THREE.Mesh(headGeo, tm);
      head.rotation.set.apply(head.rotation, ALIGN[a]);
      head.position.copy(dir).multiplyScalar(0.92);
      this._add(head, a, "translate");
      var pickS = new THREE.Mesh(pickShaftGeo, ghost);
      pickS.rotation.set.apply(pickS.rotation, ALIGN[a]);
      this._add(pickS, a, "translate");
      // rotate: cincin
      var rm = this._mat(a, "rotate");
      var ring = new THREE.Mesh(ringGeo, rm);
      ring.rotation.set.apply(ring.rotation, RING_ALIGN[a]);
      this._add(ring, a, "rotate");
      var pickR = new THREE.Mesh(pickRingGeo, ghost);
      pickR.rotation.set.apply(pickR.rotation, RING_ALIGN[a]);
      this._add(pickR, a, "rotate");
    }, this);

    this._refreshVisibility();
  };

  TransformGizmo.prototype._refreshVisibility = function () {
    this.handles.forEach(function (h) {
      h.visible = h.userData.type === this.mode;
    }, this);
  };

  TransformGizmo.prototype.setMode = function (mode) {
    if (mode !== "translate" && mode !== "rotate") return;
    this.mode = mode;
    this._refreshVisibility();
  };

  TransformGizmo.prototype.attach = function (object) {
    this.object = object;
  };

  TransformGizmo.prototype.detach = function () {
    this.object = null;
    this.dragging = false;
  };

  TransformGizmo.prototype.addTo = function (scene) {
    scene.add(this.group);
  };

  TransformGizmo.prototype.removeFrom = function (scene) {
    scene.remove(this.group);
  };

  TransformGizmo.prototype._setNdc = function (e) {
    var r = this.dom.getBoundingClientRect();
    this._ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    this._ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    this.raycaster.setFromCamera(this._ndc, this.camera);
  };

  TransformGizmo.prototype._setColor = function (axis, type, color) {
    var m = this.mats[axis] && this.mats[axis][type];
    if (m) m.color.setHex(color);
  };

  TransformGizmo.prototype._resetColors = function () {
    ["x", "y", "z"].forEach(function (a) {
      this._setColor(a, "translate", COLORS[a]);
      this._setColor(a, "rotate", COLORS[a]);
    }, this);
  };

  TransformGizmo.prototype._bind = function () {
    var self = this;

    this.dom.addEventListener("pointerdown", function (e) {
      if (!self.enabled || !self.object) return;
      self._setNdc(e);
      var hits = self.raycaster.intersectObjects(self.handles, false);
      if (!hits.length) return;
      var h = hits[0].object;
      var axis = h.userData.axis, type = h.userData.type;
      var obj = self.object;
      var center = obj.position.clone();

      self.dragging = true;
      self.axis = axis;
      self.type = type;
      self._startObjPos = obj.position.clone();
      self._startObjQuat = obj.quaternion.clone();

      if (type === "translate") {
        var camDir = new THREE.Vector3();
        self.camera.getWorldDirection(camDir);
        var n = new THREE.Vector3().crossVectors(AXIS[axis], camDir);
        if (n.lengthSq() < 1e-6) n.set(0, 0, 1);
        self._plane.setFromNormalAndCoplanarPoint(n, center);
      } else {
        self._plane.setFromNormalAndCoplanarPoint(AXIS[axis], center);
      }
      self._center = center;
      self._setNdc(e);
      if (self.raycaster.ray.intersectPlane(self._plane, self._hit)) {
        self._startPoint = self._hit.clone();
      } else {
        self._startPoint = center.clone();
      }
      self._setColor(axis, type, COLORS.hover);
      e.preventDefault();
    });

    window.addEventListener("pointermove", function (e) {
      if (!self.dragging || !self.object) return;
      self._setNdc(e);
      if (!self.raycaster.ray.intersectPlane(self._plane, self._hit)) return;
      var obj = self.object;
      if (self.type === "translate") {
        var delta = self._hit.clone().sub(self._startPoint);
        var amount = delta.dot(AXIS[self.axis]);
        obj.position.copy(self._startObjPos).addScaledVector(AXIS[self.axis], amount);
      } else {
        self._v0.copy(self._startPoint).sub(self._center);
        self._v1.copy(self._hit).sub(self._center);
        self._cross.crossVectors(self._v0, self._v1);
        var angle = Math.atan2(self._cross.dot(AXIS[self.axis]), self._v0.dot(self._v1));
        self._q.setFromAxisAngle(AXIS[self.axis], angle);
        obj.quaternion.copy(self._q).multiply(self._startObjQuat);
      }
    });

    window.addEventListener("pointerup", function () {
      if (!self.dragging) return;
      self.dragging = false;
      self._resetColors();
    });
  };

  // panggil tiap frame: ikuti objek + skala konstan di layar
  TransformGizmo.prototype.update = function () {
    if (!this.object) { this.group.visible = false; return; }
    this.group.visible = this.enabled;
    this.group.position.copy(this.object.position);
    var d = this.camera.position.distanceTo(this.object.position);
    this.group.scale.setScalar(Math.max(0.001, d * this.size));
  };

  window.TransformGizmo = TransformGizmo;
})();
