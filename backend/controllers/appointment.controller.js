const appointmentService = require('../services/appointment.service');
const chatService = require('../services/chat.service');
const { asyncHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new appointment
 * POST /api/appointments
 */
const createAppointment = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const businessId = req.user.business_id;
    const { service_type, appointment_date, appointment_time, duration_minutes, notes, chat_session_id } = req.body;

    const appointment = await appointmentService.createAppointment({
        user_id: userId,
        business_id: businessId,
        service_type,
        appointment_date,
        appointment_time,
        duration_minutes,
        notes,
        created_via: chat_session_id ? 'ai_chat' : 'manual',
        chat_session_id,
    });

    // If created from chat, update the chat session
    if (chat_session_id) {
        await chatService.completeSession(chat_session_id, appointment.id);
        await chatService.updateSessionTitle(
            chat_session_id,
            `${service_type} - ${appointment_date}`
        );
        // Add a final confirmation message from the AI
        await chatService.addMessage(
            chat_session_id,
            'assistant',
            `Perfect! I've booked your ${service_type} for ${appointment_date} at ${appointment_time.slice(0, 5)}. You can see it in your dashboard.`
        );
    }

    logger.info('Appointment created', {
        appointmentId: appointment.id,
        userId,
        serviceType: service_type,
        createdVia: appointment.created_via,
    });

    res.status(201).json({
        status: 'success',
        message: 'Appointment created successfully',
        data: {
            appointment,
        },
    });
});

/**
 * Get all appointments for current user
 * GET /api/appointments
 */
const getAppointments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status, from_date, to_date, type } = req.query;

    let appointments;

    if (type === 'upcoming') {
        appointments = await appointmentService.getUpcomingAppointments(userId);
    } else if (type === 'past') {
        appointments = await appointmentService.getPastAppointments(userId);
    } else {
        const filters = {};
        if (status) filters.status = status;
        if (from_date) filters.from_date = from_date;
        if (to_date) filters.to_date = to_date;
        if (req.query.search) filters.search = req.query.search;

        appointments = await appointmentService.getUserAppointments(userId, filters);
    }

    res.status(200).json({
        status: 'success',
        data: {
            appointments,
            count: appointments.length,
        },
    });
});

/**
 * Get specific appointment
 * GET /api/appointments/:id
 */
const getAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await appointmentService.getAppointmentById(id, userId);

    res.status(200).json({
        status: 'success',
        data: {
            appointment,
        },
    });
});

/**
 * Update appointment status
 * PATCH /api/appointments/:id
 */
const updateAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, cancellation_reason } = req.body;

    const appointment = await appointmentService.updateAppointment(
        id,
        userId,
        req.body
    );

    logger.info('Appointment status updated', {
        appointmentId: id,
        userId,
        newStatus: status,
    });

    res.status(200).json({
        status: 'success',
        message: 'Appointment updated successfully',
        data: {
            appointment,
        },
    });
});

/**
 * Cancel/Delete appointment
 * DELETE /api/appointments/:id
 */
const deleteAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await appointmentService.removeAppointment(id, userId);

    logger.info('Appointment cancelled', {
        appointmentId: id,
        userId,
    });

    res.status(200).json({
        status: 'success',
        message: 'Appointment cancelled successfully',
        data: {
            appointment,
        },
    });
});

module.exports = {
    createAppointment,
    getAppointments,
    getAppointment,
    updateAppointment,
    deleteAppointment,
};
