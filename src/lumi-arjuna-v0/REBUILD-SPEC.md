# Arjuna — Template Family Rebuild Spec

> **Status:** Draft for review (no code yet).
> **Author context:** Derived from the inventory of `herzp1/smartscale/checkout-v1a-2.html` vs. the 0.4.x `campaign-cart-starter-templates/src/olympus` base.
> **Date:** 2026-06-15

---

## 0. Purpose & provenance

**Arjuna** is a new, **private/"outside" template family** that captures the distinctive look and content shape of the **HerzP1 SmartScale** checkout and packages it as a **reusable, campaigns-os–certified template family** for **Adsbranded**-managed brands and campaigns.

- **Naming:** Hindu mythological tradition (Adsbranded is Krishna's agency; Arjuna is the warrior Krishna guides in the *Bhagavad Gita*). Distinct from the public Greek set (Olympus / Demeter / Limos).
- **Slug:** `arjuna`
- **Owner:** Adsbranded (private template — not published to the public starter-template picker unless explicitly decided).
- **Source of the design:** `herzp1/smartscale/checkout-v1a-2.html` (+ its `css/`, `js/`). Note this funnel is itself an **earlier-generation (0.3.x) fork of Olympus/Limos** — the class DNA (`olympus-*`, `os-card`, `limos_*`) is shared, which makes re-derivation onto current Olympus low-risk.

### What "debrand" means here
Strip every HerzP1-specific asset, string, and tracking id and replace with neutral placeholders/tokens (see **§11**). The output is a generic template, not a HerzP1 page.

---

## 1. Scope (full funnel)

Match Olympus's full page set so Arjuna is a complete family:

| Page | Olympus reference | Arjuna source reference |
|------|-------------------|--------------------------|
| `landing.html` | `src/olympus/landing.html` (+ `_includes/landing/*`) | (no direct HerzP1 analogue — adopt Olympus landing, re-themed) |
| `presell.html` | `src/olympus/presell.html` | `herzp1/smartscale/pre*.html` (advertorials) — port patterns later |
| `checkout.html` | `src/olympus/checkout.html` | **`herzp1/smartscale/checkout-v1a-2.html`** (primary subject) |
| `upsell-bundle-stepper.html` | `src/olympus/upsell-bundle-stepper.html` | `herzp1/smartscale/upsell1-4.html` |
| `upsell-bundle-tier-pills.html` | same | same |
| `upsell-bundle-tier-cards.html` | same | same |
| `receipt.html` | `src/olympus/receipt.html` | `herzp1/smartscale/thank-you.html` |

**Phase priority:** checkout first (it carries all the distinctives), then receipt + upsells, then landing/presell.

---

## 2. Strategy — re-derive on the 0.4.x Olympus skeleton

**Do NOT wrap the HerzP1 monolith.** Instead:

1. `cp -r campaign-cart-starter-templates/src/olympus campaign-cart-starter-templates/src/arjuna` (or into the chosen private repo — see **D1**).
2. Transplant Arjuna's visual + content layer onto the 0.4.x partial/frontmatter/contract structure.
3. Perform the **three mandatory SDK migrations** (§4) — the HerzP1 source is 0.3.x and will not satisfy the certified-family anchor contract as-is.
4. Author the **four campaigns-os recognition artifacts** (§9).

Rationale: the certified-template + theme/residue gates key off `template_family` and require specific 0.4.x SDK anchors + clean theme tokens. Wrapping the monolith fails the gates; re-deriving inherits Olympus's already-passing shape and lets us layer the Arjuna identity as theming + a handful of new partials.

---

## 3. Architectural baseline deltas (what changes vs. HerzP1 source)

| Concern | HerzP1 (0.3.x) | Arjuna target (0.4.x) |
|--------|----------------|------------------------|
| SDK loader | `campaign-cart@v0.3.12` | `@v{{ campaign.sdk_version }}` (0.4.x, ≥0.4.25 for product-sync) |
| Page assembly | one static HTML, all inline | `base.html` layout + `campaign_include` partials + YAML frontmatter |
| Layout classes | `olympus-wrapper`, `olympus-checkout__left/__right`, `checkout-wrapper new-size` | `checkout-page-layout`, `checkout-layout__left/__right`, `checkout-wrapper` |
| Config/meta | inline `<meta>` + `js/config.js` + inline VWO | `config.js` + base.html Liquid GTM/Pixel injection |
| CSS | `normalize` + `components` + `next-smart-scale-core.css` (21.7k) + `custom.css` | `next-core.css` + `brand-theme.css` (Arjuna token layer) |
| Skeleton | hand-coded `data-next-skeleton` block | `data-next-await` per component |

---

## 4. Mandatory SDK migrations (0.3.x → 0.4.x)

These are **required for certification** — the brand contract's `required_sdk_anchors.checkout` for the bundle families demands `data-next-bundle-selector` + `data-next-bundle-card`.

### 4.1 Bundle / package picker
| HerzP1 (0.3.x) | Arjuna (0.4.x) |
|---|---|
| `data-next-selector-id="smartscale-packages"` + per-card `data-next-package-id` / `data-package-quantity` | `data-next-bundle-selector` + `data-next-selector-id` + per-card `data-next-bundle-card` / `data-next-bundle-id` / `data-next-bundle-items='[{"packageId":N,"quantity":Q}]'` |
| `data-next-display="package.discountedPrice / package.price_retail_total / package.savingsPercentage"` | `data-next-bundle-display="unitPrice / originalUnitPrice / price / originalPrice / discountAmount / discountPercentage / hasDiscount"` |
| Per-package `forcePackageId` click script | native bundle selection-mode `swap` |

→ Use Olympus `_includes/bundle-selector.html` as the structural base, re-themed (§7.3).

### 4.2 Cart summary
| HerzP1 | Arjuna |
|---|---|
| `data-os-cart-summary="line-wrapper"` + `data-next-cart-items` (single hand-coded `{item.name}` row) | `data-next-cart-summary` + `data-summary-lines` with `<template>` per-line (`{item.quantity}x {item.name}`, `{item.originalPrice}`, `{item.price}`) |

→ Base on Olympus `_includes/cart-summary01.html`; **add** the delivery/scarcity block as a separate partial (§7.5).

### 4.3 Order bump
| HerzP1 | Arjuna |
|---|---|
| `data-next-package-sync="1, 2, 3"` (under-counts on configurable/MV) | `data-next-product-sync="<product_id>"` (SDK 0.4.25+) — or `data-next-package-sync` for single-package |

→ Single coverage bump → `bump-coverage.html` (§7.6). Use `data-next-package-toggle` anchors per the contract.

---

## 5. Directory layout (`src/arjuna/`)

```
arjuna/
├── _layouts/
│   ├── base.html                 # + Google Fonts <link> (Inter/Roboto/Poppins); loads next-core.css then brand-theme.css
│   ├── base-presell.html
│   └── base-landing.html
├── _includes/
│   ├── checkout-header.html       # logo + 90-day MB badge + phone (Arjuna variant)
│   ├── checkout-progress.html     # dual-progress option (§7.8)
│   ├── hero-media.html            # NEW — video-as-media + badge overlays | gallery fallback (§7.1)
│   ├── left-content.html          # NEW — benefit icons + testimonials + UGC video (§7.2)
│   ├── bundle-selector.html       # 0.4.x anchors, Arjuna theming (§7.3)
│   ├── customer-info-form.html
│   ├── shipping-address-form.html
│   ├── billing-address-form.html
│   ├── bump-coverage.html         # NEW — single coverage bump (§7.6)
│   ├── express-checkout.html
│   ├── payment-methods.html
│   ├── cart-summary.html          # 0.4.x summary (Arjuna styling) (§7.4)
│   ├── delivery-scarcity.html     # NEW — "fastest delivery" + "high demand" (§7.5)
│   ├── submit-block.html
│   ├── footer.html                # Arjuna footer
│   ├── receipt-skeleton.html / receipt-orders.html
│   ├── upsell-*-offer.html
│   └── landing/*                  # adopt Olympus landing sections, re-themed
├── assets/
│   ├── css/
│   │   ├── next-core.css          # current 0.4.x core (from Olympus)
│   │   └── brand-theme.css        # NEW — Arjuna token layer (§8)
│   ├── js/
│   │   ├── checkout.js
│   │   ├── checkout-arjuna.js     # delivery-date calc, UGC video controls auto-hide, forcePackageId (§10)
│   │   ├── upsells.js
│   │   ├── promo-banner.js
│   │   └── promo-timer.js
│   ├── images/                    # neutral placeholders (1x1_*.svg, next-logo.png, 90d.webp, badges)
│   └── config.js                  # placeholder apiKey + currency/address config
├── checkout.html
├── landing.html
├── presell.html
├── upsell-bundle-stepper.html
├── upsell-bundle-tier-pills.html
├── upsell-bundle-tier-cards.html
└── receipt.html
```

---

## 6. Checkout page stacking (target)

**Desktop**
- **Left** (`checkout-layout__left`): `hero-media` (video + badges) → `left-content` (4 benefit tiles → 2 testimonial cards → UGC video)
- **Right** (`checkout-layout__right`): heading + sub-head → `promo-timer` → form (`bundle-selector` → customer/shipping → `bump-coverage` → guarantee → payment → `cart-summary` + `delivery-scarcity` → `submit-block`) → trust footer

**Mobile**
- heading → right-column form → **mobile social-proof block** (re-emit `left-content` via responsive ordering)

> **Mobile duplication decision (D4):** HerzP1 duplicates the left social-proof into a separate `mobile-footer-content` block. Prefer a **single `left-content` include** repositioned with CSS order/visibility over duplicating markup, to avoid divergence. Confirm during build.

---

## 7. Partial specs (new / materially-changed)

Each partial must carry the `{% comment %} next_component: … {% endcomment %}` contract header (schema in §9.4).

### 7.1 `hero-media.html` (NEW — single large image by default; video/gallery opt-in)
- **Purpose:** Primary media slot. **DEFAULT = a single large static product image** (`.banner-img`)
  with absolutely-positioned **badge overlays** (the recurring Adsbranded pattern, §C.6 — 3/4
  surveyed checkouts are single-image). Opt in to an autoplay/loop/muted **video** (`media_type:
  video`) or a swiper **gallery** (`media_type: gallery`).
- **Frontmatter:**
  ```yaml
  media_type: image            # image (default) | gallery | video
  hero_image:                  # used when media_type: image
    src: "images/hero-placeholder.svg"   # ships an OBVIOUS placeholder; QA/asset-fidelity flags it
    alt: ""
  hero_video:                  # used when media_type: video (poster shows until sources load)
    poster: "images/hero-poster.webp"
    sources:
      - { src: "...webm", type: "video/webm" }
  media_badges:                # optional overlays (shared by image + video)
    - { src: "images/badge-90day.svg",   pos: "badge-img" }
    - { src: "images/badge-pricedrop.webp", pos: "badge-img-2" }
    - { src: "images/badge-soldout.svg",  pos: "badge-img-3" }
  # when media_type: gallery → reuse swiper_slides / swiper_thumbs (Olympus contract)
  ```
- **Designer-owns:** `.banner-img-wrapper`, `.img-wrapper`, `.banner-img`, `.img-poster`, `.badge-img`, `.badge-img-2`, `.badge-img-3`.
- **SDK-owns:** none (static media). Gallery variant uses `data-component="swiper"` (existing).
- **Gotcha / risk (R2 — resolved):** the checkout `qaStructure` hero selector accepts
  `.banner-img-wrapper` **OR** `[data-component="swiper"]`, so the single-image default, the video
  slot, and the gallery all satisfy it.

### 7.2 `left-content.html` (NEW — extra video/testimonial slot)
- **Purpose:** The left-column social-proof stack Olympus lacks.
- **Renders:** benefit-icon grid (`icons-grids-2`) → testimonial cards (`limos_review-box`) → UGC video block (`video-cont`).
- **Frontmatter:**
  ```yaml
  benefit_icons:
    - { icon: "images/icon-1.svg", label: "Clinical-Grade Accuracy" }
    # …4 total
  testimonials:
    - { image: "images/review-1.webp", stars: 5, title: "...", body: "...", name: "Mark S.", verified: true }
    # …
  ugc_video:
    title: "Trusted By 15,000+ Happy Customers"
    sources:
      - { src: "...mp4", type: "video/mp4" }
      - { src: "...webm", type: "video/webm" }
  ```
- **Designer-owns:** `.icons-grids-2(-item)`, `.sub-hero`, `.benefit_section`, `.checkout-features__column`, `.limos_review-box(-wrapper)`, `.customer_name-wrapper`, `.black-line`, `.video-title`, `.video-cont(__out)(__video)`.
- **SDK-owns:** none.

### 7.3 `bundle-selector.html` (0.4.x anchors + Arjuna theming)
- **Base:** Olympus `bundle-selector.html` (manual-cards variant).
- **Arjuna theming (designer-owns):** selected card `.os-card.next-selected { background:#F3FFDA; border:3px solid #000; }`; star-icon pill badges (`.os-card__label-2` / `--pill-primary` / `--pill-secondary`) with per-card color; `/ea` unit price; diagonal red strike on compare (`os--compare-diagonal`); `FREE SHIPPING` row.
- **Frontmatter:** reuse Olympus `packages`, `shipping_methods`, `bundles[]` (`title_prefix`, `badge_text`, `badge_pill_class`, `total_tone_class`, `shipping_label`, `subtitle_text`).
- **SDK-owns:** `data-next-bundle-selector`, `data-next-selector-id`, `data-next-bundle-card`, `data-next-bundle-id`, `data-next-bundle-items`, `data-next-shipping-id`, `data-next-selection-mode`, `data-next-include-shipping`, `data-next-bundle-display`, `data-next-selected`.

### 7.4 `cart-summary.html`
- **Base:** Olympus `cart-summary01.html` (0.4.x `data-next-cart-summary` + `data-summary-lines`).
- **Arjuna styling:** `cart-box`, `summary-total__coin` currency chip, "Today you saved / Discount" row treatment.

### 7.5 `delivery-scarcity.html` (NEW)
- **Purpose:** The `popular-item-resume` block — "Fastest delivery: *date – date*" + red "high demand" line.
- **Frontmatter:**
  ```yaml
  delivery_estimate: { min_days: 2, max_days: 3 }
  scarcity_note: "This item is currently in high demand."
  ```
- **JS:** date computation moves to `checkout-arjuna.js` (today+min, today+max). Renders into `#delivery-start` / `#delivery-end`.
- **SDK-owns:** none.

### 7.6 `bump-coverage.html` (NEW)
- **Purpose:** Single toggle coverage bump (HerzP1 "Coverage").
- **SDK-owns:** `data-next-bump`, `data-next-package-toggle`, `data-next-product-sync="<product_id>"` (0.4.25+) — **not** `data-next-package-sync="1,2,3"`.
- **Frontmatter:** `order_bump.coverage.{package_id, sync_product_id, title, features[], price bindings}`.

### 7.7 `checkout-header.html`
- Logo + 90-day money-back badge + phone (`{{ campaign.store_phone }}`). Designer-owns `.checkout__header-top`, `.checkout__header-brand`, `.mg-section`, `.brand-logo`.

### 7.8 `checkout-progress.html`
- **Decision (D3 — resolved):** HerzP1's two indicators are a **responsive split**, not redundancy (verified `next-smart-scale-core.css:21563–21568`): desktop (≥768px) shows `.section-steps` — a 3-step funnel tracker (Checkout → Bonus Deals → Receipt); mobile (<768px) shows the sticky `.progress-bar` — a 4-step numbered in-checkout stepper (Select/Shipping/Payment/Order). **Keep the responsive split**, parameterized:
  ```yaml
  progress:
    desktop: { style: "funnel3", steps: ["Checkout","Bonus Deals","Receipt"] }
    mobile:  { style: "steps4",  steps: ["Select","Shipping","Payment","Order"] }
  ```
  Confirm only the stage labels with Adsbranded.

### 7.9 `footer.html`
- Logo + copyright + `{{ campaign.store_contact/privacy/terms }}` links (tokenized; no herzp1.com).

### 7.10 `promo-display.html` (NEW — inline promo-code display, §C.7)
- **Purpose:** Always-visible inline promo-code affordance (Adsbranded opinion — all 4 surveyed
  checkouts ship one). Renders the **real SDK coupon path** plus an opinionated "use this code" chip.
  Included by default in the order-summary card; distinct from the optional exit-intent coupon.
- **Frontmatter:**
  ```yaml
  promo:
    label: "Have a promo code?"        # optional heading
    code: "SAVE10"                      # optional — shows a chip AND prefills the field; omit for plain field
    placeholder: "Promo code (optional)"
    button_text: "Apply"
    auto_apply: true                    # mirrors data-auto-apply on the SDK input row
  ```
- **SDK-owns:** `data-next-coupon="input"` (+ `data-auto-apply`, `os-checkout-field="coupon"`) and
  `data-next-coupon="display"` (applied-coupon tags via `pb-checkout="coupon-title"/"coupon-remove"`),
  gated by `data-next-hide="cart.isEmpty"`. Applied vouchers also surface in the cart-summary discount row.
- **Designer-owns:** `.promo-display`, `.promo-wrapper`, `.promo-display__label`, `.promo-display__code`
  (the base `.coupon-form`/`.coupon-button`/`.coupon-tags` ship in next-core).
- **Gotcha:** never prefill + auto-apply a *fake* demo code — the SDK would try to apply it on load
  and surface an error. The starter ships no `code`, so the default renders an empty field.

---

## 7.11 Layer-B hardening — the deterministic Adsbranded opinions (defects fixed + opinions baked)

This family is the **pattern-setter** for the Adsbranded family; the conventions below are what the
multi-variant siblings copy. All work is in the **presentation layer** only (5 Arjuna partials +
`brand-theme.css` + `checkout-arjuna.js`); the operational layer stays Olympus-synced.

**Defects fixed (§B):**
- **Single-select correctness (§B.1, extended).** The selected **radio** keys on `.next-selected
  .radio-style-1` only (the static `data-selected` hook the SDK never clears was dropped). Browser
  verification surfaced the **same trap on the card fill**: the lime/black `.os-card` highlight was
  keyed on `.next-selected, .next-in-cart`, but the SDK leaves `.next-in-cart` on the *previously*
  selected card after a swap → two cards looked selected. Fixed to key on `.next-selected` ONLY
  (+ neutralize any SDK in-cart tint on the non-selected card). Verified: clicking 2x moves the
  lime fill + filled radio off 1x cleanly.
- **CTA contrast (§B.2).** `.button`/`.submit-button`/`.coupon-button` read a new
  `--brand--color--cta-foreground` token (core default dark `#020b1e`; Arjuna sets `#fff` because
  its CTA is dark zinc). A bright/yellow re-theme drops the `#fff` override → dark text, legible.
- **Tri-font tokenized (§B.3).** See §8.1 — `--font-primary/-secondary/-accent`, one-line collapse.
- **Distinct benefit icons (§B.4).** 4 distinct `benefit-N.svg` placeholders + an HTML-comment lint
  when icons repeat.
- **No placeholder-as-content (§B.5).** Heading copy is frontmatter-driven (`product_eyebrow`/
  `product_name`/`product_subhead`); Lorem testimonials replaced with distinct, no-Lorem starter
  quotes; `left-content` emits an asset-fidelity flag when a review still uses a `1x1_*` photo.

**Opinions baked as deterministic defaults (§C):** single-large-image hero (§C.6, §7.1); inline
promo display (§C.7, §7.10); per-unit `/ea` + diagonal compare + visible savings on **both** bundle
cards and cart-summary (§C.8, §8.x) with full-price as the no-discount opt-down; frontmatter-driven
review cards with a distinct default (§C.9, §7.2). Documented in the campaigns-os brand contract
(`pricing_presentation`, `bundle_picker`, `hero_media`, `promo_display`, `typography`) and the
`families.arjuna` catalog (`promoDisplay` surface, opinions in `agentNotes`).

**Acceptance (§D):** a fresh clone with only brand tokens + content frontmatter renders the full
Adsbranded shape with NO structural editing; all 16 `qaStructure` selectors present; radio + card
single-select swap; CTA contrast passes; single-font override is one line — all browser-verified on
the live SDK against a demo campaign.

---

## 8. Theming — `brand-theme.css` (Arjuna token layer)

Loaded **after** `next-core.css` (per `shared-commerce` contract `css_load_order: brand_layer_after_core`).

### 8.1 Typefaces (the signature) — token-driven, single-font-collapsible

`base.html` adds the Google Fonts `<link>` (Poppins/Inter/Roboto). The tri-font is the house
signature **and the default**, but it is driven entirely by three named tokens so a single-font
brand collapses it in one line and **no family names are hardcoded in component CSS** (§B.3):

```css
:root {
  --font-primary:   "Inter", system-ui, …;        /* body + headings            */
  --font-secondary: "Roboto", var(--font-primary); /* cards / form / reviews     */
  --font-accent:    "Poppins", var(--font-primary);/* delivery/scarcity "resume" */
}
```

- The next-core type tokens are **bridged** to these (`--_text---font-family--primary/-heading
  → var(--font-primary)`, `--secondary → var(--font-secondary)`), so the whole stack flows from
  `--font-*` (single source).
- Component rules reference the tokens only: `body`/headings → `--font-primary`; `.os-card` /
  `.checkout__form-container` / `.limos_review-box` → `--font-secondary`; `.icons-grids-2-item`
  → `--font-primary`; `.popular-item-resume` → `--font-accent`.
- **Single-font collapse is one line** (browser-verified): a brand overrides all three to the
  same family — `:root{--font-primary:"X";--font-secondary:var(--font-primary);--font-accent:var(--font-primary)}`.

### 8.2 Palette
| Token | Arjuna value (from HerzP1) | Olympus default (forbidden residue) |
|---|---|---|
| `--brand--color--primary` | `#18181b` (zinc-black) | `#3c7dff` |
| `--brand--color--primary-dark` | (derive, e.g. `oklch(20% .02 60)`) | `#0a265c` |
| `--brand--color--surface` | `rgb(255,254,242)` (warm cream) | `#fafcff` |
| `--brand--color--primary-light` | `rgb(252,248,220)` (badge bg) | `#e0ebff` |
| selected card | `#F3FFDA` lime + `3px solid #000` | (blue-tint default) |
| accents | star `#FF9425`, green `#1BBA86`, blue `#298FBD`, teal `#08927A`, danger `#b73339`/`#d32b33` | — |

### 8.3 `default_color_residue` (for the brand contract)
`["#18181b", "rgb(255,254,242)"]` — i.e. if a built campaign still shows the Arjuna **starter** defaults unchanged, that's residue. (Per-campaign brand override still required.)

---

## 9. campaigns-os recognition artifacts (the 4 the gates require)

> Verified live mechanics: `qa-node.mjs` resolves `template_family` then loads `catalog.families[family].agentContract.qaStructure` + `loadBrandContract(family)`. Unregistered families are **exempted as "custom"** (uncertified), not certified — registering here is what flips Arjuna to certified.

### 9.1 `templates.json` entry
Add to `campaign-cart-starter-templates/templates.json` **only if Arjuna should appear in the public picker.** For a private family, register it in a **private templates registry** instead (see **D1**).
```json
{ "slug": "arjuna", "name": "Arjuna", "description": "Adsbranded video-hero checkout with left social-proof rail", "priority": 65, "deprecated": false, "hidden": true }
```
(`hidden: true` keeps it out of the public picker while still resolvable by slug.)

### 9.2 `commerce-surface-catalog.json` → `families.arjuna`
Mirror the real Olympus block shape (verified). Draft:
```jsonc
"arjuna": {
  "description": "Single-step checkout with video hero media, a left social-proof rail (benefit icons + testimonials + UGC video), tiered bundle cards (lime/black selected state), and a delivery+scarcity summary block.",
  "frontmatterStatus": "partial",
  "strongSignals": [
    "arjuna in spec, path, or export metadata",
    "video-as-media hero with badge overlays (.banner-img-wrapper > video)",
    "left social-proof rail (.limos_review-box + .video-cont) beside the form",
    "os-card tier selector with #F3FFDA selected state",
    "delivery-estimate + high-demand block in the order summary"
  ],
  "canonicalSurfaces": {
    "mainSelector": "tiered-bundle-selector",
    "orderSummary": "cart-summary",
    "payment": "payment-methods",
    "expressCheckout": "express-checkout-inline",
    "orderBump": "bump-coverage",
    "upsell": "bundle-stepper|bundle-tier-pills|bundle-tier-cards",
    "receipt": "receipt-skeleton",
    "heroMedia": "hero-media",
    "socialProof": "left-content",
    "deliveryScarcity": "delivery-scarcity"
  },
  "frontmatterInputsObserved": [
    "packages","shipping_methods","bundles","order_bump","order_bump_variant",
    "hero_video","media_badges","media_type","benefit_icons","testimonials","ugc_video",
    "delivery_estimate","scarcity_note","swiper_slides","swiper_thumbs",
    "upsell_offer","upsell_bundle_tiers","payment_flags","progress_style"
  ],
  "agentContract": {
    "status": "agent-ready",
    "templateRole": "Adsbranded video-hero single-step checkout with left social-proof rail and tiered bundle cards.",
    "sourceOfTruth": { "campaignSpec": ["…"], "campaignsApi": ["packages[].ref_id","shipping_options[].ref_id"], "starterTemplate": ["stable SDK DOM shape","family-local includes","page frontmatter contract"] },
    "frontmatter": {
      "requiredWhenCloning": ["packages.main_package","shipping_methods.standard","bundles[].quantity","bundles[].shipping_method"],
      "optionalWhenSupported": ["shipping_methods.free","order_bump_variant","hero_video","media_badges","benefit_icons","testimonials","ugc_video","delivery_estimate","scarcity_note","upsell_offer","upsell_bundle_tiers","payment_flags","progress_style"],
      "demoOnlyValues": ["packages.main_package=1","shipping_methods.standard=2","shipping_methods.free=1"],
      "replaceFromSpecOrApi": ["packages.*","shipping_methods.*","bundles[].shipping_method","order_bump.*.package_id","order_bump.coverage.sync_product_id","upsell_offer.*"],
      "removeWhenUnsupported": ["bundles[].shipping_method when no tier-specific shipping","bump-coverage when no coverage package","testimonials/ugc_video when assets absent","upsell pages not in funnel"]
    },
    "surfaces": [
      { "name": "video hero media", "partials": ["hero-media.html"], "ownedInputs": ["media_type","hero_video","media_badges","swiper_slides","swiper_thumbs"], "sdkRoots": [] },
      { "name": "social-proof rail", "partials": ["left-content.html"], "ownedInputs": ["benefit_icons","testimonials","ugc_video"], "sdkRoots": [] },
      { "name": "tiered bundle selector", "partials": ["bundle-selector.html"], "ownedInputs": ["packages","shipping_methods","bundles"], "sdkRoots": ["data-next-bundle-selector","data-next-bundle-card"] },
      { "name": "payment shell", "partials": ["payment-methods.html","express-checkout.html"], "ownedInputs": ["payment_flags"], "sdkRoots": ["data-next-payment-method","data-next-payment-form","data-next-express-checkout"] },
      { "name": "order bump", "partials": ["bump-coverage.html"], "ownedInputs": ["packages","order_bump"], "sdkRoots": ["data-next-bump","data-next-package-toggle"] },
      { "name": "order summary + delivery", "partials": ["cart-summary.html","delivery-scarcity.html"], "ownedInputs": ["delivery_estimate","scarcity_note"], "sdkRoots": ["data-next-cart-summary"] }
    ],
    "qaStructure": {
      "checkout": {
        "description": "Rendered Arjuna checkout must adopt the Arjuna shell, not a custom shell with borrowed partials.",
        "requiredVisibleSelectors": [
          { "name": "checkout wrapper", "selector": ".checkout-wrapper" },
          { "name": "left column", "selector": ".checkout-layout__left" },
          { "name": "right column", "selector": ".checkout-layout__right" },
          { "name": "hero media", "selector": ".banner-img-wrapper, [data-component=\"swiper\"]" },
          { "name": "checkout form", "selector": "[data-next-checkout=\"form\"]" },
          { "name": "bundle card", "selector": "[data-next-bundle-card]" },
          { "name": "order summary", "selector": "[data-next-cart-summary]" }
        ],
        "requiredNonEmptySelectors": [ { "name": "order summary content", "selector": "[data-next-cart-summary]" } ]
      }
    },
    "fixtures": ["contracts/fixtures/campaign-specs/arjuna-tiered-standard-free.json"],
    "agentNotes": ["Use Arjuna only when the design has the video-hero + left social-proof rail shape; do not default here from a generic checkout."]
  }
}
```

### 9.3 `template-brand-contract.arjuna.v0.json`
Mirror `template-brand-contract.olympus.v0.json` (verified), with Arjuna anchors/colors:
```json
{
  "schema_version": "template-brand-contract/v0",
  "family": "arjuna",
  "extends": "template-brand-contract.shared-commerce.v0.json",
  "description": "Brand contract for the Arjuna (Adsbranded) video-hero checkout family.",
  "family_inventory": {
    "supported_pages": ["landing","presell","checkout","upsell","receipt"],
    "required_sdk_anchors": {
      "checkout": ["data-next-bundle-selector","data-next-bundle-card","data-next-cart-summary","data-next-payment-method","data-next-payment-form","data-next-express-checkout"],
      "upsell": ["data-next-upsell","data-next-bundle-selector","data-next-bundle-card"],
      "receipt": ["data-next-order-items"]
    },
    "theme_insertion_point": "Load brand-theme.css from frontmatter styles after css/next-core.css on checkout, upsell, downsell, and receipt pages.",
    "default_color_residue": ["#18181b", "rgb(255,254,242)"],
    "pricing_presentation": "Tiered bundle cards (/ea unit + diagonal compare strike) and bundle upsells support compare/current, savings, unit-plus-total, and full-price modes via SDK display nodes.",
    "bundle_picker": "Tiered .os-card cards with data-next-bundle-selector/-card anchors; selected state is #F3FFDA + 3px solid #000.",
    "order_bump": "Single coverage bump (bump-coverage.html) using data-next-bump + data-next-package-toggle; quantity sync via data-next-product-sync.",
    "upsell_downsell": "Bundle stepper/tier-pills/tier-cards upsells require a visible price row above the accept CTA.",
    "exit_pop": { "default_included": false, "include": "exit-intent-popup.html", "behavior": "Strip unless CampaignSpec maps exit_intent or promo_code_input." },
    "qa_selectors": [".checkout-wrapper", ".submit-button", ".os-card.next-selected", ".banner-img-wrapper", ".brand-logo"]
  }
}
```

### 9.4 Per-partial `next_component` headers
Every `_includes/*.html` partial gets the full contract comment block. Keys (from the verified Olympus partials):
`next_component`, `next_version`, `next_sdk_min`, `next_purpose`, `next_params`, `next_sdk_owns`, `next_theming` (`classes_designer_owns` / `css_vars_designer_owns`), `next_dont_touch`, `next_gotchas`, `next_variants`, `next_related`.

---

## 10. JS map

| File | Responsibility |
|------|----------------|
| `checkout.js` | shared SDK init/checkout handlers (from Olympus) |
| `checkout-arjuna.js` | NEW — (1) delivery-date calc → `#delivery-start/#delivery-end`; (2) UGC video auto-hide-controls + click-to-restore; (3) `forcePackageId`/`package` URL-param bundle pre-select; (4) `timer=n` promo-timer hide |
| `upsells.js` | upsell flow (from Olympus) |
| `promo-banner.js`, `promo-timer.js` | from Olympus |

> Drop the HerzP1 inline VWO SmartCode entirely (analytics belongs in `config.js` / GTM injection per family).

---

## 11. Debrand checklist

| Item | HerzP1 value | Replace with |
|------|--------------|--------------|
| Logo | `images/checkout/logo.svg` | `images/next-logo.png` placeholder |
| Phone | `1 (877) 309-3614` | `{{ campaign.store_phone }}` |
| Product name | "Herz P1 Smart Scale" | "Product Name" |
| Body copy | 56 metrics / body-fat / muscle | lorem placeholders |
| Footer links | herzp1.com/contact|privacy|terms | `{{ campaign.store_* }}` |
| Copyright | "© 2026 Herz P1" | `© {{ year }} {{ campaign.store_name }}` |
| Media | `cdn.29next.store/media/herz/*` videos | `images/1x1_*.svg` + placeholder webm |
| Testimonial imgs / badges | `review-image-*.webp`, badges | neutral placeholders |
| Tracking | VWO acct 771466; `funnel: herzp1smartscale-v1a` | removed / `{{ campaign.* }}` |
| Favicon | `32x32 favicon.png` | `favicon.png` placeholder |

---

## 12. Acceptance — what the gates will check

- **Certified-template gate:** `arjuna` present in `commerce-surface-catalog.json` **and** `template-brand-contract.arjuna.v0.json` exists → certified (else waiver required).
- **Doctor / `qa-node`:** `qaStructure.checkout` required selectors render & order-summary non-empty.
- **Theme/residue gate:** no `default_color_residue` left unchanged on a real campaign; `qa_selectors` computed-style checks pass (submit button, selected card, logo).
- **Pricing rule:** never hide `.price-wrapper`/`.price-display` rows with CSS (shared-commerce forbidden-hides).

---

## 13. Open decisions / risks

- **D1 — Home repo (resolved).** New private repo **`Sellmore-Co/adsbranded-templates`**, family at `src/arjuna/`. May migrate to `NextCommerceCo` later. Contract files still live in `campaigns-os/contracts/`.
- **D2 — Outside-template build wiring (direction set; eng work pending).** Extend campaigns-os to resolve a **selected private template source** (this repo) in addition to the public starter-templates repo, **without surfacing private content to end users**. Catalog/contract are already keyed by family name; the work is the source-resolution path + a private-family allowlist. Tracked internally as the template-building workstream.
- **D3 — Progress indicator (resolved).** Not redundant — a **responsive split** (desktop 3-step funnel `.section-steps`; mobile 4-step sticky `.progress-bar`). Keep the split; parameterize labels via frontmatter. See §7.8.
- **D4 — Mobile social-proof.** Single `left-content` repositioned by CSS vs. duplicated `mobile-footer-content` markup. Prefer single. (Build-time call.)
- **R1 — SDK version.** Bump from 0.3.12 to ≥0.4.25 (needed for `data-next-product-sync`). Validate the whole funnel against current SDK.
- **R2 — Video media in QA.** Theme gate may assume a swiper gallery; ensure the `hero-media` video slot satisfies `qaStructure` (selector accepts video OR swiper).

---

## 14. Build phasing

1. **Phase 0 — Scaffold + checkout.** `src/arjuna/` from Olympus; brand-theme.css; `hero-media`, `left-content`, themed `bundle-selector`, `cart-summary` + `delivery-scarcity`, `bump-coverage`; checkout.html frontmatter; `checkout-arjuna.js`. Local dev render.
2. **Phase 1 — Full funnel.** receipt + 3 upsell variants + landing/presell; per-partial `next_component` headers.
3. **Phase 2 — Certification.** Author the 3 campaigns-os artifacts + fixture spec; run doctor/QA; confirm certified-template + theme gates green.
4. **Phase 3 — Pilot.** Build one real Adsbranded campaign on `arjuna`; QA test order; compare to a HerzP1 page for parity.
