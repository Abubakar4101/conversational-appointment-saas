const { query } = require('../config/database');
const { NotFoundError, AuthorizationError, ConflictError } = require('../utils/errorHandler');

/**
 * Create a new appointment
 */
const createAppointment = async (appointmentData) => {
    const {
        user_id,
        business_id,
        service_type,
        appointment_date,
        appointment_time,
        duration_minutes = 60,
        notes,
        created_via = 'manual',
        chat_session_id,
    } = appointmentData;

    // Check for conflicts
    const conflict = await checkConflict(
        business_id,
        appointment_date,
        appointment_time,
        duration_minutes
    );

    if (conflict) {
        throw new ConflictError('This time slot is already booked');
    }

    const result = await query(
        `INSERT INTO appointments (
      user_id, business_id, service_type, appointment_date, appointment_time,
      duration_minutes, notes, created_via, chat_session_id, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
        [
            user_id,
            business_id,
            service_type,
            appointment_date,
            appointment_time,
            duration_minutes,
            notes,
            created_via,
            chat_session_id,
            'pending',
        ]
    );

    return result.rows[0];
};

/**
 * Check for appointment conflicts
 */
const checkConflict = async (businessId, date, time, duration) => {
    // Simple conflict check - can be enhanced with more sophisticated logic
    const result = await query(
        `SELECT id FROM appointments
     WHERE business_id = $1
     AND appointment_date = $2
     AND appointment_time = $3
     AND status NOT IN ('cancelled', 'completed')
     LIMIT 1`,
        [businessId, date, time]
    );

    return result.rows.length > 0;
};

/**
 * Get all appointments for a user
 */
const getUserAppointments = async (userId, filters = {}) => {
    let queryText = `
    SELECT * FROM appointments
    WHERE user_id = $1
  `;
    const params = [userId];
    let paramCount = 1;

    // Add filters
    if (filters.status) {
        paramCount++;
        queryText += ` AND status = $${paramCount}`;
        params.push(filters.status);
    }

    if (filters.from_date) {
        paramCount++;
        queryText += ` AND appointment_date >= $${paramCount}`;
        params.push(filters.from_date);
    }

    if (filters.to_date) {
        paramCount++;
        queryText += ` AND appointment_date <= $${paramCount}`;
        params.push(filters.to_date);
    }

    queryText += ' ORDER BY appointment_date ASC, appointment_time ASC';

    const result = await query(queryText, params);
    return result.rows;
};

/**
 * Get appointment by ID with authorization check
 */
const getAppointmentById = async (appointmentId, userId) => {
    const result = await query(
        'SELECT * FROM appointments WHERE id = $1',
        [appointmentId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Appointment not found');
    }

    const appointment = result.rows[0];

    // Authorization check
    if (appointment.user_id !== userId) {
        throw new AuthorizationError('Access denied to this appointment');
    }

    return appointment;
};

/**
 * Update appointment status
 */
const updateAppointmentStatus = async (appointmentId, userId, status, cancellationReason = null) => {
    // Verify ownership
    await getAppointmentById(appointmentId, userId);

    const updates = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];
    let paramCount = 1;

    // Set timestamp based on status
    if (status === 'confirmed') {
        updates.push('confirmed_at = CURRENT_TIMESTAMP');
    } else if (status === 'cancelled') {
        updates.push('cancelled_at = CURRENT_TIMESTAMP');
        if (cancellationReason) {
            paramCount++;
            updates.push(`cancellation_reason = $${paramCount}`);
            params.push(cancellationReason);
        }
    } else if (status === 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
    }

    paramCount++;
    params.push(appointmentId);

    const result = await query(
        `UPDATE appointments
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
        params
    );

    return result.rows[0];
};

/**
 * Delete/Cancel appointment
 */
const deleteAppointment = async (appointmentId, userId) => {
    // Verify ownership
    await getAppointmentById(appointmentId, userId);

    // Soft delete by setting status to cancelled
    const result = await query(
        `UPDATE appointments
     SET status = 'cancelled',
         cancelled_at = CURRENT_TIMESTAMP,
         cancellation_reason = 'Cancelled by user',
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
        [appointmentId]
    );

    return result.rows[0];
};

/**
 * Get upcoming appointments
 */
const getUpcomingAppointments = async (userId) => {
    const result = await query(
        `SELECT * FROM appointments
     WHERE user_id = $1
     AND appointment_date >= CURRENT_DATE
     AND status NOT IN ('cancelled', 'completed')
     ORDER BY appointment_date ASC, appointment_time ASC`,
        [userId]
    );

    return result.rows;
};

/**
 * Get past appointments
 */
const getPastAppointments = async (userId) => {
    const result = await query(
        `SELECT * FROM appointments
     WHERE user_id = $1
     AND (appointment_date < CURRENT_DATE OR status IN ('cancelled', 'completed'))
     ORDER BY appointment_date DESC, appointment_time DESC`,
        [userId]
    );

    return result.rows;
};

module.exports = {
    createAppointment,
    checkConflict,
    getUserAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    deleteAppointment,
    getUpcomingAppointments,
    getPastAppointments,
};
