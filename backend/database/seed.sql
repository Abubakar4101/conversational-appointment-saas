-- ============================================
-- AI Appointment Platform - Sample Data
-- ============================================
-- Sample insert statements for testing and demonstration

-- ============================================
-- SAMPLE BUSINESSES
-- ============================================
INSERT INTO businesses (id, name, slug, email, phone, timezone, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Acme Salon & Spa', 'acme-salon', 'contact@acmesalon.com', '+1-555-0100', 'America/New_York', true),
('650e8400-e29b-41d4-a716-446655440002', 'TechCare Medical', 'techcare-medical', 'info@techcaremedical.com', '+1-555-0200', 'America/Los_Angeles', true),
('650e8400-e29b-41d4-a716-446655440003', 'Elite Fitness Center', 'elite-fitness', 'hello@elitefitness.com', '+1-555-0300', 'America/Chicago', true);

-- ============================================
-- SAMPLE USERS
-- ============================================
-- Password for all demo users: "Password123!"
-- Hash generated using bcrypt with salt rounds = 10

INSERT INTO users (id, email, password_hash, name, phone, business_id, role, email_verified) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'john.doe@example.com',
    '$2a$10$rZ7YvqVqZ5YvqVqZ5YvqVeK5YvqVqZ5YvqVqZ5YvqVqZ5YvqVqZ5Y', -- Password123!
    'John Doe',
    '+1-555-0101',
    '650e8400-e29b-41d4-a716-446655440001',
    'customer',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'jane.smith@example.com',
    '$2a$10$rZ7YvqVqZ5YvqVqZ5YvqVeK5YvqVqZ5YvqVqZ5YvqVqZ5YvqVqZ5Y', -- Password123!
    'Jane Smith',
    '+1-555-0102',
    '650e8400-e29b-41d4-a716-446655440001',
    'customer',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'admin@salonpro.com',
    '$2a$10$rZ7YvqVqZ5YvqVqZ5YvqVeK5YvqVqZ5YvqVqZ5YvqVqZ5YvqVqZ5Y', -- Password123!
    'Admin User',
    '+1-555-0103',
    '650e8400-e29b-41d4-a716-446655440001',
    'admin',
    true
);

-- ============================================
-- SAMPLE APPOINTMENTS
-- ============================================

INSERT INTO appointments (
    id, user_id, business_id, service_type, appointment_date, appointment_time, 
    duration_minutes, status, notes, created_via
) VALUES
-- Upcoming appointments
(
    '750e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Haircut',
    CURRENT_DATE + INTERVAL '2 days',
    '10:00:00',
    60,
    'confirmed',
    'Regular haircut, short on sides',
    'ai_chat'
),
(
    '750e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'Hair Coloring',
    CURRENT_DATE + INTERVAL '5 days',
    '14:00:00',
    120,
    'pending',
    'Full color treatment, blonde highlights',
    'manual'
),
(
    '750e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Beard Trim',
    CURRENT_DATE + INTERVAL '1 day',
    '15:30:00',
    30,
    'confirmed',
    'Beard shaping and trim',
    'ai_chat'
),
-- Past appointments
(
    '750e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'Manicure',
    CURRENT_DATE - INTERVAL '3 days',
    '11:00:00',
    45,
    'completed',
    'French manicure',
    'manual'
),
(
    '750e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Haircut',
    CURRENT_DATE - INTERVAL '7 days',
    '09:00:00',
    60,
    'completed',
    'Previous haircut appointment',
    'ai_chat'
),
-- Cancelled appointment
(
    '750e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'Facial Treatment',
    CURRENT_DATE + INTERVAL '3 days',
    '16:00:00',
    90,
    'cancelled',
    'Deep cleansing facial',
    'manual'
);

-- ============================================
-- SAMPLE CHAT SESSIONS
-- ============================================

INSERT INTO chat_sessions (
    id, user_id, business_id, title, status, context, 
    appointment_created, appointment_id
) VALUES
(
    '850e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Haircut Booking - Feb 16',
    'completed',
    '{"service": "Haircut", "date": "2026-02-16", "time": "10:00", "extracted": true}',
    true,
    '750e8400-e29b-41d4-a716-446655440001'
),
(
    '850e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Beard Trim Inquiry',
    'completed',
    '{"service": "Beard Trim", "date": "2026-02-15", "time": "15:30", "extracted": true}',
    true,
    '750e8400-e29b-41d4-a716-446655440003'
),
(
    '850e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'General Inquiry',
    'active',
    '{"intent": "information_gathering"}',
    false,
    NULL
);

-- ============================================
-- SAMPLE CHAT MESSAGES
-- ============================================

-- Chat session 1: Successful haircut booking
INSERT INTO chat_messages (session_id, role, content, metadata) VALUES
(
    '850e8400-e29b-41d4-a716-446655440001',
    'user',
    'Hi, I need to book a haircut appointment',
    '{"timestamp": "2026-02-14T09:00:00Z"}'
),
(
    '850e8400-e29b-41d4-a716-446655440001',
    'assistant',
    'Hello! I''d be happy to help you book a haircut appointment. When would you like to schedule it?',
    '{"model": "mistral-small-latest", "tokens": 25, "processing_time_ms": 450}'
),
(
    '850e8400-e29b-41d4-a716-446655440001',
    'user',
    'How about this Saturday at 10 AM?',
    '{"timestamp": "2026-02-14T09:01:00Z"}'
),
(
    '850e8400-e29b-41d4-a716-446655440001',
    'assistant',
    'Perfect! I can book you for a haircut this Saturday, February 16th at 10:00 AM. The appointment will be for 60 minutes. Would you like to proceed with this booking?',
    '{"model": "mistral-small-latest", "tokens": 42, "processing_time_ms": 520, "extracted_data": {"service": "Haircut", "date": "2026-02-16", "time": "10:00"}}'
),
(
    '850e8400-e29b-41d4-a716-446655440001',
    'user',
    'Yes, please book it',
    '{"timestamp": "2026-02-14T09:02:00Z"}'
),
(
    '850e8400-e29b-41d4-a716-446655440001',
    'assistant',
    'Great! Your haircut appointment has been successfully booked for Saturday, February 16th at 10:00 AM. You''ll receive a confirmation email shortly. Is there anything else I can help you with?',
    '{"model": "mistral-small-latest", "tokens": 38, "processing_time_ms": 480, "appointment_created": true}'
);

-- Chat session 2: Beard trim booking
INSERT INTO chat_messages (session_id, role, content, metadata) VALUES
(
    '850e8400-e29b-41d4-a716-446655440002',
    'user',
    'I want to get my beard trimmed tomorrow afternoon',
    '{"timestamp": "2026-02-14T10:00:00Z"}'
),
(
    '850e8400-e29b-41d4-a716-446655440002',
    'assistant',
    'I can help you with that! For a beard trim tomorrow afternoon, what time works best for you? We have slots available at 2:00 PM, 3:30 PM, and 4:00 PM.',
    '{"model": "mistral-small-latest", "tokens": 45, "processing_time_ms": 510}'
),
(
    '850e8400-e29b-41d4-a716-446655440002',
    'user',
    '3:30 PM sounds good',
    '{"timestamp": "2026-02-14T10:01:00Z"}'
),
(
    '850e8400-e29b-41d4-a716-446655440002',
    'assistant',
    'Perfect! I''ve booked your beard trim for tomorrow, February 15th at 3:30 PM. The service typically takes 30 minutes. See you then!',
    '{"model": "mistral-small-latest", "tokens": 35, "processing_time_ms": 465, "appointment_created": true}'
);

-- Chat session 3: Active conversation
INSERT INTO chat_messages (session_id, role, content, metadata) VALUES
(
    '850e8400-e29b-41d4-a716-446655440003',
    'user',
    'What services do you offer?',
    '{"timestamp": "2026-02-14T11:00:00Z"}'
),
(
    '850e8400-e29b-41d4-a716-446655440003',
    'assistant',
    'We offer a variety of services including haircuts, beard trims, hair coloring, highlights, manicures, pedicures, and facial treatments. Which service are you interested in?',
    '{"model": "mistral-small-latest", "tokens": 48, "processing_time_ms": 495}'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all data was inserted correctly:
-- SELECT 'Users' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'Appointments', COUNT(*) FROM appointments
-- UNION ALL
-- SELECT 'Chat Sessions', COUNT(*) FROM chat_sessions
-- UNION ALL
-- SELECT 'Chat Messages', COUNT(*) FROM chat_messages;

-- View user appointments:
-- SELECT u.name, a.service_type, a.appointment_date, a.appointment_time, a.status
-- FROM appointments a
-- JOIN users u ON a.user_id = u.id
-- ORDER BY a.appointment_date, a.appointment_time;

-- View chat conversations:
-- SELECT cs.title, u.name, cs.status, cs.appointment_created,
--        (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count
-- FROM chat_sessions cs
-- JOIN users u ON cs.user_id = u.id;
