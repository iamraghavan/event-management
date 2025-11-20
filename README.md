# Event Management System (EMS) Backend API

## 📌 Overview
This is the backend API for the Event Management System (EMS) designed for EGS Pillay Group of Institutions. It manages events, approvals (HOD -> HLC -> Management), users, and reports.

## 🚀 Live URL
**Base URL:** `https://event-management-theta-five.vercel.app/api/v1`
**Swagger Docs:** `https://event-management-theta-five.vercel.app/api/docs`

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (via Prisma ORM)
- **Authentication:** JWT (JSON Web Tokens)
- **Documentation:** Swagger / OpenAPI
- **Deployment:** Vercel (Serverless)

## 🔑 Environment Variables
Create a `.env` file in the root directory with the following variables:

\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Must be remote for Vercel)
DATABASE_URL="mysql://user:password@host:port/database"

# Security
JWT_SECRET="your-super-secret-key"

# Email Service (SMTP)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
\`\`\`

## 📝 API Endpoints

### 1. Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Login user & get token | Public |
| `POST` | `/auth/register` | Register new user | Admin Only |

**Roles:** `ADMIN`, `MANAGEMENT`, `HOD`, `HLC_MEMBER`, `FACULTY`, `STAFF`, `STUDENT`

### 2. Events
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/events` | List all events (paginated) | Authenticated |
| `GET` | `/events/:id` | Get event details | Authenticated |
| `POST` | `/events` | Create a new event | Authenticated |
| `PUT` | `/events/:id` | Update an event | Owner/Admin |
| `DELETE` | `/events/:id` | Delete an event | Owner/Admin |

### 3. Approvals
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/approvals/pending` | Get pending approvals for current user | Approvers |
| `POST` | `/approvals/:id/approve` | Approve an event | Approvers |
| `POST` | `/approvals/:id/reject` | Reject an event | Approvers |

### 4. Users
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | List all users | Admin |
| `POST` | `/users` | Create a user | Admin |
| `PUT` | `/users/:id` | Update user role/details | Admin |
| `DELETE` | `/users/:id` | Delete a user | Admin |

### 5. Reports
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/events` | Get event reports by date range | Admin/Management |

## 🏗️ Local Setup

1.  **Clone the repository**
    \`\`\`bash
    git clone <repo-url>
    cd event-management
    \`\`\`

2.  **Install Dependencies**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Setup Database**
    Ensure your `.env` has a valid `DATABASE_URL`.
    \`\`\`bash
    npx prisma db push
    \`\`\`

4.  **Run Server**
    \`\`\`bash
    npm start
    \`\`\`
    Server runs at `http://localhost:5000`

## 📦 Deployment (Vercel)

1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add Environment Variables in Vercel Dashboard.
4.  Deploy.

## 📂 Project Structure
\`\`\`
├── api/                # Vercel Entry Point
├── config/             # DB & Swagger Config
├── controllers/        # Request Handlers
├── docs/               # API Documentation & Postman Collection
├── middleware/         # Auth, Validation, Rate Limiting
├── models/             # Database Models (Prisma)
├── prisma/             # Prisma Schema
├── routes/             # API Routes
├── services/           # Business Logic (Email, Approval)
├── utils/              # Helpers
├── app.js              # Express App Factory
└── server.js           # Local Server Entry Point
\`\`\`
