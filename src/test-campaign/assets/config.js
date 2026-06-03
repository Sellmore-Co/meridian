window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: 'AbhmIKMsCU6RUAgFfdoCHvIRtiPVHKtZJNN5eQp0',
  paymentEnvKey: '6PRY90RDJK8A18W1ES5FKJJ61T',
  currencyBehavior: 'auto',
  storeName: 'TEST CAMPAIGN',
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
        number: 'color: #14161f; font-size: 16px; font-weight: 400; line-height: 36px; height: 36px; width: 100%; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; text-align: left;',
        cvv: 'color: #14161f; font-size: 16px; font-weight: 400; line-height: 36px; height: 36px; width: 100%; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; text-align: left;',
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
      slug: 'test-campaign',
      map_id: 'test-campaign-ujqf',
      generated_from: 'CampaignSpec schema_version 4.3 — SELL-362 prepared-HTML dogfood',
      source: 'synthetic html_funnel (claude-opus-4.8-synthetic@1.0.0)'
    }
  }
};
