# T-Shirt MV v1 Production Pass Log

**Date:** 2026-06-04
**Repo:** `Sellmore-Co/meridian`
**Branch:** `sell-365-shop-or-mv-family-contract-stress-pass`
**Target path:** `/tee-mv-v1/`
**Linear:** [SELL-365 — Shop or MV family contract stress pass](https://linear.app/nextcommerce/issue/SELL-365)
**Project:** Campaigns OS Dogfood Round 2 — Source-to-Proof Workflow (parent [SELL-360](https://linear.app/nextcommerce/issue/SELL-360))

---

## 1. Selected family

**`olympus-mv-single-step`**

### Reason

The selected candidate (campaign 1585 / map `sam-haslam-9jai` on samtest.29next.store) ships a 10-SKU variant catalog (T-Shirt × 5 colors × 2 sizes) with `variant_attributes` on every shirt package. The funnel shape is a single-step checkout with one upsell page (Landing → Checkout → Upsell 1 → Receipt). Of the four families allowed by SELL-365, this maps cleanly:

| Family | Fit | Reason |
|---|---|---|
| `shop-single-step` | ✗ | Spec packages are variants (color × size), not bundle multi-packs |
| `shop-three-step` | ✗ | Funnel has a single checkout page, not info / shipping / billing split |
| **`olympus-mv-single-step`** | ✅ | Variant catalog + single-step checkout + variant selector inside checkout |
| `olympus-mv-two-step` | ✗ | No presell / pre-checkout MV selection page in the funnel |

This evaluation does duplicate the `olympus-mv-single-step` family coverage already represented by `meridian/src/theduo-v3/` (Standard / Expert configurable slots, SDK 0.4.18). The duplicate was accepted because shop-* and `olympus-mv-two-step` candidates were not available within the session window, and Sam's variant catalog was the cleanest fit among SELL-365's four allowed families against a ready test store.

---

## 2. Contract fields consumed

From CampaignSpec `meridian/campaign-spec-tee-mv-v1.json` (Map `sam-haslam-9jai`):

| Path | Value | Where it landed |
|---|---|---|
| `campaign.ref_id` | `1585` | n/a (informational) |
| `campaign.campaigns_api_key` | `vWTeG…` | `src/tee-mv-v1/assets/config.js:7` |
| `campaign.currency` | `USD` | inferred via SDK; no override needed |
| `campaign.available_payment_methods` | `["bankcard","paypal"]` | preserved canonical payment surface in `checkout.html` |
| `campaign.available_express_payment_methods` | `["paypal"]` | preserved canonical express checkout surface |
| `funnels[].pages[*].packages[*].ref_id` (variant set 2–11) | T-shirt variants | MV slot picker swaps these; `main_package: 2` is default |
| `funnels[].pages[*].packages[*].variant_attributes` | `color × size` | rendered by `_includes/mv-configurable-selector.html` variant slot template |
| `shipping_methods[0]` | `ref_id 1` / `default` / `$3.99` | `checkout.html` frontmatter `shipping_methods.default: 1` |
| `offers[0]` | `Buy 1 Get 50% Discount` (auto-bind, code `null`, 20% off) | applied by SDK on slot resolve |
| `funnels[].pages[*].sdk_hints.meta_tags` | per-page `next-*` meta | rendered by family layouts |

Family contract reference: `families/olympus-mv-single-step/agentContract.md` (campaigns-os public repo) + `sharedFrontmatterVocabulary`.

---

## 3. Unsupported / demo surfaces removed

| File / line | Before | After | Why |
|---|---|---|---|
| `checkout.html:18-19` | `main_package: 1` (Tariff Fee, no variants) | `main_package: 2` (T-shirt black/small, has color×size variants) | Configurable MV bundle requires variant-bearing package; package 1 has no `variant_attributes` |
| `checkout.html:20-24` | `shipping_methods: { standard: 2, free: 1 }` | `shipping_methods: { default: 1 }` | Sam's store has only one shipping method (`ref_id 1 / $3.99`); the demo `standard: 2` triggered `POST /carts/calculate/ 400` |
| `checkout.html:368-370` | `{% campaign_include 'bump-check01.html' %}` referencing `data-next-package-id="77"` and a sync list of packages 1–9, 66–74 | Removed entirely | Sam's catalog has no pre-purchase bump product; package 77 does not exist |
| `upsell-mv.html:4-5` | `next_url: upsell-bundle-stepper.html` / `decline_url: upsell-bundle-stepper.html` | `next_url: receipt.html` / `decline_url: receipt.html` | Funnel ends in a single upsell page per spec; the chained bundle variants are not part of this campaign |
| `upsell-mv.html:11` | `package_id: 1` | `package_id: 2` | Same MV variant-bearing reasoning as checkout |
| `upsell-mv.html:18-34` | `vouchers_json: '["UP80TSHIRT"]'` on all five tiers | `vouchers_json: '[]'` on all five tiers | Sam's campaign carries no coupon-type voucher codes (offer 1 is auto-bind, `code: null`); `UP80TSHIRT` would 400 on accept |
| `src/tee-mv-v1/upsell-bundle-stepper.html`, `upsell-bundle-tier-cards.html`, `upsell-bundle-tier-pills.html` | Present (3 alternate shop-three-step-style upsell variants) | Deleted | Spec has only one upsell page (MV); the bundle variants are unused and carry their own demo `UP50/UP60/UP70` voucher refs and `package_id: 3` |

### Demo refs that survived (intentionally)

- `_includes/cart-summary03.html:7` carries `data-next-package-id="1"` hard-coded — left in place because the active checkout includes `cart-summary01.html`, not `03`. Not in the rendered output.
- `_includes/bump-check01.html`, `bump-check02.html`, `bump-switch01.html` retain demo bump scaffolding — left in place because no page includes them after the `checkout.html:368-370` removal. Not in the rendered output.

Both are starter-template files preserved for future re-use; they do not surface in this build.

### Tracking / footer / SEO

- GTM / Facebook Pixel: left disabled in `config.js`. `campaign.tracking` in spec is `{status: "unknown", providers: {}}` — no tracking instrumentation expected.
- Store policy URLs (`store_terms`, `store_privacy`, etc.) in `_data/campaigns.json` are sandbox placeholders (`https://meridian-skincare.netlify.app/<path>`). Acceptable for evaluation; merchant would provide real URLs at launch.
- SEO meta: family layouts emit `next-page-type` / `next-currency` from `sdk_hints.meta_tags` in the spec; no demo SEO text survives.

---

## 4. Build / lint evidence

### Build

- `package-kit@^0.1.2` (meridian repo retains the Round-1 build engine; Round-2 campaigns-os spine driven from a separate checkout if/when needed)
- `npm run dev` — successfully serves `/tee-mv-v1/landing/`, `/tee-mv-v1/checkout/`, `/tee-mv-v1/upsell-mv/`, `/tee-mv-v1/receipt/`, `/tee-mv-v1/presell/`
- `_data/campaigns.json` entry registers the campaign with `sdk_version: 0.4.24`, store metadata sandbox-filled

### SDK lint

- meridian uses `scripts/lint-sdk.mjs`, which is hard-scoped to olympus-v0 (per SELL-362 finding **R2-B3**). `olympus-mv-single-step` is olympus-family, so the lint applies; selected-package surfaces pass without mis-fires.
- No `data-next-*` attribute warnings on the active funnel surfaces (`checkout.html` payment / cart / variant-slot mounts, `upsell-mv.html` bundle selector / accept controls, `receipt.html` order item template).

### Runtime smoke

- SDK hydrates correctly: `window.next.getCartData().campaignData` returns `{id: 1585, name: 'Sam Haslam', currency: 'USD', …}`
- MV slot picker renders all three quantity tiers (1× / 2× / 3×) with the default (1×) selected
- Variant selectors render color (5 options) + size (2 options) for the selected slot
- `cartTotals.subtotal` returns `Decimal2 → 10` after a slot is resolved (correct: 1 × $10 T-shirt)
- No `POST /carts/calculate/ 400` errors in console after the §3 fixes

---

## 5. Preview URL

**Local:** `http://localhost:8080/tee-mv-v1/` (dev server, verified)

**Netlify preview:** Pending PR open + Netlify auto-build. Will land at `https://deploy-preview-<N>--meridian-skincare.netlify.app/tee-mv-v1/` once the branch is pushed.

---

## 6. QA / browser output

### Manual browser smoke (SDK 0.4.24)

All page mounts visually verified on the local dev preview:

| Route | Status | Notes |
|---|---|---|
| `/tee-mv-v1/presell/` | ✅ renders | starter article copy, CTA to landing |
| `/tee-mv-v1/landing/` | ✅ renders | starter PDP copy, CTA to checkout |
| `/tee-mv-v1/checkout/` | ✅ renders | MV slot picker (1×/2×/3×), variant selectors (color × size), shipping / cart / payment SDK mounts intact, bump removed |
| `/tee-mv-v1/upsell-mv/` | ✅ renders | MV upsell selector, accept/decline controls, both routes commit to `/receipt/` |
| `/tee-mv-v1/receipt/` | ✅ renders | order item template, totals scaffolding |

Acceptance criteria coverage:

- ✅ Checkout payment mounts: card/CVV iframe containers + Apple Pay / Google Pay / PayPal express buttons render via `_includes/payment-methods.html` and `_includes/express-checkout-inline.html`
- ✅ Rendered upsell controls: bundle selector mount + accept/decline buttons render on `upsell-mv.html`

### Spec-aware browser QA via `campaigns-os qa run --browser`

**Deferred.** meridian ships only `next-campaign-page-kit@^0.1.2`; the Round-2 spine (campaigns-os `qa resolve` / `qa run --browser`) requires a separate `campaigns-os` checkout. Recommend running this pass after merge as a follow-up evaluation iteration.

---

## 7. Typed-card proof

Executed against the local dev preview hitting Sam's live campaign 1585 API (samtest.29next.store). Operator-confirmed: order submit landed on the receipt page with resolved variant line and applied discount. Specific order ref IDs from Sam's admin can be attached as evidence in the PR description if/when needed.

Sandbox card paths used:

- Konami code (`↑ ↑ ↓ ↓ ← → ← → KeyB KeyA`) on the checkout form to auto-bypass Spreedly iframes
- Or `4111 1111 1111 1111` with any future expiry and any CVV
- Test customer: `qa-test@sellmore.co` (Sellmore internal convention per SELL-362 Devin 2026-06-01 comment)

| Test | Result |
|---|---|
| 1× T-shirt single variant submit → receipt | ✅ Receipt rendered; cart lines committed correctly per `cart:updated` event payload (see §8 — the broken `getCartData().cartLines` accessor is unrelated to actual order creation). |

---

## 8. Repair-loop defect — R2-D1

**Filed:** [SELL-419](https://linear.app/nextcommerce/issue/SELL-419) — child issue of SELL-365.

### Original symptom observed during this build

`window.next.getCartData().cartLines` returns `[]` while the MV slot picker renders a default-selected slot and resolved variant pickers. `cartTotals.subtotal` correctly previews the bundle price (`Decimal2 → 10`), but `cartLines` does not populate until checkout submit.

### Triage outcome — not an MV / `olympus-mv-single-step` contract gap

Devin ran the cross-check live against the deployed `theduo-v3` checkout (same meridian repo, SDK 0.4.18, swap mode) on 2026-06-05 and reported:

- Init, no interaction: internal `items` = `[{pkg:1, qty:2}]`, subtotal 148.
- After Standard → Expert swap: internal `items` = `[{pkg:4, qty:1}, {pkg:1, qty:1}]`, `summary.lines` populated, subtotal 168.
- `getCartData().cartLines` is `[]` at every step in both SDK 0.4.18 and 0.4.24.

Root cause is [`campaign-cart#36`](https://github.com/NextCommerceCo/campaign-cart/issues/36): the `getCartData()` accessor returns `enrichedItems`, which is never populated. The real cart lines live in `items` / `summary.lines`. The accessor is globally broken across cart types and SDK versions, not specific to MV and not a 0.4.18 → 0.4.24 regression.

The build for `tee-mv-v1/` is unaffected — no further code changes required for SELL-365 closure. SELL-419 is parked per Devin's recommendation; the eventual fix in `campaign-cart#36` makes `getCartData().cartLines` populate correctly mid-flow and no further work in this campaign is needed.

### Durable lesson for QA contracts (broader than MV)

When checking cart state in browser-driven QA or in analytics instrumentation, assert against the `cart:updated` event payload (`items` / `summary.lines`), never against `window.next.getCartData().cartLines.length` or `cartTotals` mid-flow. The accessor returns the wrong field today and a brittle test built on it would also break after `campaign-cart#36` lands. This QA contract survives the fix.

### Why the original framing was wrong

The "preview vs committed" mental model put into the original R2-D1 was constructed from a single console observation (`cartLines: []` + non-zero `cartTotals.subtotal`) and an inferred comparison against `theduo-v3`'s production pass log. The cross-check against the deployed `theduo-v3` build was not actually run before filing; if it had been, the empty `cartLines` would have been visible there too and the regression claim would not have been made. Logged in this report for transparency.

---

## 9. Notes for next iteration

- `getCartData().cartLines` accessor is parked on [`campaign-cart#36`](https://github.com/NextCommerceCo/campaign-cart/issues/36) — once that lands, browser QA / analytics gating on cart state has a working accessor again. Until then: read `cart:updated` payload (`items` / `summary.lines`).
- Sandbox `store_url` is `https://localhost:3000/` in spec — Sam's campaign was not configured with a real public URL. Doctor warning likely; non-blocking for evaluation.
- Offer naming mismatch: spec offer 1 is named "Buy 1 Get 50% Discount" but the benefit is configured as 20% (`benefit.value: "20.00"`). Cosmetic issue on the merchant side, not a build defect.
- Upsell MV tiers default to `vouchers_json: '[]'` (no voucher applied); merchant would need to add coupon-type voucher codes (e.g. `UP70`) and rewire the tier configs if the campaign intends discounted upsells.
- Spec-aware QA via `campaigns-os qa run --browser` is deferred (meridian is still on page-kit 0.1.2, Round-2 spine drives from a separate `campaigns-os` checkout). Recommend a follow-up evaluation iteration that runs the full Round-2 command spine against `tee-mv-v1/` once #36 fix is in.
