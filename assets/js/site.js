/* A&B Bau | Interaktionen und Scroll-Animationen */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var mm = window.matchMedia("(min-width: 861px)");

  /* ---------- Navigation ---------- */
  var nav = $(".nav");
  var burger = $(".nav-burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".nav-sheet a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); document.body.style.overflow = ""; }); });
  }
  var lightSections = $$("[data-nav='light']");
  function navTheme() {
    if (!nav) return;
    var y = 30, light = false;
    lightSections.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) light = true; });
    nav.classList.toggle("light", light);
  }
  window.addEventListener("scroll", navTheme, { passive: true });
  navTheme();

  /* ---------- Anrufknopf auf dem Handy ---------- */
  var fab = $(".fab");
  if (fab) window.addEventListener("scroll", function () { fab.classList.toggle("show", window.scrollY > window.innerHeight * 0.8); }, { passive: true });

  /* ---------- Jahr im Fußbereich ---------- */
  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- Vorher / Nachher Regler ---------- */
  $$(".ba").forEach(function (ba) {
    var frame = $(".ba-frame", ba);
    var sets = $$(".ba-set", ba);
    function setPos(clientX) {
      var r = frame.getBoundingClientRect();
      var p = Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100));
      frame.style.setProperty("--pos", p + "%");
    }
    var drag = false;
    frame.addEventListener("pointerdown", function (e) { drag = true; frame.setPointerCapture(e.pointerId); setPos(e.clientX); });
    frame.addEventListener("pointermove", function (e) { if (drag) setPos(e.clientX); });
    frame.addEventListener("pointerup", function () { drag = false; });
    frame.addEventListener("keydown", function (e) {
      var cur = parseFloat(getComputedStyle(frame).getPropertyValue("--pos")) || 50;
      if (e.key === "ArrowLeft") frame.style.setProperty("--pos", Math.max(2, cur - 5) + "%");
      if (e.key === "ArrowRight") frame.style.setProperty("--pos", Math.min(98, cur + 5) + "%");
    });
    $$(".seg button", ba).forEach(function (b, i) {
      b.addEventListener("click", function () {
        $$(".seg button", ba).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        sets.forEach(function (s, j) { s.hidden = j !== i; });
        var cap = $(".ba-caption", ba); if (cap) cap.textContent = b.getAttribute("data-caption");
        if (hasGsap && !reduce) gsap.fromTo(frame, { "--pos": "12%" }, { "--pos": "50%", duration: 1.2, ease: "expo.out" });
        else frame.style.setProperty("--pos", "50%");
      });
    });
  });

  /* ---------- Heizkostenrechner ---------- */
  var calc = $(".calc");
  if (calc) {
    var cost = $("#kosten", calc), area = $("#flaeche", calc);
    var chips = $$(".chip[data-rate]", calc);
    var rate = [0.15, 0.25];
    var fmt = function (n) { return Math.round(n).toLocaleString("de-DE"); };
    function paint(r) { var p = ((r.value - r.min) / (r.max - r.min)) * 100; r.style.setProperty("--fill", p + "%"); }
    function update() {
      var c = +cost.value;
      paint(cost); paint(area);
      $("#kostenOut").textContent = fmt(c) + " Euro";
      $("#flaecheOut").textContent = fmt(+area.value) + " Quadratmeter";
      var lo = c * rate[0], hi = c * rate[1];
      $("#sparen").innerHTML = fmt(lo) + " bis " + fmt(hi) + " <small>Euro im Jahr</small>";
      $("#zehn").textContent = fmt(lo * 10) + " bis " + fmt(hi * 10) + " Euro in zehn Jahren";
      var mid = 1 - (rate[0] + rate[1]) / 2;
      $("#barNow").style.width = "100%";
      $("#barAfter").style.width = (mid * 100).toFixed(1) + "%";
      $("#valNow").textContent = fmt(c) + " Euro";
      $("#valAfter").textContent = fmt(c * mid) + " Euro";
    }
    [cost, area].forEach(function (r) { r.addEventListener("input", update); });
    chips.forEach(function (ch) {
      ch.addEventListener("click", function () {
        chips.forEach(function (x) { x.classList.toggle("on", x === ch); x.setAttribute("aria-pressed", x === ch ? "true" : "false"); });
        rate = ch.getAttribute("data-rate").split(",").map(Number);
        update();
      });
    });
    update();
  }

  /* ---------- Projekte: Filter und Großansicht ---------- */
  var masonry = $(".masonry");
  if (masonry) {
    var figs = $$("figure", masonry);
    $$(".filters .chip").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".filters .chip").forEach(function (x) { x.classList.toggle("on", x === b); });
        var f = b.getAttribute("data-filter");
        figs.forEach(function (fig) { fig.classList.toggle("hide", f !== "alle" && fig.getAttribute("data-cat") !== f); });
        if (hasGsap) ScrollTrigger.refresh();
      });
    });
    var lb = $(".lightbox"), lbImg = $("img", lb), lbCap = $("p", lb), idx = 0;
    function visible() { return figs.filter(function (f) { return !f.classList.contains("hide"); }); }
    function show(i) {
      var v = visible(); idx = (i + v.length) % v.length;
      var im = $("img", v[idx]);
      lbImg.src = im.getAttribute("data-full") || im.src; lbImg.alt = im.alt;
      lbCap.textContent = ($("figcaption", v[idx]) || {}).textContent || "";
    }
    figs.forEach(function (f) { f.addEventListener("click", function () { show(visible().indexOf(f)); lb.classList.add("open"); document.body.style.overflow = "hidden"; }); });
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Kontaktformular ---------- */
  var form = $("#anfrage");
  if (form) {
    var svc = $("#leistung", form);
    $$(".chip", form).forEach(function (c) {
      c.addEventListener("click", function () { c.classList.toggle("on"); c.setAttribute("aria-pressed", c.classList.contains("on") ? "true" : "false"); svc.value = $$(".chip.on", form).map(function (x) { return x.textContent; }).join(", "); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (id) { return ($("#" + id, form) || {}).value || ""; };
      var body = "Name: " + v("name") + "\nTelefon: " + v("telefon") + "\nE-Mail: " + v("email") + "\nOrt: " + v("ort") + "\nLeistung: " + (svc.value || "noch offen") + "\n\n" + v("nachricht");
      window.location.href = "mailto:info@a-bbau.de?subject=" + encodeURIComponent("Anfrage über die Website: " + v("name")) + "&body=" + encodeURIComponent(body);
      var ok = $(".form-ok", form); if (ok) ok.hidden = false;
    });
  }

  /* ---------- Sprungleiste auf der Leistungsseite ---------- */
  var jumpLinks = $$(".jump a");
  if (jumpLinks.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) jumpLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    jumpLinks.forEach(function (a) { var t = $(a.getAttribute("href")); if (t) io.observe(t); });
  }

  /* ---------- Wörter vorbereiten ---------- */
  $$(".words").forEach(function (el) {
    var html = el.innerHTML.replace(/<mark>(.*?)<\/mark>/g, function (_, t) { return t.split(/\s+/).map(function (w) { return "\u0001" + w; }).join(" "); });
    el.innerHTML = html.split(/\s+/).map(function (w) {
      var hl = w.charAt(0) === "\u0001"; if (hl) w = w.slice(1);
      return '<span class="w' + (hl ? " hl" : "") + '">' + w + "</span>";
    }).join(" ");
  });

  /* ---------- Ohne Animationen: alles sofort sichtbar ---------- */
  if (!hasGsap || reduce) {
    document.documentElement.classList.remove("js");
    $$(".words .w").forEach(function (w) { w.classList.add("on"); });
    $$(".layer-list li, .story-step, .step").forEach(function (li) { li.classList.add("on"); });
    var sv = $$(".story-visual img"); if (sv[0]) sv[0].classList.add("on");
    $$("[data-count]").forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
    var sl = $(".steps-line b"); if (sl) sl.style.transform = "scaleX(1)";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });

  /* ---------- Einstieg oben ---------- */
  var intro = gsap.timeline({ delay: 0.15 });
  var markPaths = $$(".hero-mark path");
  if (markPaths.length) {
    markPaths.forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 3000;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0, stroke: "#f7c600", strokeWidth: 12 });
    });
    intro.to(markPaths, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.05 })
         .to(markPaths, { fillOpacity: 1, strokeWidth: 0, duration: 0.6 }, "-=0.35");
  }
  var introEls = $$("[data-intro]");
  if (introEls.length) {
    intro.fromTo(introEls, { y: 40, opacity: 0, filter: "blur(12px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.1, ease: "expo.out" }, markPaths.length ? "-=1.3" : 0);
  }

  /* ---------- Bild oben wächst beim Scrollen ---------- */
  var hm = $(".hero-media");
  if (hm) {
    gsap.fromTo(hm, { scale: 0.86, rotateX: 14, y: 40 }, {
      scale: 1, rotateX: 0, y: 0, ease: "none",
      scrollTrigger: { trigger: hm, start: "top 95%", end: "top 20%", scrub: 0.6 }
    });
    gsap.fromTo($("img", hm), { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: hm, start: "top bottom", end: "bottom top", scrub: true } });
  }

  /* ---------- Parallax in Bildern ---------- */
  $$("[data-parallax]").forEach(function (el) {
    var amt = parseFloat(el.getAttribute("data-parallax")) || 10;
    gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Einblenden ---------- */
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out", stagger: 0.09, overwrite: true });
    }
  });

  /* ---------- Wörter leuchten nacheinander auf ---------- */
  $$(".words").forEach(function (el) {
    var ws = $$(".w", el);
    ScrollTrigger.create({
      trigger: el, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: function (self) {
        var n = Math.round(self.progress * ws.length);
        ws.forEach(function (w, i) { w.classList.toggle("on", i < n); });
      }
    });
  });

  /* ---------- Zahlen zählen hoch ---------- */
  $$("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count")), o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: function () { gsap.to(o, { v: end, duration: 2, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString("de-DE"); } }); }
    });
  });

  /* ---------- Anatomie einer Fassade ---------- */
  var ana = $(".anatomy");
  if (ana) {
    var layers = $$(".layer", ana), items = $$(".layer-list li", ana), labels = $$(".layer-label", ana);
    var sx = -0.866, sy = 0.5;
    var gap = mm.matches ? 58 : 44;
    gsap.set(labels, { opacity: 0, x: -10 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: ana, start: "top top", end: "+=" + (window.innerHeight * 2.2), scrub: 0.8, pin: ".anatomy-pin",
        onUpdate: function (self) {
          var k = Math.min(items.length, Math.floor(self.progress * (items.length + 0.6)));
          items.forEach(function (li, i) { li.classList.toggle("on", i < k); });
        }
      }
    });
    tl.from(".anatomy-art svg", { scale: 0.9, opacity: 0.4, duration: 0.6, ease: "none" }, 0);
    layers.forEach(function (g, i) {
      tl.to(g, { x: sx * gap * (i - 2), y: sy * gap * (i - 2), duration: 1, ease: "power2.inOut" }, 0.3 + i * 0.12);
    });
    tl.to(labels, { opacity: 1, x: 0, duration: 0.4, stagger: 0.12 }, 1.0);
    tl.to({}, { duration: 0.6 });
  }

  /* ---------- Geschichte: Bild wechselt mit dem Text ---------- */
  var story = $(".story");
  if (story) {
    var imgs = $$(".story-visual img", story), bars = $$(".story-visual .progress i", story);
    $$(".story-step", story).forEach(function (st, i) {
      ScrollTrigger.create({
        trigger: st, start: "top 60%", end: "bottom 60%",
        onToggle: function (self) {
          if (!self.isActive) return;
          $$(".story-step", story).forEach(function (s, j) { s.classList.toggle("on", j === i); });
          imgs.forEach(function (im, j) { im.classList.toggle("on", j === i); });
          bars.forEach(function (b, j) { b.classList.toggle("on", j <= i); });
        }
      });
    });
    if (imgs[0]) imgs[0].classList.add("on");
    if (bars[0]) bars[0].classList.add("on");
    var first = $(".story-step", story); if (first) first.classList.add("on");
  }

  /* ---------- Horizontale Galerie ---------- */
  var hs = $(".hs");
  if (hs) {
    ScrollTrigger.matchMedia({
      "(min-width: 861px)": function () {
        var track = $(".hs-track", hs);
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
        var tw = gsap.to(track, {
          x: function () { return -dist(); }, ease: "none",
          scrollTrigger: { trigger: hs, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true }
        });
        return function () { tw.kill(); gsap.set(track, { x: 0 }); };
      }
    });
  }

  /* ---------- Ablauf ---------- */
  var steps = $(".steps");
  if (steps) {
    var line = $(".steps-line b", steps), sts = $$(".step", steps);
    ScrollTrigger.create({
      trigger: steps, start: "top 75%", end: "bottom 55%", scrub: 0.5,
      onUpdate: function (self) {
        if (line) line.style.transform = "scaleX(" + self.progress + ")";
        sts.forEach(function (s, i) { s.classList.toggle("on", self.progress >= i / (sts.length - 1) - 0.02); });
      }
    });
  }

  /* ---------- Sanft einblendende Seitenköpfe ---------- */
  var ph = $(".page-hero");
  if (ph && !introEls.length) {
    gsap.from($$(".page-hero > .wrap > *"), { y: 36, opacity: 0, filter: "blur(10px)", duration: 1.1, stagger: 0.09, ease: "expo.out", delay: 0.1 });
  }

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
