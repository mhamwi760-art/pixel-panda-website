/* =====================================================================
   PIXEL PANDA — EDIT YOUR DETAILS HERE
   ---------------------------------------------------------------------
   This is the ONLY file you need to change for contact details, prices
   and portfolio images.

   - Anything still in [square brackets] is shown on the site in red,
     so you can see what is not filled in yet. Remove the brackets when
     you put in the real value.
   - Where there is { en: "...", ar: "..." } write the English and the
     Arabic version.
   - Save the file, then refresh the page in your browser.
   ===================================================================== */
window.PP_CONFIG = {

  /* ---------- CONTACT ---------- */
  // WhatsApp number: international format, digits only, NO + and NO spaces.
  whatsapp: "96598828403",
  // WhatsApp number as people should SEE it:
  whatsappDisplay: "+965 9882 8403",
  instagram: "[@instagram handle]",       // e.g. "@pixelpanda"

  /* ---------- REQUEST FORM ----------
     Every request from the Contact page is emailed to formEmail, through
     the free service FormSubmit (formsubmit.co). The visitor never sees
     this address and gets no email.
     FIRST TIME ONLY: after the first request, FormSubmit sends an
     "Activate form" email to this address. Open it and click Activate
     (check Junk too). From then on every request arrives in the inbox.
     Optional: the activation email also gives you a random code. Put it
     in formEmail instead of the address to keep the address out of the
     website code. */
  formEmail: "",

  /* ---------- SOCIAL MEDIA PACKAGES (per month) ---------- */
  price_cub:    { en: "80 KWD",  ar: "80 د.ك" },
  price_grove:  { en: "120 KWD", ar: "120 د.ك" },
  price_empire: { en: "150 KWD", ar: "150 د.ك" },
  price_custom: { en: "Price on request", ar: "السعر حسب طلبك" },

  /* ---------- BRANDING PACKAGES (one-time) ---------- */
  price_paw:       { en: "80 KWD",  ar: "80 د.ك" },
  price_signature: { en: "130 KWD", ar: "130 د.ك" },

  /* ---------- ADD-ON PRICES ---------- */
  addon_post:   { en: "[Price]", ar: "[السعر]" },
  addon_story:  { en: "[Price]", ar: "[السعر]" },
  addon_ad:     { en: "[Price]", ar: "[السعر]" },
  addon_shoot:  { en: "[Price]", ar: "[السعر]" },
  addon_photos: { en: "[Price]", ar: "[السعر]" },
  addon_rush:   { en: "[Price]", ar: "[السعر]" },

  /* ---------- PORTFOLIO GALLERIES ----------
     Put your images in the folder assets/portfolio/ and write the file
     name in "image", e.g. image: "assets/portfolio/shoot-01.jpg".
     Leave image empty ("") to show the dashed placeholder box.
     Add as many lines as you like: the arrows scroll through them all.
     "portfolio" shows on PP Packages, "portfolio_branding" on PP Branding. */
  portfolio: [
    { image: "", alt: "", label: { en: "Product photography", ar: "تصوير المنتجات" } },
    { image: "", alt: "", label: { en: "Model photography",   ar: "تصوير العارضين" } },
    { image: "", alt: "", label: { en: "Posts",               ar: "منشورات" } },
    { image: "", alt: "", label: { en: "Stories",             ar: "قصص" } },
    { image: "", alt: "", label: { en: "Highlights",          ar: "هايلايت" } },
    { image: "", alt: "", label: { en: "Reels",               ar: "ريلز" } },
    { image: "", alt: "", label: { en: "Ads",                 ar: "إعلانات" } }
  ],
  portfolio_branding: [
    { image: "", alt: "", label: { en: "Logo design",  ar: "تصميم شعار" } },
    { image: "", alt: "", label: { en: "Colours",      ar: "الألوان" } },
    { image: "", alt: "", label: { en: "Typography",   ar: "الخطوط" } },
    { image: "", alt: "", label: { en: "Mockups",      ar: "نماذج العرض" } },
    { image: "", alt: "", label: { en: "Moodboard",    ar: "لوحة الإلهام" } }
  ]
};
