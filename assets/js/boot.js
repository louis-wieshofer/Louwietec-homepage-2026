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
})();
