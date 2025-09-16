# Task Management Application with User Authentication - Checklist

her çalışmadan sonra bu listeden tamamladığımız maddelere tik atacağız

## 📋 Proje Özeti

**Amaç:** JWT authentication ile güvenli full-stack task management uygulaması geliştirmek
**Süre:** 3 gün (maksimum)
**Teknoloji:** React + Node.js + PostgreSQL

---

## 🛠️ Technology Stack Setup

### Frontend

- [+] React (Vite) kurulumu
- [+] TailwindCSS entegrasyonu
- [+] Redux Toolkit kurulumu ve store yapılandırması
- [+] Axios kurulumu ve interceptor yapılandırması
- [+] React Hook Form kurulumu
- [+] Zod validation library kurulumu
- [+] Jest + React Testing Library kurulumu (Optional)
- [+] React Router Dom kurulumu

### Backend

- [+] Node.js + Express + TypeScript kurulumu
- [+] Prisma ORM kurulumu ve yapılandırması
- [+] PostgreSQL database kurulumu ve bağlantısı
- [+] JWT authentication library kurulumu
- [+] bcrypt kurulumu (password hashing)
- [+] cors kurulumu (CORS handling)
- [+] dotenv kurulumu (environment variables)
- [+] Jest + Supertest kurulumu (Optional)

---

## 🗄️ Database Setup

### PostgreSQL & Prisma

- [+] PostgreSQL database oluşturma
- [+] Prisma schema tanımlama
- [+] User tablosu oluşturma (id, username, password, timestamps)
- [+] Task tablosu oluşturma (id, title, description, status, userId, timestamps)
- [+] User-Task relationship tanımlama (One-to-Many)
- [+] Database migration çalıştırma
- [+] Prisma Client generate etme

---

## 🔐 Backend Development - Authentication

### Auth Endpoints

- [ ] **POST /api/auth/register**
  - [ ] Request body validation (username, password)
  - [ ] Username uniqueness kontrolü
  - [ ] Password hashing (bcrypt)
  - [ ] User kaydetme
  - [ ] Success/Error response handling
- [ ] **POST /api/auth/login**
  - [ ] Request body validation
  - [ ] User doğrulama
  - [ ] Password verification
  - [ ] JWT token generation
  - [ ] Token return (success response)
  - [ ] Error handling (invalid credentials)

### Authentication Middleware

- [ ] JWT verification middleware yazma
- [ ] Token validation logic
- [ ] User authorization check
- [ ] Error handling (invalid/expired token)

---

## 📝 Backend Development - Task Management

### Task Endpoints

- [ ] **GET /api/tasks**
  - [ ] JWT authentication requirement
  - [ ] Logged-in user's tasks only
  - [ ] Response formatting
- [ ] **POST /api/tasks**
  - [ ] JWT authentication requirement
  - [ ] Request body validation (title, description?, status)
  - [ ] Task creation with userId
  - [ ] Success response with created task
- [ ] **PUT /api/tasks/:id**
  - [ ] JWT authentication requirement
  - [ ] Task ownership verification
  - [ ] Request body validation
  - [ ] Task update logic
  - [ ] Success/Error response
- [ ] **DELETE /api/tasks/:id**
  - [ ] JWT authentication requirement
  - [ ] Task ownership verification
  - [ ] Task deletion logic
  - [ ] Success response

### Backend Validation & Error Handling

- [ ] Request body validation for all endpoints
- [ ] Graceful error handling
- [ ] Proper HTTP status codes
- [ ] Error message formatting

---

## 💻 Frontend Development - Authentication

### Auth Components & Pages

- [ ] Register page/component oluşturma
- [ ] Login page/component oluşturma
- [ ] Logout functionality

### Auth Forms with Validation

- [ ] **Register Form**
  - [ ] React Hook Form integration
  - [ ] Zod validation schema (username, password)
  - [ ] Form submission handling
  - [ ] Error display
  - [ ] Success handling & redirect
- [ ] **Login Form**
  - [ ] React Hook Form integration
  - [ ] Zod validation schema
  - [ ] Form submission handling
  - [ ] JWT token storage (localStorage)
  - [ ] Error display
  - [ ] Success handling & redirect

### Authentication Flow

- [ ] Token storage management (localStorage)
- [ ] Axios interceptors for token attachment
- [ ] Protected routes implementation
- [ ] Auth state management (Redux)
- [ ] Auto-logout on token expiration
- [ ] Redirect logic for authenticated/unauthenticated users

---

## 📋 Frontend Development - Task Management

### Task Components

- [ ] Task list component
- [ ] Task item component
- [ ] Task creation form component
- [ ] Task edit form component
- [ ] Task status toggle component

### Task Forms with Validation

- [ ] **Create Task Form**
  - [ ] React Hook Form integration
  - [ ] Zod validation (title required, description optional, status)
  - [ ] Form submission to API
  - [ ] Success/Error handling
- [ ] **Edit Task Form**
  - [ ] Pre-populated form with existing task data
  - [ ] React Hook Form integration
  - [ ] Zod validation
  - [ ] Update submission
  - [ ] Success/Error handling

### Task Management Features

- [ ] **Task List Display**
  - [ ] Fetch user's tasks on component mount
  - [ ] Display tasks in organized layout
  - [ ] Status filtering/sorting (optional enhancement)
- [ ] **CRUD Operations**
  - [ ] Create new task functionality
  - [ ] Update existing task functionality
  - [ ] Delete task functionality
  - [ ] Status toggle (pending/completed)
- [ ] **User Isolation**
  - [ ] Only show current user's tasks
  - [ ] Prevent access to other users' tasks

### Redux State Management

- [ ] Auth slice (user, token, isAuthenticated)
- [ ] Tasks slice (tasks array, loading, error states)
- [ ] Async thunks for API calls
- [ ] Selectors for component consumption

---

## 🔒 Security & Authorization

### Frontend Security

- [ ] Protected routes implementation
- [ ] Token expiration handling
- [ ] Secure token storage considerations
- [ ] API error handling for unauthorized requests

### Backend Security

- [ ] JWT secret configuration
- [ ] Password hashing verification
- [ ] Route protection middleware
- [ ] User authorization checks
- [ ] Input sanitization

---

## 🧪 Testing (Optional - Extra Points)

### Backend Tests

- [ ] **Auth Logic Tests**
  - [ ] Register endpoint tests
  - [ ] Login endpoint tests
  - [ ] Password hashing tests
  - [ ] JWT generation tests
- [ ] **Task Logic Tests**
  - [ ] Task CRUD operation tests
  - [ ] User isolation tests
  - [ ] Validation tests
- [ ] **Authorization Middleware Tests**
  - [ ] Valid token acceptance tests
  - [ ] Invalid token rejection tests
  - [ ] Missing token handling tests

### Frontend Tests

- [ ] **Form Validation Tests**
  - [ ] Register form validation
  - [ ] Login form validation
  - [ ] Task form validation
- [ ] **UI Behavior Tests**
  - [ ] Component rendering tests
  - [ ] User interaction tests
  - [ ] Navigation tests
- [ ] **Test Coverage**
  - [ ] Backend coverage report generation
  - [ ] Frontend coverage report generation
  - [ ] Coverage percentage documentation

---

## 📚 Documentation & Deployment Prep

### README.md Creation

- [ ] **Local Setup Instructions**
  - [ ] Prerequisites (Node.js, PostgreSQL)
  - [ ] Clone repository instructions
  - [ ] Backend setup steps
  - [ ] Frontend setup steps
  - [ ] Environment variables configuration
- [ ] **How to Run the Application**
  - [ ] Database setup commands
  - [ ] Backend start instructions
  - [ ] Frontend start instructions
  - [ ] Port information
- [ ] **API Endpoint Documentation**
  - [ ] Authentication endpoints documentation
  - [ ] Task endpoints documentation
  - [ ] Request/Response examples
  - [ ] Error codes and messages
- [ ] **Testing Instructions** (if implemented)
  - [ ] How to run backend tests
  - [ ] How to run frontend tests
  - [ ] How to view coverage reports

### Repository Setup

- [ ] GitHub repository oluşturma (public)
- [ ] .gitignore files (node_modules, .env, dist, etc.)
- [ ] Environment variables template (.env.example)
- [ ] Project structure organization
- [ ] Commit history with meaningful messages

---

## 📋 Task Requirements Verification

### Task Schema Requirements

- [ ] title (string) - required
- [ ] description (optional)
- [ ] status (pending/completed)
- [ ] User association (userId foreign key)

### Authentication Workflow Verification

- [ ] User registration with username/password ✓
- [ ] Login returns JWT token ✓
- [ ] Frontend stores token securely ✓
- [ ] Logout functionality ✓
- [ ] Protected API routes require valid JWT ✓

### CRUD Operations Verification

- [ ] View task list ✓
- [ ] Create new tasks ✓
- [ ] Update existing tasks ✓
- [ ] Delete tasks ✓
- [ ] User isolation (only own tasks) ✓

---

## 🎯 Final Delivery Checklist

- [ ] All functionality working end-to-end
- [ ] No console errors in browser
- [ ] Clean, readable code with comments
- [ ] Responsive UI design
- [ ] Error handling implemented
- [ ] README.md complete and accurate
- [ ] GitHub repository public and accessible
- [ ] Code committed and pushed
- [ ] Final testing completed

---

proje pdf'si:

Assignment
Case Study: Task Management Application with User Authentication

1. Objective
   Develop a full-stack task management application where users can register, log in, and manage
   their own tasks. The application must include secure authentication with JWT, perform CRUD
   operations on tasks, and demonstrate modern development practices in both frontend and
   backend using PostgreSQL.
2. Technology Stack
   a. Frontend
   ●
   ●
   React (Vite)
   TailwindCSS
   ●
   Redux Toolkit
   ●
   Axios
   ●
   React Hook Form + Zod for validation
   ●
   Jest + React Testing Library for testing (with coverage) (Optional)
   b. Backend
   ●
   ●
   Node.js with Express (TypeScript)
   Prisma ORM
   ●
   ●
   PostgreSQL
   JWT authentication
   ●
   Jest + Supertest for testing (with coverage) (Optional)
3. Requirements
   Frontend:
   a. Authentication Workflow
   ●
   ●
   ●
   ●
   ●
   User registration with username and password
   Login that returns a JWT token on success
   Frontend stores the token securely (e.g., in localStorage)
   Logout functionality
   Protected API routes that require a valid JWT
   1
   b. Task Management
   ●
   ●
   ●
   Authenticated users can:
   ○
   View their list of tasks
   ○
   Create new tasks
   ○
   ○
   Update existing tasks
   Delete tasks
   Each task must include:
   ○
   title (string)
   ○
   description (optional)
   ○
   status (e.g., pending, completed)
   Users should only see and manage their own tasks
   c. Validation
   ●
   ●
   All forms must be validated on the frontend using Zod + React Hook Form
   Backend should also validate request bodies and handle errors gracefully
   Backend:
   a. API Endpoints :
   ●
   ●
   Authentication
   ○
   ○
   Tasks
   ○
   ○
   ○
   ○
   POST /api/auth/register: Register a new user
   POST /api/auth/login: Authenticate and return a JWT
   GET /api/tasks: Get tasks for the logged-in user
   POST /api/tasks: Create a new task
   PUT /api/tasks/:id: Update an existing task
   DELETE /api/tasks/:id: Delete a task
   All task-related routes must require a valid JWT.
   b. Database:
   ●
   ●
   Use PostgreSQL as the database.
   Define database tables for Users and Tasks with relationships.
   2
   Testing (Optional)
   a. Include automated tests for both frontend and backend.
   b. Use Jest for unit and integration testing.
   c. Backend tests should cover:
   ●
   ●
   ●
   Auth logic (register/login)
   Task logic (CRUD operations)
   Authorization middleware
   d. Frontend tests should cover:
   ●
   Form validation
   ●
   ●
   UI behavior and component rendering
   Test coverage report must be generated for both frontend and backend
4. Deliverables
5. 2. A public GitHub repository containing both frontend and backend.
      A complete README.md file with:
      ●
      Local setup instructions
      ●
      How to run the application
      ●
      How to run tests and view coverage
      ●
      API endpoint documentation
6. Extra Points:
   ●
   Unit tests for frontend and backend
   Good luck.
   Due date: 3 days (max.) from date of receipt
   3

---

**🚀 Proje tamamlandığında tüm checkboxlar işaretlenmiş olmalı!**
