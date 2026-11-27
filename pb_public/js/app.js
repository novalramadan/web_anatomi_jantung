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

  var leaveFns = [];
  function onLeave(fn) { leaveFns.push(fn); }

  function render() {
    leaveFns.splice(0).forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    document.body.classList.remove("auth-page");
    var r = resolve(location.hash);
    var app = document.getElementById("app");
    app.innerHTML = "";
    current = { path: r.name, params: r.params };

    var publicRoute = r.name === "login" || r.name === "register";
    var user = (window.Auth && Auth.currentUser()) || null;
    if (!user && !publicRoute) {
      location.hash = "#/login";
      return;
    }
    if (user && publicRoute) {
      location.hash = user.role === "dosen" ? "#/statistik" : user.role === "admin" ? "#/admin" : "#/beranda";
      return;
    }

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

  // ---- dialog seragam: alert / confirm / prompt / modal ----
  var dialogSeq = 0;
  var dialogOpen = 0;
  var DIALOG_ICONS = {
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
    question: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4"/><path d="M12 17h.01"/></svg>',
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 17H3z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>',
    danger: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>'
  };

  function focusables(root) {
    return Array.prototype.slice.call(root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); });
  }

  function buildDialog(opts) {
    opts = opts || {};
    var mode = opts.mode || "confirm";
    var kind = opts.kind || (opts.danger ? "danger" : mode === "confirm" ? "question" : "info");
    var title = opts.title || (mode === "alert" ? "Informasi" : mode === "prompt" ? "Input" : mode === "modal" ? "Detail" : "Konfirmasi");
    var sizeCls = opts.size === "sm" ? " modal-sm" : opts.size === "lg" ? " modal-lg" : "";
    var id = opts.id || ("appDialog" + (++dialogSeq));
    var titleId = id + "Title";
    var showInput = mode === "prompt";
    var confirmText = opts.confirmText || (mode === "alert" ? "OK" : mode === "modal" ? "Tutup" : mode === "prompt" ? "Simpan" : "Lanjutkan");
    var cancelText = opts.cancelText || "Batal";
    var confirmCls = "btn " + (kind === "danger" ? "btn-danger" : "btn-primary");
    var messageHtml = opts.message != null ? '<p class="modal-msg">' + escapeHtml(opts.message) + '</p>' : "";
    var inputHtml = "";
    if (showInput) {
      var inputValue = opts.value == null ? "" : String(opts.value);
      var ph = opts.placeholder ? ' placeholder="' + escapeHtml(opts.placeholder) + '"' : "";
      inputHtml = '<label class="field mt-3"><span class="lbl">' + escapeHtml(opts.inputLabel || "Jawaban") + '</span>' +
        (opts.multiline
          ? '<textarea class="input" rows="3" data-dialog-input' + ph + '>' + escapeHtml(inputValue) + '</textarea>'
          : '<input class="input" type="' + escapeHtml(opts.inputType || "text") + '" data-dialog-input value="' + escapeHtml(inputValue) + '"' + ph + '>') +
        '</label>';
    }
    var footer;
    if (opts.footer != null) {
      footer = opts.footer; // pemanggil menyusun tombol sendiri
    } else if (mode === "modal" || mode === "alert") {
      footer = '<button type="button" class="' + confirmCls + '" data-dialog-confirm>' + escapeHtml(confirmText) + '</button>';
    } else {
      footer = '<button type="button" class="btn" data-dialog-cancel>' + escapeHtml(cancelText) + '</button>' +
        '<button type="button" class="' + confirmCls + '" data-dialog-confirm>' + escapeHtml(confirmText) + '</button>';
    }
    var overlay = document.createElement("div");
    overlay.className = "modal-back show";
    overlay.id = id;
    overlay.innerHTML = '<div class="modal' + sizeCls + '" role="dialog" aria-modal="true" aria-labelledby="' + titleId + '">' +
      '<div class="modal-head">' +
      '<span class="modal-icon ' + escapeHtml(kind) + '" aria-hidden="true">' + (DIALOG_ICONS[kind] || DIALOG_ICONS.info) + '</span>' +
      '<div class="modal-headtext"><h2 class="modal-title" id="' + titleId + '">' + escapeHtml(title) + '</h2>' +
      (opts.subtitle ? '<p class="modal-subtitle">' + escapeHtml(opts.subtitle) + '</p>' : '') +
      '</div>' +
      '<button type="button" class="modal-close" data-dialog-close aria-label="Tutup dialog">×</button>' +
      '</div>' +
      '<div class="modal-body">' + messageHtml + (opts.body || "") + inputHtml + '</div>' +
      '<div class="modal-foot">' + footer + '</div>' +
      '</div>';

    var settled = false;
    var resolveResult;
    var result = new Promise(function (res) { resolveResult = res; });
    var prevFocus = document.activeElement;
    var cancelValue = function () {
      return mode === "alert" || mode === "modal" ? true : mode === "prompt" ? null : false;
    };
    var close = function (value) {
      if (settled) return;
      settled = true;
      overlay.remove();
      dialogOpen = Math.max(0, dialogOpen - 1);
      if (!dialogOpen) document.documentElement.classList.remove("dialog-open");
      if (prevFocus && typeof prevFocus.focus === "function") {
        try { prevFocus.focus(); } catch (e) {}
      }
      if (typeof opts.onClose === "function") {
        try { opts.onClose(value); } catch (e) { console.error(e); }
      }
      resolveResult(value);
    };
    var onKey = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close(cancelValue());
        return;
      }
      if (e.key !== "Tab") return;
      var list = focusables(overlay);
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    overlay.addEventListener("keydown", onKey);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) { close(cancelValue()); return; }
      var btn = e.target.closest ? e.target.closest("[data-dialog-confirm],[data-dialog-cancel],[data-dialog-close]") : null;
      if (!btn) return;
      if (btn.hasAttribute("data-dialog-confirm")) {
        if (mode === "prompt") {
          var inp = overlay.querySelector("[data-dialog-input]");
          close(inp ? inp.value : "");
        } else {
          close(true);
        }
        return;
      }
      close(cancelValue());
    });
    var inputEl = overlay.querySelector("[data-dialog-input]");
    if (inputEl && mode === "prompt" && !opts.multiline) {
      inputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); close(inputEl.value); }
      });
    }
    document.body.appendChild(overlay);
    dialogOpen++;
    document.documentElement.classList.add("dialog-open");
    var focusTarget = inputEl ||
      (kind === "danger" && overlay.querySelector("[data-dialog-cancel]")) ||
      overlay.querySelector("[data-dialog-confirm]") ||
      overlay.querySelector(".modal-close");
    setTimeout(function () {
      if (!focusTarget) return;
      focusTarget.focus();
      if (mode === "prompt" && inputEl && inputEl.select) {
        try { inputEl.select(); } catch (e) {}
      }
    }, 30);
    return { el: overlay, close: close, result: result };
  }

  function dialog(opts) { return buildDialog(opts || {}).result; }
  function alertDialog(message, opts) {
    opts = opts || {};
    opts.mode = "alert";
    opts.message = message;
    if (!opts.kind) opts.kind = "info";
    if (!opts.confirmText) opts.confirmText = "OK";
    return buildDialog(opts).result;
  }
  function confirmDialog(message, opts) {
    opts = opts || {};
    opts.mode = "confirm";
    opts.message = message;
    if (!opts.kind) opts.kind = opts.danger ? "danger" : "question";
    if (!opts.confirmText) opts.confirmText = "Lanjutkan";
    return buildDialog(opts).result;
  }
  function promptDialog(message, opts) {
    opts = opts || {};
    opts.mode = "prompt";
    opts.message = message;
    if (!opts.kind) opts.kind = "question";
    if (!opts.confirmText) opts.confirmText = "Simpan";
    return buildDialog(opts).result;
  }
  function modalDialog(opts) {
    opts = opts || {};
    opts.mode = "modal";
    return buildDialog(opts);
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
    if (logo) { logo.src = window.CONFIG.logo || "assets/img/logo.svg"; logo.alt = window.CONFIG.namaWeb || "Medical-U"; }
    var bn = document.getElementById("brandName");
    if (bn) bn.textContent = window.CONFIG.namaWeb || "Medical-U";
    var d = document.getElementById("disclaimer");
    if (d) d.textContent = window.CONFIG.disclaimer || "";
    var fi = document.getElementById("footInstitusi");
    if (fi) fi.textContent = window.CONFIG.institusi || "";
    var fd = document.getElementById("footDosen");
    if (fd) fd.textContent = window.CONFIG.dosen || "";
    document.title = (window.CONFIG.namaWeb || "Medical-U") + " — Fisiologi Jantung";
  }

  function updateNav() {
    var u = (window.Auth && Auth.currentUser()) || null;
    var nl = document.getElementById("navLogin");
    var lo = document.getElementById("navLogout");
    var na = document.getElementById("navAdmin");
    var ns = document.getElementById("navStatistik");
    var links = document.getElementById("navLinks");
    var box = document.getElementById("navUser");
    var name = document.getElementById("navUserName");
    var role = document.getElementById("navUserRole");
    if (nl) nl.hidden = !!u;
    if (lo) lo.hidden = !u;
    if (na) na.hidden = !(u && (u.role === "admin" || u.role === "dosen"));
    if (ns) ns.hidden = !(u && u.role === "dosen");
    if (links) links.hidden = !u;
    if (box) box.hidden = !u;
    if (name) name.textContent = u ? (u.nama || u.email || "Pengguna") : "";
    if (role) role.textContent = u ? (u.role === "dosen" ? "Dosen" : u.role === "admin" ? "Admin" : "Mahasiswa") : "";

    // Kuis: dosen/admin hanya pratinjau, jadi labelnya dibedakan.
    var nk = document.getElementById("navKuis");
    if (nk) {
      var isDosen = !!(u && (u.role === "dosen" || u.role === "admin"));
      var nkLabel = nk.querySelector(".nav-label");
      if (nkLabel) nkLabel.textContent = isDosen ? "Preview Kuis" : "Kuis";
      if (isDosen) nk.setAttribute("title", "Pratinjau kuis (mode dosen)");
      else nk.removeAttribute("title");
    }
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
    window.addEventListener("medicalu:auth", updateNav);
    var lo = document.getElementById("navLogout");
    if (lo) lo.addEventListener("click", function () {
      if (window.Auth) { Auth.logout(); App.toast("Sampai jumpa."); location.hash = "#/beranda"; App.render(); }
    });
    if (!location.hash) location.hash = "#/beranda";
    render();
  }

  function start() {
    if (!window.PB || !window.PB.ready) { boot(); return; }
    window.PB.ready.then(function () { boot(); }).catch(function (err) {
      console.error("Medical-U tidak dapat memuat data:", err);
      var app = document.getElementById("app");
      if (app) {
        var detail = (err && err.message) ? App.escapeHtml(String(err.message)) : "unknown error; buka console untuk detail";
        app.innerHTML = '<div class="surface-card p-6"><h1>Data tidak dapat dimuat</h1><p class="text-ink-2">' + detail + '. Pastikan PocketBase berjalan di ' + window.location.origin + ' lalu muat ulang halaman (Ctrl+Shift+R).</p></div>';
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  // expose tiny API
  window.App = {
    routes: routes,
    define: define,
    add: add,
    on: on,
    onLeave: onLeave,
    navigate: navigate,
    render: render,
    toast: toast,
    dialog: dialog,
    alert: alertDialog,
    confirm: confirmDialog,
    prompt: promptDialog,
    modal: modalDialog,
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
