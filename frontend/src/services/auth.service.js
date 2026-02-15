import api from '../api/api';

/**
 * Service for authentication related API calls
 */
const authService = {
    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    /**
     * Register new user
     * @param {Object} userData 
     */
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    /**
     * Get current user profile
     */
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export default authService;
