# TEST CAMPAIGN — Build Pass (SELL-362)

Prepared-HTML full-funnel replay through the current `campaigns-os` toolkit.
**Not a production launch.** Workflow evaluation / issue-discovery run.

| Field | Value |
|-------|-------|
| Linear | SELL-362 (parent SELL-360, project "Campaigns OS Dogfood Round 2") |
| Map ID | `test-campaign-ujqf` |
| Public route slug | `test-campaign` (separate field from Map ID) |
| CampaignSpec | `campaign-spec-test-campaign.json` (schema_version 4.3, builder 0.3.1; embeds `campaigns_api_key` + `store_url`) |
| Source type | `html_funnel` — **AI-generated synthetic funnel** (gstack/EcommXDemand/`../designer` not present on this machine) |
| Source root | `source-html/test-campaign/` (5 pages + `.campaigns-os/source-html-manifest.json`) |
| Target repo / dir | `meridian` / `src/test-campaign/` |
| Template family | **limos** (locked via `--template-family limos`; spec `preferred_template_family: limos`) |
| SDK version | 0.4.24 (from spec `global_config.sdk_version`) |
| Outcome | Built through **polish + preview deploy + browser QA** (`ready_with_exceptions`: 32 pass / 1 fail-warn / 1 manual_review-warn). **Typed-card skipped** (policy OFF, no Devin approval). |

## Command spine actually used

meridian still ships the **old** page-kit spine (`next-campaign-page-kit@^0.1.2`; scripts `campaign-init/start/dev/build/...`). It has **no** `campaigns-os` dependency, no `npm run campaigns-os`, no `qa:install-browser`. The new spine was therefore driven from the **separate checkout** and pointed at meridian with `--target`:

```bash
node /Users/januzovic/Work/campaigns-os/bin/campaigns-os.mjs start \
  --spec campaign-spec-test-campaign.json --source source-html/test-campaign \
  --target . --template-family limos
node .../campaigns-os.mjs doctor   --packet campaign-runtime.build.json --report .campaign-runtime/assembly-report.json --json
node .../campaigns-os.mjs next setup  --packet ... --report ...
# manual scaffold + commerce wiring + page-kit build
npm run build                              # next-campaign-page-kit (target's own build engine)
node scripts/lint-sdk.mjs --scope=test-campaign --pages=all
node .../campaigns-os.mjs next polish --packet ... --report ...
node .../campaigns-os.mjs qa resolve   --packet ...
```

## Stage results

| Stage | Result | Evidence |
|-------|--------|----------|
| start / prepare-build | ✅ `READY_WITH_WARNINGS` | `campaign-runtime-test-campaign.build.json`, `.campaign-runtime/test-campaign-build-context.json`, `.campaign-runtime/test-campaign-assembly-report.json` |
| doctor | ✅ `ready_with_warnings`, **not** `collect-inputs`; next=`setup`; blocked=qa,runtime-sdk-verification,test-orders | `.campaign-runtime/test-campaign-doctor-output.json` (37 warnings, 0 errors) |
| setup | ✅ limos family scaffolded atomically (pages + `_includes` + `_layouts` + `assets`) | `src/test-campaign/` |
| build (page-kit) | ✅ **79 pages built in ~1s**; 5 test-campaign routes (`/`, `/checkout/`, `/presell/`, `/upsell/`, `/receipt/`) | `_site/test-campaign/` |
| SDK lint | ⚠️ run; 13 source + 20 rendered "violations" — all olympus-v0-scope false positives for limos (see report) | exit 0 (advisory) |
| polish | ✅ source/built compared; unsupported order-bump removed; source hardcoded-currency fixed; no brand logos to preserve | currency warning cleared (38→37) |
| deploy | ✅ Netlify deploy-preview-14 | `https://deploy-preview-14--meridian-skincare.netlify.app/test-campaign/` |
| qa (browser) | ✅ `ready_with_exceptions` — 32 pass / 1 fail(warn: card iframe geometry) / 1 manual_review(warn: express wallets); `test_orders: []` | `.campaign-runtime/qa-test-campaign/test-campaign-ujqf/MPUZ87KM1J3P6GM9A4MFA0NSCE.json` |
| typed-card | ⏭️ skipped — policy OFF, no Devin approval, `test_orders_allowed=false` | — |

## Built-output verification (`_site/test-campaign/`)

- Routing meta **campaign-rooted**: `next-success-url=/test-campaign/upsell/`, `next-upsell-accept-url`/`decline-url=/test-campaign/receipt/`
- SDK loader `campaign-cart@v0.4.24`; `next-page-type` correct per page; `next-funnel=TEST CAMPAIGN`
- All assets/links rooted under `/test-campaign/`; no unrooted `.html` hrefs; no hardcoded currency in landing/presell

## Commerce wiring (from spec, not starter demo values)

- **One package** (`ref_id 1`), single-offer quantity selector (qty 1–5), `shipping_id 1` (`default`, $9.99)
- **Tier pricing via Campaign Offers** (count-condition): Buy 1 → 50%, Buy 2 → 55%, Buy 3 → 60% — *not* per-tier packages
- Checkout exit voucher `EXIT10` (10%) and **upsell voucher `TESTUPESELL70` (70%)** — upsell correctly uses a Code/voucher (`data-next-bundle-vouchers`), not a site Offer
- Order bump **removed** (no second package in spec → `frontmatter.removeWhenUnsupported`)
- Tracking OFF: GTM/FB empty + disabled in `config.js`
