// Configure before Campaign Cart SDK loads.
window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: "VIxHdCsLnG64TwdaM4slC6jmFqWkXL4LbmmH1Sb7",
  paymentEnvKey: "57862XP7AB94ZSSMYZRDHTQA7W",
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
    spec_identity: {
        "source": "campaign-map-builder",
        "map_id": "lumi-v0-qdos",
        "id": "map:lumi-v0-qdos",
        "map_url": "https://campaign-map.nextcommerce.com/view/lumi-v0-qdos",
        "edit_url": "https://campaign-map.nextcommerce.com/?load=lumi-v0-qdos",
        "spec_url": "https://campaign-map.nextcommerce.com/api/spec/lumi-v0-qdos",
        "spec_hash": "sha256:2fb7fcbc2ea93ff40a84bab349a984ab907336176f890fb90bb87600b7458f79",
        "saved_at": "2026-05-18T08:23:09.803Z",
        "public_route_slug": "lumi-v0"
    }
  },
  utmTransfer: { enabled: true, applyToExternalLinks: false, debug: false }
};
