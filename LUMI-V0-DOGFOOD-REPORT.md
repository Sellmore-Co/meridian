# Lumi v0 Campaigns OS Dogfood Report

Linear: SELL-286
Map ID: `lumi-v0-qdos`
Local base URL: `http://127.0.0.1:4173/lumi-v0/`
Preview URL: `https://deploy-preview-12--meridian-skincare.netlify.app/lumi-v0/`
Output: `src/lumi-v0`

## Result

Built and QA-ran the Lumi Daily Wellness Set campaign locally, then patched the upstream Map Builder export rule that caused the multi-currency `next-currency` conflict.

The build is previewable and all six routes return 200:

- `/lumi-v0/`
- `/lumi-v0/landing/`
- `/lumi-v0/checkout/`
- `/lumi-v0/upsell/`
- `/lumi-v0/upsell-2/`
- `/lumi-v0/receipt/`

Latest Campaigns OS browser QA against the Netlify preview is `ready_with_exceptions`, not blocked. Static routing, meta tags, payment mounts, checkout package bindings, and upsell controls pass. The remaining warning is a non-blocking receipt-page 404 console resource warning.

The original designer CampaignSpec is untouched. The local build packet now points at a normalized internal copy, `campaign-spec-lumi-v0.json`, with page-level `next-currency` meta removed so the multi-currency flow can remain country/runtime driven.

## Commands

- `npm run campaigns-os -- prepare-build ...`
- `npm run campaigns-os -- doctor ... --json`
- `npm run build`
- `npm run campaigns-os -- qa resolve --packet campaign-runtime-lumi-v0.build.json --base-url http://127.0.0.1:4173/lumi-v0/ --json`
- `npm run campaigns-os -- qa run --packet campaign-runtime-lumi-v0.build.json --base-url http://127.0.0.1:4173/lumi-v0/ --browser --output-dir qa-output/lumi-v0 --json`
- `npm run campaign-os -- supervise-qa ...`
- `npm run build` in `/Users/devin/Developer/next-campaigns-ops`

## QA Evidence

Latest browser QA verdict:

- Run ID: `MPBE5W8TKOACAF54VDEKSFH9J8`
- Disposition: `ready_with_exceptions`
- Counts: 37 pass, 1 warn
- Local verdict: `qa-output/lumi-v0/lumi-v0-qdos/MPBE5W8TKOACAF54VDEKSFH9J8.json`
- Dashboard URL: `https://campaign-map.nextcommerce.com/qa?slug=lumi-v0-qdos&run=MPBE5W8TKOACAF54VDEKSFH9J8`
- Base URL: `https://deploy-preview-12--meridian-skincare.netlify.app/lumi-v0/`
- Payment evidence: `card_mounts=1; cvv_mounts=1; spreedly_frames=2`

Latest non-browser supervisor-compatible verdict:

- Run ID: `MPB35QW1KE8BSUFQ5I64O7D68C`
- Disposition: `ready`
- Counts: 26 pass
- Local verdict: `qa-output/lumi-v0/lumi-v0-qdos/MPB35QW1KE8BSUFQ5I64O7D68C.json`
- Supervisor report: `.campaign-runtime/lumi-v0-qa-supervisor-report.json`

Supervisor status is `ready` and confirms the four original `next-currency` blockers are resolved in the normalized build.

Visual pass:

- Desktop and mobile screenshots for all six pages.
- Manifest: `qa-output/lumi-v0/screenshots/visual-pass.json`
- Spot-check screenshot: `qa-output/lumi-v0/screenshots/checkout-mobile.png`
- All checked pages returned 200, had body content, had no image load failures, and had no horizontal overflow at 1440px or 390px.

## Fixes Applied

- Registered `lumi-v0` in `_data/campaigns.json`.
- Created the local Page Kit campaign at `src/lumi-v0`.
- Rooted links, assets, checkout success URL, and upsell accept/decline URLs to `/lumi-v0/...`.
- Added SDK `config.js` and loader wiring.
- Preserved the custom checkout bundle selector and bump instead of forcing a canonical `shop-single-step` checkout.
- Repaired upsell action attributes from source `accept`/`decline` to SDK contract `add`/`skip`.
- Added checkout `data-next-bundle-items` bindings for the 1x, 2x, and 3x bundle cards.
- Converted the order bump into a `data-next-package-toggle` surface for package `2`.
- Changed payment method wiring to the SDK contract value `credit`.
- Added SDK checkout field mounts for card number, expiry month, expiry year, and CVV.
- Patched Map Builder so multi-currency campaigns do not emit page-level `next-currency` unless the campaign is effectively single-currency.
- Repaired checkout commerce zones after deployed-preview review:
  - bundle cards now use supported `data-next-bundle-display="price"` and include fallback prices
  - payment card/CVV mounts use fixed-height `.spreedly-field` containers
  - express checkout has the SDK `data-next-express-checkout` button container
  - order summary now nests `data-summary-lines` inside a line-item template instead of placing it on the whole panel
  - order bump has a native visual checkbox synchronized with the SDK toggle card state

## Dogfood Findings

1. Multi-currency meta conflict:
   Map Builder/CampaignSpec exported `next-currency: USD` for a multi-currency campaign whose README explicitly says not to hardcode currency. Map Builder now only emits `next-currency` when `available_currencies` is absent/singleton. Existing exported specs need regeneration or normalization.

2. Local runtime verification is blocked by allowed-domain/CORS:
   SDK calls to `https://campaigns.apps.29next.com/api/v1/campaigns/?currency=USD` and `/api/v1/carts/calculate/` fail from `http://127.0.0.1:4173`. Static commerce mounts now pass, but live price switching, cart totals, currency switching, and typed-card proof still need a deployed/allowlisted preview.

3. QA supervisor schema lags public browser QA:
   `next-campaigns-ops` supervisor rejected public QA verdicts containing `browser-runtime` assertions. The non-browser verdict works, but the internal supervisor cannot currently triage browser-enabled public Campaigns OS output.

4. Upsell action vocabulary mismatch:
   The prepared README/source used `data-next-upsell-action="accept"` / `"decline"`, while the `shop-single-step` contract and QA runner expect `"add"` / `"skip"`. The build now uses `add`/`skip`.

5. Commerce-zone pass-through was too permissive:
   The custom checkout needed canonical commerce component structure inside the designed layout. The first PR pass preserved too much bespoke HTML and only added SDK attributes, which let older failure modes through: unsupported bundle display keys, malformed cart summary templates, oversized Spreedly mounts, and ambiguous bump selection. Build/polish should treat bundle selector, order bump, payment, and order-summary zones as protected canonical components even in custom/derivative templates.

6. QA needs commerce-surface visual assertions:
   Static/browser QA counted required selectors but did not catch blank 2x/3x bundle prices, raw order-summary text, or bad payment field dimensions. Add targeted assertions for non-empty bundle price surfaces, sane Spreedly mount dimensions, clickable package toggles, and styled cart-summary rows.

## Remaining Gates

- Regenerate or normalize existing multi-currency CampaignSpecs that already contain page-level `next-currency`.
- Deploy to a preview domain and allowlist it for the campaign API key.
- Rerun browser QA against the preview URL.
- Run typed-card test-order proof only after allowed domains and sandbox card routing are confirmed.
