# API Quick Reference

Quick reference guide for testing the AI Appointment Platform API.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1-555-0101"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "user": { "id": "...", "email": "...", "name": "..." },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

---

## 💬 Chat Endpoints

### Create New Chat Session
```http
POST /api/chat/sessions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "session": {
      "id": "session-uuid",
      "user_id": "user-uuid",
      "title": "New Conversation",
      "status": "active"
    }
  }
}
```

### Get All Chat Sessions
```http
GET /api/chat/sessions
Authorization: Bearer <token>
```

### Get Specific Session with Messages
```http
GET /api/chat/sessions/:sessionId
Authorization: Bearer <token>
```

### Send Message (AI Response)
```http
POST /api/chat/sessions/:sessionId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I need to book a haircut for tomorrow at 2 PM"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": {
      "role": "assistant",
      "content": "I can help you book a haircut..."
    },
    "appointmentDetails": {
      "service_type": "Haircut",
      "appointment_date": "2026-02-15",
      "appointment_time": "14:00",
      "notes": null,
      "is_complete": true
    }
  }
}
```

---

## 📅 Appointment Endpoints

### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "service_type": "Haircut",
  "appointment_date": "2026-02-15",
  "appointment_time": "14:00",
  "duration_minutes": 60,
  "notes": "Regular haircut, short on sides",
  "chat_session_id": "session-uuid"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "appointment": {
      "id": "appointment-uuid",
      "service_type": "Haircut",
      "appointment_date": "2026-02-15",
      "appointment_time": "14:00:00",
      "status": "pending",
      "created_via": "ai_chat"
    }
  }
}
```

### Get All Appointments
```http
GET /api/appointments
Authorization: Bearer <token>

# With filters
GET /api/appointments?status=confirmed
GET /api/appointments?type=upcoming
GET /api/appointments?from_date=2026-02-01&to_date=2026-02-28
```

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, cancelled, completed, no_show)
- `type` - Filter by type (upcoming, past)
- `from_date` - Start date (YYYY-MM-DD)
- `to_date` - End date (YYYY-MM-DD)

### Get Specific Appointment
```http
GET /api/appointments/:appointmentId
Authorization: Bearer <token>
```

### Update Appointment Status
```http
PATCH /api/appointments/:appointmentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}

# Or cancel with reason
{
  "status": "cancelled",
  "cancellation_reason": "Schedule conflict"
}
```

### Cancel Appointment
```http
DELETE /api/appointments/:appointmentId
Authorization: Bearer <token>
```

---

## 🧪 Testing Examples

### Complete Booking Flow (cURL)

**1. Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**3. Create Chat Session:**
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3000/api/chat/sessions \
  -H "Authorization: Bearer $TOKEN"
```

**4. Send Message:**
```bash
SESSION_ID="session-uuid-here"

curl -X POST http://localhost:3000/api/chat/sessions/$SESSION_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to book a haircut for February 15th at 2 PM"
  }'
```

**5. Create Appointment:**
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_type": "Haircut",
    "appointment_date": "2026-02-15",
    "appointment_time": "14:00",
    "duration_minutes": 60,
    "notes": "Booked via AI chat",
    "chat_session_id": "'$SESSION_ID'"
  }'
```

**6. Get Appointments:**
```bash
curl -X GET http://localhost:3000/api/appointments \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ Error Responses

### Validation Error (400)
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

### Authorization Error (403)
```json
{
  "status": "error",
  "message": "Access denied to this resource"
}
```

### Not Found (404)
```json
{
  "status": "error",
  "message": "Appointment not found"
}
```

### Conflict Error (409)
```json
{
  "status": "error",
  "message": "This time slot is already booked"
}
```

### Rate Limit (429)
```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later."
}
```

---

## 📊 Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 🔒 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth endpoints | 5 requests | 15 minutes |
| AI/Chat endpoints | 20 requests | 15 minutes |

---

## 🎯 Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "AI Appointment Platform",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\",\n  \"name\": \"Test User\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test123!\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 💡 Tips

1. **Save your token**: After login, save the JWT token for subsequent requests
2. **Use environment variables**: In Postman, set `{{token}}` variable
3. **Check logs**: Server logs show detailed request/response info
4. **Rate limits**: Wait 15 minutes if you hit rate limit
5. **Date format**: Always use YYYY-MM-DD for dates
6. **Time format**: Always use HH:MM (24-hour) for times
