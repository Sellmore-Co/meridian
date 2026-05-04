# Meridian v3 MV Production Pass Log

Date: 2026-05-04
Repo: `/Users/devin/Developer/meridian`
Initial commit: `34e6c22` (`Add Meridian theduo-v3 MV checkout funnel`)
Target path: `/theduo-v3/`
Live checkout: `https://meridian-skincare.netlify.app/theduo-v3/checkout/`

## Build + Deploy

- Added `theduo-v3` to `_data/campaigns.json`.
- Copied the Meridian v2 funnel to `src/theduo-v3/` and rewired paths to `/theduo-v3/`.
- Wired campaign ref `1549` with SDK `0.4.18` and API key from `campaign-spec-theduo-v3.json`.
- Checkout MV selector uses configurable slots for Standard/Expert per bottle.
- Premium Lip Balm is a fixed one-time pre-purchase bump, package `5`.
- Post-purchase chain is checkout -> Restorative Cleanser -> Eye Renewal Cream -> receipt.
- `npm run build` passed, building 16 pages.
- Pushed `main` to GitHub; Netlify production served `/theduo-v3/checkout/` with HTTP 200 at 2026-05-04 07:45 UTC.

## Local/Live Structural QA

- Live checkout reached `html.next-display-ready`.
- Checkout renders 3 MV supply cards.
- Default 2-pack renders 2 configurable variant selectors with `Standard` and `Expert` options.
- 3-pack card expands to 3 configurable slots.
- Mobile 390px checkout had no horizontal overflow in the local pass.
- Removed copied Olympus demo hooks from the MV helper: `initFomo()` and `EXIT10` exit-intent coupon.

## Test Orders

| Result | Order | Ref ID | Scenario | Receipt evidence |
| --- | --- | --- | --- | --- |
| PASS | `101986` | `7e916d845f70422c8f3a70b292729e9a` | Default UI 2x Standard, skipped cleanser, skipped eye | `2x The Duo - Standard` at `$59.00/ea`, total `$118.00` |
| PASS | `101988` | `2d947825abf74a9b8003a3d8cd5f280f` | 1x Expert + Premium Lip Balm, added Restorative Cleanser, skipped eye | Expert `$94.00`, Lip Balm `$26.00`, Cleanser `$29.00`, total `$149.00` |
| PASS with pricing issue | `101991` | `c1f4b152961f4017b535fa120c4a8ffc` | 1x Standard + 1x Expert, skipped cleanser, added Eye Renewal | Standard `$59.00`, Expert `$75.00`, Eye `$38.00`, total `$172.00` |
| PASS | `101994` | `52d532099be44723b9d32e8055dc5c92` | 3x Expert, skipped cleanser, skipped eye | `3x The Duo - Expert` at `$65.00/ea`, total `$195.00` |
| PASS | `102004` | `70e99eeabe4f4169a26ac6bb3c82962d` | 1x Standard + Premium Lip Balm, skipped cleanser, skipped eye | Standard `$74.00`, Lip Balm `$26.00`, total `$100.00` |
| PASS | `102006` | `037064ab48d441e78573d88ab49a50c3` | UI-selected 1x Expert via variant selector, skipped cleanser, skipped eye | `1x The Duo - Expert`, total `$94.00` |
| PASS after Eye voucher fix | `102008` | `3e593c5890074378a5ef2747d02196f2` | 1x Standard, skipped cleanser, accepted Eye Renewal with `EYERENEWAL` voucher | Standard `$74.00`, Eye `$19.00`, total `$93.00` |

## Defect Specimens

| Order | Ref ID | What happened |
| --- | --- | --- |
| `101996` | `14c07ea09ac94dfb90288a3e3cc817b0` | Stress/operator specimen: repeated cleanser add produced two Restorative Cleanser lines, one at `$29.00` and one at `$39.00`. Do not treat as a clean funnel pass. |
| `102001` | `b88bbd5e095045408129599451e0749b` | Clean checkout + Eye add, but the visible cleanser accept button did not add cleanser before manual navigation to Eye. Receipt has Standard + 2x Expert + Lip Balm + Eye only. |

## Issues Found

1. Eye Renewal post-purchase discount is not being applied.
   - The upsell page says `Save 50%`, and the CampaignSpec/API offer exposes Eye Renewal at `$19.00`.
   - Accepted Eye orders charged `$38.00` on receipts (`101991`, `102001`).
   - Likely cause: the `any` offer for package `2` has `code: null`; the current post-purchase add path is not binding that offer automatically.
   - Resolution: Campaigns App offer was reconfigured with `EYERENEWAL`; v3 now passes `data-next-bundle-vouchers='["EYERENEWAL"]'` on the Eye upsell card. Retest order `102008` charged Eye Renewal at `$19.00`.

2. Restorative Cleanser accept behavior is timing-sensitive.
   - A direct hydrated pass can add cleanser at `$29.00` (`101988`).
   - A faster click immediately after landing on upsell sometimes stays on `/upsell/` and does not advance.
   - Repeating the mutation can double-add cleanser (`101996`).

3. Receipt/page-load console noise remains after navigation.
   - Repeated browser passes show `signal is aborted without reason`; some receipt reloads also show analytics/order fetch `Failed to fetch`.
   - The orders and receipt line items still rendered, so this did not block checkout verification, but it is worth separating expected navigation aborts from real API failures.
   - Analytics note: raw source HTML does not contain the explicit Campaigns App snippet, but after SDK readiness `document.scripts` includes `https://campaigns.apps.29next.com/js/v1/campaign/`, and `window.nextCampaign` is configured by the SDK because `nextConfig.analytics.providers.nextCampaign.enabled` is true.

## Notes

- The attached spec typo on the third Expert row (`qty: 1`) was treated as intended quantity `3`; order `101994` confirms the live campaign supports 3x Expert at the x3 offer price.
- Checkout totals returned by `window.next.getCartTotals()` can be stale or misleading immediately after configurable-slot mutations; receipt line items were used as truth.

## Follow-up Component Hardening Pass

Date: 2026-05-04

Commits:

- `c35a705` — `Harden mobile MV component layout`
- `1f14c06` — `Tighten MV bundle card labels`

What changed:

- Restored product thumbnails inside mobile configurable-slot cards.
- Kept mobile variant controls as native `<select>` elements because they are more reliable than custom dropdown overlays in narrow checkout columns.
- Hid secondary per-slot pricing metadata on mobile before hiding product media. The thumbnail and selector are the primary user task.
- Bounded the Premium Lip Balm pre-purchase bump so its title, checkbox, price, checklist, and image all fit inside the actual checkout column at 390px.
- Tightened desktop MV card label positioning so "Most Popular" and "Best Value" stay inside their cards at 1024px.

Live verification after deploy:

- Mobile 390px, 3-bottle state: no horizontal overflow; 3 slots render; each slot thumbnail is 56px, inside the card; each native select is visible and enabled.
- Mobile 390px bump: no horizontal clipping; card width 252px; content grid computes to `106px 84px`; bump image is 84px and inside card bounds.
- Desktop 1024px: no horizontal overflow; 2-card and 3-card labels stay inside card bounds.
- Screenshots saved during verification:
  - `/tmp/meridian-v3-final-mobile.png`
  - `/tmp/meridian-v3-final-desktop.png`

## V1/V2/V3 Process Comparison

This MV pass was not a fresh-from-zero campaign build. It inherited the repeatable discipline proven by Meridian v2, then stressed the next weak layer: configurable-slot commerce components inside custom responsive design.

| Version | Role in the build-system learning loop | Main friction class | Outcome |
| --- | --- | --- | --- |
| `theduo-v1` | Discovery pass | Route interpretation, design-file ambiguity, unsupported payment methods, static price cleanup, shipping IDs, SDK hook preservation, upsell offer behavior, local CORS, Spreedly/test-order mechanics, receipt truth | Proved a fresh design + CampaignSpec + API key could become a live working campaign, but much of the work was hand-wired. |
| `theduo-v2` | Discipline pass | Catalog extraction, source/rendered SDK linting, partial parameterization, design-carries-opinion doctrine | Proved the Olympus-shaped checkout could be rebuilt through canonical commerce components with 0 lint violations, 100% binding accuracy, and 55% smaller source. |
| `theduo-v3` | Stress pass | MV configurable slots, per-bottle Standard/Expert selection, mobile selector reliability, generated slot thumbnail layout, order bump fit, upsell voucher application, backend truth after cart mutations | Proved the build path is more repeatable, but MV needs Tier-1 responsive component contracts rather than one-off campaign CSS. |

The old friction categories were mostly absent here because v2 converted them into process. The new friction was not "agent forgot SDK wiring"; it was "commerce components need responsive contracts when injected into custom design shapes."

## Pipeline Implications

The practical standard should be:

> Goal is not zero polish. Goal is no SDK re-wiring during polish.

Acceptable polish:

- spacing and rhythm
- image crop or static-vs-carousel composition choices
- mobile card fit
- selected-state emphasis
- copy hierarchy

System failure / not acceptable as polish:

- re-discovering which `data-next-*` hooks matter
- rebuilding payment forms by hand
- replacing catalog components because the agentic path could not preserve SDK behavior
- using template-default copy/behavior that contradicts the supplied design
- trusting DOM text after complex cart mutation when backend calculation or receipt truth is needed

The hero image on v3 intentionally stayed closer to the supplied design instead of forcing the original Olympus carousel shape. That is consistent with the doctrine: design carries the visual opinion; the build preserves commerce behavior where commerce behavior exists.

## Next Template-Family Test Plan

For Limos and Demeter, use totally fresh fake full-funnel designs with fresh products, images, copy, and Campaigns App configs. Reusing Meridian assets would hide whether the build path is genuinely template-family capable.

Recommended test shape per template family:

1. Fresh design source with the target template family shape.
2. Fresh fake product/media assets and Campaigns App packages/offers.
3. Full funnel deployed live.
4. Test orders across the main offer, bump, upsell accept, upsell decline, and receipt paths.
5. Friction log classifying each fix as one of:
   - component parameter missing
   - responsive contract missing
   - template-family inference wrong
   - SDK/API primitive missing
   - normal design/dev polish
   - SDK re-wiring/system failure

This keeps future iterations honest. The purpose of each pass is not to rescue one fake campaign; it is to improve the reusable build system.

## Full Pipeline Track

The broader operating model is:

```text
Design automation / Figma export
  -> opinionated HTML and design components
Campaigns OS
  -> campaign intent, config, routing, operational state
next-campaigns-build
  -> maps design intent onto commerce components without breaking SDK contracts
Agentic QA
  -> verifies live behavior, visual fit, offers, analytics, orders, and receipt truth
```

The long-term goal is shortening go-live from weeks+ to a day. Each stage should emit artifacts the next stage can trust: design should not need Campaign Cart internals; build should not reinterpret design intent from scratch; QA should not depend on a human replaying checkout by hand.
