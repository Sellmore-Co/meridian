// Mira v1 — bundle selector + sticky-cart visibility.
// The SDK reads data-next-bundle-card / data-next-package-id and handles cart
// state; this script is the DESIGN-LAYER affordance: aria-checked, is-selected,
// keyboard activation, and updating the sticky-cart preview.
(function () {
  var cards = document.querySelectorAll('.bundle-card');
  if (!cards.length) return;

  var stickyQty = document.getElementById('sticky-qty');
  var stickyPrice = document.getElementById('sticky-price');

  function selectCard(card) {
    cards.forEach(function (c) {
      c.classList.remove('is-selected');
      c.setAttribute('aria-checked', 'false');
      var btn = c.querySelector('button');
      if (btn) {
        var qty = c.dataset.nextQuantity;
        btn.textContent = 'Select ' + qty + ' Bottle' + (qty === '1' ? '' : 's');
      }
    });
    card.classList.add('is-selected');
    card.setAttribute('aria-checked', 'true');
    var qty = card.dataset.nextQuantity;
    var priceEl = card.querySelector('.bundle-card__price');
    var price = priceEl ? priceEl.textContent : '';
    if (stickyQty) stickyQty.textContent = qty;
    if (stickyPrice) stickyPrice.textContent = price;
    var btn = card.querySelector('button');
    if (btn) btn.textContent = 'Selected · Add to Cart';
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () { selectCard(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCard(card); }
    });
  });

  // Sticky cart visibility on scroll past the bundle section
  var sticky = document.getElementById('sticky-cart');
  var trigger = document.getElementById('bundle');
  if (sticky && trigger && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var entry = entries[0];
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        sticky.classList.add('show');
        sticky.setAttribute('aria-hidden', 'false');
      } else {
        sticky.classList.remove('show');
        sticky.setAttribute('aria-hidden', 'true');
      }
    }, { threshold: 0 });
    io.observe(trigger);
  }
})();
