# Task Management Application

A full-stack task management application built for MEAtec's fullstack developer position case study. This project demonstrates secure authentication with JWT, CRUD operations on tasks, and modern development practices using React and Node.js with PostgreSQL.

## Project Objective

Develop a complete task management application where users can:

- Register and authenticate securely
- Manage their personal tasks with full CRUD operations
- Experience a modern, responsive UI with dark mode support
- Interact through a RESTful API with proper validation and error handling

## Technology Stack

### Frontend

- **React 19** with **Vite** - Modern React development with fast builds
- **TailwindCSS** - Utility-first CSS framework for responsive design
- **Redux Toolkit** - State management with modern Redux patterns
- **Axios** - HTTP client for API communication
- **React Hook Form + Zod** - Form handling with robust validation
- **React Router DOM** - Client-side routing
- **React Hot Toast** - User-friendly notifications
- **i18next** - Internationalization support (EN, TR, DE)
- **Jest + React Testing Library** - Comprehensive testing with coverage

### Backend

- **Node.js + Express** (TypeScript) - Type-safe server development
- **Prisma ORM** - Type-safe database access with migrations
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing for security
- **Jest + Supertest** - API testing with coverage reports

### Key Features

- Secure Authentication with JWT
- Task Management with full CRUD operations
- Dark Mode toggle
- Multi-language support (English, Turkish, German)
- Form validation on both client and server
- Comprehensive test coverage
- Responsive design

## Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** (comes with Node.js)

## Installation & Setup

This project uses npm workspaces for monorepo management. All commands should be run from the root directory unless specified otherwise.

### 1. Clone the Repository

```bash
git clone https://github.com/mustafaakagunduz/meatec-task-management.git
cd meatec-task-management
```

### 2. Install Dependencies

Install dependencies for both frontend and backend workspaces:

```bash
npm install
```

### 3. Database Setup

Ensure your PostgreSQL server is running. You can create the database using either a command-line tool or a graphical interface.

#### Method 1: Using the Command Line (Recommended)

The quickest way is to use the `createdb` command-line utility that comes with PostgreSQL.

Open your terminal (on macOS/Linux) or Command Prompt/PowerShell (on Windows) and run:

```bash
createdb meatec_taskmanager
```

Alternatively, you can connect to the PostgreSQL interactive terminal (`psql`) first:

```bash
psql -U postgres
```
*(You might be prompted for your password.)*

Then, run the following SQL command inside the `psql` shell:

```sql
CREATE DATABASE meatec_taskmanager;
```

To exit `psql`, type `\q` and press Enter.

#### Method 2: Using a GUI Tool (e.g., pgAdmin)

If you prefer a graphical interface:

1.  Open pgAdmin (or your preferred PostgreSQL GUI tool).
2.  Connect to your PostgreSQL server.
3.  In the object browser on the left, right-click on **Databases**.
4.  Select **Create** -> **Database...**.
5.  In the "Database" field, enter `meatec_taskmanager`.
6.  Click **Save**.

### 4. Environment Configuration

Create a `.env` file in the `backend` directory by copying the example file:

Run this comment on meatec-task-management folder

```bash
cp .env.example backend/.env
```

Then edit the `backend/.env` file with your database credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/meatec_taskmanager"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="development"
```

**Important:** Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual PostgreSQL credentials. Mostly it is postgres for username and postgres for password

### 5. Database Migration

Set up the database schema and generate Prisma client:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 6. Run the Application

Start both frontend and backend servers:

```bash
npm run dev
```

**Access the application:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000 (or your configured PORT)

## Running Tests

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

View coverage report: Open `backend/coverage/lcov-report/index.html` in your browser.

**Backend test coverage includes:**

- Authentication logic (register/login)
- Task CRUD operations
- JWT middleware functionality
- Error handling and validation

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

View coverage report: Open `frontend/coverage/lcov-report/index.html` in your browser.

**Frontend test coverage includes:**

- Form validation with Zod schemas
- Component rendering and behavior
- User interactions and state management
- Authentication flow

## API Documentation

### Base URL

```
http://localhost:3000/api
```

_Note: If you configured a different PORT in your .env file, replace 3000 with your port number._

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string (3-20 characters)",
  "password": "string (6+ characters)"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

### Task Endpoints

**All task endpoints require JWT authentication via Authorization header:**

```http
Authorization: Bearer <jwt-token>
```

#### Get User Tasks

```http
GET /api/tasks
```

**Response (200):**

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the task management app",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "PENDING | COMPLETED (optional, defaults to PENDING)"
}
```

#### Update Task

```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "PENDING | COMPLETED (optional)"
}
```

#### Delete Task

```http
DELETE /api/tasks/:id
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing JWT)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (username already exists)
- `500` - Internal Server Error

## Project Structure

```
MEAtec/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Server entry point
│   ├── prisma/              # Database schema and migrations
│   ├── __tests__/           # Backend tests
│   └── coverage/            # Test coverage reports
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store and slices
│   │   ├── utils/           # Utility functions
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization
│   │   └── __tests__/       # Frontend tests
│   └── coverage/            # Test coverage reports
├── CLAUDE.md                # Project requirements
└── README.md                # This file
```

## Build & Deployment

### Build for Production

```bash
# Build both frontend and backend
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

### Production Environment

For production deployment, ensure:

1. Set appropriate environment variables in your production environment
2. Use a production PostgreSQL database
3. Configure proper CORS settings
4. Use HTTPS for secure JWT transmission
5. Set strong JWT secrets

## Development Guidelines

- **Clean Code:** Follow TypeScript best practices and ESLint rules
- **Testing:** Maintain high test coverage for both frontend and backend
- **Validation:** Always validate data on both client and server sides
- **Security:** Never commit secrets, use environment variables
- **Comments:** Add comments only where business logic needs explanation

## License

This project is developed as a case study for MEAtec's fullstack developer position.

---

**Developed by:** [Your Name]  
**Case Study Duration:** 3 days  
**Technologies:** React, Node.js, PostgreSQL, TypeScript
