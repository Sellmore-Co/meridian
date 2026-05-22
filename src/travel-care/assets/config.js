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
  storeName: "Keer",
  qa: {
    spec_identity: {
        "source": "campaign-map-builder",
        "map_id": "travel-oral-care-bundle-tez-kx4f",
        "id": "map:travel-oral-care-bundle-tez-kx4f",
        "map_url": "https://campaign-map.nextcommerce.com/view/travel-oral-care-bundle-tez-kx4f",
        "edit_url": "https://campaign-map.nextcommerce.com/?load=travel-oral-care-bundle-tez-kx4f",
        "spec_url": "https://campaign-map.nextcommerce.com/api/spec/travel-oral-care-bundle-tez-kx4f",
        "spec_hash": "sha256:8ad642d6f29f64e2cebcbd2af2c4c5671c766b43fe9f22949be72eb1ba46a7b9",
        "saved_at": "2026-05-21T19:59:01.158Z",
        "public_route_slug": "travel-oral-care-bundle-tez"
    }
  },
  utmTransfer: { enabled: true, applyToExternalLinks: false, debug: false }
};
