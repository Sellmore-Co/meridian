/* Arjuna checkout — family-specific behaviors (debranded from HerzP1).
   1. Delivery estimate dates    → #delivery-start / #delivery-end
   2. UGC video controls         → auto-hide controls after playback starts
   3. forcePackageId URL param   → pre-select a bundle card
   4. timer=n URL param          → hide the promo-timer
   All SDK-dependent work waits on next:initialized. */
(function () {
  'use strict';

  // ---- 3 + 4: URL params ----
  var params = new URLSearchParams(window.location.search);

  var timerParam = (params.get('timer') || params.get('Timer') || '').toLowerCase();
  if (timerParam === 'n') {
    var t = document.querySelector('promo-timer');
    if (t) t.style.display = 'none';
  }

  window.addEventListener('next:initialized', function () {
    var pkg =
      params.get('forcePackageId') ||
      params.get('forcePackageID') ||
      params.get('package') ||
      params.get('packageid');
    if (!pkg || !/^\d+$/.test(pkg)) return; // digits only — avoids querySelector SyntaxError on hostile input
    // NOTE: in the 0.4.x bundle model the tiers (1x/2x/3x) share one packageId and
    // differ by quantity in data-next-bundle-items, so package-id alone resolves only
    // the base package. For true tier-forcing use the SDK-native forcePackageId=id:qty.
    var inner = document.querySelector('[data-next-bundle-card] [data-next-package-id="' + pkg + '"]');
    var card = inner && inner.closest('[data-next-bundle-card]');
    if (card) setTimeout(function () { card.click(); }, 50);
  });

  // ---- 2: UGC video controls auto-hide ----
  function wireVideo(v) {
    if (!v) return;
    v.addEventListener('playing', function () {
      setTimeout(function () { v.removeAttribute('controls'); }, 2000);
    });
    v.addEventListener('click', function () {
      if (!v.hasAttribute('controls')) v.setAttribute('controls', 'controls');
    });
  }
  document.querySelectorAll('video[data-arjuna-ugc]').forEach(wireVideo);

  // ---- 1: delivery estimate dates ----
  function fmtMonth(d) {
    var m = d.toLocaleDateString('en-US', { month: 'short' });
    return m.charAt(0).toUpperCase() + m.slice(1);
  }
  function fmtDay(d) { return d.toLocaleDateString('en-US', { day: 'numeric' }); }

  var startEl = document.getElementById('delivery-start');
  var endEl = document.getElementById('delivery-end');
  if (startEl && endEl) {
    var wrap = startEl.closest('[data-delivery-min]') || document.querySelector('[data-delivery-min]');
    var minD = parseInt((wrap && wrap.getAttribute('data-delivery-min')) || '2', 10);
    var maxD = parseInt((wrap && wrap.getAttribute('data-delivery-max')) || '3', 10);
    if (isNaN(minD)) minD = 2;
    if (isNaN(maxD) || maxD < minD) maxD = minD + 1; // guard non-numeric / inverted ranges
    var today = new Date();
    var start = new Date(today); start.setDate(start.getDate() + minD);
    var end = new Date(today); end.setDate(end.getDate() + maxD);
    var sM = fmtMonth(start), eM = fmtMonth(end);
    startEl.textContent = sM + ' ' + fmtDay(start);
    endEl.textContent = sM === eM ? fmtDay(end) : eM + ' ' + fmtDay(end);
  }
})();
