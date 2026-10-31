/* The Panda Paw dashboard (admin.html).
   Loads the site's settings (js/config.js), all page text and the Arabic text from GitHub, lets the
   owner change numbers, prices, contact details, text, images and colours, then publishes everything
   as ONE commit. GitHub Pages rebuilds the live site about a minute later.
   The GitHub key is kept only in this browser (localStorage) and is sent only to api.github.com. */
(function () {
  "use strict";
  var REPO = "mhamwi760-art/pixel-panda-website", BRANCH = "main";
  var API = "https://api.github.com/repos/" + REPO;
  var START = "/* PP-SETTINGS-START */", END = "/* PP-SETTINGS-END */";
  var PAGES = [["index.html", "Panda Time"], ["packages.html", "Paw Packages"], ["branding.html", "Paw Branding"], ["contact.html", "Contact"]];
  var DEFAULT_COLORS = { teal: "#006D6F", turq: "#3DBCA8", yellow: "#FFC857", coral: "#FF6F61", pink: "#FF4D8D" };
  var COLOR_INFO = [
    ["teal", "Main teal", "Header, page tops, buttons, links"],
    ["turq", "Turquoise", "Sliders, ticks, icons, Build Your Bamboo"],
    ["yellow", "Yellow", "Contact buttons, highlights, Start button"],
    ["coral", "Coral", "Tags, accents, branding package"],
    ["pink", "Pink", "Small accents"]
  ];
  var SITE_PICS = [
    ["assets/mockups/phone-profile.png", "Panda Time: phone (profile)"],
    ["assets/mockups/phone-story.png", "Panda Time: phone (story)"],
    ["assets/mockups/phone-feed.png", "About us: phone (feed)"],
    ["assets/mockups/post-stories.png", "About us: post card"],
    ["assets/mockups/content-plan.png", "Paw Packages: content calendar"],
    ["assets/mockups/free-design-1.png", "Paw Packages: free design 1"],
    ["assets/mockups/free-design-3.png", "Paw Packages: free design 2 (middle)"],
    ["assets/mockups/free-design-2.png", "Paw Packages: free design 3"],
    ["assets/share/og-image.png", "Link preview picture (WhatsApp, iMessage…)"]
  ];
  var KEY_STORE = "pp-admin-token";
  var token = "", S = null;

  function $(id) { return document.getElementById(id); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function h(tag, props, kids) {                       // tiny element builder (text is always set safely)
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") e.textContent = props[k];
      else if (k === "class") e.className = props[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), props[k]);
      else if (props[k] !== false && props[k] != null) e.setAttribute(k, props[k] === true ? "" : props[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }

  /* ---------- text <-> base64 (UTF-8 safe, for Arabic) ---------- */
  function b64ToText(b64) { var bin = atob(b64.replace(/\s/g, "")), bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder().decode(bytes); }
  function bytesToB64(bytes) { var s = ""; for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
  function textToB64(t) { return bytesToB64(new TextEncoder().encode(t)); }

  /* ---------- GitHub API ---------- */
  function gh(path, method, body) {
    return fetch(API + path, {
      method: method || "GET",
      headers: { "Authorization": "Bearer " + token, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store"
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.message || ("GitHub error " + r.status)); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  function getFile(path, ref) {
    return gh("/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=" + encodeURIComponent(ref || BRANCH))
      .then(function (j) { return { text: b64ToText(j.content || ""), sha: j.sha }; });
  }
  function friendly(err) {
    if (err.status === 401) return "That key is not valid or has expired. Create a new one and log in again.";
    if (err.status === 403 || err.status === 404) return "This key can't change pixel-panda-website. Check it has the repository selected and Contents: Read and write.";
    if (err.message === "CONFLICT") return "Your website was changed somewhere else while the dashboard was open. Press Reload, then make your change again.";
    if (/Failed to fetch|NetworkError/i.test(err.message)) return "No connection to GitHub. Check your internet and try again.";
    return "Something went wrong: " + err.message;
  }

  /* ---------- login ---------- */
  function setLoginStatus(msg, cls) { var s = $("loginStatus"); s.textContent = msg; s.className = "status " + (cls || ""); }
  function login(t, silent) {
    token = t;
    if (!silent) setLoginStatus("Checking your key…");
    return gh("").then(function (repo) {
      if (!repo.permissions || !repo.permissions.push) { var e = new Error("read-only"); e.status = 403; throw e; }
      try { localStorage.setItem(KEY_STORE, t); } catch (er) {}
      $("loginView").hidden = true; $("appView").hidden = false; $("logout").hidden = false; $("saveBar").hidden = false;
      return load();
    }).catch(function (err) {
      token = ""; $("loginView").hidden = false; $("appView").hidden = true; $("saveBar").hidden = true;
      if (silent && err.status) { try { localStorage.removeItem(KEY_STORE); } catch (er) {} }   // a bad key is forgotten; a lost connection is not
      setLoginStatus(friendly(err), "err");
    });
  }
  $("loginBtn").addEventListener("click", function () { var t = $("token").value.trim(); if (t) login(t); else setLoginStatus("Paste your GitHub key first.", "err"); });
  $("token").addEventListener("keydown", function (e) { if (e.key === "Enter") $("loginBtn").click(); });
  $("logout").addEventListener("click", function () {
    if (S && changes().length && !confirm("You have changes that are not published. Log out anyway?")) return;
    try { localStorage.removeItem(KEY_STORE); } catch (er) {}
    location.reload();
  });

  /* ---------- load everything ---------- */
  function load() {
    $("loading").hidden = false; $("app").hidden = true;
    return gh("/git/ref/heads/" + BRANCH).then(function (ref) {
      var head = ref.object.sha;
      return Promise.all([getFile("js/config.js", head), getFile("js/i18n-ar.js", head)].concat(PAGES.map(function (p) { return getFile(p[0], head); })))
        .then(function (files) {
          var cfgFile = files[0], i = cfgFile.text.indexOf(START), j = cfgFile.text.indexOf(END);
          if (i < 0 || j < 0) throw new Error("js/config.js is missing the settings markers");
          var cfg = JSON.parse(cfgFile.text.slice(i + START.length, j));
          cfg.text = cfg.text || {}; cfg.colors = cfg.colors || clone(DEFAULT_COLORS);
          var w = {}; try { new Function("window", files[1].text)(w); } catch (e) { w.PP_AR = {}; }
          S = {
            head: head, cfgSha: cfgFile.sha, prefix: cfgFile.text.slice(0, i + START.length), suffix: cfgFile.text.slice(j),
            cfg: cfg, orig: clone(cfg), ar: w.PP_AR || {}, texts: collectTexts(files.slice(2)),
            uploads: {}, previews: {}
          };
          renderAll();
          $("loading").hidden = true; $("app").hidden = false;
        });
    }).catch(function (err) { $("loading").textContent = friendly(err); throw err; });
  }

  /* ---------- tabs ---------- */
  document.querySelectorAll(".tabs [data-tab]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".tabs [data-tab]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      document.querySelectorAll("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== b.getAttribute("data-tab"); });
    });
  });

  function renderAll() { renderPackages(); renderContact(); renderText(); renderImages(); renderColors(); refresh(); }

  /* ---------- change tracking ---------- */
  var AREA = {
    packages: function (k) { return /^(pk_|br_|price_|addon_)/.test(k); },
    contact: function (k) { return /^(instagram|formEmail|web3formsKey)$/.test(k); },
    text: function (k) { return k === "text"; },
    images: function (k) { return /^portfolio/.test(k); },
    colors: function (k) { return k === "colors"; }
  };
  function usedUploads() {
    var used = {};
    ["portfolio", "portfolio_branding"].forEach(function (k) { (S.cfg[k] || []).forEach(function (it) { if (it.image && S.uploads[it.image]) used[it.image] = 1; }); });
    SITE_PICS.forEach(function (p) { if (S.uploads[p[0]]) used[p[0]] = 1; });
    return Object.keys(used);
  }
  function changes() {
    var out = [], keys = {};
    Object.keys(S.cfg).concat(Object.keys(S.orig)).forEach(function (k) { keys[k] = 1; });
    Object.keys(AREA).forEach(function (a) {
      var hit = Object.keys(keys).some(function (k) { return AREA[a](k) && !same(S.cfg[k], S.orig[k]); });
      if (a === "images" && usedUploads().length) hit = true;
      if (hit) out.push(a);
    });
    return out;
  }
  var NAMES = { packages: "packages & prices", contact: "contact", text: "text", images: "images", colors: "colours" };
  function refresh() {
    var c = changes(), msg = $("saveMsg");
    document.querySelectorAll(".tabs [data-tab]").forEach(function (b) {
      var dot = b.querySelector(".dot"), on = c.indexOf(b.getAttribute("data-tab")) >= 0;
      if (on && !dot) b.appendChild(h("span", { class: "dot", "aria-hidden": "true" }));
      if (!on && dot) dot.remove();
    });
    $("save").disabled = !c.length; $("discard").disabled = !c.length;
    if (c.length) { msg.textContent = "Not published yet: " + c.map(function (a) { return NAMES[a]; }).join(", ") + "."; msg.className = "msg has"; }
    else if (!msg.classList.contains("ok")) { msg.textContent = "No changes yet."; msg.className = "msg"; }
  }
  function mark(input, changed) { input.classList.toggle("changed", !!changed); }
  window.addEventListener("beforeunload", function (e) { if (S && changes().length) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- packages & prices ---------- */
  function priceNum(o) { var m = /^\s*(\d+(?:\.\d+)?)\s*KWD\s*$/i.exec(o && o.en || ""); return m ? m[1] : ""; }
  function priceObj(n) { n = String(n).trim(); return n === "" ? { en: "[Price]", ar: "[السعر]" } : { en: n + " KWD", ar: n + " د.ك" }; }
  function numField(label, get, set, orig, min) {
    var inp = h("input", { type: "number", min: String(min || 0), step: "1", inputmode: "numeric", value: String(get()) });
    inp.addEventListener("input", function () { var v = inp.value === "" ? 0 : Math.max(min || 0, Math.round(+inp.value) || 0); set(v); mark(inp, v !== orig()); refresh(); });
    mark(inp, get() !== orig());
    return h("div", {}, [h("label", { class: "f", text: label }), inp]);
  }
  function priceField(label, key) {
    var inp = h("input", { type: "number", min: "0", step: "1", inputmode: "decimal", placeholder: "not set", value: priceNum(S.cfg[key]) });
    inp.addEventListener("input", function () { S.cfg[key] = priceObj(inp.value); mark(inp, !same(S.cfg[key], S.orig[key])); refresh(); });
    mark(inp, !same(S.cfg[key], S.orig[key]));
    return h("div", {}, [h("label", { class: "f", text: label }), inp]);
  }
  function pkNum(pk, k, label) {
    S.cfg[pk] = S.cfg[pk] || {};
    return numField(label, function () { return +S.cfg[pk][k] || 0; }, function (v) { S.cfg[pk][k] = v; }, function () { return +((S.orig[pk] || {})[k]) || 0; });
  }
  function renderPackages() {
    var box = $("socialPk"); box.innerHTML = "";
    [["pk_cub", "The Cub", "#3DBCA8", "price_cub"], ["pk_grove", "The Bamboo Grove", "#006D6F", "price_grove"], ["pk_empire", "The Panda Empire", "#111414", "price_empire"]].forEach(function (p) {
      box.appendChild(h("div", { class: "pk" }, [
        h("h3", {}, [h("i", { style: "background:" + p[2] }), p[1]]),
        h("div", { class: "grid g6" }, [
          pkNum(p[0], "posts", "Post designs"), pkNum(p[0], "stories", "Story designs"), pkNum(p[0], "highlights", "Highlights"),
          pkNum(p[0], "reels", "Reels"), pkNum(p[0], "ads", "Ad designs"), pkNum(p[0], "photos", "Photos")
        ]),
        h("div", { class: "grid g3", style: "margin-top:10px" }, [priceField("Price per month (KWD)", p[3])])
      ]));
    });
    var bp = $("brandPk"); bp.innerHTML = "";
    [["br_paw", "The Paw Print", "#FF6F61", "price_paw"], ["br_signature", "The Panda Signature", "#006D6F", "price_signature"]].forEach(function (p) {
      bp.appendChild(h("div", { class: "pk" }, [
        h("h3", {}, [h("i", { style: "background:" + p[2] }), p[1]]),
        h("div", { class: "grid g3" }, [pkNum(p[0], "logos", "Logo concepts"), priceField("One-time price (KWD)", p[3])])
      ]));
    });
    bindText($("pc-en"), function () { return (S.cfg.price_custom || {}).en || ""; }, function (v) { S.cfg.price_custom = S.cfg.price_custom || {}; S.cfg.price_custom.en = v; }, function () { return (S.orig.price_custom || {}).en || ""; });
    bindText($("pc-ar"), function () { return (S.cfg.price_custom || {}).ar || ""; }, function (v) { S.cfg.price_custom = S.cfg.price_custom || {}; S.cfg.price_custom.ar = v; }, function () { return (S.orig.price_custom || {}).ar || ""; });
  }
  function bindText(inp, get, set, orig, clean) {
    inp.value = get();
    inp.oninput = function () { var v = clean ? clean(inp.value) : inp.value; if (clean && v !== inp.value) inp.value = v; set(v); mark(inp, v !== orig()); refresh(); };
    mark(inp, get() !== orig());
  }

  /* ---------- contact ---------- */
  function renderContact() {
    function plain(key, inp, clean, emptyAs) {
      bindText(inp, function () { var v = S.cfg[key] || ""; return emptyAs && v === emptyAs ? "" : v; },
        function (v) { S.cfg[key] = v === "" && emptyAs ? emptyAs : v; },
        function () { var v = S.orig[key] || ""; return emptyAs && v === emptyAs ? "" : v; }, clean);
    }
    plain("instagram", $("c-ig"), null, "[@instagram handle]");
    plain("formEmail", $("c-mail"), function (v) { return v.trim(); });
    plain("web3formsKey", $("c-w3f"), function (v) { return v.trim(); });
  }

  /* ---------- text ---------- */
  function collectTexts(pageFiles) {
    var map = {}, order = [];
    pageFiles.forEach(function (f, n) {
      var doc = new DOMParser().parseFromString(f.text, "text/html"), page = PAGES[n][1];
      doc.querySelectorAll("[data-i18n]").forEach(function (e) {
        var key = e.getAttribute("data-i18n"), en = e.innerHTML.trim();
        if (!en) return;
        var shared = e.closest("header, footer");
        if (!map[key]) {
          var sec = e.closest("section"), hd = sec && sec.querySelector("h1, h2");
          map[key] = { key: key, en: en, pages: [], where: shared ? (e.closest("footer") ? "Footer" : "Menu") : (hd ? hd.textContent.replace(/\s+/g, " ").trim() : (sec && sec.id) || "Page") };
          order.push(map[key]);
        }
        var label = shared ? "Menu & footer" : page;
        if (map[key].pages.indexOf(label) < 0) map[key].pages.push(label);
      });
    });
    return order;
  }
  var txShown = 60;
  function txValue(item, lang) { var o = S.cfg.text[item.key]; return o && o[lang] != null ? o[lang] : (lang === "en" ? item.en : (S.ar[item.key] || "")); }
  function txOrig(item, lang) { return lang === "en" ? item.en : (S.ar[item.key] || ""); }
  function setTx(item, lang, v) {
    var o = S.cfg.text[item.key] || {};
    if (v.trim() === txOrig(item, lang).trim()) delete o[lang]; else o[lang] = v;
    if (Object.keys(o).length) S.cfg.text[item.key] = o; else delete S.cfg.text[item.key];
  }
  function rowsFor(t) { return Math.min(9, Math.max(1, Math.ceil(t.length / 58))); }
  function renderText() {
    var q = $("txSearch").value.trim().toLowerCase(), pg = $("txPage").value, list = $("txList");
    var hits = S.texts.filter(function (it) {
      if (pg === "changed") { if (!S.cfg.text[it.key]) return false; }
      else if (pg && it.pages.indexOf(pg) < 0) return false;
      if (!q) return true;
      return (txValue(it, "en") + " " + txValue(it, "ar") + " " + it.key).toLowerCase().indexOf(q) >= 0;
    });
    list.innerHTML = "";
    if (!hits.length) list.appendChild(h("p", { class: "hint", text: "No text matches your search." }));
    hits.slice(0, txShown).forEach(function (it) {
      var card = h("div", { class: "tx" + (S.cfg.text[it.key] ? " is-changed" : "") });
      var en = h("textarea", { rows: String(rowsFor(txValue(it, "en"))), "aria-label": "English" }), ar = h("textarea", { rows: String(rowsFor(txValue(it, "ar"))), dir: "rtl", lang: "ar", "aria-label": "Arabic" });
      en.value = txValue(it, "en"); ar.value = txValue(it, "ar");
      var reset = h("button", { class: "btn ghost small", type: "button", text: "Undo change", hidden: !S.cfg.text[it.key] });
      function upd() { card.classList.toggle("is-changed", !!S.cfg.text[it.key]); reset.hidden = !S.cfg.text[it.key]; refresh(); }
      en.addEventListener("input", function () { setTx(it, "en", en.value); upd(); });
      ar.addEventListener("input", function () { setTx(it, "ar", ar.value); upd(); });
      reset.addEventListener("click", function () { delete S.cfg.text[it.key]; en.value = txValue(it, "en"); ar.value = txValue(it, "ar"); upd(); });
      card.appendChild(h("div", { class: "tx-head" }, [h("span", {}, [h("b", { text: it.pages.join(", ") }), " · " + it.where]), reset]));
      card.appendChild(h("div", { class: "pair" }, [
        h("div", {}, [h("label", { class: "f", text: "English" }), en]),
        h("div", {}, [h("label", { class: "f", text: "العربية" }), ar])
      ]));
      list.appendChild(card);
    });
    $("txMore").hidden = hits.length <= txShown;
    $("txMore").textContent = "Show more (" + (hits.length - txShown) + " left)";
  }
  var txTimer = 0;
  $("txSearch").addEventListener("input", function () { clearTimeout(txTimer); txTimer = setTimeout(function () { txShown = 60; renderText(); }, 200); });
  $("txPage").addEventListener("change", function () { txShown = 60; renderText(); });
  $("txMore").addEventListener("click", function () { txShown += 60; renderText(); });

  /* ---------- images ---------- */
  function rawUrl(path) { return "https://raw.githubusercontent.com/" + REPO + "/" + S.head + "/" + path; }
  function resize(file, maxSide, type) {
    return new Promise(function (ok, bad) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        var g = c.getContext("2d"); if (type === "image/jpeg") { g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); }
        g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        var data = c.toDataURL(type, .86); ok({ dataURL: data, b64: data.split(",")[1] });
      };
      img.onerror = function () { URL.revokeObjectURL(url); bad(new Error("That file is not a picture this browser can read. Try a JPG or PNG.")); };
      img.src = url;
    });
  }
  function pick(accept) {
    return new Promise(function (ok) {
      var inp = h("input", { type: "file", accept: accept || "image/*" });
      inp.addEventListener("change", function () { ok(inp.files && inp.files[0]); });
      inp.click();
    });
  }
  function thumb(path, contain) {
    var src = path ? (S.previews[path] || rawUrl(path)) : "";
    var t = h("div", { class: "thumb" + (src ? " has" : "") + (contain ? " contain" : "") }, src ? [] : ["No picture yet"]);
    if (src) t.style.backgroundImage = "url(\"" + src.replace(/"/g, "%22") + "\")";
    return t;
  }
  function slug(s) { return (s || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "item"; }
  function renderFolio(key, box) {
    box.innerHTML = "";
    var items = S.cfg[key] = S.cfg[key] || [];
    items.forEach(function (it, n) {
      it.label = it.label || { en: "", ar: "" };
      var origIt = (S.orig[key] || [])[n];
      var en = h("input", { type: "text", value: it.label.en || "", "aria-label": "Label (English)" });
      var ar = h("input", { type: "text", value: it.label.ar || "", dir: "rtl", "aria-label": "Label (Arabic)" });
      en.addEventListener("input", function () { it.label.en = en.value; it.alt = en.value; refresh(); });
      ar.addEventListener("input", function () { it.label.ar = ar.value; refresh(); });
      function move(d) { var j = n + d; if (j < 0 || j >= items.length) return; items.splice(j, 0, items.splice(n, 1)[0]); renderFolio(key, box); refresh(); }
      var row = h("div", { class: "im" + (same(it, origIt) ? "" : " is-changed") }, [
        thumb(it.image),
        h("div", { class: "grid g2" }, [h("div", {}, [h("label", { class: "f", text: "Label (English)" }), en]), h("div", {}, [h("label", { class: "f", text: "Label (Arabic)" }), ar])]),
        h("div", { class: "acts" }, [
          h("div", { class: "row" }, [
            h("button", { class: "btn teal small", type: "button", text: it.image ? "Replace picture" : "Upload picture", onclick: function () {
              pick().then(function (file) {
                if (!file) return;
                return resize(file, 1600, "image/jpeg").then(function (r) {
                  var path = "assets/portfolio/" + Date.now().toString(36) + "-" + slug(it.label.en) + ".jpg";
                  S.uploads[path] = r.b64; S.previews[path] = r.dataURL; it.image = path; it.alt = it.label.en || "";
                  renderFolio(key, box); refresh();
                });
              }).catch(function (e) { alert(e.message); });
            } }),
            it.image ? h("button", { class: "btn ghost small", type: "button", text: "Remove picture", onclick: function () { it.image = ""; renderFolio(key, box); refresh(); } }) : null
          ]),
          h("div", { class: "row" }, [
            h("button", { class: "btn ghost small", type: "button", text: "↑", "aria-label": "Move up", disabled: n === 0, onclick: function () { move(-1); } }),
            h("button", { class: "btn ghost small", type: "button", text: "↓", "aria-label": "Move down", disabled: n === items.length - 1, onclick: function () { move(1); } }),
            h("button", { class: "btn ghost small", type: "button", text: "Delete", onclick: function () { if (confirm("Delete this gallery item?")) { items.splice(n, 1); renderFolio(key, box); refresh(); } } })
          ])
        ])
      ]);
      box.appendChild(row);
    });
    if (!items.length) box.appendChild(h("p", { class: "hint", text: "The gallery is empty. Add an item below." }));
  }
  document.querySelectorAll("[data-add]").forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.getAttribute("data-add");
      S.cfg[key].push({ image: "", alt: "", label: { en: "New item", ar: "عنصر جديد" } });
      renderFolio(key, $(key === "portfolio" ? "folio1" : "folio2")); refresh();
    });
  });
  function renderSitePics() {
    var box = $("sitePics"); box.innerHTML = "";
    SITE_PICS.forEach(function (p) {
      var staged = !!S.uploads[p[0]];
      box.appendChild(h("div", { class: "im" + (staged ? " is-changed" : "") }, [
        thumb(p[0], true),
        h("div", {}, [h("b", { text: p[1] }), h("div", { class: "hint", text: staged ? "New picture ready to publish." : p[0] })]),
        h("div", { class: "acts" }, [h("div", { class: "row" }, [
          h("button", { class: "btn teal small", type: "button", text: "Replace", onclick: function () {
            pick().then(function (file) {
              if (!file) return;
              return resize(file, p[0].indexOf("og-image") >= 0 ? 1200 : 1600, "image/png").then(function (r) { S.uploads[p[0]] = r.b64; S.previews[p[0]] = r.dataURL; renderSitePics(); refresh(); });
            }).catch(function (e) { alert(e.message); });
          } }),
          staged ? h("button", { class: "btn ghost small", type: "button", text: "Undo", onclick: function () { delete S.uploads[p[0]]; delete S.previews[p[0]]; renderSitePics(); refresh(); } }) : null
        ])])
      ]));
    });
  }
  function renderImages() { renderFolio("portfolio", $("folio1")); renderFolio("portfolio_branding", $("folio2")); renderSitePics(); }

  /* ---------- colours ---------- */
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return "#" + x.map(function (v, i) { return ("0" + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join("").toUpperCase(); }
  function themeCss(c) {
    var head = "/* Brand colours chosen in the dashboard (admin.html → Colours).\n   The dashboard rewrites this file; it is empty while the original colours are used. */\n";
    if (same(c, DEFAULT_COLORS)) return head;
    return head +
      ":root {\n  --teal: " + c.teal + "; --teal-dark: " + mix(c.teal, "#000000", .19) + "; --turq: " + c.turq + "; --yellow: " + c.yellow + "; --coral: " + c.coral + "; --pink: " + c.pink + ";\n" +
      "  --brand-bg: " + c.teal + "; --brand-bg-2: " + mix(c.teal, "#000000", .19) + "; --accent-text: " + c.teal + ";\n}\n" +
      "[data-theme=\"dark\"] {\n  --brand-bg: " + mix(c.teal, "#000000", .33) + "; --brand-bg-2: " + mix(c.teal, "#000000", .45) + "; --accent-text: " + mix(c.turq, "#FFFFFF", .25) + ";\n}\n";
  }
  function renderColors() {
    var box = $("cols"); box.innerHTML = "";
    COLOR_INFO.forEach(function (ci) {
      var k = ci[0], pickr = h("input", { type: "color", value: S.cfg.colors[k], "aria-label": ci[1] }), hex = h("input", { type: "text", value: S.cfg.colors[k], spellcheck: "false", "aria-label": ci[1] + " code" });
      function set(v) { S.cfg.colors[k] = v.toUpperCase(); pickr.value = v; hex.value = v.toUpperCase(); mark(hex, S.cfg.colors[k] !== S.orig.colors[k]); preview(); refresh(); }
      pickr.addEventListener("input", function () { set(pickr.value); });
      hex.addEventListener("input", function () { if (/^#[0-9a-f]{6}$/i.test(hex.value.trim())) set(hex.value.trim()); });
      mark(hex, S.cfg.colors[k] !== S.orig.colors[k]);
      box.appendChild(h("div", { class: "col" }, [pickr, h("div", {}, [h("b", { text: ci[1] }), h("small", { text: ci[2] })]), hex]));
    });
    preview();
  }
  function preview() {
    var c = S.cfg.colors;
    $("pvBar").style.background = c.teal; $("pvBtn").style.background = c.yellow; $("pvBtn").style.color = "#111414";
    $("pvTeal").style.background = c.teal; $("pvQ").style.background = c.turq; $("pvY").style.background = c.yellow; $("pvC").style.background = c.coral; $("pvP").style.background = c.pink;
  }
  $("colReset").addEventListener("click", function () { S.cfg.colors = clone(DEFAULT_COLORS); renderColors(); refresh(); });

  /* ---------- discard ---------- */
  $("discard").addEventListener("click", function () {
    if (!confirm("Throw away all changes that are not published?")) return;
    S.cfg = clone(S.orig); S.uploads = {}; S.previews = {}; renderAll();
  });

  /* ---------- save & publish: one commit with every changed file ---------- */
  function setMsg(t, cls) { var m = $("saveMsg"); m.textContent = t; m.className = "msg " + (cls || ""); }
  $("save").addEventListener("click", function () {
    var areas = changes(); if (!areas.length) return;
    $("save").disabled = true; $("discard").disabled = true;
    setMsg("Publishing… please keep this page open.");
    var stamp = Math.floor(Date.now() / 1000), files = [], head;
    var cfgChanged = !same(S.cfg, S.orig), colorsChanged = !same(S.cfg.colors, S.orig.colors);
    gh("/git/ref/heads/" + BRANCH).then(function (ref) {
      head = ref.object.sha;
      return getFile("js/config.js", head);
    }).then(function (cur) {
      if (cur.sha !== S.cfgSha) throw new Error("CONFLICT");
      if (cfgChanged) files.push({ path: "js/config.js", b64: textToB64(S.prefix + "\n" + JSON.stringify(S.cfg, null, 2) + "\n" + S.suffix) });
      if (colorsChanged) files.push({ path: "css/theme.css", b64: textToB64(themeCss(S.cfg.colors)) });
      usedUploads().forEach(function (p) { files.push({ path: p, b64: S.uploads[p] }); });
      if (!cfgChanged && !colorsChanged) return;
      /* new version numbers on the pages, so visitors get the new settings straight away */
      return Promise.all(PAGES.map(function (p) { return getFile(p[0], head); })).then(function (pages) {
        pages.forEach(function (pg, n) {
          var t = pg.text;
          if (cfgChanged) t = t.replace(/js\/config\.js\?v=[\w.-]*/g, "js/config.js?v=" + stamp);
          if (colorsChanged) t = t.replace(/css\/theme\.css\?v=[\w.-]*/g, "css/theme.css?v=" + stamp);
          if (t !== pg.text) files.push({ path: PAGES[n][0], b64: textToB64(t) });
        });
      });
    }).then(function () {
      return Promise.all(files.map(function (f) {
        return gh("/git/blobs", "POST", { content: f.b64, encoding: "base64" }).then(function (b) { f.sha = b.sha; });
      }));
    }).then(function () {
      return gh("/git/commits/" + head);
    }).then(function (c) {
      return gh("/git/trees", "POST", { base_tree: c.tree.sha, tree: files.map(function (f) { return { path: f.path, mode: "100644", type: "blob", sha: f.sha }; }) });
    }).then(function (tree) {
      return gh("/git/commits", "POST", { message: "Dashboard: " + areas.map(function (a) { return NAMES[a]; }).join(", "), tree: tree.sha, parents: [head] });
    }).then(function (commit) {
      return gh("/git/refs/heads/" + BRANCH, "PATCH", { sha: commit.sha }).then(function () { return commit; });
    }).then(function (commit) {
      var cfgFile = files.filter(function (f) { return f.path === "js/config.js"; })[0];
      if (cfgFile) S.cfgSha = cfgFile.sha;
      S.head = commit.sha; S.orig = clone(S.cfg); S.uploads = {};
      renderAll();
      setMsg("Published! Your website updates in about 1 minute (refresh it to see the change).", "ok");
    }).catch(function (err) {
      setMsg(friendly(err), "err");
      if (err.message === "CONFLICT") {
        var b = h("button", { class: "btn ghost small", type: "button", text: "Reload", onclick: function () { S = null; location.reload(); } });
        $("saveMsg").appendChild(document.createTextNode(" ")); $("saveMsg").appendChild(b);
      }
      $("save").disabled = false; $("discard").disabled = false;
    });
  });

  /* ---------- start ---------- */
  var saved = ""; try { saved = localStorage.getItem(KEY_STORE) || ""; } catch (e) {}
  if (saved) login(saved, true);
})();
