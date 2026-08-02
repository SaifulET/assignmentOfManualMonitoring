const http = require('http');
const app = require('./app');
const { validateEnv } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');

let server;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`${signal} received. Starting graceful shutdown.`);

  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);

  forceExitTimer.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      console.log('HTTP server closed.');
    }

    await disconnectDatabase();
    console.log('MongoDB connection closed.');
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    console.error(`Graceful shutdown failed: ${error.message}`);
    process.exit(1);
  }
}

async function start() {
  const config = validateEnv({ requireMongo: true });

  await connectDatabase(config);

  server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(config.port, config.host, resolve);
  });

  const address = server.address();
  const host = address.address === '::' ? '127.0.0.1' : address.address;
  console.log(`${config.appName} listening at http://${host}:${address.port}`);
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error.message}`);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.error(`Unhandled rejection: ${message}`);
  shutdown('unhandledRejection');
});

if (require.main === module) {
  start().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  start,
  shutdown
};
