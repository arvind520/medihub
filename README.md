# MediHelp

A PWA connecting patients in hospitals with paid helpers.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node + Express + MongoDB
- **Auth:** Clerk (Phase 1)
- **Realtime:** Socket.io (Phase 4)
- **Payments:** Razorpay (Phase 5)

## Local Setup

### Prerequisites

- Node.js v20+
- Git
- MongoDB Atlas account (free)

### 1. Clone & install

\`\`\`bash
git clone <your-repo-url>
cd medihub

# Frontend

cd client && npm install

# Backend

cd ../server && npm install
\`\`\`

### 2. Configure environment

\`\`\`bash
cp server/.env.example server/.env

# Edit server/.env — add MONGODB_URI

\`\`\`

### 3. Run

**Terminal 1 — Backend**
\`\`\`bash
cd server
npm run dev
\`\`\`

**Terminal 2 — Frontend**
\`\`\`bash
cd client
npm run dev
\`\`\`

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health: http://localhost:5000/api/health

## Project Structure

\`\`\`
medihub/
├── client/ # React frontend
└── server/ # Express API
\`\`\`

## Roadmap

- [x] Phase 0: Project setup
- [ ] Phase 1: Clerk auth
- [ ] Phase 2: Patient creates events
- [ ] Phase 3: Helper accepts events
- [ ] Phase 4: Realtime notifications
- [ ] Phase 5: Razorpay payments
- [ ] Phase 6: PWA + deploy
