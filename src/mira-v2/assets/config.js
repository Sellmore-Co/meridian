// Mira v2 — Campaign Cart SDK config
// Configured before the SDK loader runs.
//
// The Campaigns API key is per-campaign-scoped and public-safe (analogous to
// a Stripe publishable key) — sibling campaigns in this repo (theduo, veyra,
// roadflare) inline their keys the same way. The paymentEnvKey is also public.
window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  // Required: Campaigns API key (campaign ref_id 1559 — mira-v2)
  apiKey: 'WHdMMrPlm8hXYzuZpEZUig5akBf9Gv6E77M2gNqd',

  // Spreedly tokenization environment (per CampaignSpec)
  paymentEnvKey: '57862XP7AB94ZSSMYZRDHTQA7W',

  // Currency behavior when country changes
  currencyBehavior: 'auto', // 'auto' | 'manual'

  // Payment and checkout configuration
  paymentConfig: {
    expressCheckout: {
      // Spec: available_express_payment_methods = apple_pay, google_pay (no PayPal)
      enabled: true,
      requireValidation: true,
      requiredFields: ['email', 'fname', 'lname'],
      methodOrder: ['apple_pay', 'google_pay']
    },
    cardInputConfig: {
      fieldType: { number: 'tel', cvv: 'tel' },
      numberFormat: 'prettyFormat',
      labels:       { number: 'Card number', cvv: 'CVV' },
      titles:       { number: 'Card number', cvv: 'Security code' },
      placeholders: { number: 'Card number', cvv: 'CVV' },
      styles: {
        number: 'color: #1F2A24; font-size: 16px; font-weight: 400; line-height: 47px; height: 47px; width: 100%; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; text-align: left; padding: 0 14px;',
        cvv:    'color: #1F2A24; font-size: 16px; font-weight: 400; line-height: 47px; height: 47px; width: 100%; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; text-align: left; padding: 0 14px;',
        placeholder: 'color: #8A938C; font-weight: 400;'
      }
    }
  },

  // Address and country configuration
  addressConfig: {
    // Spec ships to US + AE only — campaign API supplies the country list.
    dontShowStates: ['AS', 'GU', 'PR', 'VI'],
    enableAutocomplete: true,
  },

  googleMaps: {
    apiKey: '',
    region: 'US',
  },

  // Analytics providers configuration
  storeName: 'Mira',
  analytics: {
    enabled: true,
    mode: 'auto',
    providers: {
      nextCampaign: { enabled: true },
      gtm:          { enabled: false, settings: { containerId: 'GTM-XXXXXX', dataLayerName: 'dataLayer' } },
      facebook:     { enabled: false, settings: { pixelId: 'YOUR_PIXEL_ID' } },
      rudderstack:  { enabled: false, settings: {} },
      custom:       { enabled: false, settings: { endpoint: '', apiKey: '' } }
    }
  },

  // UTM parameter transfer
  utmTransfer: {
    enabled: true,
    applyToExternalLinks: false,
    debug: false,
  }
};
