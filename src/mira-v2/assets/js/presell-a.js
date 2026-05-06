// Mira v1 — presell-a sticky CTA.
// Reveals the bottom sticky-cta after the user scrolls past the article hero.
(function () {
  var sticky = document.getElementById('sticky-cta');
  var trigger = document.querySelector('.article__hero');
  if (!sticky || !trigger || !('IntersectionObserver' in window)) return;
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
})();
