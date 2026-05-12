# Roadside Ready — Build Pass Log

**Public route slug:** `roadside-ready` · **Map ID:** `roadside-ready-i5t4` · **Spec hash:** `sha256:8414163f...` · **Campaign ref_id:** `1573` · **SDK:** `0.4.19` · **Template family:** `olympus`

**Live preview routes (local):**
- http://127.0.0.1:8770/roadside-ready/presell/
- http://127.0.0.1:8770/roadside-ready/landing/
- http://127.0.0.1:8770/roadside-ready/checkout/
- http://127.0.0.1:8770/roadside-ready/upsell/
- http://127.0.0.1:8770/roadside-ready/upsell-2/
- http://127.0.0.1:8770/roadside-ready/receipt/

## Lifecycle phases run

| Phase | Status | Notes |
|---|---|---|
| `prepare-build` | ✅ completed | `campaigns-os start` produced Build Packet, context, report, doctor output |
| `doctor` | ✅ completed | First pass BLOCKED (6 page_url `.html` errors → fixed in Map Builder upstream); second pass READY_WITH_WARNINGS |
| `setup` | ✅ completed | `src/roadside-ready/` scaffolded from olympus; `_data/campaigns.json` entry wired with store_name/store_url for keer.29next.store |
| `assembly` | ✅ completed | All 6 pages wired; SDK surfaces preserved; 61 pages built locally |
| `polish` | ⏭ pending | Visual/runtime polish — see assembly-report `next.action` |
| `deploy` | ⏭ pending | No preview/production URL yet |
| `qa` | ⏭ pending | Blocked until allowed_domains confirmed + deployed |

## Verified SDK surfaces (built `_site/roadside-ready/`)

- **Checkout** — 99 `data-next-*` attrs · bundle selector tiers `bundle-1x/2x/3x` → `packageId 1` (Car Diagnostic Tool) · bump → `packageId 2` (Air Compressor) · shipping ref `1` (default $0) · payment methods Apple Pay + Google Pay (0 PayPal, 0 Klarna) · SDK loader pinned `v0.4.19` · meta `next-page-type=checkout` + `next-success-url=/roadside-ready/upsell/`
- **Upsell** — bundle tier-cards 1x/2x/3x → `packageId 3` (Dash Camera) · vouchers `[]` (no demo UP50/60/70) · accept + skip CTAs · meta `next-upsell-accept-url` + `next-upsell-decline-url` both `/roadside-ready/upsell-2/`
- **Upsell 2** — `packageId 4` (Brake Fluid Tester) · vouchers `[]` · meta `next-upsell-accept/decline-url=/roadside-ready/receipt/`
- **Receipt** — 29 `data-next-display="order.*"` bindings · order-item template present · meta `next-page-type=receipt`
- **config.js** — `apiKey=p8ETu2JH...` · `paymentEnvKey=57862XP7AB94ZSSMYZRDHTQA7W` · `storeName=keer` · `qa.spec_identity` carrying `map_id`, `spec_url`, `public_route_slug`

## Friction log — Map Builder / contract / workflow gaps

1. **🔴 Map Builder export: `page_url` uses `.html` filenames** *(fixed mid-session by operator regenerating the spec)* — first doctor pass BLOCKED. Cure validated; future Builder versions emit slug-shaped routes.
2. **🟠 Map Builder export: no `store_*` metadata** — `campaigns.json` requires `store_name`, `store_url`, `store_terms`, `store_privacy`, `store_contact`, `store_returns`, `store_shipping`, `store_phone`, `store_phone_tel`. CampaignSpec carries none. Manually pulled from `keer.29next.store` this pass; only `store_name=Keer` + `store_url=https://keer.29next.store` populated because the test store has no policy pages. Operator action: close this gap in Map Builder export (or via Campaigns App store-profile lookup).
3. **🟠 Map Builder export: `available_shipping_countries: []` ambiguity** — operator confirmed blank = all countries (Campaigns App convention). The empty-array reads like missing data; Map Builder should emit explicit `"all"` or surface a UI hint.
4. **🟠 Map Builder export: no `template_family` hint** — by design ("CampaignSpec doesn't carry a template field"), but every build re-derives from HTML signals. A non-authoritative `spec_identity.preferred_template_family` hint would skip a step.
5. **🟡 doctor `template_contract.demo_ref` overcautious** — flagged ref_ids `"1"` and `"2"` as starter-shaped even though the packet now has the API key. Doctor could call the Campaigns API when key is present and confirm.
6. **🟡 Olympus upsell pills variant not data-driven** — agentContract notes "matching inline upsell package/voucher refs until upsell includes are promoted". Inline DOM has hardcoded tier rows + qty buttons that frontmatter alone can't shape. For single-qty offers (upsell-2 = Brake Fluid Tester qty 1) the body still carries demo 5-tier layout — needed a `sed` body replacement. Promoting upsell pills to a partial would unblock single-tier campaigns cleanly.
7. **🟡 Per-page SDK meta tags from `sdk_hints.meta_tags` not auto-emitted by base.html** — spec declares `next-currency`, `next-predictive-address`, `next-prevent-back-navigation` per page. Base layout only iterates `page_type` + `next_url`-derived metas. Not blocking (these have SDK defaults), but spec contract is wider than template layout supports.
8. **🟡 SDK CORS gate on local preview** — `127.0.0.1:8770` not in allowed-domain list for ref_id 1573. Static structure verified; dynamic pricing/totals/upsell actions need allowlist to verify. Expected per workflow ("Failed to fetch is an environment gate").

## Polish-phase carryover (acceptable per `next-campaigns-build` doctrine)

These are template defaults that the build skill renders faithfully when no design override is given. They are explicit `next-campaigns-polish` scope:

- Presell `reason_1..9_*` frontmatter: olympus supplement narrative kept (only article title + subtitle swapped).
- Landing hero: olympus sleep-aid narrative kept (only title swapped).
- Checkout reviews ("Woke up without the soreness", Daniel K.): kept.
- Checkout `Product Name` / `2026 New & Improved` hero placeholder: kept.
- Brand: NEXT-logo placeholder; no Keer brand asset wired.
- Swiper galleries: placeholder `1x1_1.svg` / `1x1_2.svg` — Car Diagnostic / Dash Camera / Brake Fluid Tester renders not yet copied into `assets/images/`.

## What I would change in the workflow

- **Doctor + API**: when `campaigns_api_key` is in the spec, doctor should optionally call the Campaigns API to resolve `template_contract.demo_ref` warnings and pull `available_shipping_countries`. Saves a round-trip.
- **Build Packet should carry `prepared_html_pages`**: the funnel-designs HTML was supplied but the build skill reuses the olympus template verbatim anyway. The prepared HTML is mostly used for brand reference (colors/copy hints). Worth making explicit in the packet schema that prepared HTML is reference-only when a template family is locked.
- **`next-campaigns-setup` skill not installed locally**, but the campaigns-os repo has it. The OS skill said "Use next-campaigns-setup for this Campaigns OS handoff" — I had to do the setup work inline. Either install the skill from the campaigns-os repo, or have the OS CLI offer a `setup` subcommand that scaffolds without a separate skill agent.
