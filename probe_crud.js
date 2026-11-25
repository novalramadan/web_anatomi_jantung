// probe_crud.js — replikasi payload collect() admin.js → PocketBase live
const BASE = "http://127.0.0.1:8090";
const parse = async (r) => {
  const t = await r.text();
  let d;
  try { d = t ? JSON.parse(t) : null; } catch { d = { _raw: t.slice(0, 200) }; }
  return { s: r.status, d };
};
const req = (p, o = {}) => fetch(BASE + p, o).then(parse);

(async () => {
  const login = await req("/api/collections/users/auth-with-password", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: "dosen@medicalu.local", password: "dosen12345" })
  });
  const H = { "Content-Type": "application/json", Authorization: login.d.token };
  const asDosen = (p, o = {}) => req(p, { ...o, headers: H });

  // Payload persis seperti collect() admin.js — id_lokal dikosongkan → null
  const payloads = {
    glosarium: { istilah: "uji", definisi: "uji" },
    pustaka:   { kutipan: "uji" },
    kasus:     { id_lokal: "P" + Date.now(), judul: "uji" },
    pertemuan: { id_lokal: null, judul: "uji" },              // id_lokal required number → null
    soal:      { id_lokal: null, pertanyaan: "uji" },
    aset_3d:   { nama: "uji", keterangan: "" },               // keterangan "" dikirim?
    rumus:     { nama: "uji", rumus: "", keterangan: "" },
    normal:    { parameter: "uji", nilai_normal: "" },
  };

  for (const [coll, body] of Object.entries(payloads)) {
    const r = await asDosen(`/api/collections/${coll}/records`, { method: "POST", body: JSON.stringify(body) });
    const msg = r.s !== 200 ? (r.d.message || JSON.stringify(r.d).slice(0, 120)) : "OK";
    console.log(coll.padEnd(10), r.s, msg);
  }

  // Test delete aset_3d yang masih dipakai marker (hook block)
  const mk = await asDosen("/api/collections/marker/records?perPage=1");
  if (mk.d.items && mk.d.items[0] && mk.d.items[0].aset_3d) {
    const mid = mk.d.items[0].aset_3d;
    const del = await asDosen(`/api/collections/aset_3d/records/${mid}`, { method: "DELETE" });
    console.log("delete aset dipakai marker".padEnd(10), del.s, del.d && del.d.message);
  }
})().catch(e => { console.error("ERR", e); process.exit(1); });
