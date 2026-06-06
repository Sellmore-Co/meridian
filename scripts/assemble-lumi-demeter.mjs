import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const sourceRoot = "/Users/devin/Developer/designer/funnel-designs/lumi-daily-wellness-set";
const demeterRoot = "/Users/devin/Developer/campaign-cart-starter-templates/src/demeter";
const specPath = path.join(sourceRoot, "campaign-spec-lumi-v0.json");
const outDir = path.join(repoRoot, "src/lumi-v0");
const runtimeDir = path.join(repoRoot, ".campaign-runtime");
const routeRoot = "/lumi-v0";

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const campaign = spec.campaign || {};
const specIdentity = spec.spec_identity || {};

const routes = {
  index: `${routeRoot}/`,
  landing: `${routeRoot}/landing/`,
  checkout: `${routeRoot}/checkout/`,
  upsell: `${routeRoot}/upsell/`,
  upsell2: `${routeRoot}/upsell-2/`,
  receipt: `${routeRoot}/receipt/`,
};

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    content.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").replace(/\n+$/, "") + "\n",
    "utf8"
  );
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function splitFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n/);
  return match ? content.slice(match[0].length) : content;
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(read(filePath)).digest("hex");
}

function rawFrontmatter(title, permalink) {
  return `---
title: "${title}"
permalink: ${permalink}
page_layout: raw.html
---
`;
}

function routeSourceHtml(html, pageType, extraMeta = {}) {
  const metaTags = {
    "next-funnel": "lumi-v0",
    "next-page-type": pageType,
    "next-currency": "USD",
    ...extraMeta,
  };
  const meta = Object.entries(metaTags)
    .map(([name, value]) => `  <meta name="${name}" content="${value}">`)
    .join("\n");
  const runtime = `
  <script src="${routeRoot}/config.js"></script>
${meta}
  <script src="https://cdn.jsdelivr.net/gh/NextCommerceCo/campaign-cart@v0.4.19/dist/loader.js" type="module"></script>
`;

  return html
    .replace(/href="landing\.html"/g, `href="${routes.landing}"`)
    .replace(/href="checkout\.html"/g, `href="${routes.checkout}"`)
    .replace(/href="upsell-1\.html"/g, `href="${routes.upsell}"`)
    .replace(/href="upsell-2\.html"/g, `href="${routes.upsell2}"`)
    .replace(/href="thank-you\.html"/g, `href="${routes.receipt}"`)
    .replace(/src="assets\//g, `src="${routeRoot}/`)
    .replace("</head>", `${runtime}</head>`);
}

function cloneDemeterFamily() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.cpSync(demeterRoot, outDir, { recursive: true });
  fs.cpSync(path.join(sourceRoot, "assets/products"), path.join(outDir, "assets/products"), { recursive: true });

  for (const demoPage of [
    "presell.html",
    "landing.html",
    "upsell-bundle-stepper.html",
    "upsell-bundle-tier-pills.html",
    "upsell-bundle-tier-cards.html",
  ]) {
    fs.rmSync(path.join(outDir, demoPage), { force: true });
  }

  write(path.join(outDir, "_layouts/raw.html"), "{{ content }}");

  write(
    path.join(outDir, "_includes/checkout-header.html"),
    `<section class="checkout-header lumi-checkout-header">
  <div class="container cc-medium">
    <div class="checkout-header__inner">
      <a class="lumi-wordmark" href="{{ 'landing.html' | campaign_link }}" aria-label="Lumi home">
        <span class="lumi-wordmark__dot"></span>
        <span>Lumi</span>
      </a>
      <div class="checkout-header__extras">
        <div class="mg-section tablet-spacer">
          <img loading="lazy" src="{{ 'images/30d.webp' | campaign_asset }}" alt="" class="mg-image">
          <div class="mg-text hide-tablet">30-Day Money-Back Guarantee</div>
          <div class="questions-text">Secure checkout<br>Tracked international shipping</div>
        </div>
      </div>
    </div>
  </div>
</section>`
  );

  const paymentMethodsPath = path.join(outDir, "_includes/payment-methods.html");
  write(paymentMethodsPath, read(paymentMethodsPath).replace(/Use shiping address/g, "Use shipping address"));

  const bumpCheckPath = path.join(outDir, "_includes/bump-check01.html");
  write(
    bumpCheckPath,
    read(bumpCheckPath)
      .replace(
        "{% assign sync_qty = sync_quantity | default: bump.sync_quantity | default: packages.main_package | default: 1 -%}",
        `{% assign sync_qty = sync_quantity -%}
{% if sync_qty == nil %}{% assign sync_qty = bump.sync_quantity %}{% endif -%}
{% if sync_qty == nil %}{% assign sync_qty = packages.main_package | default: 1 %}{% endif -%}`
      )
      .replace(
        'data-next-package-sync="{{ sync_qty }}" data-next-package-id="{{ pkg_id }}"',
        `{% if sync_qty != false and sync_qty != 'false' %}data-next-package-sync="{{ sync_qty }}" {% endif %}data-next-package-id="{{ pkg_id }}"`
      )
  );

  for (const inactiveVariant of [
    "_includes/bump-check02.html",
    "_includes/bump-switch01.html",
    "_includes/upsell-bundle-stepper-offer.html",
    "_includes/upsell-bundle-tier-pills-offer.html",
  ]) {
    fs.rmSync(path.join(outDir, inactiveVariant), { force: true });
  }

  const upsellCardsPath = path.join(outDir, "_includes/upsell-bundle-tier-cards-offer.html");
  write(
    upsellCardsPath,
    read(upsellCardsPath)
      .replace(/Product Title/g, "Lumi add-on")
      .replace(/The standard chunk of Lorem Ipsum/g, "Compact wellness add-on for daily routines")
      .replace(/Contrary to popular belief, Lorem Ipsum/g, "Pairs naturally with your Lumi order")
      .replace(/Lorem Ipsum has been the industry's/g, "Ships together with tracked delivery")
      .replace(/Lorem Ipsum is simply dummy text/g, "No extra checkout form required")
      .replace(/\$49\.99/g, "--")
      .replace(/\$24\.95/g, "--")
      .replace(/<div class="text-xs font-bold"><strike>\+\$4\.95 SHIPPING<\/strike><\/div>/g, "")
      .replace(
        `<div class="upsell-ships-info">
                      <img class="upsell-ships-info__icon" src="{{ 'images/usps.png' | campaign_asset }}" alt="USPS">
                      <p class="upsell-ships-info__text">All orders ship from the USA <img class="upsell-ships-info__flag" src="{{ 'images/united-states-flag-icon.webp' | campaign_asset }}" alt=""> via USPS within 1 business day. A tracking number will be issued to your email.</p>
                    </div>`,
        `<div class="upsell-ships-info">
                      <p class="upsell-ships-info__text">Your add-on ships with your Lumi order. Tracking is sent to your email after dispatch.</p>
                    </div>`
      )
  );
}

function normalizeGeneratedTextFiles(rootDir) {
  const textExts = new Set([".css", ".html", ".js", ".json", ".md", ".svg", ".txt", ".webmanifest", ".xml", ".yml"]);
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!textExts.has(path.extname(entry.name))) continue;
      const original = fs.readFileSync(fullPath, "utf8");
      const normalized = original
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+$/gm, "")
        .replace(/\n+$/, "\n");
      if (normalized !== original) {
        fs.writeFileSync(fullPath, normalized, "utf8");
      }
    }
  }
}

function writeConfig() {
  const config = `// Configure before Campaign Cart SDK loads.
window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: ${JSON.stringify(campaign.campaigns_api_key || "")},
  paymentEnvKey: ${JSON.stringify(campaign.payment_env_key || "")},
  currencyBehavior: "auto",
  storeName: "Lumi",
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
  qa: {
    spec_identity: ${JSON.stringify(specIdentity, null, 4)}
  },
  utmTransfer: { enabled: true, applyToExternalLinks: false, debug: false }
};`;
  write(path.join(outDir, "assets/config.js"), config);
}

function writeBrandCss() {
  write(
    path.join(outDir, "assets/css/lumi-demeter.css"),
    `:root {
  --_text---font-family--primary: "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --_text---font-family--heading: "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --brand--color--primary: #2f8f7e;
  --brand--color--primary-dark: #1f4a47;
  --brand--color--primary-light: #dceee9;
  --brand--color--primary-lighter: #f5faf8;
  --brand--color--cta-primary: #1f4a47;
  --brand--color--surface: #f7faf8;
  --brand--color--foreground: #1a2826;
  --brand--color--border: #dfe9e6;
  --brand--color--text-primary: #1a2826;
  --brand--color--text-secondary: #4a5b58;
  --brand--color--rating-star: #d49b3a;
  --component--color--outline: #2f8f7e;
}

body {
  background: #f8fbf9;
}

.lumi-checkout-header {
  background: #ffffff;
  border-bottom: 1px solid #dfe9e6;
}

.lumi-wordmark {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #1f4a47;
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
  letter-spacing: 0;
}

.lumi-wordmark__dot {
  width: 0.78rem;
  height: 0.78rem;
  border-radius: 999px;
  background: #2f8f7e;
  display: inline-block;
}

.encrypted-banner,
.announcement {
  background: #1f4a47;
  color: #ffffff;
}

.security-banner__text,
.announcement__text {
  color: #ffffff;
}

.button,
.submit-button,
[data-next-upsell-action="add"] {
  background: #2f8f7e;
  border-color: #2f8f7e;
}

.button:hover,
.submit-button:hover,
[data-next-upsell-action="add"]:hover {
  background: #1f4a47;
  border-color: #1f4a47;
}

.os-card.next-selected,
.os-card:has(.next-selected),
.cc-upsell-bundle-tier-grid .os-card.next-selected {
  border-color: #2f8f7e;
  box-shadow: 0 0 0 1px #2f8f7e;
}

.form-section__title,
.cart-box__title,
.display-lg,
.display-xs {
  letter-spacing: 0;
}

.lumi-product-note {
  margin: 0 0 1rem;
  color: #4a5b58;
  font-size: 0.95rem;
  line-height: 1.5;
}

.checkout-layout__right {
  background: #f7faf8;
}

.guarantee-checkout__v2,
.guarantee-section {
  border-color: #dfe9e6;
  background: #ffffff;
}

.upsell-header__offer,
.upsell-header__suboffer {
  color: #1f4a47;
}

.receipt-check {
  color: #2f8f7e;
}`
  );
}

function writeRawMarketingPages() {
  const presell = routeSourceHtml(read(path.join(sourceRoot, "presell.html")), "product");
  const landing = routeSourceHtml(read(path.join(sourceRoot, "landing.html")), "product");

  write(
    path.join(outDir, "index.html"),
    rawFrontmatter("3 Things Hurting Your Air Quality | Lumi", routes.index) + presell
  );
  write(
    path.join(outDir, "landing.html"),
    rawFrontmatter("Lumi Air Purifier - Daily Wellness Set", routes.landing) + landing
  );
}

function checkoutFrontmatter() {
  return `---
title: "Lumi Daily Wellness Set - Checkout"
page_type: checkout
next_url: upsell
meta_tags:
  next-funnel: Lumi v0 Demeter Clone
  next-page-type: checkout
  next-currency: USD
  next-predictive-address: "true"
  next-success-url: ${routes.upsell}
  next-upsell-accept-url: ${routes.upsell}
promo_sale: "default"
cart_summary_variant: "03"
order_bump_variant: "check01"
price_display_variant: "compare-unit-total"
order_bump:
  check01:
    package_id: 2
    sync_quantity: false
    title: "Add the Lumi Odor Vaporizer"
    image_src: "products/odor-vaporizer.png"
    features:
      - "Neutralizes fridge, closet, and entryway odors"
      - "Plug-in, filter-free, and quiet"
      - "25% off when added with code VAPO"
      - "One-time add-on for this checkout"
packages:
  main_package: 1
  prepurchase_1: 2
shipping_methods:
  standard: 2
  free: 1
bundles:
  - id: "bundle-1x"
    quantity: 1
    shipping_method: "standard"
    selected: true
    title_prefix: "1x "
    badge_text: "STARTER"
  - id: "bundle-2x"
    quantity: 2
    shipping_method: "standard"
    title_prefix: "2x "
    badge_text: "POPULAR"
    subtitle_text: "9% off per unit"
  - id: "bundle-3x"
    quantity: 3
    shipping_method: "free"
    title_prefix: "3x "
    badge_text: "BEST VALUE"
    subtitle_text: "20% off per unit"
    total_tone_class: "os-dark"
    shipping_label: "+ Free Shipping"
styles:
  - css/lumi-demeter.css
scripts:
  - js/promo-banner.js
  - js/promo-timer.js
  - js/checkout.js
  - js/checkout-demeter.js
---
`;
}

function writeCheckout() {
  let body = splitFrontmatter(read(path.join(demeterRoot, "checkout.html")));
  body = body
    .replace(
      "{% campaign_include 'payment-methods.html' show_paypal=true show_klarna=true show_apple_pay=true show_google_pay=true %}",
      "{% campaign_include 'payment-methods.html' show_paypal=false show_klarna=false show_apple_pay=true show_google_pay=true %}"
    )
    .replace(/Select Your Bundle/g, "Choose Your Lumi Bundle")
    .replace(/Where do we send your Product\?/g, "Where should we send your Lumi set?")
    .replace(/90 Day Money-Back Guarantee/g, "30-Day Money-Back Guarantee")
    .replace(/90 Day <span class="text-break">Money Back Guarantee<\/span>/g, "30 Day <span class=\"text-break\">Money Back Guarantee</span>")
    .replace(/images\/90d\.webp/g, "images/30d.webp")
    .replace(/90-day money-back guarantee/g, "30-day money-back guarantee")
    .replace(/90 days/g, "30 days")
    .replace(/90-day/g, "30-day")
    .replace(/Love it or get your money back with our 30-day money-back guarantee\. If you're not WOW'ed by the results you can get a full refund—no questions asked\./g, "Not feeling the difference? Return within 30 days for a full refund.")
    .replace(/Feel safe knowing you're protected\. Try it risk-free and return it within 30 days for a full refund or replacement—no questions asked\./g, "Try Lumi for 30 days. If it does not fit your routine, send it back for a refund.");
  write(path.join(outDir, "checkout.html"), checkoutFrontmatter() + body);
}

function upsellFrontmatter({ title, packageId, nextUrl, declineUrl, acceptText, declineText, productImage }) {
  return `---
title: "${title}"
page_type: upsell
next_url: ${nextUrl}
decline_url: ${declineUrl}
meta_tags:
  next-funnel: Lumi v0 Demeter Clone
  next-page-type: upsell
  next-currency: USD
  next-prevent-back-navigation: "true"
  next-upsell-accept-url: ${nextUrl}
  next-upsell-decline-url: ${declineUrl}
styles:
  - https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css
  - css/lumi-demeter.css
scripts:
  - https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js
  - js/upsells.js
upsell_offer:
  package_id: ${packageId}
  selector_id: "upsell-bundle"
  display_selector_id: "upsell-bundle-1x"
  display_bundle_id: "upsell-bundle-1x-card"
  header_discount_selector_id: "upsell-bundle-1x"
  accept_text: "${acceptText}"
  decline_text: "${declineText}"
upsell_bundle_tiers:
  - id: "upsell-bundle-1x"
    items_json: '[{"packageId":${packageId},"quantity":1}]'
    vouchers_json: '[]'
    selected: true
    label: "Buy 1"
    hint: "1 unit"
  - id: "upsell-bundle-2x"
    items_json: '[{"packageId":${packageId},"quantity":2}]'
    vouchers_json: '[]'
    label: "Buy 2"
    hint: "2 units"
  - id: "upsell-bundle-3x"
    items_json: '[{"packageId":${packageId},"quantity":3}]'
    vouchers_json: '[]'
    label: "Buy 3"
    hint: "3 units"
swiper_slides:
  - src: "${productImage}"
    alt: ""
  - src: "${productImage}"
    alt: ""
  - src: "${productImage}"
    alt: ""
swiper_thumbs:
  - src: "${productImage}"
    alt: ""
  - src: "${productImage}"
    alt: ""
  - src: "${productImage}"
    alt: ""
---
`;
}

function localizeUpsellShell(body) {
  return body
    .replace(
      "    - Per-tier vouchers: 1× UP50; 2× UP60; 3× UP70 (template example — create codes in Campaigns).",
      "    - Voucher-free Lumi dogfood tiers; pricing comes from Campaigns API."
    )
    .replace(
      '<div class="upsell-header__offer">Special Discount: Add the <span data-next-display="{{ upsell_package_name_path }}">Product Title</span> to your order</div>',
      '<div class="upsell-header__offer">Add <span data-next-display="{{ upsell_package_name_path }}">your Lumi add-on</span> to this order</div>'
    );
}

function writeUpsellPages() {
  let body = localizeUpsellShell(splitFrontmatter(read(path.join(demeterRoot, "upsell-bundle-tier-cards.html"))));
  body = body
    .replace(/Wait! Your Order Isn't Complete/g, "Wait! Your Lumi order can do more")
    .replace(/Special Offer Unlocked - Do Not Close This Page/g, "Special Offer Unlocked - Do Not Close This Page")
    .replace(/Save up to <span data-next-display="{{ upsell_display_discount_path }}" data-next-format="percentage"><\/span> on the <span data-next-display="{{ upsell_package_name_path }}">Product Title<\/span> Today!<br>/g, "Add one more wellness tool while your order is still open.<br>")
    .replace(/The standard chunk of Lorem Ipsum/g, "Daily recovery support for tired feet")
    .replace(/Contrary to popular belief, Lorem Ipsum/g, "Compact design for under-desk use")
    .replace(/Lorem Ipsum has been the industry's/g, "Pairs naturally with evening air-care routines")
    .replace(/Lorem Ipsum is simply dummy text/g, "Ships with your Lumi order");
  write(
    path.join(outDir, "upsell.html"),
    upsellFrontmatter({
      title: "Add the Lumi Foot Massager",
      packageId: 3,
      nextUrl: routes.upsell2,
      declineUrl: routes.upsell2,
      acceptText: "Yes, add the Foot Massager",
      declineText: "No thanks, continue to the next offer",
      productImage: "products/foot-massager.png",
    }) + body
  );

  body = localizeUpsellShell(splitFrontmatter(read(path.join(demeterRoot, "upsell-bundle-tier-cards.html"))));
  body = body
    .replace(/Wait! Your Order Isn't Complete/g, "Last chance to complete your Lumi kitchen reset")
    .replace(/Special Offer Unlocked - Do Not Close This Page/g, "Final One-Time Offer - Do Not Close This Page")
    .replace(/Save up to <span data-next-display="{{ upsell_display_discount_path }}" data-next-format="percentage"><\/span> on the <span data-next-display="{{ upsell_package_name_path }}">Product Title<\/span> Today!<br>/g, "Add a compact produce cleaner before your receipt is generated.<br>")
    .replace(/The standard chunk of Lorem Ipsum/g, "Helps rinse produce before fridge storage")
    .replace(/Contrary to popular belief, Lorem Ipsum/g, "Small countertop footprint")
    .replace(/Lorem Ipsum has been the industry's/g, "Useful for fruit, herbs, and vegetables")
    .replace(/Lorem Ipsum is simply dummy text/g, "Ships with your Lumi order");
  write(
    path.join(outDir, "upsell-2.html"),
    upsellFrontmatter({
      title: "Add the Lumi Fruit and Veg Cleaner",
      packageId: 4,
      nextUrl: routes.receipt,
      declineUrl: routes.receipt,
      acceptText: "Yes, add the Veg Cleaner",
      declineText: "No thanks, show my receipt",
      productImage: "products/veg-cleaner.png",
    }) + body
  );
}

function writeReceipt() {
  let body = splitFrontmatter(read(path.join(demeterRoot, "receipt.html")));
  body = body
    .replace(
      /<div class="checkout__header-brand cc-shop"><img src="{{ 'images\/next-logo\.png' \| campaign_asset }}" loading="eager" alt="{{ campaign\.store_name }}" class="brand-logo"><\/div>/,
      `<div class="checkout__header-brand cc-shop"><a class="lumi-wordmark" href="{{ 'landing.html' | campaign_link }}" aria-label="Lumi home"><span class="lumi-wordmark__dot"></span><span>Lumi</span></a></div>`
    )
    .replace(/You’ll get a confirmation email with your order number soon\./g, "You will get a confirmation email with your order number soon.");
  const frontmatter = `---
title: "Lumi - Receipt"
page_type: receipt
meta_tags:
  next-funnel: Lumi v0 Demeter Clone
  next-page-type: receipt
styles:
  - css/lumi-demeter.css
receipt_summary:
  title: "Order Summary"
  scroll_hint: "Scroll for more items"
  mobile_item_template_id: "order-item-template-mobile"
  desktop_item_template_id: "order-item-template-desktop"
---
`;
  write(path.join(outDir, "receipt.html"), frontmatter + body);
}

function updateCampaignsJson() {
  const campaignsPath = path.join(repoRoot, "_data/campaigns.json");
  const campaigns = JSON.parse(read(campaignsPath));
  const lumiCampaign = {
    name: "Lumi v0",
    description: "Keer dogfood - Lumi daily wellness funnel rebuilt from Demeter commerce-page clones.",
    entry_url: "",
    sdk_version: "0.4.19",
    store_name: "Lumi",
    store_url: "https://keer.29next.store/",
    store_terms: campaign.store_terms || "",
    store_privacy: campaign.store_privacy || "",
    store_contact: campaign.store_contact || "",
    store_returns: campaign.store_returns || "",
    store_shipping: campaign.store_shipping || "",
    store_phone: campaign.store_phone || "",
    gtm_id: "",
    fb_pixel_id: "",
  };
  if (campaign.store_phone_tel) {
    lumiCampaign.store_phone_tel = campaign.store_phone_tel;
  }
  campaigns["lumi-v0"] = lumiCampaign;
  write(campaignsPath, JSON.stringify(campaigns, null, 2));
}

function updateRuntimeArtifacts() {
  fs.mkdirSync(runtimeDir, { recursive: true });
  const now = new Date().toISOString();
  const specHash = sha256File(specPath);
  const setupHandoff = {
    schema_version: "campaign-runtime-setup-handoff/v0",
    status: "completed",
    template_family: "demeter",
    source: path.relative(repoRoot, sourceRoot),
    outputs: [
      "src/lumi-v0/",
      "src/lumi-v0/_includes/",
      "src/lumi-v0/_layouts/",
      "src/lumi-v0/assets/",
    ],
    notes: [
      "Copied Demeter as an atomic page-kit family slice.",
      "Presell/landing use prepared Lumi source HTML; checkout, upsells, and receipt use Demeter commerce-page clones.",
    ],
    generated_at: now,
  };
  write(path.join(runtimeDir, "setup-handoff.json"), JSON.stringify(setupHandoff, null, 2));

  const contextPath = path.join(runtimeDir, "build-context.json");
  const context = fs.existsSync(contextPath) ? JSON.parse(read(contextPath)) : {};
  Object.assign(context, {
    schema_version: context.schema_version || "campaign-runtime-build-context/v0",
    status: "assembled_demeter_clone_pending_qa",
    updated_at: now,
    source_adapter: "hybrid_lumi_source_plus_demeter_commerce_clone",
    template: { family: "demeter", locked: true },
    assembly: {
      status: "completed_with_warnings",
      script: "scripts/assemble-lumi-demeter.mjs",
      built_routes: Object.values(routes),
      notes: [
        "Demeter commerce pages cloned structurally; no free-form checkout/payment/bump/order-summary reconstruction.",
        "Unsupported PayPal/Klarna payment methods removed from the Demeter payment include invocation.",
        "Order bump remains opt-in and uses canonical Demeter package-toggle structure.",
        "Generated config from CampaignSpec runtime keys; do not print raw keys in reports.",
      ],
    },
  });
  write(contextPath, JSON.stringify(context, null, 2));

  const reportPath = path.join(runtimeDir, "assembly-report.json");
  const report = fs.existsSync(reportPath) ? JSON.parse(read(reportPath)) : {};
  Object.assign(report, {
    schema_version: report.schema_version || "campaign-runtime-assembly-report/v0",
    status: "assembled_demeter_clone_pending_qa",
    updated_at: now,
    identity: {
      map_id: specIdentity.map_id || "lumi-v0-qdos",
      public_route_slug: "lumi-v0",
      campaign_directory: "lumi-v0",
      live_url_path: `${routeRoot}/`,
      spec_hash: specHash,
    },
    template_family: "demeter",
    stages: {
      ...(report.stages || {}),
      setup: {
        stage: "setup",
        status: "completed",
        inputs: [demeterRoot],
        outputs: ["src/lumi-v0/"],
        commands: ["node scripts/assemble-lumi-demeter.mjs"],
        blockers: [],
        warnings: [],
      },
      assembly: {
        stage: "assembly",
        status: "completed_with_warnings",
        inputs: [
          "scripts/assemble-lumi-demeter.mjs",
          "campaign-runtime.build.json",
          path.relative(repoRoot, specPath),
          path.relative(repoRoot, sourceRoot),
          demeterRoot,
        ],
        outputs: [
          "src/lumi-v0/index.html",
          "src/lumi-v0/landing.html",
          "src/lumi-v0/checkout.html",
          "src/lumi-v0/upsell.html",
          "src/lumi-v0/upsell-2.html",
          "src/lumi-v0/receipt.html",
          "src/lumi-v0/assets/config.js",
          "src/lumi-v0/assets/css/lumi-demeter.css",
          "_data/campaigns.json",
        ],
        commands: ["node scripts/assemble-lumi-demeter.mjs"],
        blockers: [],
        warnings: [
          "Typed-card order proof remains gated until operator-approved order path/count and deployed SDK origin allowlist confirmation.",
          "Design polish is intentionally light; this branch is testing template-clone runtime fidelity.",
        ],
      },
    },
    warnings: [
      {
        code: "DEMETER_COMMERCE_CLONE_EXPERIMENT",
        stage: "assembly",
        message: "Checkout, upsell, and receipt pages preserve Demeter commerce component DOM/classes instead of reconstructing SDK surfaces from custom HTML.",
      },
      {
        code: "TYPED_CARD_ORDER_PROOF_GATED",
        stage: "qa",
        message: "Do not run qa --test-order until operator approves order count/path depth and deployed SDK origin allowlist is confirmed.",
      },
    ],
    next: {
      stage: "local_build_and_qa",
      owner: "Sellmore-Co/meridian branch lumi-v1-demeter-dogfood",
      action: "Run page-kit build, Campaigns OS doctor, local browser QA, then push a draft PR for preview QA.",
    },
    evidence: [
      "Demeter family copied atomically, including pages, includes, layouts, assets/css, and assets/js.",
      "Prepared Lumi presell/landing source HTML retained as marketing pages.",
      "Checkout, upsell, and receipt pages rebuilt from Demeter commerce-ready templates.",
      "Canonical Demeter payment-methods, editorial-tier-selector, bump-check01, cart-summary03, upsell bundle tier card, and receipt summary surfaces are preserved.",
    ],
  });
  write(reportPath, JSON.stringify(report, null, 2));
}

cloneDemeterFamily();
writeConfig();
writeBrandCss();
writeRawMarketingPages();
writeCheckout();
writeUpsellPages();
writeReceipt();
normalizeGeneratedTextFiles(outDir);
updateCampaignsJson();
updateRuntimeArtifacts();

console.log(JSON.stringify({
  status: "assembled_demeter_clone_pending_qa",
  route: `${routeRoot}/`,
  template_family: "demeter",
  commerce_pages: ["checkout.html", "upsell.html", "upsell-2.html", "receipt.html"],
}, null, 2));
