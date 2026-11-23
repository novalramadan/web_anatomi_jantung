// backend/tools/_sim_client.js — temporary. Loads pb.js into a fake window, logs in, checks DATA.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const B = "http://127.0.0.1:8090";

const g = {
  window: {}, location: { origin: B, hash: "" },
  localStorage: { _m: {}, getItem(k) { return k in this._m ? this._m[k] : null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } },
  CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } },
  dispatchEvent() {}, console, fetch, FormData, Promise, JSON, Error,
  Object, String, Number, Boolean, Array, Math, setTimeout, TextEncoder, Uint8Array,
  document: { readyState: "complete", addEventListener() {}, createElement: () => ({ textContent: "", className: "" }) },
  navigator: { userAgent: "node" }, Map, Set, Date, RegExp, Boolean
};
g.window.window = g.window;
g.window.fetch = fetch; g.window.localStorage = g.localStorage; g.window.CustomEvent = g.CustomEvent;
g.window.document = g.document; g.window.location = g.location; g.window.addEventListener = function () {};
g.window.dispatchEvent = function () { return true; };
vm.createContext(g);

const src = fs.readFileSync(path.join(ROOT, "pb_public/js/pb.js"), "utf8");
vm.runInContext(src, g, { filename: "pb.js" });

(async () => {
  try {
    await g.window.PB.ready;
    console.log("ready ok; anonymous DATA_PERTEMUAN:", (g.window.DATA_PERTEMUAN || []).length);

    // simulate login from login.js flow
    const user = await g.window.Auth.login("mahasiswa@medicalu.local", "mahasiswa12345");
    console.log("logged in as", user.email, user.role);
    console.log("post-login DATA_PERTEMUAN:", g.window.DATA_PERTEMUAN.length);
    console.log("post-login DATA_SOAL:", g.window.DATA_SOAL.length);
    console.log("post-login DATA_LAMPIRAN.glosarium:", g.window.DATA_LAMPIRAN.glosarium.length);

    // exercise progress save
    g.window.Storage.update(function (p) { p.materi_selesai.push(1); });
    await g.window.PB.flushProgress();
    const saved = await g.window.PB.records("progres");
    console.log("progres records:", saved.items.length, "payload.materi_selesai:", saved.items[0] && saved.items[0].payload.materi_selesai);

    // reload progress
    const p2 = await g.window.PB._reloadProgressForTest ? null : null;
    console.log("storage.load after flush materi_selesai:", g.window.Storage.load().materi_selesai);

    console.log("SIM OK");
  } catch (e) {
    console.log("SIM FAIL:", e.message, e.status || "");
  }
})();