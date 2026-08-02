const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
  prefix: 'node_app_',
  register
});

const httpRequestsTotal = new client.Counter({
  name: 'node_app_http_requests_total',
  help: 'Total number of HTTP requests.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'node_app_http_request_duration_seconds',
  help: 'HTTP request duration in seconds.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register]
});

const httpErrorsTotal = new client.Counter({
  name: 'node_app_http_errors_total',
  help: 'Total number of HTTP error responses.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const activeRequests = new client.Gauge({
  name: 'node_app_active_requests',
  help: 'Number of active HTTP requests.',
  registers: [register]
});

const databaseConnectionStatus = new client.Gauge({
  name: 'node_app_database_connection_status',
  help: 'MongoDB connection status. 1 means connected and 0 means disconnected.',
  registers: [register]
});

databaseConnectionStatus.set(0);

function normalizeRoutePath(path) {
  const pathname = (path || '/').split('?')[0] || '/';

  if (pathname === '/') {
    return '/';
  }

  return pathname
    .split('/')
    .map((segment) => {
      if (!segment) {
        return segment;
      }

      if (/^[a-f\d]{24}$/i.test(segment)) {
        return ':id';
      }

      if (/^\d+$/.test(segment)) {
        return ':id';
      }

      if (/^[A-Za-z]+-\d+[A-Za-z0-9-]*$/.test(segment)) {
        return ':id';
      }

      if (/^[A-Za-z0-9_-]{8,}$/.test(segment) && /\d/.test(segment)) {
        return ':id';
      }

      return segment;
    })
    .join('/');
}

function getRouteLabel(req) {
  if (req.route && req.route.path) {
    const routePath = Array.isArray(req.route.path) ? req.route.path[0] : req.route.path;
    return `${req.baseUrl || ''}${routePath}` || '/';
  }

  return normalizeRoutePath(req.path || req.originalUrl || '/');
}

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  httpErrorsTotal,
  activeRequests,
  databaseConnectionStatus,
  getRouteLabel,
  normalizeRoutePath
};
