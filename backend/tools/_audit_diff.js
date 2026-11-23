// tools/_audit_diff.js — temporary. Dump diff samples for isi.konsep_inti + kasus.halaman.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const B = process.argv[2] || "http://127.0.0.1:8090";

async function api(url, token, options = {}) {
  const r = await fetch(B + url, {
    method: options.method || "GET",
    headers: {
      ...(token ? { Authorization: token } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await r.text();
  let d; try { d = JSON.parse(text); } catch (e) { d = text; }
  return { status: r.status, data: d };
}

(async () => {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "cardioverse/data/pertemuan.js"), "utf8"), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "cardioverse/data/kasus.js"), "utf8"), ctx);

  const su = (await api("/api/collections/_superusers/auth-with-password", null, {
    method: "POST", body: { identity: "admin@medicalu.local", password: "Admin123456!" },
  })).data;

  // --- pertemuan 1 ---
  const p1 = await api("/api/collections/pertemuan/records?perPage=1&id_lokal=1", su.token);
  const rec = p1.data.items[0];
  const src = ctx.window.DATA_PERTEMUAN[0];
  const srcK = JSON.stringify(src.konsep_inti, null, 1);
  const dbK = JSON.stringify(rec.isi.konsep_inti, null, 1);
  fs.writeFileSync(path.join(__dirname, "audit_src_konsep.txt"), srcK);
  fs.writeFileSync(path.join(__dirname, "audit_db_konsep.txt"), dbK);

  // --- kasus A ---
  const kr = await api("/api/collections/kasus/records?perPage=1&id_lokal=A", su.token);
  const ksrc = ctx.window.DATA_KASUS[0];
  const kDb = kr.data.items[0];
  fs.writeFileSync(path.join(__dirname, "audit_src_halaman.txt"), JSON.stringify(ksrc.halaman, null, 1));
  fs.writeFileSync(path.join(__dirname, "audit_db_halaman.txt"), JSON.stringify(kDb.halaman, null, 1));

  console.log("wrote audit files in tools/");
})().catch((e) => { console.error(e.message); process.exit(1); });
