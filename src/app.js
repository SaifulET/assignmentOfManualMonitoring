const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { validateEnv } = require('./config/env');
const healthController = require('./controllers/health.controller');
const healthRoutes = require('./routes/health.routes');
const testRoutes = require('./routes/test.routes');
const metricsMiddleware = require('./middlewares/metrics.middleware');
const notFoundMiddleware = require('./middlewares/not-found.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const { register } = require('./utils/metrics');

const config = validateEnv({ requireMongo: false });
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan(config.isTest ? 'tiny' : 'combined', {
  skip: () => config.isTest
}));
app.use(metricsMiddleware);

app.get('/', healthController.root);
app.get('/metrics', async (_req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.status(200).send(await register.metrics());
  } catch (error) {
    next(error);
  }
});

app.use('/api/health', healthRoutes);
app.use('/api/tests', testRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
