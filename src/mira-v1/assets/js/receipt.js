// Mira v1 — receipt page: copy referral code button.
(function () {
  var btn = document.getElementById('copy-code');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var codeEl = document.querySelector('[data-next-display="customer.referralCode"]');
    if (!codeEl) return;
    var code = codeEl.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
      });
    }
  });
})();
