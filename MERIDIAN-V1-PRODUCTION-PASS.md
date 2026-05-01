# Meridian v1 Production Pass Log

Date: 2026-05-01
Repo: `/Users/devin/Developer/meridian`
Branch: `codex/meridian-v1-build`
Target path: `/theduo-v1/`

## Inputs

- CampaignSpec: `campaign-spec-theduo-v1.json`
- Schema: Campaign Map Spec 4.2
- Campaign: Meridian - The Duo v1
- SDK target: campaign-cart 0.4.18
- Design source: `~/.gstack/projects/Developer/designs/meridian-skincare-20260501/`
- Template reference: Olympus, treated as a component/wiring reference rather than the campaign template source of truth

## Source-of-Truth Findings

- Campaign API key is present in the spec and is used locally for build configuration. It is intentionally not recorded here.
- Live Campaigns API confirms packages:
  - Package 1: Meridian - The Duo, base unit price 74.00
  - Package 2: Eye Renewal Cream, offer price 19.00 through offer ref 1
  - Package 3: Restorative Cleanser, offer price 29.00 through offer ref 4
- Spec/API drift found after launch: the exported local Spec includes offers 1-3 only, while the live Campaigns API now includes offer ref 4 for package 3. Treat the API as runtime truth for QA, and regenerate/update the Spec before using it as a durable build artifact.
- Live Campaigns API confirms only one shipping method: ref ID `1`, code `default`, price 0.00.
- Live Campaigns API confirms payment methods: `bankcard`, `apple_pay`, `google_pay`.
- Spec marks pages as custom. This is workable: the design HTML is the visual source, while Olympus provides SDK-managed surface patterns.

## Initial Friction Points

- The spec routes presell to `index.html`, while the design folder's `index.html` is a design guide, not a funnel page.
  - Final build decision: use design `presell.html` as production root `/theduo-v1/`; use design `landing.html` as `/theduo-v1/landing/`; preserve the full Spec path `Presell > Landing > Checkout > Upsell > Receipt`.
- The upsell design references a 40% voucher-style discount, but live API exposes a 25% cleanser offer and no voucher code.
  - Build decision: remove static 40% copy.
  - Later finding: the live calculate endpoint returns base package 3 pricing for `?upsell=true`, even with an upsell line, and there is no documented offer-id attribute to force offer ref 4 pricing. The page now shows SDK dynamic base pricing rather than unsubstantiated savings.
  - Follow-up finding on 2026-05-01: the live API campaign payload now includes offer ref 4 for package 3, but the local Spec remains stale and the `?upsell=true` calculate path still returns base pricing. This likely needs a Campaigns/API/SDK decision: post-purchase upsells either need automatic offer application, an offer/voucher binding field, or a regenerated Spec that exposes the intended upsell pricing mechanism.
- The checkout mockup includes unsupported payment options (`paypal`, `klarna`).
  - Build decision: hide/remove unsupported methods and keep bankcard plus Apple/Google express.
- Checkout bundle cards include wrong shipping IDs (`2`) on 1x/2x cards.
  - Build decision: normalize checkout shipping IDs to `1`; do not add shipping IDs to post-purchase upsells.
- The mockups include static price strings across presell, landing, checkout, upsell, and receipt.
  - Build decision: every visible product/order price must sit inside SDK-managed display nodes, with neutral placeholders only.

## Tools Used

- `next-campaigns-build` skill instructions
- Sam's `next-campaigns-setup` skill as setup-first-mile reference
- CampaignSpec JSON v4.2
- Live Campaigns API campaign endpoint
- `rg`, `jq`, `curl`, `git`
- `npm init -y`
- `npm install next-campaign-page-kit`
- `npx campaign-init`
- page-kit exported setup helpers to materialize Olympus into `src/theduo-v1`

## Setup Notes

- `npm init -y` and `npm install next-campaign-page-kit` completed cleanly.
- `npx campaign-init` successfully added package scripts and `_data/campaigns.json`, but the interactive text prompts were awkward to automate from this session; clearing default text inserted control characters rather than replacing the prompt value.
  - Build decision: cancel the prompt before template install, then use the page-kit package's exported setup helpers to materialize the same Olympus starter template.
  - Skill recommendation: add non-interactive flags or document a supported scripted mode, e.g. `campaign-init --template olympus --slug theduo-v1 --name "Meridian - The Duo v1" --api-key-from campaign-spec.json`.
- Olympus starter template was materialized into `src/theduo-v1` and registered in `_data/campaigns.json`.

## Recipe / Skill Improvement Notes

- Add an explicit "design index is not production index" decision point to `next-campaigns-build`.
- Add a CampaignSpec vs live Campaigns API offer comparison step; the Meridian upsell discount only became clear from API truth.
- Add lint checks for unsupported payment methods in custom checkout HTML.
- Add lint checks for checkout shipping IDs not found in spec/API, and for any shipping IDs on upsell pages.
- Add a hard-price scan that distinguishes SDK dynamic fallbacks from genuinely static commerce values.
- Add local CORS preflight guidance: in this run the pages loaded locally, but Campaigns SDK API calls were blocked until local origins are allowlisted. The build recipe should ask operators to whitelist `http://localhost:<port>`, `http://127.0.0.1:<port>`, and optionally `http://[::1]:<port>` before browser QA.
- Add an upsell-offer verification recipe. Campaign payload exposed an upsell-looking offer ref, but calculate pricing did not apply it; the skill needs a documented way to decide whether to show savings, hide savings, or require a real order reference before verification.
- Add a Spec drift workflow: when the merchant changes offers/packages after export, record Spec-vs-API drift, keep runtime wiring aligned to API truth, and regenerate the Spec before treating it as immutable.
- Add a starter-template cleanup step. Unused Olympus example partials/scripts contained fake payment methods, fake bump package IDs, FOMO, and exit-intent coupon behavior. Those were not rendered, but they created scan noise and could leak behavior if referenced later.
- Add a visual QA note for checkout pages with sticky sidebars: `prettyscreenshot --cleanup` hid the checkout left column in this run, while plain browser screenshots and selector screenshots showed the real layout. Use plain screenshots for sticky checkout validation.
- Add a CSS override check for template layout widths. Olympus `next-core.css` sets `.checkout-layout__left { width: 50% }`; in a CSS grid this halved the product column until the Meridian skin reset left/right layout widths to `100%`.
- Updated the local `next-campaigns-build` skill and its production gate reference to require local origin allowlisting before SDK browser QA.
- Add the Campaign Cart SDK Konami test-order path to the campaign build recipe. Secure Spreedly iframe fields are not automatable from the outside; use `ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight KeyB KeyA` after selecting the intended cart state, then verify the generated `ref_id`, upsell path, and receipt line items.

## Implementation Notes

- Built five production pages at `/theduo-v1/`, `/theduo-v1/landing/`, `/theduo-v1/checkout/`, `/theduo-v1/upsell/`, and `/theduo-v1/receipt/`.
- Corrected the funnel order to match the Spec: root `/theduo-v1/` is now the presell entry, `/theduo-v1/landing/` is the PDP/landing page, then checkout, upsell, and receipt.
- Preserved SDK-owned checkout surfaces: checkout fields, bundle cards, card payment form, express checkout container, cart summary, submit button, and toggle bump structure.
- Removed unsupported PayPal/Klarna payment markup from active checkout. The only active payment method block is card, with Apple Pay and Google Pay left for SDK express checkout injection.
- Normalized checkout bundle shipping methods to ID `1`; upsell has no shipping method ID.
- Replaced static commerce price text with SDK display nodes across active funnel pages.
- Replaced the checkout starter/template promo surfaces with Meridian-owned guarantee/reserve language.
- Removed unused starter partials/scripts that referenced fake bump package IDs, fake promos, or unsupported payment methods.
- Fixed checkout layout overrides so the left product/review column uses the full grid track and review cards do not collapse into starter flex columns.
- Receipt includes `data-next-order-items` with an item template plus order subtotal, shipping, tax, currency, total, customer, and shipping address display fields.
- Post-launch fixes:
  - Added the missing `data-next-toggle="toggle"` target and `data-next-is-upsell="true"` marker to the Eye Renewal pre-purchase bump, matching starter-template docs.
  - Removed the visual-only express checkout placeholder text; Apple Pay and Google Pay are now only represented by SDK-injected buttons.
  - Added explicit card iframe styling through `paymentConfig.cardInputConfig` and removed static bullet placeholders from the Spreedly containers.
  - Moved the upsell page to the starter-template wrapper pattern: `data-next-upsell="offer"` wraps the hidden bundle selector and add/skip actions.
  - Tightened the upsell top spacing and copy so the CTA sits in the first coherent offer block, and added a receipt fallback link for direct/no-order upsell visits where the SDK hides the post-purchase offer wrapper.
  - Follow-up fix: narrowed the upsell SDK-owned hide surface from the whole visible offer wrapper to the hidden selector/action controls, so direct preview visits still show the offer content and expose a receipt fallback when no order context exists.
  - Follow-up fix: restored real card-brand logo assets in the credit-card header, tightened express-payment spacing, normalized card/CVV field heights, and forced the Eye Renewal bump checkbox to render as an empty box when SDK state is `next-not-in-cart`.
  - Follow-up fix: restored the Olympus-style billing address mount (`os-checkout-element="different-billing-address"`) so unchecking "Use shipping address as billing address" has a SDK target to expand.
  - Follow-up fix: tightened checkout payment spacing, forced card logo image dimensions, widened shipping-address rows to the full checkout form width, and added padding inside the SDK cart summary card.
  - Follow-up fix: moved the upsell accept/decline controls below the cleanser benefit bullets. The direct/no-order fallback now mirrors the visual hierarchy with a primary CTA above `Continue to receipt`; the fallback primary routes back to checkout because a direct upsell visit has no order to mutate.
  - Open UX concern: the Eye Renewal pre-purchase bump uses `data-next-package-sync="1"`, which keeps it synced with the selected Duo quantity. That may be interpreted as too aggressive for a one-time add-on; leave unchanged until we decide whether bumps should always be quantity `1` or mirror the base bundle.

## Verification

- `npm run build` passes and builds 5 pages.
- Focused active-source scan passes for hardcoded price strings, unsupported payment method markup, fake promo codes, lorem text, invalid checkout shipping IDs, and upsell shipping IDs.
- Local server used: `_site` served at `http://localhost:8080`.
- Post-launch local server used: `_site` served at `http://127.0.0.1:8082`.
- Browser structural checks confirm:
  - checkout active payment method list is `credit`
  - checkout shipping IDs are `1, 1, 1`
  - checkout fake promo text is absent
  - checkout express placeholder text is absent
  - checkout Spreedly fallback bullet text is absent, with card/CVV containers left empty for SDK iframe injection
  - Eye Renewal bump includes the required `data-next-toggle="toggle"` target
  - upsell package is package `3`
  - upsell has no shipping IDs
  - upsell offer wrapper owns `data-next-upsell="offer"` and `data-next-bundle-selector-id="upsell-bundle"`
  - upsell add/skip actions are visible in a 720px-tall desktop viewport after the layout tightening
  - direct/no-order upsell previews keep the product offer content visible even if the SDK hides post-purchase controls
  - direct/no-order upsell fallback simulation keeps the offer card visible and shows `Continue to receipt`
  - checkout local browser check confirms unchecked Eye Renewal box has hidden icon, credit-card header renders 4 logo images with no text fallback, and month/year/CVV fields compute to matching `56px` heights
  - receipt order item template and order display fields are present
- Local route/layout follow-up checks confirm:
  - `/theduo-v1/` renders the presell article and links forward to `/theduo-v1/landing/`
  - `/theduo-v1/landing/` renders the PDP/landing page and links forward to `/theduo-v1/checkout/`
  - checkout shipping rows render at full checkout form width instead of centered/narrow
  - checkout card logo assets compute to visible `35px` widths
  - direct/no-order upsell fallback appears below the 5 benefit bullets with a primary CTA above `Continue to receipt`
- Netlify deploy preview check for commit `ac05843` confirms:
  - direct `/theduo-v1/upsell/` shows the full Restorative Cleanser offer card, hides SDK post-purchase controls without order context, and exposes `Continue to receipt`
  - hydrated `/theduo-v1/checkout/` reaches `html.next-display-ready`
  - Eye Renewal bump starts `next-not-in-cart` with the check icon hidden, adds package 2 on click, and returns to `next-not-in-cart` with no summary line item on second click
  - card header renders 4 logo images, with no text fallback
  - month, year, and CVV controls compute to matching `56px` heights
  - fresh checkout pass reports no browser console errors
- Netlify deploy preview test-order pass confirms:
  - Konami checkout test order `101887` / `ref_id=c15c6a56592042859e4ae96b9abae16c` created from a 1x Duo cart, redirected to `/upsell/`, skip redirected to `/receipt/`, and receipt rendered `1x Meridian - The Duo` with `$74.00` total.
  - Konami checkout test order `101889` / `ref_id=8871578f3f6f41e09558074bd5830ba4` created from a 1x Duo + Eye Renewal bump cart, redirected to `/upsell/`, accept added `1x Restorative Cleanser`, and receipt rendered Duo + Eye Renewal + Cleanser with `$132.00` total.
  - Fresh receipt reload for order `101889` reached `html.next-display-ready` and reported no browser console errors.
- SDK hydration and real test-order execution are verified on Netlify preview. Local browser QA still requires origin allowlisting, otherwise Campaigns SDK API calls show `Failed to fetch` CORS errors and dynamic prices remain placeholders.
