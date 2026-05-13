# Home Outage Prep — Campaigns OS Build Pass

Round-two dogfood. Demeter family, single-funnel, operator-locked template.

- **Map**: `home-outage-prep-v0-sf21`
- **Slug**: `home-outage-prep-v0`
- **Store**: `keer.29next.store` (test)
- **Spec**: `designer/funnel-designs/home-outage-prep/campaign-spec-home-outage-prep-v0.json`
- **Source HTML**: `designer/funnel-designs/home-outage-prep/`
- **Target**: `meridian/src/home-outage-prep-v0/`
- **Branch**: `home-outage-prep-v0-sf21`

## Funnel shape (from CampaignSpec)

| Page | Spec ID | Route | Template surface |
|---|---|---|---|
| Presell | `page_mp3qp2nt_25` | `/home-outage-prep-v0/presell/` | passthrough (`landing-passthrough.html` layout) |
| Landing | `page_mp3qp2nt_26` | `/home-outage-prep-v0/landing/` | passthrough |
| Checkout | `page_mp3qp2nt_27` | `/home-outage-prep-v0/checkout/` | demeter checkout |
| Upsell 1 | `page_mp3qp2nt_28` | `/home-outage-prep-v0/upsell/` | demeter `upsell-bundle-tier-cards-offer` |
| Upsell 2 | `page_mp3qs1fg_226` | `/home-outage-prep-v0/upsell-2/` | demeter `upsell-bundle-stepper-offer` |
| Thank You | `page_mp3qp2nt_29` | `/home-outage-prep-v0/receipt/` | demeter receipt |

## Spec-driven wiring

### Packages
- `packages.main_package: 1` — RescueRay Battery Powered Emergency LED Backup Bulb
- `packages.prepurchase_1: 2` — Emergency Solar Power Bank (order bump)
- Upsell 1 single-package: `3` — Fire Blanket
- Upsell 2 single-package: `4` — Portable Solar Spotlight

### Shipping
- `shipping_methods.standard: 1` — the only shipping method on the spec (code "default")
- `bundles[].shipping_method` removed per `frontmatter.removeWhenUnsupported` (no tier-specific shipping in spec)

### Bundles (Demeter checkout)
- `bundle-1x` (qty 1, badge "STARTER")
- `bundle-2x` (qty 2, **selected**, badge "BEST DEAL")
- `bundle-3x` (qty 3, dark total)

### Order bumps
- Only `check01` rendered (`order_bump_variant: "check01"`); `switch01` dropped — spec carries only one prepurchase package.

### Vouchers
- Upsell 1 tier cards reuse single voucher `FIRE` (40% off) on 1x/2x/3x. Spec carries one voucher per upsell page.
- Upsell 2 stepper uses voucher `SOLAR` (33% off).

### Payment methods
- Spec `available_payment_methods`: `apple_pay`, `bankcard`, `google_pay`.
- `_includes/payment-methods.html` invoked with `show_paypal=false show_klarna=false show_apple_pay=true show_google_pay=true`.
- `config.js` `paymentConfig.expressCheckout.methodOrder`: `paypal` dropped.
- Built HTML renders only `credit`, `apple-pay`, `google-pay` payment-method blocks.

### Routing meta tags
CampaignSpec sdk_hints exported unrooted paths (`upsell/`, `upsell-2/`, `receipt/`) — doctor flagged `routing_meta.runtime_root`. Build resolves via page-kit's `campaign_link` filter; frontmatter uses `next_url` / `decline_url` without trailing slash so the filter doesn't double up.

Built output (post-build verification):

```
checkout:   next-success-url=/home-outage-prep-v0/upsell/
            next-upsell-accept-url=/home-outage-prep-v0/upsell/
upsell:     next-upsell-accept-url=/home-outage-prep-v0/upsell-2/
            next-upsell-decline-url=/home-outage-prep-v0/upsell-2/
upsell-2:   next-upsell-accept-url=/home-outage-prep-v0/receipt/
            next-upsell-decline-url=/home-outage-prep-v0/receipt/
```

## Deviations from prepared HTML

Spec is authoritative; source-HTML references to `package.379` / `package.381` and voucher codes `UP50/UP60/UP70` were dropped in favor of spec packages `3` / `4` and vouchers `FIRE` / `SOLAR`. Source landing.html and presell.html preserved as passthrough (real standalone designs); checkout/upsells/receipt built from demeter starter and spec values, not from source.

## Lifecycle decisions made during build

| Decision | Where | Reason |
|---|---|---|
| Use demeter `upsell-bundle-tier-cards-offer` for upsell-1 | matches source design intent (1/2/3 blanket tiers) | source upsell-1.html ships tier-cards UX |
| Use demeter `upsell-bundle-stepper-offer` for upsell-2 | matches source design intent (qty stepper 1-5) | source upsell-2.html ships stepper UX |
| Reuse voucher `FIRE` across all 3 upsell-1 tiers | spec carries one voucher per upsell page | spec didn't model per-tier vouchering |
| Rename `upsell-bundle-tier-cards.html` → `upsell.html` | page-kit URL routing is filename-based | spec page_url is `upsell/` |
| Rename `upsell-bundle-stepper.html` → `upsell-2.html` | as above | spec page_url is `upsell-2/` |
| Delete `upsell-bundle-tier-pills.html` | unused starter variant | demeter starter shipped 3 upsell examples; only 2 fit this funnel |
| Drop trailing `/` from `next_url`/`decline_url` | `campaign_link` filter appends one → double-slash bug | see Dogfood report — friction #2 |

## Build verification

```
npm run build → INFO Built 67 pages in 746ms
```

Six home-outage-prep-v0 pages emitted; local http.server smoke check returns 200 on all routes and key assets.

## Open items for polish + QA

- Replace `images/next-logo.png` placeholder logo in checkout-header.html + receipt-skeleton.html with a RescueRay brand logo (source designer ships only a landing-page-specific logo; no brand asset yet).
- Confirm or suppress demeter `checkout-demeter.js` exit-intent — page-kit-commands.md warns it ships pointed at `https://placehold.co/600x400` + `EXIT10` voucher that doesn't exist on this campaign.
- Allowed domains confirmation in Campaigns App for SDK runtime (doctor warning `campaign.allowed_domains_confirmed`).
- SDK 0.4.19 receipt template regression — verify in QA against round-one symptom.

## Friction filed during this stage

See `HOME-OUTAGE-PREP-DOGFOOD-REPORT.md` for the bucketed list. Mid-build observations:

1. **Setup→build handoff has an undocumented second file.** Setup skill's contract says "record setup status in `.campaign-runtime/assembly-report.json`", but build doctor also requires `scaffold.required: false` in `.campaign-runtime/build-context.json`. Updating the assembly report alone leaves build BLOCKED.
2. **`campaign_link` filter double-slashes trailing-slash inputs.** Spec exports `page_url: "upsell/"`; passing that through `campaign_link` produces `/slug/upsell//`. Either filter should normalize, or doctor / spec→frontmatter mapper should strip.
3. **Doctor warnings don't refresh against build state.** After build addresses `frontmatter.demoOnlyValues`, `replaceFromSpecOrApi`, `removeWhenUnsupported`, and bundle shipping-method drops, the same warnings still fire on the polish-stage doctor call. Build output isn't being consulted.
4. **`template_contract.demo_ref` flags legitimate small ref_ids.** Spec's real package refs `1` and `2` match demeter starter demo refs (also `1`/`2`/`7`/`9`). Heuristic can't distinguish.
5. **Routing-meta lint can't tell built from bare.** Lint reads CampaignSpec only and stays loud after build emits rooted paths.
6. **Map Builder export omits `spec_identity` on unsaved specs without erroring.** Initial export missed the block; only `--map-id` override mentioned in CLI error. Required re-export — should the builder block export when `spec_identity` would be empty?

Polish stage is next.
