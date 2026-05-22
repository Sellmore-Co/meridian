// Configure before Campaign Cart SDK loads.
window.dataLayer = window.dataLayer || [];
window.nextReady = window.nextReady || [];

window.nextConfig = {
  apiKey: "4tROXh0yZjnHQRjnNEfbhF08UQ7XvgokBky9paP0",
  paymentEnvKey: "57862XP7AB94ZSSMYZRDHTQA7W",
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
  storeName: "DentaStream",
  qa: {
    spec_identity: {
        "source": "campaign-map-builder",
        "map_id": "travel-oral-care-bundle-tez-1td7",
        "id": "map:travel-oral-care-bundle-tez-1td7",
        "map_url": "https://campaign-map.nextcommerce.com/view/travel-oral-care-bundle-tez-1td7",
        "edit_url": "https://campaign-map.nextcommerce.com/?load=travel-oral-care-bundle-tez-1td7",
        "spec_url": "https://campaign-map.nextcommerce.com/api/spec/travel-oral-care-bundle-tez-1td7",
        "spec_hash": "sha256:ccd74f03830566d14621d91c12c615f0ff811120b71bb9fbfc69d0bcb7cb68d6",
        "saved_at": "2026-05-22T05:32:59.739Z",
        "public_route_slug": "travel-oral-care-bundle-tez"
    }
  },
  utmTransfer: { enabled: true, applyToExternalLinks: false, debug: false }
};
