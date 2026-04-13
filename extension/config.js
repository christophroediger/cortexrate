(function cortexRateExtensionConfigBootstrap() {
  const config = {
    environment: "development",
    developmentBaseUrl: "http://localhost:3000",
    productionBaseUrl: "https://cortexrate.app"
  };

  config.baseUrl =
    config.environment === "production" ? config.productionBaseUrl : config.developmentBaseUrl;

  globalThis.CORTEXRATE_EXTENSION_CONFIG = config;
})();
