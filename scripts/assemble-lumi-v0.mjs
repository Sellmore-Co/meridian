import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = "/Users/devin/Developer/designer/funnel-designs/lumi-daily-wellness-set";
const starterRoot = "/Users/devin/Developer/campaign-cart-starter-templates/src/shop-single-step";
const specPath = "/Users/devin/Developer/designer/funnel-designs/lumi-daily-wellness-set/campaign-spec-lumi-v0.json";
const outDir = path.join(repoRoot, "src/lumi-v0");
const assetOut = path.join(outDir, "assets");
const routeRoot = "/lumi-v0";

const routes = {
  presell: `${routeRoot}/`,
  landing: `${routeRoot}/landing/`,
  checkout: `${routeRoot}/checkout/`,
  upsell1: `${routeRoot}/upsell/`,
  upsell2: `${routeRoot}/upsell-2/`,
  receipt: `${routeRoot}/receipt/`,
};

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const campaign = spec.campaign || {};
const sdkVersion = spec.global_config?.sdk_version || "0.4.19";

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function stripTrailingWhitespace(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8").replace(/[ \t]+$/gm, "");
  fs.writeFileSync(filePath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function frontmatter({ title, permalink }) {
  return `---\ntitle: "${title}"\npermalink: ${permalink}\npage_layout: raw.html\n---\n`;
}

function copyStarterFamily() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.cpSync(starterRoot, outDir, { recursive: true });
  for (const page of [
    "presell.html",
    "upsell-bundle-stepper.html",
    "upsell-bundle-tier-cards.html",
    "upsell-bundle-tier-pills.html",
  ]) {
    fs.rmSync(path.join(outDir, page), { force: true });
  }
  fs.rmSync(path.join(outDir, "_includes"), { recursive: true, force: true });
  write(path.join(outDir, "_layouts/raw.html"), "{{ content }}\n");
  fs.cpSync(path.join(sourceRoot, "assets"), assetOut, { recursive: true });
  stripTrailingWhitespace(path.join(assetOut, "css/next-core.css"));
}

function removeRuntimeMeta(html) {
  const names = [
    "next-funnel",
    "next-page-type",
    "next-next-url",
    "next-decline-url",
    "next-success-url",
    "next-upsell-accept-url",
    "next-upsell-decline-url",
    "next-currency",
    "next-predictive-address",
    "next-prevent-back-navigation",
  ];
  for (const name of names) {
    html = html.replace(new RegExp(`\\s*<meta\\s+name=["']${name}["'][^>]*>\\n?`, "gi"), "\n");
  }
  return html;
}

function injectRuntime(html, metaTags) {
  html = removeRuntimeMeta(html);
  const meta = [
    ["next-funnel", "Lumi v0"],
    ...metaTags,
  ].map(([name, value]) => `    <meta name="${name}" content="${value}">`);
  const runtime = [
    ...meta,
    `    <link href="${routeRoot}/css/next-core.css" rel="stylesheet" type="text/css">`,
    `    <script src="${routeRoot}/config.js"></script>`,
    `    <script src="https://cdn.jsdelivr.net/gh/NextCommerceCo/campaign-cart@v${sdkVersion}/dist/loader.js" type="module"></script>`,
  ].join("\n");
  return html.replace(/<\/head>/i, `${runtime}\n</head>`);
}

function lumiPaymentMarkup() {
  return `
                <div data-next-catalog-component="express-checkout" data-next-express-checkout="container" class="exp-checkout">
                    <div class="express-checkout__title">Express Checkout</div>
                    <div data-next-component="express-error" class="next-toast-handler">
                        <div class="tip1_bar is-warning">
                            <div data-next-component="express-error-text" class="text-sm">Error message</div>
                        </div>
                    </div>
                    <div data-next-express-checkout="buttons" class="express-checkout__buttons"></div>
                </div>

                <div class="payment-divider">Or pay by card</div>

                <div data-next-catalog-component="payment-method-presentation" class="payment-methods">
                    <div data-next-payment-method="credit" class="payment-method next-selected">
                        <div class="payment-method__header">
                            <label for="combo_mode_credit" combo_mode="credit" class="payment-method__label">
                                <input type="radio" name="payment_method" id="combo_mode_credit" class="payment-method__input" checked value="credit">
                                <div class="payment-method__title">Credit Card</div>
                                <div class="payment-method__icons" aria-hidden="true">Visa / Mastercard / Amex / Discover</div>
                            </label>
                        </div>
                        <div data-next-payment-form="credit" os-checkout-element="credit-form" os-shipping-method-same="true" class="payment-method__form payment-method__form--expanded">
                            <div class="payment-method__content">
                                <div data-next-component="credit-error" class="next-toast-handler">
                                    <div class="tip1_bar is-warning">
                                        <div data-next-component="credit-error-text" class="text-sm">Error message</div>
                                    </div>
                                </div>
                                <div class="form-grid">
                                    <div class="form-grid__row">
                                        <div class="form-group">
                                            <div class="form-input">
                                                <div data-next-tooltip="All transactions are secure and encrypted." class="form-input-icon" aria-hidden="true">Lock</div>
                                                <div data-next-checkout-field="cc-number" class="input-flds spreedly-field" aria-label="Card number"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-grid__row payment-grid">
                                        <div class="form-group">
                                            <div class="form-input">
                                                <select autocomplete="cc-exp-month" name="credit_card_exp_month" id="credit_card_exp_month" data-next-checkout-field="exp-month" class="input-flds select-field">
                                                    <option value="">Exp. Month</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="form-input">
                                                <select autocomplete="cc-exp-year" name="credit_card_exp_year" id="credit_card_exp_year" data-next-checkout-field="exp-year" class="input-flds select-field">
                                                    <option value="">Exp. Year</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="form-input">
                                                <div data-next-tooltip="3-digit security code." class="form-input-icon" aria-hidden="true">?</div>
                                                <div data-next-checkout-field="cvv" class="input-flds spreedly-field" aria-label="CVV"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <label class="checkbox-line">
                                    <input type="checkbox" name="use_shipping_address" id="use_shipping_address" checked>
                                    <span>Use shipping address as billing address</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div data-next-payment-method="apple-pay" class="payment-method">
                        <div class="payment-method__header">
                            <label for="combo_mode_apple_pay" combo_mode="apple_pay" class="payment-method__label">
                                <input type="radio" name="payment_method" id="combo_mode_apple_pay" class="payment-method__input" value="apple-pay">
                                <div class="payment-method__title">Apple Pay</div>
                            </label>
                        </div>
                        <div data-next-payment-form="apple-pay" os-checkout-element="credit-form" class="payment-method__form payment-method__form--collapsed"></div>
                    </div>

                    <div data-next-payment-method="google-pay" class="payment-method">
                        <div class="payment-method__header">
                            <label for="combo_mode_google_pay" combo_mode="google_pay" class="payment-method__label">
                                <input type="radio" name="payment_method" id="combo_mode_google_pay" class="payment-method__input" value="google-pay">
                                <div class="payment-method__title">Google Pay</div>
                            </label>
                        </div>
                        <div data-next-payment-form="google-pay" os-checkout-element="credit-form" class="payment-method__form payment-method__form--collapsed"></div>
                    </div>
                </div>`;
}

function rootLinks(html) {
  return html
    .replace(/(href|src)="assets\//g, `$1="${routeRoot}/`)
    .replace(/href="landing\.html"/g, `href="${routes.landing}"`)
    .replace(/href="checkout\.html"/g, `href="${routes.checkout}"`)
    .replace(/href="upsell-1\.html"/g, `href="${routes.upsell1}"`)
    .replace(/href="upsell-2\.html"/g, `href="${routes.upsell2}"`)
    .replace(/href="thank-you\.html"/g, `href="${routes.receipt}"`)
    .replace(/href="#"/g, `href="${routes.landing}"`);
}

function normalizeCheckout(html) {
  html = rootLinks(html)
    .replace(".grid { display: grid;", ".grid { display: grid;")
    .replace(
      ".payment-mount { padding: 18px; border: 1.5px dashed var(--lumi-border); border-radius: 8px; text-align: center; color: var(--lumi-text-soft); font-size: 13px; background: var(--lumi-surface); }",
      `.payment-mount { padding: 18px; border: 1.5px dashed var(--lumi-border); border-radius: 8px; text-align: center; color: var(--lumi-text-soft); font-size: 13px; background: var(--lumi-surface); }
        .checkout__layout { align-items: start; }
        .checkout__column { min-width: 0; }
        .exp-checkout { border: 1.5px solid var(--lumi-border); border-radius: 10px; padding: 14px; margin-bottom: 14px; background: var(--lumi-surface); }
        .express-checkout__title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--lumi-text-soft); font-weight: 800; margin-bottom: 10px; }
        .express-checkout__buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; min-height: 48px; }
        .express-checkout__buttons .payment-btn { min-height: 48px; border-radius: 8px; }
        .payment-divider { display: flex; align-items: center; gap: 10px; color: var(--lumi-text-soft); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin: 14px 0; }
        .payment-divider::before, .payment-divider::after { content: ""; height: 1px; background: var(--lumi-border); flex: 1; }
        .payment-methods { border: 1.5px solid var(--lumi-border); border-radius: 10px; overflow: hidden; background: #fff; }
        .payment-method { border-bottom: 1px solid var(--lumi-border); }
        .payment-method:last-child { border-bottom: 0; }
        .payment-method__header { padding: 14px; }
        .payment-method__label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 700; }
        .payment-method__title { flex: 1; }
        .payment-method__icons { color: var(--lumi-text-soft); font-size: 12px; font-weight: 600; }
        .payment-method__form { border-top: 1px solid var(--lumi-border); padding: 14px; background: var(--lumi-surface); }
        .payment-method__form--collapsed { display: none; }
        .form-grid { display: grid; gap: 12px; }
        .form-grid__row { display: grid; gap: 12px; }
        .payment-grid { grid-template-columns: 1fr 1fr 1fr; }
        @media (max-width: 600px) { .payment-grid { grid-template-columns: 1fr; } }
        .form-input { position: relative; }
        .form-input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--lumi-text-soft); font-size: 11px; z-index: 1; pointer-events: none; }
        .input-flds { width: 100%; min-height: 48px; border: 1.5px solid var(--lumi-border); border-radius: 8px; background: #fff; color: var(--lumi-text); font: inherit; padding: 12px 14px; }
        .spreedly-field { padding-right: 44px; display: flex; align-items: center; }
        .spreedly-field iframe { width: 100% !important; height: 32px !important; max-height: 32px !important; display: block; }`
    )
    .replace(
      'data-next-bundle-id="bundle-1x" data-next-shipping-id="2"',
      'data-next-bundle-id="bundle-1x" data-next-shipping-id="2" data-next-bundle-items=\'[{"packageId":1,"quantity":1}]\' data-next-selected="true"'
    )
    .replace(
      'data-next-bundle-id="bundle-2x" data-next-shipping-id="2"',
      'data-next-bundle-id="bundle-2x" data-next-shipping-id="2" data-next-bundle-items=\'[{"packageId":1,"quantity":2}]\''
    )
    .replace(
      'data-next-bundle-id="bundle-3x" data-next-shipping-id="1"',
      'data-next-bundle-id="bundle-3x" data-next-shipping-id="1" data-next-bundle-items=\'[{"packageId":1,"quantity":3}]\''
    )
    .replace(/data-next-bundle-display="totalPrice"/g, 'data-next-bundle-display="unitPrice"')
    .replace(
      'data-next-bump data-next-package-id="2"',
      'data-next-bump data-next-package-id="2" data-next-package-sync="false"'
    )
    .replace('<div class="grid">', '<div class="grid checkout__layout">')
    .replace(
      '<div class="panel">\n                <h2>Choose your bundle</h2>',
      '<div class="panel checkout__column checkout__column--left" style="display: block !important; visibility: visible !important; opacity: 1 !important; position: static !important; width: 100% !important; min-width: 0 !important;">\n                <h2>Choose your bundle</h2>'
    )
    .replace(
      '<div class="panel" data-next-cart-summary data-summary-lines>',
      '<div class="panel checkout__column checkout__column--right" style="display: block !important; visibility: visible !important; opacity: 1 !important; position: static !important; width: 100% !important; min-width: 0 !important;" data-next-cart-summary data-summary-lines>'
    )
    .replace(/<div class="form-row([^"]*)">\s*(?=<div class="field">\s*<label for="shipping_)/g, '<div data-next-component="shipping-field-row" class="form-row$1">')
    .replace(
      /<div data-next-component="payment-methods">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\n\s*<div class="submit-section">/,
      `${lumiPaymentMarkup()}
            </div>

            <div class="submit-section">`
    )
    .replace(/\n[ \t]+\n/g, "\n\n");

  return injectRuntime(html, [
    ["next-page-type", "checkout"],
    ["next-currency", "USD"],
    ["next-predictive-address", "true"],
    ["next-success-url", routes.upsell1],
  ]);
}

function normalizeUpsell(html, page, nextRoute) {
  html = rootLinks(html)
    .replace(/data-next-upsell-action="accept"/g, 'data-next-upsell-action="add"')
    .replace(/data-next-upsell-action="decline"/g, 'data-next-upsell-action="skip"')
    .replace(/href="[^"]*"([^>]*data-next-upsell-action="(?:add|skip)")/g, 'href="#"$1')
    .replace(
      'data-next-bundle-id="upsell-foot-1x"\n                           data-next-bundle-items=\'[{"packageId":3,"quantity":1}]\'',
      'data-next-bundle-id="upsell-foot-1x"\n                           data-next-bundle-items=\'[{"packageId":3,"quantity":1}]\'\n                           data-next-selected="true"'
    )
    .replace(
      'data-next-bundle-id="upsell-veg-1x" data-next-bundle-items=\'[{"packageId":4,"quantity":1}]\'',
      'data-next-bundle-id="upsell-veg-1x" data-next-bundle-items=\'[{"packageId":4,"quantity":1}]\' data-next-selected="true"'
    );

  const meta = [
    ["next-page-type", "upsell"],
    ["next-currency", "USD"],
    ["next-upsell-accept-url", nextRoute],
    ["next-upsell-decline-url", nextRoute],
  ];
  if (page === "upsell-1") meta.splice(2, 0, ["next-prevent-back-navigation", "true"]);
  return injectRuntime(html, meta);
}

function normalizeReceipt(html) {
  return injectRuntime(
    rootLinks(html).replace(
      '<img src="{item.image}" alt="{item.name}">',
      '<img src="/lumi-v0/products/air-purifier.png" data-next-template-src="{item.image}" alt="{item.name}">'
    ),
    [["next-page-type", "receipt"]]
  );
}

function normalizeProduct(html, pageType, includeCurrency = false) {
  const meta = [["next-page-type", pageType]];
  if (includeCurrency) meta.push(["next-currency", "USD"]);
  return injectRuntime(rootLinks(html), meta);
}

function writeConfig() {
  write(path.join(assetOut, "config.js"), `// Configure before Campaign Cart SDK loads.
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
  googleMaps: { apiKey: "", region: "" },
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
    spec_identity: ${JSON.stringify(spec.spec_identity || {}, null, 4).replace(/\n/g, "\n    ")}
  },
  utmTransfer: { enabled: true, applyToExternalLinks: false, debug: false }
};
`);
}

function updateCampaignsJson() {
  const campaignsPath = path.join(repoRoot, "_data/campaigns.json");
  const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));
  campaigns["lumi-v0"] = {
    name: "Lumi v0",
    description: "Keer multi-currency dogfood build from Map lumi-v0-qdos.",
    entry_url: "",
    sdk_version: sdkVersion,
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
  write(campaignsPath, JSON.stringify(campaigns, null, 2));
}

function readSource(name) {
  return fs.readFileSync(path.join(sourceRoot, name), "utf8");
}

copyStarterFamily();

write(
  path.join(outDir, "index.html"),
  frontmatter({ title: "Lumi Daily Wellness - Presell", permalink: routes.presell })
    + normalizeProduct(readSource("presell.html"), "product")
);
write(
  path.join(outDir, "landing.html"),
  frontmatter({ title: "Lumi Daily Wellness Set", permalink: routes.landing })
    + normalizeProduct(readSource("landing.html"), "product", true)
);
write(
  path.join(outDir, "checkout.html"),
  frontmatter({ title: "Checkout - Lumi", permalink: routes.checkout })
    + normalizeCheckout(readSource("checkout.html"))
);
write(
  path.join(outDir, "upsell.html"),
  frontmatter({ title: "Lumi Foot Recovery Offer", permalink: routes.upsell1 })
    + normalizeUpsell(readSource("upsell-1.html"), "upsell-1", routes.upsell2)
);
write(
  path.join(outDir, "upsell-2.html"),
  frontmatter({ title: "Lumi Produce Cleaner Offer", permalink: routes.upsell2 })
    + normalizeUpsell(readSource("upsell-2.html"), "upsell-2", routes.receipt)
);
write(
  path.join(outDir, "receipt.html"),
  frontmatter({ title: "Thank You - Lumi", permalink: routes.receipt })
    + normalizeReceipt(readSource("thank-you.html"))
);

writeConfig();
updateCampaignsJson();

console.log(`Assembled Lumi v0 into ${outDir}`);
