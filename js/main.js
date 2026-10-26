/* Pixel Panda — site behaviour (all 4 pages). You should not need to edit
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
    "js.required": "Please add your name and your phone / WhatsApp number.",
    "js.phone": "Please check your phone / WhatsApp number.",
    "js.terms": "Please accept the Terms & Conditions to send your request.",
    "js.sending": "Sending…",
    "js.sent": "Thank you! Your request is in. We will contact you on WhatsApp soon.",
    "js.failed": "That didn't go through. Please try again or message us on WhatsApp.",
    "js.activate": "The form is almost ready: the request email still needs to be activated. Please message us on WhatsApp for now.",
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
    "wk.ph": "[Portfolio image]"
  };
  var PLAN_KEYS = ["posts", "stories", "highlights", "reels", "ads", "photos"];
  var lang = "en";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isPh(v) { return !v || /^\s*\[/.test(v); }
  function val(key) { var v = C[key]; if (v && typeof v === "object") v = v[lang] || v.en; return v == null ? "" : String(v); }
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

  function applyLang(l) {
    lang = l === "ar" ? "ar" : "en";
    root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";
    nodes.forEach(function (el) { el.innerHTML = fill(t(el.getAttribute("data-i18n"))); });
    attrNodes.forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) { var p = pair.split(":"); el.setAttribute(p[0], t(p[1])); });
    });
    document.querySelectorAll("[data-cfg]").forEach(function (el) { el.innerHTML = show(val(el.getAttribute("data-cfg"))); });
    renderContact(); renderFolios(); renderPlan(); themeLabel(); accAllLabel();
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
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", th === "dark" ? "#08494B" : "#006D6F");
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
  function renderContact() {
    var wa = (C.whatsapp || "").replace(/\D/g, "");
    var insta = isPh(C.instagram) ? "" : "https://instagram.com/" + C.instagram.replace(/^@/, "");
    var waText = encodeURIComponent(lang === "ar" ? "مرحبًا محمد، أود معرفة المزيد عن خدمات بيكسل باندا." : "Hi Mohammed, I'd like to know more about Pixel Panda.");
    var links = { wa: wa ? "https://wa.me/" + wa + "?text=" + waText : "", insta: insta };
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var href = links[a.getAttribute("data-link")];
      if (href) { a.href = href; a.removeAttribute("title"); }
      else { a.removeAttribute("href"); a.setAttribute("title", "Placeholder: add this in js/config.js"); }
    });
    var shown = { whatsapp: C.whatsappDisplay || C.whatsapp, instagram: C.instagram };
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

  /* ---------- Build Your Bamboo (sliders) ---------- */
  var sliders = document.querySelectorAll('.builder input[type="range"]');
  var rush = $("b-rush"), sendLink = $("builderSend");
  function updateSlider(r) {
    var min = +r.min || 0, max = +r.max || 100, v = +r.value;
    r.style.setProperty("--p", ((v - min) / (max - min) * 100) + "%");
    var out = $("o-" + r.getAttribute("data-key")); if (out) out.textContent = v;
  }
  function builderLink() {
    if (!sendLink) return;
    var q = ["plan=custom"];
    sliders.forEach(function (r) { q.push(r.getAttribute("data-key") + "=" + r.value); });
    if (rush && rush.checked) q.push("rush=1");
    sendLink.href = "contact.html?" + q.join("&");
  }
  sliders.forEach(function (r) {
    var start = qp(r.getAttribute("data-key"));               // coming back from the contact page
    if (start && +start >= +r.min && +start <= +r.max) r.value = start;
    updateSlider(r);
    r.addEventListener("input", function () { updateSlider(r); builderLink(); });
  });
  if (rush) { if (qp("rush") === "1") rush.checked = true; rush.addEventListener("change", builderLink); }
  builderLink();

  /* ---------- contact form ---------- */
  var form = $("contactForm"), status = $("formStatus"), sel = $("f-interest");
  var fe = form ? form.elements : {};   // form fields by name (form.name would be the form's own name)
  var plan = null;
  if (form) {
    var want = qp("plan");
    if (want && sel && sel.querySelector('option[value="' + want.replace(/[^a-z]/g, "") + '"]')) sel.value = want;
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
    var endpoint = C.formEndpoint || (C.formEmail ? "https://formsubmit.co/ajax/" + C.formEmail : "");
    if (!endpoint || !window.fetch) { setStatus(t("js.failed"), "err"); return; }
    var interest = sel ? plain(tEN(sel.options[sel.selectedIndex].getAttribute("data-i18n"))) : "";
    var data = {
      "Name": name,
      "Brand": fe.brand.value.trim() || "-",
      "Phone / WhatsApp": phone,
      "Interested in": interest,
      "Message": fe.message.value.trim() || "-",
      "Accepted Terms & Conditions": "Yes",
      "Website language": lang === "ar" ? "Arabic" : "English",
      "_subject": "New Pixel Panda request: " + (fe.brand.value.trim() || name) + " (" + interest + ")",
      "_template": "table",
      "_captcha": "false"
    };
    if (plan && sel && sel.value === "custom") data["Build Your Bamboo"] = planEN();
    var btn = $("sendBtn"); if (btn) btn.disabled = true;
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
