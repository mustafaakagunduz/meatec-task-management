# MEAtec Task Management Application

A full-stack task management application with JWT authentication built with React, Node.js, and PostgreSQL.

## 🚀 Features

- **User Authentication**: Secure JWT-based registration and login
- **Task Management**: Create, read, update, and delete tasks
- **User Isolation**: Users can only access their own tasks
- **Form Validation**: Frontend validation with React Hook Form + Zod
- **Responsive Design**: Modern UI with TailwindCSS
- **Type Safety**: Full TypeScript support

## 🛠️ Technology Stack

### Frontend
- React (Vite)
- TailwindCSS
- Redux Toolkit
- Axios
- React Hook Form + Zod
- React Router Dom

### Backend
- Node.js + Express (TypeScript)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt (Password hashing)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**

## 🔧 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mustafaakagunduz/meatec-task-management.git
cd meatec-task-management
```

### 2. Install Dependencies

```bash
# Install root dependencies (for workspace management)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Database Setup

1. **Create PostgreSQL Database:**
```bash
createdb meatec_db
```

2. **Configure Environment Variables:**
```bash
# Copy the environment template
cp .env.example backend/.env

# Edit backend/.env with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/meatec_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

3. **Run Database Migrations:**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
cd ..
```

### 4. Running the Application

You can run both frontend and backend simultaneously:

```bash
# From the root directory - runs both frontend and backend
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend (from root directory)
cd backend
npm run dev

# Terminal 2 - Frontend (from root directory)  
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Tasks (Protected Routes)
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}

# Response (201 Created)
{
  "message": "User created successfully",
  "userId": 1
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe", 
  "password": "securePassword123"
}

# Response (200 OK)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

#### Create Task
```bash
POST /api/tasks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "pending"
}

# Response (201 Created)
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs", 
  "status": "pending",
  "userId": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## 🗄️ Database Schema

### Users Table
```sql
- id (Primary Key)
- username (Unique)
- password (Hashed)
- createdAt
- updatedAt
```

### Tasks Table
```sql
- id (Primary Key)
- title (Required)
- description (Optional)
- status (pending/completed)
- userId (Foreign Key -> Users.id)
- createdAt
- updatedAt
```

## 🧪 Testing (Optional)

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Test coverage
npm run test:coverage
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schemas for request validation
- **User Isolation**: Users can only access their own data
- **Environment Variables**: Sensitive data stored securely

## 📝 Error Codes

- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid or missing JWT token
- **403**: Forbidden - User not authorized for this resource
- **404**: Not Found - Resource does not exist
- **409**: Conflict - Username already exists
- **500**: Internal Server Error

## 🚀 Deployment

This application is ready for deployment on platforms like:
- **Vercel** (Frontend)
- **Railway/Render** (Backend)
- **Supabase/PlanetScale** (Database)

## 👨‍💻 Development

### Project Structure
```
meatec-task-management/
├── frontend/          # React application
├── backend/           # Node.js API server
├── .env.example       # Environment variables template
├── package.json       # Root workspace configuration
└── README.md          # This file
```

### Commit Conventions
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `refactor:` Code refactoring
- `test:` Test additions/updates

## 📄 License

This project is created as a case study assignment.

## 🤝 Contributing

This is a portfolio project. For any questions or suggestions, please open an issue.

---

**Author**: Mustafa Akagündüz  
**Repository**: https://github.com/mustafaakagunduz/meatec-task-management