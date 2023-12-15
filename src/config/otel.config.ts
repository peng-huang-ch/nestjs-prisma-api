export function getOtelOptions() {
  return {
    metrics: {
      hostMetrics: true,
      apiMetrics: {
        enable: true,
      },
      defaultAttributes: {
        // You can set default labels for api metrics
        // custom: 'label',
      },
      ignoreRoutes: ['/favicon.ico'], // You can ignore specific routes (See https://docs.nestjs.com/middleware#excluding-routes for options)
      ignoreUndefinedRoutes: false, //Records metrics for all URLs, even undefined ones
    },
  };
}
