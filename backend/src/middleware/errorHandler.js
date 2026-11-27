const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return sendError(res, messages.join(', '), 400);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `${field} already exists`, 400);
  }
  if (err.name === 'CastError') return sendError(res, 'Invalid ID format', 400);
  return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;
