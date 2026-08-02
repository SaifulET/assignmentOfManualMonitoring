const mongoose = require('mongoose');
const ApiError = require('../utils/api-error');
const { validateEnv } = require('../config/env');

function formatMongooseValidationError(error) {
  return Object.values(error.errors).map((item) => ({
    field: item.path,
    message: item.message
  }));
}

function errorMiddleware(error, _req, res, _next) {
  const config = validateEnv({ requireMongo: false });
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errors = error.errors || [];

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid identifier format.';
    errors = [{ field: error.path, message }];
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed.';
    errors = formatMongooseValidationError(error);
  } else if (error && error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value violates a unique constraint.';
    errors = Object.keys(error.keyValue || {}).map((field) => ({
      field,
      message: `${field} must be unique.`
    }));
  } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'Malformed JSON request body.';
    errors = [];
  } else if (!(error instanceof ApiError) && statusCode < 500) {
    message = error.message || message;
  } else if (!(error instanceof ApiError) && statusCode >= 500) {
    message = 'Internal server error';
  }

  const response = {
    success: false,
    message,
    errors
  };

  if (!config.isProduction && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorMiddleware;
