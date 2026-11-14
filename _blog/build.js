/* The Panda Paw — blog builder.

   Write posts in _blog/posts/  as  <slug>.en.md  and  <slug>.ar.md  (same slug for both languages),
   then run, from the website folder:

       node _blog/build.js

   It makes:
     blog/index.html            English blog page          ar/blog/index.html          Arabic blog page
     blog/<slug>.html           English post               ar/blog/<slug>.html         Arabic post
     blog/feed.xml, ar/blog/feed.xml   (RSS)
     sitemap.xml                (all site pages + blog, with English/Arabic pairs)

   Menu, footer and icons are copied from contact.html, so menu changes there reach the blog on the next build.
   Folders starting with "_" are not published by GitHub Pages, so these sources stay private.

   Post file format:
     ---
     title: The H1 (with the keyword)
     meta_title: Search result title (60 characters max)
     meta_description: Search result text (155 characters max)
     date: 2026-11-16
     updated: 2026-11-20        (optional)
     keyword: target keyword
     category: Social media | Branding | Photography | Guides
     excerpt: 1-2 sentences for the blog page card
     draft: true                (optional: skipped until removed)
     ---
     Markdown body: ## and ### headings, paragraphs, - and 1. lists, **bold**, *italic*, > quotes, [links](/packages.html).
     Write internal links as English paths; Arabic posts get the Arabic versions automatically. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(__dirname, "posts");
const SITE = "https://thepandapaw.com";
const MAIN_PAGES = ["/", "/packages.html", "/branding.html", "/contact.html", "/policies.html"];
const V = { css: "42", blogCss: "1", config: "19", ar: "21", main: "28" };   // cache-busting numbers used on blog pages

/* ---------------- text helpers ---------------- */
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const xml = esc;
const slugify = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const T = {
  en: { blog: "Blog", home: "Home", title: "The Panda Paw blog: social media and branding tips for Kuwait and the GCC", h1: "Social media and branding, <em>made clear.</em>",
        lead: "Practical guides on Instagram, content, photography and brand identity for brands in Kuwait and across the GCC.",
        desc: "Practical social media, content, photography and branding guides for brands in Kuwait and the GCC, from The Panda Paw.",
        read: "min read", readMore: "Read the article", empty: "Our first articles are on the way. Follow us on Instagram to catch them first.",
        back: "All articles", related: "Keep reading", ctaT: "Want this done for your brand?", ctaB: "Get 3 free sample designs before you choose a package.",
        cta: "Claim my 3 free designs", ctaPk: "See our packages", by: "By The Panda Paw", updated: "Updated", label: "The Panda Paw blog", other: "اقرأ بالعربية" },
  ar: { blog: "المدونة", home: "الرئيسية", title: "مدونة ذا باندا باو: نصائح السوشيال ميديا والهوية البصرية في الكويت والخليج", h1: "السوشيال ميديا والهوية البصرية <em>بوضوح.</em>",
        lead: "أدلة عملية عن انستقرام والمحتوى والتصوير والهوية البصرية للعلامات التجارية في الكويت ودول الخليج.",
        desc: "أدلة عملية في السوشيال ميديا والمحتوى والتصوير والهوية البصرية للعلامات التجارية في الكويت والخليج، من ذا باندا باو.",
        read: "دقائق قراءة", readMore: "اقرأ المقال", empty: "مقالاتنا الأولى في الطريق. تابعنا على انستقرام لتصلك أولاً.",
        back: "كل المقالات", related: "تابع القراءة", ctaT: "تريد هذا لعلامتك التجارية؟", ctaB: "احصل على 3 تصاميم مجانية قبل أن تختار باقتك.",
        cta: "أريد تصاميمي المجانية الثلاثة", ctaPk: "شاهد باقاتنا", by: "بقلم ذا باندا باو", updated: "آخر تحديث", label: "مدونة ذا باندا باو", other: "Read in English" }
};
const CATS = { "Social media": "السوشيال ميديا", "Branding": "الهوية البصرية", "Photography": "التصوير", "Guides": "أدلة" };
function fmtDate(d, lang) {
  const dt = new Date(d + "T12:00:00Z");
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-u-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(dt);
}

/* ---------------- front matter + markdown ---------------- */
function parse(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(path.basename(file) + ": missing the --- front matter --- block at the top");
  const meta = {};
  m[1].split("\n").forEach((line) => {
    const k = /^([\w-]+):\s*(.*)$/.exec(line);
    if (k) meta[k[1].toLowerCase()] = k[2].trim().replace(/^["'](.*)["']$/, "$1");
  });
  return { meta, body: m[2] };
}

function linkFor(url, lang) {
  if (/^(https?:)?\/\//i.test(url) || /^(mailto|tel):/i.test(url)) return url;
  let u = url.replace(/^\.?\//, "/");
  if (!u.startsWith("/") && !u.startsWith("#")) u = "/" + u;
  if (lang !== "ar") return u;
  if (/^\/blog\//.test(u)) return "/ar" + u;                       // Arabic blog posts have their own address
  if (/^\/(index\.html)?([?#].*)?$/.test(u) || /^\/(packages|branding|contact|policies)\.html/.test(u)) {
    const [p, hash] = u.split("#");
    return p + (p.includes("?") ? "&" : "?") + "lang=ar" + (hash ? "#" + hash : "");
  }
  return u;
}
function inline(s, lang) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => {
    const href = linkFor(url.replace(/&amp;/g, "&"), lang);
    const ext = /^(https?:)?\/\//i.test(href);
    return '<a href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + text + "</a>";
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, "$1<em>$2</em>");
  return s;
}
function markdown(md, lang) {
  const lines = md.split("\n"), out = [], toc = [];
  let i = 0;
  const isBlock = (l) => /^(\||#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s?|---+\s*$|\s*$)/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*$/.test(l)) { i++; continue; }
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) {
      const lvl = Math.min(Math.max(m[1].length, 2), 4), text = inline(m[2].replace(/\s+#+\s*$/, ""), lang), id = slugify(m[2]) || "s" + i;
      if (lvl === 2) toc.push({ id, text });
      out.push("<h" + lvl + ' id="' + id + '">' + text + "</h" + lvl + ">"); i++; continue;
    }
    if (/^---+\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
    if (/^\|/.test(l) && /^\|?\s*:?-{2,}/.test(lines[i + 1] || "")) {          // | a | b |  then  |---|---|
      const cells = (r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const head = cells(l); i += 2;
      const rows = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push('<div class="table-wrap"><table><thead><tr>' + head.map((c) => (c ? '<th scope="col">' + inline(c, lang) + "</th>" : "<td></td>")).join("") + "</tr></thead><tbody>" +
        rows.map((r) => "<tr>" + r.map((c, n) => (n === 0 ? '<th scope="row">' : "<td>") + inline(c, lang) + (n === 0 ? "</th>" : "</td>")).join("") + "</tr>").join("") + "</tbody></table></div>");
      continue;
    }
    if (/^>\s?/.test(l)) {
      const q = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ""));
      out.push("<blockquote><p>" + inline(q.join(" "), lang) + "</p></blockquote>"); continue;
    }
    if (/^[-*+]\s/.test(l) || /^\d+[.)]\s/.test(l)) {
      const ordered = /^\d/.test(l), items = [];
      while (i < lines.length && (ordered ? /^\d+[.)]\s/ : /^[-*+]\s/).test(lines[i])) {
        let item = lines[i++].replace(/^([-*+]|\d+[.)])\s+/, "");
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) item += " " + lines[i++].trim();
        items.push("<li>" + inline(item, lang) + "</li>");
      }
      out.push((ordered ? "<ol>" : "<ul>") + items.join("") + (ordered ? "</ol>" : "</ul>")); continue;
    }
    const p = []; while (i < lines.length && !(isBlock(lines[i]) && p.length)) { if (/^\s*$/.test(lines[i])) break; p.push(lines[i++].trim()); }
    out.push("<p>" + inline(p.join(" "), lang) + "</p>");
  }
  return { html: out.join("\n"), toc };
}

/* ---------------- shared page parts, copied from contact.html ---------------- */
const contact = fs.readFileSync(path.join(ROOT, "contact.html"), "utf8");
function grab(re, name) { const m = re.exec(contact); if (!m) throw new Error("contact.html: could not find the " + name); return m[0]; }
function absolute(html) {
  return html
    .replace(/\s+aria-current="page"/g, "")
    .replace(/(href|src|data-ar-href)="(?!https?:|\/|#|mailto:|tel:)([^"]*)"/g, '$1="/$2"');
}
const PARTS = {
  sprite: grab(/<svg width="0" height="0"[\s\S]*?<\/svg>/, "icon sprite"),
  header: absolute(grab(/<header class="site-header"[\s\S]*?<\/header>/, "header")),
  footer: absolute(grab(/<footer class="site-footer"[\s\S]*?<\/footer>/, "footer")),
  tabbar: absolute(grab(/<nav class="tabbar"[\s\S]*?<\/nav>/, "phone tab bar")),
  float: grab(/<a class="wa-float"[\s\S]*?<\/a>/, "Instagram button")
};

function page(o) {
  const ar = o.lang === "ar";
  const alt = o.alternates || {};
  const hreflang = alt.en && alt.ar
    ? '<link rel="alternate" hreflang="en" href="' + SITE + alt.en + '">\n<link rel="alternate" hreflang="ar" href="' + SITE + alt.ar + '">\n<link rel="alternate" hreflang="x-default" href="' + SITE + alt.en + '">\n'
    : "";
  const header = PARTS.header.replace('<button class="lang-btn" type="button" id="langBtn"',
    '<button class="lang-btn" type="button" id="langBtn"' + (o.otherHref ? ' data-href="' + esc(o.otherHref) + '"' : ""));
  return `<!doctype html>
<html lang="${o.lang}" dir="${ar ? "rtl" : "ltr"}" class="no-js${ar ? " pp-ar-pending" : ""}" data-theme="light" data-lang-lock="${o.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<meta name="theme-color" content="#006D6F">
<meta name="format-detection" content="telephone=no">
<link rel="canonical" href="${SITE + o.path}">
${hreflang}<meta property="og:type" content="${o.ogType || "website"}">
<meta property="og:site_name" content="The Panda Paw">
<meta property="og:locale" content="${ar ? "ar_KW" : "en_GB"}">
<meta property="og:title" content="${esc(o.ogTitle || o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${SITE + o.path}">
<meta property="og:image" content="${SITE}/assets/share/og-image.png?v=3">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The Panda Paw: social media that makes brands look good online">
${o.extraMeta || ""}<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/rss+xml" title="${esc(T[o.lang].label)}" href="${ar ? "/ar" : ""}/blog/feed.xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/svg+xml" href="/assets/share/favicon.svg">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/share/favicon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/share/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css?v=${V.css}">
<link rel="stylesheet" href="/css/theme.css?v=1">
<link rel="stylesheet" href="/css/blog.css?v=${V.blogCss}">
<script>
  (function (d) {
    d.classList.remove('no-js');
    var t; try { t = localStorage.getItem('pp-theme'); } catch (e) {}
    if (!t) t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    d.setAttribute('data-theme', t);
    window.addEventListener('load', function () { setTimeout(function () { if (!window.PP_READY) { d.classList.add('no-js'); d.classList.remove('pp-ar-pending'); } }, 1500); });
  })(document.documentElement);
</script>
${o.schema.map((s) => '<script type="application/ld+json">\n' + JSON.stringify(s, null, 1).replace(/<\//g, "<\\/") + "\n</script>").join("\n")}
</head>
<body data-page="blog">
<!-- Made by _blog/build.js — edit the post in _blog/posts/ and run "node _blog/build.js" instead of editing this file. -->
${PARTS.sprite}

<a class="skip" href="#main" data-i18n="skip">Skip to content</a>

${header}

<main id="main">
${o.main}
</main>

${PARTS.footer}

${PARTS.tabbar}
${PARTS.float}

<script src="/js/config.js?v=${V.config}"></script>
<script src="/js/i18n-ar.js?v=${V.ar}"></script>
<script src="/js/main.js?v=${V.main}"></script>
</body>
</html>
`;
}

/* ---------------- schema ---------------- */
const ORG = { "@type": "Organization", "@id": SITE + "/#organization", "name": "The Panda Paw", "url": SITE + "/",
  "logo": { "@type": "ImageObject", "url": SITE + "/assets/share/icon-512.png", "width": 512, "height": 512 } };
function crumbs(lang, items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": items.map((it, n) => ({ "@type": "ListItem", "position": n + 1, "name": it[0], "item": SITE + it[1] })) };
}

/* ---------------- load posts ---------------- */
const posts = { en: [], ar: [] };
const problems = [];
if (fs.existsSync(SRC)) {
  fs.readdirSync(SRC).filter((f) => /\.(en|ar)\.md$/.test(f)).sort().forEach((f) => {
    const lang = /\.ar\.md$/.test(f) ? "ar" : "en", slug = f.replace(/\.(en|ar)\.md$/, "");
    const { meta, body } = parse(path.join(SRC, f));
    if (/^(true|yes)$/i.test(meta.draft || "")) return;
    ["title", "meta_description", "date"].forEach((k) => { if (!meta[k]) problems.push(f + ": missing " + k); });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || "")) problems.push(f + ": date must look like 2026-11-16");
    if (!/^[a-z0-9-]+$/.test(slug)) problems.push(f + ": file name must be lowercase letters, numbers and hyphens");
    if ((meta.meta_title || "").length > 60) problems.push(f + ": meta_title is over 60 characters (" + meta.meta_title.length + ")");
    if ((meta.meta_description || "").length > 160) problems.push(f + ": meta_description is over 160 characters (" + meta.meta_description.length + ")");
    const md = markdown(body, lang);
    const words = body.replace(/[#>*_`\-\[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
    posts[lang].push({ slug, lang, meta, html: md.html, toc: md.toc, words, minutes: Math.max(1, Math.round(words / 200)) });
  });
}
if (problems.length) { console.error("Fix these first:\n - " + problems.join("\n - ")); process.exit(1); }
["en", "ar"].forEach((l) => posts[l].sort((a, b) => (b.meta.date + b.slug).localeCompare(a.meta.date + a.slug)));
const has = (lang, slug) => posts[lang].some((p) => p.slug === slug);
const url = (lang, slug) => (lang === "ar" ? "/ar" : "") + "/blog/" + (slug ? slug + ".html" : "");

/* ---------------- write ---------------- */
const written = [];
function write(rel, text) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  written.push(rel);
}
// remove pages of posts that no longer exist
["blog", "ar/blog"].forEach((dir) => {
  const d = path.join(ROOT, dir); if (!fs.existsSync(d)) return;
  fs.readdirSync(d).filter((f) => f.endsWith(".html") && f !== "index.html").forEach((f) => {
    const lang = dir === "blog" ? "en" : "ar";
    if (!has(lang, f.replace(/\.html$/, ""))) fs.unlinkSync(path.join(d, f));
  });
});

function card(p) {
  const t = T[p.lang], cat = p.meta.category ? (p.lang === "ar" ? CATS[p.meta.category] || p.meta.category : p.meta.category) : "";
  return `<article class="post-card">
        <a class="post-card-link" href="${url(p.lang, p.slug)}">
          <div class="post-cover" aria-hidden="true"><span class="cover-mark"></span>${cat ? '<span class="cover-cat">' + esc(cat) + "</span>" : ""}<i></i><i></i><i></i></div>
          <div class="post-card-body">
            <p class="post-meta"><time datetime="${p.meta.date}">${fmtDate(p.meta.date, p.lang)}</time> · ${p.minutes} ${t.read}</p>
            <h2>${esc(p.meta.title)}</h2>
            ${p.meta.excerpt ? "<p>" + esc(p.meta.excerpt) + "</p>" : ""}
            <span class="more">${t.readMore} <span class="arrow" aria-hidden="true">${p.lang === "ar" ? "←" : "→"}</span></span>
          </div>
        </a>
      </article>`;
}

["en", "ar"].forEach((lang) => {
  const t = T[lang], list = posts[lang], ar = lang === "ar";
  const homeP = ar ? "/?lang=ar" : "/";
  // blog page
  write((ar ? "ar/" : "") + "blog/index.html", page({
    lang, path: url(lang), title: t.title, description: t.desc, alternates: { en: "/blog/", ar: "/ar/blog/" }, otherHref: url(ar ? "en" : "ar"),
    schema: [
      { "@context": "https://schema.org", "@type": "Blog", "@id": SITE + url(lang) + "#blog", "name": t.label, "url": SITE + url(lang), "description": t.desc, "inLanguage": lang, "publisher": ORG,
        "blogPost": list.map((p) => ({ "@type": "BlogPosting", "headline": p.meta.title, "url": SITE + url(lang, p.slug), "datePublished": p.meta.date })) },
      crumbs(lang, [[t.home, homeP], [t.blog, url(lang)]])
    ],
    main: `<section class="page-hero blog-hero" aria-labelledby="page-title">
  <div class="wrap">
    <p class="label">${t.label}</p>
    <h1 id="page-title">${t.h1}</h1>
    <p class="lead">${t.lead}</p>
  </div>
</section>
<section class="section blog-list" aria-label="${esc(t.blog)}">
  <div class="wrap">
    ${list.length ? '<div class="post-grid">\n      ' + list.map(card).join("\n      ") + "\n    </div>" : '<p class="blog-empty">' + t.empty + ' <a data-link="insta" target="_blank" rel="noopener">@thepandapaw.official</a></p>'}
  </div>
</section>`
  }));

  // posts
  list.forEach((p) => {
    const otherLang = ar ? "en" : "ar", pair = has(otherLang, p.slug);
    const alternates = pair ? { en: url("en", p.slug), ar: url("ar", p.slug) } : {};
    const cat = p.meta.category ? (ar ? CATS[p.meta.category] || p.meta.category : p.meta.category) : "";
    const related = list.filter((q) => q.slug !== p.slug).sort((a, b) => (b.meta.category === p.meta.category) - (a.meta.category === p.meta.category)).slice(0, 2);
    const offerHref = ar ? "/packages.html?lang=ar#offer" : "/packages.html#offer";
    const pkHref = ar ? "/packages.html?lang=ar#packages" : "/packages.html#packages";
    write((ar ? "ar/" : "") + "blog/" + p.slug + ".html", page({
      lang, path: url(lang, p.slug), title: p.meta.meta_title || p.meta.title + (ar ? " | ذا باندا باو" : " | The Panda Paw"),
      ogTitle: p.meta.title, description: p.meta.meta_description, ogType: "article", alternates,
      otherHref: url(otherLang, pair ? p.slug : ""),
      extraMeta: `<meta property="article:published_time" content="${p.meta.date}">\n` + (p.meta.updated ? `<meta property="article:modified_time" content="${p.meta.updated}">\n` : "") + (cat ? `<meta property="article:section" content="${esc(cat)}">\n` : ""),
      schema: [
        { "@context": "https://schema.org", "@type": "BlogPosting", "@id": SITE + url(lang, p.slug) + "#article",
          "headline": p.meta.title, "description": p.meta.meta_description, "inLanguage": lang,
          "datePublished": p.meta.date, "dateModified": p.meta.updated || p.meta.date,
          "author": ORG, "publisher": ORG, "image": SITE + "/assets/share/og-image.png",
          "mainEntityOfPage": SITE + url(lang, p.slug), "isPartOf": { "@id": SITE + url(lang) + "#blog" },
          "keywords": p.meta.keyword || undefined, "articleSection": cat || undefined, "wordCount": p.words },
        crumbs(lang, [[t.home, homeP], [t.blog, url(lang)], [p.meta.title, url(lang, p.slug)]])
      ],
      main: `<article class="post" aria-labelledby="post-title">
  <header class="page-hero post-hero">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${homeP}">${t.home}</a> <span aria-hidden="true">/</span> <a href="${url(lang)}">${t.blog}</a></nav>
      ${cat ? '<p class="label">' + esc(cat) + "</p>" : ""}
      <h1 id="post-title">${esc(p.meta.title)}</h1>
      <p class="post-meta"><span>${t.by}</span> · <time datetime="${p.meta.date}">${fmtDate(p.meta.date, lang)}</time>${p.meta.updated ? " · " + t.updated + ' <time datetime="' + p.meta.updated + '">' + fmtDate(p.meta.updated, lang) + "</time>" : ""} · ${p.minutes} ${t.read}</p>
    </div>
  </header>
  <div class="wrap post-wrap">
    <div class="prose">
${p.html}
    </div>
    <aside class="post-cta" aria-label="${esc(t.ctaT)}">
      <h2>${t.ctaT}</h2>
      <p>${t.ctaB}</p>
      <div class="post-cta-btns"><a class="btn btn-yellow" href="${offerHref}">${t.cta}</a> <a class="btn btn-ghost" href="${pkHref}">${t.ctaPk}</a></div>
    </aside>
    ${related.length ? '<section class="related" aria-labelledby="related-title"><h2 id="related-title">' + t.related + '</h2><div class="post-grid">' + related.map(card).join("") + "</div></section>" : ""}
    <p class="back"><a href="${url(lang)}">${ar ? "→" : "←"} ${t.back}</a>${pair ? ' · <a href="' + url(otherLang, p.slug) + '" hreflang="' + otherLang + '" lang="' + otherLang + '">' + t.other + "</a>" : ""}</p>
  </div>
</article>`
    }));
  });

  // RSS
  const items = list.map((p) => `  <item>
    <title>${xml(p.meta.title)}</title>
    <link>${SITE + url(lang, p.slug)}</link>
    <guid isPermaLink="true">${SITE + url(lang, p.slug)}</guid>
    <pubDate>${new Date(p.meta.date + "T06:00:00Z").toUTCString()}</pubDate>
    <description>${xml(p.meta.excerpt || p.meta.meta_description)}</description>
  </item>`).join("\n");
  write((ar ? "ar/" : "") + "blog/feed.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${xml(t.label)}</title>
  <link>${SITE + url(lang)}</link>
  <description>${xml(t.desc)}</description>
  <language>${ar ? "ar" : "en-gb"}</language>
${items}
</channel>
</rss>
`);
});

/* ---------------- sitemap ---------------- */
const today = new Date().toISOString().slice(0, 10);
const entries = MAIN_PAGES.map((p) => ({ loc: p, lastmod: today }));
const pair = (en, ar) => [
  { loc: en, lastmod: today, alt: { en, ar } }, { loc: ar, lastmod: today, alt: { en, ar } }];
entries.push(...pair("/blog/", "/ar/blog/"));
const slugs = new Set([...posts.en, ...posts.ar].map((p) => p.slug));
slugs.forEach((s) => {
  const e = posts.en.find((p) => p.slug === s), a = posts.ar.find((p) => p.slug === s);
  const alt = e && a ? { en: url("en", s), ar: url("ar", s) } : null;
  if (e) entries.push({ loc: url("en", s), lastmod: e.meta.updated || e.meta.date, alt });
  if (a) entries.push({ loc: url("ar", s), lastmod: a.meta.updated || a.meta.date, alt });
});
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((e) => "  <url><loc>" + SITE + e.loc + "</loc><lastmod>" + e.lastmod + "</lastmod>" +
  (e.alt ? '\n    <xhtml:link rel="alternate" hreflang="en" href="' + SITE + e.alt.en + '"/>\n    <xhtml:link rel="alternate" hreflang="ar" href="' + SITE + e.alt.ar + '"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="' + SITE + e.alt.en + '"/>\n  ' : "") + "</url>").join("\n")}
</urlset>
`);

console.log("Blog built: " + posts.en.length + " English and " + posts.ar.length + " Arabic posts.\n  " + written.join("\n  "));
