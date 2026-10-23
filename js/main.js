/* Pixel Panda — site behaviour. You should not need to edit this file;
   contact details and prices are in js/config.js. */
(function () {
  "use strict";
  var C = window.PP_CONFIG || {};
  var AR = window.PP_AR || {};
  var root = document.documentElement;
  var EN = {};      // filled from the English text in index.html
  var EN_JS = {
    "js.required": "Please add your name and a message.",
    "js.opening": "Opening your email app… If nothing opens, message us on WhatsApp.",
    "js.sending": "Sending…",
    "js.sent": "Thank you! Your message is in and we will get back to you soon.",
    "js.failed": "That didn't go through. Please try again or message us on WhatsApp.",
    "js.noEmail": "Our email address hasn't been added yet. Please call or WhatsApp us.",
    "js.subject": "Website enquiry",
    "js.langBtn": "اقرأ الموقع بالعربية",
    "wk.ph": "[Portfolio image]"
  };
  var lang = "en";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isPh(v) { return !v || /^\s*\[/.test(v); }
  function val(key) { var v = C[key]; if (v && typeof v === "object") v = v[lang] || v.en; return v == null ? "" : String(v); }
  function show(v) { return isPh(v) ? '<span class="ph">' + esc(v || "[—]") + "</span>" : esc(v); }
  function fill(text) { return text.replace(/\{(\w+)\}/g, function (_, k) { return show(val(k)); }); }
  function t(key) { return lang === "ar" ? (AR[key] || EN[key] || EN_JS[key] || key) : (EN[key] || EN_JS[key] || key); }

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
    renderContact(); renderFolio();
    var btn = document.getElementById("langBtn");
    btn.innerHTML = lang === "ar" ? '<span lang="en">English</span>' : '<span lang="ar">عربي</span>';
    btn.setAttribute("aria-label", t("js.langBtn"));
    document.title = lang === "ar" ? "بيكسل باندا | سوشيال ميديا تُظهر علامتك التجارية بأجمل صورة" : "Pixel Panda | Social media that makes brands look good online";
    try { localStorage.setItem("pp-lang", lang); } catch (e) {}
  }

  /* ---------- contact links ---------- */
  function renderContact() {
    var tel = (C.phoneLink || "").replace(/[^\d+]/g, "");
    var wa = (C.whatsapp || "").replace(/\D/g, "");
    var mail = isPh(C.email) ? "" : C.email;
    var insta = isPh(C.instagram) ? "" : "https://instagram.com/" + C.instagram.replace(/^@/, "");
    var web = isPh(C.website) ? "" : (/^https?:/.test(C.website) ? C.website : "https://" + C.website);
    var waText = encodeURIComponent(lang === "ar" ? "مرحبًا محمد، أود معرفة المزيد عن خدمات بيكسل باندا." : "Hi Mohammed, I'd like to know more about Pixel Panda.");
    var links = {
      tel: tel ? "tel:" + tel : "",
      wa: wa ? "https://wa.me/" + wa + "?text=" + waText : "",
      mail: mail ? "mailto:" + mail : "",
      insta: insta, web: web
    };
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var href = links[a.getAttribute("data-link")];
      if (href) { a.href = href; a.removeAttribute("aria-disabled"); a.removeAttribute("title"); }
      else { a.href = "#contact"; a.setAttribute("title", "Placeholder: add this in js/config.js"); }
    });
    var shown = { phone: C.phoneDisplay, email: C.email, instagram: C.instagram, website: C.website, location: val("location") };
    document.querySelectorAll("[data-show]").forEach(function (el) { el.innerHTML = show(shown[el.getAttribute("data-show")]); });
  }

  /* ---------- portfolio ---------- */
  function renderFolio() {
    var box = document.getElementById("folio"); if (!box) return;
    var items = C.portfolio || [], any = false;
    box.innerHTML = items.map(function (it) {
      var label = it.label ? (it.label[lang] || it.label.en) : "";
      if (it.image) {
        any = true;
        return '<figure class="has-img"><img src="' + esc(it.image) + '" alt="' + esc(it.alt || label) + '" loading="lazy"><figcaption>' + esc(label) + "</figcaption></figure>";
      }
      return '<figure><svg aria-hidden="true"><use href="#i-image"/></svg><span class="ph-img">' + esc(t("wk.ph")) + "</span><figcaption>" + esc(label) + "</figcaption></figure>";
    }).join("");
    var tag = document.getElementById("workTag"); if (tag) tag.hidden = any;
  }

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger"), menu = document.getElementById("menu");
  function closeMenu() { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); burger.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 1180) closeMenu(); });

  /* ---------- header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- accordion ---------- */
  document.querySelectorAll(".acc-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", open ? "false" : "true");
      document.getElementById(b.getAttribute("aria-controls")).hidden = open;
    });
  });

  /* ---------- package buttons preselect the form ---------- */
  var sel = document.getElementById("f-interest");
  document.querySelectorAll("[data-pkg]").forEach(function (a) {
    a.addEventListener("click", function () { sel.value = a.getAttribute("data-pkg"); });
  });

  /* ---------- contact form ---------- */
  var form = document.getElementById("contactForm"), status = document.getElementById("formStatus");
  function setStatus(msg, cls) { status.textContent = msg; status.className = "form-status " + (cls || ""); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    if (!String(d.get("name")).trim() || !String(d.get("message")).trim()) { setStatus(t("js.required"), "err"); (String(d.get("name")).trim() ? form.message : form.name).focus(); return; }
    var interest = sel.options[sel.selectedIndex].text;
    d.append("interest_label", interest); d.append("language", lang);
    if (C.formEndpoint) {
      setStatus(t("js.sending"));
      fetch(C.formEndpoint, { method: "POST", body: d, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw 0; form.reset(); setStatus(t("js.sent"), "ok"); })
        .catch(function () { setStatus(t("js.failed"), "err"); });
      return;
    }
    if (isPh(C.email)) { setStatus(t("js.noEmail"), "err"); return; }
    var L = lang === "ar"
      ? ["الاسم", "العلامة التجارية", "الهاتف", "البريد", "مهتم بـ"]
      : ["Name", "Brand", "Phone", "Email", "Interested in"];
    var body = L[0] + ": " + d.get("name") + "\n" + L[1] + ": " + d.get("brand") + "\n" + L[2] + ": " + d.get("phone") + "\n" + L[3] + ": " + d.get("email") + "\n" + L[4] + ": " + interest + "\n\n" + d.get("message");
    window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(t("js.subject") + " — " + (d.get("brand") || d.get("name"))) + "&body=" + encodeURIComponent(body);
    setStatus(t("js.opening"), "ok");
  });

  /* ---------- reveal on scroll ---------- */
  var rev = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- language toggle ---------- */
  document.getElementById("langBtn").addEventListener("click", function () { applyLang(lang === "ar" ? "en" : "ar"); });
  var start = "en";
  var q = (location.search.match(/[?&]lang=(ar|en)/) || [])[1];
  if (q) start = q; else { try { start = localStorage.getItem("pp-lang") || "en"; } catch (e) {} }
  applyLang(start);
  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
