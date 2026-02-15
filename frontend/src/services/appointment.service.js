import api from '../api/api';

/**
 * Service for appointment related API calls
 */
const appointmentService = {
    /**
     * Fetch all appointments with optional filters
     * @param {Object} params 
     */
    getAll: async (params = {}) => {
        const response = await api.get('/appointments', { params });
        return response.data;
    },

    /**
     * Fetch a single appointment by ID
     * @param {string} id 
     */
    getById: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    /**
     * Create a new appointment
     * @param {Object} data 
     */
    create: async (data) => {
        const response = await api.post('/appointments', data);
        return response.data;
    },

    /**
     * Update appointment details
     * @param {string} id 
     * @param {Object} data 
     */
    update: async (id, data) => {
        const response = await api.patch(`/appointments/${id}`, data);
        return response.data;
    },

    /**
     * Permanently remove an appointment
     * @param {string} id 
     */
    remove: async (id) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    }
};

export default appointmentService;
