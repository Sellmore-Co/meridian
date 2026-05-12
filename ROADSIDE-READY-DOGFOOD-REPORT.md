# Roadside Ready Campaigns OS Dogfood — Final Report

**Map:** [`roadside-ready-i5t4`](https://campaign-map.nextcommerce.com/view/roadside-ready-i5t4) · **Repo:** [Sellmore-Co/meridian](https://github.com/Sellmore-Co/meridian) · **PR:** [#5](https://github.com/Sellmore-Co/meridian/pull/5) · **Preview:** [deploy-preview-5--meridian-skincare.netlify.app/roadside-ready/](https://deploy-preview-5--meridian-skincare.netlify.app/roadside-ready/) · **Test order:** `9539944701eb4353a237b64f0c5c44e4` ($229.95)

---

## Lifecycle phases run end-to-end

| Phase | Tool/Skill | Outcome |
|---|---|---|
| prepare-build | `campaigns-os start` | Build Packet written, agent context installed |
| doctor | `campaigns-os start` (auto) | **Run 1 BLOCKED** (page_url `.html` errors) → fixed in Map Builder upstream → **Run 2 READY_WITH_WARNINGS** |
| setup | inline (skill not installed locally) | `src/roadside-ready/` scaffolded from olympus, `campaigns.json` wired |
| assembly | `/next-campaigns-build` | SDK surfaces wired, payment scoped to Apple+Google Pay, demo refs dropped |
| polish | sub-agent following `next-campaigns-polish` contract | Copy/imagery swaps; later: 4 walkthrough fixes |
| deploy | `git push` + `gh pr create --draft` | Netlify preview live |
| qa | `campaigns-os qa run` | **Run 1: 12 fail/16 pass → Run 2: 1 fail/24 pass/5 review → Run 3: ready_with_exceptions 25 pass/5 review** |
| manual walkthrough | browser automation | Test order completed; **4 real bugs the static QA missed** |

---

## Process hiccups — bucket by where they belong upstream

### A) Map Builder export gaps

**A1. `page_url` shipped as `.html` filenames, not Page Kit slugs** — 6/6 doctor errors on first run. Fixed mid-session by regenerating spec. Confirm the export now consistently emits `landing/`, `checkout/`, etc.

**A2. `resolved_routing.*_filename` mirrors the same convention as `page_url`** — when A1 was wrong, this was wrong too. Treat them as a pair; one regression test should cover both.

**A3. `store_*` metadata is absent from CampaignSpec** — `store_name`, `store_url`, `store_terms`, `store_privacy`, `store_contact`, `store_returns`, `store_shipping`, `store_phone`, `store_phone_tel`. Page Kit's `campaigns.json` requires them. Right now every build pass manually fishes these out of the live store. The Builder already has the `campaigns_api_key` — it can pull a store profile and emit them.

**A4. `available_shipping_countries: []` is ambiguous** — operator convention says blank = all countries. Reads like missing data. Emit explicit `"all"` or surface a UI hint in the Builder.

**A5. No `template_family` hint** — by design, but means every build re-derives from HTML signals. A non-authoritative `spec_identity.preferred_template_family` would save a step on routine builds.

**A6. `sdk_hints.meta_tags` for routing URLs are slug-relative** — `next-success-url: upsell/`. Looks correct in spec, byte-matches QA. **But the SDK resolves meta-tag URLs as absolute from site root**, so it routes to `/upsell/` → 404. Emit absolute paths (`/<slug>/upsell/`) for `next-success-url`, `next-upsell-accept-url`, `next-upsell-decline-url`. Non-routing meta tags (`next-currency`, `next-predictive-address`, `next-prevent-back-navigation`) can stay verbatim.

### B) `campaigns-os` CLI tool gaps

**B1. Doctor doesn't use `campaigns_api_key` when present.** `template_contract.demo_ref` warning fires on refs "1" / "2" even though the packet has the key to verify them against the live API. Should call the Campaigns API and resolve those warnings.

**B2. `qa resolve` drops the public route slug from URLs unless caller appends it to `--base-url`.** Caller has to know `--base-url=https://host/<slug>` not `--base-url=https://host`. Spec already carries `public_route_slug` — resolve should join automatically and accept either form.

**B3. `qa run` route-link family is overcautious.** All 5 `route-link:*:accept|decline|next` checks come back `manual_review` because there's no static `<a href>` — but the page has `data-next-upsell-action="add|skip"` with the SDK-bound routing. Check for the SDK action element as a fallback signal.

**B4. QA URL-form assertion was *wrong*.** QA expected the spec form `upsell/`. I "fixed" the build to match spec form. Runtime then broke (the A6 bug). The QA pass was a false positive. QA needs to assert on **resolved** URL form, not spec literal — or the spec should emit absolute paths (A6).

**B5. Stage status JSON schema requires empty arrays.** Doctor wrote `pending` stages with `inputs:[], outputs:[], commands:[], blockers:[], warnings:[]`. When I wrote `completed` stages, I had to also explicitly include the empty arrays I didn't need or the validator threw `inputs must be an array`. Schema should treat omitted as empty.

**B6. Build Packet artifacts contain absolute local paths** (`/Users/devin/...`) — meridian's CLAUDE.md says only commit them after "checking for local-only paths." There's no tool that scrubs/relativizes. Either the prepare-build emits repo-relative paths, or a `--strip-paths` flag does the conversion.

### C) Skill ecosystem gaps

**C1. `next-campaigns-setup` and `next-campaigns-polish` skills exist in the campaigns-os repo but aren't installed locally** — `claude` can't invoke them via `/skill`. Skill tool errored on `next-campaigns-setup`. I had to do their work inline. Either install them globally, or have the OS CLI's `next setup`/`next polish` subcommands do the work directly without needing a separate skill agent.

**C2. Build-skill doctrine over-applies "mirror template verbatim" to product pages.** The doctrine is right for SDK commerce surfaces (checkout/upsell/receipt). It's wrong for product pages (landing/presell) when prepared HTML exists in `source_html.pages[]`. Build skill should:
- For `checkout|upsell|receipt`: mirror template + swap leaf content (current — correct)
- For `landing|presell`: if `source_html.pages[].path` resolves to a non-trivial standalone HTML file, **preserve verbatim** via a passthrough layout + inject SDK loader + repoint CTAs. Otherwise fall back to template.

**C3. Build skill blindly used the `bump-check01` default `package_sync=1`.** Partial's own gotchas say "Ethically, syncing bump qty with main bundle when the bump reads as 'one-time add-on' is misleading; prefer fixed qty (set package_sync=false)." Build skill should: if a bump's package is in `packages.prepurchase_*` (not in the main `bundles[]`), default to `package_sync=false` + `show_line_total_price=false`.

**C4. Polish skill ignored brand logos.** Sub-agent's polish pass said "Keer brand logo SVG not available — `nav_logo_image` still points at olympus default." But `funnel-designs/roadside-ready-kit/assets/landing/images/logo.png` (the PrecisionTune logo) was right there in the source bundle, just not in the place the polish skill looked. The skill should scan prepared-HTML assets for a `logo*.{png,svg}` and use it.

### D) Starter template gaps

**D1. Olympus upsell-pills variant isn't a data-driven include yet.** The agentContract says "matching inline upsell package/voucher refs until upsell includes are promoted" — so I had to `sed` packageIds across the body. For single-qty upsells (spec qty 1), the 5-tier pill layout doesn't compress via frontmatter — required structural body edits. **Promote to a partial in `olympus/_includes/upsell-bundle-pills.html`** so frontmatter can collapse to single tier.

**D2. base.html doesn't iterate per-page `sdk_hints.meta_tags`.** It hand-emits a few tags from frontmatter. Missing `next-currency`, `next-predictive-address`, `next-prevent-back-navigation`. Added a `{% if meta_tags %}{% for tag in meta_tags %}...` loop locally in all 3 base layouts (base, base-landing, base-presell). **Promote upstream into olympus's base templates.**

**D3. olympus receipt-skeleton + receipt.html have a SDK template-expansion regression in 0.4.19.** Order data in `useOrderStore.order.lines` is correct (4 lines, $229.95), `data-next-display="order.subtotal|total"` bindings render fine, but `<template id="order-item-template">` paired with `<div data-item-template-id="order-item-template" data-next-order-items="">` containers don't expand. Both mobile + desktop summaries affected. **OrderDisplayEnhancer regression worth filing against campaign-cart-sdk@0.4.19.**

### E) Workflow / context gaps

**E1. Konami sequence via simulated KeyboardEvent doesn't fire the SDK listener.** Had to dispatch `new CustomEvent('next:test-mode-activated', {detail:{method:'konami'}})` directly. The `method: 'konami'` discriminator is required — without it the handler returns early. **Update `reference_next_test_cards.md` memory:** browser automation should fire the CustomEvent, not synthesize keystrokes.

**E2. No exposed test-order helper on the SDK.** `useCheckoutStore.setTestMode(true)` is a flag — it does NOT trigger form fill + test_card token. Need either a `window.NextCommerce.fireTestOrder()` shortcut, or document the CustomEvent contract publicly.

**E3. Two Netlify sites watch this repo** (`campaignsos` returns 404, `meridian-skincare` is canonical). No docs say which. Worth a note in `netlify.toml` or a top-of-repo README.

**E4. Static `available_payment_methods` list collision.** Spec said `apple_pay, bankcard, google_pay` (no PayPal). The funnel-designs reference HTML had `credit + PayPal`. Build skill correctly used the spec. But the polish phase wasn't told *why* PayPal was dropped, so it could've drifted. The OS handoff should pass these "drop because spec says X" decisions to polish.

---

## What the QA process caught vs. missed

**QA caught (static):**
- Slug-root 404
- Missing meta tags
- URL form mismatch (but with the wrong fix — see B4)

**QA missed (only manual walkthrough surfaced):**
- Bump syncing qty with bundle ($119.98 instead of $59.99)
- NEXT placeholder logo across the funnel
- Prepared landing was rebuilt instead of preserved
- Receipt `data-next-order-items` template not expanding
- Routing URL form was actually wrong at runtime (QA's "pass" was a false positive)

**Pattern:** static QA validates DOM/meta-tag shape but doesn't run the funnel. Need an "agent walks the funnel" mode that fires a Konami test order and asserts on `useOrderStore.order.lines` shape + actual redirect chain. That would catch B4, D3, and any future routing/template regressions.

---

## What worked well

- `campaigns-os start` → packet + doctor + agent context in one shot was clean.
- Doctor blocking on real spec contract violations (page_url shape) caught a real Map Builder bug.
- agentContract + sharedFrontmatterVocabulary in `commerce-surface-catalog.json` gave the build skill a clear demo-vs-real ref table.
- `qa.spec_identity` breadcrumb in config.js means the QA tool can auto-discover the campaign on any deployed URL.
- Lifecycle artifacts (build packet → context → assembly report → qa output) all checkpointed, validatable via `validate-assembly-report`, and machine-readable for future remediation passes.

---

## Top 5 actions for the remediation session

1. **Fix Map Builder export of routing meta tags + store_* metadata** (A3, A6) — eliminates the runtime 404 root cause and the manual `store_*` lookup.
2. **Promote olympus upsell-pills to a data-driven partial** (D1) — eliminates the `sed` body edits for single-qty upsells.
3. **Build-skill rule: `prepurchase_*` bumps default to `package_sync=false + show_line_total_price=false`** (C3) — eliminates the $119.98 bug class.
4. **Build-skill rule: prefer-prepared-HTML for landing/presell when `source_html.pages[].path` resolves to a real file** (C2) — eliminates the "rebuilt a finished design" failure.
5. **Add a "walks-the-funnel" QA mode that fires a Konami test order** (E2 + the QA-vs-runtime delta) — would have caught D3 and the B4 false positive in one pass.

---

## Reference artifacts

- Assembly report: `meridian/.campaign-runtime/assembly-report.json` (machine-readable lifecycle state)
- Build packet: `meridian/campaign-runtime.build.json`
- Doctor output: `meridian/.campaign-runtime/doctor-output.json`
- QA runs: `meridian/.campaign-runtime/qa-output/roadside-ready-i5t4/` (3 runs)
- Build pass log: `meridian/ROADSIDE-READY-BUILD-PASS.md`
- This report: `meridian/ROADSIDE-READY-DOGFOOD-REPORT.md`
