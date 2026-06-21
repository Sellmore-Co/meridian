# Lumi Campaigns OS Build Loop Notes

Date: 2026-06-21

## Runs

- `lumi-v0`
  - Template: public `shop-single-step`
  - Source: prepared Lumi HTML funnel
  - Doctor: `ready_with_warnings`
  - Routed browser QA: `blocked`
  - QA run: `.campaign-runtime/qa-lumi-v0-local-routed/lumi-v0/MQNJSP8Q5K328P1GV5L1OG42U4.json`
  - Local screenshots:
    - `.campaign-runtime/evidence/lumi-v0-local-desktop.png`
    - `.campaign-runtime/evidence/lumi-v0-local-mobile.png`
  - Notable result: all route HTTP checks passed under `/lumi-v0/`, but browser QA blocked on runtime/commerce evidence. The route is visually coherent as a preserved prepared-source funnel, but checkout/upsell pricing selectors and receipt placeholder residue need follow-up before this can be treated as campaign QA proof.

- `lumi-arjuna-v0`
  - Template: private `adsbranded` source, `arjuna` family
  - Source: cloned Lumi CampaignSpec with Arjuna starter template
  - Doctor: `ready_with_warnings`
  - Routed browser QA: `ready_with_exceptions`
  - QA run: `.campaign-runtime/qa-lumi-arjuna-v0-local-routed/lumi-arjuna-v0/MQNJSP9O06HH6EA5LFABBS5JBP.json`
  - Local screenshots:
    - `.campaign-runtime/evidence/lumi-arjuna-v0-local-desktop.png`
    - `.campaign-runtime/evidence/lumi-arjuna-v0-local-mobile.png`
  - Notable result: all route HTTP checks passed under `/lumi-arjuna-v0/`. Browser QA found mounted payment fields and visible checkout prices, but also expected Arjuna starter residue: default brand colors, `next-logo.png`, `1x1_*.svg`, and no selected bundle by default.

## Tooling Friction

- `npx campaigns-os ...` is the generated/public-looking command shape, but the package is not available from the npm registry in this repo context. The loop had to use `/Users/devin/Developer/campaigns-os/bin/campaigns-os.mjs`.
- Copied/prefixed build packets were not portable enough for QA. `qa resolve --packet` failed because packet spec paths were interpreted relative to the target repo after artifact copying.
- `qa run --site --slug <slug>` initially tested root-relative `/checkout/`, `/landing/`, etc. Passing a route-scoped `--base-url` plus `--slug` was required.
- The QA help says localhost is a development domain, but browser runtime still saw CORS failures from `http://127.0.0.1:4174` to `https://campaigns.apps.29next.com`. This blocks SDK debugger/payment proof when the preview config uses `REPLACE_AT_DEPLOY`.
- The source-preserved public build and the private Arjuna build surface different contract gaps: public passthrough keeps the designed funnel but loses several commerce/pricing selectors; Arjuna preserves more commerce structure but carries visible starter/template residue.

## Corrective Pass: 2026-06-21

- `lumi-v0` checkout now exposes canonical cart/runtime hooks that were missing or non-standard in the passthrough build:
  - `data-next-bundle-items` on each checkout bundle card.
  - `data-next-bundle-display="price"` instead of `totalPrice`.
  - `.submit-button` on the submit control.
  - credit-card/CVV `spreedly-field` mounts using `data-next-checkout-field`.
  - upsell actions normalized from `accept`/`decline` to `add`/`skip`.
- `lumi-v0` built-site doctor improved to only one residue warning: the scanner flags literal HTML `placeholder="..."` attribute names as `Placeholder` text. This looks like a false positive; preserving input placeholders is better UX.
- Private `lumi-arjuna-v0` received a first-pass de-startering:
  - presell article/copy/images are now Lumi air-quality content rather than supplement/energy copy.
  - `next-logo.png`, `Package Title`, `XXCODE`, and upsell placeholder slides were replaced in the high-signal commerce surfaces.
  - remaining real residue is concentrated in the Arjuna landing page, which still uses the sleep-supplement starter stack and many `1x1_1.svg` placeholders.
- `campaigns-os doctor --built ... --emit-packet` works for local built-site review, but `qa run` against those synthesized packets failed because `spec.map_id` is set to the slug and the QA runner tries to fetch `https://campaign-map.nextcommerce.com/api/spec/<slug>`, which 404s.
- Existing copied runtime packets also failed doctor because `assembly.target_repo` points at `.campaign-runtime`, so doctor reports `src/<slug>` missing even though the actual repo output exists.
- Browser-use fallback:
  - live route screenshots worked for `/lumi-v0/upsell/`; structure probe found `offer=true`, `add=1`, `skip=1`, `bundles=3`, `selected=1`.
  - `browse load-html` worked for DOM probes but is not trustworthy for visual screenshots because relative CSS/assets do not resolve the same way as the served page.
  - local SDK/API data was not resolving prices in visual checks, so local QA needs a seeded/mock price mode for reliable polish review.
