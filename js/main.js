/* The Panda Paw — site behaviour (all 4 pages). You should not need to edit
   this file; contact details and prices are in js/config.js. */
(function () {
  "use strict";
  if (window.NodeList && !NodeList.prototype.forEach) NodeList.prototype.forEach = Array.prototype.forEach;   // older phones
  var C = window.PP_CONFIG || {};
  var AR = window.PP_AR || {};
  var root = document.documentElement;
  var page = document.body.getAttribute("data-page") || "";
  var titleEN = document.title;
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id) { return document.getElementById(id); }
  var EN = {};      // filled from the English text in the page
  var EN_JS = {
    "js.required": "Please add your name and phone number.",
    "js.phone": "Please check your phone number.",
    "js.terms": "Please accept the Terms & Conditions to send your request.",
    "js.sending": "Sending…",
    "js.sent": "Thank you! Your request is in. We will contact you soon.",
    "js.dmOpened": "Instagram is opening in a new tab. Your request is copied: paste it in the chat and send.",
    "js.dmIntro": "Hi The Panda Paw! Here is my request from your website:",
    "js.copied": "Copied!",
    "dm.name": "Name", "dm.brand": "Brand", "dm.phone": "Phone", "dm.insta": "Instagram", "dm.interest": "Interested in", "dm.plan": "Build Your Bamboo", "dm.addons": "Add-ons", "dm.msg": "Message",
    "js.failed": "That didn't go through. Please try again or message us on Instagram.",
    "js.activate": "The form is almost ready: the request email still needs to be activated. Please message us on Instagram for now.",
    "js.langBtn": "اقرأ الموقع بالعربية",
    "js.toDark": "Switch to dark mode",
    "js.toLight": "Switch to light mode",
    "js.openAll": "Open all",
    "js.closeAll": "Close all",
    "js.yes": "Yes",
    "js.no": "No",
    "plan.posts": "Instagram post designs",
    "plan.stories": "Instagram story designs",
    "plan.highlights": "Instagram highlights",
    "plan.reels": "Reels",
    "plan.ads": "Ad designs",
    "plan.photos": "Photography images",
    "plan.rush": "Rush delivery",
    "pk.upto": "up to",
    "ad.none": "Pick the add-ons you need.",
    "ad.count1": "1 add-on selected",
    "ad.count": "%n add-ons selected",
    "pk.none": "Not included",
    "bg.count": "Question %n of %t",
    "bg.countDone": "Your plan",
    "wk.ph": "[Portfolio image]"
  };
  var PLAN_KEYS = ["posts", "stories", "highlights", "reels", "ads", "photos"];
  var lang = "en";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isPh(v) { return !v || /^\s*\[/.test(v); }
  function raw(key) { return key.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, C); }   // "pk_cub.posts" style keys
  function val(key) { var v = raw(key); if (v && typeof v === "object") v = v[lang] || v.en; return v == null ? "" : String(v); }
  function show(v) { return isPh(v) ? '<span class="ph">' + esc(v || "[—]") + "</span>" : esc(v); }
  function fill(text) { return text.replace(/\{(\w+)\}/g, function (_, k) { return show(val(k)); }); }
  function t(key) { return lang === "ar" ? (AR[key] || EN[key] || EN_JS[key] || key) : (EN[key] || EN_JS[key] || key); }
  function tEN(key) { return EN[key] || EN_JS[key] || key; }
  function qp(name) { var m = location.search.match(new RegExp("[?&]" + name + "=([^&#]*)")); return m ? decodeURIComponent(m[1]) : null; }
  function plain(html) { var d = document.createElement("div"); d.innerHTML = html; return (d.textContent || "").trim(); }

  /* ---------- capture English, then apply language ---------- */
  var nodes = document.querySelectorAll("[data-i18n]");
  nodes.forEach(function (el) { var k = el.getAttribute("data-i18n"); if (!(k in EN)) EN[k] = el.innerHTML.trim(); });
  var attrNodes = document.querySelectorAll("[data-i18n-attr]");
  attrNodes.forEach(function (el) {
    el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
      var p = pair.split(":");
      if (!(p[1] in EN)) EN[p[1]] = el.getAttribute(p[0]) || EN[p[1]];
    });
  });
  /* wording changed in the dashboard replaces the original English / Arabic */
  var TX = C.text || {};
  Object.keys(TX).forEach(function (k) { if (TX[k] && TX[k].en) EN[k] = TX[k].en; if (TX[k] && TX[k].ar) AR[k] = TX[k].ar; });

  /* package numbers from the settings (0 or empty = not included) */
  function renderNums() {
    document.querySelectorAll("[data-num]").forEach(function (el) {
      var v = val(el.getAttribute("data-num")), none = !v || v === "0" || v === "—" || v === "-";
      el.classList.toggle("dash", none);
      if (none) { el.textContent = "—"; el.setAttribute("aria-label", t("pk.none")); return; }
      el.removeAttribute("aria-label");
      el.innerHTML = el.hasAttribute("data-upto") ? '<span>' + esc(t("pk.upto")) + "</span> " + esc(v) : esc(v);
    });
  }

  function applyLang(l) {
    lang = l === "ar" ? "ar" : "en";
    root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";
    nodes.forEach(function (el) { el.innerHTML = fill(t(el.getAttribute("data-i18n"))); });
    attrNodes.forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) { var p = pair.split(":"); el.setAttribute(p[0], t(p[1])); });
    });
    document.querySelectorAll("[data-cfg]").forEach(function (el) { el.innerHTML = show(val(el.getAttribute("data-cfg"))); });
    renderNums(); renderContact(); renderFolios(); renderPlan(); themeLabel(); accAllLabel(); refreshGame(); addonState();
    var btn = $("langBtn");
    if (btn) {
      btn.innerHTML = lang === "ar" ? '<span lang="en">English</span>' : '<span lang="ar">عربي</span>';
      btn.setAttribute("aria-label", t("js.langBtn"));
    }
    document.title = lang === "ar" ? (AR["title." + page] || titleEN) : titleEN;
    root.classList.remove("pp-ar-pending");
    try { localStorage.setItem("pp-lang", lang); } catch (e) {}
  }

  /* ---------- light / dark mode ---------- */
  var themeBtn = $("themeBtn"), themeTimer = 0;
  function themeLabel() {
    if (!themeBtn) return;
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", t(dark ? "js.toLight" : "js.toDark"));
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
  }
  function setTheme(th, remember) {
    if (!reduceMotion) {
      root.classList.add("theme-anim");
      clearTimeout(themeTimer); themeTimer = setTimeout(function () { root.classList.remove("theme-anim"); }, 520);
    }
    root.setAttribute("data-theme", th);
    if (remember) { try { localStorage.setItem("pp-theme", th); } catch (e) {} }
    var meta = document.querySelector('meta[name="theme-color"]'), bar = getComputedStyle(root).getPropertyValue("--brand-bg").trim();
    if (meta) meta.setAttribute("content", bar || (th === "dark" ? "#08494B" : "#006D6F"));
    themeLabel();
  }
  if (themeBtn) themeBtn.addEventListener("click", function () { setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true); });
  if (window.matchMedia) {
    var mq = matchMedia("(prefers-color-scheme: dark)");
    var follow = function (e) { var saved = null; try { saved = localStorage.getItem("pp-theme"); } catch (er) {} if (!saved) setTheme(e.matches ? "dark" : "light", false); };
    if (mq.addEventListener) mq.addEventListener("change", follow); else if (mq.addListener) mq.addListener(follow);
  }
  setTheme(root.getAttribute("data-theme") || "light", false);

  /* ---------- contact links ---------- */
  /* Instagram handle from the settings; accepts "@name", "name" or a full instagram.com link */
  function igHandle() {
    if (isPh(C.instagram)) return "";
    return String(C.instagram).trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[\/?#].*$/, "");
  }
  function renderContact() {
    var h = igHandle();
    var links = { dm: h ? "https://ig.me/m/" + h : "", insta: h ? "https://www.instagram.com/" + h + "/" : "" };
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var href = links[a.getAttribute("data-link")];
      if (href) { a.href = href; a.removeAttribute("title"); }
      else { a.removeAttribute("href"); a.setAttribute("title", "Placeholder: add this in js/config.js"); }
    });
    var shown = { instagram: h ? "@" + h : C.instagram };
    document.querySelectorAll("[data-show]").forEach(function (el) { el.innerHTML = show(shown[el.getAttribute("data-show")]); });
  }

  /* ---------- portfolio galleries with arrows ---------- */
  function renderFolios() {
    document.querySelectorAll("[data-folio]").forEach(function (box) {
      var items = C[box.getAttribute("data-folio")] || [], any = false;
      box.innerHTML = items.map(function (it) {
        var label = it.label ? (it.label[lang] || it.label.en) : "";
        if (it.image) {
          any = true;
          return '<figure class="has-img"><img src="' + esc(it.image) + '" alt="' + esc(it.alt || label) + '" loading="lazy"><figcaption>' + esc(label) + "</figcaption></figure>";
        }
        return '<figure><svg aria-hidden="true"><use href="#i-image"/></svg><span class="ph-img">' + esc(t("wk.ph")) + "</span><figcaption>" + esc(label) + "</figcaption></figure>";
      }).join("");
      var tag = document.querySelector('[data-folio-tag="' + box.id + '"]'); if (tag) tag.hidden = any;
      box.scrollLeft = 0;
      folioState(box);
    });
  }
  function folioState(box) {
    var max = box.scrollWidth - box.clientWidth, pos = Math.abs(box.scrollLeft);
    document.querySelectorAll('[data-folio-for="' + box.id + '"]').forEach(function (b) {
      var back = b.getAttribute("data-dir") === "-1";
      b.disabled = max <= 2 || (back ? pos <= 2 : pos >= max - 2);
    });
  }
  document.querySelectorAll("[data-folio-for]").forEach(function (b) {
    b.addEventListener("click", function () {
      var box = $(b.getAttribute("data-folio-for")); if (!box) return;
      var first = box.firstElementChild, gap = 14;
      var stepW = first ? first.getBoundingClientRect().width + gap : box.clientWidth;
      var per = Math.max(1, Math.floor((box.clientWidth + gap) / stepW));
      var dir = +b.getAttribute("data-dir") * (root.dir === "rtl" ? -1 : 1);
      box.scrollBy({ left: dir * per * stepW, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
  document.querySelectorAll("[data-folio]").forEach(function (box) {
    box.addEventListener("scroll", function () { folioState(box); }, { passive: true });
  });
  window.addEventListener("resize", function () { document.querySelectorAll("[data-folio]").forEach(folioState); });

  /* ---------- add-ons: pick extras on Paw Packages, then request them on the contact page ---------- */
  var picks = document.querySelectorAll(".addon-pick"), addonBar = document.querySelector(".addon-bar");
  function addonState() {
    var on = [];
    picks.forEach(function (b) { var sel = b.getAttribute("aria-pressed") === "true"; b.closest(".addon").classList.toggle("on", sel); if (sel) on.push(b.getAttribute("data-addon")); });
    var cnt = $("addonCount"), send = $("addonSend");
    if (cnt) cnt.textContent = !on.length ? t("ad.none") : on.length === 1 ? t("ad.count1") : t("ad.count").replace("%n", on.length);
    if (send) send.href = "contact.html" + (on.length ? "?addons=" + on.join(",") : "");
    if (addonBar) addonBar.classList.toggle("empty", !on.length);
  }
  var wantAddons = (qp("addons") || "").split(",");
  picks.forEach(function (b) {
    if (wantAddons.indexOf(b.getAttribute("data-addon")) >= 0) b.setAttribute("aria-pressed", "true");
    b.addEventListener("click", function () { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); addonState(); });
  });
  document.querySelectorAll('input[name="addons"]').forEach(function (c) { if (wantAddons.indexOf(c.value) >= 0) c.checked = true; });

  /* ---------- package cards: dots under the swipeable row on phones (hidden on computers by CSS) ---------- */
  document.querySelectorAll(".packages").forEach(function (row) {
    var cards = row.querySelectorAll(".pkg"); if (cards.length < 2) return;
    var dots = document.createElement("div"); dots.className = "pkg-dots"; dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = new Array(cards.length + 1).join("<i></i>");
    row.parentNode.insertBefore(dots, row.nextSibling);
    function update() {
      var w = cards[0].getBoundingClientRect().width + 12, n = w > 12 ? Math.round(Math.abs(row.scrollLeft) / w) : 0;
      [].forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i === Math.min(n, cards.length - 1)); });
    }
    row.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); update();
  });

  /* ---------- menu (burger on phones, dropdowns on computers) ---------- */
  var burger = $("burger"), menu = $("menu");
  function closeSubs(except) {
    document.querySelectorAll(".has-sub.open").forEach(function (li) {
      if (li === except) return;
      li.classList.remove("open");
      var b = li.querySelector(".sub-toggle"); if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  function closeMenu() { if (!menu) return; menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); closeSubs(); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
  }
  document.querySelectorAll(".sub-toggle").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = b.closest(".has-sub"), open = !li.classList.contains("open");
      closeSubs(li); li.classList.toggle("open", open); b.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".has-sub")) closeSubs(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (menu && menu.classList.contains("open")) { closeMenu(); if (burger) burger.focus(); }
    closeSubs();
  });
  window.addEventListener("resize", function () { if (window.innerWidth > 900) { if (menu) menu.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); } });

  /* links to a section of the page you are already on: scroll there smoothly */
  function samePage(a) {
    var here = location.pathname.replace(/index\.html$/, ""), there = a.pathname.replace(/index\.html$/, "");
    return a.hash && there === here && a.search === location.search;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href*='#']");
    if (!a || a.target === "_blank" || !samePage(a)) return;
    var el = $(a.hash.slice(1)); if (!el) return;
    e.preventDefault();
    openFromHash(a.hash);
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", a.hash);
  });

  /* ---------- header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- policies accordion ---------- */
  var accBtns = document.querySelectorAll(".acc-btn");
  function setAcc(b, open) { b.setAttribute("aria-expanded", open ? "true" : "false"); var p = $(b.getAttribute("aria-controls")); if (p) p.hidden = !open; }
  function allOpen() { var all = accBtns.length > 0; accBtns.forEach(function (b) { if (b.getAttribute("aria-expanded") !== "true") all = false; }); return all; }
  function accAllLabel() { var b = $("accAll"); if (b) b.textContent = t(allOpen() ? "js.closeAll" : "js.openAll"); }
  accBtns.forEach(function (b) {
    b.addEventListener("click", function () { setAcc(b, b.getAttribute("aria-expanded") !== "true"); accAllLabel(); });
  });
  if ($("accAll")) $("accAll").addEventListener("click", function () { var open = !allOpen(); accBtns.forEach(function (b) { setAcc(b, open); }); accAllLabel(); });
  function openFromHash(hash) {
    var item = hash && /^#p\d+$/.test(hash) ? $(hash.slice(1)) : null;
    if (item) { var b = item.querySelector(".acc-btn"); if (b) setAcc(b, true); accAllLabel(); }
  }
  openFromHash(location.hash);

  /* ---------- Build Your Bamboo: floating bamboo → glass question card ---------- */
  var game = $("custom"), card = $("bgCard"), stage = $("bgStage"), sendLink = $("builderSend");
  var STEPS = PLAN_KEYS.concat(["rush", "summary"]);            // 6 number questions, rush, then the summary
  var DEFAULTS = { posts: 10, stories: 15, highlights: 3, reels: 2, ads: 1, photos: 5 };
  var EASE = "cubic-bezier(.2,.8,.2,1)";
  var bState = { rush: false, rushSet: false }, step = 0;
  function builderLink() {
    if (!sendLink) return;
    var q = ["plan=custom"];
    PLAN_KEYS.forEach(function (k) { q.push(k + "=" + bState[k]); });
    if (bState.rush) q.push("rush=1");
    sendLink.href = "contact.html?" + q.join("&");
  }
  function setVal(k, v, bump) {
    var r = $("b-" + k), out = $("o-" + k); if (!r) return;
    var min = +r.min || 1, max = +r.max || 100;
    v = Math.max(min, Math.min(max, Math.round(+v) || min));
    bState[k] = v; r.value = v;
    r.style.setProperty("--p", ((v - min) / (max - min) * 100) + "%");
    if (out && document.activeElement !== out) out.value = v;
    if (bump && out && !reduceMotion) { out.classList.remove("bump"); void out.offsetWidth; out.classList.add("bump"); }
    r.parentNode.querySelectorAll(".bg-chips button").forEach(function (c) { c.classList.toggle("on", +c.getAttribute("data-v") === v); });
    builderLink();
  }
  /* the big number box: typed values stay between 1 and 100 */
  function typedNumber(k, out, done) {
    var r = $("b-" + k), min = +r.min || 1, max = +r.max || 100, s = out.value.replace(/\D/g, "");
    if (s === "") { if (done) out.value = bState[k]; return; }    // still typing, or left empty
    var v = Math.min(max, +s);
    if (done) v = Math.max(min, v);
    if (String(v) !== out.value) out.value = v;
    if (v >= min) setVal(k, v);
    if (done) out.value = bState[k];
  }
  function focusQ() { var q = $("q-" + STEPS[step]); if (q) q.focus({ preventScroll: true }); }
  function showStep(i, dir) {
    if (!card) return;
    step = Math.max(0, Math.min(STEPS.length - 1, i));
    var name = STEPS[step], total = STEPS.length - 1;
    card.querySelectorAll(".bg-step").forEach(function (s) {
      var on = s.getAttribute("data-step") === name;
      s.hidden = !on; s.classList.remove("anim");
      if (on && dir && !reduceMotion) { s.style.setProperty("--dir", dir); void s.offsetWidth; s.classList.add("anim"); }
    });
    card.querySelectorAll(".bg-progress i").forEach(function (seg, n) { seg.className = n < step ? "on" : (n === step ? "now" : ""); });
    $("bgCount").textContent = step < total ? t("bg.count").replace("%n", step + 1).replace("%t", total) : t("bg.countDone");
    $("bgBack").classList.toggle("off", step === 0);
    $("bgNav").hidden = name === "summary";
    $("bgHelp").hidden = step >= PLAN_KEYS.length;
    card.querySelectorAll(".bg-choice").forEach(function (c) {
      c.setAttribute("aria-checked", bState.rushSet && (c.getAttribute("data-rush") === "1") === bState.rush ? "true" : "false");
      c.classList.toggle("on", c.getAttribute("aria-checked") === "true");
    });
    if (name === "summary") { renderSummary(); if (dir) celebrate(); }
  }
  function go(i, dir) { showStep(i, dir); focusQ(); }
  function renderSummary() {
    var list = $("bgSum"); if (!list) return;
    list.innerHTML = STEPS.slice(0, -1).map(function (k, n) {
      var v = k === "rush" ? esc(t(bState.rush ? "js.yes" : "js.no")) : bState[k];
      return '<li><button type="button" data-go="' + n + '"><span>' + esc(t("plan." + k)) + "</span><b>" + v + "</b></button></li>";
    }).join("");
  }
  function celebrate() {
    var box = $("bgConfetti"); if (!box || reduceMotion) return;
    var colors = ["#FFC857", "#3DBCA8", "#FF6F61", "#FF4D8D", "#006D6F"], html = "";
    for (var n = 0; n < 18; n++) {
      var a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 120;
      html += '<i style="background:' + colors[n % 5] + ";--x:" + Math.round(Math.cos(a) * d) + "px;--y:" + Math.round(Math.sin(a) * d - 40) + "px;--r:" + Math.round(Math.random() * 360) + 'deg"></i>';
    }
    box.innerHTML = html; setTimeout(function () { box.innerHTML = ""; }, 1300);
  }
  /* ----- the morph: the bamboo stalk itself stretches into the glass card (and back) ----- */
  var morph = $("bgMorph"), busy = false;
  var GROW = "cubic-bezier(.3,1.12,.4,1)";            // smooth, with a tiny settle at the end
  function rel(r) { var g = game.getBoundingClientRect(); return { l: r.left - g.left, t: r.top - g.top, w: r.width, h: r.height }; }
  function stalkBox() {                                // where the stalk is drawn inside the bamboo picture (viewBox 140 x 320)
    var s = $("bgFloat").querySelector("svg").getBoundingClientRect(), k = s.width / 140;
    var b = rel(s);
    return { l: b.l + 56 * k, t: b.t + 22 * k, w: 28 * k, h: 286 * k, r: 12 * k };
  }
  function box(b, radius) { return { left: b.l + "px", top: b.t + "px", width: b.w + "px", height: b.h + "px", borderRadius: radius + "px" }; }
  function morphRun(from, to, toGlass, done) {
    var D = 820;
    morph.hidden = false;
    var a = box(from, from.r || 30), z = box(to, to.r || 30);
    for (var p in a) morph.style[p] = a[p];
    var anim = morph.animate([a, z], { duration: D, easing: toGlass ? GROW : "cubic-bezier(.5,0,.3,1)", fill: "forwards" });
    var bam = morph.querySelector(".m-bamboo"), gl = morph.querySelector(".m-glass"), nodes = morph.querySelectorAll(".m-bamboo b");
    var fade = toGlass ? [[1, 0], [0, 1]] : [[0, 1], [1, 0]];
    bam.animate([{ opacity: fade[0][0] }, { opacity: fade[0][0], offset: .3 }, { opacity: fade[0][1] }], { duration: D, fill: "forwards" });
    gl.animate([{ opacity: fade[1][0] }, { opacity: fade[1][0], offset: .3 }, { opacity: fade[1][1] }], { duration: D, fill: "forwards" });
    nodes.forEach(function (n) { n.animate(toGlass ? [{ opacity: 1 }, { opacity: 0, offset: .3 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 0, offset: .7 }, { opacity: 1 }], { duration: D, fill: "forwards" }); });
    anim.onfinish = function () { done(); morph.getAnimations({ subtree: true }).forEach(function (x) { x.cancel(); }); morph.hidden = true; busy = false; };
  }
  function openGame(animate, at) {
    var canAnimate = animate && !reduceMotion && card.animate && morph;
    if (!canAnimate) {
      stage.classList.add("playing"); card.hidden = false; showStep(at || 0, 0);
      if (animate) focusQ();
      return;
    }
    if (busy) return; busy = true;
    var from = stalkBox(), oldH = stage.offsetHeight;
    /* 1. a little squash, while the button and shadow fade away */
    var intro = [$("bgFloat").querySelector("svg").animate([{ transform: "none" }, { transform: "scale(1.08, .92)" }], { duration: 160, easing: "ease-out", fill: "forwards" })];
    [].forEach.call($("bgBamboo").querySelectorAll(".bg-start, .bg-tap, .bg-ground"), function (el) { intro.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" })); });
    setTimeout(function () {
      /* 2. lay out the card where it will end up (invisible), then stretch the stalk into it */
      intro.forEach(function (x) { x.cancel(); });
      stage.classList.add("playing"); card.hidden = false; card.style.opacity = "0"; showStep(at || 0, 0);
      var newH = stage.offsetHeight, to = rel(card.getBoundingClientRect()); to.r = 30;
      stage.animate([{ height: oldH + "px" }, { height: newH + "px" }], { duration: 820, easing: GROW });
      morphRun(from, to, true, function () {
        card.style.opacity = "";
        [].forEach.call(card.children, function (el) {
          el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: EASE, fill: "backwards", delay: el.classList.contains("bg-top") || el.classList.contains("bg-progress") ? 0 : 80 });
        });
        focusQ();
        if (card.getBoundingClientRect().top < 70) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 160);
  }
  function closeGame() {
    function done() {
      card.hidden = true; card.style.opacity = ""; stage.classList.remove("playing"); $("bgBamboo").style.opacity = "";
      $("bgStart").focus({ preventScroll: true });
    }
    if (reduceMotion || !card.animate || !morph) { done(); return; }
    if (busy) return; busy = true;
    /* the card's content fades, then the glass shrinks back into the bamboo stalk */
    var from = rel(card.getBoundingClientRect()), oldH = stage.offsetHeight; from.r = 30;
    card.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }).onfinish = function () {
      card.getAnimations().forEach(function (x) { x.cancel(); });
      card.hidden = true; stage.classList.remove("playing"); $("bgBamboo").style.opacity = "0";
      var to = stalkBox(), newH = stage.offsetHeight;
      stage.animate([{ height: oldH + "px" }, { height: newH + "px" }], { duration: 820, easing: "cubic-bezier(.5,0,.3,1)" });
      morphRun(from, to, false, function () {
        done();
        $("bgBamboo").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
      });
    };
  }
  if (game && card) {
    PLAN_KEYS.forEach(function (k) {
      var start = qp(k), r = $("b-" + k), out = $("o-" + k);           // values come back from the contact page's "Change" link
      setVal(k, start && +start >= 1 && +start <= 100 ? start : DEFAULTS[k]);
      r.addEventListener("input", function () { setVal(k, r.value); });
      out.addEventListener("input", function () { typedNumber(k, out, false); });
      out.addEventListener("change", function () { typedNumber(k, out, true); });
      out.addEventListener("blur", function () { typedNumber(k, out, true); });
      out.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); typedNumber(k, out, true); go(step + 1, 1); } });
      r.parentNode.querySelectorAll(".bg-pm").forEach(function (b) { b.addEventListener("click", function () { setVal(k, bState[k] + (+b.getAttribute("data-delta")), true); }); });
      r.parentNode.querySelectorAll(".bg-chips button").forEach(function (b) { b.addEventListener("click", function () { setVal(k, b.getAttribute("data-v"), true); }); });
    });
    bState.rush = qp("rush") === "1"; bState.rushSet = PLAN_KEYS.some(function (k) { return qp(k) !== null; });
    builderLink();
    card.querySelectorAll(".bg-choice").forEach(function (c) {
      c.addEventListener("click", function () {
        bState.rush = c.getAttribute("data-rush") === "1"; bState.rushSet = true; builderLink(); showStep(step, 0);
        setTimeout(function () { go(STEPS.indexOf("summary"), 1); }, reduceMotion ? 0 : 260);
      });
    });
    $("bgStart").addEventListener("click", function () { openGame(true, 0); });
    $("bgClose").addEventListener("click", closeGame);
    $("bgNext").addEventListener("click", function () { go(step + 1, 1); });
    $("bgBack").addEventListener("click", function () { go(step - 1, -1); });
    $("bgRestart").addEventListener("click", function () {
      PLAN_KEYS.forEach(function (k) { setVal(k, DEFAULTS[k]); }); bState.rush = false; bState.rushSet = false; builderLink(); go(0, -1);
    });
    $("bgSum").addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) go(+b.getAttribute("data-go"), -1); });
    if (bState.rushSet) openGame(false, STEPS.indexOf("summary"));      // coming back to change the plan: open on the summary
  }
  function refreshGame() { if (card && !card.hidden) showStep(step, 0); }

  /* ---------- contact form ---------- */
  var form = $("contactForm"), status = $("formStatus"), sel = $("f-interest");
  var fe = form ? form.elements : {};   // form fields by name (form.name would be the form's own name)
  var plan = null;
  if (form) {
    var want = qp("plan");
    if (want && sel && sel.querySelector('option[value="' + want.replace(/[^a-z]/g, "") + '"]')) sel.value = want;
    else if (qp("addons") && sel) sel.value = "addons";   // came from the add-ons bar only
    if (want === "custom" && qp("posts")) {
      plan = {};
      PLAN_KEYS.forEach(function (k) { var n = parseInt(qp(k), 10); plan[k] = isNaN(n) ? 1 : Math.max(1, Math.min(100, n)); });
      plan.rush = qp("rush") === "1";
    }
    if (sel) sel.addEventListener("change", function () { renderPlan(); });
  }
  function planEN() {
    if (!plan) return "";
    return PLAN_KEYS.map(function (k) { return tEN("plan." + k) + ": " + plan[k]; }).join(", ") + ", " + tEN("plan.rush") + ": " + (plan.rush ? "Yes" : "No");
  }
  function renderPlan() {
    var box = $("planBox"), list = $("planList");
    if (!box || !list) return;
    var showIt = plan && sel && sel.value === "custom";
    box.hidden = !showIt;
    if (!showIt) return;
    list.innerHTML = PLAN_KEYS.map(function (k) { return "<li>" + esc(t("plan." + k)) + ": <b>" + plan[k] + "</b></li>"; }).join("") +
      "<li>" + esc(t("plan.rush")) + ": <b>" + esc(t(plan.rush ? "js.yes" : "js.no")) + "</b></li>";
    var edit = $("planEdit");
    if (edit) edit.href = "packages.html?" + PLAN_KEYS.map(function (k) { return k + "=" + plan[k]; }).join("&") + (plan.rush ? "&rush=1" : "") + "#custom";
  }
  function planText() {
    if (!plan) return "";
    return PLAN_KEYS.map(function (k) { return t("plan." + k) + ": " + plan[k]; }).join(", ") + ", " + t("plan.rush") + ": " + t(plan.rush ? "js.yes" : "js.no");
  }
  function copyText(text) {                    // called straight from the tap, so phones allow it
    function fallback() { var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); }
    try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).catch(fallback); return; } } catch (e) {}
    fallback();
  }
  function setStatus(msg, cls) { if (!status) return; status.textContent = msg; status.className = "form-status " + (cls || ""); }
  function mark(el, bad) { var f = el && el.closest(".field, .check"); if (f) f.classList.toggle("bad", bad); }
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = fe.name.value.trim(), phone = fe.phone.value.trim(), terms = $("f-terms");
    mark(fe.name, !name); mark(fe.phone, !phone); mark(terms, !terms.checked);
    if (!name || !phone) { setStatus(t("js.required"), "err"); (name ? fe.phone : fe.name).focus(); return; }
    if (phone.replace(/\D/g, "").length < 7) { mark(fe.phone, true); setStatus(t("js.phone"), "err"); fe.phone.focus(); return; }
    if (!terms.checked) { setStatus(t("js.terms"), "err"); terms.focus(); return; }
    if (fe._honey && fe._honey.value) { form.reset(); setStatus(t("js.sent"), "ok"); return; }   // spam bot
    var h = igHandle();
    var checked = [].filter.call(form.querySelectorAll('input[name="addons"]'), function (c) { return c.checked; });
    var igUser = (fe.instagram && fe.instagram.value.trim()) || "";
    if (h) {
      var interestHere = sel ? plain(t(sel.options[sel.selectedIndex].getAttribute("data-i18n"))) : "";
      var lines = [t("js.dmIntro"), "", t("dm.name") + ": " + name];
      if (fe.brand.value.trim()) lines.push(t("dm.brand") + ": " + fe.brand.value.trim());
      lines.push(t("dm.phone") + ": " + phone);
      if (igUser) lines.push(t("dm.insta") + ": " + igUser);
      lines.push(t("dm.interest") + ": " + interestHere);
      if (plan && sel && sel.value === "custom") lines.push(t("dm.plan") + ": " + planText());
      if (checked.length) lines.push(t("dm.addons") + ": " + checked.map(function (c) { return plain(t(c.nextElementSibling.getAttribute("data-i18n"))); }).join(", "));
      if (fe.message.value.trim()) lines.push(t("dm.msg") + ": " + fe.message.value.trim());
      var dm = lines.join("\n");
      copyText(dm);
      window.open("https://ig.me/m/" + h, "_blank", "noopener");
      if ($("dmText")) { $("dmText").textContent = dm; $("dmBox").hidden = false; }
      setStatus(t("js.dmOpened"), "ok");
    }
    var w3f = !C.formEndpoint && C.web3formsKey;   // backup service, used when its key is filled in
    var endpoint = C.formEndpoint || (w3f ? "https://api.web3forms.com/submit" : (C.formEmail ? "https://formsubmit.co/ajax/" + C.formEmail : ""));
    if (!endpoint || !window.fetch) { if (!h) setStatus(t("js.failed"), "err"); return; }
    var interest = sel ? plain(tEN(sel.options[sel.selectedIndex].getAttribute("data-i18n"))) : "";
    var data = {
      "Name": name,
      "Brand": fe.brand.value.trim() || "-",
      "Phone": phone,
      "Instagram": igUser || "-",
      "Sent via": h ? "Instagram DM (copy of the request)" : "Website form",
      "Interested in": interest,
      "Message": fe.message.value.trim() || "-",
      "Accepted Terms & Conditions": "Yes",
      "Website language": lang === "ar" ? "Arabic" : "English",
      "_subject": "New website request: " + (fe.brand.value.trim() || name) + " (" + interest + ")",
      "_template": "table",
      "_captcha": "false"
    };
    if (plan && sel && sel.value === "custom") data["Build Your Bamboo"] = planEN();
    var addonNames = checked.map(function (c) { return plain(tEN(c.nextElementSibling.getAttribute("data-i18n"))); });
    data["Add-ons"] = addonNames.length ? addonNames.join(", ") : "-";
    if (w3f) { data.access_key = C.web3formsKey; data.subject = data._subject; data.from_name = "The Panda Paw website"; delete data._subject; delete data._template; delete data._captcha; }
    var btn = $("sendBtn");
    if (h) { fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) }).catch(function () {}); return; }   // email = quiet backup copy
    if (btn) btn.disabled = true;
    setStatus(t("js.sending"));
    fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        var ok = res.ok && (res.j.success === true || res.j.success === "true");
        if (ok) { form.reset(); if (sel && plan) sel.value = "custom"; renderPlan(); setStatus(t("js.sent"), "ok"); return; }
        setStatus(/activat/i.test(res.j.message || "") ? t("js.activate") : t("js.failed"), "err");
      })
      .catch(function () { setStatus(t("js.failed"), "err"); })
      .then(function () { if (btn) btn.disabled = false; });
  });
  if ($("dmCopy")) $("dmCopy").addEventListener("click", function () { copyText($("dmText").textContent); var b = $("dmCopy"), was = b.textContent; b.textContent = t("js.copied"); setTimeout(function () { b.textContent = was; }, 1600); });
  if (form) ["name", "phone"].forEach(function (n) { fe[n].addEventListener("input", function () { mark(fe[n], false); }); });
  if ($("f-terms")) $("f-terms").addEventListener("change", function () { mark($("f-terms"), false); });

  /* ---------- reveal on scroll ---------- */
  var rev = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- language toggle ---------- */
  if ($("langBtn")) $("langBtn").addEventListener("click", function () { applyLang(lang === "ar" ? "en" : "ar"); });
  var start = "en";
  var q = qp("lang");
  if (q === "ar" || q === "en") start = q; else { try { start = localStorage.getItem("pp-lang") || "en"; } catch (e) {} }
  applyLang(start);
  var y = $("year"); if (y) y.textContent = new Date().getFullYear();
  window.PP_READY = true;
})();
