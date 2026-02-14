const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errorHandler');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value,
        }));
        return next(new ValidationError('Validation failed', formattedErrors));
    }
    next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters'),
    body('phone')
        .optional()
        .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
        .withMessage('Please provide a valid phone number'),
    validate,
];

/**
 * Validation rules for user login
 */
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate,
];

/**
 * Validation rules for creating an appointment
 */
const createAppointmentValidation = [
    body('service_type')
        .trim()
        .notEmpty()
        .withMessage('Service type is required')
        .isLength({ max: 255 })
        .withMessage('Service type must not exceed 255 characters'),
    body('appointment_date')
        .isDate()
        .withMessage('Please provide a valid date (YYYY-MM-DD)')
        .custom((value) => {
            const appointmentDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (appointmentDate < today) {
                throw new Error('Appointment date cannot be in the past');
            }
            return true;
        }),
    body('appointment_time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please provide a valid time (HH:MM)'),
    body('duration_minutes')
        .optional()
        .isInt({ min: 15, max: 480 })
        .withMessage('Duration must be between 15 and 480 minutes'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    validate,
];

/**
 * Validation rules for updating appointment status
 */
const updateAppointmentStatusValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid appointment ID'),
    body('status')
        .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
        .withMessage('Invalid status value'),
    body('cancellation_reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Cancellation reason must not exceed 500 characters'),
    validate,
];

/**
 * Validation rules for chat messages
 */
const chatMessageValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid session ID'),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ max: 2000 })
        .withMessage('Message must not exceed 2000 characters'),
    validate,
];

/**
 * Validation rules for UUID parameters
 */
const uuidParamValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid ID format'),
    validate,
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    createAppointmentValidation,
    updateAppointmentStatusValidation,
    chatMessageValidation,
    uuidParamValidation,
};
