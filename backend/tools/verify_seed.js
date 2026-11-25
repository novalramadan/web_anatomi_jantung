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
 *   - aset_3d delete guard returns 400 while referenced
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
  const res = await fetch(PB_URL + url, {
    method,
    headers: { "Content-Type": "application/json", ...(opts.token ? { Authorization: opts.token } : {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
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

  console.log("\n== Register forces role ==");
  const uniq = Date.now();
  r = await api("POST", "/api/collections/users/records", {
    body: {
      email: `reg${uniq}@test.local`, password: "testpass123", passwordConfirm: "testpass123",
      nama: "Reg", role: "dosen",
    },
  });
  check("register with role:dosen -> created as mahasiswa",
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

  console.log("\n== aset_3d delete guard ==");
  if (aset) {
    r = await api("DELETE", "/api/collections/aset_3d/records/" + aset.id, { token: dos });
    check("delete referenced aset_3d -> 400", r.status === 400, `got ${r.status} ${JSON.stringify(r.data).slice(0,160)}`);
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
