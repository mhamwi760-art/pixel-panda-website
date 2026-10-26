/* Pixel Panda — subtle motion.
   Desktop: elements with data-depth drift with the mouse; package cards tilt under the pointer.
   Phones/tablets: the same elements follow the device tilt. iPhone/iPad asks permission
   via the small "Enable motion" button (Apple requires a tap).
   data-depth = max movement in px (negative = moves the opposite way).
   Turned off completely when the visitor prefers reduced motion. */
(function () {
  "use strict";
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var els = [].slice.call(document.querySelectorAll("[data-depth]"));
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;          // target and current, range -1..1
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function frame() {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;      // gentle easing
    for (var i = 0; i < els.length; i++) {
      var d = +els[i].getAttribute("data-depth");
      els[i].style.translate = (cx * d).toFixed(2) + "px " + (cy * d * 0.7).toFixed(2) + "px";
    }
    if (!finePointer) tiltCards(cx, cy);
    raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(frame) : 0;
  }
  function setTarget(x, y) {
    tx = Math.max(-1, Math.min(1, x)); ty = Math.max(-1, Math.min(1, y));
    if (!raf) raf = requestAnimationFrame(frame);
  }

  /* package cards */
  var cards = [].slice.call(document.querySelectorAll(".pkg"));
  function tiltCards(x, y) {
    cards.forEach(function (c) { c.style.setProperty("--ry", (x * 4).toFixed(2) + "deg"); c.style.setProperty("--rx", (-y * 4).toFixed(2) + "deg"); });
  }

  /* desktop: mouse */
  if (finePointer) {
    window.addEventListener("mousemove", function (e) {
      setTarget(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { setTarget(0, 0); });
    cards.forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width * 2 - 1, y = (e.clientY - r.top) / r.height * 2 - 1;
        c.style.setProperty("--ry", (x * 5).toFixed(2) + "deg"); c.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg");
      });
      c.addEventListener("mouseleave", function () { c.style.setProperty("--ry", "0deg"); c.style.setProperty("--rx", "0deg"); });
    });
    return;
  }

  /* phones: device tilt */
  if (!("DeviceOrientationEvent" in window)) return;
  var base = null;
  function onTilt(e) {
    if (e.gamma == null || e.beta == null) return;
    var g = e.gamma, b = e.beta;
    var land = Math.abs(window.orientation || (screen.orientation && screen.orientation.angle) || 0) === 90;
    if (land) { var t = g; g = b; b = t; }
    if (!base) base = { g: g, b: b };
    base.g += (g - base.g) * 0.005; base.b += (b - base.b) * 0.005;   // slowly re-centre to how the phone is held
    setTarget((g - base.g) / 18, (b - base.b) / 18);
  }
  function listen() { window.addEventListener("deviceorientation", onTilt, { passive: true }); }

  var btn = document.getElementById("motionBtn");
  /* iPhone/iPad need a permission tap for tilt; on phones the button got in the way, so skip it there */
  if (typeof DeviceOrientationEvent.requestPermission === "function" && window.innerWidth <= 900) return;
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    if (!btn) return;
    btn.hidden = false;
    var ask = function () {
      document.removeEventListener("click", ask, true);
      DeviceOrientationEvent.requestPermission().then(function (s) { if (s === "granted") listen(); })
        .catch(function () {}).then(function () { btn.hidden = true; });
    };
    document.addEventListener("click", ask, true);   // the button, or the first tap anywhere
  } else {
    listen();
  }
})();
