import fs from "node:fs";
import path from "node:path";

const repo = "/Users/devin/Developer/meridian";
const designRoot = "/Users/devin/.gstack/projects/Developer/designs/limos-demeter-funnel-static-20260504";

const campaigns = [
  {
    slug: "roadflare-v1",
    bodyClass: "roadflare shell",
    name: "Roadflare Supply Co. - JumpBrick Pro",
    description: "Independent Roadflare / Limos campaign for JumpBrick Pro roadside power kit",
    storeName: "Roadflare Supply Co.",
    apiKey: "6iKSuTKqYmlnfqsWEU5wot9L8qXuMAeLjurPZIa2",
    paymentEnvKey: "57862XP7AB94ZSSMYZRDHTQA7W",
    sourceDir: "roadflare-limos",
    cssClass: "roadflare",
  },
  {
    slug: "veyra-v1",
    bodyClass: "veyra shell force-light",
    name: "Veyra House - Luma Taper",
    description: "Independent Veyra / Demeter campaign for Luma Taper cordless table lamp",
    storeName: "Veyra House",
    apiKey: "tz0JCZNjCklQQlUaEFUw9CMH8wUkIoG1DngIEIU6",
    paymentEnvKey: "57862XP7AB94ZSSMYZRDHTQA7W",
    sourceDir: "veyra-demeter",
    cssClass: "veyra",
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function writeFile(dest, content) {
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, `${content.trim()}\n`);
}

function readSource(campaign, file) {
  return fs.readFileSync(path.join(designRoot, campaign.sourceDir, file), "utf8");
}

function familyRoot(campaign) {
  return path.join("/Users/devin/Developer/campaign-cart-starter-templates/src", campaign.slug === "veyra-v1" ? "demeter" : "limos");
}

function familyInclude(campaign, file) {
  return fs.readFileSync(path.join(familyRoot(campaign), "_includes", file), "utf8");
}

function bodyInner(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1].trim() : html.trim();
}

function liquidize(campaign, html) {
  let out = bodyInner(html);
  out = out.replace(/<script type="module" src="\.\.\/shared\.js"><\/script>/g, "");
  out = out.replace(/\.\.\/assets\/roadflare-kit\.svg/g, "{{ 'images/roadflare-jumpbrick-pro.png' | campaign_asset }}");
  out = out.replace(/\.\.\/assets\/roadflare-beacon\.svg/g, "{{ 'images/roadflare-beacon-2pack.png' | campaign_asset }}");
  out = out.replace(/\.\.\/assets\/veyra-lamps\.svg/g, "{{ 'images/veyra-luma-taper.png' | campaign_asset }}");
  out = out.replace(/\.\.\/assets\/charging-tray\.svg/g, "{{ 'images/veyra-twin-dock-tray.png' | campaign_asset }}");
  out = out.replace(/href="landing\.html"/g, "href=\"{{ 'index.html' | campaign_link }}\"");
  out = out.replace(/href="presell\.html"/g, "href=\"{{ 'presell.html' | campaign_link }}\"");
  out = out.replace(/href="checkout\.html"/g, "href=\"{{ 'checkout.html' | campaign_link }}\"");
  out = out.replace(/href="upsell-beacon\.html"/g, "href=\"{{ 'upsell-beacon.html' | campaign_link }}\"");
  out = out.replace(/href="upsell-fleet\.html"/g, "href=\"{{ 'upsell-fleet.html' | campaign_link }}\"");
  out = out.replace(/href="upsell-dock\.html"/g, "href=\"{{ 'upsell-dock.html' | campaign_link }}\"");
  out = out.replace(/href="receipt\.html"/g, "href=\"{{ 'receipt.html' | campaign_link }}\"");

  if (campaign.slug === "roadflare-v1") {
    out = out.replace(/href="\{\{ 'checkout\.html' \| campaign_link \}\}"/g, "href=\"{{ 'presell.html' | campaign_link }}\"");
    out = out.replace(/today's/g, "today&rsquo;s");
  }

  if (campaign.slug === "veyra-v1") {
    out = out.replace(/href="\{\{ 'checkout\.html' \| campaign_link \}\}"/g, "href=\"{{ 'presell.html' | campaign_link }}\"");
  }

  return out;
}

function page(frontmatter, content) {
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n${value.map((item) => `  - ${item}`).join("\n")}`;
      }
      return `${key}: ${value}`;
    })
    .join("\n");
  return `---\n${yaml}\n---\n${content}`;
}

function baseLayout() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>{{ title }}</title>
    <meta content="{{ title }}" property="og:title">
    <meta content="{{ title }}" property="twitter:title">
    <meta content="width=device-width, initial-scale=1, maximum-scale=1" name="viewport">
    <link rel="dns-prefetch" href="//campaigns.apps.29next.com">
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <script src="{{ 'config.js' | campaign_asset }}"></script>
    <meta name="next-funnel" content="{{ campaign.name }}">
    <meta name="next-page-type" content="{{ page_type }}">
    {% if next_currency %}<meta name="next-currency" content="{{ next_currency }}">{% endif %}
    {% if predictive_address %}<meta name="next-predictive-address" content="{{ predictive_address }}">{% endif %}
    {% if prevent_back_navigation %}<meta name="next-prevent-back-navigation" content="{{ prevent_back_navigation }}">{% endif %}
    {% if next_url %}<meta name="next-success-url" content="{{ next_url | campaign_link }}">{% endif %}
    {% if next_url %}<meta name="next-upsell-accept-url" content="{{ next_url | campaign_link }}">{% endif %}
    {% if decline_url %}<meta name="next-upsell-decline-url" content="{{ decline_url | campaign_link }}">{% endif %}
    <script src="https://cdn.jsdelivr.net/gh/NextCommerceCo/campaign-cart@v{{ campaign.sdk_version }}/dist/loader.js" type="module"></script>
    <link href="{{ 'css/next-core.css' | campaign_asset }}" rel="stylesheet" type="text/css">
    {% for style in styles %}
    <link href="{{ style | campaign_asset }}" rel="stylesheet" type="text/css">
    {% endfor %}
  </head>
  <body class="{{ body_class }}">
    {{ content }}
    {% for script in scripts %}
    <script defer src="{{ script | campaign_asset }}"></script>
    {% endfor %}
  </body>
</html>`;
}

function config(c) {
  return `window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: '${c.apiKey}',
  paymentEnvKey: '${c.paymentEnvKey}',
  currencyBehavior: 'auto',
  storeName: '${c.storeName}',
  paymentConfig: {
    expressCheckout: {
      enabled: true,
      requireValidation: true,
      requiredFields: ['email', 'fname', 'lname'],
      methodOrder: ['apple_pay', 'google_pay']
    },
    cardInputConfig: {
      fieldType: { number: 'tel', cvv: 'tel' },
      numberFormat: 'prettyFormat',
      labels: { number: 'Card number', cvv: 'CVV' },
      titles: { number: 'Card number', cvv: 'Security code' },
      placeholders: { number: 'Card number', cvv: 'CVV' },
      styles: {
        number: 'color: #14161f; font-size: 16px; font-weight: 400; line-height: 56px; height: 56px; width: 100%; font-family: "Plus Jakarta Sans", Inter, system-ui, -apple-system, "Segoe UI", sans-serif; text-align: left;',
        cvv: 'color: #14161f; font-size: 16px; font-weight: 400; line-height: 56px; height: 56px; width: 100%; font-family: "Plus Jakarta Sans", Inter, system-ui, -apple-system, "Segoe UI", sans-serif; text-align: left;',
        placeholder: 'color: #72747d; font-weight: 400;'
      }
    }
  },
  addressConfig: {
    dontShowStates: ['AS', 'GU', 'PR', 'VI'],
    enableAutocomplete: true
  },
  googleMaps: {
    apiKey: '',
    region: 'US'
  },
  analytics: {
    enabled: true,
    mode: 'auto',
    providers: {
      nextCampaign: { enabled: true },
      gtm: { enabled: false, settings: { containerId: '', dataLayerName: 'dataLayer' } },
      facebook: { enabled: false, settings: { pixelId: '' } },
      rudderstack: { enabled: false, settings: {} },
      custom: { enabled: false, settings: {} }
    }
  },
  utmTransfer: {
    enabled: true,
    applyToExternalLinks: false,
    debug: false
  },
  qa: {
    spec_identity: {
      slug: '${c.slug}',
      generated_from: 'CampaignSpec v4.2 build-through test',
      design_set: 'limos-demeter-funnel-static-20260504'
    }
  }
};`;
}

const field = (name, label, attrs = "") =>
  `<input aria-label="${label}" placeholder="${label}" data-next-checkout-field="${name}" os-checkout-validate="required" ${attrs}>`;

function checkoutFields() {
  return `<div class="grid-2">${field("fname", "First name*")} ${field("lname", "Last name*")}</div>
${field("email", "Email*", 'type="email" autocomplete="email"')}
${field("phone", "Phone*", 'type="tel" autocomplete="tel-full"')}
${field("address1", "Address*", 'autocomplete="address-line1"')}
<input aria-label="Apartment, suite, etc." placeholder="Apartment, suite, etc. (optional)" data-next-checkout-field="address2" autocomplete="address-line2">
<div class="grid-3">${field("city", "City*", 'autocomplete="address-level2"')}<select aria-label="State" data-next-checkout-field="province" os-checkout-validate="required"><option value="">State*</option></select><input aria-label="ZIP*" placeholder="ZIP*" data-next-checkout-field="postal" os-checkout-validate="required" autocomplete="postal-code"></div>
<select aria-label="Country" data-next-checkout-field="country" os-checkout-validate="required"><option value="">Country*</option></select>`;
}

function paymentBlock(cta, subtext) {
  return `{% campaign_include 'express-checkout.html' show_title=true %}
{% campaign_include 'payment-methods.html' %}
<div class="submit-section">
  <div class="submit-section__disclaimer">By placing this order, you agree to this campaign's checkout terms and privacy notices.</div>
  <button os-checkout-payment="combo" data-action="submit" type="submit" class="submit-button">
    <div data-pb-element="checkout-button-spinner" class="submit-button__loader"><div class="three-quarter-spinner black"></div></div>
    <div data-pb-element="checkout-button-info" class="submit-button__content">
      <div class="submit-button__main-text">${cta}</div>
      <div class="submit-button__subtext">${subtext}</div>
    </div>
  </button>
</div>`;
}

function cartSummary(title, family = "limos") {
  if (family === "demeter") {
    return `<aside class="checkout-summary-shell checkout-summary-shell--demeter card checkout-panel" data-commerce-slot="order-summary" aria-label="${title}">
  {% campaign_include 'cart-summary03.html' %}
</aside>`;
  }

  return `<aside class="checkout-summary-shell checkout-summary-shell--limos" data-commerce-slot="order-summary" aria-label="${title}">
  {% campaign_include 'cart-summary02.html' %}
</aside>`;
}

function roadflareCheckout() {
  return `<header class="brandbar"><div class="wrap nav"><a class="logo" href="{{ 'index.html' | campaign_link }}">Roadflare</a><span class="pill">100% encrypted checkout</span></div></header>
<main class="section tight">
  <div class="wrap checkout-grid">
    <form class="stack" data-next-checkout="form" id="roadflare_form" method="post" onsubmit="event.preventDefault(); return false;">
      <div class="card checkout-panel stack">
        <div class="commerce-note commerce-note--timer" data-commerce-slot="promo-timer" data-countdown data-duration-seconds="582" data-storage-key="roadflare-checkout-countdown">Roadside sale reserved for <span data-countdown-min>09</span>:<span data-countdown-sec>42</span> &middot; 62 drivers are viewing this offer</div>
          <div class="rf-offer-card" data-commerce-slot="main-bundle-selector">
            <div data-next-bundle-selector data-next-selector-id="main" data-next-selection-mode="swap" data-next-include-shipping="true" class="rf-single-selector">
            <div data-next-bundle-card data-next-bundle-id="jumpbrick-qty" data-next-shipping-id="1" data-next-bundle-items='[{"packageId":1,"quantity":1}]' data-next-quantity="1" data-next-min-quantity="1" data-next-max-quantity="5" data-next-selected="true" class="rf-single-offer-card next-selected">
              <div class="rf-offer-head"><span>Special offer - limited time</span><span data-next-bundle-display="hasDiscount" class="rf-save-badge">Save <span data-next-bundle-display="discountPercentage">50%</span></span></div>
              <div class="rf-offer-body rf-offer-body--stacked">
                <div class="rf-thumb"><img src="{{ 'images/roadflare-jumpbrick-pro.png' | campaign_asset }}" alt="JumpBrick Pro kit"></div>
                <div class="rf-offer-copy">
                  <h2 style="font-size:32px;">JumpBrick Pro Roadside Kit</h2>
                  <p class="small">4-in-1 jump starter, tire inflator, hazard light, and USB-C battery bank.</p>
                </div>
                <div class="price-row rf-price-stack">
                  <span data-next-bundle-display="hasDiscount" class="compare"><span data-next-bundle-display="originalPrice">$119.98</span></span>
                  <span class="current" data-next-bundle-display="price">$69.95</span>
                  <span data-next-bundle-display="hasDiscount" class="save">You save <span data-next-bundle-display="discountAmount">$50.03</span></span>
                </div>
              </div>
            </div>
            </div>
            <div class="qty next-bundle-qty next-bundle-qty--anchor-br" aria-label="Bundle quantity">
              <div class="next-bundle-qty__row" data-next-bundle-qty-for="main">
                <button type="button" class="next-bundle-qty__btn" data-next-quantity-decrease aria-label="Decrease bundle quantity">-</button><span data-next-quantity-display>1</span><button type="button" class="next-bundle-qty__btn" data-next-quantity-increase aria-label="Increase bundle quantity">+</button>
              </div>
            </div>
          </div>
        <div class="grid-3">
          <div class="checkline">30-day satisfaction guarantee</div>
          <div class="checkline">Fast U.S. shipping</div>
          <div class="checkline">38,000+ kits shipped</div>
        </div>
      </div>
      <div class="card checkout-panel stack">
        <h2 style="font-size:32px;">Shipping address</h2>
        ${checkoutFields()}
      </div>
      <div data-next-package-toggle data-commerce-slot="order-bump">
        <div data-next-toggle-card data-next-is-upsell="true" data-next-package-id="2" class="bump">
        <button type="button" class="bump-toggle" aria-label="Toggle MagMount Trunk Dock"><span class="box-check"><span os-component="check">✓</span></span></button>
        <div class="rf-thumb" style="min-height:70px;"><img src="{{ 'images/roadflare-magmount-dock.png' | campaign_asset }}" alt="MagMount Trunk Dock"></div>
        <div><strong>Add MagMount Trunk Dock</strong><p class="small">Keep JumpBrick mounted where you can grab it in 5 seconds.</p></div>
        <strong data-next-toggle-display="price">$39.95</strong>
        </div>
      </div>
      <div class="card checkout-panel stack">
        <h2 style="font-size:32px;">Payment</h2>
        ${paymentBlock("Complete my roadside kit", "Encrypted checkout - ships from the same warehouse batch")}
      </div>
    </form>
    ${cartSummary("Order summary", "limos")}
  </div>
</main>`;
}

function veyraCheckout() {
  return `<header class="brandbar"><div class="wrap nav"><a class="logo" href="{{ 'index.html' | campaign_link }}">Veyra House</a><span class="pill">Secure checkout</span></div></header>
<main class="section tight">
  <div class="wrap checkout-grid">
    <form class="card checkout-panel stack" data-next-checkout="form" id="veyra_form" method="post" onsubmit="event.preventDefault(); return false;">
      <div class="progress" aria-label="Checkout progress"><div></div><div></div><div></div></div>
      <h1 style="font-size:clamp(42px,6vw,72px);">Select your bundle</h1>
      <div class="commerce-note" data-commerce-slot="demeter-main-bundle-selector">Bundle pricing updates automatically when you choose a set.</div>
      <div class="stack bundle-selector" data-next-bundle-selector data-next-selector-id="main" data-next-selection-mode="swap" data-next-include-shipping="true">
        <button class="card tier" data-next-bundle-card data-next-bundle-id="luma-1" data-next-shipping-id="1" data-next-bundle-items='[{"packageId":1,"quantity":1}]' type="button">
          <span class="radio"></span><span class="vy-thumb"><img src="{{ 'images/veyra-luma-taper.png' | campaign_asset }}" alt=""></span><span><strong>1 Luma Taper</strong><br><span class="small">For a bedside or reading corner</span></span><span class="tier-price"><strong data-next-bundle-display="price">$87.99</strong></span>
        </button>
        <button class="card tier next-selected" data-next-bundle-card data-next-bundle-id="luma-2" data-next-shipping-id="1" data-next-bundle-items='[{"packageId":1,"quantity":2}]' data-next-selected="true" type="button">
          <span class="tier-badge">Most chosen</span><span class="radio"></span><span class="vy-thumb"><img src="{{ 'images/veyra-luma-taper.png' | campaign_asset }}" alt=""></span><span><strong>2 Luma Tapers</strong><br><span class="small">Most chosen for dinner tables - 25% offer</span></span><span class="tier-price"><span class="tier-compare" data-next-bundle-display="originalPrice">$175.98</span><strong data-next-bundle-display="price">$131.98</strong></span>
        </button>
        <button class="card tier" data-next-bundle-card data-next-bundle-id="luma-3" data-next-shipping-id="1" data-next-bundle-items='[{"packageId":1,"quantity":3}]' type="button">
          <span class="tier-badge">Best value</span><span class="radio"></span><span class="vy-thumb"><img src="{{ 'images/veyra-luma-taper.png' | campaign_asset }}" alt=""></span><span><strong>3 Luma Tapers</strong><br><span class="small">Host set - 35% offer</span></span><span class="tier-price"><span class="tier-compare" data-next-bundle-display="originalPrice">$263.97</span><strong data-next-bundle-display="price">$173.97</strong></span>
        </button>
      </div>
      <div data-next-package-toggle data-commerce-slot="order-bump">
        <div data-next-toggle-card data-next-is-upsell="true" data-next-package-id="2" class="shade-bump">
        <button type="button" class="bump-toggle" aria-label="Toggle extra smoked glass shade"><span class="box-check"><span os-component="check">✓</span></span></button>
        <div class="shade-pair"><img src="{{ 'images/veyra-extra-shade.png' | campaign_asset }}" alt="Extra smoked glass shade"></div>
        <div><strong>Add an extra smoked glass shade</strong><p class="small">A spare shade keeps the edit flexible between smoke and warmer table settings.</p></div>
        <strong data-next-toggle-display="price">$27.99</strong>
        </div>
      </div>
      <h2 style="font-size:34px;">Contact and delivery</h2>
      ${checkoutFields()}
      <h2 style="font-size:34px;">Payment</h2>
      ${paymentBlock("Place order", "Insured parcel - warm, portable light on its way")}
    </form>
    ${cartSummary("Your edit", "demeter")}
  </div>
</main>`;
}

function roadflareBeaconUpsell() {
  return `<div class="upsell-alert">Special offer unlocked - do not close this page</div>
<main class="section">
  <div class="wrap upsell-offer" data-next-upsell="offer">
    <section class="card checkout-panel stack">
      <p class="eyebrow">Add before your kit ships</p>
      <h1 style="font-size:clamp(42px,6vw,70px);">Make your car visible from both directions.</h1>
      <p class="lede">Add two magnetic amber beacons to your order for only <span data-next-bundle-display="price">$19.95</span> today. Place one behind the car and one near the front while you inflate, jump, or wait.</p>
      <div class="grid-2">
        <div class="checkline">Magnetic base sticks to hood or trunk</div>
        <div class="checkline">Amber flash pattern for low visibility</div>
        <div class="checkline">Stores in glovebox or door pocket</div>
        <div class="checkline">Ships in the same box as your kit</div>
      </div>
      <div class="commerce-note" data-commerce-slot="hidden-upsell-bundle-stepper">One-time add-on price is locked to this order only.</div>
      <div data-next-bundle-selector data-next-upsell-context data-next-selector-id="beacon-offer" class="bundle-selector">
        <button type="button" data-next-bundle-card data-next-bundle-id="beacon-1" data-next-bundle-items='[{"packageId":3,"quantity":1}]' data-next-bundle-vouchers='["BEACON2"]' data-next-selected="true" class="bundle-card next-selected">
          <span class="radio"></span><span><strong>Beacon 2-Pack</strong><small>Post-purchase roadside visibility add-on</small></span><span><strong data-next-bundle-display="price">$19.95</strong></span>
        </button>
      </div>
      <button class="btn" type="button" data-next-upsell-action="add" data-next-upsell-bundle-id="beacon-1">Yes, add beacons to my order</button>
      <a href="{{ 'upsell-fleet.html' | campaign_link }}" class="small" data-next-upsell-action="skip">No thanks, continue without beacons</a>
    </section>
    <aside class="gallery"><div class="gallery-main"><img src="{{ 'images/roadflare-beacon-2pack.png' | campaign_asset }}" alt="Two amber roadside beacons"></div></aside>
  </div>
</main>`;
}

function roadflareFleetUpsell() {
  return `<div class="upsell-alert">Last add-on offer before confirmation</div>
<main class="section">
  <div class="wrap upsell-offer" data-next-upsell="offer">
    <section class="card checkout-panel stack">
      <p class="eyebrow">Family fleet add-on</p>
      <h1 style="font-size:clamp(42px,6vw,70px);">Equip the other car before the box leaves the warehouse.</h1>
      <p class="lede">The Fleet Add-On adds the pieces that usually go missing: tire gauge, reflective triangle, spare USB-C cable, and quick-charge wall plug.</p>
      <div class="commerce-note" data-commerce-slot="tiered-upsell-selector">Choose how many vehicles need the spare safety kit.</div>
      <div class="grid-3 bundle-selector" data-next-bundle-selector data-next-upsell-context data-next-selector-id="fleet-offer">
        <button class="card checkout-panel stack selected" data-next-bundle-card data-next-bundle-id="fleet-1" data-next-bundle-items='[{"packageId":4,"quantity":1}]' data-next-selected="true" type="button"><strong>1 vehicle</strong><span class="small">Spare essentials kit</span><span class="current" style="font-size:28px;" data-next-bundle-display="price">$24.95</span></button>
        <button class="card checkout-panel stack" data-next-bundle-card data-next-bundle-id="fleet-2" data-next-bundle-items='[{"packageId":4,"quantity":2}]' data-next-bundle-vouchers='["FLEET2"]' type="button"><strong>2 vehicles</strong><span class="small">Most practical household set</span><span class="current" style="font-size:28px;" data-next-bundle-display="price">$39.92</span></button>
        <button class="card checkout-panel stack" data-next-bundle-card data-next-bundle-id="fleet-3" data-next-bundle-items='[{"packageId":4,"quantity":3}]' data-next-bundle-vouchers='["FLEET3"]' type="button"><strong>3 vehicles</strong><span class="small">Family fleet, best savings</span><span class="current" style="font-size:28px;" data-next-bundle-display="price">$52.40</span></button>
      </div>
      <button class="btn" type="button" data-next-upsell-action="add">Add selected fleet kit</button>
      <a href="{{ 'receipt.html' | campaign_link }}" class="small" data-next-upsell-action="skip">No thanks, show my receipt</a>
    </section>
    <aside class="gallery"><div class="gallery-main"><img src="{{ 'images/roadflare-magmount-dock.png' | campaign_asset }}" alt="Roadflare fleet add-on kit"></div></aside>
  </div>
</main>`;
}

function veyraDockUpsell() {
  return `<main class="section">
  <div class="wrap upsell-offer" data-next-upsell="offer">
    <section class="card checkout-panel stack">
      <p class="eyebrow">Private add-on offer</p>
      <h1 style="font-size:clamp(44px,7vw,82px);">Your lamps need a place to come home to.</h1>
      <p class="lede">The Twin Dock Charging Tray keeps two Luma Tapers aligned, charged, and ready for the next dinner. Add it now before your order is packed.</p>
      <div class="commerce-note" data-commerce-slot="demeter-tiered-upsell">Add before packing and it ships with your lamp set.</div>
      <div class="bundle-selector" data-next-bundle-selector data-next-upsell-context data-next-selector-id="dock-offer">
        <button class="card vy-card stack selected" data-next-bundle-card data-next-bundle-id="dock-1" data-next-bundle-items='[{"packageId":3,"quantity":1}]' data-next-bundle-vouchers='["TWINDOCK"]' data-next-selected="true" type="button">
          <strong>1 Twin Dock Charging Tray</strong><span class="small">For one pair of lamps</span><span class="current" style="font-size:30px;" data-next-bundle-display="price">$56.99</span>
        </button>
      </div>
      <button class="btn" type="button" data-next-upsell-action="add" data-next-upsell-bundle-id="dock-1">Add tray to my order</button>
      <a href="{{ 'receipt.html' | campaign_link }}" class="small" data-next-upsell-action="skip">No thank you, continue to receipt</a>
    </section>
    <aside class="gallery"><div class="gallery-main" style="background:#101815;"><img src="{{ 'images/veyra-twin-dock-tray.png' | campaign_asset }}" alt="Twin Dock Charging Tray"></div></aside>
  </div>
</main>`;
}

function receipt(campaign) {
  const roadflare = campaign.slug === "roadflare-v1";
  return `<header class="brandbar"><div class="wrap nav"><a class="logo" href="{{ 'index.html' | campaign_link }}">${roadflare ? "Roadflare" : "Veyra House"}</a><span class="pill">Order confirmed</span></div></header>
<main class="section">
  <div class="wrap receipt-grid">
    <section class="card checkout-panel stack">
      <div class="receipt-ok">✓</div>
      <p class="eyebrow">Confirmation <span data-next-display="order.number">${roadflare ? "#RF-20491" : "#VH-78104"}</span></p>
      <h1 style="font-size:clamp(42px,6vw,76px);">${roadflare ? "Your roadside kit is confirmed." : "Your Luma edit is confirmed."}</h1>
      <p class="lede">${roadflare ? "You will receive tracking by email as soon as the warehouse scans your kit. Keep the quick-start card in the glovebox after unboxing." : "We will send tracking when your lamps leave the studio warehouse. Charge fully before first use, then dim low for dinner-length glow."}</p>
      <div class="grid-2">
        <div class="card checkout-panel"><strong>Contact</strong><p class="small" data-next-display="order.customer.email">taylor@example.com</p></div>
        <div class="card checkout-panel"><strong>Shipping method</strong><p class="small">${roadflare ? "Priority Roadflare Dispatch" : "Standard insured parcel"}</p></div>
        <div class="card checkout-panel"><strong>Ship to</strong><p class="small"><span data-next-display="order.shippingAddress.line1">151 O'Connor St</span>, <span data-next-display="order.shippingAddress.city">Ottawa</span></p></div>
        <div class="card checkout-panel"><strong>Payment</strong><p class="small">Credit card ending in 4242</p></div>
      </div>
      <a class="btn" href="{{ 'index.html' | campaign_link }}">Return to ${roadflare ? "Roadflare" : "Veyra House"}</a>
    </section>
    <aside class="card checkout-panel stack" data-commerce-slot="receipt-order-summary">
      <h2 style="font-size:36px;">Order summary</h2>
      <template id="${campaign.slug}-order-item-template">
        <div class="summary-line" data-package-id="{item.packageId}"><span>{item.quantity}x {item.name}</span><strong>{item.price}</strong></div>
      </template>
      <div data-item-template-id="${campaign.slug}-order-item-template" data-next-order-items class="cart-items__list"></div>
      <div class="fallback-summary">
        ${roadflare ? `<div class="summary-line"><span>JumpBrick Pro Roadside Kit</span><strong>$69.95</strong></div>
        <div class="summary-line"><span>MagMount Trunk Dock</span><strong>$39.95</strong></div>
        <div class="summary-line"><span>Beacon 2-Pack</span><strong>$19.95</strong></div>
        <div class="summary-line"><span>Fleet Add-On Kit</span><strong>$24.95</strong></div>` : `<div class="summary-line"><span>2 Luma Tapers</span><strong>$131.98</strong></div>
        <div class="summary-line"><span>Extra smoked glass shade</span><strong>$27.99</strong></div>
        <div class="summary-line"><span>Twin Dock Charging Tray</span><strong>$56.99</strong></div>`}
      </div>
      <div class="summary-line"><span>Subtotal</span><strong data-next-display="order.subtotal">${roadflare ? "$154.80" : "$216.97"}</strong></div>
      <div class="summary-line"><span>Shipping</span><strong data-next-display="order.shipping">$0.00</strong></div>
      <div class="summary-line"><span>Tax</span><strong data-next-display="order.tax">${roadflare ? "$8.41" : "$21.70"}</strong></div>
      <div class="summary-line" style="font-size:24px;"><strong>Total</strong><strong data-next-display="order.total">${roadflare ? "$163.21" : "$238.67"}</strong></div>
    </aside>
  </div>
</main>`;
}

function css() {
  const shared = fs.readFileSync(path.join(designRoot, "shared.css"), "utf8");
  return `${shared}

[data-next-toggle-card] [os-component="check"] { display: none; }
[data-next-toggle-card].next-active [os-component="check"],
[data-next-toggle-card][class*="next-active"] [os-component="check"] { display: inline; }
.bundle-selector { display: grid; gap: 12px; }
.bundle-card {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
  color: var(--ink);
  padding: 14px;
  display: grid;
  grid-template-columns: 22px minmax(0,1fr) auto;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}
.bundle-card small { display: block; color: var(--muted); margin-top: 3px; }
.bundle-card.next-selected,
.tier.next-selected,
.rf-single-package.next-selected,
.rf-single-package[aria-pressed="true"] { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
.rf-single-selector { display: grid; }
.commerce-hidden-bundle-card {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
.rf-single-package {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
  color: var(--ink);
  padding: 14px;
  display: grid;
  grid-template-columns: 22px minmax(0,1fr) auto;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}
.rf-single-package small { display: block; color: var(--muted); margin-top: 3px; }
.next-bundle-qty { margin-top: 14px; }
.qty.next-bundle-qty {
  display: block;
  width: max-content;
  min-height: 0;
  border: 0;
  background: transparent;
  overflow: visible;
}
.next-bundle-qty__row {
  display: inline-grid;
  grid-template-columns: 44px 52px 44px;
  align-items: center;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 999px;
  overflow: hidden;
  background: var(--card);
}
.next-bundle-qty button {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-weight: 900;
  cursor: pointer;
}
.next-bundle-qty [data-next-quantity-display] {
  min-width: 34px;
  text-align: center;
  font-weight: 900;
}
.tier.next-selected .radio,
.rf-single-package.next-selected .radio { border: 6px solid var(--accent); }
.rf-offer-body--stacked {
  grid-template-columns: 132px minmax(0, 1fr);
  align-items: center;
}
.rf-single-offer-card[data-next-bundle-card] {
  cursor: default;
}
.rf-offer-copy { min-width: 0; }
.rf-price-stack {
  grid-column: 2;
  justify-self: start;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: baseline;
  align-content: center;
  gap: 4px 16px;
  min-width: 0;
}
.rf-price-stack .compare,
.tier-compare {
  color: var(--muted);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}
.rf-price-stack .current {
  font-size: clamp(48px, 7vw, 78px);
  line-height: .9;
}
.rf-price-stack .save {
  color: var(--accent);
  font-weight: 900;
  white-space: nowrap;
}
.rf-price-stack .hide,
.rf-save-badge.hide {
  display: none;
}
.commerce-note--timer [data-countdown-min],
.commerce-note--timer [data-countdown-sec] {
  font-variant-numeric: tabular-nums;
}
.tier-price {
  display: grid;
  justify-items: end;
  gap: 4px;
  white-space: nowrap;
}
.tier-compare {
  font-size: 14px;
  font-weight: 700;
}
.bump-toggle { border: 0; background: transparent; color: inherit; padding: 0; cursor: pointer; }
.shade-pair img { width: 76px; height: 76px; object-fit: contain; }
.exp-checkout { border: 1px solid var(--line); border-radius: var(--radius); padding: 14px; background: var(--card); }
.express-checkout__buttons { min-height: 44px; }
.payment-methods { margin-top: 12px; }
.payment-method__icons { flex-wrap: nowrap; }
.payment-method__icons img { flex: 0 0 auto; max-width: 44px; object-fit: contain; }
.payment-method__form .form-grid__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.payment-method__form .form-grid__row:nth-child(2) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.payment-method__form .input-flds,
.payment-method__form .select-field,
.payment-method__form .spreedly-field { width: 100%; min-width: 0; }
.payment-method__form .spreedly-field {
  height: 56px;
  min-height: 56px;
  padding: 0 44px 0 14px;
  align-items: center;
}
.payment-method__form .spreedly-field iframe {
  height: 54px;
  min-height: 54px;
}
[os-checkout-element="different-billing-address"] { display: none; }
.cc-billing,
.payment-method__info-title { font-size: 20px !important; line-height: 1.15; }
.billing-address { margin-top: 14px; }
.checkout-summary-shell { align-self: start; }
.checkout-summary-shell--limos .order-summary__accordion,
.checkout-summary-shell--limos .order-summary--card,
.checkout-summary-shell--limos .order-summary--accordion {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--card);
  color: var(--ink);
  overflow: hidden;
}
.checkout-summary-shell--limos .order-summary__accordion-trigger { cursor: pointer; }
.checkout-summary-shell--demeter {
  background: #fffdfa;
  border-color: var(--line);
  padding: 28px;
}
.checkout-summary-shell--demeter .cart-heading { margin-bottom: 18px; }
.checkout-summary-shell--demeter .cart-box__title {
  font-family: inherit;
  font-size: 30px;
  line-height: 1.05;
  font-weight: 900;
}
.checkout-summary-shell--demeter .cart-box__subtitle {
  font-size: 18px;
  font-weight: 800;
  margin-top: 6px;
}
.checkout-summary-shell--demeter .cart-line-display { margin-bottom: 22px; }
.checkout-summary-shell--demeter .order-summary,
.checkout-summary-shell--demeter .summary-wrapper { background: transparent; }
.checkout-summary-shell--demeter .cart-items__list { display: grid; gap: 14px; }
.form-grid { display: grid; gap: 12px; }
.form-input { min-height: 50px; }
.input-flds,
.spreedly-field {
  width: 100%;
  min-height: 50px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0 14px;
  background: var(--card);
  color: var(--ink);
}
.spreedly-field { display: flex; align-items: center; }
.submit-section { display: grid; gap: 10px; }
.submit-section__disclaimer { color: var(--muted); font-size: 12px; line-height: 1.45; }
.submit-button {
  min-height: 56px;
  border: 0;
  border-radius: var(--radius);
  background: var(--btn-bg);
  color: var(--btn-fg);
  font-weight: 900;
  cursor: pointer;
  padding: 12px 18px;
  text-align: center;
}
.submit-button__subtext { font-size: 12px; margin-top: 3px; opacity: .78; }
.submit-button__loader { display: none; }
.next-disabled { opacity: .55; pointer-events: none; }
@media (max-width: 960px) {
  .bundle-card,
  .rf-single-package { grid-template-columns: 22px minmax(0,1fr); }
  .bundle-card > span:last-child,
  .rf-single-package > span:last-child { grid-column: 2; justify-self: start; }
  .rf-offer-body--stacked {
    grid-template-columns: 132px minmax(0, 1fr);
  }
  .rf-price-stack {
    grid-column: 2;
    justify-self: start;
    justify-items: start;
  }
}
@media (max-width: 520px) {
  .rf-offer-body--stacked {
    grid-template-columns: 1fr;
  }
  .rf-offer-body--stacked .rf-thumb {
    width: 132px;
    min-height: 132px;
  }
  .rf-offer-body--stacked h2 {
    font-size: 30px !important;
    max-width: none;
  }
  .rf-price-stack {
    grid-column: auto;
  }
  .rf-price-stack .current {
    font-size: clamp(46px, 18vw, 64px);
  }
  .tier {
    grid-template-columns: 22px 74px minmax(0,1fr);
  }
  .tier-price {
    grid-column: 3;
    justify-self: start;
    justify-items: start;
  }
}
`;
}

function funnelJs() {
  return `(() => {
  function pad(value) {
    return String(Math.max(0, value)).padStart(2, "0");
  }

  function initCountdown(root) {
    const duration = Number(root.getAttribute("data-duration-seconds") || 600);
    const storageKey = root.getAttribute("data-storage-key") || "campaign-countdown";
    const now = Date.now();
    let expiresAt = Number(sessionStorage.getItem(storageKey));

    if (!expiresAt || expiresAt <= now) {
      expiresAt = now + duration * 1000;
      sessionStorage.setItem(storageKey, String(expiresAt));
    }

    const render = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      root.querySelectorAll("[data-countdown-min]").forEach((el) => { el.textContent = pad(minutes); });
      root.querySelectorAll("[data-countdown-sec]").forEach((el) => { el.textContent = pad(seconds); });
    };

    render();
    window.setInterval(render, 1000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-countdown]").forEach(initCountdown);
  });
})();`;
}

function buildCampaign(c) {
  const root = path.join(repo, "src", c.slug);
  const templateRoot = familyRoot(c);
  ensureDir(root);
  writeFile(path.join(root, "_layouts/base.html"), baseLayout());
  writeFile(path.join(root, "_includes/payment-methods.html"), familyInclude(c, "payment-methods.html"));
  writeFile(path.join(root, "_includes/express-checkout.html"), familyInclude(c, "express-checkout.html"));
  writeFile(path.join(root, "_includes/cart-summary02.html"), familyInclude(c, "cart-summary02.html"));
  writeFile(path.join(root, "_includes/cart-summary03.html"), familyInclude(c, "cart-summary03.html"));
  writeFile(path.join(root, "assets/config.js"), config(c));
  writeFile(path.join(root, "assets/css/funnel.css"), css());
  writeFile(path.join(root, "assets/js/funnel.js"), funnelJs());
  copyFile(path.join(templateRoot, "assets/css/next-core.css"), path.join(root, "assets/css/next-core.css"));

  for (const icon of ["cc-visa.svg", "cc_master.svg", "cc_amex.svg", "cc_discover.svg"]) {
    copyFile(path.join(templateRoot, "assets/images", icon), path.join(root, "assets/images", icon));
  }

  const productImages = c.slug === "roadflare-v1" ? [
    "roadflare-jumpbrick-pro.png",
    "roadflare-beacon-2pack.png",
    "roadflare-magmount-dock.png",
  ] : [
    "veyra-luma-taper.png",
    "veyra-extra-shade.png",
    "veyra-twin-dock-tray.png",
  ];

  for (const image of productImages) {
    copyFile(path.join(designRoot, "product-shots", image), path.join(root, "assets/images", image));
  }

  const common = {
    styles: ["css/funnel.css"],
    scripts: ["js/funnel.js"],
    body_class: `"${c.bodyClass}"`,
  };

  writeFile(path.join(root, "index.html"), page({
    title: `"${c.name}"`,
    page_type: "product",
    permalink: `/${c.slug}/`,
    next_url: "presell.html",
    ...common,
  }, liquidize(c, readSource(c, "landing.html"))));

  writeFile(path.join(root, "presell.html"), page({
    title: c.slug === "roadflare-v1" ? `"Roadflare Driver Safety Brief"` : `"Veyra Lighting Edit"`,
    page_type: "product",
    permalink: `/${c.slug}/presell/`,
    next_url: "checkout.html",
    ...common,
  }, liquidize(c, readSource(c, "presell.html")).replace(/href="\{\{ 'presell\.html' \| campaign_link \}\}"/g, "href=\"{{ 'checkout.html' | campaign_link }}\"")));

  writeFile(path.join(root, "checkout.html"), page({
    title: c.slug === "roadflare-v1" ? `"Checkout - Roadflare JumpBrick Pro"` : `"Checkout - Veyra House"`,
    page_type: "checkout",
    permalink: `/${c.slug}/checkout/`,
    next_url: c.slug === "roadflare-v1" ? "upsell-beacon.html" : "upsell-dock.html",
    next_currency: "USD",
    predictive_address: "true",
    ...common,
  }, c.slug === "roadflare-v1" ? roadflareCheckout() : veyraCheckout()));

  if (c.slug === "roadflare-v1") {
    writeFile(path.join(root, "upsell-beacon.html"), page({
      title: `"Special Offer - Roadflare Beacon 2-Pack"`,
      page_type: "upsell",
      permalink: `/${c.slug}/upsell-beacon/`,
      next_url: "upsell-fleet.html",
      decline_url: "upsell-fleet.html",
      next_currency: "USD",
      prevent_back_navigation: "true",
      ...common,
    }, roadflareBeaconUpsell()));
    writeFile(path.join(root, "upsell-fleet.html"), page({
      title: `"Fleet Add-On - Roadflare"`,
      page_type: "upsell",
      permalink: `/${c.slug}/upsell-fleet/`,
      next_url: "receipt.html",
      decline_url: "receipt.html",
      next_currency: "USD",
      ...common,
    }, roadflareFleetUpsell()));
  } else {
    writeFile(path.join(root, "upsell-dock.html"), page({
      title: `"Charging Tray Offer - Veyra House"`,
      page_type: "upsell",
      permalink: `/${c.slug}/upsell-dock/`,
      next_url: "receipt.html",
      decline_url: "receipt.html",
      next_currency: "USD",
      prevent_back_navigation: "true",
      ...common,
    }, veyraDockUpsell()));
  }

  writeFile(path.join(root, "receipt.html"), page({
    title: c.slug === "roadflare-v1" ? `"Order Confirmed - Roadflare"` : `"Order Confirmed - Veyra House"`,
    page_type: "receipt",
    permalink: `/${c.slug}/receipt/`,
    ...common,
  }, receipt(c)));
}

for (const c of campaigns) buildCampaign(c);

const registryPath = path.join(repo, "_data/campaigns.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
for (const c of campaigns) {
  registry[c.slug] = {
    name: c.name,
    description: c.description,
    entry_url: "",
    sdk_version: "0.4.18",
    store_name: c.storeName,
    store_url: "",
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
}
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

copyFile("/Users/devin/Downloads/campaign-spec-roadflare-v1.json", path.join(repo, "campaign-spec-roadflare-v1.json"));
copyFile("/Users/devin/Downloads/campaign-spec-veyra-v1.json", path.join(repo, "campaign-spec-veyra-v1.json"));

writeFile(path.join(repo, "ROADFLARE-VEYRA-BUILD-PASS.md"), `# Roadflare / Veyra build pass

Date: 2026-05-05
Branch: main

## Campaigns

- Roadflare Supply Co. / Limos: public slug \`roadflare-v1\`; spec \`campaign-spec-roadflare-v1.json\`; source design \`roadflare-limos\`.
- Veyra House / Demeter: public slug \`veyra-v1\`; spec \`campaign-spec-veyra-v1.json\`; source design \`veyra-demeter\`.

## Template handling

- Meridian is only the page-kit/Netlify container. These campaigns have independent folders, configs, assets, copy, and registry entries.
- Designer HTML provided the visual system. Checkout, upsell, and receipt commerce slots were replaced with Campaign Cart SDK surfaces while preserving the intended layout shape.
- Payment, bundle, order-bump, upsell, and receipt surfaces use SDK-managed \`data-next-*\` attributes. No custom commerce JavaScript was added.
- 2026-05-05 feedback pass restored the Limos single-card quantity stepper, starter-template express checkout/payment includes, and starter \`cart-summary02.html\` accordion rather than bespoke checkout fragments.
- 2026-05-05 follow-up split checkout summary includes by template family: Limos uses the collapsed \`cart-summary02.html\` accordion; Demeter uses the open \`cart-summary03.html\` side-cart shape.

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

- \`node scripts/assemble-roadflare-veyra.mjs\`
- \`npm run build\`

## Verification

- \`npm run build\` passed and generated both campaign route sets under \`_site/\`.
- Local preview server: \`http://127.0.0.1:8080\`.
- Browser matrix checked desktop \`1440x1000\` and mobile \`390x844\` for Roadflare pages \`/\`, \`/presell/\`, \`/checkout/\`, \`/upsell-beacon/\`, \`/upsell-fleet/\`, \`/receipt/\` and Veyra pages \`/\`, \`/presell/\`, \`/checkout/\`, \`/upsell-dock/\`, \`/receipt/\`.
- Results: no broken images, no horizontal overflow, no console errors after fresh page load, SDK config present on every page, and visible SDK commerce surfaces on checkout/upsell/receipt pages.
- Checkout SDK readiness reached \`html.next-display-ready\` on Roadflare and Veyra; \`window.next\`, \`window.nextCampaign\`, and the expected campaign API keys were present.
- Main bundle selectors hydrated with live totals. Order bumps use \`data-next-package-toggle\` / \`data-next-toggle-card\`; clicking the bump toggled \`next-in-cart\` and updated checkout totals.
- Screenshots captured: \`/tmp/roadflare-checkout-desktop.png\`, \`/tmp/roadflare-checkout-mobile-fixed.png\`, \`/tmp/veyra-checkout-desktop.png\`, \`/tmp/veyra-checkout-mobile.png\`.

## Open risks

- I did not create real test orders or verify post-checkout receipt hydration with a live \`ref_id\`; receipt pages include SDK \`data-next-order-items\` templates plus believable fallback summaries.
- Roadflare Beacon and Fleet vouchers are wired from the spec. Full discount behavior should be confirmed with a sandbox order if this moves beyond build-through testing.
`);

writeFile(path.join(repo, "ROADFLARE-VEYRA-COMMERCE-COMPONENTS.md"), `# Roadflare / Veyra commerce component inventory

Date: 2026-05-05

## Readout

This pass is not intentionally using commerce components from the previous Olympus run. The failure mode was under-enumeration: I initially treated checkout summary/payment/bundle mounts as broadly reusable starter pieces instead of selecting them by template family. Shared SDK primitives are valid, but the rendered commerce components must be family-scoped.

## Component Map

| Commerce surface | Limos / Roadflare shape | Demeter / Veyra shape | SDK contract |
| --- | --- | --- | --- |
| Main purchase selector | Single SDK-backed offer card plus external quantity stepper | Visible editorial 1/2/3 tier bundle selector | \`data-next-bundle-selector\`, \`data-next-bundle-card\`, \`data-next-selected\`, \`data-next-bundle-display\` |
| Quantity control | \`data-next-bundle-qty-for="main"\` attached to the single selected package | Not used; bundle card selection changes quantity | \`data-next-quantity-decrease\`, \`data-next-quantity-increase\`, \`data-next-quantity-display\` |
| Order summary | Collapsible Limos accordion from \`cart-summary02.html\` | Open Demeter side cart from \`cart-summary03.html\` | SDK cart line rendering, discounts, shipping, totals |
| Express checkout | Family starter include, styled by current campaign CSS | Family starter include, styled by current campaign CSS | \`data-next-express-checkout\` surfaces from Campaign Cart SDK |
| Card payment | Family starter \`payment-methods.html\` with explicit card placeholders/styles in \`window.nextConfig.paymentConfig.cardInputConfig\` | Same payment primitive, visually adapted by Demeter CSS | Spreedly iframe fields via SDK config |
| Order bump | Designed product bump wrapper around \`data-next-toggle-card\` | Designed shade bump wrapper around \`data-next-toggle-card\` | \`data-next-package-toggle\`, \`data-next-toggle-card\`, \`data-next-toggle-display\` |
| Post-purchase upsell | Offer selector and accept/skip actions for Beacon, then Fleet add-on | Single dock-tray offer | \`data-next-upsell\`, \`data-next-upsell-action\`, optional upsell-context selector |
| Receipt | SDK order-items mount with Roadflare fallback summary | SDK order-items mount with Veyra fallback summary | \`data-next-order-items\` with static fallback for no ref_id preview |

## Guardrail For Future Builds

The generator should resolve \`templateFamily -> commerce components\` before rendering checkout. It is acceptable to share low-level SDK config and field primitives, but bundle selector, quantity, order summary, and receipt composition should be chosen from the target template family unless the design explicitly overrides it.

## Core Template Frontmatter Plan

These Roadflare/Veyra fixes should feed back into starter templates as frontmatter-controlled component variants, not campaign one-offs:

- Add a Limos single-offer quantity selector variant with slots for headline, product image, compare price, current price, discount amount, discount percentage, and timer copy.
- Add Demeter tier-card pricing slots that always include current total plus optional original total/discount copy, controlled by bundle-card SDK displays.
- Expose cart summary family selection through frontmatter, for example \`cart_summary_variant: limos-accordion | demeter-side-cart | olympus-side-cart\`.
- Keep payment and express checkout as shared primitives, but expose skin tokens and placeholder/config defaults in frontmatter so individual builds do not patch iframe internals.
- Add a small promo timer include that can be styled by template family and fed by frontmatter duration/copy, while leaving discount math to the SDK.
- Promote this component map into the build skill/template catalog after a few more pass-throughs confirm the variants across real designs.
`);

console.log("Assembled roadflare-v1 and veyra-v1 campaigns.");
