import api from '../api/api';

/**
 * Service for chat/AI related API calls
 */
const chatService = {
    /**
     * Create a new chat session
     */
    createSession: async () => {
        const response = await api.post('/chat/sessions');
        return response.data;
    },

    /**
     * Send a message to the AI
     * @param {string} sessionId 
     * @param {string} message 
     */
    sendMessage: async (sessionId, message) => {
        const response = await api.post(`/chat/sessions/${sessionId}/messages`, { message });
        return response.data;
    },

    /**
     * Get chat session history
     * @param {string} sessionId 
     */
    getSession: async (sessionId) => {
        const response = await api.get(`/chat/sessions/${sessionId}`);
        return response.data;
    }
};

export default chatService;
