/* js/heart3d.js — Jantung 3D anatomis prosedural (Three.js r128) dengan Custom Vertex/Fragment Shader:
   - Siklus kardiak "Lub-Dub" berbasis vertex shader (Atrial Systole, Ventricular Systole twisting+shortening, Aortic Pulse).
   - PBR MeshPhysicalMaterial (clearcoat basah, subsurface scattering wrap shader, albedo + normal + roughness map prosedural).
   - Anatomi lengkap: ventrikel kiri/kanan asimetris, atrium & aurikel, arkus aorta + 3 cabang, a. pulmonalis bercabang dua,
     vena kava superior & inferior, vena pulmonalis, lemak epikardial di sulkus, dan jaringan koroner meruncing.
   - Kontrol interaktif: orbit damping (drag + zoom), slider BPM (40-180), Pause/Play, Reset Kamera, Wireframe Anatomi. */
(function () {
  "use strict";

  // ---------- util matematika & noise 3D ----------
  function hash(x, y, z) {
    var h = x * 374761393 + y * 668265263 + z * 2147483647;
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return (h & 0xffff) / 0xffff;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, mn, mx) { return v < mn ? mn : (v > mx ? mx : v); }
  function noise3(x, y, z) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
    var c000 = hash(xi, yi, zi), c100 = hash(xi + 1, yi, zi), c010 = hash(xi, yi + 1, zi), c110 = hash(xi + 1, yi + 1, zi);
    var c001 = hash(xi, yi, zi + 1), c101 = hash(xi + 1, yi, zi + 1), c011 = hash(xi, yi + 1, zi + 1), c111 = hash(xi + 1, yi + 1, zi + 1);
    var x00 = lerp(c000, c100, xf), x10 = lerp(c010, c110, xf), x01 = lerp(c001, c101, xf), x11 = lerp(c011, c111, xf);
    return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf) * 2 - 1;
  }
  function fbm(x, y, z) {
    return noise3(x, y, z) * 0.58 + noise3(x * 2.3, y * 2.3, z * 2.3) * 0.28 + noise3(x * 5.2, y * 5.2, z * 5.2) * 0.14;
  }

  // ---------- geometri ventrikel asimetris & organik ----------
  function taper(y) {
    if (y < -0.1) {
      var t = clamp((-0.1 - y) / 0.9, 0, 1);
      return Math.max(0.24, 1 - Math.pow(t, 1.45) * 0.72);
    }
    return 1 + y * 0.05;
  }

  function heartShape(x, y, z, out) {
    var k = taper(y);
    // ventrikel kiri lebih tebal & membulat; apeks miring ke kiri anatomis (+x pada tampak anterior)
    var apexShift = y < 0 ? Math.pow(-y, 1.35) * 0.16 : 0;
    var lvBulge = x > 0 ? 1 + Math.max(0, x) * 0.14 : 1;
    var px = x * k * lvBulge + apexShift;
    var py = y * 1.18 * (y < 0 ? 1 + (-y) * 0.08 : 1);
    var pz = z * k * (z < 0 ? 0.8 : 1.05);

    // sulkus interventrikularis anterior & posterior
    var gx = (px - apexShift * 0.4) - (0.13 + 0.24 * y);
    var front = Math.max(0, z);
    var back = Math.max(0, -z);
    var grooveA = Math.exp(-(gx * gx) / 0.007) * front * 0.05;
    var grooveP = Math.exp(-Math.pow(px + 0.05, 2) / 0.009) * back * 0.038;
    var avGroove = Math.exp(-Math.pow(y - 0.54, 2) / 0.005) * 0.036;

    // tonjolan conus arteriosus (infundibulum ventrikel kanan)
    var conus = Math.exp(-Math.pow(px + 0.12, 2) / 0.14 - Math.pow(py - 0.52, 2) / 0.12) * front * 0.11;

    var n = fbm(x * 2.2 + 3.1, y * 2.2, z * 2.2) * 0.024 + noise3(x * 10, y * 10, z * 10) * 0.005;
    var r = 1 - grooveA - grooveP - avGroove + conus + n;
    out[0] = px * r;
    out[1] = py * r;
    out[2] = pz * r;

    // peta lemak epikardial kekuningan di sepanjang alur sulkus
    var sulkusFat = Math.exp(-(gx * gx) / 0.026) * Math.pow(front, 0.7) + Math.exp(-Math.pow(px + 0.05, 2) / 0.022) * Math.pow(back, 0.7) * 0.75;
    var topFat = Math.exp(-Math.pow(y - 0.68, 2) / 0.04) * clamp((0.6 - px) * 1.1, 0, 1);
    var avFat = Math.exp(-Math.pow(y - 0.54, 2) / 0.014);
    return {
      fat: clamp(sulkusFat * 0.85 + topFat * 0.7 + avFat * 0.65, 0, 1)
    };
  }

  // ---------- tekstur prosedural (Albedo, Normal Map, Roughness Map) ----------
  function buildProceduralMaps() {
    var S = 512;
    // 1. Heightmap serat otot & kapiler untuk normal map + roughness map
    var hBuf = new Float32Array(S * S);
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var u = x / S, v = y / S;
        var diag = Math.sin((u * 26 + v * 18) * Math.PI * 2 + noise3(u * 8, v * 8, 1.2) * 2.4) * 0.35;
        var micro = noise3(u * 38, v * 38, 4.7) * 0.3 + noise3(u * 90, v * 90, 9.1) * 0.15;
        hBuf[y * S + x] = 0.5 + diag * 0.25 + micro * 0.35;
      }
    }

    // Albedo Map (merah marun tua otot + jaringan kapiler halus)
    var cAlb = document.createElement("canvas");
    cAlb.width = cAlb.height = S;
    var gA = cAlb.getContext("2d");
    gA.fillStyle = "#8a1c22";
    gA.fillRect(0, 0, S, S);
    for (var i = 0; i < 1800; i++) {
      var ax = Math.random() * S, ay = Math.random() * S, len = 24 + Math.random() * 80;
      var ang = -0.82 + Math.random() * 0.3;
      gA.strokeStyle = Math.random() < 0.5 ? "rgba(110,16,24,0.28)" : "rgba(165,48,52,0.22)";
      gA.lineWidth = 0.6 + Math.random() * 1.4;
      gA.beginPath();
      gA.moveTo(ax, ay);
      gA.quadraticCurveTo(ax + Math.cos(ang) * len * 0.5 + 4, ay + Math.sin(ang) * len * 0.5, ax + Math.cos(ang) * len, ay + Math.sin(ang) * len);
      gA.stroke();
    }
    // Jaringan kapiler halus merah cerah & biru keunguan
    for (var k = 0; k < 220; k++) {
      var cx = Math.random() * S, cy = Math.random() * S;
      gA.strokeStyle = Math.random() < 0.65 ? "rgba(195,40,48,0.25)" : "rgba(72,64,142,0.22)";
      gA.lineWidth = 0.5 + Math.random() * 0.7;
      gA.beginPath();
      gA.moveTo(cx, cy);
      for (var s = 0; s < 4; s++) {
        cx += (Math.random() - 0.5) * 28;
        cy += (Math.random() - 0.5) * 28;
        gA.lineTo(cx, cy);
      }
      gA.stroke();
    }

    // Normal Map (Sobel dari hBuf)
    var cNorm = document.createElement("canvas");
    cNorm.width = cNorm.height = S;
    var gN = cNorm.getContext("2d");
    var imgN = gN.createImageData(S, S);
    var strength = 3.2;
    for (var ny = 0; ny < S; ny++) {
      for (var nx = 0; nx < S; nx++) {
        var xm = (nx - 1 + S) % S, xp = (nx + 1) % S;
        var ym = (ny - 1 + S) % S, yp = (ny + 1) % S;
        var dx = (hBuf[ny * S + xp] - hBuf[ny * S + xm]) * strength;
        var dy = (hBuf[yp * S + nx] - hBuf[ym * S + nx]) * strength;
        var dz = 1.0;
        var il = 1 / Math.sqrt(dx * dx + dy * dy + dz * dz);
        var idx = (ny * S + nx) * 4;
        imgN.data[idx] = Math.round((-dx * il * 0.5 + 0.5) * 255);
        imgN.data[idx + 1] = Math.round((-dy * il * 0.5 + 0.5) * 255);
        imgN.data[idx + 2] = Math.round((dz * il * 0.5 + 0.5) * 255);
        imgN.data[idx + 3] = 255;
      }
    }
    gN.putImageData(imgN, 0, 0);

    // Roughness Map (permukaan basah licin bervariasi)
    var cRough = document.createElement("canvas");
    cRough.width = cRough.height = S;
    var gR = cRough.getContext("2d");
    var imgR = gR.createImageData(S, S);
    for (var ry = 0; ry < S; ry++) {
      for (var rx = 0; rx < S; rx++) {
        var hv = hBuf[ry * S + rx];
        var rv = Math.round(clamp(0.18 + hv * 0.34, 0.12, 0.58) * 255);
        var idxR = (ry * S + rx) * 4;
        imgR.data[idxR] = imgR.data[idxR + 1] = imgR.data[idxR + 2] = rv;
        imgR.data[idxR + 3] = 255;
      }
    }
    gR.putImageData(imgR, 0, 0);

    function toTex(canvas, isSRGB) {
      var t = new THREE.CanvasTexture(canvas);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(3, 2);
      if (isSRGB) t.encoding = THREE.sRGBEncoding;
      return t;
    }

    return {
      albedo: toTex(cAlb, true),
      normal: toTex(cNorm, false),
      roughness: toTex(cRough, false)
    };
  }

  function dotTexture() {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.3, "rgba(255,255,255,.55)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  // ---------- Environment Map prosedural (PMREMGenerator) ----------
  function buildEnv(renderer) {
    var env = new THREE.Scene();
    var sky = new THREE.Mesh(
      new THREE.SphereGeometry(20, 32, 16),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })
    );
    var pos = sky.geometry.attributes.position, cols = [];
    var top = new THREE.Color("#3b6456"), bot = new THREE.Color("#06130e");
    for (var i = 0; i < pos.count; i++) {
      var t = (pos.getY(i) / 20 + 1) / 2, c = bot.clone().lerp(top, t);
      cols.push(c.r, c.g, c.b);
    }
    sky.geometry.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    env.add(sky);
    function box(w, h, x, y, z, col) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    }
    box(11, 7, -6, 8, 8, "#fff5eb");
    box(6, 10, 12, 2, -4, "#8be8c2");
    box(8, 5, -10, -2, -8, "#ff9d92");
    var pm = new THREE.PMREMGenerator(renderer);
    var rt = pm.fromScene(env, 0.04);
    pm.dispose();
    return rt;
  }

  // ---------- geometri tabung meruncing / flared ----------
  function buildTaperedTube(curve, segs, radFn, radialSegs) {
    radialSegs = radialSegs || 12;
    var frames = curve.computeFrenetFrames(segs, false);
    var pts = curve.getPoints(segs);
    var positions = [], normals = [], uvs = [], indices = [];
    var P = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), v = new THREE.Vector3();
    for (var i = 0; i <= segs; i++) {
      var u = i / segs;
      var r = radFn(u);
      P.copy(pts[i]); N.copy(frames.normals[i]); B.copy(frames.binormals[i]);
      for (var j = 0; j <= radialSegs; j++) {
        var theta = (j / radialSegs) * Math.PI * 2;
        var sin = Math.sin(theta), cos = -Math.cos(theta);
        v.x = cos * N.x + sin * B.x;
        v.y = cos * N.y + sin * B.y;
        v.z = cos * N.z + sin * B.z;
        v.normalize();
        normals.push(v.x, v.y, v.z);
        uvs.push(j / radialSegs, u);
        positions.push(P.x + r * v.x, P.y + r * v.y, P.z + r * v.z);
      }
    }
    for (var i2 = 0; i2 < segs; i2++) {
      for (var j2 = 0; j2 < radialSegs; j2++) {
        var a = (radialSegs + 1) * i2 + j2;
        var b = (radialSegs + 1) * (i2 + 1) + j2;
        var c = (radialSegs + 1) * (i2 + 1) + (j2 + 1);
        var d = (radialSegs + 1) * i2 + (j2 + 1);
        indices.push(a, b, d, b, c, d);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    return g;
  }

  // ---------- Custom Shader (Vertex Cardiac Deformation + Fragment Subsurface Scattering) ----------
  function attachCardiacShader(material, uniforms, role) {
    // role: "ventricle" | "atria" | "aorta" | "vessel"
    material.onBeforeCompile = function (shader) {
      shader.uniforms.uAtrial = uniforms.uAtrial;
      shader.uniforms.uVent = uniforms.uVent;
      shader.uniforms.uAorta = uniforms.uAorta;
      shader.uniforms.uSssColor = uniforms.uSssColor;

      shader.vertexShader =
        "uniform float uAtrial;\nuniform float uVent;\nuniform float uAorta;\n" +
        shader.vertexShader;

      var deformCode = "";
      if (role === "ventricle") {
        // Kontraksi Ventrikel ("Lub"): radial squeeze + twisting motion + memendek ke atas
        deformCode =
          "float yNorm = clamp((0.6 - transformed.y) / 1.8, 0.0, 1.0);\n" +
          "float twist = uVent * 0.22 * yNorm;\n" +
          "float cs = cos(twist); float sn = sin(twist);\n" +
          "float rx = transformed.x * cs - transformed.z * sn;\n" +
          "float rz = transformed.x * sn + transformed.z * cs;\n" +
          "float squeeze = 1.0 - uVent * (0.095 * sin(yNorm * 2.5));\n" +
          "transformed.x = rx * squeeze;\n" +
          "transformed.z = rz * squeeze;\n" +
          "transformed.y += uVent * 0.09 * yNorm;\n";
      } else if (role === "atria") {
        // Kontraksi Atrium (Atrial Systole): mengempis dan mendorong darah ke bawah
        deformCode =
          "float aSqueeze = 1.0 - uAtrial * 0.085;\n" +
          "transformed.x *= aSqueeze;\n" +
          "transformed.z *= aSqueeze;\n" +
          "transformed.y -= uAtrial * 0.045;\n";
      } else if (role === "aorta") {
        // Denyut ekspansi aorta akibat ejeksi darah ("Dub" / pasca-sistol)
        deformCode =
          "transformed += objectNormal * (uAorta * 0.022);\n";
      } else {
        deformCode =
          "transformed += objectNormal * (uAorta * 0.008);\n";
      }

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n" + deformCode
      );

      // Subsurface Scattering wrap-lighting hangat pada fragment shader
      shader.fragmentShader =
        "uniform vec3 uSssColor;\n" +
        shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        "float sssRim = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 2.2);\n" +
        "gl_FragColor.rgb += uSssColor * sssRim * 0.24;\n" +
        "#include <dithering_fragment>"
      );
    };
    material.customProgramCacheKey = function () { return "cardiac_" + role; };
    return material;
  }

  // ---------- kurva fisiologis siklus kardiak & EKG ----------
  function pulse(p, c, w) { var d = (p - c) / w; return Math.exp(-d * d); }
  function atrBeat(p) { return pulse(p, 0.07, 0.045); }
  function ventBeat(p) { return pulse(p, 0.2, 0.05) + pulse(p, 0.34, 0.055) * 0.38; }
  function aortaPulse(p) { return pulse(p, 0.28, 0.07) + pulse(p, 0.44, 0.06) * 0.3; }
  function ecg(p) {
    return pulse(p, 0.05, 0.022) * 0.13 - pulse(p, 0.135, 0.008) * 0.13 + pulse(p, 0.155, 0.009) * 1.0 -
      pulse(p, 0.175, 0.009) * 0.26 + pulse(p, 0.42, 0.04) * 0.25;
  }

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
    renderer.toneMappingExposure = 1.08;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.2, 9.5);
    var envRT = buildEnv(renderer);
    scene.environment = envRT.texture;

    var disposables = [envRT];
    function track(o) { disposables.push(o); return o; }
    function srgb(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }

    // ---- Three-Point Lighting Studio Medis ----
    scene.add(new THREE.HemisphereLight(0xfff1e8, 0x082319, 0.45));
    var keyLight = new THREE.DirectionalLight(0xfff0e4, 1.75); // key light hangat
    keyLight.position.set(-3.6, 4.8, 5.5);
    scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0x6de3c0, 1.55); // rim light dingin untuk kontur basah
    rimLight.position.set(4.8, 2.2, -4.2);
    scene.add(rimLight);
    var fillLight = new THREE.DirectionalLight(0xff9c8e, 0.65); // fill light lembut
    fillLight.position.set(-4.2, -1.5, 2.5);
    scene.add(fillLight);

    // ---- Uniforms Shader Siklus Kardiak ----
    var shaderUniforms = {
      uAtrial: { value: 0 },
      uVent: { value: 0 },
      uAorta: { value: 0 },
      uSssColor: { value: srgb("#ff4030") }
    };

    var root = new THREE.Group();
    scene.add(root);
    var tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = 0.22;
    tiltGroup.rotation.y = -0.1;
    root.add(tiltGroup);

    // ---- Tekstur PBR Prosedural ----
    var maps = buildProceduralMaps();
    track(maps.albedo); track(maps.normal); track(maps.roughness);

    var allMaterials = [];
    function regMat(m) { track(m); allMaterials.push(m); return m; }

    // ---- Ventrikel (Miokardium + Lemak Epikardial kekuningan) ----
    var vGeo = track(new THREE.SphereGeometry(1, 160, 120));
    var pos = vGeo.attributes.position, colors = [];
    var cMuscle = srgb("#ffffff"), cMuscleDeep = srgb("#c69898"), cFat = srgb("#f2dc9b"), tmp = [0, 0, 0], col = new THREE.Color();
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var f = heartShape(x, y, z, tmp);
      pos.setXYZ(i, tmp[0], tmp[1], tmp[2]);
      var nv = (fbm(x * 3.2, y * 3.2, z * 3.2) + 1) / 2;
      col.copy(cMuscle).lerp(cMuscleDeep, nv * 0.45);
      col.lerp(cFat, clamp(f.fat * (0.7 + nv * 0.3), 0, 0.9));
      colors.push(col.r, col.g, col.b);
    }
    vGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    vGeo.computeVertexNormals();

    var muscleMat = regMat(attachCardiacShader(new THREE.MeshPhysicalMaterial({
      map: maps.albedo,
      normalMap: maps.normal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: maps.roughness,
      vertexColors: true,
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 0.92,
      clearcoatRoughness: 0.14,
      envMapIntensity: 0.95,
      emissive: srgb("#2b0406"),
      emissiveIntensity: 0.12
    }), shaderUniforms, "ventricle"));

    var ventricle = new THREE.Mesh(vGeo, muscleMat);
    tiltGroup.add(ventricle);

    // ---- Atrium Kanan, Atrium Kiri & Aurikel ----
    function organicBlob(rad, sx, sy, sz, cTop, cBot, seed, scallop) {
      var g = track(new THREE.SphereGeometry(rad, 64, 48)), p = g.attributes.position, cols = [];
      var colA = srgb(cTop), colB = srgb(cBot), cTmp = new THREE.Color();
      for (var k = 0; k < p.count; k++) {
        var ax = p.getX(k), ay = p.getY(k), az = p.getZ(k);
        var sc = scallop ? Math.sin(ax * 14 + ay * 6) * 0.048 : 0;
        var n = 1 + fbm(ax * 3 + seed, ay * 3, az * 3) * 0.1 + sc;
        p.setXYZ(k, ax * sx * n, ay * sy * n, az * sz * n);
        var grad = clamp((ay / rad + 1) * 0.5, 0, 1);
        cTmp.copy(colB).lerp(colA, grad);
        cols.push(cTmp.r, cTmp.g, cTmp.b);
      }
      g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      g.computeVertexNormals();
      var m = regMat(attachCardiacShader(new THREE.MeshPhysicalMaterial({
        normalMap: maps.normal,
        normalScale: new THREE.Vector2(0.65, 0.65),
        roughnessMap: maps.roughness,
        vertexColors: true,
        roughness: 0.3,
        clearcoat: 0.88,
        clearcoatRoughness: 0.16,
        envMapIntensity: 0.9,
        emissive: srgb("#240508"),
        emissiveIntensity: 0.1
      }), shaderUniforms, "atria"));
      return new THREE.Mesh(g, m);
    }

    var atria = new THREE.Group();
    tiltGroup.add(atria);
    var ra = organicBlob(0.42, 0.92, 1.22, 0.88, "#8c3b46", "#64222c", 1.7, false);
    ra.position.set(-0.74, 0.62, -0.02);
    ra.rotation.z = -0.18;
    atria.add(ra);

    var la = organicBlob(0.42, 1.05, 0.85, 0.85, "#9c3c40", "#76242a", 4.2, false);
    la.position.set(0.32, 0.68, -0.45);
    atria.add(la);

    var rAur = organicBlob(0.22, 1.25, 0.72, 0.58, "#8e343c", "#691d26", 6.4, true);
    rAur.position.set(-0.46, 0.84, 0.42);
    rAur.rotation.z = 0.48;
    atria.add(rAur);

    var lAur = organicBlob(0.25, 1.12, 0.88, 0.68, "#86262c", "#5e151a", 9.1, true);
    lAur.position.set(0.46, 0.72, 0.46);
    lAur.rotation.set(0.15, 0.25, -0.52);
    atria.add(lAur);

    // ---- Pembuluh Darah Besar (kaya oksigen vs rendah oksigen + ujung lumen berlubang) ----
    function H(x, y, z) { var v = new THREE.Vector3(x, y, z); v.applyEuler(tiltGroup.rotation); return v; }
    function V(x, y, z) { return new THREE.Vector3(x, y, z); }

    function makeVesselMat(hex, role) {
      return regMat(attachCardiacShader(new THREE.MeshPhysicalMaterial({
        color: srgb(hex),
        normalMap: maps.normal,
        normalScale: new THREE.Vector2(0.35, 0.35),
        roughness: 0.28,
        clearcoat: 0.86,
        clearcoatRoughness: 0.16,
        envMapIntensity: 0.95
      }), shaderUniforms, role));
    }

    var aortaMat = makeVesselMat("#c94c52", "aorta");     // arteri kaya oksigen
    var pulmMat = makeVesselMat("#5a5fa6", "vessel");     // arteri pulmonalis (rendah oksigen)
    var venaMat = makeVesselMat("#445299", "vessel");     // vena kava (rendah oksigen)
    var pulmVeinMat = makeVesselMat("#bf444b", "vessel"); // vena pulmonalis (kaya oksigen)
    var lumenMat = regMat(new THREE.MeshBasicMaterial({ color: srgb("#290a0d") }));

    var vessels = new THREE.Group();
    root.add(vessels);

    function hollowVessel(points, radFn, mat, segs) {
      var curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
      var g = track(buildTaperedTube(curve, segs || 64, radFn, 28));
      var m = new THREE.Mesh(g, mat);
      vessels.add(m);

      var rEnd = radFn(1);
      var end = curve.getPoint(1), tan = curve.getTangent(1);
      var lip = new THREE.Mesh(track(new THREE.TorusGeometry(rEnd * 0.86, rEnd * 0.14, 12, 28)), mat);
      lip.position.copy(end);
      lip.lookAt(end.clone().add(tan));
      vessels.add(lip);

      var hole = new THREE.Mesh(track(new THREE.CircleGeometry(rEnd * 0.74, 24)), lumenMat);
      hole.position.copy(end).addScaledVector(tan, -rEnd * 0.08);
      hole.lookAt(end.clone().add(tan));
      vessels.add(hole);

      return { mesh: m, curve: curve };
    }

    // Arkus Aorta + 3 cabang atas (brachiocephalic, left common carotid, left subclavian)
    var aorta = hollowVessel([
      H(-0.08, 0.52, 0.02),
      V(-0.22, 1.25, 0.08),
      V(-0.14, 1.86, 0.02),
      V(0.24, 2.04, -0.18),
      V(0.56, 1.78, -0.4),
      V(0.66, 1.15, -0.56)
    ], function (u) {
      return 0.23 * (1 - 0.12 * u) + Math.exp(-u * 6) * 0.05;
    }, aortaMat, 80);

    hollowVessel([V(-0.18, 1.74, 0.04), V(-0.26, 2.16, 0.06), V(-0.34, 2.52, 0.08)], function (u) {
      return 0.095 + Math.pow(1 - u, 3) * 0.05;
    }, aortaMat, 32);
    hollowVessel([V(0.06, 1.96, -0.08), V(0.07, 2.3, -0.08), V(0.09, 2.6, -0.08)], function (u) {
      return 0.08 + Math.pow(1 - u, 3) * 0.04;
    }, aortaMat, 32);
    hollowVessel([V(0.28, 1.92, -0.22), V(0.32, 2.26, -0.24), V(0.36, 2.54, -0.25)], function (u) {
      return 0.074 + Math.pow(1 - u, 3) * 0.036;
    }, aortaMat, 32);

    // Batang Pulmonalis bercabang DUA (arteri pulmonalis kiri & kanan)
    var pulm = hollowVessel([
      H(0.02, 0.62, 0.42),
      V(-0.02, 1.06, 0.34),
      V(0.26, 1.26, 0.16),
      V(0.68, 1.26, 0.04),
      V(1.06, 1.2, -0.04)
    ], function (u) {
      return 0.2 * (1 - 0.22 * u) + Math.exp(-u * 5) * 0.07;
    }, pulmMat, 64);
    hollowVessel([
      V(0.24, 1.24, 0.16),
      V(-0.14, 1.22, -0.14),
      V(-0.62, 1.18, -0.28)
    ], function (u) {
      return 0.14 * (1 - 0.15 * u) + Math.pow(1 - u, 2) * 0.03;
    }, pulmMat, 36);

    // Vena Kava Superior (bercabang Y) & Vena Kava Inferior
    hollowVessel([
      H(-0.68, 0.72, 0.02),
      V(-0.74, 1.38, 0.04),
      V(-0.75, 1.95, 0.04),
      V(-0.76, 2.46, 0.04)
    ], function (u) {
      return 0.17 + Math.pow(1 - u, 2.5) * 0.065;
    }, venaMat, 44);
    hollowVessel([
      V(-0.72, 1.72, 0.06),
      V(-0.58, 2.02, 0.1),
      V(-0.46, 2.34, 0.14)
    ], function (u) {
      return 0.11 + Math.pow(1 - u, 2.5) * 0.04;
    }, venaMat, 32);
    hollowVessel([
      H(-0.68, 0.18, -0.12),
      V(-0.72, -0.25, -0.16),
      V(-0.74, -0.68, -0.18)
    ], function (u) {
      return 0.175 + Math.pow(1 - u, 2) * 0.02;
    }, venaMat, 28);

    // Vena Pulmonalis (kiri & kanan)
    hollowVessel([H(0.45, 0.68, -0.32), V(0.84, 0.74, -0.22), V(1.1, 0.76, -0.16)], function (u) {
      return 0.09 + Math.pow(1 - u, 2) * 0.02;
    }, pulmVeinMat, 24);
    hollowVessel([H(0.48, 0.46, -0.32), V(0.84, 0.48, -0.24), V(1.08, 0.49, -0.18)], function (u) {
      return 0.085 + Math.pow(1 - u, 2) * 0.02;
    }, pulmVeinMat, 24);

    // ---- Jaringan Arteri & Vena Koroner (menempel di kontur permukaan, ikut deformasi ventrikel) ----
    function surf(x, y, z, lift) {
      var l = Math.sqrt(x * x + y * y + z * z);
      x /= l; y /= l; z /= l;
      heartShape(x, y, z, tmp);
      return new THREE.Vector3(tmp[0] * lift, tmp[1] * lift, tmp[2] * lift);
    }
    function frontPt(xs, y, lift) {
      var zz = Math.sqrt(Math.max(0.02, 1 - xs * xs - y * y));
      return surf(xs, y, zz, lift || 1.008);
    }
    var coroArtMat = regMat(attachCardiacShader(new THREE.MeshPhysicalMaterial({
      color: srgb("#d9232b"), roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.15
    }), shaderUniforms, "ventricle"));
    var coroVeinMat = regMat(attachCardiacShader(new THREE.MeshPhysicalMaterial({
      color: srgb("#2c549c"), roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.18
    }), shaderUniforms, "ventricle"));

    function vesselBranch(pts, rStart, rEnd, mat, segs) {
      var curve = new THREE.CatmullRomCurve3(pts);
      var g = track(buildTaperedTube(curve, segs || 40, function (u) { return lerp(rStart, rEnd, u); }, 8));
      ventricle.add(new THREE.Mesh(g, mat));
    }

    var ladPts = [], gcvPts = [];
    for (var yy = 0.56; yy >= -0.92; yy -= 0.08) {
      var xs = (0.13 + 0.24 * yy) / taper(yy);
      var wob = Math.sin(yy * 11) * 0.022;
      ladPts.push(frontPt(xs + wob, yy, 1.01));
      gcvPts.push(frontPt(xs + 0.065 - wob * 0.7, yy + 0.02, 1.009));
    }
    vesselBranch(ladPts, 0.025, 0.005, coroArtMat, 56);
    vesselBranch(gcvPts, 0.021, 0.004, coroVeinMat, 56);

    [
      [0.44, 0.22, 0.32, -0.05, 0.017, 0.003, coroArtMat],
      [0.24, 0.18, 0.36, -0.32, 0.015, 0.0025, coroArtMat],
      [0.02, 0.12, 0.28, -0.58, 0.013, 0.002, coroArtMat],
      [0.46, 0.34, 0.22, 0.16, 0.014, 0.0025, coroVeinMat],
      [0.32, 0.28, 0.38, -0.18, 0.013, 0.002, coroVeinMat],
      [-0.08, 0.14, 0.22, -0.66, 0.012, 0.002, coroVeinMat]
    ].forEach(function (b) {
      var y0 = b[0], x0 = (0.13 + 0.24 * y0) / taper(y0) + (b[6] === coroVeinMat ? 0.06 : 0);
      var x1 = clamp(x0 + b[1], -0.82, 0.82), y1 = b[3];
      var xm = lerp(x0, x1, 0.55) + 0.03, ym = lerp(y0, y1, 0.45);
      vesselBranch([frontPt(x0, y0, 1.009), frontPt(xm, ym, 1.009), frontPt(x1, y1, 1.007)], b[4], b[5], b[6], 24);
    });

    [
      [0.46, -0.26, 0.08, 0.015, 0.0025, coroArtMat],
      [0.22, -0.34, -0.22, 0.014, 0.002, coroVeinMat],
      [-0.04, -0.3, -0.52, 0.013, 0.002, coroArtMat],
      [0.34, -0.28, -0.06, 0.013, 0.002, coroVeinMat]
    ].forEach(function (b) {
      var y0 = b[0], x0 = (0.13 + 0.24 * y0) / taper(y0);
      var x1 = clamp(x0 + b[1], -0.82, 0.82), y1 = b[2];
      var xm = lerp(x0, x1, 0.5) - 0.04, ym = lerp(y0, y1, 0.45);
      vesselBranch([frontPt(x0, y0, 1.009), frontPt(xm, ym, 1.009), frontPt(x1, y1, 1.007)], b[3], b[4], b[5], 24);
    });

    function avArc(a0, a1, y, lift) {
      var pts = [], st = (a1 - a0) / 18;
      for (var s = 0; s <= 18; s++) {
        var an = a0 + st * s, rr = Math.sqrt(Math.max(0.05, 1 - y * y));
        pts.push(surf(Math.cos(an) * rr, y, Math.sin(an) * rr, lift));
      }
      return pts;
    }
    vesselBranch(avArc(1.55, 3.65, 0.44, 1.01), 0.022, 0.008, coroArtMat, 36);
    vesselBranch(avArc(1.62, 3.55, 0.41, 1.009), 0.017, 0.006, coroVeinMat, 36);
    vesselBranch(avArc(1.18, -0.7, 0.5, 1.01), 0.02, 0.006, coroArtMat, 32);

    var rma = [];
    for (var my = 0.42; my >= -0.68; my -= 0.14) {
      var mx = -Math.sqrt(Math.max(0.05, 1 - my * my)) * 0.86;
      var mz = Math.sqrt(Math.max(0.02, 1 - mx * mx - my * my));
      rma.push(surf(mx, my, mz, 1.009));
    }
    vesselBranch(rma, 0.016, 0.003, coroArtMat, 32);

    // pusatkan model
    var box = new THREE.Box3().setFromObject(root), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    root.children.forEach(function (c) { c.position.sub(center); });
    var modelH = size.y;

    // ---- partikel halus ----
    var dot = track(dotTexture());
    var N = 160, pGeo = track(new THREE.BufferGeometry()), pp = new Float32Array(N * 3), pc = new Float32Array(N * 3), seeds = [];
    var cg = srgb("#5cc59a"), cr = srgb("#ff6e75"), cw = srgb("#e8f0ec");
    for (var q = 0; q < N; q++) {
      var rr2 = 2.4 + Math.random() * 3.0, th = Math.random() * Math.PI * 2, yv2 = (Math.random() - 0.5) * 6;
      pp[q * 3] = Math.cos(th) * rr2; pp[q * 3 + 1] = yv2; pp[q * 3 + 2] = Math.sin(th) * rr2 - 1;
      var cc = Math.random() < 0.5 ? cg : (Math.random() < 0.5 ? cr : cw);
      pc[q * 3] = cc.r; pc[q * 3 + 1] = cc.g; pc[q * 3 + 2] = cc.b;
      seeds.push(Math.random() * 10);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pc, 3));
    var pMat = track(new THREE.PointsMaterial({ size: 0.055, map: dot, vertexColors: true, transparent: true, opacity: 0.52, depthWrite: false, blending: THREE.AdditiveBlending }));
    var points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // ---- label anatomi ----
    var labels = [];
    if (opts.labels !== false) {
      [
        { t: "Aorta", obj: aorta.curve, u: 0.42, side: "r" },
        { t: "Arteri pulmonalis", obj: pulm.curve, u: 0.52, side: "r" },
        { t: "Ventrikel kiri", local: new THREE.Vector3(0.58, -0.35, 0.45), side: "r" },
        { t: "Atrium kanan", local: new THREE.Vector3(-0.92, 0.58, 0.2), side: "l" }
      ].forEach(function (L) {
        var el = document.createElement("div");
        el.className = "heart-label " + (L.side === "l" ? "is-left" : "");
        el.innerHTML = '<i></i><span>' + L.t + "</span>";
        stage.appendChild(el);
        L.el = el; labels.push(L);
      });
    }

    // ---- interaksi orbit damping (rotasi & zoom halus) ----
    var dragging = false, lastX = 0, lastY = 0;
    var rotY = 0, rotX = 0, velY = 0, velX = 0, idle = 0;
    var baseZ = 8.0, zoomFactor = 1.0, targetZoom = 1.0;
    var canvas = renderer.domElement;

    function onDown(e) {
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    }
    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      velY = dx * 0.008;
      velX = dy * 0.005;
      rotY += velY;
      rotX = clamp(rotX + velX, -0.65, 0.65);
      idle = 0;
    }
    function onUp() { dragging = false; canvas.style.cursor = ""; }
    function onWheel(e) {
      e.preventDefault();
      targetZoom = clamp(targetZoom + e.deltaY * 0.0009, 0.65, 1.55);
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerup", onUp);

    // ---- ukuran & framing ----
    var W = 1, Hh = 1;
    function resize() {
      W = Math.max(1, stage.clientWidth); Hh = Math.max(1, stage.clientHeight);
      renderer.setSize(W, Hh, false);
      camera.aspect = W / Hh;
      var mobile = window.innerWidth <= 900;
      var topR = mobile ? 24 : (opts.reserveTop || 0);
      var botR = mobile ? 6 : (opts.reserveBottom && opts.reserveBottom.offsetParent !== null ? opts.reserveBottom.offsetHeight + 22 : 0);
      var freeH = Math.max(Hh * 0.45, Hh - topR - botR);
      var frac = freeH / Hh;
      var tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      var fitH = (modelH * (mobile ? 1.04 : 1.14)) / (2 * tanH * frac);
      var fitW = (size.x * 1.45) / (2 * tanH * camera.aspect);
      baseZ = Math.max(fitH, fitW, 5.5);
      camera.position.z = baseZ * zoomFactor;
      var shift = (botR - topR) / 2;
      camera.setViewOffset(W, Hh, 0, shift, W, Hh);
      camera.updateProjectionMatrix();
      if (opts.ecgCanvas) {
        var dpr = Math.min(window.devicePixelRatio || 1, 2), ec = opts.ecgCanvas;
        ec.width = Math.max(1, ec.clientWidth * dpr); ec.height = Math.max(1, ec.clientHeight * dpr);
        ecgBuf = new Float32Array(Math.ceil(ec.width)); ecgHead = 0;
      }
    }
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(stage); else window.addEventListener("resize", resize);

    // ---- EKG ----
    var ecgBuf = null, ecgHead = 0;
    function drawEcg(dt, phase) {
      var ec = opts.ecgCanvas; if (!ec || !ecgBuf || ec.clientWidth === 0) return;
      var g = ec.getContext("2d"), w = ec.width, h = ec.height;
      var speed = w / 3.2;
      var steps = Math.max(1, Math.round(speed * dt));
      for (var s = 0; s < steps; s++) {
        ecgHead = (ecgHead + 1) % w;
        var ph = (phase - (steps - s) / speed / period) % 1; if (ph < 0) ph += 1;
        ecgBuf[ecgHead] = ecg(ph);
      }
      g.clearRect(0, 0, w, h);
      g.lineWidth = Math.max(1.5, h / 40); g.lineJoin = "round"; g.lineCap = "round";
      var gap = Math.floor(w * 0.06);
      g.shadowColor = "rgba(92,197,154,.8)"; g.shadowBlur = h / 8;
      for (var seg = 0; seg < 4; seg++) {
        g.beginPath();
        g.strokeStyle = "rgba(124,232,184," + (0.25 + seg * 0.25) + ")";
        var started = false;
        for (var k = 0; k < w; k++) {
          var age = (ecgHead - k + w) % w;
          if (age < gap) { started = false; continue; }
          var band = 3 - Math.min(3, Math.floor((age / w) * 4));
          if (band !== seg) { started = false; continue; }
          var yv = h * 0.62 - ecgBuf[k] * h * 0.5;
          if (!started) { g.moveTo(k, yv); started = true; } else g.lineTo(k, yv);
        }
        g.stroke();
      }
      g.shadowBlur = 0;
      var hy = h * 0.62 - ecgBuf[ecgHead] * h * 0.5;
      g.fillStyle = "#c8ffe6"; g.beginPath(); g.arc(ecgHead, hy, g.lineWidth * 1.6, 0, Math.PI * 2); g.fill();
    }

    // ---- loop animasi & API kontrol ----
    var bpm = 72, period = 60 / bpm, phaseT = 0, paused = false, wireframe = false;
    var clock = new THREE.Clock(), raf = 0, alive = true, tAll = 0, proj = new THREE.Vector3(), rootCenter = new THREE.Vector3();
    resize();

    function frame() {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!paused) {
        tAll += dt;
        phaseT += dt / period;
      }
      var p = phaseT % 1;
      var ab = atrBeat(p), vb = ventBeat(p), ap = aortaPulse(p);
      var amp = reduce ? 0.5 : 1;

      shaderUniforms.uAtrial.value = ab * amp;
      shaderUniforms.uVent.value = vb * amp;
      shaderUniforms.uAorta.value = ap * amp;
      muscleMat.emissiveIntensity = 0.1 + 0.28 * vb;
      if (opts.glowEl) opts.glowEl.style.setProperty("--beat", vb.toFixed(3));

      // Orbit damping
      if (!dragging) {
        idle += dt;
        velY *= 0.93; velX *= 0.93;
        rotY += velY;
        rotX = clamp(rotX + velX, -0.65, 0.65);
        if (!paused && idle > 1.5) rotY += dt * (reduce ? 0.04 : 0.15);
      }
      zoomFactor = lerp(zoomFactor, targetZoom, 0.12);
      camera.position.z = baseZ * zoomFactor;
      root.rotation.y = rotY;
      root.rotation.x = rotX + Math.sin(tAll * 0.6) * 0.02;
      root.position.y = Math.sin(tAll * 0.8) * 0.04;

      if (!paused) {
        var arr = pGeo.attributes.position.array;
        for (var n = 0; n < N; n++) {
          arr[n * 3 + 1] += dt * (0.11 + (seeds[n] % 1) * 0.13);
          arr[n * 3] += Math.sin(tAll + seeds[n]) * dt * 0.035;
          if (arr[n * 3 + 1] > 3.2) arr[n * 3 + 1] = -3.2;
        }
        pGeo.attributes.position.needsUpdate = true;
        points.rotation.y = tAll * 0.03;
      }
      pMat.size = 0.055 + vb * 0.016;

      renderer.render(scene, camera);

      labels.forEach(function (L) {
        if (L.obj) { proj.copy(L.obj.getPoint(L.u)).applyMatrix4(vessels.matrixWorld); }
        else { proj.copy(L.local).applyMatrix4(tiltGroup.matrixWorld); }
        var wz = proj.clone().applyMatrix4(camera.matrixWorldInverse).z;
        proj.project(camera);
        var sx = (proj.x * 0.5 + 0.5) * W, sy = (-proj.y * 0.5 + 0.5) * Hh;
        L.el.style.transform = "translate(" + sx.toFixed(1) + "px," + sy.toFixed(1) + "px) translateY(-50%)" + (L.side === "l" ? " translateX(-100%)" : "");
        var cz = rootCenter.setFromMatrixPosition(root.matrixWorld).applyMatrix4(camera.matrixWorldInverse).z;
        L.el.style.opacity = wz > cz - 0.15 ? 1 : 0.35;
      });

      if (!paused) drawEcg(dt, p);
    }
    if (opts.bpmEl) opts.bpmEl.textContent = bpm;
    if (opts.bpmMobEl) opts.bpmMobEl.textContent = bpm;
    frame();

    function setBpm(v) {
      bpm = clamp(Math.round(Number(v) || 72), 40, 180);
      period = 60 / bpm;
      if (opts.bpmEl) opts.bpmEl.textContent = bpm;
      if (opts.bpmMobEl) opts.bpmMobEl.textContent = bpm;
      return bpm;
    }

    function togglePlay() {
      paused = !paused;
      return !paused;
    }

    function resetCamera() {
      rotY = 0; rotX = 0; velY = 0; velX = 0; targetZoom = 1.0; idle = 0;
    }

    function toggleWireframe() {
      wireframe = !wireframe;
      allMaterials.forEach(function (m) {
        if (m !== lumenMat) m.wireframe = wireframe;
      });
      return wireframe;
    }

    function destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("wheel", onWheel);
      labels.forEach(function (L) { L.el.remove(); });
      disposables.forEach(function (d) { try { d.dispose(); } catch (e) {} });
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    return {
      destroy: destroy,
      setBpm: setBpm,
      togglePlay: togglePlay,
      resetCamera: resetCamera,
      toggleWireframe: toggleWireframe
    };
  }

  function fallback(stage) {
    stage.innerHTML = '<div class="heart-fallback"><svg width="140" height="140" viewBox="0 0 24 24" fill="#E5484D"><path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11z"/></svg></div>';
    return {
      destroy: function () { stage.innerHTML = ""; },
      setBpm: function () {},
      togglePlay: function () { return true; },
      resetCamera: function () {},
      toggleWireframe: function () { return false; }
    };
  }

  window.Heart3D = { mount: mount };
})();
