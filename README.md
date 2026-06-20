# ZenithOS

**One Platform. Every Client. Every Project.**

ZenithOS is the complete agency operations platform built specifically for Zenith Creative. It consolidates client management, project tracking, file collaboration, approval workflows, invoicing, and payments into a single branded experience.

---

## Features

| Module | Description |
|--------|-------------|
| 🔐 Auth | JWT + Refresh Tokens, 3 role types, forgot/reset password |
| 👥 Clients | Full CRM — create, search, filter, archive |
| 📁 Projects | Lifecycle management from Draft → Archived |
| ✅ Tasks | Kanban board + List view with drag-and-drop |
| 📎 Files | S3-powered upload, version history, download tracking |
| 🔍 Approvals | Client review workflow with audit trail |
| 🧾 Invoices | PDF generation, email delivery, GST support |
| 💳 Payments | Razorpay integration — UPI, Card, Net Banking |
| 🌐 Client Portal | Private branded portal per client |
| 📊 Reports | Revenue charts, client performance, export |
| 🔔 Notifications | In-app + email for all key events |
| 📋 Activity Log | Full audit trail of every action |

---

## Tech Stack

**Frontend:** React 18, Vite, TypeScript, TailwindCSS, React Router, React Query, Recharts, Framer Motion

**Backend:** Node.js, Express.js, MongoDB, Mongoose

**Integrations:** Razorpay (payments), Resend (email), AWS S3 (files)

**DevOps:** Docker, Nginx

---

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your values (MongoDB URI, JWT secrets, API keys)
```

### 3. Run development servers

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev

# Terminal 2 — Backend (http://localhost:5000)
cd server && npm run dev
```

### 4. Demo Login

Open http://localhost:5173 and use any of the demo buttons:

| Role | Email | Access |
|------|-------|--------|
| Super Admin | admin@zenithcreative.in | Full platform |
| Team Member | team@zenithcreative.in | Clients, Projects, Tasks |
| Client | client@novatech.com | Portal only |

---

## Production Deployment (Docker)

```bash
# 1. Copy and fill environment variables
cp .env.example .env

# 2. Build and start all services
docker-compose up -d --build

# 3. Check logs
docker-compose logs -f
```

The app will be available at http://localhost (port 80).

---

## Project Structure

```
zenithos/
├── src/                    # Frontend (React + Vite)
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   └── layout/        # Sidebar, Header, Layout
│   ├── pages/             # One file per route
│   ├── context/           # Auth context
│   ├── lib/               # Utilities, mock data
│   └── types/             # TypeScript types
├── server/                # Backend (Node + Express)
│   └── src/
│       ├── models/        # Mongoose schemas
│       ├── routes/        # REST API routes
│       └── middleware/    # Auth, validation
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth
- `POST /auth/login` — Login, returns JWT + refresh token
- `POST /auth/refresh` — Refresh access token
- `POST /auth/logout` — Invalidate refresh token
- `GET /auth/me` — Get current user
- `POST /auth/forgot-password` — Send reset email
- `POST /auth/reset-password/:token` — Reset password

### Clients
- `GET /clients` — List clients (search, status filter, pagination)
- `POST /clients` — Create client
- `GET /clients/:id` — Get client
- `PUT /clients/:id` — Update client
- `DELETE /clients/:id` — Soft delete (archive)

### Projects
- `GET /projects` — List projects (filter by client, status)
- `POST /projects` — Create project
- `GET /projects/:id` — Get project with team + client
- `PUT /projects/:id` — Update project

### Tasks
- `GET /tasks?projectId=` — List tasks
- `POST /tasks` — Create task
- `PUT /tasks/:id` — Update (status, assignee, etc.)
- `DELETE /tasks/:id` — Delete task

### Files
- `GET /files?projectId=` — List files
- `POST /files/upload` — Upload (multipart, up to 10 files)
- `GET /files/:id/download` — Get signed download URL
- `DELETE /files/:id` — Soft delete

### Approvals
- `GET /approvals` — List approvals
- `POST /approvals` — Create approval request
- `PUT /approvals/:id/respond` — Client responds (approve/revision)

### Invoices
- `GET /invoices` — List invoices
- `POST /invoices` — Create invoice (auto-generates number)
- `GET /invoices/:id` — Get invoice details
- `POST /invoices/:id/send` — Send invoice email to client

### Payments
- `POST /payments/create-order` — Create Razorpay order
- `POST /payments/verify` — Verify payment signature, mark invoice paid
- `GET /payments` — Payment history

### Dashboard
- `GET /dashboard` — Stats: clients, projects, revenue, pending approvals

### Reports
- `GET /reports/revenue` — 6-month revenue trend
- `GET /reports/client-performance` — Per-client revenue breakdown

---

## Integrations Setup

### Razorpay
1. Create account at razorpay.com
2. Get Key ID and Key Secret from Settings → API Keys
3. Add to `.env`: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### Resend (Email)
1. Create account at resend.com
2. Add your domain (zenithcreative.in)
3. Get API key and add to `.env`: `RESEND_API_KEY`

### AWS S3
1. Create S3 bucket in ap-south-1 (or your region)
2. Create IAM user with S3 read/write permissions
3. Add credentials to `.env`

---

## Brand

- **Primary:** #F4511E (Orange — from logo)
- **Secondary:** #FF8C42 (Orange Light)
- **Navy:** #0F172A (Text/Background dark)
- **Background:** #F8FAFC

---

*Built for Zenith Creative · zenithcreative.in*
