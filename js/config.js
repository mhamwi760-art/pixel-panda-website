/* =====================================================================
   PIXEL PANDA — EDIT YOUR DETAILS HERE
   ---------------------------------------------------------------------
   This is the ONLY file you need to change for contact details, prices,
   policy numbers and portfolio images.

   - Anything still in [square brackets] is shown on the site in red,
     so you can see what is not filled in yet. Remove the brackets when
     you put in the real value.
   - Where there is { en: "...", ar: "..." } write the English and the
     Arabic version.
   - Save the file, then refresh the page in your browser.
   ===================================================================== */
window.PP_CONFIG = {

  /* ---------- CONTACT ---------- */
  // Phone as people should SEE it:
  phoneDisplay: "[Phone number]",
  // Phone for the click-to-call link: international format, digits only
  // with a leading +, e.g. "+9665XXXXXXXX".
  phoneLink: "",
  // WhatsApp number: international format, digits only, NO + and NO
  // spaces, e.g. "9665XXXXXXXX".
  whatsapp: "",
  email: "[Email address]",
  instagram: "[@instagram handle]",       // e.g. "@pixelpanda"
  website: "[Website]",                    // e.g. "www.pixelpanda.com"
  location: { en: "[City, Country]", ar: "[المدينة، الدولة]" },

  /* ---------- CONTACT FORM ----------
     Leave formEndpoint empty ("") and the form opens the visitor's
     email app with the message already written, addressed to "email".
     To receive messages without an email app, create a free form at
     https://formspree.io, copy its address (looks like
     https://formspree.io/f/abcdwxyz) and paste it here. Nothing else
     needs to change. */
  formEndpoint: "",

  /* ---------- PRICES (per month) ---------- */
  price_cub:    { en: "[Price]", ar: "[السعر]" },
  price_grove:  { en: "[Price]", ar: "[السعر]" },
  price_empire: { en: "[Price]", ar: "[السعر]" },
  price_custom: { en: "[Price on request]", ar: "[السعر عند الطلب]" },

  /* ---------- ADD-ON PRICES ---------- */
  addon_post:   { en: "[Price]", ar: "[السعر]" },
  addon_story:  { en: "[Price]", ar: "[السعر]" },
  addon_ad:     { en: "[Price]", ar: "[السعر]" },
  addon_shoot:  { en: "[Price]", ar: "[السعر]" },
  addon_photos: { en: "[Price]", ar: "[السعر]" },
  addon_rush:   { en: "[Price]", ar: "[السعر]" },

  /* ---------- PAYMENT, REFUNDS AND TERMS (draft values) ---------- */
  currency:        { en: "[currency]", ar: "[العملة]" },
  payment_methods: { en: "[to be confirmed]", ar: "[يتم تأكيدها لاحقًا]" },
  pay_day:      "[15]",
  shoot_cancel: { en: "[48 hours]", ar: "[48 ساعة]" },
  refund_days:  "[X]",
  revisions:    "[2]",
  plan_days:    "[X]",
  photo_days:   "[X]",
  min_months:   "[3]",
  notice_days:  "[X]",

  /* ---------- PORTFOLIO ----------
     Put your images in the folder assets/portfolio/ and write the file
     name in "image", e.g. image: "assets/portfolio/shoot-01.jpg".
     Leave image empty ("") to show the dashed placeholder box.
     When at least one image is added the "To be added" label disappears. */
  portfolio: [
    { image: "", alt: "", label: { en: "Product photography", ar: "تصوير المنتجات" } },
    { image: "", alt: "", label: { en: "Model photography",   ar: "تصوير العارضين" } },
    { image: "", alt: "", label: { en: "Posts",               ar: "منشورات" } },
    { image: "", alt: "", label: { en: "Stories",             ar: "قصص" } },
    { image: "", alt: "", label: { en: "Ads",                 ar: "إعلانات" } }
  ]
};
