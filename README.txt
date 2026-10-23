PIXEL PANDA WEBSITE - QUICK GUIDE FOR MOHAMMED
==============================================

1) OPEN IT
   Double-click "index.html". It opens in your web browser. No internet
   or installation needed (with internet, the brand fonts Montserrat and
   Tajawal load from Google Fonts; without it a similar system font is used).
   The "عربي / English" button at the top switches language. The site
   remembers the choice. You can also link straight to Arabic with
   index.html?lang=ar

2) CHANGE YOUR DETAILS AND PRICES  ->  js/config.js
   Open js/config.js in any text editor (Notepad, TextEdit, VS Code).
   Everything you need is there:
     - phoneDisplay  : phone as people see it, e.g. "+966 5X XXX XXXX"
     - phoneLink     : same number for click-to-call, e.g. "+9665XXXXXXXX"
     - whatsapp      : digits only, no + or spaces, e.g. "9665XXXXXXXX"
     - email, instagram, website, location
     - price_cub, price_grove, price_empire, price_custom (monthly prices)
     - addon_... prices for the six add-ons
     - currency, payment methods, payment day, refund/terms numbers
     - portfolio images
   Anything still in [square brackets] shows in red on the site so you
   can spot what is missing. Save the file and refresh the browser.

3) CONTACT FORM
   By default the form opens the visitor's email app with their message
   already written to your email address.
   To receive messages directly instead (free):
     a. Sign up at https://formspree.io and create a new form.
     b. Copy the form address (like https://formspree.io/f/abcdwxyz).
     c. Paste it into formEndpoint in js/config.js. Done.

4) PORTFOLIO
   Put your photos in a folder called assets/portfolio/ and write the
   file names in the "portfolio" list in js/config.js, e.g.
   image: "assets/portfolio/shoot-01.jpg". The "To be added" label
   disappears once at least one image is added.

5) MOTION
   The gentle movement (mouse on computers, tilting on phones) is in
   js/motion.js. Each moving item in index.html has data-depth="NUMBER";
   a smaller number moves less. Delete the motion.js line at the bottom
   of index.html to switch it off.

6) TEXT
   English text is in index.html. Arabic text is in js/i18n-ar.js.

7) PUT IT ONLINE (free, about 2 minutes)
   a. Go to https://app.netlify.com/drop
   b. Drag the whole "website" folder onto the page.
   c. You get a live link right away. Create a free account to keep it
      and to connect your own domain later.
   To update: make changes, then drag the folder again.

Logos used are the original brand files in assets/logo/ (never edit them).
