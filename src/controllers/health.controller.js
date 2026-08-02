const healthService = require('../services/health.service');

function root(_req, res) {
  res.status(200).json(healthService.getRootStatus());
}

function live(_req, res) {
  res.status(200).json(healthService.getLiveness());
}

function ready(_req, res) {
  const readiness = healthService.getReadiness();
  res.status(readiness.statusCode).json(readiness.body);
}

function detailed(_req, res) {
  const health = healthService.getDetailedHealth();
  res.status(health.statusCode).json(health.body);
}

module.exports = {
  root,
  live,
  ready,
  detailed
};
