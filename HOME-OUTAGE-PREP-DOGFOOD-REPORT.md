# Home Outage Prep — Campaigns OS Dogfood #2 Report

**Date**: 2026-05-13
**Round**: 2 (follow-up to [SELL-263](https://linear.app/nextcommerce/issue/SELL-263), Roadside Ready)
**Campaign**: Home Outage Prep v0 — RescueRay storm-prep funnel
**Family**: demeter (single-step editorial, tier cards)
**Map**: `home-outage-prep-v0-sf21`
**Store**: `keer.29next.store` (test)
**Branch**: `home-outage-prep-v0-sf21`
**PR**: [meridian#7](https://github.com/Sellmore-Co/meridian/pull/7)
**Preview**: [deploy-preview-7--meridian-skincare.netlify.app](https://deploy-preview-7--meridian-skincare.netlify.app/home-outage-prep-v0/)
**Test orders** (after PR landed on main, against production URL `meridian-skincare.netlify.app`):
- Accept path: order **`102248`** / ref_id `807d4fba7dbb4d7c855c243fd5123931` — $39.98, verified API 201/200, Spreedly tokenized
- Decline path: order **`102251`** / ref_id `7aefc0059432476ea22bde177baa945c` — $39.98, verified API 201/200, Spreedly tokenized

(Earlier preview-stage Konami order `ffeb4f90480341f1ae155f4bd6eef9f9` was the diagnostic-fallback test from before the toolchain update.)

## TL;DR

- Funnel built end-to-end through `prepare-build → setup → assembly → polish → deploy → qa` on a fresh, never-seen-before campaign shape. Demeter family + 6 routes shipped to Netlify preview, then merged to main and verified against the production URL.
- Browser QA + Playwright typed-card test orders: **43 pass / 1 warn / 0 fail** on the live URL. Both accept-path and decline-path test orders placed real Spreedly-tokenized orders that verified server-side (201/200).
- 16 friction items filed in total. Mix of toolchain, lint, page-kit, SDK, and visual-doctrine. Two were regressions of round-one's supposed fixes; the rest are new surface this run exercised.
- **No round-one remediation broke** in the headline sense — but two of them (`routing_meta.runtime_root`, doctor warnings) only added lint without fixing the upstream cause, so the same problem appears in this run.
- **Toolchain update mid-flight**: the QA toolchain shipped `campaigns-os qa run --browser --test-order both` (Playwright typed-card) during this dogfood. Konami DOM-keydown is now a diagnostic fallback. The new path produced clean, server-verifiable evidence — biggest single improvement over round one.

## Round-two scorecard vs round-one

| Round-one remediation | Worked in round two? |
|---|---|
| [SELL-264] Routing meta tags — campaign-root paths in builder export | **Partial.** Map Builder still exports bare paths (`upsell/`). The new lint fires, but the toolchain still relies on the agent to do the rooting in frontmatter. |
| [SELL-265] Doctor + assembly report scaffolding | Mostly works. New friction: doctor warnings don't refresh after build addresses them. |
| [SELL-266] Demo-ref / replace-from-spec lints | Lints fire. Build addresses them. But the lint stays loud post-build (friction #3 below). |
| [SELL-267] Bundle shipping-method removal lint | Works. Build dropped `bundles[].shipping_method` correctly. |
| [SELL-268] Repo-relative handoff artifacts | Works. Packet/context/report use relative paths. |
| [SELL-269] Doctor: Store Profile fields required | Works. `store_url=https://keer.29next.store` was honored. |
| [SELL-270] Spec API key in doctor | Works. `campaign.campaigns_api_key` consumed automatically. |

**No round-one fix regressed**, but several only treat the symptom (lint) rather than the upstream cause (Builder export, doctor state-awareness).

## Friction filed in round two

Ordered by impact. Reference these in remediation tickets.

### 1. `spec_identity` missing on initial export (CLI error pointed at the wrong fix)

**Where**: `campaigns-os start` → preflight on `/Users/devin/Developer/designer/funnel-designs/home-outage-prep/campaign-spec-home-outage-prep-v0.json`.
**Symptom**: `campaigns-os: CampaignSpec has no map ID. Provide --map-id or export a saved Map Builder spec.` The spec file existed and was named like a valid spec, but lacked the `spec_identity` block (`map_id`, `spec_hash`, `public_route_slug`, `map_url`, etc.) that round one's spec carried.
**Root cause**: spec was exported from Map Builder before being saved (or via a code path that doesn't stamp identity). Builder allows the export.
**Impact**: blocked the run at step 1. Operator had to re-save and re-export.
**Recommendation**:
- Map Builder: refuse to export a spec when `spec_identity` would be empty.
- CLI error: lead with "re-export from Map Builder"; treat `--map-id` as the dev escape hatch, not an equal-weight option.

### 2. Setup → build handoff has an undocumented second state file

**Where**: `next-campaigns-setup` skill instructions vs `campaigns-os next build` doctor.
**Symptom**: setup skill SKILL.md says "record setup status in `.campaign-runtime/assembly-report.json`". I did. Build doctor then errored `[next.build.setup] Target campaign output directory is missing` even though the directory existed. The doctor was reading `scaffold.required: true` from `.campaign-runtime/build-context.json`, which the setup skill never mentions.
**Root cause**: setup state is owned by *two* files (assembly report + build context) but the skill names only one.
**Impact**: 1 cycle of confused trial-and-error per fresh build.
**Recommendation**: either consolidate setup state into one file, or update setup skill SKILL.md to require both updates. Better: build doctor should *also* check the live filesystem and downgrade the warning to an info-level note if the directory actually exists.

### 3. `campaign_link` filter doubles trailing slashes

**Where**: page-kit `_layouts/base.html` + `campaign_link` Liquid filter (`/Users/devin/Developer/meridian/node_modules/next-campaign-page-kit/lib/engine/render.js:33-43`).
**Symptom**: spec exports `page_url: "upsell/"` (trailing slash). Setting `next_url: upsell/` in frontmatter and rendering through `campaign_link` produces `/home-outage-prep-v0/upsell//` (two slashes). SDK routing tries to navigate to that bad URL.
**Root cause**: filter assumes input has no trailing slash:
```js
const clean = filename.replace(/\.html$/, '');
return `/${campaign.slug}/${clean}/`;
```
**Recommendation**: also strip trailing `/` before appending (`filename.replace(/\.html$/, '').replace(/\/$/, '')`). Alternative: spec→frontmatter mapper strips slashes. Either way the trip-wire shouldn't be the operator's responsibility.

### 4. Doctor warnings don't refresh against build state

**Where**: `campaigns-os next polish` doctor verdict (same for QA stage).
**Symptom**: after build addressed `frontmatter.demoOnlyValues`, `replaceFromSpecOrApi`, `removeWhenUnsupported`, and `bundles[].shipping_method` drops, the polish-stage doctor still re-fired all those warnings. The same `routing_meta.runtime_root` warning fires too, even though built HTML emits rooted paths.
**Root cause**: doctor reads CampaignSpec + agentContract only. It doesn't consult built HTML or assembly-report decisions to know what's been resolved.
**Impact**: operator can't tell which warnings are still real after build. Erodes signal value of doctor over the lifecycle.
**Recommendation**: doctor should diff against the assembly report's `assembly.commands` and `assembly.outputs`. Warnings the build addressed should re-classify to info or drop. Or: post-build doctor should crawl `_site/` and verify the lint conditions against generated HTML.

### 5. `template_contract.demo_ref` flags legitimate small ref_ids

**Where**: doctor's demo-ref heuristic.
**Symptom**: two warnings ("starter-looking demo ref `1`", "starter-looking demo ref `2`"). The spec's real `package.ref_id` for RescueRay is `1`, Power Bank is `2`. Demeter's starter demo refs also happen to use `1`/`2`/`7`/`9`. The heuristic can't tell them apart.
**Root cause**: pure value comparison. Small integer IDs in real Campaigns API responses always look "demo-like."
**Recommendation**: cross-check against `spec_identity` provenance — if the spec's `_provenance.api` includes `"funnels.*.pages.*.packages.*.name"` (it does for this run), the package refs are API-sourced. Suppress the demo-ref lint when provenance covers the value. Alternative: only warn when ref_id matches AND the package name matches a demeter starter name (e.g., "Extended Warranty").

### 6. Routing-meta lint can't tell built from bare

**Where**: doctor's `routing_meta.runtime_root` check.
**Symptom**: lint reads `sdk_hints.meta_tags.next-success-url` from the CampaignSpec and complains if it's not absolute. Build resolves the path via `campaign_link` and emits absolute paths in HTML. Lint stays loud because it never looks at HTML.
**Root cause**: same as #4 — doctor is spec-only.
**Recommendation**: combine #4 and #6 into one fix — make doctor build-state-aware.

### 7. Doctor lint set is incomplete vs spec `sdk_hints.meta_tags`

**Where**: `campaigns-os next qa` against the live preview (the *static QA* phase, not the doctor).
**Symptom**: static QA caught 7 meta-tag failures my build had missed (`next-currency`, `next-predictive-address`, `next-prevent-back-navigation` not emitted by my frontmatter). Pre-deploy doctor never flagged these.
**Root cause**: doctor only lints `routing_meta.runtime_root`. The full set of meta tags the spec carries (currency, predictive-address, prevent-back-navigation, etc.) doesn't get a doctor check. The QA static run catches them only after deploy.
**Impact**: the SDK config drift that broke checkout silently is only caught after I've already shipped and burned a Netlify deploy.
**Recommendation**: add a doctor lint that diffs `sdk_hints.meta_tags` keys against what frontmatter or `meta_tags:` block in built HTML carries. Move this from a post-deploy QA failure to a pre-build doctor warning.

### 8. Page-kit `base.html` auto meta emission is incomplete

**Where**: `_layouts/base.html:18-28` else-branch.
**Symptom**: when `meta_tags:` frontmatter is empty, the layout auto-emits 5 tags only: `next-funnel`, `next-success-url`, `next-upsell-accept-url`, `next-upsell-decline-url`, `next-page-type`. Spec also carries `next-currency`, `next-predictive-address`, `next-prevent-back-navigation`. The agent must manually switch to an explicit `meta_tags:` block AND list everything, including the routing tags they'd otherwise get for free.
**Root cause**: auto-emission was designed for a smaller meta surface. The agent has to know "if you need ANY non-standard tag, you switch to explicit-mode and lose the auto-routing."
**Recommendation**: make explicit `meta_tags:` *additive* over the auto-emitted set (let auto-emit fill in tags the block doesn't define). Or: have page-kit read the spec directly when wired through `campaign-runtime.build.json` and emit the full set.

### 9. Tier-cards upsell with single voucher (spec data shape)

**Where**: CampaignSpec → demeter `upsell-bundle-tier-cards-offer` partial.
**Symptom**: source HTML's upsell-1 design has 1×/2×/3× tier cards; spec carries one voucher (`FIRE`, 40% off) for the upsell. I reused `FIRE` across all three tiers because spec doesn't model per-tier vouchering. Result: all three tiers get the same per-unit discount, so the "buy more, save more per unit" gradient doesn't exist.
**Root cause**: Map Builder spec schema doesn't represent tier-card vouchers as a sequence.
**Recommendation**: either (a) extend the spec to allow `upsell_bundle_tiers[].voucher_code`, or (b) have the doctor flag tier-cards UX when the spec carries only one voucher and recommend a stepper.

### 10. Demeter starter ships a broken asset reference

**Where**: `_includes/payment-methods.html` (or similar) renders `/<slug>/images/credit-card-flags.svg`. That asset isn't in `/Users/devin/Developer/campaign-cart-starter-templates/src/demeter/assets/images/`.
**Symptom**: 404 on every checkout page load.
**Root cause**: stale partial reference in the starter template.
**Recommendation**: fix the starter or remove the partial reference. Add a CI check that all `campaign_asset` paths in starter partials resolve to a file in `assets/`.

### 11. Konami test mode auto-modifies the cart silently

**Where**: SDK 0.4.19 TestModeManager (`debug-6wuGgI0A.js` chunk).
**Symptom**: dispatched the Konami sequence on `/checkout/?test=true` after activating test mode. The SDK placed a real Test Order without an explicit submit. After clicking "skip" on `/upsell/`, the receipt still showed Fire Blanket (the upsell-1 product) in the order. Either skip didn't actually skip, or test-mode pre-accepted the upsell.
**Impact**: dogfood QA can't trust "skip" actually means skip while test-mode is on.
**Recommendation**: investigate TestModeManager auto-fill+submit behavior. Document precisely what happens on each page when test mode is active. Either gate auto-submit behind a separate signal, or only fill (don't submit).

### 12. Task instructions reference a "documented CustomEvent" the SDK doesn't expose

**Where**: dogfood task hard rule: "Use the documented CustomEvent for test orders."
**Symptom**: searched SDK 0.4.19 chunks for any `next:test-order` / `next:place-test-order` listener. The only public test-mode entry points are: Konami keydown sequence, `?test=true` URL param, `?debugger=true` URL param. The SDK *dispatches* `next:test-mode-activated` but doesn't *listen* for any CustomEvent the operator can fire.
**Compromise**: I activated test mode via `?test=true` URL param + `document.dispatchEvent(new KeyboardEvent('keydown', {code}))` for the Konami sequence — DOM-level events, not OS-level keyboard simulation.
**Recommendation**: SDK should expose a public `window.next.testMode.activate()` / `window.next.testMode.fillCard(type)` / `window.next.testMode.submit()` API. Right now there's no clean automation path.

### 13. Console noise: `[ApiClient] API request failed: signal is aborted without reason`

**Where**: every page in the funnel, in the dev console.
**Symptom**: at least one of these errors appears in the raw browser event logs. Pattern suggests fetch cancellation during page navigation, but it's logged at ERROR level. The final Playwright `browser-console-errors` assertion's top-level warning was the missing `credit-card-flags.svg` asset, not this API-abort noise.
**Impact**: makes real errors harder to spot in console when reviewing raw QA event logs.
**Recommendation**: SDK should catch AbortError on navigation-cancelled fetches and either swallow or log at DEBUG level.

### 14. Build skill doctrine: "starter-template commerce surface" is ambiguous

**Where**: `next-campaigns-build` SKILL.md rule on checkout/upsell/downsell/receipt.
**Symptom**: rule says "start from the selected starter-template commerce surface and swap only campaign-owned values/content". I read that as "use the demeter template's wiring + visuals together" and the first pass dropped designer-source RescueRay aesthetic on those pages. Later I corrected to "RR brand layer on top of demeter partials," which still produced two stacked offer surfaces (RR hero band + a fully-demeter offer block below it). Only the third revision — hand-inlining the data-next-* attributes inside a RescueRay layout — actually matched the intent.
**Root cause**: doctrine doesn't draw a precise line between "SDK contract" (the data-next-* attributes) and "visual chrome" (the HTML wrapper around them).
**Recommendation**: rewrite the skill rule as: "starter-template commerce surface = the data-next-* SDK attribute contract only (see template's `next_dont_touch`). The HTML wrapper around those attributes is designer-owned. For pages where prepared source HTML already inlines the SDK attributes with the right values for the spec, use that source verbatim and only swap refs/vouchers. Use the demeter starter partials as a reference for the attribute set, not as the page body."

### 15. Logo override coverage is incomplete in page-kit-commands.md

**Where**: page-kit-commands.md "Default `checkout-header.html` and `receipt-skeleton.html` use `next-logo.png`" gotcha.
**Symptom**: I overrode three places (`_includes/checkout-header.html`, `_includes/receipt-skeleton.html`, and the inline reference in `receipt.html`), but the doc only names two. The fourth reference is `_includes/upsell-header-bar.html` — on every upsell page. Both upsell pages still showed the NEXT template mark until a second pass.
**Recommendation**: page-kit-commands.md should list ALL `next-logo.png` references (`grep -rn next-logo.png src/<starter>/_includes/` would catch them). Better: a doctor/QA lint that fails when any built page renders `images/next-logo.png` and the campaign has its own brand logo asset shipped.

### 16. `campaigns-os start` is destructive of lifecycle state

**Where**: `bin/campaigns-os.mjs start` / `prepare-build`.
**Symptom**: re-running `start` to regenerate the packet with new policy flags (here: `--test-orders-allowed --sandbox-test-card-confirmed --production-url`) wiped my populated `.campaign-runtime/assembly-report.json` and `build-context.json` with all the setup/build/polish/deploy/qa stage records. I had to `git checkout HEAD -- ...` to recover the lifecycle history.
**Impact**: any operator who needs to toggle a policy flag mid-lifecycle loses their audit trail.
**Recommendation**: either expose a separate `campaigns-os qa policy set` subcommand for in-place packet edits, or have `start` detect existing report content and merge the new packet's qa policy into the existing report rather than overwriting from scratch.

### 17. `qa run --test-order both` receipt_line_items captures only the base order

**Where**: `campaigns-os qa run --browser --test-order both` result schema, `test_orders[].receipt_line_items`.
**Symptom**: ACCEPT path test order placed order #102248 and clicked through upsell-1 accept (Fire Blanket). The upsell-add API request succeeded. But the captured `receipt_line_items` for both ACCEPT and DECLINE paths show only the base bundle (2x Battery Powered Emergency LED Backup Bulb at $39.98) — the Fire Blanket upsell line is missing on the ACCEPT side.
**Impact**: hard to tell the two paths apart in the QA result JSON; QA can't prove the upsell-add actually persisted to the order without doing a manual API GET on the order.
**Recommendation**: after the upsell-add click, the runner should poll `/api/v1/orders/<id>/` once and surface the full final line items, not just the lines from initial order creation. Or rename the field to `initial_receipt_line_items` so the meaning is clear.

### 18. `campaigns-os qa run` help is incomplete

**Where**: `campaigns-os qa run --help`.
**Symptom**: help text lists `[--browser] [--output-dir qa-output] [--json]` but not the test-order surface (`--test-order checkout|accept|decline|both`, `--allow-test-orders`, `--sandbox-test-card-confirmed`, `--test-email`, `--test-email-prefix`, `--cart`). I only found those flags by grepping the source. The skill SKILL.md documents the canonical incantation, but the CLI's own help should too.
**Recommendation**: extend the qa run usage line with the test-order flags. The full test-order incantation is non-obvious without reading the skill or source.

## What QA caught vs what QA missed

**QA caught**:
- Missing SDK meta tags (`next-currency`, `next-predictive-address`, `next-prevent-back-navigation`, presell `next-page-type` value mismatch). Static QA found 7 failures on first run; all addressable before the live walk.
- Presell route mismatch — spec's `page_url=""` (entry) vs my `presell.html` (route was `/presell/` not `/`).
- (After toolchain update) Console errors on checkout. The Playwright `browser-console-errors` assertion now flags the API-abort noise that QA missed in earlier runs.
- (After toolchain update) Real server-verified test order placement via the actual SDK pipeline (Spreedly tokenization → order POST → 201, order GET → 200).

**QA missed**:
- The `credit-card-flags.svg` 404 (static QA doesn't crawl assets, only checks meta tags + HTTP status of declared routes). Even the new browser-runtime assertions don't crawl all referenced assets.
- The first-pass demeter-blue-on-upsell visual regression (no automated check for designer-source vs starter-template brand consistency across pages).
- Upsell-line presence in the final order (see friction #17 — captured receipt_line_items don't reflect the upsell-add).

## Top remediation actions (recommended priority)

1. **Build-skill doctrine rewrite** — fixes #14 (and resolves the brand-identity-mid-funnel question for every future build). Smallest doc change with the biggest agent-behavior payoff. (campaigns-os repo.)
2. **Doctor build-state awareness** — fixes friction #4, #6, and gives a path to fix #7. (campaigns-os repo.)
3. **Map Builder export discipline** — fixes #1 (refuse export without `spec_identity`) and #3 (strip trailing slashes from `page_url`). (Map Builder repo.)
4. **Non-destructive packet policy edit** — fixes #16 (`campaigns-os start` shouldn't wipe assembly-report.json on re-run). (campaigns-os repo, small.)
5. **QA test-order line-item capture** — fixes #17 (re-read order after upsell-add). (campaigns-os repo, small.)
6. **CLI help completeness** — fixes #18 (test-order flags in `qa run --help`). (campaigns-os repo, trivial.)
7. **Doctor lint coverage of full `sdk_hints.meta_tags`** — fixes #7. (campaigns-os repo.)
8. **Page-kit `meta_tags:` additive semantics** — fixes #8. (page-kit repo.)
9. **Starter-template asset hygiene** — fixes #10 (`credit-card-flags.svg`) and #15 (logo override coverage). CI lint that all `campaign_asset` paths in starter partials resolve. (starter-templates repo.)
10. **TestModeManager public API + auto-submit audit** — fixes #11 and #12. *Partially resolved by the Playwright typed-card toolchain update — the canonical proof path no longer relies on TestModeManager. Konami path stays as diagnostic fallback per the updated skill.* (SDK repo, lower priority now.)

Friction #2 (setup→build two-file handoff), #5 (demo-ref false positives), #9 (tier-cards single voucher), and #13 (api abort noise) are lower-impact polish.

## Lifecycle artifacts

- Build packet: [campaign-runtime.build.json](campaign-runtime.build.json)
- Build context: [.campaign-runtime/build-context.json](.campaign-runtime/build-context.json)
- Assembly report: [.campaign-runtime/assembly-report.json](.campaign-runtime/assembly-report.json)
- Build pass log: [HOME-OUTAGE-PREP-BUILD-PASS.md](HOME-OUTAGE-PREP-BUILD-PASS.md)
- Static QA result (preview): `.campaign-runtime/qa-home-outage-prep/home-outage-prep-v0-sf21/MP3SQK94I3FRLCE4GTMV0BR1D7.json` (30 pass / 0 fail)
- Browser-only QA result (live): `.campaign-runtime/qa-home-outage-prep/home-outage-prep-v0-sf21/MP488C874DE9BB07KQLAF2TCTV.json` (41 pass / 0 fail)
- Browser + test-order QA result (live): `.campaign-runtime/qa-home-outage-prep/home-outage-prep-v0-sf21/MP48BJ6BQ494G2RM6OHD3O7BFJ.json` (43 pass / 1 warn / 0 fail, both test orders verified)
- Funnel walk screenshots: [.campaign-runtime/qa-home-outage-prep/screenshots/](.campaign-runtime/qa-home-outage-prep/screenshots/)

## For reference

- Round one report: [ROADSIDE-READY-DOGFOOD-REPORT.md](ROADSIDE-READY-DOGFOOD-REPORT.md)
- Round one issue: [SELL-263](https://linear.app/nextcommerce/issue/SELL-263)
- Round one PR: [meridian#5](https://github.com/Sellmore-Co/meridian/pull/5)
- Linear project: [Campaigns OS Dogfood](https://linear.app/nextcommerce/project/campaigns-os-dogfood-html-to-campaign-build-path-b40368479c3d)
