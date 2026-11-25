/* js/anatomy3d.js — Model 3D Anatomi Tubuh Manusia Multi-Lapisan Prosedural (Three.js r128).
   Tanpa file .glb/.gltf eksternal:
   - 5 Lapisan: Kulit Transparan (Fresnel), Sistem Rangka (InstancedMesh), Kardiovaskular & Paru,
     Sistem Pencernaan, dan Sistem Saraf Pusat + impuls biolistrik.
   - Animasi fisiologis: Pernapasan (paru + ribcage), Detak Jantung "Lub-Dub" + aliran darah InstancedMesh,
     Impuls Saraf, dan Subtle Living Posture.
   - Interaktif: Orbit damping (drag + zoom), Raycaster klik organ (smooth camera lerp + kartu info medis),
     Toggle Layer, Exploded View slider, Speed slider, Pause/Play, Reset Kamera. */
(function () {
  "use strict";

  function clamp(v, mn, mx) { return v < mn ? mn : (v > mx ? mx : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hash(x, y, z) {
    var h = x * 374761393 + y * 668265263 + z * 2147483647;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) & 0xffff) / 0xffff;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function noise3(x, y, z) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
    var c000 = hash(xi, yi, zi), c100 = hash(xi + 1, yi, zi), c010 = hash(xi, yi + 1, zi), c110 = hash(xi + 1, yi + 1, zi);
    var c001 = hash(xi, yi, zi + 1), c101 = hash(xi + 1, yi, zi + 1), c011 = hash(xi, yi + 1, zi + 1), c111 = hash(xi + 1, yi + 1, zi + 1);
    return lerp(lerp(lerp(c000, c100, xf), lerp(c010, c110, xf), yf), lerp(lerp(c001, c101, xf), lerp(c011, c111, xf), yf), zf) * 2 - 1;
  }

  // ---------- Tekstur Prosedural via Canvas ----------
  function buildTextures() {
    var S = 256;
    // 1. Organ & Alveoli Normal/Roughness Map
    var cOrg = document.createElement("canvas"); cOrg.width = cOrg.height = S;
    var gO = cOrg.getContext("2d");
    gO.fillStyle = "#808080"; gO.fillRect(0, 0, S, S);
    for (var i = 0; i < 900; i++) {
      var x = Math.random() * S, y = Math.random() * S, r = 2 + Math.random() * 6;
      var v = Math.floor(110 + Math.random() * 55);
      gO.fillStyle = "rgba(" + v + "," + v + "," + v + ",0.32)";
      gO.beginPath(); gO.arc(x, y, r, 0, Math.PI * 2); gO.fill();
    }
    var organBump = new THREE.CanvasTexture(cOrg);
    organBump.wrapS = organBump.wrapT = THREE.RepeatWrapping;
    organBump.repeat.set(3, 3);

    // 2. Tulang berpori halus (Ivory porous bone)
    var cBone = document.createElement("canvas"); cBone.width = cBone.height = S;
    var gB = cBone.getContext("2d");
    gB.fillStyle = "#ebe3d2"; gB.fillRect(0, 0, S, S);
    for (var j = 0; j < 1800; j++) {
      var bx = Math.random() * S, by = Math.random() * S;
      gB.fillStyle = Math.random() < 0.6 ? "rgba(185,170,145,0.28)" : "rgba(255,252,245,0.35)";
      gB.fillRect(bx, by, 1.5, 1.5);
    }
    var boneTex = new THREE.CanvasTexture(cBone);
    boneTex.wrapS = boneTex.wrapT = THREE.RepeatWrapping;
    boneTex.encoding = THREE.sRGBEncoding;

    // 3. Lipatan Otak (Cerebral Sulci)
    var cBrain = document.createElement("canvas"); cBrain.width = cBrain.height = S;
    var gBr = cBrain.getContext("2d");
    gBr.fillStyle = "#909090"; gBr.fillRect(0, 0, S, S);
    gBr.lineCap = "round";
    for (var k = 0; k < 240; k++) {
      var sx = Math.random() * S, sy = Math.random() * S;
      gBr.strokeStyle = k % 2 === 0 ? "rgba(45,45,45,0.45)" : "rgba(215,215,215,0.35)";
      gBr.lineWidth = 2 + Math.random() * 2.5;
      gBr.beginPath(); gBr.moveTo(sx, sy);
      for (var s = 0; s < 4; s++) {
        sx += (Math.random() - 0.5) * 32;
        sy += (Math.random() - 0.5) * 32;
        gBr.lineTo(sx, sy);
      }
      gBr.stroke();
    }
    var brainBump = new THREE.CanvasTexture(cBrain);
    brainBump.wrapS = brainBump.wrapT = THREE.RepeatWrapping;
    brainBump.repeat.set(2, 2);

    return { organBump: organBump, boneTex: boneTex, brainBump: brainBump };
  }

  // ---------- Environment Map Studio Medis (PMREM) ----------
  function buildEnv(renderer) {
    var env = new THREE.Scene();
    var sky = new THREE.Mesh(
      new THREE.SphereGeometry(20, 24, 12),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })
    );
    var pos = sky.geometry.attributes.position, cols = [];
    var top = new THREE.Color("#2f584a"), bot = new THREE.Color("#05120d");
    for (var i = 0; i < pos.count; i++) {
      var c = bot.clone().lerp(top, (pos.getY(i) / 20 + 1) / 2);
      cols.push(c.r, c.g, c.b);
    }
    sky.geometry.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    env.add(sky);
    function box(w, h, x, y, z, col) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    }
    box(10, 8, -6, 6, 8, "#fff4e8");
    box(8, 10, 10, 2, -5, "#7de6be");
    box(8, 6, -9, -2, -7, "#7fb8ff");
    var pm = new THREE.PMREMGenerator(renderer);
    var rt = pm.fromScene(env, 0.04);
    pm.dispose();
    return rt;
  }

  // ---------- Subsurface Scattering ringan untuk organ ----------
  function attachSss(mat, hexColor) {
    mat.onBeforeCompile = function (shader) {
      shader.uniforms.uSssCol = { value: new THREE.Color(hexColor).convertSRGBToLinear() };
      shader.fragmentShader = "uniform vec3 uSssCol;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        "float sssR = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 2.1);\n" +
        "gl_FragColor.rgb += uSssCol * sssR * 0.22;\n" +
        "#include <dithering_fragment>"
      );
    };
    mat.customProgramCacheKey = function () { return "organ_sss_" + hexColor; };
    return mat;
  }

  // ---------- Kurva Fisiologis ----------
  function pulse(p, c, w) { var d = (p - c) / w; return Math.exp(-d * d); }
  function heartLubDub(p) { return pulse(p, 0.18, 0.05) + pulse(p, 0.34, 0.055) * 0.48; }

  function mount(stage, opts) {
    opts = opts || {};
    if (!window.THREE) return fallback(stage);
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return fallback(stage); }

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    var defaultCamPos = new THREE.Vector3(0, 0.92, 3.05);
    var defaultTarget = new THREE.Vector3(0, 0.90, 0);
    camera.position.copy(defaultCamPos);

    var envRT = buildEnv(renderer);
    scene.environment = envRT.texture;

    var disposables = [envRT];
    function track(o) { disposables.push(o); return o; }
    function srgb(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }

    // ---- Three-Point Lighting Studio Medis ----
    scene.add(new THREE.HemisphereLight(0xf3f7ff, 0x09241a, 0.52));
    var keyLight = new THREE.DirectionalLight(0xfff1e2, 1.55); keyLight.position.set(-2.5, 3.5, 3.5); scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0x5ce0b0, 1.45); rimLight.position.set(3.2, 2.0, -2.8); scene.add(rimLight);
    var fillLight = new THREE.DirectionalLight(0x8bbdff, 0.55); fillLight.position.set(-3.0, -0.5, 1.8); scene.add(fillLight);

    var tex = buildTextures();
    track(tex.organBump); track(tex.boneTex); track(tex.brainBump);

    // ---- Root & Lapisan Anatomi (tinggi total ~1.75 unit, kaki di y=0, puncak kepala di y=1.75) ----
    var bodyRoot = new THREE.Group();
    scene.add(bodyRoot);

    var layers = {
      skin: new THREE.Group(),
      skeleton: new THREE.Group(),
      cardio: new THREE.Group(),
      digestive: new THREE.Group(),
      nervous: new THREE.Group()
    };
    Object.keys(layers).forEach(function (k) { bodyRoot.add(layers[k]); });

    var clickables = [];
    function tagOrgan(obj, name, system, desc, focusY, focusDist) {
      obj.userData.organInfo = { name: name, system: system, desc: desc, focusY: focusY, focusDist: focusDist || 1.25 };
      clickables.push(obj);
      return obj;
    }

    // =========================================================================
    // 1. LAPISAN KULIT / SILUET LUAR (Fresnel Holografik Transparan)
    // =========================================================================
    var skinMat = track(new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: srgb("#5cc59a") },
        uRimColor: { value: srgb("#b6ffdf") }
      },
      vertexShader:
        "varying vec3 vNorm; varying vec3 vView;\n" +
        "void main() {\n" +
        "  vec4 mv = modelViewMatrix * vec4(position, 1.0);\n" +
        "  vNorm = normalize(normalMatrix * normal);\n" +
        "  vView = normalize(-mv.xyz);\n" +
        "  gl_Position = projectionMatrix * mv;\n" +
        "}",
      fragmentShader:
        "uniform vec3 uColor; uniform vec3 uRimColor;\n" +
        "varying vec3 vNorm; varying vec3 vView;\n" +
        "void main() {\n" +
        "  float fres = pow(1.0 - abs(dot(normalize(vNorm), normalize(vView))), 2.4);\n" +
        "  vec3 col = mix(uColor, uRimColor, fres);\n" +
        "  gl_FragColor = vec4(col, 0.06 + fres * 0.34);\n" +
        "}",
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    }));

    // Siluet torso + leher + kepala (LatheGeometry proporsional 1.75m)
    var torsoPts = [
      new THREE.Vector2(0.01, 0.78),
      new THREE.Vector2(0.15, 0.80),
      new THREE.Vector2(0.16, 0.90),  // pinggul
      new THREE.Vector2(0.132, 1.03), // pinggang
      new THREE.Vector2(0.165, 1.22), // dada
      new THREE.Vector2(0.195, 1.38), // bahu
      new THREE.Vector2(0.062, 1.44), // pangkal leher
      new THREE.Vector2(0.054, 1.51), // leher
      new THREE.Vector2(0.088, 1.58), // rahang/kepala
      new THREE.Vector2(0.095, 1.66),
      new THREE.Vector2(0.072, 1.73),
      new THREE.Vector2(0.001, 1.755)
    ];
    var torsoGeo = track(new THREE.LatheGeometry(torsoPts, 36));
    torsoGeo.scale(1.0, 1.0, 0.68);
    layers.skin.add(new THREE.Mesh(torsoGeo, skinMat));

    function limbShell(pts, rFn) {
      var c = new THREE.CatmullRomCurve3(pts);
      var g = track(new THREE.TubeGeometry(c, 20, 1, 16, false));
      var p = g.attributes.position, cPts = c.getSpacedPoints(20);
      // skala radius sepanjang tube
      for (var ii = 0; ii <= 20; ii++) {
        var r = rFn(ii / 20);
        for (var jj = 0; jj <= 16; jj++) {
          var idx = ii * 17 + jj;
          var vx = p.getX(idx) - cPts[ii].x, vy = p.getY(idx) - cPts[ii].y, vz = p.getZ(idx) - cPts[ii].z;
          p.setXYZ(idx, cPts[ii].x + vx * r, cPts[ii].y + vy * r, cPts[ii].z + vz * r);
        }
      }
      g.computeVertexNormals();
      return new THREE.Mesh(g, skinMat);
    }
    [-1, 1].forEach(function (side) {
      // Lengan luar
      layers.skin.add(limbShell([
        new THREE.Vector3(side * 0.185, 1.37, 0),
        new THREE.Vector3(side * 0.23, 1.15, 0.01),
        new THREE.Vector3(side * 0.25, 0.92, 0.04),
        new THREE.Vector3(side * 0.265, 0.78, 0.06)
      ], function (u) { return lerp(0.052, 0.032, u); }));
      // Tungkai luar
      layers.skin.add(limbShell([
        new THREE.Vector3(side * 0.095, 0.84, 0),
        new THREE.Vector3(side * 0.092, 0.48, 0.01),
        new THREE.Vector3(side * 0.088, 0.08, 0.01),
        new THREE.Vector3(side * 0.09, 0.01, 0.08)
      ], function (u) { return u < 0.5 ? lerp(0.078, 0.054, u * 2) : lerp(0.054, 0.038, (u - 0.5) * 2); }));
    });

    // =========================================================================
    // 2. SISTEM RANGKA (Tengkorak, Instanced Spine & Ribcage, Pelvis, Limbs)
    // =========================================================================
    var boneMat = track(new THREE.MeshStandardMaterial({
      map: tex.boneTex,
      color: srgb("#efe7d6"),
      roughness: 0.72,
      metalness: 0.04
    }));

    // Tengkorak (Cranium + Rahang)
    var skullGroup = new THREE.Group();
    skullGroup.position.set(0, 1.63, 0.01);
    var cranium = new THREE.Mesh(track(new THREE.SphereGeometry(0.082, 28, 22)), boneMat);
    cranium.scale.set(0.92, 1.08, 1.08);
    skullGroup.add(cranium);
    var jaw = new THREE.Mesh(track(new THREE.BoxGeometry(0.082, 0.065, 0.085)), boneMat);
    jaw.position.set(0, -0.055, 0.028);
    skullGroup.add(jaw);
    tagOrgan(cranium, "Tengkorak (Cranium)", "Sistem Rangka", "Melindungi otak serta membentuk struktur wajah dan rongga sensorik.", 1.63, 0.75);
    layers.skeleton.add(skullGroup);

    // Tulang Belakang Beruas (24 ruas InstancedMesh)
    var vertGeo = track(new THREE.CylinderGeometry(0.022, 0.024, 0.017, 14));
    var spineInst = new THREE.InstancedMesh(vertGeo, boneMat, 24);
    var dummy = new THREE.Object3D();
    for (var v = 0; v < 24; v++) {
      var vt = v / 23;
      var vy = lerp(0.89, 1.48, vt);
      var vz = -0.042 + Math.sin(vt * Math.PI * 2) * 0.014; // kurva S alami
      var sc = lerp(1.25, 0.72, vt);
      dummy.position.set(0, vy, vz);
      dummy.scale.set(sc, 1, sc);
      dummy.rotation.set(Math.cos(vt * Math.PI * 2) * 0.12, 0, 0);
      dummy.updateMatrix();
      spineInst.setMatrixAt(v, dummy.matrix);
    }
    spineInst.instanceMatrix.needsUpdate = true;
    tagOrgan(spineInst, "Tulang Belakang (Vertebrae)", "Sistem Rangka", "Menopang beban tubuh, menjaga postur tegak, dan melindungi sumsum tulang belakang.", 1.18, 1.1);
    layers.skeleton.add(spineInst);

    // Sternum (Tulang Dada)
    var sternum = new THREE.Mesh(track(new THREE.BoxGeometry(0.024, 0.16, 0.012)), boneMat);
    sternum.position.set(0, 1.25, 0.088);
    layers.skeleton.add(sternum);

    // Tulang Rusuk Melengkung (Ribcage: 20 pasang kiri/kanan via InstancedMesh -> beranimasi napas!)
    var ribCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -0.04),
      new THREE.Vector3(0.11, -0.008, -0.015),
      new THREE.Vector3(0.135, -0.018, 0.04),
      new THREE.Vector3(0.025, -0.024, 0.085)
    ]);
    var ribGeo = track(new THREE.TubeGeometry(ribCurve, 18, 0.0065, 8, false));
    var ribInst = new THREE.InstancedMesh(ribGeo, boneMat, 20);
    var ribMeta = [];
    for (var r = 0; r < 10; r++) {
      var rt = r / 9;
      var ry = lerp(1.36, 1.11, rt);
      var rw = 0.68 + Math.sin(rt * Math.PI * 0.85) * 0.42;
      [-1, 1].forEach(function (side) {
        ribMeta.push({ side: side, y: ry, w: rw, rt: rt });
      });
    }
    function updateRibs(breath) {
      for (var i = 0; i < ribMeta.length; i++) {
        var m = ribMeta[i];
        var lift = breath * 0.009 * (0.4 + 0.6 * m.rt);
        var exp = 1 + breath * 0.055;
        dummy.position.set(0, m.y + lift, 0);
        dummy.scale.set(m.side * m.w * exp, 1, exp);
        dummy.rotation.set(-breath * 0.06, 0, 0);
        dummy.updateMatrix();
        ribInst.setMatrixAt(i, dummy.matrix);
      }
      ribInst.instanceMatrix.needsUpdate = true;
    }
    updateRibs(0);
    tagOrgan(ribInst, "Tulang Rusuk (Ribcage)", "Sistem Rangka", "Membentuk rongga pelindung bagi jantung dan paru-paru serta mengembang saat bernapas.", 1.24, 0.95);
    layers.skeleton.add(ribInst);

    // Klavikula & Pelvis & Tulang Lengan/Tungkai
    [-1, 1].forEach(function (side) {
      var clav = new THREE.Mesh(track(new THREE.CylinderGeometry(0.007, 0.008, 0.145, 10)), boneMat);
      clav.position.set(side * 0.085, 1.385, 0.055);
      clav.rotation.set(0.15, 0, side * 1.42);
      layers.skeleton.add(clav);

      // Pelvis sayap ilium
      var ilium = new THREE.Mesh(track(new THREE.SphereGeometry(0.068, 16, 12)), boneMat);
      ilium.scale.set(0.85, 1.05, 0.45);
      ilium.position.set(side * 0.075, 0.85, 0);
      ilium.rotation.z = side * -0.35;
      layers.skeleton.add(ilium);

      // Humerus + Radius/Ulna
      var hum = new THREE.Mesh(track(new THREE.CylinderGeometry(0.015, 0.012, 0.29, 10)), boneMat);
      hum.position.set(side * 0.205, 1.23, 0); hum.rotation.z = side * -0.14;
      layers.skeleton.add(hum);
      var rad = new THREE.Mesh(track(new THREE.CylinderGeometry(0.012, 0.009, 0.25, 10)), boneMat);
      rad.position.set(side * 0.24, 0.96, 0.03); rad.rotation.set(-0.15, 0, side * -0.06);
      layers.skeleton.add(rad);

      // Femur + Tibia
      var fem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.02, 0.017, 0.40, 12)), boneMat);
      fem.position.set(side * 0.09, 0.62, 0);
      layers.skeleton.add(fem);
      var tib = new THREE.Mesh(track(new THREE.CylinderGeometry(0.016, 0.013, 0.39, 12)), boneMat);
      tib.position.set(side * 0.088, 0.21, 0);
      layers.skeleton.add(tib);
    });

    // =========================================================================
    // 3. SISTEM PERNAPASAN & KARDIOVASKULAR (Paru, Jantung, Arteri, Vena, Darah)
    // =========================================================================
    var lungMat = track(attachSss(new THREE.MeshPhysicalMaterial({
      color: srgb("#d97a82"),
      bumpMap: tex.organBump, bumpScale: 0.004,
      roughness: 0.34, clearcoat: 0.82, clearcoatRoughness: 0.2
    }), "#ff7a70"));

    var lungLGroup = new THREE.Group();
    var lungRGroup = new THREE.Group();
    function makeLung(side) {
      var g = track(new THREE.SphereGeometry(0.075, 24, 20));
      var p = g.attributes.position;
      for (var i = 0; i < p.count; i++) {
        var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        var tap = y > 0 ? 1 - (y / 0.075) * 0.45 : 1 + (-y / 0.075) * 0.12;
        p.setXYZ(i, x * tap * 0.88, y * 1.55, z * tap * 0.92);
      }
      g.computeVertexNormals();
      var m = new THREE.Mesh(g, lungMat);
      return tagOrgan(m, side < 0 ? "Paru-paru Kanan" : "Paru-paru Kiri", "Sistem Pernapasan",
        "Organ pertukaran gas oksigen (O₂) dan karbon dioksida (CO₂) di jutaan alveolus.", 1.24, 0.85);
    }
    var rLung = makeLung(-1); lungRGroup.position.set(-0.072, 1.24, 0.012); lungRGroup.add(rLung);
    var lLung = makeLung(1);  lungLGroup.position.set(0.074, 1.24, 0.012);  lungLGroup.add(lLung);
    layers.cardio.add(lungRGroup, lungLGroup);

    // Trakea
    var trachea = new THREE.Mesh(track(new THREE.CylinderGeometry(0.011, 0.011, 0.16, 14)), boneMat);
    trachea.position.set(0, 1.40, 0.015);
    layers.cardio.add(trachea);

    // Jantung di Mediastinum (miring ke kiri pasien = +x)
    var heartMat = track(attachSss(new THREE.MeshPhysicalMaterial({
      color: srgb("#a81c24"),
      bumpMap: tex.organBump, bumpScale: 0.005,
      roughness: 0.24, clearcoat: 0.95, clearcoatRoughness: 0.12
    }), "#ff3828"));
    var heartGeo = track(new THREE.SphereGeometry(0.044, 28, 22));
    var hp = heartGeo.attributes.position;
    for (var hi = 0; hi < hp.count; hi++) {
      var hx = hp.getX(hi), hy = hp.getY(hi), hz = hp.getZ(hi);
      var k = hy < 0 ? 1 + (hy / 0.044) * 0.45 : 1;
      hp.setXYZ(hi, hx * k * 0.95 + (hy < 0 ? 0.008 : 0), hy * 1.25, hz * k * 0.85);
    }
    heartGeo.computeVertexNormals();
    var heartMesh = tagOrgan(new THREE.Mesh(heartGeo, heartMat), "Jantung", "Sistem Kardiovaskular",
      "Memompa darah kaya oksigen melalui aorta ke seluruh tubuh dan darah rendah oksigen ke paru-paru.", 1.20, 0.72);
    heartMesh.position.set(0.016, 1.20, 0.032);
    heartMesh.rotation.z = 0.28;
    layers.cardio.add(heartMesh);

    // Pembuluh Darah Utama (Arteri merah & Vena biru) + Simpan kurva untuk partikel darah
    var artMat = track(new THREE.MeshPhysicalMaterial({ color: srgb("#d1242b"), roughness: 0.28, clearcoat: 0.85 }));
    var veinMat = track(new THREE.MeshPhysicalMaterial({ color: srgb("#2c54a3"), roughness: 0.32, clearcoat: 0.82 }));
    var bloodPaths = [];

    function addVessel(pts, r, mat, isAorta) {
      var c = new THREE.CatmullRomCurve3(pts);
      var m = new THREE.Mesh(track(new THREE.TubeGeometry(c, 32, r, 10, false)), mat);
      layers.cardio.add(m);
      bloodPaths.push(c);
      if (isAorta) {
        tagOrgan(m, "Aorta & Pembuluh Utama", "Sistem Kardiovaskular",
          "Pembuluh nadi utama yang mendistribusikan darah beroksigen dari ventrikel kiri ke seluruh tubuh.", 1.28, 0.9);
      }
      return m;
    }

    // Arkus Aorta & Aorta Desendens
    var aortaMesh = addVessel([
      new THREE.Vector3(0.014, 1.23, 0.03),
      new THREE.Vector3(0.01, 1.30, 0.025),
      new THREE.Vector3(0.025, 1.32, -0.005),
      new THREE.Vector3(0.012, 1.15, -0.018),
      new THREE.Vector3(0.008, 0.86, -0.015)
    ], 0.011, artMat, true);
    // Karotis ke kepala + Subklavia ke lengan + Iliaka/Femoralis ke kaki
    [-1, 1].forEach(function (side) {
      addVessel([
        new THREE.Vector3(0.005, 1.31, 0.01),
        new THREE.Vector3(side * 0.026, 1.44, 0.01),
        new THREE.Vector3(side * 0.03, 1.58, 0.01)
      ], 0.005, artMat, false);
      addVessel([
        new THREE.Vector3(0.01, 1.31, 0.01),
        new THREE.Vector3(side * 0.14, 1.35, 0.0),
        new THREE.Vector3(side * 0.21, 1.12, 0.01),
        new THREE.Vector3(side * 0.245, 0.84, 0.04)
      ], 0.005, artMat, false);
      addVessel([
        new THREE.Vector3(0.008, 0.86, -0.015),
        new THREE.Vector3(side * 0.082, 0.72, 0.0),
        new THREE.Vector3(side * 0.088, 0.18, 0.0)
      ], 0.006, artMat, false);
      // Vena Kava & Vena Tungkai/Lengan (biru)
      addVessel([
        new THREE.Vector3(side * 0.095, 0.18, 0.01),
        new THREE.Vector3(side * 0.075, 0.74, 0.01),
        new THREE.Vector3(-0.012, 0.88, -0.005),
        new THREE.Vector3(-0.015, 1.24, 0.015)
      ], 0.0065, veinMat, false);
    });

    // Partikel Aliran Darah (InstancedMesh: 72 butir cahaya mengalir sepanjang jalur arteri/vena)
    var bloodCount = 72;
    var bloodInst = new THREE.InstancedMesh(
      track(new THREE.SphereGeometry(0.0065, 8, 8)),
      track(new THREE.MeshBasicMaterial({ color: srgb("#ff9aa0") })),
      bloodCount
    );
    layers.cardio.add(bloodInst);

    // =========================================================================
    // 4. SISTEM PENCERNAAN (Hati, Lambung, Usus Besar & Usus Halus)
    // =========================================================================
    var liverMat = track(attachSss(new THREE.MeshPhysicalMaterial({
      color: srgb("#6e2226"), bumpMap: tex.organBump, bumpScale: 0.003,
      roughness: 0.22, clearcoat: 0.94, clearcoatRoughness: 0.12
    }), "#aa2c28"));
    var liverGeo = track(new THREE.SphereGeometry(0.056, 24, 18));
    liverGeo.scale(1.45, 0.75, 0.95);
    var liver = tagOrgan(new THREE.Mesh(liverGeo, liverMat), "Hati (Liver)", "Sistem Pencernaan",
      "Menetralkan racun, memproduksi empedu untuk mencerna lemak, dan mengatur metabolisme nutrisi.", 1.07, 0.75);
    liver.position.set(-0.042, 1.07, 0.036);
    liver.rotation.z = 0.22;
    layers.digestive.add(liver);

    var stomMat = track(attachSss(new THREE.MeshPhysicalMaterial({
      color: srgb("#c9736b"), bumpMap: tex.organBump, bumpScale: 0.004,
      roughness: 0.3, clearcoat: 0.85, clearcoatRoughness: 0.18
    }), "#ff9885"));
    var stomCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.015, 1.11, 0.025),
      new THREE.Vector3(0.058, 1.07, 0.032),
      new THREE.Vector3(0.048, 1.01, 0.038),
      new THREE.Vector3(0.01, 1.02, 0.03)
    ]);
    var stomach = tagOrgan(new THREE.Mesh(track(new THREE.TubeGeometry(stomCurve, 20, 0.028, 14, false)), stomMat),
      "Lambung (Stomach)", "Sistem Pencernaan",
      "Mencerna makanan secara mekanik dan kimiawi menggunakan asam lambung (HCl) dan enzim pepsin.", 1.05, 0.75);
    layers.digestive.add(stomach);

    // Usus Besar (frame melengkung) & Usus Halus (berkelok-kelok)
    var colonMat = track(attachSss(new THREE.MeshPhysicalMaterial({
      color: srgb("#b56c63"), roughness: 0.34, clearcoat: 0.78
    }), "#f29c8e"));
    var colonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.068, 0.89, 0.028),
      new THREE.Vector3(-0.072, 0.99, 0.034),
      new THREE.Vector3(0.0, 1.00, 0.042),
      new THREE.Vector3(0.072, 0.99, 0.034),
      new THREE.Vector3(0.068, 0.88, 0.028),
      new THREE.Vector3(0.01, 0.84, 0.015)
    ]);
    var colon = tagOrgan(new THREE.Mesh(track(new THREE.TubeGeometry(colonCurve, 36, 0.019, 12, false)), colonMat),
      "Usus Besar (Colon)", "Sistem Pencernaan",
      "Menyerap kembali air dan elektrolit serta membentuk sisa pencernaan sebelum dikeluarkan.", 0.94, 0.8);
    layers.digestive.add(colon);

    var smallPts = [];
    for (var sp = 0; sp <= 28; sp++) {
      var st = sp / 28;
      smallPts.push(new THREE.Vector3(
        Math.sin(st * Math.PI * 5) * 0.045,
        lerp(0.97, 0.87, st),
        0.036 + Math.cos(st * Math.PI * 6) * 0.012
      ));
    }
    var smallInt = tagOrgan(new THREE.Mesh(track(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smallPts), 48, 0.013, 10, false)), stomMat),
      "Usus Halus", "Sistem Pencernaan",
      "Menyerap sebagian besar nutrisi, vitamin, dan mineral dari makanan ke dalam aliran darah.", 0.92, 0.78);
    layers.digestive.add(smallInt);

    // =========================================================================
    // 5. SISTEM SARAF PUSAT (Otak Berlipat, Sumsum Tulang Belakang, Serabut Saraf & Impuls)
    // =========================================================================
    var brainMat = track(attachSss(new THREE.MeshPhysicalMaterial({
      color: srgb("#dfa7a4"), bumpMap: tex.brainBump, bumpScale: 0.008,
      roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.22
    }), "#ffd0c9"));
    var brain = tagOrgan(new THREE.Mesh(track(new THREE.SphereGeometry(0.064, 28, 22)), brainMat),
      "Otak (Cerebrum)", "Sistem Saraf Pusat",
      "Pusat kendali kesadaran, pikiran, memori, penglihatan, serta pengatur gerak dan fungsi organ tubuh.", 1.65, 0.7);
    brain.scale.set(0.88, 0.92, 1.08);
    brain.position.set(0, 1.655, 0.005);
    layers.nervous.add(brain);

    var nerveMat = track(new THREE.MeshBasicMaterial({ color: srgb("#63f2c2") }));
    var spinalPts = [
      new THREE.Vector3(0, 1.60, -0.02),
      new THREE.Vector3(0, 1.42, -0.038),
      new THREE.Vector3(0, 1.18, -0.042),
      new THREE.Vector3(0, 0.90, -0.032)
    ];
    var spinalCurve = new THREE.CatmullRomCurve3(spinalPts);
    var spinalCord = tagOrgan(new THREE.Mesh(track(new THREE.TubeGeometry(spinalCurve, 28, 0.0065, 8, false)), nerveMat),
      "Sumsum Tulang Belakang", "Sistem Saraf Pusat",
      "Menghantarkan sinyal listrik (impuls saraf) bolak-balik antara otak dan seluruh jaringan saraf tubuh.", 1.28, 0.95);
    layers.nervous.add(spinalCord);

    var nerveCurves = [spinalCurve];
    [-1, 1].forEach(function (side) {
      var armNerve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.38, -0.035),
        new THREE.Vector3(side * 0.14, 1.35, -0.01),
        new THREE.Vector3(side * 0.22, 1.12, 0.01),
        new THREE.Vector3(side * 0.25, 0.85, 0.04)
      ]);
      layers.nervous.add(new THREE.Mesh(track(new THREE.TubeGeometry(armNerve, 20, 0.0028, 6, false)), nerveMat));
      nerveCurves.push(armNerve);

      var legNerve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.90, -0.032),
        new THREE.Vector3(side * 0.078, 0.74, -0.01),
        new THREE.Vector3(side * 0.088, 0.20, 0.0)
      ]);
      layers.nervous.add(new THREE.Mesh(track(new THREE.TubeGeometry(legNerve, 20, 0.0032, 6, false)), nerveMat));
      nerveCurves.push(legNerve);
    });

    // Partikel Impuls Saraf Biolistrik (InstancedMesh)
    var impulseCount = 24;
    var impulseInst = new THREE.InstancedMesh(
      track(new THREE.SphereGeometry(0.0075, 8, 8)),
      track(new THREE.MeshBasicMaterial({ color: srgb("#d9fff2") })),
      impulseCount
    );
    layers.nervous.add(impulseInst);

    // =========================================================================
    // INTERAKSI: ORBIT DAMPING + RAYCASTER KLIK ORGAN (SMOOTH CAMERA LERP)
    // =========================================================================
    var dragging = false, pointerDownPos = { x: 0, y: 0 }, lastX = 0, lastY = 0;
    var rotY = 0, rotX = 0, velY = 0, velX = 0, idle = 0;
    var camTargetPos = defaultCamPos.clone(), camTargetLook = defaultTarget.clone();
    var currentLook = defaultTarget.clone();
    var raycaster = new THREE.Raycaster(), pointerNDC = new THREE.Vector2();
    var canvas = renderer.domElement;

    function onDown(e) {
      dragging = true;
      pointerDownPos.x = lastX = e.clientX;
      pointerDownPos.y = lastY = e.clientY;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    }
    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      velY = dx * 0.008; velX = dy * 0.005;
      rotY += velY; rotX = clamp(rotX + velX, -0.55, 0.55);
      idle = 0;
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = "";
      var moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moved < 5) pickOrgan(e);
    }
    function onWheel(e) {
      e.preventDefault();
      var dir = camTargetPos.clone().sub(camTargetLook);
      var dist = clamp(dir.length() + e.deltaY * 0.002, 0.55, 4.5);
      dir.setLength(dist);
      camTargetPos.copy(camTargetLook).add(dir);
    }

    function pickOrgan(e) {
      var r = canvas.getBoundingClientRect();
      pointerNDC.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointerNDC.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      var visibleTargets = clickables.filter(function (o) {
        var cur = o;
        while (cur) { if (!cur.visible) return false; cur = cur.parent; }
        return true;
      });
      var hits = raycaster.intersectObjects(visibleTargets, false);
      if (hits.length > 0) {
        var info = hits[0].object.userData.organInfo;
        if (info) {
          camTargetLook.set(0, info.focusY, 0);
          camTargetPos.set(0, info.focusY + 0.04, info.focusDist);
          if (opts.onOrganSelect) opts.onOrganSelect(info);
        }
      } else {
        if (opts.onOrganSelect) opts.onOrganSelect(null);
      }
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerup", onUp);

    // ---- Ukuran & Framing Responsif ----
    var W = 1, Hh = 1;
    function resize() {
      W = Math.max(1, stage.clientWidth); Hh = Math.max(1, stage.clientHeight);
      renderer.setSize(W, Hh, false);
      camera.aspect = W / Hh;
      var mobile = window.innerWidth <= 900;
      var topR = mobile ? 14 : (opts.reserveTop || 0);
      var botR = mobile ? 6 : (opts.reserveBottom && opts.reserveBottom.offsetParent !== null ? opts.reserveBottom.offsetHeight + 16 : 0);
      var freeH = Math.max(Hh * 0.45, Hh - topR - botR);
      var frac = freeH / Hh;
      var tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      var fitZ = 1.85 / (2 * tanH * frac);
      defaultCamPos.set(0, 0.92, Math.max(fitZ, 2.75));
      if (camTargetLook.distanceTo(defaultTarget) < 0.05) {
        camTargetPos.copy(defaultCamPos);
      }
      var shift = (botR - topR) / 2;
      camera.setViewOffset(W, Hh, 0, shift, W, Hh);
      camera.updateProjectionMatrix();
    }
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(stage); else window.addEventListener("resize", resize);

    // ---- Loop Animasi Fisiologis ----
    var speed = 1.0, paused = false, explode = 0, targetExplode = 0;
    var clock = new THREE.Clock(), raf = 0, alive = true, tAll = 0;
    var tmpVec = new THREE.Vector3(), tmpMat = new THREE.Matrix4();
    resize();

    function frame() {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!paused) tAll += dt * speed * (reduce ? 0.5 : 1);

      // 1. Pernapasan (Respiration ~15 napas/menit)
      var breath = (Math.sin(tAll * 1.55) + 1) * 0.5;
      lungRGroup.scale.set(1 + breath * 0.085, 1 + breath * 0.05, 1 + breath * 0.09);
      lungLGroup.scale.set(1 + breath * 0.085, 1 + breath * 0.05, 1 + breath * 0.09);
      updateRibs(breath);

      // 2. Detak Jantung "Lub-Dub" (~72 bpm saat speed=1) + denyut aorta + aliran darah
      var hbPhase = (tAll * 1.2) % 1;
      var beat = heartLubDub(hbPhase);
      heartMesh.scale.set(1 + beat * 0.14, 1 - beat * 0.05, 1 + beat * 0.14);
      aortaMesh.scale.setScalar(1 + pulse(hbPhase, 0.28, 0.07) * 0.035);
      if (opts.bpmEl) opts.bpmEl.textContent = Math.round(72 * speed);
      if (opts.bpmMobEl) opts.bpmMobEl.textContent = Math.round(72 * speed);
      if (opts.glowEl) opts.glowEl.style.setProperty("--beat", beat.toFixed(3));

      for (var bi = 0; bi < bloodCount; bi++) {
        var path = bloodPaths[bi % bloodPaths.length];
        var bu = ((bi / bloodCount) * 3.7 + tAll * 0.42) % 1;
        path.getPointAt(bu, tmpVec);
        tmpMat.makeTranslation(tmpVec.x, tmpVec.y, tmpVec.z);
        bloodInst.setMatrixAt(bi, tmpMat);
      }
      bloodInst.instanceMatrix.needsUpdate = true;

      // 3. Impuls Saraf Biolistrik
      for (var ni = 0; ni < impulseCount; ni++) {
        var nc = nerveCurves[ni % nerveCurves.length];
        var nu = ((ni / impulseCount) * 2.1 + tAll * 0.95) % 1;
        nc.getPointAt(nu, tmpVec);
        tmpMat.makeTranslation(tmpVec.x, tmpVec.y, tmpVec.z);
        impulseInst.setMatrixAt(ni, tmpMat);
      }
      impulseInst.instanceMatrix.needsUpdate = true;

      // 4. Exploded View radial smooth
      explode = lerp(explode, targetExplode, 0.12);
      layers.skin.position.set(0, 0, -explode * 0.22);
      layers.skeleton.position.set(-explode * 0.24, 0, -explode * 0.05);
      layers.cardio.position.set(0, 0, explode * 0.16);
      layers.digestive.position.set(explode * 0.22, -explode * 0.04, explode * 0.12);
      layers.nervous.position.set(0, explode * 0.12, -explode * 0.18);

      // 5. Idle Living Posture & Orbit Damping & Smooth Camera Lerp
      if (!dragging) {
        idle += dt; velY *= 0.92; velX *= 0.92;
        rotY += velY; rotX = clamp(rotX + velX, -0.55, 0.55);
        if (!paused && idle > 1.8) rotY += dt * (reduce ? 0.04 : 0.16);
      }
      bodyRoot.rotation.y = rotY;
      bodyRoot.rotation.x = rotX + Math.sin(tAll * 0.7) * 0.015;
      bodyRoot.position.y = Math.sin(tAll * 1.1) * 0.008;

      camera.position.lerp(camTargetPos, 0.09);
      currentLook.lerp(camTargetLook, 0.09);
      camera.lookAt(currentLook);

      renderer.render(scene, camera);
    }
    frame();

    // ---- API Kontrol ----
    function setLayer(name, visible) {
      if (layers[name]) layers[name].visible = !!visible;
    }
    function setExplode(val) {
      targetExplode = clamp(Number(val) || 0, 0, 1);
    }
    function setSpeed(val) {
      speed = clamp(Number(val) || 1, 0.4, 2.5);
      return speed;
    }
    function togglePlay() {
      paused = !paused;
      return !paused;
    }
    function resetCamera() {
      rotY = 0; rotX = 0; velY = 0; velX = 0; idle = 0;
      camTargetLook.copy(defaultTarget);
      camTargetPos.copy(defaultCamPos);
      if (opts.onOrganSelect) opts.onOrganSelect(null);
    }
    function destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("wheel", onWheel);
      disposables.forEach(function (d) { try { d.dispose(); } catch (e) {} });
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    return {
      destroy: destroy,
      setLayer: setLayer,
      setExplode: setExplode,
      setSpeed: setSpeed,
      togglePlay: togglePlay,
      resetCamera: resetCamera
    };
  }

  function fallback(stage) {
    stage.innerHTML = '<div class="heart-fallback"><p class="tiny">Anatomi 3D memerlukan WebGL.</p></div>';
    return {
      destroy: function () { stage.innerHTML = ""; },
      setLayer: function () {},
      setExplode: function () {},
      setSpeed: function () { return 1; },
      togglePlay: function () { return true; },
      resetCamera: function () {}
    };
  }

  window.Anatomy3D = { mount: mount };
})();
