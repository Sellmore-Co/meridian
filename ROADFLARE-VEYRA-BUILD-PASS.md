# Roadflare / Veyra build pass

Date: 2026-05-05
Branch: main

## Campaigns

- Roadflare Supply Co. / Limos: public slug `roadflare-v1`; spec `campaign-spec-roadflare-v1.json`; source design `roadflare-limos`.
- Veyra House / Demeter: public slug `veyra-v1`; spec `campaign-spec-veyra-v1.json`; source design `veyra-demeter`.

## Template handling

- Meridian is only the page-kit/Netlify container. These campaigns have independent folders, configs, assets, copy, and registry entries.
- Designer HTML provided the visual system. Checkout, upsell, and receipt commerce slots were replaced with Campaign Cart SDK surfaces while preserving the intended layout shape.
- Payment, bundle, order-bump, upsell, and receipt surfaces use SDK-managed `data-next-*` attributes. No custom commerce JavaScript was added.
- 2026-05-05 feedback pass restored the Limos single-card quantity stepper, starter-template express checkout/payment includes, and starter `cart-summary02.html` accordion rather than bespoke checkout fragments.
- 2026-05-05 follow-up split checkout summary includes by template family: Limos uses the collapsed `cart-summary02.html` accordion; Demeter uses the open `cart-summary03.html` side-cart shape.

## Product and offer assumptions

- Roadflare checkout main package: JumpBrick Pro package 1, single selected card with native bundle quantity 1-5, shipping method ref 1.
- Roadflare order bump: MagMount Dock package 2, fixed-quantity add-on.
- Roadflare upsell 1: Beacon 2 Pack package 3 with voucher code BEACON2, then routes to fleet offer.
- Roadflare upsell 2: Fleet Add-On package 4, quantities 1/2/3, voucher codes FLEET2 and FLEET3 for multi-quantity tiers.
- Veyra checkout main package: Luma Taper package 1, quantities 1/2/3, shipping method ref 1. Fallback prices now match the spec unit-price rounding: 1x $87.99, 2x $131.98, 3x $173.97.
- Veyra order bump: Smoked Glass Shade package 2, fixed-quantity add-on.
- Veyra upsell: Twin Dock Tray package 3 with voucher code TWINDOCK.

## Adaptations

- The user-requested QA path is landing -> presell -> checkout, so the public index pages route to presell and then checkout. The CampaignSpec exported presell/landing order is preserved in the repo copy but this build favors the requested visual flow.
- Veyra's static upsell showed three tray choices, but the spec exposes one dock package. The live upsell keeps a single SDK-backed tray offer to avoid unsupported package assumptions.
- Roadflare's second upsell uses the provided MagMount product shot as the fleet add-on visual because the supplied product image set did not include a separate fleet kit render.

## Commands

- `node scripts/assemble-roadflare-veyra.mjs`
- `npm run build`

## Verification

- `npm run build` passed and generated both campaign route sets under `_site/`.
- Local preview server: `http://127.0.0.1:8080`.
- Browser matrix checked desktop `1440x1000` and mobile `390x844` for Roadflare pages `/`, `/presell/`, `/checkout/`, `/upsell-beacon/`, `/upsell-fleet/`, `/receipt/` and Veyra pages `/`, `/presell/`, `/checkout/`, `/upsell-dock/`, `/receipt/`.
- Results: no broken images, no horizontal overflow, no console errors after fresh page load, SDK config present on every page, and visible SDK commerce surfaces on checkout/upsell/receipt pages.
- Checkout SDK readiness reached `html.next-display-ready` on Roadflare and Veyra; `window.next`, `window.nextCampaign`, and the expected campaign API keys were present.
- Main bundle selectors hydrated with live totals. Order bumps use `data-next-package-toggle` / `data-next-toggle-card`; clicking the bump toggled `next-in-cart` and updated checkout totals.
- Screenshots captured: `/tmp/roadflare-checkout-desktop.png`, `/tmp/roadflare-checkout-mobile-fixed.png`, `/tmp/veyra-checkout-desktop.png`, `/tmp/veyra-checkout-mobile.png`.

## Open risks

- I did not create real test orders or verify post-checkout receipt hydration with a live `ref_id`; receipt pages include SDK `data-next-order-items` templates plus believable fallback summaries.
- Roadflare Beacon and Fleet vouchers are wired from the spec. Full discount behavior should be confirmed with a sandbox order if this moves beyond build-through testing.
