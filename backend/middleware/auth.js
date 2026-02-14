const { verifyToken } = require('../config/auth');
const { AuthenticationError, AuthorizationError } = require('../utils/errorHandler');
const { query } = require('../config/database');

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token);

        // Get user from database
        const result = await query(
            'SELECT id, email, name, role, business_id, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            throw new AuthenticationError('User not found');
        }

        const user = result.rows[0];

        if (!user.is_active) {
            throw new AuthenticationError('Account is inactive');
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AuthorizationError('Insufficient permissions'));
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize,
};
