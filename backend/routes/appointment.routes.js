const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const {
    createAppointmentValidation,
    updateAppointmentStatusValidation,
    uuidParamValidation,
} = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', authenticate, createAppointmentValidation, appointmentController.createAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments for current user
 * @access  Private
 * @query   status, from_date, to_date, type (upcoming/past)
 */
router.get('/', authenticate, appointmentController.getAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get specific appointment
 * @access  Private
 */
router.get('/:id', authenticate, uuidParamValidation, appointmentController.getAppointment);

/**
 * @route   PATCH /api/appointments/:id
 * @desc    Update appointment status
 * @access  Private
 */
router.patch(
    '/:id',
    authenticate,
    updateAppointmentStatusValidation,
    appointmentController.updateAppointment
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel appointment
 * @access  Private
 */
router.delete('/:id', authenticate, uuidParamValidation, appointmentController.deleteAppointment);

module.exports = router;
