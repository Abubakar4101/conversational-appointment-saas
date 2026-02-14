const axios = require('axios');
const logger = require('../utils/logger');

const MISTRAL_API_URL = process.env.MISTRAL_API_URL || 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';

/**
 * System prompt for the AI assistant
 */
const SYSTEM_PROMPT = `You are a helpful appointment booking assistant. Your role is to:
1. Help users book appointments by understanding their needs
2. Extract appointment details: service type, date, and time
3. Ask clarifying questions if information is missing
4. Be friendly, professional, and concise

When a user provides booking information, extract it in this JSON format:
{
  "intent": "book_appointment",
  "service_type": "service name",
  "appointment_date": "YYYY-MM-DD",
  "appointment_time": "HH:MM",
  "notes": "any additional notes"
}

If information is incomplete, ask specific questions to gather missing details.
Always confirm the appointment details before finalizing.`;

/**
 * Call Mistral AI chat completion API
 */
const getChatCompletion = async (messages) => {
    try {
        const startTime = Date.now();

        const response = await axios.post(
            MISTRAL_API_URL,
            {
                model: MISTRAL_MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                },
                timeout: 30000, // 30 second timeout
            }
        );

        const processingTime = Date.now() - startTime;

        // Log AI interaction
        logger.info('Mistral AI request completed', {
            model: MISTRAL_MODEL,
            tokensUsed: response.data.usage?.total_tokens,
            processingTime: `${processingTime}ms`,
        });

        return {
            content: response.data.choices[0].message.content,
            metadata: {
                model: MISTRAL_MODEL,
                tokens: response.data.usage?.total_tokens,
                processing_time_ms: processingTime,
                finish_reason: response.data.choices[0].finish_reason,
            },
        };
    } catch (error) {
        logger.error('Mistral AI request failed', {
            error: error.message,
            response: error.response?.data,
        });

        // Fallback response if AI fails
        if (error.response?.status === 401) {
            throw new Error('AI service authentication failed. Please check API key.');
        } else if (error.response?.status === 429) {
            throw new Error('AI service rate limit exceeded. Please try again later.');
        } else {
            throw new Error('AI service is currently unavailable. Please try again later.');
        }
    }
};

/**
 * Generate AI response for chat conversation
 */
const generateChatResponse = async (conversationHistory) => {
    // Prepare messages with system prompt
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
    ];

    return await getChatCompletion(messages);
};

/**
 * Extract appointment details from conversation
 * Uses AI to parse user intent and extract structured data
 */
const extractAppointmentDetails = async (conversationHistory) => {
    try {
        const extractionPrompt = `Based on the conversation history, extract appointment booking details if the user has provided them.
Return ONLY a JSON object with these fields (use null for missing information):
{
  "has_booking_intent": boolean,
  "service_type": string or null,
  "appointment_date": "YYYY-MM-DD" or null,
  "appointment_time": "HH:MM" or null,
  "notes": string or null,
  "is_complete": boolean (true if all required fields are present)
}`;

        const messages = [
            { role: 'system', content: extractionPrompt },
            ...conversationHistory,
        ];

        const response = await getChatCompletion(messages);

        // Parse JSON response
        try {
            const extracted = JSON.parse(response.content);

            logger.info('Appointment details extracted', { extracted });

            return extracted;
        } catch (parseError) {
            logger.warn('Failed to parse AI extraction response', {
                response: response.content,
            });

            // Return default structure if parsing fails
            return {
                has_booking_intent: false,
                service_type: null,
                appointment_date: null,
                appointment_time: null,
                notes: null,
                is_complete: false,
            };
        }
    } catch (error) {
        logger.error('Appointment extraction failed', { error: error.message });
        throw error;
    }
};

/**
 * Validate extracted appointment details
 */
const validateAppointmentDetails = (details) => {
    const errors = [];

    if (!details.service_type) {
        errors.push('Service type is required');
    }

    if (!details.appointment_date) {
        errors.push('Appointment date is required');
    } else {
        // Validate date format and future date
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(details.appointment_date)) {
            errors.push('Invalid date format. Use YYYY-MM-DD');
        } else {
            const appointmentDate = new Date(details.appointment_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (appointmentDate < today) {
                errors.push('Appointment date cannot be in the past');
            }
        }
    }

    if (!details.appointment_time) {
        errors.push('Appointment time is required');
    } else {
        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(details.appointment_time)) {
            errors.push('Invalid time format. Use HH:MM');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

module.exports = {
    generateChatResponse,
    extractAppointmentDetails,
    validateAppointmentDetails,
};
