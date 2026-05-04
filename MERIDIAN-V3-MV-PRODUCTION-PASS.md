# Meridian v3 MV Production Pass Log

Date: 2026-05-04
Repo: `/Users/devin/Developer/meridian`
Commit: `34e6c22` (`Add Meridian theduo-v3 MV checkout funnel`)
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

2. Restorative Cleanser accept behavior is timing-sensitive.
   - A direct hydrated pass can add cleanser at `$29.00` (`101988`).
   - A faster click immediately after landing on upsell sometimes stays on `/upsell/` and does not advance.
   - Repeating the mutation can double-add cleanser (`101996`).

3. Receipt/page-load console noise remains after navigation.
   - Repeated browser passes show `signal is aborted without reason`; some receipt reloads also show analytics/order fetch `Failed to fetch`.
   - The orders and receipt line items still rendered, so this did not block checkout verification, but it is worth separating expected navigation aborts from real API failures.

## Notes

- The attached spec typo on the third Expert row (`qty: 1`) was treated as intended quantity `3`; order `101994` confirms the live campaign supports 3x Expert at the x3 offer price.
- Checkout totals returned by `window.next.getCartTotals()` can be stale or misleading immediately after configurable-slot mutations; receipt line items were used as truth.
