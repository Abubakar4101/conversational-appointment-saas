const logger = require('./logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

/**
 * Custom error class for authentication errors
 */
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

/**
 * Custom error class for authorization errors
 */
class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

/**
 * Custom error class for not found errors
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

/**
 * Custom error class for conflict errors
 */
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log error
    logger.error('Error:', {
        message: error.message,
        statusCode: error.statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // PostgreSQL errors
    if (err.code === '23505') {
        // Unique constraint violation
        error = new ConflictError('Duplicate entry. Resource already exists.');
    } else if (err.code === '23503') {
        // Foreign key violation
        error = new ValidationError('Invalid reference. Related resource not found.');
    } else if (err.code === '22P02') {
        // Invalid text representation
        error = new ValidationError('Invalid data format.');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AuthenticationError('Invalid token');
    } else if (err.name === 'TokenExpiredError') {
        error = new AuthenticationError('Token expired');
    }

    // Validation errors from express-validator
    if (err.errors && Array.isArray(err.errors)) {
        error = new ValidationError('Validation failed', err.errors);
    }

    // Send error response
    const response = {
        status: error.status || 'error',
        message: error.message || 'Internal server error',
    };

    // Include errors array for validation errors
    if (error.errors) {
        response.errors = error.errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(error.statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    errorHandler,
    asyncHandler,
};
