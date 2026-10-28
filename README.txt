PIXEL PANDA WEBSITE - QUICK GUIDE FOR MOHAMMED
==============================================

LIVE SITE:  https://mhamwi760-art.github.io/pixel-panda-website/
ARABIC:     https://mhamwi760-art.github.io/pixel-panda-website/?lang=ar

1) THE 4 PAGES
   index.html     Panda Time   - About us, Services, Policies (Terms & Conditions)
   packages.html  PP Packages  - social media packages, Build Your Bamboo,
                                 Add-ons, Free designs, How we work, Portfolio
   branding.html  PP Branding  - branding packages, How we work, Portfolio
   contact.html   Contact us   - WhatsApp, Instagram and the request form
   The menu and footer are repeated on every page: if you change them,
   change all 4 pages.

1b) DASHBOARD (the easy way to make small changes)
   Open https://mhamwi760-art.github.io/pixel-panda-website/admin.html
   (not linked from the site, hidden from Google). Log in once with your
   GitHub key (the page explains how to create it). Then change package
   numbers, prices, contact details, any text (English and Arabic),
   portfolio pictures, page pictures and brand colours, and press
   "Save & publish". The live site updates about a minute later.

2) CHANGE YOUR DETAILS AND PRICES BY HAND  ->  js/config.js
   - whatsapp / whatsappDisplay : your WhatsApp number
   - instagram                  : your Instagram handle, e.g. "@pixelpanda"
   - formEmail                  : where requests from the form are sent
   - price_... and addon_...    : all prices (English and Arabic)
   - portfolio / portfolio_branding : gallery images (see 4)
   Anything still in [square brackets] shows in red on the site so you
   can spot what is missing.

3) REQUEST FORM (emails come to formEmail)
   The form uses the free service FormSubmit (formsubmit.co).
   FIRST TIME ONLY: send one test request from the Contact page. FormSubmit
   then emails "Activate form" to [your email] (check Junk).
   Click Activate. From then on every request arrives in that inbox.
   Clients must tick "I accept the Terms & Conditions" before sending.
   Clients get no email, and your email address is never shown to them.

4) PORTFOLIO GALLERIES
   Put your photos in a folder called assets/portfolio/ and add one line
   per image to "portfolio" (PP Packages) or "portfolio_branding"
   (PP Branding) in js/config.js, e.g. image: "assets/portfolio/shoot-01.jpg".
   Add as many as you like: the left/right arrows scroll through them.

5) DARK MODE AND LANGUAGE
   The moon/sun button switches light and dark mode. The site starts in
   the visitor's phone/computer setting and remembers their choice.
   The "عربي / English" button switches language on every page.

6) TEXT
   English text is in each page (.html). Arabic text is in js/i18n-ar.js.

7) PUT CHANGES ONLINE
   The site is hosted on GitHub Pages from github.com/mhamwi760-art/pixel-panda-website
   After editing, ask Claude to "push my changes", or run in this folder:
       git add -A
       git commit -m "Update site"
       git push
   The live site updates about a minute later. If you changed a css or js
   file, raise the ?v=9 number on its line in all 4 pages first.

Logos used are the original brand files in assets/logo/ (never edit them).
