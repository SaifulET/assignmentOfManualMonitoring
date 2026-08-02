const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const VALID_NODE_ENVS = new Set(['development', 'test', 'production']);

let cachedOptionalConfig;
let cachedRequiredMongoConfig;

function parsePort(rawPort, errors) {
  const value = rawPort === undefined || rawPort === '' ? '5000' : rawPort;
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push('PORT must be an integer from 1 to 65535.');
    return 5000;
  }

  return port;
}

function validateEnv(options = {}) {
  const requireMongo = Boolean(options.requireMongo);

  if (requireMongo && cachedRequiredMongoConfig) {
    return cachedRequiredMongoConfig;
  }

  if (!requireMongo && cachedOptionalConfig) {
    return cachedOptionalConfig;
  }

  const errors = [];
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!VALID_NODE_ENVS.has(nodeEnv)) {
    errors.push('NODE_ENV must be one of: development, test, production.');
  }

  const mongoUri = process.env.MONGO_URI;

  if (requireMongo && (!mongoUri || mongoUri.trim() === '')) {
    errors.push('MONGO_URI is required when starting the server.');
  }

  const config = Object.freeze({
    nodeEnv,
    host: process.env.HOST || '127.0.0.1',
    port: parsePort(process.env.PORT, errors),
    appName: process.env.APP_NAME || 'node-ec2-backend',
    appVersion: process.env.APP_VERSION || '1.0.0',
    mongoUri,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    logLevel: process.env.LOG_LEVEL || 'debug',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    isDevelopment: nodeEnv === 'development'
  });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }

  if (requireMongo) {
    cachedRequiredMongoConfig = config;
  } else {
    cachedOptionalConfig = config;
  }

  return config;
}

module.exports = {
  validateEnv
};
