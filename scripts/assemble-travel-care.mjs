import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const sourceRoot = "/Users/devin/Developer/designer/funnel-designs/travel-oral-care-bundle";
const limosRoot = "/Users/devin/Developer/campaign-cart-starter-templates/src/limos";
const specPath = "/Users/devin/Downloads/campaign-spec-travel-oral-care-bundle-tez (1).json";
const outDir = path.join(repoRoot, "src/travel-care");
const assetOut = path.join(outDir, "assets");
const routeRoot = "/travel-care";

const routes = {
  presell: `${routeRoot}/presell/`,
  landing: `${routeRoot}/landing/`,
  checkout: `${routeRoot}/checkout/`,
  upsell1: `${routeRoot}/oto-sonic/`,
  upsell2: `${routeRoot}/oto-kit/`,
  receipt: `${routeRoot}/receipt/`,
};

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const apiKey = spec.campaign?.campaigns_api_key;
const paymentEnvKey = spec.campaign?.payment_env_key;
const specIdentity = spec.spec_identity || {};

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function frontmatter({ title, permalink, pageLayout = "raw.html" }) {
  return `---\ntitle: "${title}"\npermalink: ${permalink}\npage_layout: ${pageLayout}\n---\n`;
}

function rootAssets(html) {
  return html
    .replace(/(href|src)="assets\//g, `$1="${routeRoot}/`)
    .replace(/srcset="assets\//g, `srcset="${routeRoot}/`)
    .replace(/srcset="images\//g, `srcset="${routeRoot}/landing/images/`)
    .replace(/campaign-cart@v0\.4\.x/g, "campaign-cart@v0.4.20")
    .replace(/href="landing\.html"/g, `href="${routes.landing}"`)
    .replace(/href="checkout\.html"/g, `href="${routes.checkout}"`)
    .replace(/href="upsell-1\.html"/g, `href="${routes.upsell1}"`)
    .replace(/href="upsell-2\.html"/g, `href="${routes.upsell2}"`)
    .replace(/href="thank-you\.html"/g, `href="${routes.receipt}"`)
    .replace(/content="upsell-1\.html"/g, `content="${routes.upsell1}"`)
    .replace(/content="upsell-2\.html"/g, `content="${routes.upsell2}"`)
    .replace(/content="thank-you\.html"/g, `content="${routes.receipt}"`)
    .replace(/content="travel-oral-care-bundle"/g, `content="travel-care"`);
}

function ensureMeta(html, pageType, extraTags) {
  const pageTypeTag = `<meta name="next-page-type" content="${pageType}">`;
  if (!html.includes(pageTypeTag)) {
    html = html.replace("</head>", `  ${pageTypeTag}\n</head>`);
  }
  const tags = extraTags
    .filter(([name]) => !html.includes(`name="${name}"`))
    .map(([name, value]) => `  <meta name="${name}" content="${value}">`)
    .join("\n");
  if (!tags) return html;
  return html.replace(pageTypeTag, `${pageTypeTag}\n${tags}`);
}

function splitFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n[\s\S]*?\n---\n/);
  return match ? fileContent.slice(match[0].length) : fileContent;
}

function cloneLimosSlice() {
  fs.cpSync(path.join(limosRoot, "_includes"), path.join(outDir, "_includes"), { recursive: true });
  fs.cpSync(path.join(limosRoot, "_layouts"), path.join(outDir, "_layouts"), { recursive: true });
  fs.cpSync(path.join(limosRoot, "assets"), assetOut, { recursive: true });
  write(path.join(outDir, "_layouts/raw.html"), "{{ content }}\n");

  write(
    path.join(outDir, "_includes/checkout-header.html"),
    `<section class="checkout-header checkout-header--lg ds-checkout-header">
  <div class="container cc-medium">
    <div class="checkout-header__inner">
      <a class="checkout-header__brand" href="{{ 'landing.html' | campaign_link }}" aria-label="DentaStream home">
        <span class="ds-wordmark" aria-label="DentaStream"><span>Denta</span><strong>Stream</strong></span>
      </a>
      <div class="checkout-header__extras">
        <div class="ds-secure-copy">Secure Checkout &middot; 30-Day Money-Back Guarantee</div>
      </div>
    </div>
  </div>
</section>
`
  );

  const paymentMethodsPath = path.join(outDir, "_includes/payment-methods.html");
  write(
    paymentMethodsPath,
    fs.readFileSync(paymentMethodsPath, "utf8").replace(/Use shiping address/g, "Use shipping address")
  );

  const bumpCheck01Path = path.join(outDir, "_includes/bump-check01.html");
  write(
    bumpCheck01Path,
    fs.readFileSync(bumpCheck01Path, "utf8").replace(
      "{% assign sync_qty = sync_quantity | default: bump.sync_quantity | default: packages.main_package | default: 1 -%}",
      `{% assign sync_qty = sync_quantity -%}
{% if sync_qty == nil %}{% assign sync_qty = bump.sync_quantity %}{% endif -%}
{% if sync_qty == nil %}{% assign sync_qty = packages.main_package | default: 1 %}{% endif -%}`
    ).replace(
      'data-next-package-sync="{{ sync_qty }}" data-next-package-id="{{ pkg_id }}"',
      `{% if sync_qty != false and sync_qty != 'false' %}data-next-package-sync="{{ sync_qty }}" {% endif %}data-next-package-id="{{ pkg_id }}"`
    )
  );

  const exitIntentInclude = fs.readFileSync(path.join(outDir, "_includes/exit-intent-popup.html"), "utf8");
  write(
    path.join(outDir, "_includes/exit-intent-popup.html"),
    exitIntentInclude
      .replace("https://placehold.co/400x500", `{{ 'products/water-flosser-banner.png' | campaign_asset }}`)
      .replace(/Apply My Discount Coupon/g, "Apply EXIT10")
  );

  write(
    path.join(assetOut, "js/checkout-limos.js"),
    `window.addEventListener("next:initialized", function () {
  initExitIntentTemplate("exit-intent");
});
`
  );
}

function checkoutFrontmatter() {
  return `---
title: "DentaStream Travel Oral Care - Checkout"
page_type: checkout
permalink: ${routes.checkout}
next_url: upsell-1.html
next_currency: USD
predictive_address: true
meta_tags:
  next-funnel: travel-care
  next-success-url: ${routes.upsell1}
  next-page-type: checkout
  next-currency: USD
  next-predictive-address: "true"
order_bump_variant: "check01"
single_offer:
  selector_id: "main"
  bundle_id: "water-flosser-main"
  package_id: 1
  shipping_method: "standard"
  quantity: 1
  quantity_min: 1
  quantity_max: 3
  show_quantity_stepper: false
  image_src: "products/water-flosser.png"
  offer_label: "TRAVEL ORAL CARE BUNDLE"
  offer_suffix: " - TODAY'S CHECKOUT"
  price_display_variant: "line-total"
order_bump:
  check01:
    package_id: 2
    sync_quantity: false
    title: "Add the UV Toothbrush Sanitizer Case"
    image_src: "products/uv-case.png"
    features:
      - "USB-rechargeable case for travel days"
      - "Kills surface bacteria on your brush head"
      - "Compact case keeps your brush spotless on the go"
packages:
  main_package: 1
  prepurchase_1: 2
shipping_methods:
  standard: 1
styles:
  - css/exit-intent-popup.css
  - css/travel-care-checkout.css
scripts:
  - js/checkout.js
  - js/checkout-limos.js
body_class: "travel-care-checkout"
---
`;
}

function transformCheckout() {
  const raw = fs.readFileSync(path.join(limosRoot, "checkout.html"), "utf8");
  let html = splitFrontmatter(raw);
  let featureDescriptionIndex = 0;
  const featureDescriptions = [
    "Take DentaStream on the road for 30 days. If it is not right for your routine, send it back for a refund.",
    "Compact essentials ship quickly from our Ohio warehouse for easier travel prep.",
    "Travel-sized oral care kits built for carry-ons, toiletry bags, and everyday routines away from home.",
  ];

  html = html
    .replace(/\s*<div data-next-hide="param\.banner=='n'" class="section_header">[\s\S]*?<\/div>\n\s*/m, "\n")
    .replace(/\s*<promo-timer[^>]*><\/promo-timer>\n?/g, "")
    .replace(
      "{% campaign_include 'payment-methods.html' show_paypal=true show_klarna=true show_apple_pay=true show_google_pay=true %}",
      "{% campaign_include 'payment-methods.html' show_paypal=false show_klarna=false show_apple_pay=true show_google_pay=true %}"
    )
    .replace(/Ready Walker/g, "DentaStream Water Flosser")
    .replace(/Where do we send your Product\?/g, "Where should we send your oral care bundle?")
    .replace(/We stand by our product 100%\. Return your DentaStream Water Flosser within 30 days if you’re not satisfied for a refund - no questions asked\./g, "Take DentaStream on the road for 30 days. If it is not right for your routine, send it back for a refund.")
    .replace(/289,432\+ Orders/g, "50,000+ Travel Kits")
    .replace(/The Quality Promise/g, "Why DentaStream travels well")
    .replace(/High Demand:<\/span> 62 people are looking at this offer!/g, "High Demand:</span> 62 travelers are looking at this bundle!")
    .replace(/AMAZING!/g, "TRAVEL-READY")
    .replace(/I was nervous it might feel flimsy, but despite being impressively lightweight, this cane has proven rock-solid\. No wobble, no worries\./g, "The flosser is compact enough for my carry-on and strong enough to feel like my full-size setup at home.")
    .replace(/John U\./g, "Maya R.")
    .replace(/Don't Miss Out on this Exclusive Offer/g, "Take EXIT10 before you go")
    .replace(/Save a further <strong>10% Off<\/strong>/g, "Save an extra <strong>10% off</strong>")
    .replace(/This extra <strong>10% off<\/strong> coupon could disappear any time!/g, "Apply EXIT10 to this checkout before you leave.")
    .replace(/Apply My Discount Coupon/g, "Apply EXIT10");

  html = html.replace(
    /<div class="checkout-features__item-description hide-tablet">Take DentaStream on the road for 30 days\. If it is not right for your routine, send it back for a refund\.<\/div>/g,
    () => `<div class="checkout-features__item-description hide-tablet">${featureDescriptions[featureDescriptionIndex++ % featureDescriptions.length]}</div>`
  );

  html = html.replace(
    `<img loading="lazy" src="{{ 'images/Group-120.svg' | campaign_asset }}" alt="" class="credit-card__flags">`,
    `<div class="ds-payment-flags" aria-label="Accepted payment methods">
                    <img loading="lazy" src="{{ 'images/cc-visa.svg' | campaign_asset }}" alt="Visa">
                    <img loading="lazy" src="{{ 'images/cc_master.svg' | campaign_asset }}" alt="Mastercard">
                    <img loading="lazy" src="{{ 'images/cc_amex.svg' | campaign_asset }}" alt="American Express">
                    <img loading="lazy" src="{{ 'images/cc_discover.svg' | campaign_asset }}" alt="Discover">
                    <img loading="lazy" src="{{ 'images/apple-pay-logo.svg' | campaign_asset }}" alt="Apple Pay">
                    <img loading="lazy" src="{{ 'images/google-pay-logo.svg' | campaign_asset }}" alt="Google Pay">
                  </div>`
  );

  html = html.replace(
    '<div class="main-wrapper">',
    '<div class="main-wrapper">\n        <div class="ds-shipping-strip">Quick &amp; convenient shipping from our Ohio warehouse</div>'
  );

  return checkoutFrontmatter() + html.replace(/[ \t]+$/gm, "");
}

function transformUpsell1(html) {
  return ensureMeta(rootAssets(html), "upsell", [
    ["next-currency", "USD"],
    ["next-prevent-back-navigation", "true"],
  ])
    .replace(/packageId":6/g, 'packageId":3')
    .replace(/package\.6/g, "package.3")
    .replace(/data-next-package-id="6"/g, 'data-next-package-id="3"')
    .replace(/30%<\/span> off/g, "70%</span> off")
    .replace(/\$29\.99/g, "$34.99")
    .replace(/\$39\.99/g, "$69.99")
    .replace(/\$47\.99/g, "$55.98")
    .replace(/\$79\.98/g, "$139.98")
    .replace(/\$59\.99/g, "$62.97")
    .replace(/\$119\.97/g, "$209.97");
}

function transformUpsell2(html) {
  return ensureMeta(rootAssets(html), "upsell", [["next-currency", "USD"]])
    .replace(/packageId":7/g, 'packageId":4')
    .replace(/package\.7/g, "package.4")
    .replace(/data-next-bundle-vouchers='\["UP50"\]'/g, 'data-next-bundle-vouchers=\'["UVKIT"]\'')
    .replace(/data-next-bundle-vouchers='\["UP60"\]'/g, 'data-next-bundle-vouchers=\'["UVKIT"]\'')
    .replace(/data-next-bundle-vouchers='\["UP70"\]'/g, 'data-next-bundle-vouchers=\'["UVKIT"]\'')
    .replace(/30%<\/span> off/g, "50%</span> off")
    .replace(/\$24\.99/g, "__UVKIT_DISCOUNT_PRICE__")
    .replace(/\$34\.99/g, "$69.98")
    .replace(/__UVKIT_DISCOUNT_PRICE__/g, "$34.99");
}

function writeConfig() {
  write(path.join(assetOut, "config.js"), `// Configure before Campaign Cart SDK loads.
window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: "${apiKey}",
  paymentEnvKey: "${paymentEnvKey}",
  currencyBehavior: "auto",
  paymentConfig: {
    expressCheckout: {
      enabled: true,
      requireValidation: true,
      requiredFields: ["email", "fname", "lname"],
      methodOrder: ["apple_pay", "google_pay"]
    }
  },
  addressConfig: {
    enableAutocomplete: true,
    dontShowStates: ["AS", "GU", "PR", "VI"]
  },
  googleMaps: { apiKey: "", region: "US" },
  analytics: {
    enabled: true,
    mode: "auto",
    providers: {
      nextCampaign: { enabled: true },
      gtm: { enabled: false, settings: { containerId: "", dataLayerName: "dataLayer" } },
      facebook: { enabled: false, settings: { pixelId: "" } },
      rudderstack: { enabled: false, settings: {} },
      custom: { enabled: false, settings: {} }
    }
  },
  storeName: "DentaStream",
  qa: {
    spec_identity: ${JSON.stringify(specIdentity, null, 4).replace(/\n/g, "\n    ")}
  },
  utmTransfer: { enabled: true, applyToExternalLinks: false, debug: false }
};
`);
}

function writeCheckoutSkin() {
  write(path.join(assetOut, "css/travel-care-checkout.css"), `
:root {
  --brand--color--primary: #2cbead;
  --brand--color--primary-light: #dcf7f4;
  --brand--color--accent: #ffb44c;
  --brand--color--black: #172033;
  --brand--color--dark: #172033;
  --radius--cards: 12px;
}

body.travel-care-checkout {
  background: #f5f8fb;
  color: #172033;
}

.ds-shipping-strip {
  background: #152238;
  color: #fff;
  font-size: 0.93rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  padding: 0.65rem 1rem;
  text-align: center;
}

.ds-checkout-header {
  background: #fff;
  border-bottom: 1px solid #dfe6ee;
}

.checkout-header__brand {
  text-decoration: none;
}

.ds-wordmark {
  color: #172033;
  display: inline-flex;
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
}

.ds-wordmark strong {
  color: #2cbead;
  font-weight: 900;
}

.ds-secure-copy {
  color: #687386;
  font-size: 0.92rem;
  font-weight: 700;
}

.checkout-main,
.checkout-layout__sidebar-bg {
  background: #f5f8fb;
}

.checkout-wrapper,
.order-summary--card,
.form-sections--floating,
.checkout-bundle-offer,
.bump-card,
.payment-method {
  border-color: #dce5ee;
}

.checkout-package,
.payment-method.next-selected,
.payment-method__form,
.bump-card {
  border-radius: 12px;
}

.checkout__package-card-header,
.submit-button,
.exit-intent-popup__cta {
  background: #2cbead;
}

.checkout__package-card-header,
.submit-button,
.exit-intent-popup__cta {
  color: #fff;
}

.checkout__package-media-wrapper,
.bump__image-wrapper,
.cart-item__image-container {
  background: #eefbf9;
}

.checkout__package-media,
.bump__image {
  object-fit: contain;
}

.bump-card {
  background: #fff8e6;
  border-color: #ffb44c;
}

.bump__checkbox {
  border-color: #2cbead;
}

.bump-card:not(.next-active):not(.next-selected):not(.os--active) .checkbox__icon {
  opacity: 0;
}

.bump-card.next-active .checkbox__icon,
.bump-card.next-selected .checkbox__icon,
.bump-card.os--active .checkbox__icon {
  opacity: 1;
}

.exit-intent-popup__dialog {
  border-radius: 18px;
  overflow: hidden;
}

.exit-intent-popup__header h3,
.exit-intent-popup__header h4 {
  color: #172033;
}

.exit-intent-popup__offer-label {
  color: #159e8c;
}

.ds-payment-flags {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
}

.ds-payment-flags img {
  display: block;
  max-height: 18px;
  width: auto;
}

@media (max-width: 767px) {
  .ds-secure-copy {
    display: none;
  }

  .ds-wordmark {
    font-size: 1.5rem;
  }
}
`);
}

function updateCampaignsJson() {
  const campaignsPath = path.join(repoRoot, "_data/campaigns.json");
  const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));
  campaigns["travel-care"] = {
    name: "DentaStream Travel Care",
    description: "SELL-284 Campaigns OS dogfood build from Map travel-oral-care-bundle-tez-1td7 with EXIT10 checkout exit intent.",
    entry_url: "",
    sdk_version: "0.4.20",
    store_name: "Keer",
    store_url: "https://keer.29next.store/",
    store_terms: "",
    store_privacy: "",
    store_contact: "",
    store_returns: "",
    store_shipping: "",
    store_phone: "",
    store_phone_tel: "",
    gtm_id: "",
    fb_pixel_id: "",
  };
  write(campaignsPath, `${JSON.stringify(campaigns, null, 2)}\n`);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.cpSync(path.join(sourceRoot, "assets"), assetOut, { recursive: true });
cloneLimosSlice();

const pages = [
  ["presell.html", "presell.html", "DentaStream Water Flosser - Presell", routes.presell, (html) => ensureMeta(rootAssets(html), "product", [])],
  ["landing.html", "landing.html", "DentaStream Water Flosser", routes.landing, (html) => ensureMeta(rootAssets(html), "product", [["next-currency", "USD"]])],
  ["upsell-1.html", "upsell-1.html", "DentaStream Sonic Toothbrush Offer", routes.upsell1, transformUpsell1],
  ["upsell-2.html", "upsell-2.html", "DentaStream Whitening Kit Offer", routes.upsell2, transformUpsell2],
  ["thank-you.html", "receipt.html", "DentaStream Order Confirmation", routes.receipt, rootAssets],
];

for (const [sourceName, outputName, title, permalink, transform] of pages) {
  const raw = fs.readFileSync(path.join(sourceRoot, sourceName), "utf8");
  write(path.join(outDir, outputName), frontmatter({ title, permalink }) + transform(raw));
}

write(path.join(outDir, "checkout.html"), transformCheckout());
writeConfig();
writeCheckoutSkin();
updateCampaignsJson();

console.log(`Assembled ${pages.length + 1} travel-care pages into ${outDir}`);
