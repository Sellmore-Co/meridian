window.addEventListener('next:initialized', function() {
  initFomo();
  // Exit-intent image popup intentionally suppressed.
  // Demeter starter ships pointed at https://placehold.co/600x400 with coupon EXIT10,
  // neither of which exists on this campaign. Polish dropped it per build rules.
});
