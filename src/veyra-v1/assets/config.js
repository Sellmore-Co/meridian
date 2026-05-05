window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: 'tz0JCZNjCklQQlUaEFUw9CMH8wUkIoG1DngIEIU6',
  paymentEnvKey: '57862XP7AB94ZSSMYZRDHTQA7W',
  currencyBehavior: 'auto',
  storeName: 'Veyra House',
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
      slug: 'veyra-v1',
      generated_from: 'CampaignSpec v4.2 build-through test',
      design_set: 'limos-demeter-funnel-static-20260504'
    }
  }
};
