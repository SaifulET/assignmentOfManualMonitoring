const { validateEnv } = require('../config/env');
const { isDatabaseReady } = require('../config/database');

function getRootStatus() {
  const config = validateEnv({ requireMongo: false });

  return {
    success: true,
    data: {
      application: config.appName,
      version: config.appVersion,
      environment: config.nodeEnv,
      status: 'running',
      timestamp: new Date().toISOString()
    }
  };
}

function getLiveness() {
  return {
    success: true,
    status: 'alive',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  };
}

function getReadiness() {
  const ready = isDatabaseReady();

  return {
    statusCode: ready ? 200 : 503,
    body: {
      success: ready,
      status: ready ? 'ready' : 'not_ready',
      database: ready ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    }
  };
}

function getDetailedHealth() {
  const config = validateEnv({ requireMongo: false });
  const ready = isDatabaseReady();

  return {
    statusCode: ready ? 200 : 503,
    body: {
      success: ready,
      status: ready ? 'ready' : 'not_ready',
      application: config.appName,
      version: config.appVersion,
      environment: config.nodeEnv,
      database: ready ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      pid: process.pid,
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
  getRootStatus,
  getLiveness,
  getReadiness,
  getDetailedHealth
};
