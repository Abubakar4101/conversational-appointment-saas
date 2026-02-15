import { useState, useCallback } from 'react';
import appointmentService from '../services/appointment.service';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAppointments = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const data = await appointmentService.getAll(params);
            setAppointments(data.data.appointments);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    }, []);

    const createAppointment = async (data) => {
        try {
            const result = await appointmentService.create(data);
            setAppointments(prev => [...prev, result.data.appointment]);
            return result.data.appointment;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create appointment');
            throw err;
        }
    };

    const updateAppointment = async (id, data) => {
        try {
            const result = await appointmentService.update(id, data);
            setAppointments(prev => prev.map(app =>
                app.id === id ? result.data.appointment : app
            ));
            return result.data.appointment;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update appointment');
            throw err;
        }
    };

    const removeAppointment = async (id) => {
        try {
            await appointmentService.remove(id);
            setAppointments(prev => prev.filter(app => app.id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete appointment');
            throw err;
        }
    };

    return {
        appointments,
        loading,
        error,
        fetchAppointments,
        createAppointment,
        updateAppointment,
        removeAppointment
    };
};
