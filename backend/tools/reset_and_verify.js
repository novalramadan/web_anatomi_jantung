// tools/reset_and_verify.js — full reset-from-scratch verification.
// Usage: node tools/reset_and_verify.js
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.resolve(__dirname, "..", "..");
const PB = path.join(ROOT, "backend", "pocketbase.exe");
const DATA = path.join(ROOT, "backend", "pb_data");
const URL = "http://127.0.0.1:8090";

function waitFor(url, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url + "/api/health", (res) => {
        res.resume();
        resolve(res.statusCode);
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error("server did not come up in " + timeoutMs + "ms"));
        else setTimeout(tryOnce, 300);
      });
    };
    tryOnce();
  });
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: "inherit" });
    p.on("exit", (code) => resolve(code === null ? 1 : code));
  });
}

(async () => {
  // 1. wipe
  console.log("[reset] step 1: wipe pb_data");
  if (fs.existsSync(DATA)) {
    fs.rmSync(DATA, { recursive: true, force: true });
    console.log("[reset] removed pb_data");
  }

  // 2. migrate up (as README documents for a fresh install)
  console.log("[reset] step 2: migrate up ...");
  const migrateCode = await run(PB, [
    "migrate", "up",
    "--dir=backend/pb_data", "--migrationsDir=backend/migrate",
    "--hooksDir=backend/pb_hooks",
  ]);
  if (migrateCode !== 0) { console.error("migrate up failed"); process.exit(1); }
  console.log("[reset] migrations applied");

  // 3. start server in background, capturing logs for debugging
  const logPath = path.join(ROOT, "backend", "tools", "serve.log");
  const logFd = fs.openSync(logPath, "w");
  fs.writeSync(logFd, "[reset] serve starting\n");
  console.log("[reset] step 3: starting server ...");
  const server = spawn(PB, [
    "serve",
    "--dir=backend/pb_data", "--migrationsDir=backend/migrate",
    "--hooksDir=backend/pb_hooks", "--publicDir=pb_public",
    "--http=127.0.0.1:8090",
  ], { cwd: ROOT, stdio: ["ignore", logFd, logFd] });

  server.on("exit", (code, signal) => {
    fs.writeSync(logFd, `\n[reset] server exited code=${code} signal=${signal}\n`);
    console.error("[reset] server exited code=" + code + " signal=" + signal);
    console.error("[reset] serve.log:\n" + fs.readFileSync(logPath, "utf8"));
    process.exit(1);
  });

  try {
    const code = await waitFor(URL, 20000);
    console.log("[reset] step 4: /api/health = " + code);
  } catch (e) {
    server.kill();
    console.error("[reset] " + e.message);
    process.exit(1);
  }

  // 4. run verify_seed
  console.log("[reset] step 5: verify_seed ...");
  const verify = spawn("node", [path.join(__dirname, "verify_seed.js"), URL], { cwd: ROOT, stdio: "inherit" });
  verify.on("exit", (code) => {
    console.log("[reset] verification exit: " + code);
    server.kill();
    process.exit(code);
  });
})().catch((e) => { console.error(e); process.exit(1); });
