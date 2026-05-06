# Mira v2 Production Pass

Date: 2026-05-06
Repo: `meridian`
Route slug: `mira-v2`
Spec source: `/Users/devin/Downloads/campaign-spec-mira-v2.json`
Linear project: https://linear.app/nextcommerce/project/mira-v2-61eb6dd7b184

## Shape

- Single page-kit campaign in `src/mira-v2/`.
- Flat source files only: `index.html`, `listicle.html`, `landing.html`, `checkout.html`, `upsell.html`, `receipt.html`.
- No Netlify Edge split and no `-a` / `-b` suffixed v2 pages.
- Entry points:
  - `/mira-v2/` advertorial
  - `/mira-v2/listicle/` listicle
- Shared commerce path: `/landing/` -> `/checkout/` -> `/upsell/` -> `/receipt/`.

## Runtime Wiring

- Campaign Cart SDK: `0.4.18`.
- Campaigns API key is inlined in `src/mira-v2/assets/config.js`.
- Payment env key is inlined in `src/mira-v2/assets/config.js`.
- Payment methods: bankcard, Apple Pay, Google Pay. No PayPal markup.
- Checkout order bump: package `3`, Mira Travel Pouch.
- Upsell: package `2`, Mira Calm, voucher `CALM50`.
- Currency: USD default; SDK supports GBP via `?currency=`.

## Bundle Selector

The landing bundle selector is intentionally not an SDK product-page cart selector. Each card is a direct checkout link:

- 1 bottle: `/mira-v2/checkout/?forcePackageId=1:1`
- 3 bottles: `/mira-v2/checkout/?forcePackageId=1:3`
- 5 bottles: `/mira-v2/checkout/?forcePackageId=1:5`

Local browser proof: clicking the 3-bottle card navigated to `/mira-v2/checkout/?forcePackageId=1:3` and rendered the checkout with the 3-bottle summary.

## Local Verification

- `npm run build` passes.
- Build output includes exactly the intended v2 route pages:
  - `_site/mira-v2/index.html`
  - `_site/mira-v2/listicle/index.html`
  - `_site/mira-v2/landing/index.html`
  - `_site/mira-v2/checkout/index.html`
  - `_site/mira-v2/upsell/index.html`
  - `_site/mira-v2/receipt/index.html`
- Static link audit found no v2 body links to the old `mira-v1` URLs or suffixed v1 files.
- Local SDK API calls from `http://127.0.0.1:4173` are CORS-blocked, as expected unless the origin is allowlisted. Static and visual checks continued; production SDK verification remains the deploy gate.

## Visual QA

Reviewed local rendered pages at desktop and mobile viewport sizes:

- Advertorial entry
- Listicle entry
- Landing and bundle selector
- Checkout with `?forcePackageId=1:3`
- Upsell
- Receipt

Fixes made during review:

- Removed SDK display wrappers from design-critical product images so local SDK timing cannot blank fallback art.
- Removed the unused product-page bundle selector script and sticky cart pattern.
- Reworked listicle numbered section heading spacing to avoid heading collisions.
- Added bundle-section scroll offset so anchor navigation does not hide the section eyebrow beneath the sticky nav.
- Removed bump quantity sync so the Mira Travel Pouch remains a single $10 add-on on multi-bottle carts.

No major visual regressions remain from the local pass.

## Pending Deploy Gates

- Push to `main` and wait for Netlify auto-deploy.
- Verify production SDK load at `https://meridian-skincare.netlify.app/mira-v2/` with no `Failed to fetch` errors.
- Run spec-aware QA after the Map Builder spec is re-saved and a fresh Map ID is available.
- Place one sandbox `test_card` order with `--test-order accept --cart 1:3`.
