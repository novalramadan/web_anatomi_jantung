// probe_crud.js — replikasi payload collect() admin.js → PocketBase live
const BASE = process.argv[2] || "http://127.0.0.1:8090";
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
  const postForm = (p, form) => req(p, { method: "POST", headers: { Authorization: H.Authorization }, body: form });

  // Payload persis seperti collect() admin.js — id_lokal dikosongkan → null
  const payloads = {
    glosarium: { istilah: "uji", definisi: "uji" },
    pustaka:   { kutipan: "uji" },
    kasus:     { id_lokal: "P" + Date.now(), judul: "uji" },
    pertemuan: { id_lokal: null, judul: "uji" },              // id_lokal required number → null
    soal:      { id_lokal: null, pertanyaan: "uji" },
    aset_3d:   { nama: "uji", keterangan: "" },               // tanpa file → tidak ada marker
    rumus:     { nama: "uji", rumus: "", keterangan: "" },
    normal:    { parameter: "uji", nilai_normal: "" },
  };

  for (const [coll, body] of Object.entries(payloads)) {
    const r = await asDosen(`/api/collections/${coll}/records`, { method: "POST", body: JSON.stringify(body) });
    const msg = r.s !== 200 ? (r.d.message || JSON.stringify(r.d).slice(0, 120)) : "OK";
    console.log(coll.padEnd(10), r.s, msg);
  }

  // Auto-marker + cascade delete on a temporary asset (self-cleaning).
  const fd = new FormData();
  fd.set("nama", "probe-marker-" + Date.now());
  fd.set("keterangan", "probe");
  fd.set("file_glb", new Blob([Uint8Array.from([0x67, 0x6c, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00])],
                               { type: "application/octet-stream" }), "probe.glb");
  const created = await postForm("/api/collections/aset_3d/records", fd);
  console.log("create aset+glb".padEnd(24), created.s,
              created.s === 200 ? "OK" : (created.d && created.d.message));
  if (created.s === 200) {
    const id = created.d.id;
    const list = await asDosen("/api/collections/marker/records?perPage=200");
    const linked = (list.d.items || []).filter((m) => String(m.aset_3d || "") === id);
    console.log("marker auto-created".padEnd(24), linked.length === 1 ? "OK" : "FAIL",
                linked.length === 1 ? "barcode=" + linked[0].nilai_barcode : "count=" + linked.length);
    const del = await asDosen(`/api/collections/aset_3d/records/${id}`, { method: "DELETE" });
    const after = await asDosen("/api/collections/marker/records?perPage=200");
    const left = (after.d.items || []).filter((m) => String(m.aset_3d || "") === id);
    console.log("delete aset (cascade)".padEnd(24), del.s,
                left.length === 0 ? "markers gone" : "ORPHANS=" + left.length);
  }
})().catch(e => { console.error("ERR", e); process.exit(1); });

