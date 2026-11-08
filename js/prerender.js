/* The Panda Paw — writes the settings from js/config.js into the HTML pages.

   Why: the site fills prices, package numbers and the portfolio with JavaScript.
   Google runs JavaScript, but most AI search crawlers (ChatGPT, Claude, Perplexity…)
   do not, so they saw packages without prices. This file copies the English values
   straight into the HTML, plus the matching structured data (JSON-LD).

   It runs in two places:
   - the dashboard (admin.html) runs it on every "Save & publish";
   - by hand:  node js/prerender.js   (from the website folder) after editing config.js.
   The page scripts still run as before and switch everything to Arabic when needed. */
(function (root) {
  "use strict";
  var SITE = "https://thepandapaw.com/";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isPh(v) { return !v || /^\s*\[/.test(v); }
  function get(cfg, key) { return key.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, cfg); }
  function en(cfg, key) { var v = get(cfg, key); if (v && typeof v === "object") v = v.en; return v == null ? "" : String(v); }
  function show(v) { return isPh(v) ? '<span class="ph">' + esc(v || "[—]") + "</span>" : esc(v); }
  function reAttr(attr, key) { return new RegExp("(<(\\w+)\\b[^>]*\\s" + attr + '="' + key.replace(/[.]/g, "\\.") + '"[^>]*>)([\\s\\S]*?)(</\\2>)', "g"); }

  function amount(text) {                                   // "80 KWD" -> { price: "80", currency: "KWD" }
    var m = /([\d.,]+)\s*(KWD|SAR|AED|QAR|BHD|OMR|USD|GBP|EUR)/i.exec(text || "");
    return m ? { price: m[1].replace(/,/g, ""), currency: m[2].toUpperCase() } : null;
  }

  var PACKAGES = [
    ["price_cub", "pk_cub", "The Cub", "A strong, steady start for new and growing brands."],
    ["price_grove", "pk_grove", "The Bamboo Grove", "More content, highlights and ads for brands ready to grow."],
    ["price_empire", "pk_empire", "The Panda Empire", "Full-scale content for brands that want to own their feed."]
  ];
  var BRANDING = [
    ["price_paw", "The Paw Print", "5 logo concepts, colours chosen from your logos and a moodboard, plus 5 free social media designs."],
    ["price_signature", "The Panda Signature", "5 logo concepts, colours, moodboard, typography and mockups, plus 5 free social media designs."]
  ];
  var PROVIDER = { "@id": SITE + "#organization" };
  var AREA = ["Kuwait", "Saudi Arabia", "United Arab Emirates", "Qatar", "Bahrain", "Oman"].map(function (n) { return { "@type": "Country", "name": n }; });

  function offer(cfg, priceKey, name, desc, extra) {
    var o = { "@type": "Offer", "name": name, "description": desc, "url": extra.url, "availability": "https://schema.org/InStock" };
    var a = amount(en(cfg, priceKey));
    if (a) { o.price = a.price; o.priceCurrency = a.currency; }
    if (extra.monthly && a) o.priceSpecification = { "@type": "UnitPriceSpecification", "price": a.price, "priceCurrency": a.currency, "unitCode": "MON", "referenceQuantity": { "@type": "QuantitativeValue", "value": 1, "unitCode": "MON" } };
    return o;
  }
  function pkgDesc(cfg, key, base) {
    var p = get(cfg, key) || {}, parts = [];
    [["posts", "Instagram post designs"], ["stories", "Instagram story designs"], ["highlights", "Instagram highlights"], ["reels", "reels"], ["ads", "ad designs"], ["photos", "photography images"]]
      .forEach(function (f) { var n = +p[f[0]] || 0; if (n) parts.push(n + " " + f[1]); });
    return base + " Per month: " + parts.join(", ") + ", a content calendar and a caption for every design. Ad budget not included.";
  }

  function schema(page, cfg) {
    if (page === "packages") {
      return {
        "@context": "https://schema.org", "@type": "Service", "@id": SITE + "packages.html#service",
        "name": "Social media management packages", "serviceType": "Social media management",
        "description": "Monthly social media packages: product and model photography, Instagram posts, stories, highlights, reels and ad designs, with a content calendar and a caption for every design.",
        "provider": PROVIDER, "areaServed": AREA, "url": SITE + "packages.html",
        "hasOfferCatalog": { "@type": "OfferCatalog", "name": "Paw Packages",
          "itemListElement": PACKAGES.map(function (p) { return offer(cfg, p[0], p[2], pkgDesc(cfg, p[1], p[3]), { url: SITE + "packages.html#packages", monthly: true }); })
            .concat([{ "@type": "Offer", "name": "Build Your Bamboo (custom plan)", "description": "Choose your own numbers of posts, stories, highlights, reels, ads and photos and get a free quote.", "url": SITE + "packages.html#packages" }]) }
      };
    }
    if (page === "branding") {
      return {
        "@context": "https://schema.org", "@type": "Service", "@id": SITE + "branding.html#service",
        "name": "Logo and brand identity design", "serviceType": "Brand identity design",
        "description": "Branding packages with 5 logo concepts, colours, moodboard, typography and mockups, plus 5 free social media designs.",
        "provider": PROVIDER, "areaServed": AREA, "url": SITE + "branding.html",
        "hasOfferCatalog": { "@type": "OfferCatalog", "name": "Paw Branding",
          "itemListElement": BRANDING.map(function (b) { return offer(cfg, b[0], b[1], b[2], { url: SITE + "branding.html#packages" }); }) }
      };
    }
    return null;
  }

  function folio(cfg, key) {
    return (cfg[key] || []).filter(function (it) { return it.image; }).map(function (it) {
      var label = it.label ? it.label.en : "";
      return '<figure class="has-img"><img src="' + esc(it.image) + '" alt="' + esc(it.alt || label) + '" loading="lazy">' + (label ? "<figcaption>" + esc(label) + "</figcaption>" : "") + "</figure>";
    }).join("");
  }

  function prerender(html, cfg) {
    // prices and other single settings
    html = html.replace(/(<(\w+)\b[^>]*\sdata-cfg="([\w.]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, function (m, open, tag, key, inner, close) {
      return open + show(en(cfg, key)) + close;
    });
    // package numbers
    html = html.replace(/(<(\w+)\b[^>]*\sdata-num="([\w.]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, function (m, open, tag, key, inner, close) {
      var v = en(cfg, key), none = !v || v === "0" || v === "—" || v === "-";
      if (none) return open + "—" + close;
      return open + (/\sdata-upto\b/.test(open) ? "<span>up to</span> " + esc(v) : esc(v)) + close;
    });
    // portfolio galleries
    html = html.replace(/(<div\b[^>]*\sdata-folio="(\w+)"[^>]*>)([\s\S]*?)(<\/div>)/g, function (m, open, key, inner, close) {
      return open + folio(cfg, key) + close;
    });
    // structured data with prices
    html = html.replace(/(<script type="application\/ld\+json" data-ld="(\w+)">)([\s\S]*?)(<\/script>)/g, function (m, open, page, inner, close) {
      var s = schema(page, cfg);
      return s ? open + "\n" + JSON.stringify(s, null, 1).replace(/<\//g, "<\\/") + "\n" + close : m;
    });
    return html;
  }

  root.PP_PRERENDER = prerender;

  /* node js/prerender.js */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = prerender;
    if (require.main === module) {
      var fs = require("fs"), path = require("path"), dir = path.join(__dirname, "..");
      var src = fs.readFileSync(path.join(dir, "js/config.js"), "utf8");
      var a = src.indexOf("/* PP-SETTINGS-START */"), b = src.indexOf("/* PP-SETTINGS-END */");
      var cfg = JSON.parse(src.slice(a + "/* PP-SETTINGS-START */".length, b));
      ["index.html", "packages.html", "branding.html", "contact.html", "policies.html"].forEach(function (f) {
        var p = path.join(dir, f), t = fs.readFileSync(p, "utf8"), out = prerender(t, cfg);
        if (out !== t) { fs.writeFileSync(p, out); console.log("updated " + f); }
      });
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
