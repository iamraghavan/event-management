# Event Management System (EMS) Backend API

## 📌 Overview

This is the robust backend API for the **Event Management System (EMS)**, tailored for the **EGS Pillay Group of Institutions**. It serves as the backbone for managing the entire lifecycle of institutional events, including:

*   **Event Creation & Management**: Faculty and staff can propose events.
*   **Multi-Level Approvals**: Automated workflow for HOD -> HLC -> Management approvals.
*   **User Management**: Role-based access control (RBAC) for Admin, Management, HOD, Faculty, and Students.
*   **Reporting**: Comprehensive reports for event analytics.
*   **Notifications**: Email integration for status updates.

## 🚀 Live Deployment

*   **Base API URL:** [`https://event-management-theta-five.vercel.app/api/v1`](https://event-management-theta-five.vercel.app/api/v1)
*   **Swagger Documentation:** [`https://event-management-theta-five.vercel.app/api/docs`](https://event-management-theta-five.vercel.app/api/docs)

---

## 🛠 Tech Stack

*   **Runtime Environment:** [Node.js](https://nodejs.org/) (LTS recommended)
*   **Web Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [MySQL](https://www.mysql.com/) (Managed via [Prisma ORM](https://www.prisma.io/))
*   **Authentication:** JWT (JSON Web Tokens)
*   **API Documentation:** Swagger UI / OpenAPI 3.0
*   **Cloud Platform:** [Vercel](https://vercel.com/) (Serverless Functions)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: v16.x or higher
*   **npm**: v8.x or higher
*   **Git**: For version control
*   **MySQL**: Local or remote instance

---

## 🔑 Environment Configuration

Create a `.env` file in the root directory. You can use the example below:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection (Prisma)
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://root:password@localhost:3306/ems_db"

# Security Secrets
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Email Service (SMTP Configuration)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-app-specific-password"
```

---

## 🏗️ Installation & Local Setup

Follow these steps to get the project running locally:

### 1. Clone the Repository

```bash
git clone https://github.com/iamraghavan/event-management.git
cd event-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Ensure your MySQL server is running and the `DATABASE_URL` in `.env` is correct. Then, push the schema to your database:

```bash
npx prisma db push
```

*Optional: Seed the database with initial data (if seed script exists)*
```bash
npx prisma db seed
```

### 4. Start the Development Server

```bash
npm start
```

The server will start at `http://localhost:3000`.
Swagger docs will be available at `http://localhost:3000/api/docs`.

---

## 📝 API Endpoints Overview

### Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & get Bearer token | Public |
| `POST` | `/api/v1/auth/register` | Register a new user account | Admin |

### Event Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events` | Retrieve all events (with pagination) | Authenticated |
| `GET` | `/api/v1/events/:id` | Get specific event details | Authenticated |
| `POST` | `/api/v1/events` | Propose a new event | Authenticated |
| `PUT` | `/api/v1/events/:id` | Update event details | Owner/Admin |
| `DELETE` | `/api/v1/events/:id` | Remove an event | Owner/Admin |

### Approval Workflow
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/approvals/pending` | View pending approvals | Approvers |
| `POST` | `/api/v1/approvals/:id/approve` | Approve an event request | Approvers |
| `POST` | `/api/v1/approvals/:id/reject` | Reject an event request | Approvers |

### User Administration
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | List all registered users | Admin |
| `POST` | `/api/v1/users` | Create a new user manually | Admin |
| `PUT` | `/api/v1/users/:id` | Modify user role or details | Admin |
| `DELETE` | `/api/v1/users/:id` | Deactivate/Delete a user | Admin |

### Analytics & Reports
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/events` | Generate event reports by date | Admin/Mgmt |

---

## 📂 Project Structure

```bash
event-management/
├── api/                # Vercel serverless entry points
├── config/             # Configuration files (DB, Swagger, etc.)
├── controllers/        # Logic for handling API requests
├── docs/               # Swagger documentation setup
├── middleware/         # Express middleware (Auth, Validation)
├── models/             # Prisma schema and models
├── prisma/             # Database schema definitions
├── routes/             # API route definitions
├── services/           # Business logic (Email, Approvals)
├── utils/              # Utility functions and helpers
├── app.js              # Express application setup
└── server.js           # Local development server entry
```

---

## 📦 Deployment

This project is optimized for **Vercel**.

1.  **Push to GitHub**: Ensure your latest code is on the main branch.
2.  **Import to Vercel**: Connect your GitHub repository.
3.  **Configure Environment**: Add all variables from `.env` to the Vercel Project Settings.
4.  **Deploy**: Vercel will automatically build and deploy the API.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

---

## 📄 License

This project is proprietary to **EGS Pillay Group of Institutions**. Unauthorized copying or distribution is strictly prohibited.
