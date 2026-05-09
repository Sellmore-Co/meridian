window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: "pwC2yz69BJ9BmDEmYDY44T4fnkZzBnaoOeTOdsYc",
  paymentEnvKey: "57862XP7AB94ZSSMYZRDHTQA7W",
  currencyBehavior: "auto",
  storeName: "Somna",
  paymentConfig: {
    expressCheckout: {
      enabled: true,
      requireValidation: true,
      requiredFields: ["email", "fname", "lname"],
      methodOrder: ["apple_pay", "google_pay"]
    },
    cardInputConfig: {
      fieldType: { number: "tel", cvv: "tel" },
      numberFormat: "prettyFormat",
      labels: { number: "Card number", cvv: "CVV" },
      titles: { number: "Card number", cvv: "Security code" },
      placeholders: { number: "Card number", cvv: "CVV" },
      styles: {
        number: "color: #14211f; font-size: 16px; font-weight: 400; line-height: 56px; height: 56px; width: 100%; font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif; text-align: left;",
        cvv: "color: #14211f; font-size: 16px; font-weight: 400; line-height: 56px; height: 56px; width: 100%; font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif; text-align: left;",
        placeholder: "color: #7a8581; font-weight: 400;"
      }
    }
  },
  addressConfig: {
    dontShowStates: ["AS", "GU", "PR", "VI"],
    enableAutocomplete: true
  },
  googleMaps: {
    apiKey: "",
    region: "US"
  },
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
  utmTransfer: {
    enabled: true,
    applyToExternalLinks: false,
    debug: false
  },
  qa: {
    spec_identity: {
      slug: "somna-v0",
      ref_id: 1568,
      source: "campaign-map-builder",
      map_id: "somna-v0-8hb2",
      spec_hash: "sha256:8aa52cdc9e2de277ff472a6fabe787dd7cb5daafa7db31c194b421ce35362083",
      spec_path: "/Users/devin/Developer/designer/somna-sleep-funnel/campaign-spec-somna-v0.json",
      template_family: "olympus",
      sdk_version_source: "CampaignSpec global_config.sdk_version / Olympus catalog"
    }
  }
};
