// Mira v1 — promo-bar countdown.
// Looks for #countdown and ticks down. Format depends on element data:
//   data-format="hms" (default) → HH:MM:SS
//   data-format="ms"           → MM:SS
// Initial seconds come from data-seconds, or default to 4h13m22s for the
// landing/listicle promo bar, 4m59s for the upsell.
(function () {
  var el = document.getElementById('countdown');
  if (!el) return;
  var fmt = el.getAttribute('data-format') || 'hms';
  var total = parseInt(el.getAttribute('data-seconds'), 10);
  if (isNaN(total)) total = fmt === 'ms' ? (4 * 60 + 59) : (4 * 3600 + 13 * 60 + 22);

  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    total = Math.max(0, total - 1);
    if (fmt === 'ms') {
      var m = Math.floor(total / 60);
      var s = total % 60;
      el.textContent = pad(m) + ':' + pad(s);
    } else {
      var h = Math.floor(total / 3600);
      var mm = Math.floor((total % 3600) / 60);
      var ss = total % 60;
      el.textContent = pad(h) + ':' + pad(mm) + ':' + pad(ss);
    }
  }
  tick();
  setInterval(tick, 1000);
})();
