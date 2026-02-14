const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { chatMessageValidation, uuidParamValidation } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/chat/sessions
 * @desc    Create a new chat session
 * @access  Private
 */
router.post('/sessions', authenticate, chatController.createSession);

/**
 * @route   GET /api/chat/sessions
 * @desc    Get all chat sessions for current user
 * @access  Private
 */
router.get('/sessions', authenticate, chatController.getSessions);

/**
 * @route   GET /api/chat/sessions/:id
 * @desc    Get specific chat session with messages
 * @access  Private
 */
router.get('/sessions/:id', authenticate, uuidParamValidation, chatController.getSession);

/**
 * @route   POST /api/chat/sessions/:id/messages
 * @desc    Send message and get AI response
 * @access  Private
 */
router.post(
    '/sessions/:id/messages',
    authenticate,
    aiLimiter,
    chatMessageValidation,
    chatController.sendMessage
);

module.exports = router;
