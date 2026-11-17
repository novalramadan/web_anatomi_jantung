/* js/app.js — hash router, boot, glossary tooltip, helper utilities. */
(function () {
  "use strict";

  var routes = {};
  var current = { path: "", params: [] };

  function define(route, handler) { routes[route] = handler; }
  function add(route, handler) { routes[route] = handler; }

  function resolve(hash) {
    hash = (hash || "#/beranda").replace(/^#\/?/, "");
    if (!hash) hash = "beranda";
    var parts = hash.split("/").filter(function (x) { return x.length; });
    var name = parts[0] || "beranda";
    var params = parts.slice(1);
    return { name: name, params: params };
  }

  function navigate(hash) {
    if (location.hash !== hash) location.hash = hash;
    else render();
  }

  function render() {
    var r = resolve(location.hash);
    var app = document.getElementById("app");
    app.innerHTML = "";
    current = { path: r.name, params: r.params };

    // active nav
    document.querySelectorAll(".mainnav a").forEach(function (a) {
      a.classList.toggle("active", a.dataset.nav === r.name);
    });

    var handler = routes[r.name] || routes.beranda;
    handler(app, r.params);

    app.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
    attachGlossary(app);
    updateNav();
  }

  function on(hash, handler) { add(hash, handler); }

  function toast(msg, ms) {
    var t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.setAttribute("role", "status");
      t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("show"); }, ms || 2200);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  function getProgress() { return Storage.load(); }

  function totalProgress() {
    var p = Storage.load();
    var total = window.DATA_PERTEMUAN.length;
    var done = p.materi_selesai.length;
    return pct(done, total);
  }

  // ---- glossary tooltip ----
  function glossaryIndex() {
    if (window._glossIdx) return window._glossIdx;
    var map = {};
    if (window.DATA_LAMPIRAN && window.DATA_LAMPIRAN.glosarium) {
      window.DATA_LAMPIRAN.glosarium.forEach(function (g) {
        // primary key is the phrase before the colon if present
        var key = g[0];
        map[key.toLowerCase()] = { term: key, def: g[1] };
      });
    }
    window._glossIdx = map;
    return map;
  }

  function attachGlossary(root) {
    if (!root || !window.DATA_LAMPIRAN) return;
    var map = glossaryIndex();
    var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "CODE" || tag === "SUMMARY") return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest(".no-gloss")) return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue || n.nodeValue.trim().length < 3) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var budget = 240;
    nodes.forEach(function (tn) {
      if (budget <= 0) return;
      var txt = tn.nodeValue;
      var lower = txt.toLowerCase();
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (lower.indexOf(k) === -1) continue;
        var idx = lower.indexOf(k);
        var before = idx === 0 ? " " : txt[idx - 1];
        var after = idx + k.length >= txt.length ? " " : txt[idx + k.length];
        if (/[A-Za-zÀ-ÿ]/.test(before) || /[A-Za-zÀ-ÿ]/.test(after)) continue;
        if (k.length < 4 && budget < 60) continue;
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode(txt.slice(0, idx)));
        var b = document.createElement("button");
        b.type = "button";
        b.className = "gloss no-gloss";
        b.textContent = txt.slice(idx, idx + k.length);
        b.dataset.def = map[k].def;
        b.setAttribute("aria-label", k + ": " + map[k].def);
        frag.appendChild(b);
        frag.appendChild(document.createTextNode(txt.slice(idx + k.length)));
        tn.parentNode.replaceChild(frag, tn);
        budget--;
        return; // re-walk this node's siblings naturally on next pass
      }
    });
    if (root.querySelectorAll) {
      root.querySelectorAll(".gloss").forEach(function (b) {
        if (b._wired) return;
        b._wired = true;
        b.addEventListener("click", function () {
          var old = document.querySelector(".gloss-pop");
          if (old) old.remove();
          var pop = document.createElement("div");
          pop.className = "gloss-pop no-gloss";
          pop.setAttribute("role", "dialog");
          pop.setAttribute("aria-label", "Istilah glosarium");
          pop.innerHTML = "<strong>" + escapeHtml(b.textContent) + "</strong><p>" + escapeHtml(b.dataset.def) + "</p>";
          document.body.appendChild(pop);
          var r = b.getBoundingClientRect();
          pop.style.left = Math.max(8, Math.min(window.innerWidth - 280, r.left)) + "px";
          pop.style.top = (r.bottom + 8 + window.scrollY) + "px";
          setTimeout(function () {
            function close(e) {
              if (!pop.contains(e.target) && e.target !== b) { pop.remove(); document.removeEventListener("click", close); }
            }
            document.addEventListener("click", close);
          }, 0);
        });
      });
    }
  }

  // ---- theme + font ----
  function applySettings() {
    var p = Storage.load();
    var s = p.pengaturan || {};
    document.documentElement.dataset.theme = s.mode === "gelap" ? "gelap" : "terang";
    document.documentElement.style.setProperty("--fs", (s.ukuranFont || 100) + "%");
    var logo = document.getElementById("brandLogo");
    if (logo) { logo.src = window.CONFIG.logo || "assets/img/logo.svg"; logo.alt = window.CONFIG.namaWeb || "CardioVerse"; }
    var bn = document.getElementById("brandName");
    if (bn) bn.textContent = window.CONFIG.namaWeb || "CardioVerse";
    var d = document.getElementById("disclaimer");
    if (d) d.textContent = window.CONFIG.disclaimer || "";
    var fi = document.getElementById("footInstitusi");
    if (fi) fi.textContent = window.CONFIG.institusi || "";
    var fd = document.getElementById("footDosen");
    if (fd) fd.textContent = window.CONFIG.dosen || "";
    document.title = (window.CONFIG.namaWeb || "CardioVerse") + " — Fisiologi Jantung";
  }

  function updateNav() {
    var u = (window.Auth && Auth.currentUser()) || null;
    var nl = document.getElementById("navLogin");
    var lo = document.getElementById("navLogout");
    var na = document.getElementById("navAdmin");
    if (nl) nl.hidden = !!u;
    if (lo) lo.hidden = !u;
    if (na) na.hidden = !(u && u.role === "admin");
  }

  function setTheme(mode) {
    Storage.update(function (p) { p.pengaturan = p.pengaturan || {}; p.pengaturan.mode = mode; });
    applySettings();
  }
  function setFont(px) {
    Storage.update(function (p) { p.pengaturan = p.pengaturan || {}; p.pengaturan.ukuranFont = px; });
    applySettings();
  }

  // ---- boot ----
  function boot() {
    if (!window.Storage) { console.error("Storage.js belum dimuat"); return; }
    applySettings();
    window.addEventListener("hashchange", render);
    var lo = document.getElementById("navLogout");
    if (lo) lo.addEventListener("click", function () {
      if (window.Auth) { Auth.logout(); App.toast("Sampai jumpa."); location.hash = "#/beranda"; App.render(); }
    });
    if (!location.hash) location.hash = "#/beranda";
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // expose tiny API
  window.App = {
    routes: routes,
    define: define,
    add: add,
    on: on,
    navigate: navigate,
    render: render,
    toast: toast,
    escapeHtml: escapeHtml,
    byId: byId,
    shuffle: shuffle,
    pct: pct,
    getProgress: getProgress,
    totalProgress: totalProgress,
    setTheme: setTheme,
    setFont: setFont,
    applySettings: applySettings,
    attachGlossary: attachGlossary
  };
})();
