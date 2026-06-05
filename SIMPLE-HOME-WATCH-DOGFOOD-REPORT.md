# Simple Home Watch v0 — Campaigns OS Dogfood Report

**Date:** 2026-06-04
**Slug / route:** `simple-home-watch-v0` (entry = `index.html` at campaign root)
**Template family:** `demeter`  ·  **SDK:** 0.4.24
**Source design:** `../designer/funnel-designs/simple-home-watch` (InSight smart-home funnel)
**CampaignSpec:** `campaign-spec-simple-home-watch-v0.json` — map `simple-home-watch-v0-ql9m`, campaign ref 1637, store `keer.29next.store`
**Preview:** https://deploy-preview-15--campaignsos.netlify.app/simple-home-watch-v0/
**PR:** Sellmore-Co/meridian#15
**Campaign Map:** https://campaign-map.nextcommerce.com/view/simple-home-watch-v0-ql9m
**QA portal (run):** https://campaign-map.nextcommerce.com/qa?slug=simple-home-watch-v0-ql9m&run=MPZ92LLK142U58MAIAGSIBV8SD
**QA run reference:** map `simple-home-watch-v0-ql9m` · run `MPZ92LLK142U58MAIAGSIBV8SD` · spec `sha256:c42a50be…` · disposition `blocked` (see F2)

## What was built

A fresh demeter page-kit slice assembled from the CampaignSpec, restyled to the **source landing look** as a CSS overlay, with commerce surfaces preserved byte-for-byte.

Funnel: `presell (index) → landing → checkout → upsell → upsell-2 → receipt`

- **presell + landing**: source standalone designs preserved via a `landing-passthrough.html` layout (frontmatter + asset rewrites to `/simple-home-watch-v0/...` + SDK loader/config/meta injected + CTAs repointed into the flow). 82 asset refs + 12 CTAs rewritten on landing; presell CTA → landing.
- **checkout / upsell / upsell-2 / receipt**: demeter starter surfaces, wired from the spec, with a hand-authored root-variable `brand-theme.css` overlay (Montserrat; CTA `#ff6d00`, navy `#04265e`, teal `#16deb1`) loaded after `next-core.css`.
- **Commerce**: main pkg1 with 1x/2x/3x tiers → Wifi/Wifi2x/Wifi3x auto-offers (43/50/55%); single order bump pkg2 New Doorbell (Doorbell Bonus 40%); upsell **stepper** pkg3/`WINDOW` → upsell-2 pkg4/`LIGHT` → receipt; checkout exit-intent `EXIT5`; single free shipping method.
- **Payments**: apple_pay / google_pay / bankcard. PayPal + Klarna removed per spec `available_payment_methods`.

Build: `npm run build` → 80 pages. Doctor: `ready_with_warnings` (0 errors). Assembly report: `ready`.

## QA + test orders

Browser QA (Playwright, against the deploy preview): **46/46 assertions pass**, disposition `ready` — pages render, SDK initializes on the preview origin (allowlist OK), meta tags match spec routing.

Typed-card test orders (gateway-bypass test cards — no real transactions): **4 verified orders created**:

| Shape | Order | Total | Upsell line | Verified |
|---|---|---|---|---|
| checkout | 102413 | $69.98 | — | ✅ 201/200 |
| accept | 102414 | $89.97 | Window & Door Sensor ×1 ($19.99) | ✅ 201/200 |
| decline | 102416 | $69.98 | — | ✅ 201/200 |
| accept-decline | 102417 | $89.97 | Window & Door Sensor ×1 | ✅ 201/200 |

Commerce math verified end-to-end: 2× Indoor Cam at Wifi-2x auto-offer (50% → $69.98); accepted upsell added Window Sensor at WINDOW voucher (50% off $39.99 → $19.99) → $89.97. **Upsell accept and decline both function**; the upsell line is persisted in the verified server-side orders.

**Disposition reported as `blocked`** — see Finding F2. This is a QA-runner detection false-negative, not a campaign defect: the funnel is functionally correct (verified orders prove the upsell add).

## Dogfood findings (friction)

**F1 — Theme auto-generation returns empty on token-less legacy CSS.** `theme inspect` (inspect_only) selected the source `checkout.html`, found 2 tokens / 0 mappings, and `theme generate` would emit empty CSS (`theme.css.empty`). Root cause: the landing stylesheet is a legacy affiliate CSS with hardcoded hex and no `:root` token layer; the `figma-sections-export` extractor needs a token layer the source doesn't expose. **Had to hand-author** the brand overlay (root-variable remap of next-core's 16 brand tokens + font-family). *Suggested fix: extractor should palette-scrape (dominant colors / CTA color / font-family) as a fallback when no token layer is present, or emit a pre-filled template keyed to the next-core token list.*

**F2 — QA runner false-negative on stepper upsell-accept API detection.** The `accept` and `accept-decline` shapes failed the step assertion "upsell accept did not call order upsell API" (`upsell_request_seen: undefined`), forcing disposition `blocked`. But the resulting orders (102414, 102417) are **verified with the upsell line present** and the correct total ($89.97) — so the order-upsell API *was* called; the runner just didn't observe the network request in its wait window for the stepper offer's accept flow. *Suggested fix: confirm the upsell add via order read-back (which already happens and passes) rather than gating solely on observing the live network call, or widen/realign the network wait for the stepper `data-next-upsell-action="add"` path.*

**Re-run characterization: CONSISTENT, not flaky.** A second `accept`-only run reproduced it exactly — order **102419** verified with the $89.97 upsell total, yet `upsell_request_seen: undefined` and the same step assertion failure. Across both runs, **5/5 test orders verified** with correct upsell lines; the detection gap is reproducible for the stepper accept path. The `blocked` disposition is therefore a runner-side observation gap, not a campaign defect.

**F3 — Demeter checkout ships unsupported payment methods enabled.** The starter `payment-methods.html` include defaults to `show_paypal=true show_klarna=true`. The spec's `available_payment_methods` excludes both. The doctor flags `frontmatter.replaceFromSpecOrApi` for packages/shipping but does **not** flag the payment-include args — easy to ship PayPal/Klarna buttons that aren't configured. *Suggested fix: doctor should cross-check `payment-methods` include args against `available_payment_methods`.*

**F4 — Package-ref ambiguity (spec ref_ids vs stale README IDs).** The source README listed package/variant IDs 399/401/403/405; the CampaignSpec uses ref_ids 1/2/3/4. The agent had to infer that the spec ref_ids are the real keer package IDs (confirmed via `offers[].packages[].package_id`). *Suggested fix: spec could carry the resolved `package_id` explicitly on each package entry, not only inside offers.*

**F5 — `base.html` auto-emits only 5 meta tags.** The auto-emission (`{% if next_url %}`) covers next-success/accept/decline/page-type/funnel but **not** `next-currency`, `next-predictive-address`, `next-prevent-back-navigation`. These must be listed in explicit `meta_tags` frontmatter — easy to miss; the prior dogfood (home-outage) hit the same thing. *Suggested fix: base.html should emit spec `sdk_hints.meta_tags` automatically, or the build should warn when a page's spec meta tags aren't all present in rendered output.*

**F6 — Source presell carries hardcoded `$` copy** (doctor `copy.hardcoded_currency_symbol`). Informational page; left as-is for the dogfood. Polish item if GBP becomes a real market (spec lists GBP as an available currency).

**F7 — Brand transition: blue presell → orange/navy landing+commerce.** presell is preserved as its source blue InSight editorial; landing + commerce use the landing-look overlay. Intentional per the build contract (preserve source designs; restyle commerce to landing look), but worth a polish decision if visual continuity across the full funnel is desired.

## What worked well

- Spec-first flow (`prepare-build → doctor → next setup/build`) cleanly derived the Build Packet, page map (6/6 high-confidence), and scaffold handoff.
- `campaign-init` produced a correct atomic demeter slice; the frontmatter-driven commerce surfaces (bundles, order bump, stepper `upsell_offer`) made spec wiring mostly declarative.
- `campaign_link` filter auto-roots routing meta to the campaign path — resolved the `routing_meta.runtime_root` warning without manual path edits.
- Browser QA + typed-card test orders gave real server-verified proof (order totals, voucher math, upsell add/decline) against a live Netlify preview.

## Next steps / open items

- F2: decide whether the `blocked` disposition should hold given verified orders, or adjust the runner's upsell-accept detection.
- Polish pass (F6/F7) if this graduates beyond dogfood.
- Test orders 102413/102414/102416/102417 are test orders on keer and can be deleted.
