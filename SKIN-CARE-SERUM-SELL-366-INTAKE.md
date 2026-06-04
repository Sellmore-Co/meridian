# SKIN CARE SERUM — SELL-366 Intake Envelope + Diff Summary

**Lane:** Existing campaign / partial page update (scoped, presentational)
**Linear:** SELL-366 (parent SELL-360, project "Campaigns OS Dogfood Round 2")
**Branch:** `sell-366-existing-campaign-partial-update-with-scoped-qa`
**Campaign:** `skin-care-serum` (meridian / `src/skin-care-serum/`) · template family **olympus**
**Map ID:** `test-campaign-ujqf` · **Public slug:** `skin-care-serum`

> Honest framing for the dogfood: the substrate `skin-care-serum` was itself just
> scaffolded via the CPK `/next-campaigns-setup` flow. For SELL-366 it is treated as
> the **existing baseline campaign** on which a scoped, presentational update is then
> performed. Because it was page-kit-scaffolded (not campaigns-os), it has **no Build
> Packet** — see Runtime truth + R2-E1.

---

## Intake Envelope

| Field | Value |
|-------|-------|
| **Mode** | Existing-campaign partial update — presentational/scoped. No `next build` full rebuild. |
| **Intent** | (1) Replace the multi-slide swiper gallery with a **single product image** on checkout + upsell. (2) **Recolor** the funnel theme to match the product (amber-glass "Lavender" serum). |
| **Source truth** | **Page structure & commerce surfaces:** olympus starter contract (`campaign-cart-starter-templates/campaign-kit-templates/src/olympus`). **Product image + campaign data:** Campaigns API (`campaigns.apps.29next.com`), key `Abhm…eQp0`, campaign "TEST CAMPAIGN", package `ref_id 1`, image `db97a2f2…webp`. |
| **Runtime truth** | **No campaigns-os Build Packet** (page-kit scaffold, not campaigns-os). Reconstructed: funnel `checkout → upsell-bundle-stepper → receipt`; SDK loader `campaign-cart@v0.4.18`; 1 package, $69.99 USD; routing meta campaign-rooted (verified in `_site`); `npm run build` → **77 pages OK**. |
| **Change policy** | **Presentational (applied):** hero image (checkout+upsell), `:root` color tokens (base.html override), removal of unused swiper CSS/JS deps — does **not** touch commerce. **Structural, user-authorized (applied at scaffold):** reduce to a single upsell (drop tier-cards + tier-pills) and rewire its accept/decline → `receipt.html`. This intentionally touches `upsell` + `route` surfaces; explicitly authorized ("samo jedan upsell, prvi iz templatea"), not stealth. **Preserved:** all SDK commerce surfaces (see Diff). |
| **Proof policy** | Browser QA on **affected pages only**: `checkout`, `upsell-bundle-stepper`, `receipt`. Typed-card: `--test-order common` is **unblocked** (Devin's SELL-362 correction — global test cards bypass the gateway, create no transactions, not approval-gated). Recommended here **because routing was rewired**. |
| **Next skill / command** | `next-campaigns-polish` is the conceptual lane for these scoped visual/runtime changes. QA via `campaigns-os qa resolve` → `qa run --browser --base-url <preview>` with map `test-campaign-ujqf`, driven from the separate `campaigns-os` checkout (meridian ships the old page-kit spine — same path as SELL-362). |
| **Missing inputs** | (1) No campaigns-os Build Packet for a CPK-scaffolded campaign → doctor-on-packet unavailable; reconstructed instead → **R2-E1**. (2) No deploy-preview URL yet (needs push → Netlify). (3) Store policy URLs / phone empty (dogfood-minimal) — fine for QA, real-shopper gap in production. |

---

## Diff Summary

### Changed (verified vs pristine olympus starter)

| File | Change | Class |
|------|--------|-------|
| `_data/campaigns.json` | Added `skin-care-serum` entry | route registration |
| `src/skin-care-serum/_layouts/base.html` | Added `<style id="serum-theme">` warm-palette `:root` override (+ rating-star + hero-image rules). Nothing removed. | presentational |
| `src/skin-care-serum/checkout.html` | Gallery include → single `<img src=product.webp>`; removed swiper CSS/JS from frontmatter | presentational |
| `src/skin-care-serum/upsell-bundle-stepper.html` | Gallery include → single `<img>`; removed swiper CSS/JS; accept/decline routing `tier-pills` → `receipt` | presentational + route |
| `src/skin-care-serum/assets/config.js` | `apiKey` + `storeName` | config (not commerce logic) |
| `assets/images/product.webp` | **Added** (product image pulled from Campaigns API) | asset |
| `upsell-bundle-tier-cards.html`, `upsell-bundle-tier-pills.html` | **Removed** (single-upsell scope) | funnel scope |

### Preserved — protected commerce surfaces (verified **byte-identical** to olympus starter)

- **All 18 `_includes/`:** `cart-summary01-04`, `checkout-header`, `checkout-progress`, `payment-methods`, `express-checkout`, `express-checkout-inline`, `bump-check01/02`, `bump-switch01`, `upsell-header-bar`, `upsell-payment-logos`, `receipt-skeleton`, `footer`, `swiper-gallery`, `exit-intent-popup`.
- **All 5 `assets/js/`:** `checkout.js`, `checkout-olympus.js`, `upsells.js` (bundle-upsell logic), `promo-banner.js`, `promo-timer.js`.
- **`assets/css/next-core.css`** — SDK CSS untouched; theme is an override layer only.
- **SDK commerce `data-next-*` attributes** on checkout/cart/bundle — untouched.

### Blast radius → QA scope

| Page | Touched by | In QA scope |
|------|-----------|-------------|
| `checkout` | hero image + theme | ✅ |
| `upsell-bundle-stepper` | hero image + theme + routing | ✅ (incl. accept/decline → receipt) |
| `receipt` | shares `base.html` theme (downstream of upsell routing) | ✅ |
| everything else | unchanged | ⬜ out of scope |

---

## Acceptance-criteria check (SELL-366)

- ✅ **Narrow change, not a stealth rebuild** — 4 template files touched; every commerce surface byte-identical to the starter contract.
- ✅ **Protected surfaces named & preserved** — see "Preserved" above.
- ✅ **QA evidence matches blast radius** — scoped Playwright QA on the 3 pages: presentational change **PASS** (single image renders, theme `#8a5a2e` applied, no swiper, routing OK); runtime SDK init blocked by a **domain-allowlist/CORS** issue (environment, not the diff). See `.campaign-runtime/qa-skin-care-serum/verdict.md`.
- ✅ **Missing runtime truth → follow-up issue, not guessed** — recorded as R2-E1, reconstructed rather than fabricated.

## First repair-loop defect

`R2-E1: partial-update intake gap — a CPK (`/next-campaigns-setup`) scaffolded campaign has no campaigns-os Build Packet, so the "run doctor if a packet exists" intake path is unavailable. The partial-update lane had to reconstruct runtime truth by hand. The CPK page-kit setup lane and the campaigns-os doctor/partial-update lane do not share a packet handoff.`

---

## Preview + QA

- **Preview URL:** https://deploy-preview-16--campaignsos.netlify.app/skin-care-serum/
- **Scoped QA:** ✅ done — `.campaign-runtime/qa-skin-care-serum/verdict.md` (+ 3 screenshots). Disposition `ready_with_exceptions`.
- **Runtime exception:** SDK campaign load blocked by CORS — preview origin `*.campaignsos.netlify.app` not on the store's allowed-domains for API key `Abhm…`. Fix: allowlist that domain, or redeploy to the approved `meridian-skincare.netlify.app`. (Secondary: SDK auto-detected currency RSD vs USD campaign.)

## Remaining steps

1. Post the SELL-366 comment (envelope + diff + preview + QA) and file **R2-E1**.
2. Resolve the domain allowlist (or redeploy to approved domain) → re-run QA → optional `--test-order common`.
