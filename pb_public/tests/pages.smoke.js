// tests/pages.smoke.js — pastikan markup Tailwind menyediakan semua id/querySelector yang dipakai JS,
// dan tidak ada kelas CSS lama tersisa.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

let fail = 0;
function ok(cond, msg, det) {
  if (!cond) { fail++; console.error("FAIL:", msg, det ? "— " + det : ""); }
  else console.log("ok  :", msg);
}

// ---------- 1. semua id yang di-getElementById oleh JS ada di markup halamannya ----------
// pasangan [fileJS, id, fileMarkupYgMemuat] — markup disimpan sbg template literal di fungsi JS.
const idContracts = [
  // home
  ["js/home.js", null],
  // materi
  ["js/materi.js", "materiSearch"],
  ["js/materi.js", "markDone"],
  ["js/materi.js", "openAppendix"],
  // kuis
  ["js/kuis.js", "mixP"],
  ["js/kuis.js", "mixN"],
  ["js/kuis.js", "mixL"],
  ["js/kuis.js", "mixStart"],
  ["js/kuis.js", "quitQuiz"],
  ["js/kuis.js", "nextBtn"],
  ["js/kuis.js", "timerBadge"],
  ["js/kuis.js", "retryBtn"],
  // vn
  ["js/vn.js", "vnShelf"],
  ["js/vn.js", "vnLog"],
  ["js/vn.js", "vnSave"],
  ["js/vn.js", "vnLoad"],
  ["js/vn.js", "vnRefSave"],
  ["js/vn.js", "vnRefleksi"],
  // ar
  ["js/ar.js", "tabCam"],
  ["js/ar.js", "tab3d"],
  ["js/ar.js", "tabCetak"],
  ["js/ar.js", "arStatus"],
  ["js/ar.js", "camSwitch"],
  ["js/ar.js", "arInfo"],
  ["js/ar.js", "arInfoBody"],
  ["js/ar.js", "glbCanvas"],
  ["js/ar.js", "arView"],
  // profil
  ["js/profil.js", "namaPemain"],
  ["js/profil.js", "fontRange"],
  ["js/profil.js", "fontVal"],
  ["js/profil.js", "themeSel"],
  ["js/profil.js", "soundCk"],
  ["js/profil.js", "expProgres"],
  ["js/profil.js", "expData"],
  ["js/profil.js", "impFile"],
  ["js/profil.js", "impMsg"],
  ["js/profil.js", "resetBtn"],
  // statistik (dosen)
  ["js/statistik.js", "statRefresh"],
  ["js/statistik.js", "statRoot"],
  ["js/statistik.js", "statRows"],
  ["js/statistik.js", "statSearch"],
  ["js/statistik.js", "statCount"],
  // login
  ["js/login.js", "authForm"],
  ["js/login.js", "authMsg"],
  ["js/login.js", "aNama"],
  ["js/login.js", "aEmail"],
  ["js/login.js", "aPw"],
  ["js/login.js", "aRole"],
  // admin
  ["js/admin.js", "newItem"],
  ["js/admin.js", "entForm"],
  ["js/admin.js", "formSave"],
  ["js/admin.js", "formCancel"],
  ["js/admin.js", "recordsPanel"],
  ["js/admin.js", "collectionTabs"],
  ["js/admin.js", "previewKuis"],
];

function idsInMarkup(file) {
  const src = read(file);
  const set = new Set();
  // kumpulkan semua id="..." di literal HTML dalam file
  const re = /id="([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) set.add(m[1]);
  // id yang dibangun lewat helper, mis. field("aEmail", ...)
  const helper = /field\("([^"]+)"/g;
  while ((m = helper.exec(src))) set.add(m[1]);
  return set;
}

const cache = {};
for (const [jsFile, id] of idContracts) {
  if (id === null) continue;
  if (!cache[jsFile]) cache[jsFile] = idsInMarkup(jsFile);
  ok(cache[jsFile].has(id), `${jsFile} merender id="${id}"`);
}

// ---------- 2. data-* kontrak yang dipakai querySelector ----------
const attrContracts = [
  ["js/kuis.js", "data-opt"],
  ["js/vn.js", "data-goto"],
  ["js/admin.js", "data-edit"],
  ["js/admin.js", "data-del"],
  ["js/admin.js", "data-field"],
];
for (const [jsFile, attr] of attrContracts) {
  const src = read(jsFile);
  const used = new RegExp(`\\[?${attr.replace(/-/g, "\\-")}=`).test(src) || src.includes(`"${attr}"`) || src.includes(`'${attr}'`) || src.includes(attr + '="');
  ok(used, `${jsFile} memakai ${attr}`);
  // markup harus menaruh attr itu
  const placed = new RegExp(`${attr}="`).test(src);
  ok(placed, `${jsFile} menempatkan ${attr}=" pada elemen`);
}

// ---------- 3. tidak ada kelas CSS lama yang jadi kontrak visual ----------
const legacyClasses = [
  "hero", "hero-actions", "hero-meta", "pulse-trace", "mod-grid", "mod-card", "section-head",
  "reader", "article", "pager", "toc-group-title", "badge-teal", "badge-accent",
  "stat-row", "admin-tabs", "row-actions", "ar-tabs",
  "ar-controls", "chip-row",
];
const allJs = fs.readdirSync(path.join(root, "js")).filter(f => f.endsWith(".js"));
// kelas yang memang disengaja tetap dipakai (komponen baru / bukan CSS lama)
const intentional = new Set(["btn-wrong"]);
for (const f of allJs) {
  const src = read(path.join("js", f));
  // buang komentar dulu agar 'hero'/'reader' di komentar & FileReader tak dihitung
  const noComments = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  for (const cls of legacyClasses) {
    if (intentional.has(cls)) continue;
    // hanya match pemakaian nyata dalam atribut class="..."
    const re = new RegExp(`class="[^"]*\\b${cls}\\b`);
    if (re.test(noComments)) { fail++; console.error(`FAIL: ${f} masih memakai kelas lama "${cls}"`); }
  }
}
console.log("ok  : tak ada kelas CSS lama tersisa di js/");

// ---------- 4. index.html: Tailwind terpasang, font, palet, script utuh ----------
const idx = read("index.html");
ok(idx.includes("cdn.tailwindcss.com"), "index.html memuat Tailwind CDN");
ok(idx.includes("tailwind.config"), "index.html punya tailwind.config");
ok(idx.includes("Plus+Jakarta+Sans"), "index.html memuat Plus Jakarta Sans");
ok(idx.includes("JetBrains+Mono"), "index.html memuat JetBrains Mono");
ok(idx.includes("--brand:        #0F4D3A"), "palet brand hijau terpasang");
// urutan script penting (config sebelum modul, app sebelum halaman)
const order = ["js/config.js", "js/pb.js", "js/app.js", "js/home.js", "js/materi.js", "js/kuis.js", "js/vn.js", "js/ar.js", "js/profil.js", "js/statistik.js", "js/login.js", "js/admin.js"];
let lastIdx = -1, orderOk = true;
for (const s of order) {
  const i = idx.indexOf(s);
  if (i < lastIdx) { orderOk = false; console.error("FAIL: urutan script salah di", s); }
  lastIdx = i;
}
ok(orderOk, "urutan <script> di index.html tetap benar");
// semua lib tetap dimuat
for (const lib of ["three.min.js", "GLTFLoader.js", "jsQR.js", "qrcodegen.js"]) {
  ok(idx.includes(lib), `lib ${lib} tetap dimuat`);
}
// kontrak id shell
for (const id of ["app", "brandName", "disclaimer", "footInstitusi", "footDosen", "navAdmin", "navStatistik", "navKuis", "navLogin", "navLogout"]) {
  ok(new RegExp(`id="${id}"`).test(idx), `shell punya id="${id}"`);
}
// nav data-nav utk active state
for (const nav of ["materi", "kuis", "vn", "ar", "profil", "statistik", "admin", "login"]) {
  ok(new RegExp(`data-nav="${nav}"`).test(idx), `nav data-nav="${nav}" ada`);
}

// ---------- 5. CSS lama sudah dihapus ----------
for (const f of ["css/style.css", "css/materi.css", "css/vn.css", "css/ar.css"]) {
  ok(!fs.existsSync(path.join(root, f)), `${f} sudah dihapus`);
}
ok(!idx.includes('css/style.css') && !idx.includes('css/vn.css') && !idx.includes('css/ar.css'), "index.html tak lagi merujuk css lama");
ok(!read("tests.html").includes('css/style.css'), "tests.html tak lagi merujuk style.css");

if (fail === 0) console.log("\nSEMUA LULUS — markup Tailwind memenuhi seluruh kontrak JS.");
else { console.error(`\n${fail} KONTRAK GAGAL.`); process.exit(1); }
