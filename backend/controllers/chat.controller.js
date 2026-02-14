const chatService = require('../services/chat.service');
const aiService = require('../services/ai.service');
const { asyncHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Create a new chat session
 * POST /api/chat/sessions
 */
const createSession = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const businessId = req.user.business_id;

    const session = await chatService.createSession(userId, businessId);

    logger.info('Chat session created', { sessionId: session.id, userId });

    res.status(201).json({
        status: 'success',
        message: 'Chat session created successfully',
        data: {
            session,
        },
    });
});

/**
 * Get all chat sessions for current user
 * GET /api/chat/sessions
 */
const getSessions = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const sessions = await chatService.getUserSessions(userId);

    res.status(200).json({
        status: 'success',
        data: {
            sessions,
            count: sessions.length,
        },
    });
});

/**
 * Get specific chat session with messages
 * GET /api/chat/sessions/:id
 */
const getSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await chatService.getSessionWithMessages(id, userId);

    res.status(200).json({
        status: 'success',
        data: {
            session,
        },
    });
});

/**
 * Send message and get AI response
 * POST /api/chat/sessions/:id/messages
 */
const sendMessage = asyncHandler(async (req, res) => {
    const { id: sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // Verify session ownership
    await chatService.getSessionById(sessionId, userId);

    // Save user message
    await chatService.addMessage(sessionId, 'user', message);

    // Get conversation history
    const conversationHistory = await chatService.getConversationHistory(sessionId);

    // Generate AI response
    const aiResponse = await aiService.generateChatResponse(conversationHistory);

    // Save AI response
    await chatService.addMessage(
        sessionId,
        'assistant',
        aiResponse.content,
        aiResponse.metadata
    );

    // Try to extract appointment details
    let appointmentDetails = null;
    try {
        const extracted = await aiService.extractAppointmentDetails(conversationHistory);

        if (extracted.has_booking_intent) {
            appointmentDetails = {
                service_type: extracted.service_type,
                appointment_date: extracted.appointment_date,
                appointment_time: extracted.appointment_time,
                notes: extracted.notes,
                is_complete: extracted.is_complete,
            };

            // Update session context with extracted details
            await chatService.updateSessionContext(sessionId, {
                extracted_details: appointmentDetails,
                last_extraction: new Date().toISOString(),
            });
        }
    } catch (extractionError) {
        logger.warn('Failed to extract appointment details', {
            sessionId,
            error: extractionError.message,
        });
    }

    logger.info('Chat message processed', {
        sessionId,
        userId,
        hasAppointmentDetails: !!appointmentDetails,
    });

    res.status(200).json({
        status: 'success',
        data: {
            message: {
                role: 'assistant',
                content: aiResponse.content,
            },
            appointmentDetails,
        },
    });
});

module.exports = {
    createSession,
    getSessions,
    getSession,
    sendMessage,
};
