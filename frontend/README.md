# AI Appointment Platform - Premium Frontend 🎨

The frontend for the AI Appointment Platform is built for a **high-end, professional experience**. It combines cutting-edge tools with custom design patterns to deliver a "WOW" factor for users booking appointments via AI.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite (Fast HMR)
- **Styling**: Tailwind CSS v4 (Modern CSS orchestration)
- **Animations**: Framer Motion (Staggered list reveals, smooth transitions)
- **State Management**: React Context + Custom Hooks
- **Icons**: Lucide React
- **Date Handling**: date-fns (Robust parsing and formatting)

---

## 🧩 Key Architecture Decisions

### 1. Centralized Service Layer
All API interactions are moved to a dedicated `src/services` folder. This ensures:
- **Consistency**: All components use the same API calls.
- **Easier Debugging**: One place to track all network traffic.
- **Mockability**: Easy to swap real APIs for mocks during testing.

### 2. Intelligent Custom Hooks
Logic is abstracted into hooks like `useAppointments` and `useChat`. This allows pages like `Dashboard` and `ChatPage` to stay focused on the UI, while the hooks handle data fetching and real-time state synchronization.

### 3. Glassmorphism Design System
Instead of generic colors, the UI uses a curated dark palette with:
- **Translucency**: `bg-white/[0.03]` and `backdrop-blur` for depth.
- **Subtle Micro-Animations**: Interactive borders and button scaling on hover/active states.
- **Typography-First**: Heavy weighting and uppercase tracking for a premium SaaS feel.

---

## 🎨 Creative Highlights

- **AI Chat Live Preview**: As users talk to the AI, a dynamic confirmation modal (previously a side-panel) extracts data in real-time, giving immediate feedback.
- **Dashboard Cross-Navigation**: Clickable appointment cards allow users to jump back into the specific AI chat history that created the booking.
- **Status-Driven UI**: Appointments automatically transition through states (`pending`, `confirmed`, `cancelled`), updating the visual style and available actions (like the 'Cancel' flow).

---

## 🚀 Getting Started

1. Ensure the **Backend** is running at `http://localhost:3000`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173).

---

**Built for Visual Excellence.**
