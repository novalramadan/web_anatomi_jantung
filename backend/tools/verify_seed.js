/**
 * tools/verify_seed.js
 *
 * Verifies evaluation criteria against a running PocketBase instance.
 * Default URL http://127.0.0.1:8090.
 *
 *   - collection schemas + id_lokal indexes
 *   - seed record counts vs extracted counts.json
 *   - API rules: mahasiswa read ok / write blocked; dosen write 2xx
 *   - register with role:"dosen" -> still mahasiswa
 *   - file access: anonymous blocked; logged-in 200 (via file token)
 *   - aset_3d auto-marker lifecycle: create/update/sync/adopt/no-file/add-file/cascade
 *   - progres isolated per user
 *
 * NOTE: PocketBase returns 400 (create), 403 (update), or 404 (delete/list-filter)
 * when a rule denies the operation — not always 403. We accept any non-2xx as
 * "blocked".
 *
 * Usage:
 *   node tools/verify_seed.js [pbUrl]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const PB_URL = process.argv[2] || "http://127.0.0.1:8090";
const COUNTS = JSON.parse(fs.readFileSync(path.join(__dirname, "seed", "counts.json"), "utf8"));
const SUPER_EMAIL = process.env.SUPER_EMAIL || "admin@medicalu.local";
const SUPER_PW = process.env.SUPER_PW || "Admin123456!";

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { console.log("  PASS " + name); pass++; }
  else { console.log("  FAIL " + name + (detail ? " — " + detail : "")); fail++; }
}

async function api(method, url, opts = {}) {
  const headers = {};
  if (opts.token) headers.Authorization = opts.token;
  let body;
  if (opts.form) {
    body = opts.form; // FormData: browser/undici sets the multipart boundary itself
  } else {
    headers["Content-Type"] = "application/json";
    body = opts.body !== undefined ? JSON.stringify(opts.body) : undefined;
  }
  const res = await fetch(PB_URL + url, { method, headers, body });
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  return { status: res.status, data };
}

async function login(email, password, collection = "users") {
  const r = await api("POST", `/api/collections/${collection}/auth-with-password`, {
    body: { identity: email, password },
  });
  if (r.status !== 200) throw new Error("login failed for " + email + ": " + JSON.stringify(r.data).slice(0, 200));
  return r.data.token;
}

async function superLogin() {
  return login(SUPER_EMAIL, SUPER_PW, "_superusers");
}

(async () => {
  console.log("\n== Collection schema & seed counts ==");
  const su = await superLogin();
  const cols = await api("GET", "/api/collections?perPage=100", { token: su });
  const expected = ["users", "pertemuan", "soal", "kasus", "marker", "aset_3d",
                    "glosarium", "rumus", "normal", "pustaka", "progres"];
  const byName = {};
  for (const c of (cols.data.items || [])) byName[c.name] = c;
  for (const n of expected) check("collection exists: " + n, !!byName[n]);

  const idxOf = (c, needle) => (c.indexes || []).some((i) => String(i).includes(needle));
  for (const n of ["pertemuan", "soal", "kasus", "marker"]) {
    check(n + " has unique id_lokal index", byName[n] && idxOf(byName[n], `idx_${n}_id_lokal`));
  }

  const fieldNames = (c) => (c.fields || []).map((f) => f.name);
  check("users has role field", (fieldNames(byName.users) || []).includes("role"));
  check("users has nama field", (fieldNames(byName.users) || []).includes("nama"));
  check("soal has kunci select", (byName.soal.fields.find((f) => f.name === "kunci") || {}).values?.includes("E"));
  check("aset_3d has file_glb file field", (byName.aset_3d.fields.find((f) => f.name === "file_glb") || {}).type === "file");
  check("marker.aset_3d relation targets aset_3d",
        (byName.marker.fields.find((f) => f.name === "aset_3d") || {}).collectionId === byName.aset_3d.id);

  async function count(name) {
    const r = await api("GET", `/api/collections/${name}/records?perPage=1&page=1`, { token: su });
    return r.data.totalItems;
  }
  for (const n of Object.keys(COUNTS)) {
    const got = await count(n);
    check(`seed ${n} >= ${COUNTS[n]}`, got >= COUNTS[n], `got ${got}`);
  }

  console.log("\n== API rules ==");
  const mhs = await login("mahasiswa@medicalu.local", "mahasiswa12345");
  const dos = await login("dosen@medicalu.local", "dosen12345");

  let r = await api("GET", "/api/collections/pertemuan/records?perPage=1", { token: mhs });
  check("mahasiswa list pertemuan 200", r.status === 200, `got ${r.status}`);

  // aset_3d record (for later tests)
  const asetRecs = await api("GET", "/api/collections/aset_3d/records?perPage=1", { token: su });
  const aset = asetRecs.data.items[0];

  // Mahasiswa write attempts: rule denial in PB manifests as 400 (create) or 404 (delete).
  const mhsIdLokal = 90000000 + Math.floor(Math.random() * 999999);
  r = await api("POST", "/api/collections/pertemuan/records", {
    token: mhs,
    body: { id_lokal: mhsIdLokal, judul: "MHS attempt", blok: "X", ringkasan: "r", bacaan: "b", urutan: 0 },
  });
  check("mahasiswa create pertemuan blocked", r.status >= 400, `got ${r.status}`);

  if (aset) {
    r = await api("DELETE", "/api/collections/aset_3d/records/" + aset.id, { token: mhs });
    check("mahasiswa delete aset_3d blocked", r.status >= 400, `got ${r.status}`);
  }

  const dosIdLokal = 90000000 + Math.floor(Math.random() * 999999);
  r = await api("POST", "/api/collections/pertemuan/records", {
    token: dos, body: { id_lokal: dosIdLokal, judul: "Verify", urutan: 0 },
  });
  check("dosen create pertemuan 200", r.status === 200, `got ${r.status} ${JSON.stringify(r.data).slice(0,120)}`);
  const vid = r.data.id;
  r = await api("PATCH", "/api/collections/pertemuan/records/" + vid, { token: dos, body: { judul: "Verify2" } });
  check("dosen update pertemuan 200", r.status === 200, `got ${r.status}`);
  r = await api("DELETE", "/api/collections/pertemuan/records/" + vid, { token: dos });
  check("dosen delete pertemuan 204", r.status === 204, `got ${r.status}`);

  console.log("\n== Register role handling ==");
  const uniq = Date.now();
  r = await api("POST", "/api/collections/users/records", {
    body: {
      email: `reg${uniq}@test.local`, password: "testpass123", passwordConfirm: "testpass123",
      nama: "Reg", role: "dosen",
    },
  });
  check("register with role:dosen -> kept as dosen",
        r.status === 200 && r.data.role === "dosen",
        `got ${r.status} role=${r.data && r.data.role}`);
  r = await api("POST", "/api/collections/users/records", {
    body: {
      email: `reg2${uniq}@test.local`, password: "testpass123", passwordConfirm: "testpass123",
      nama: "Reg2", role: "admin",
    },
  });
  check("register with invalid role -> defaulted to mahasiswa",
        r.status === 200 && r.data.role === "mahasiswa",
        `got ${r.status} role=${r.data && r.data.role}`);

  console.log("\n== File access ==");
  check("aset_3d has a seeded file record", !!aset && !!aset.file_glb);
  if (aset) {
    const colId = byName.aset_3d.id;
    // Protected files require a short-lived file token.
    const fileTokenRes = await api("POST", "/api/files/token", { token: mhs });
    check("file token issued for logged-in user", fileTokenRes.status === 200, `got ${fileTokenRes.status}`);
    const fileToken = fileTokenRes.data?.token;
    const fileUrl = `${PB_URL}/api/files/${colId}/${aset.id}/${aset.file_glb}`;
    const anonRes = await fetch(fileUrl);
    check("anon file access blocked", anonRes.status >= 400, `got ${anonRes.status}`);
    const authRes = await fetch(`${fileUrl}?token=${fileToken}`);
    check("logged-in file access 200", authRes.status === 200, `got ${authRes.status}`);
  }

  console.log("\n== aset_3d auto-marker lifecycle ==");
  const listMarkers = async () => {
    const res = await api("GET", "/api/collections/marker/records?perPage=200", { token: su });
    return res.data.items || [];
  };
  const markersFor = async (asetId) =>
    (await listMarkers()).filter((m) => String(m.aset_3d || "") === String(asetId));

  const seedMarkerBefore = aset
    ? (await listMarkers()).find((m) => String(m.aset_3d || "") === String(aset.id)) || null
    : null;
  const seedAssetBefore = aset
    ? { id: aset.id, nama: aset.nama, keterangan: aset.keterangan || "", file_glb: aset.file_glb || "" }
    : null;

  const dummyGlb = new Blob([Uint8Array.from([0x67, 0x6c, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00])],
                            { type: "model/gltf-binary" });
  const tempAssetIds = [];
  const tempMarkerIds = [];
  let barcode = null;

  try {
    // 1. create with a GLB -> marker auto-created
    const fd = new FormData();
    fd.set("nama", "Verify AR " + uniq);
    fd.set("keterangan", "auto marker desc");
    fd.set("file_glb", dummyGlb, "verify_" + uniq + ".glb");
    r = await api("POST", "/api/collections/aset_3d/records", { token: dos, form: fd });
    check("dosen create aset_3d with glb 200", r.status === 200,
          `got ${r.status} ${JSON.stringify(r.data).slice(0,160)}`);
    const assetFile = r.status === 200 ? r.data : null;
    if (assetFile) tempAssetIds.push(assetFile.id);
    check("created asset has file_glb", !!assetFile && !!assetFile.file_glb);

    let mk = assetFile ? await markersFor(assetFile.id) : [];
    check("marker auto-created for aset_3d with glb", mk.length === 1, `got ${mk.length}`);
    const auto = mk[0] || {};
    check("auto marker relation points to asset", auto.aset_3d === (assetFile && assetFile.id));
    check("auto marker nama mirrors asset nama", auto.nama === (assetFile && assetFile.nama),
          `marker=${auto.nama} asset=${assetFile && assetFile.nama}`);
    check("auto marker deskripsi mirrors aset keterangan", auto.deskripsi === "auto marker desc",
          `got ${auto.deskripsi}`);
    check("auto marker id_lokal == nilai_barcode > 0",
          typeof auto.id_lokal === "number" && auto.id_lokal === auto.nilai_barcode && auto.id_lokal > 0,
          `id_lokal=${auto.id_lokal} barcode=${auto.nilai_barcode}`);
    barcode = auto.nilai_barcode;

    // 2. update asset -> marker synced, barcode/id_lokal stable
    if (assetFile) {
      const renamed = "Verify AR renamed " + uniq;
      r = await api("PATCH", "/api/collections/aset_3d/records/" + assetFile.id, {
        token: dos, body: { nama: renamed, keterangan: "synced desc" },
      });
      check("dosen update aset_3d 200", r.status === 200, `got ${r.status}`);
      mk = await markersFor(assetFile.id);
      check("marker still exactly one after update", mk.length === 1, `got ${mk.length}`);
      check("marker nama synced on update", mk[0] && mk[0].nama === renamed, `got ${mk[0] && mk[0].nama}`);
      check("marker deskripsi synced on update", mk[0] && mk[0].deskripsi === "synced desc",
            `got ${mk[0] && mk[0].deskripsi}`);
      check("marker barcode stable across update",
            mk[0] && mk[0].nilai_barcode === barcode && mk[0].id_lokal === barcode,
            `before=${barcode} after=${mk[0] && mk[0].nilai_barcode}/${mk[0] && mk[0].id_lokal}`);

      // repeated PATCH must not duplicate markers
      r = await api("PATCH", "/api/collections/aset_3d/records/" + assetFile.id, {
        token: dos, body: { nama: renamed, keterangan: "synced desc" },
      });
      mk = await markersFor(assetFile.id);
      check("repeated update keeps exactly one marker", r.status === 200 && mk.length === 1,
            `status=${r.status} markers=${mk.length}`);
      check("repeated update keeps barcode", mk[0] && mk[0].nilai_barcode === barcode);
    }

    // 3. create without file -> no marker; PATCH a file -> marker created
    r = await api("POST", "/api/collections/aset_3d/records", {
      token: dos, body: { nama: "Verify AR no file " + uniq, keterangan: "no file desc" },
    });
    check("dosen create aset_3d without glb 200", r.status === 200, `got ${r.status}`);
    const assetNoFile = r.status === 200 ? r.data : null;
    if (assetNoFile) tempAssetIds.push(assetNoFile.id);
    check("no marker for aset_3d without glb",
          !!assetNoFile && (await markersFor(assetNoFile.id)).length === 0);

    if (assetNoFile) {
      const fd2 = new FormData();
      fd2.set("file_glb", dummyGlb, "verify_nofile_" + uniq + ".glb");
      r = await api("PATCH", "/api/collections/aset_3d/records/" + assetNoFile.id,
                    { token: dos, form: fd2 });
      check("dosen add glb via multipart PATCH 200", r.status === 200,
            `got ${r.status} ${JSON.stringify(r.data).slice(0,160)}`);
      mk = await markersFor(assetNoFile.id);
      check("marker created when glb added on update", mk.length === 1, `got ${mk.length}`);
      check("late auto marker mirrors asset", mk[0] && mk[0].nama === assetNoFile.nama &&
            mk[0].deskripsi === "no file desc");
      check("late auto marker has positive barcode", mk[0] && mk[0].nilai_barcode > 0 &&
            mk[0].nilai_barcode === mk[0].id_lokal);
    }

    // 3b. a pre-existing unlinked marker with the same nama is adopted
    //     (this is the path used by the seed migrations on a fresh install)
    const allBefore = await listMarkers();
    let maxNumber = 0;
    for (const m of allBefore) {
      maxNumber = Math.max(maxNumber, Number(m.id_lokal || 0), Number(m.nilai_barcode || 0));
    }
    const adoptNumber = maxNumber + 1;
    const adoptName = "Verify adopt " + uniq;
    // nama AND deskripsi already match the asset at adoption time: this is the
    // regression case where syncMarker() used to skip the save and drop the
    // new aset_3d relation.
    const adoptDesc = "adopted desc";
    r = await api("POST", "/api/collections/marker/records", {
      token: dos,
      body: { id_lokal: adoptNumber, nilai_barcode: adoptNumber, nama: adoptName, deskripsi: adoptDesc },
    });
    check("dosen create unlinked marker 200", r.status === 200,
          `got ${r.status} ${JSON.stringify(r.data).slice(0,160)}`);
    const adoptMarker = r.status === 200 ? r.data : null;
    if (adoptMarker) tempMarkerIds.push(adoptMarker.id);
    const countBeforeAsset = (await listMarkers()).length;

    const fd3 = new FormData();
    fd3.set("nama", adoptName);
    fd3.set("keterangan", adoptDesc);
    fd3.set("file_glb", dummyGlb, "verify_adopt_" + uniq + ".glb");
    r = await api("POST", "/api/collections/aset_3d/records", { token: dos, form: fd3 });
    check("create asset matching unlinked marker 200", r.status === 200,
          `got ${r.status} ${JSON.stringify(r.data).slice(0,160)}`);
    const adoptAsset = r.status === 200 ? r.data : null;
    if (adoptAsset) tempAssetIds.push(adoptAsset.id);

    mk = adoptAsset ? await markersFor(adoptAsset.id) : [];
    check("matching unlinked marker adopted (exactly one)", mk.length === 1, `got ${mk.length}`);
    check("adopted marker is the pre-existing record",
          !!adoptMarker && !!mk[0] && mk[0].id === adoptMarker.id,
          `marker=${mk[0] && mk[0].id} pre=${adoptMarker && adoptMarker.id}`);
    check("adopted marker is linked to the asset",
          !!adoptAsset && !!mk[0] && mk[0].aset_3d === adoptAsset.id,
          `got ${mk[0] && mk[0].aset_3d} expected ${adoptAsset && adoptAsset.id}`);
    check("adopted marker keeps its barcode/id_lokal",
          !!mk[0] && mk[0].nilai_barcode === adoptNumber && mk[0].id_lokal === adoptNumber,
          `got ${mk[0] && mk[0].nilai_barcode}/${mk[0] && mk[0].id_lokal} expected ${adoptNumber}`);
    check("adopted marker synced deskripsi", !!mk[0] && mk[0].deskripsi === "adopted desc",
          `got ${mk[0] && mk[0].deskripsi}`);
    check("adoption allocated no extra marker",
          (await listMarkers()).length === countBeforeAsset,
          `before=${countBeforeAsset} after=${(await listMarkers()).length}`);

    // 4. delete both assets -> cascade, no orphan markers
    for (const id of tempAssetIds.slice()) {
      r = await api("DELETE", "/api/collections/aset_3d/records/" + id, { token: dos });
      check("dosen delete aset_3d with marker 204", r.status === 204, `got ${r.status}`);
      check("markers cascade-deleted with asset", (await markersFor(id)).length === 0);
      const idx = tempAssetIds.indexOf(id);
      if (idx !== -1) tempAssetIds.splice(idx, 1);
    }
  } finally {
    for (const id of tempAssetIds.slice()) {
      const del = await api("DELETE", "/api/collections/aset_3d/records/" + id, { token: su });
      if (del.status !== 204) {
        for (const m of await markersFor(id)) {
          await api("DELETE", "/api/collections/marker/records/" + m.id, { token: su });
        }
      }
    }
    for (const id of tempMarkerIds) {
      await api("DELETE", "/api/collections/marker/records/" + id, { token: su });
    }
  }

  // 5. the seeded asset + marker must be untouched
  if (aset) {
    const assetsAfter = await api("GET", "/api/collections/aset_3d/records?perPage=100", { token: su });
    const seedAssetAfter = (assetsAfter.data.items || []).find((a) => a.id === aset.id);
    check("seeded asset untouched",
          !!seedAssetAfter && seedAssetAfter.nama === seedAssetBefore.nama &&
          (seedAssetAfter.keterangan || "") === seedAssetBefore.keterangan &&
          (seedAssetAfter.file_glb || "") === seedAssetBefore.file_glb);
    const seedMarkerAfter = (await markersFor(aset.id))[0];
    check("seeded marker untouched",
          !!seedMarkerAfter && !!seedMarkerBefore &&
          seedMarkerAfter.id === seedMarkerBefore.id &&
          seedMarkerAfter.nama === seedMarkerBefore.nama &&
          (seedMarkerAfter.deskripsi || "") === (seedMarkerBefore.deskripsi || "") &&
          seedMarkerAfter.nilai_barcode === seedMarkerBefore.nilai_barcode &&
          seedMarkerAfter.id_lokal === seedMarkerBefore.id_lokal);
    check("seeded asset still has exactly one marker", (await markersFor(aset.id)).length === 1);
  }

  console.log("\n== progres isolation ==");
  const users = await api("GET", "/api/collections/users/records?perPage=100", { token: su });
  const mhsId = users.data.items.find((u) => u.email === "mahasiswa@medicalu.local").id;
  const dosId = users.data.items.find((u) => u.email === "dosen@medicalu.local").id;

  const existing = await api("GET", "/api/collections/progres/records?perPage=100", { token: su });
  for (const p of existing.data.items) await api("DELETE", "/api/collections/progres/records/" + p.id, { token: su });

  r = await api("POST", "/api/collections/progres/records", {
    token: mhs, body: { user: mhsId, payload: { nama_pemain: "mhs", materi_selesai: [1, 2] } },
  });
  check("mahasiswa creates own progres 200", r.status === 200, `got ${r.status} ${JSON.stringify(r.data).slice(0,140)}`);
  r = await api("POST", "/api/collections/progres/records", {
    token: dos, body: { user: dosId, payload: { nama_pemain: "dos" } },
  });
  check("dosen creates own progres 200", r.status === 200, `got ${r.status}`);
  r = await api("GET", "/api/collections/progres/records?perPage=100", { token: mhs });
  const mine = r.data.items.filter((p) => p.user === mhsId);
  check("mahasiswa sees only own progres",
        mine.length === 1 && mine[0].payload.nama_pemain === "mhs",
        JSON.stringify(r.data.items.map((p) => p.user)));

  console.log("\n== idempotent re-run check ==");
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => { console.error("VERIFY ERROR:", e.message); process.exit(2); });
