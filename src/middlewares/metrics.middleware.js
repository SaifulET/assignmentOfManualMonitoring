const {
  activeRequests,
  getRouteLabel,
  httpErrorsTotal,
  httpRequestDurationSeconds,
  httpRequestsTotal
} = require('../utils/metrics');

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  const startTime = process.hrtime.bigint();
  let recorded = false;

  activeRequests.inc();

  function recordMetrics() {
    if (recorded) {
      return;
    }

    recorded = true;
    activeRequests.dec();

    const durationSeconds = Number(process.hrtime.bigint() - startTime) / 1e9;
    const labels = {
      method: req.method,
      route: getRouteLabel(req),
      status_code: String(res.statusCode)
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc(labels);
    }
  }

  res.on('finish', recordMetrics);
  res.on('close', recordMetrics);

  return next();
}

module.exports = metricsMiddleware;
