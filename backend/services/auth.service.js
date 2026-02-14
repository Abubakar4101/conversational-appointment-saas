const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { ConflictError, AuthenticationError, NotFoundError } = require('../utils/errorHandler');

/**
 * Create a new user
 */
const createUser = async (userData) => {
    const { email, password, name, phone, business_id } = userData;

    // Check if user already exists
    const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await query(
        `INSERT INTO users (email, password_hash, name, phone, business_id, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, name, phone, business_id, role, created_at`,
        [email, password_hash, name, phone || null, business_id || null, 'customer']
    );

    return result.rows[0];
};

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
    const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    return result.rows[0] || null;
};

/**
 * Find user by ID
 */
const findUserById = async (userId) => {
    const result = await query(
        'SELECT id, email, name, phone, business_id, role, is_active, email_verified, created_at FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    return result.rows[0];
};

/**
 * Verify user password
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Update user's last login timestamp
 */
const updateLastLogin = async (userId) => {
    await query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
    );
};

/**
 * Authenticate user with email and password
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new AuthenticationError('Invalid email or password');
    }

    if (!user.is_active) {
        throw new AuthenticationError('Account is inactive');
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await updateLastLogin(user.id);

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    verifyPassword,
    updateLastLogin,
    authenticateUser,
};
