const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
        });
        res.status(429).json({
            status: 'error',
            message: 'Too many requests from this IP, please try again later.',
        });
    },
});

/**
 * Authentication endpoints rate limiter
 * Limits: 5 requests per 15 minutes (stricter for security)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.',
    },
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        logger.warn('Auth rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            email: req.body.email,
        });
        res.status(429).json({
            status: 'error',
            message: 'Too many authentication attempts, please try again later.',
        });
    },
});

/**
 * AI/Chat endpoints rate limiter
 * Limits: 20 requests per 15 minutes (moderate for AI calls)
 */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 20,
    message: {
        status: 'error',
        message: 'Too many AI requests, please try again later.',
    },
    handler: (req, res) => {
        logger.warn('AI rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            userId: req.user?.id,
        });
        res.status(429).json({
            status: 'error',
            message: 'Too many AI requests, please try again later.',
        });
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    aiLimiter,
};
