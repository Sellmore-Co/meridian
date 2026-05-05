# Roadflare / Veyra commerce component inventory

Date: 2026-05-05

## Readout

This pass is not intentionally using commerce components from the previous Olympus run. The failure mode was under-enumeration: I initially treated checkout summary/payment/bundle mounts as broadly reusable starter pieces instead of selecting them by template family. Shared SDK primitives are valid, but the rendered commerce components must be family-scoped.

## Component Map

| Commerce surface | Limos / Roadflare shape | Demeter / Veyra shape | SDK contract |
| --- | --- | --- | --- |
| Main purchase selector | Single SDK-backed offer card plus external quantity stepper | Visible editorial 1/2/3 tier bundle selector | `data-next-bundle-selector`, `data-next-bundle-card`, `data-next-selected`, `data-next-bundle-display` |
| Quantity control | `data-next-bundle-qty-for="main"` attached to the single selected package | Not used; bundle card selection changes quantity | `data-next-quantity-decrease`, `data-next-quantity-increase`, `data-next-quantity-display` |
| Order summary | Collapsible Limos accordion from `cart-summary02.html` | Open Demeter side cart from `cart-summary03.html` | SDK cart line rendering, discounts, shipping, totals |
| Express checkout | Family starter include, styled by current campaign CSS | Family starter include, styled by current campaign CSS | `data-next-express-checkout` surfaces from Campaign Cart SDK |
| Card payment | Family starter `payment-methods.html` with explicit card placeholders/styles in `window.nextConfig.paymentConfig.cardInputConfig` | Same payment primitive, visually adapted by Demeter CSS | Spreedly iframe fields via SDK config |
| Order bump | Designed product bump wrapper around `data-next-toggle-card` | Designed shade bump wrapper around `data-next-toggle-card` | `data-next-package-toggle`, `data-next-toggle-card`, `data-next-toggle-display` |
| Post-purchase upsell | Offer selector and accept/skip actions for Beacon, then Fleet add-on | Single dock-tray offer | `data-next-upsell`, `data-next-upsell-action`, optional upsell-context selector |
| Receipt | SDK order-items mount with Roadflare fallback summary | SDK order-items mount with Veyra fallback summary | `data-next-order-items` with static fallback for no ref_id preview |

## Guardrail For Future Builds

The generator should resolve `templateFamily -> commerce components` before rendering checkout. It is acceptable to share low-level SDK config and field primitives, but bundle selector, quantity, order summary, and receipt composition should be chosen from the target template family unless the design explicitly overrides it.

## Core Template Frontmatter Plan

These Roadflare/Veyra fixes should feed back into starter templates as frontmatter-controlled component variants, not campaign one-offs:

- Add a Limos single-offer quantity selector variant with slots for headline, product image, compare price, current price, discount amount, discount percentage, and timer copy.
- Add Demeter tier-card pricing slots that always include current total plus optional original total/discount copy, controlled by bundle-card SDK displays.
- Expose cart summary family selection through frontmatter, for example `cart_summary_variant: limos-accordion | demeter-side-cart | olympus-side-cart`.
- Keep payment and express checkout as shared primitives, but expose skin tokens and placeholder/config defaults in frontmatter so individual builds do not patch iframe internals.
- Add a small promo timer include that can be styled by template family and fed by frontmatter duration/copy, while leaving discount math to the SDK.
- Promote this component map into the build skill/template catalog after a few more pass-throughs confirm the variants across real designs.
