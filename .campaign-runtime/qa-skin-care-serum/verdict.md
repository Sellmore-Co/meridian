# Scoped QA verdict — skin-care-serum (SELL-366)

**Run:** Playwright headless (chromium-1223), viewport 1440×1200, 2026-06-04.
**Preview:** https://deploy-preview-16--campaignsos.netlify.app/skin-care-serum/
**Scope (blast-radius-matched):** checkout, upsell-bundle-stepper, receipt.
**Disposition:** `ready_with_exceptions`.

## Presentational change — PASS (all 3 pages)

| Check | checkout | upsell-bundle-stepper | receipt |
|-------|:--:|:--:|:--:|
| HTTP 200 | ✅ | ✅ | ✅ |
| Theme applied (`--brand--color--primary == #8a5a2e`) | ✅ | ✅ | ✅ |
| Old blue gone | ✅ | ✅ | ✅ |
| Single product image loaded (naturalWidth 850) | ✅ | ✅ | n/a (no hero) |
| No swiper (`[data-component=swiper]` == 0) | ✅ | ✅ | ✅ |
| Upsell accept + decline controls present | — | ✅ | — |

Screenshots: `checkout.png`, `upsell-bundle-stepper.png`, `receipt.png` (this dir).
Visual: amber-bottle product image, deep-amber CTA, amber promo bar, gold rating stars.

## Exception — runtime SDK init blocked (environment, not the diff)

`sdk_api_attached: false`, `campaign_name: null`, `package_1_price: null` on all pages.

Root cause = **CORS / domain allowlist**:
```
Access to fetch at 'https://campaigns.apps.29next.com/api/v1/campaigns/?currency=RSD'
from origin 'https://deploy-preview-16--campaignsos.netlify.app'
blocked by CORS policy: No 'Access-Control-Allow-Origin' header.
```
The preview origin `deploy-preview-16--campaignsos.netlify.app` is not on the store's
allowed-domains list for API key `Abhm…eQp0`, so the campaign never loads → no prices/cart →
commerce areas render blank. Secondary: SDK auto-detected **currency RSD** (operator locale)
vs USD campaign — masked by the CORS failure, recheck after allowlisting.

This is independent of the partial update (would hit a pristine campaign on this domain too).

**Fix:** allowlist `*.campaignsos.netlify.app` for the store, or redeploy to the already-approved
`meridian-skincare.netlify.app` (the domain SELL-361 marked allowlist ✅).

## Typed-card test order — not run

(1) Blast radius is presentational; commerce surfaces are byte-identical to the starter, so an
order tests code we didn't change. (2) Moot regardless until the domain is allowlisted (SDK can't
init). Available via `campaigns-os qa run --test-order common` once the domain/packet are sorted.
