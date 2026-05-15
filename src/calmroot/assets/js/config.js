window.nextConfig = {
  apiKey: "AbhmIKMsCU6RUAgFfdoCHvIRtiPVHKtZJNN5eQp0",
  storeName: "test-campaign",
  currencyBehavior: "auto",
  paymentConfig: {
    expressCheckout: {
      enabled: true,
      requireValidation: true,
      requiredFields: ["email", "fname", "lname"],
      methodOrder: ["paypal", "apple_pay", "google_pay"]
    }
  },
  analytics: {
    enabled: false
  }
};
