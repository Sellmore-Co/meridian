window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: '92FrBl3qX1Sc0FMoFqGasr7IEdQ6j13V54AEsVSo',
  paymentEnvKey: '50KJ4F218F9X6V40JG9H1JW3E0',
  currencyBehavior: 'auto',
  storeName: 'Smooche Test',
  paymentConfig: {
    expressCheckout: {
      enabled: true,
      requireValidation: true,
      requiredFields: ['email', 'fname', 'lname'],
      methodOrder: ['apple_pay', 'google_pay', 'paypal']
    },
    cardInputConfig: {
      fieldType: { number: 'tel', cvv: 'tel' },
      numberFormat: 'prettyFormat',
      labels: { number: 'Card number', cvv: 'CVV' },
      titles: { number: 'Card number', cvv: 'Security code' },
      placeholders: { number: 'Card number', cvv: 'CVV' },
      styles: {
        number: 'color: #1a1a1a; font-size: 16px; font-weight: 400; line-height: 56px; height: 56px; width: 100%; font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif; text-align: left;',
        cvv: 'color: #1a1a1a; font-size: 16px; font-weight: 400; line-height: 56px; height: 56px; width: 100%; font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif; text-align: left;',
        placeholder: 'color: #8a8a8a; font-weight: 400;'
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
      slug: 'smooche-test',
      ref_id: 1556,
      generated_from: 'CampaignSpec v4.2 — Smooche Color-Changing Foundation funnel',
      figma_source: 'LDEBHBhRmBzxbJdxrDnRXs (Smooche-Sharing) node 18:1065'
    }
  }
};
