import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const sourceRoot = "/Users/devin/Developer/designer/funnel-designs/travel-oral-care-bundle";
const specPath = "/Users/devin/Downloads/campaign-spec-travel-oral-care-bundle-tez.json";
const outDir = path.join(repoRoot, "src/travel-care");
const assetOut = path.join(outDir, "assets");
const routeRoot = "/travel-care/try.dogfoodprep/waterflosser";

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

function frontmatter({ title, permalink }) {
  return `---\ntitle: "${title}"\npermalink: ${permalink}\n---\n`;
}

function rootAssets(html) {
  return html
    .replace(/(href|src)="assets\//g, `$1="/travel-care/`)
    .replace(/campaign-cart@v0\.4\.x/g, "campaign-cart@v0.4.20")
    .replace(/href="landing\.html"/g, `href="${routes.landing}"`)
    .replace(/href="checkout\.html"/g, `href="${routes.checkout}"`)
    .replace(/href="upsell-1\.html"/g, `href="${routes.upsell1}"`)
    .replace(/href="upsell-2\.html"/g, `href="${routes.upsell2}"`)
    .replace(/href="thank-you\.html"/g, `href="${routes.receipt}"`)
    .replace(/content="upsell-1\.html"/g, `content="${routes.upsell1}"`)
    .replace(/content="upsell-2\.html"/g, `content="${routes.upsell2}"`)
    .replace(/content="thank-you\.html"/g, `content="${routes.receipt}"`);
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

function removePaypal(html) {
  const start = html.indexOf('\n            <div data-next-payment-method="paypal"');
  if (start === -1) return html;
  const endMarker = "\n            </div>";
  const end = html.indexOf(endMarker, start + 1);
  if (end === -1) return html;
  return html.slice(0, start) + html.slice(end + endMarker.length);
}

function addCheckoutMainOffer(html) {
  const marker = "        <!-- ORDER BUMP: UV Toothbrush Case (package 2) -->";
  if (!html.includes(marker)) return html;
  const mainOffer = `        <div class="ds-card" data-next-catalog-component="single-offer-quantity-selector" data-next-await>
          <h2 class="ds-h2">Your Water Flosser bundle</h2>
          <p class="ds-muted" style="margin-top:-0.35rem;">DentaStream Water Flosser, selected for this checkout.</p>
          <div data-next-bundle-selector data-next-selector-id="main" data-next-selection-mode="swap" data-next-include-shipping="true">
            <div data-next-bundle-card data-next-bundle-id="water-flosser-main" data-next-shipping-id="1" data-next-bundle-items='[{"packageId":1,"quantity":1}]' data-next-selected="true" class="ds-main-offer">
              <div data-next-package-id="1" class="ds-main-offer__inner">
                <img src="/travel-care/products/water-flosser.png" alt="DentaStream Water Flosser" class="ds-main-offer__img">
                <div>
                  <div class="ds-main-offer__title" data-next-display="package.1.name">DentaStream Water Flosser</div>
                  <p class="ds-main-offer__desc">Compact cordless flosser for cleaner travel days.</p>
                </div>
                <div class="ds-main-offer__price">
                  <span data-next-bundle-display="originalPrice">$99.98</span>
                  <strong data-next-bundle-display="price">$49.99</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

`;
  return html.replace(marker, mainOffer + marker);
}

function addExitIntent(html) {
  if (html.includes('data-template="exit-intent"')) return html;
  const template = `
<template data-template="exit-intent">
  <div class="ds-exit-pop">
    <div class="ds-exit-pop__media">
      <img src="/travel-care/products/water-flosser-banner.png" alt="DentaStream Water Flosser">
    </div>
    <div class="ds-exit-pop__copy">
      <p class="ds-exit-pop__eyebrow">Before you go</p>
      <h2>Take 10% off this oral-care bundle.</h2>
      <p>Apply EXIT10 to your Water Flosser and travel case before checkout.</p>
      <button type="button" class="ds-btn" data-exit-intent-action="apply-coupon" data-coupon-code="EXIT10">Apply EXIT10</button>
      <button type="button" class="ds-exit-pop__close" data-exit-intent-action="close">No thanks</button>
    </div>
  </div>
</template>

<script>
  (function () {
    function initDentaStreamExitIntent(sdk) {
      if (window.__dentaStreamExitIntentReady || !sdk || typeof sdk.exitIntent !== 'function') return;
      window.__dentaStreamExitIntentReady = true;
      sdk.exitIntent({
        template: 'exit-intent',
        maxTriggers: 1,
        disableOnMobile: true,
        overlayClosable: true,
        showCloseButton: true
      });
    }
    if (Array.isArray(window.nextReady)) {
      window.nextReady.push(initDentaStreamExitIntent);
    } else {
      window.addEventListener('next:initialized', function (event) {
        initDentaStreamExitIntent(event.detail && event.detail.sdk ? event.detail.sdk : window.next);
      }, { once: true });
    }
  })();
</script>
`;
  return html.replace("\n</body>", `${template}\n</body>`);
}

function addExitAppliedLabel(html) {
  const marker = `        <div data-next-hide="cart.isEmpty" style="margin-top:1rem;">`;
  const label = `        <div data-next-show='cart.hasCoupon("EXIT10")' class="ds-coupon-applied" style="display:none;">EXIT10 applied to this checkout.</div>\n`;
  return html.includes("ds-coupon-applied") ? html : html.replace(marker, label + marker);
}

function transformCheckout(html) {
  html = rootAssets(html);
  html = ensureMeta(html, "checkout", [
    ["next-currency", "USD"],
    ["next-predictive-address", "true"],
  ]);
  html = html
    .replace(/data-next-package-id="5"/g, 'data-next-package-id="2"')
    .replace(/package 5/g, "package 2");
  html = removePaypal(html);
  html = addCheckoutMainOffer(html);
  html = addExitAppliedLabel(html);
  return addExitIntent(html);
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

const pages = [
  ["presell.html", "presell.html", "DentaStream Water Flosser - Presell", routes.presell, (html) => ensureMeta(rootAssets(html), "product", [])],
  ["landing.html", "landing.html", "DentaStream Water Flosser", routes.landing, (html) => ensureMeta(rootAssets(html), "product", [["next-currency", "USD"]])],
  ["checkout.html", "checkout.html", "DentaStream Travel Oral Care - Checkout", routes.checkout, transformCheckout],
  ["upsell-1.html", "upsell-1.html", "DentaStream Sonic Toothbrush Offer", routes.upsell1, transformUpsell1],
  ["upsell-2.html", "upsell-2.html", "DentaStream Whitening Kit Offer", routes.upsell2, transformUpsell2],
  ["thank-you.html", "receipt.html", "DentaStream Order Confirmation", routes.receipt, rootAssets],
];

fs.mkdirSync(outDir, { recursive: true });
fs.rmSync(assetOut, { recursive: true, force: true });
fs.cpSync(path.join(sourceRoot, "assets"), assetOut, { recursive: true });

for (const [sourceName, outputName, title, permalink, transform] of pages) {
  const raw = fs.readFileSync(path.join(sourceRoot, sourceName), "utf8");
  write(path.join(outDir, outputName), frontmatter({ title, permalink }) + transform(raw));
}

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
  storeName: "Keer",
  qa: {
    spec_identity: ${JSON.stringify(specIdentity, null, 4).replace(/\n/g, "\n    ")}
  },
  utmTransfer: { enabled: true, applyToExternalLinks: false, debug: false }
};
`);

fs.appendFileSync(path.join(assetOut, "shared.css"), `

.ds-main-offer__inner {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) max-content;
  gap: 1rem;
  align-items: center;
}
.ds-main-offer__img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 12px;
  background: #f6fbfa;
  border: 1px solid rgba(44, 190, 173, 0.18);
}
.ds-main-offer__title {
  font-weight: 800;
  color: var(--ds-ink);
}
.ds-main-offer__desc {
  margin: 0.2rem 0 0;
  color: var(--ds-muted);
  font-size: 0.92rem;
}
.ds-main-offer__price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.ds-main-offer__price span {
  color: var(--ds-muted);
  text-decoration: line-through;
  font-size: 0.86rem;
}
.ds-main-offer__price strong {
  color: var(--ds-success);
  font-size: 1.12rem;
}
.ds-coupon-applied {
  margin-top: 0.85rem;
  border: 1px solid rgba(44, 190, 173, 0.35);
  background: rgba(44, 190, 173, 0.1);
  color: var(--ds-success);
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
  font-weight: 800;
  font-size: 0.9rem;
}
.ds-exit-pop {
  width: min(760px, calc(100vw - 32px));
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(220px, 0.82fr) minmax(0, 1fr);
  color: var(--ds-ink);
  box-shadow: 0 28px 80px rgba(12, 24, 36, 0.28);
}
.ds-exit-pop__media {
  background: #eaf7f5;
  min-height: 330px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ds-exit-pop__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ds-exit-pop__copy {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.9rem;
}
.ds-exit-pop__eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  font-weight: 900;
  color: var(--ds-primary);
}
.ds-exit-pop__copy h2 {
  margin: 0;
  line-height: 1.05;
  font-size: clamp(1.8rem, 4vw, 2.7rem);
}
.ds-exit-pop__copy p {
  margin: 0;
  color: var(--ds-body);
}
.ds-exit-pop__close {
  border: 0;
  background: none;
  color: var(--ds-muted);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  padding: 0.4rem 0;
}
@media (max-width: 680px) {
  .ds-main-offer__inner,
  .ds-exit-pop {
    grid-template-columns: 1fr;
  }
  .ds-main-offer__price {
    text-align: left;
    align-items: flex-start;
  }
  .ds-exit-pop__media {
    min-height: 220px;
  }
}
`);

const campaignsPath = path.join(repoRoot, "_data/campaigns.json");
const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));
campaigns["travel-care"] = {
  name: "DentaStream Travel Care",
  description: "SELL-284 Campaigns OS dogfood build from Map travel-oral-care-bundle-tez-kx4f with EXIT10 checkout exit intent.",
  entry_url: "try.dogfoodprep/waterflosser/presell",
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
  fb_pixel_id: ""
};
write(campaignsPath, `${JSON.stringify(campaigns, null, 2)}\n`);

console.log(`Assembled ${pages.length} travel-care pages into ${outDir}`);
