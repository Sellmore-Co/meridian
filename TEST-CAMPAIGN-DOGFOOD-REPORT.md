# SELL-362 Dogfood Report — Prepared-HTML full-funnel replay through current `campaigns-os`

**Run type:** Campaigns OS Round 2 workflow evaluation / issue discovery. **Not a production launch.**
**Outcome:** Drove the upgraded command spine from prepared HTML → Build Packet → doctor → setup → build → SDK lint → polish, with a successful page-kit build. **Cleanly blocked at the deploy/QA allowlist gate** (an accepted SELL-362 terminal state), and skipped typed-card proof (policy OFF). Map `test-campaign-ujqf`, slug `test-campaign`, family **limos**.

---

## 1. Inputs & how the candidate arrived

| Required input (SELL-360/362) | State at run time |
|---|---|
| CampaignSpec / Map export | ✅ provided inline → `campaign-spec-test-campaign.json` (schema 4.3) |
| Map ID **and** public slug (separate) | ✅ `test-campaign-ujqf` / `test-campaign` |
| Prepared HTML/assets source root | ❌ **not supplied** — spec has no `design_source`/`figma_url`; `gstack-design-html`, EcommXDemand, and the `../designer/funnel-designs/` tree referenced by prior packets are **absent on this machine**. Resolved by generating an **AI-generated synthetic funnel** (an explicitly allowed source option) under `source-html/test-campaign/`. |
| Target repo + campaign dir | ✅ `meridian` / `src/test-campaign/` |
| Template family | ✅ limos |
| Deploy preview target | ❌ not confirmed (`deploy.target=unknown`) |
| Domain allowlist state | ❌ `allowed_domains_confirmed=false` |
| Browser QA | required: yes (could not run — see §4) |
| Typed-card policy | OFF (no Devin approval) |

> **Context that shaped the run:** the upstream candidate-readiness issue **SELL-361 ("Vuk: prepare Round 2 candidate matrix and preview lane") is still unstarted**, so the deploy lane, allowlist state, and proof policy that QA depends on were never handed off. By SELL-360's literal rule a child lacking source root / deploy target / allowlist could be marked `collect-inputs`; instead we proceeded with a sanctioned synthetic source to exercise the toolkit and surface where it breaks, then blocked at the real gate.

---

## 2. Risk classification

### 2a. Assembly blockers (would stop assembly) — **NONE**
doctor returned `ready_with_warnings`, **not** `collect-inputs`; 0 errors. The synthetic `source-html-manifest.json` (keyed to exact spec `page_id`s) made every active page map cleanly ("Source mappings cover active CampaignSpec pages"). The page-kit build succeeded (79 pages). No SDK-owned commerce zone in the source conflicted with the limos contract.

### 2b. Build prompts (agent must act during build) — handled
- **`frontmatter.replaceFromSpecOrApi` (6)** — replaced all `packages.*`, `shipping_methods.standard`, `single_offer.package_id`, `upsell_offer.package_id` with spec refs (package 1, shipping 1, vouchers).
- **`frontmatter.demoOnlyValues` (4)** — limos starter demo values (`single_offer.package_id=1`, `shipping_methods.standard=2`, `packages.prepurchase_1=7/2=9`) not carried forward.
- **`frontmatter.removeWhenUnsupported` (2)** — **order bump + prepurchase removed** (spec has a single package, no bump).
- **`routing_meta.runtime_root`** — built meta is correctly rooted (`/test-campaign/upsell/`) via the layout's `campaign_link` filter.
- **`copy.hardcoded_currency_symbol`** — fixed at source (removed `$34.99/$69.99` from `source-html/.../landing.html`); manifest regenerated; warning cleared (38→37).

> Note: these are **static contract reminders** — doctor re-emits them regardless of whether the built pages comply (it does not diff the built `_site`). They are guidance, not verification. See §5.

### 2c. QA warnings (block proof, not assembly) — **the real gate**
- **`campaign.allowed_domains_confirmed=false`** → SDK runtime calls (campaign load, checkout) are not verifiable; on a non-allowlisted origin the SDK cannot load the campaign and checkout stays in a loading state.
- **`deploy.preview_url=null` / `deploy.target=unknown`** → no origin for browser QA.
- **`qa.test_orders_allowed=false`** → typed-card proof off by policy.

---

## 3. The gate reached (clean stop)

`campaigns-os qa resolve` resolved all 5 pages but reported **Base URL `(missing)`**; `next polish` returned **`BLOCKED`**. Browser QA (`qa run --browser`) and typed-card proof (`qa run --test-order`) both require: (1) a deployed preview URL, (2) that origin allowlisted in Campaigns App for `AbhmIK…`, and (3) Devin-approved proof policy. **None are in hand**, so the run stops here — the SELL-362-sanctioned "cleanly block at a named doctor/policy gate."

---

## 4. What QA caught vs. missed

**Caught (static / pre-deploy):**
- Allowlist not confirmed; no preview URL; test orders disabled — all three correctly gate proof.
- Spec-level routing meta unrooted; source-level hardcoded currency; starter demo-value reminders.
- Page→source coverage (manifest mapping) and package purchase-availability.

**Missed / cannot assess without a deployed, allowlisted preview:**
- Whether the single-offer quantity stepper actually triggers the count-condition Offers (Buy 1/2/3 → 50/55/60%) and renders the right compare-at/savings.
- Whether the upsell voucher `TESTUPESELL70` (70%) applies on the upsell page (site Offers silently no-op there — only the Code/voucher path works).
- Whether `EXIT10` exit-intent applies on checkout.
- Express-checkout (`available_express_payment_methods: []` in spec — likely nothing renders) and card iframe behavior.
- `store_url: https://localhost:3000/` and `available_shipping_countries: [AU,CA,GB]` (no US) vs `currency: USD` — a live shopper-facing mismatch that only runtime QA would expose.

QA-readiness checking is **artifact/policy-aware but not build-output-aware**: it never inspected `_site/test-campaign/` to confirm the build already resolved several of its own warnings (see §5).

---

## 5. First repairable defect (child-issue candidate)

**`R2-B1: prepared HTML source adapter / doctor gap — doctor flags real Campaigns-API ref_ids as starter demo refs.`**

doctor emitted **21× `template_contract.demo_ref`** warnings claiming the spec "contains a starter-looking demo ref" for `ref_id` `"1"`/`"2"` at `funnels.*.pages.*.packages.*.ref_id`, `*.offers.*.ref_id`, `shipping_methods.*.ref_id`, and `offers.*.packages.*.package_id`. **These are the campaign's real, API-sourced refs** (package 1, offers 1–5, shipping 1) — the store legitimately uses low integer IDs. The Map Builder export's `_provenance.api` lists `offers`, `shipping_methods`, and `campaign.*`, but **not** `funnels.*.pages.*.packages.*.ref_id` or `offers.*.ref_id`, so doctor has no signal to distinguish a real low-int API ref from a starter placeholder and defaults to warning on all of them.

- **Impact:** 21 of 37 warnings (57%) are noise on a valid spec; the operator either learns to ignore demo-ref warnings (dangerous — they exist to catch real leftover placeholders) or hand-edits the export's provenance (gaming doctor).
- **Repair options:** (a) Map Builder export stamps ref_id-level `_provenance.api` so doctor can suppress confirmed-API refs; **or** (b) doctor treats a ref as "real" when the surrounding object carries API provenance / a matching entry exists in the top-level `offers`/`shipping_methods` arrays; **or** (c) demote demo_ref to info when `spec_identity.source = "campaign-map-builder"`.

### Additional candidates (not the named slot)
- **`R2-B2: doctor checks spec/source, not built `_site` — warnings persist after a correct build.`** `routing_meta.runtime_root` and `copy.hardcoded_currency_symbol` keep firing against spec/source even though `_site/test-campaign/` is correctly rooted / currency-free. doctor has no build-output-aware re-check, so a finished campaign still reads as "needs work."
- **`R2-B3: `lint-sdk.mjs` is hard-scoped to olympus-v0 and mis-fires on limos.`** The documented SDK lint reports 13 source + 20 rendered "violations" on a correct limos build — including markup that came from the **canonical limos includes themselves** (`cart-summary02`, `payment-methods`, `express-checkout`) — and suggests olympus-only partials (`bundle-selector.html`, `data-next-catalog-component` wrappers) that limos doesn't use. roadflare-v1 (a shipped limos build) would lint identically. The "SDK lint" gate is effectively unavailable for non-olympus families.
- **`R2-B4: prepared-HTML lane has no candidate source handoff.`** The Map export carried no `design_source`/manifest and no source root was supplied; the lane's defining input had to be hand-authored. SELL-361 (candidate matrix / preview lane) being unstarted is the upstream cause.
- **Minor:** packet records `api_key_source: "env:CAMPAIGNS_API_KEY"` even though the key came from the spec (doctor used the spec key); toolkit's `assembly-report.json` stage status stays `pending`/`skipped` after a successful manual build (no command records build/polish completion into the report); `start` overwrote `.campaign-runtime/agent-context/*` each run.

---

## 6. Deliverables (attached / in-repo)

| Deliverable | Path |
|---|---|
| Build Packet | `campaign-runtime-test-campaign.build.json` |
| Build Context | `.campaign-runtime/test-campaign-build-context.json` |
| doctor output | `.campaign-runtime/test-campaign-doctor-output.json` (37 warnings, 0 errors, `ready_with_warnings`) |
| Assembly Report | `.campaign-runtime/test-campaign-assembly-report.json` |
| CampaignSpec | `campaign-spec-test-campaign.json` |
| Prepared source + manifest | `source-html/test-campaign/` (+ `.campaigns-os/source-html-manifest.json`) |
| Built campaign | `src/test-campaign/` → `_site/test-campaign/` (build: 79 pages) |
| Build/lint/polish + verification | `TEST-CAMPAIGN-BUILD-PASS.md` |
| Preview URL | ⛔ none (deploy lane unconfirmed) |
| QA resolve/run | resolve: base-url `(missing)`; run: blocked |
| Typed-card | skipped — policy OFF, allowlist unconfirmed, no Devin approval |

## 7. What the tooling should make harder to get wrong
1. Distinguish real low-integer API refs from starter placeholders (R2-B1) so doctor noise doesn't train operators to ignore demo-ref warnings.
2. Make doctor build-output-aware (or have the build write back a "resolved" marker) so warnings the build already fixed stop re-firing (R2-B2).
3. Scope `lint-sdk` per template family, or ship the lint from the toolkit rather than an olympus-only repo script (R2-B3).
4. Give the prepared-HTML lane a real candidate→source handoff (design_source + manifest) instead of leaving the operator to author both (R2-B4).
