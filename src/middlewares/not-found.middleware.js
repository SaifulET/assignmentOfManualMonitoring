const ApiError = require('../utils/api-error');

function notFoundMiddleware(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = notFoundMiddleware;
