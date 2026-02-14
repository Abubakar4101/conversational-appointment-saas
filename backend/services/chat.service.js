const { query, getClient } = require('../config/database');
const { NotFoundError, AuthorizationError } = require('../utils/errorHandler');

/**
 * Create a new chat session
 */
const createSession = async (userId, businessId = null) => {
    const result = await query(
        `INSERT INTO chat_sessions (user_id, business_id, title, status, context)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
        [userId, businessId, 'New Conversation', 'active', JSON.stringify({})]
    );

    return result.rows[0];
};

/**
 * Get all sessions for a user
 */
const getUserSessions = async (userId) => {
    const result = await query(
        `SELECT cs.*, 
            (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count,
            (SELECT content FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message
     FROM chat_sessions cs
     WHERE cs.user_id = $1
     ORDER BY cs.updated_at DESC`,
        [userId]
    );

    return result.rows;
};

/**
 * Get session by ID with authorization check
 */
const getSessionById = async (sessionId, userId) => {
    const result = await query(
        'SELECT * FROM chat_sessions WHERE id = $1',
        [sessionId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError('Chat session not found');
    }

    const session = result.rows[0];

    // Authorization check
    if (session.user_id !== userId) {
        throw new AuthorizationError('Access denied to this chat session');
    }

    return session;
};

/**
 * Get session with all messages
 */
const getSessionWithMessages = async (sessionId, userId) => {
    const session = await getSessionById(sessionId, userId);

    const messagesResult = await query(
        `SELECT * FROM chat_messages 
     WHERE session_id = $1 
     ORDER BY created_at ASC`,
        [sessionId]
    );

    return {
        ...session,
        messages: messagesResult.rows,
    };
};

/**
 * Add message to session
 */
const addMessage = async (sessionId, role, content, metadata = {}) => {
    const result = await query(
        `INSERT INTO chat_messages (session_id, role, content, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [sessionId, role, content, JSON.stringify(metadata)]
    );

    // Update session's updated_at timestamp
    await query(
        'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [sessionId]
    );

    return result.rows[0];
};

/**
 * Get conversation history for AI (formatted for Mistral API)
 */
const getConversationHistory = async (sessionId) => {
    const result = await query(
        `SELECT role, content FROM chat_messages 
     WHERE session_id = $1 AND role IN ('user', 'assistant')
     ORDER BY created_at ASC`,
        [sessionId]
    );

    return result.rows;
};

/**
 * Update session context
 */
const updateSessionContext = async (sessionId, context) => {
    await query(
        'UPDATE chat_sessions SET context = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [JSON.stringify(context), sessionId]
    );
};

/**
 * Update session title
 */
const updateSessionTitle = async (sessionId, title) => {
    await query(
        'UPDATE chat_sessions SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [title, sessionId]
    );
};

/**
 * Mark session as completed and link appointment
 */
const completeSession = async (sessionId, appointmentId) => {
    await query(
        `UPDATE chat_sessions 
     SET status = 'completed', 
         appointment_created = true, 
         appointment_id = $1,
         completed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
        [appointmentId, sessionId]
    );
};

/**
 * Update session status
 */
const updateSessionStatus = async (sessionId, status) => {
    await query(
        'UPDATE chat_sessions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, sessionId]
    );
};

module.exports = {
    createSession,
    getUserSessions,
    getSessionById,
    getSessionWithMessages,
    addMessage,
    getConversationHistory,
    updateSessionContext,
    updateSessionTitle,
    completeSession,
    updateSessionStatus,
};
