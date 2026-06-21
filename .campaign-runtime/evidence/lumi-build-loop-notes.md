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
