const authService = require('../services/auth.service');
const { generateToken, generateRefreshToken } = require('../config/auth');
const { asyncHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, name, phone } = req.body;

    // Create user
    const user = await authService.createUser({
        email,
        password,
        name,
        phone,
    });

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
            user,
            token,
            refreshToken,
        },
    });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Authenticate user
    const user = await authService.authenticateUser(email, password);

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
            user,
            token,
            refreshToken,
        },
    });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AuthenticationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Get user
    const user = await authService.findUserById(decoded.userId);

    // Generate new access token
    const newToken = generateToken({ userId: user.id, email: user.email });

    logger.info('Token refreshed successfully', { userId: user.id });

    res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
            token: newToken,
        },
    });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.findUserById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

module.exports = {
    register,
    login,
    refresh,
    getProfile,
};
