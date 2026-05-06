// Mira v1 — upsell page behaviors.
// 1. Quantity stepper that updates the visible "+ $X" total preview.
//    The actual cart math is owned by the SDK via data-next-bundle-qty-for.
// 2. Gallery thumb visual switch.
// (Accept / decline routing is handled by the SDK via data-next-upsell-action
//  combined with the meta tags next-upsell-accept-url / next-upsell-decline-url
//  — we intentionally do NOT hijack those clicks here.)
(function () {
  var stepper = document.querySelector('.stepper');
  if (stepper) {
    var inp = stepper.querySelector('input');
    var dec = stepper.querySelector('[data-next-quantity-decrement]');
    var inc = stepper.querySelector('[data-next-quantity-increment]');
    var min = parseInt(inp.min, 10) || 1;
    var max = parseInt(inp.max, 10) || 6;
    function update() {
      var v = parseInt(inp.value, 10) || 1;
      if (dec) dec.disabled = v <= min;
      if (inc) inc.disabled = v >= max;
      var totalEl = document.querySelector('[data-next-display="upsell.2.total"]');
      if (totalEl) totalEl.textContent = '$' + (v * 24.5).toFixed(2);
    }
    if (dec) dec.addEventListener('click', function () {
      inp.value = Math.max(min, (parseInt(inp.value, 10) || 1) - 1);
      update();
    });
    if (inc) inc.addEventListener('click', function () {
      inp.value = Math.min(max, (parseInt(inp.value, 10) || 1) + 1);
      update();
    });
    update();
  }

  // Gallery thumb switch (visual only)
  document.querySelectorAll('.gallery__thumb').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.gallery__thumb').forEach(function (x) { x.classList.remove('is-active'); });
      t.classList.add('is-active');
    });
  });
})();
