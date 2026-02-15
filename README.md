# AI Appointment Platform 🚀

Welcome to the **AI Appointment Platform**, a production-grade SaaS-ready application that allows users to book appointments through a conversational AI interface. This project highlights premium full-stack development, intelligent AI integration with Mistral, and a stunning, responsive UX.

---

## 🏗️ Project Structure

This is a monorepo containing both the backend API and the frontend client.

- **[Backend](./backend)**: Node.js / Express API with PostgreSQL (Supabase) and Mistral AI.
- **[Frontend](./frontend)**: React / Vite application with Tailwind CSS v4 and Framer Motion animations.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL**
- **Mistral API Key** (Get one at [console.mistral.ai](https://console.mistral.ai))

### 2. Database Setup
```bash
# In your terminal
psql -U postgres -c "CREATE DATABASE appointment_platform;"

# Run the schema and seed data from the backend directory
psql -U postgres -d appointment_platform -f backend/database/schema.sql
psql -U postgres -d appointment_platform -f backend/database/seed.sql
```

### 3. Installation & Development

#### Backend
```bash
cd backend
npm install
# Copy .env.example and fill in your credentials
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 💎 Key Features

### 🤖 AI-Powered Booking
Leverages **Mistral AI** to extract intent, service types, dates, and times from natural conversation. It handles complex phrasing and relative dates (e.g., "tomorrow at 3 PM") with high accuracy.

### 📊 Sophisticated Dashboard
- **Server-Side Search**: Multi-term search on services and notes using PostgreSQL `ILIKE`.
- **Intelligent Filtering**: updates and analytics counters.
- **Interactive Cards**: Clickable appointment cards with cross-navigation to the original AI chat session.

### 🛡️ Enterprise-Grade Architecture
- **Layered Backend**: Modular design with separate layers for Controllers, Services, Middleware, and Database logic.
- **Atomic Transactions**: Database-level unique constraints to prevent double-booking race conditions.
- **Soft Deletes**: Safety-first cancellation flow using a `deleted_at` strategy for data integrity and audit trails.

### 🎨 Premium UI/UX
- **Tailwind v4 & Framer Motion**: Glassmorphism effects, staggered animations, and a sleek dark-themed interface.
- **Mobile First**: Completely responsive design that feels native on iOS and Android.

---

## ⚖️ Architectural Tradeoffs

- **Monorepo Strategy**: Simplified dependency management and easier cross-navigation implementation between Dashboard and Chat.
- **Date/Time Split**: Used separate columns for `appointment_date` and `appointment_time` for simpler business reporting and human-readable SQL queries.
- **Mistral AI Preference**: Chosen for its balance of cost-efficiency and high-performance extraction capabilities.

---

## 📝 Sub-Project Documentation

- [Backend README](./backend/README.md) - API Details, Database Schema, and AI logic.
- [Frontend README](./frontend/README.md) - UI Components, Design System, and State Management.

---

**Developed with ❤️ for the Spark AI Technical Assessment.**
