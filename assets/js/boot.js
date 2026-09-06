/* boot.js — synchron im <head>, ~15 Zeilen, kein Modul.
   Setzt `js` (JS läuft) und `js-motion` (Bewegung erlaubt) auf <html>.
   Alles, was Elemente vor einer Animation verbirgt, hängt an html.js-motion —
   fehlt die Klasse, ist die stille Version vollständig sichtbar. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var mq = window.matchMedia('(prefers-reduced-motion: no-preference)');
    var save = navigator.connection && navigator.connection.saveData === true;
    if (mq.matches && !save) d.classList.add('js-motion');
  } catch (e) { /* stille Version */ }
  if (!d.classList.contains('js-motion')) return;
  /* Erster Viewport sofort sichtbar (LCP): Reveal-Ziele, die beim DOMContentLoaded im Bild sind, bekommen
     is-in ohne Übergang; die Hero-Headline startet ihre Wort-für-Wort-Sequenz. motion.js (lädt später)
     übernimmt nur die Ziele außerhalb des Bildes. Die Selektorliste ist dieselbe wie in motion.css. */
  window.LW_REVEAL_SEL = '.sec > .container > :not([data-hero-headline]):not(.hero__text):not(script), .sec .prose > *, .grid > *, .room-block > *, .faq > *, .insights > li, .hero__text > *';
  document.addEventListener('DOMContentLoaded', function () {
    try {
      var vh = window.innerHeight, els = document.querySelectorAll(window.LW_REVEAL_SEL), i, r;
      for (i = 0; i < els.length; i++) { r = els[i].getBoundingClientRect(); if (r.top < vh && r.bottom > 0) els[i].classList.add('is-in', 'is-initial'); }
      var h = document.querySelector('[data-hero-headline]');
      if (h) { var words = h.querySelectorAll('[data-word]'); for (i = 0; i < words.length; i++) words[i].style.setProperty('--word-delay', (180 + i * 110) + 'ms'); requestAnimationFrame(function () { h.classList.add('is-in'); }); }
    } catch (e) { /* motion.js holt es nach */ }
  });
})();
