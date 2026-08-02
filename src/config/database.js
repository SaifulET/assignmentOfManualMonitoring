const mongoose = require('mongoose');
const { databaseConnectionStatus } = require('../utils/metrics');

let listenersRegistered = false;

function redactMongoUri(uri) {
  if (!uri) {
    return 'not configured';
  }

  try {
    const parsed = new URL(uri);
    const database = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
    return `${parsed.protocol}//${parsed.host}${database}`;
  } catch (_error) {
    return 'configured MongoDB URI';
  }
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

function updateDatabaseMetric() {
  databaseConnectionStatus.set(isDatabaseReady() ? 1 : 0);
}

function registerConnectionListeners() {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    updateDatabaseMetric();
    console.log('MongoDB connected.');
  });

  mongoose.connection.on('disconnected', () => {
    updateDatabaseMetric();
    console.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    updateDatabaseMetric();
    console.log('MongoDB reconnected.');
  });

  mongoose.connection.on('error', (error) => {
    updateDatabaseMetric();
    console.error(`MongoDB connection error: ${error.message}`);
  });
}

async function connectDatabase(config) {
  if (!config || !config.mongoUri) {
    throw new Error('MONGO_URI is required to connect to MongoDB.');
  }

  registerConnectionListeners();

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    updateDatabaseMetric();
    console.log(`MongoDB connection established: ${redactMongoUri(config.mongoUri)}`);
  } catch (error) {
    updateDatabaseMetric();
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    updateDatabaseMetric();
    return;
  }

  await mongoose.disconnect();
  updateDatabaseMetric();
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  isDatabaseReady
};
