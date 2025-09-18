# Task Management Application

This is a full-stack task management application built for a case study at MEAtec. It uses a monorepo structure with npm workspaces for the frontend and backend.

## Technology Stack

### Frontend

- React (Vite)
- TailwindCSS
- Redux Toolkit
- Axios
- React Hook Form + Zod
- Jest + React Testing Library

### Backend

- Node.js with Express (TypeScript)
- Prisma ORM
- PostgreSQL
- JWT authentication
- Jest + Supertest

## Local Setup & Running the Application

This project uses npm workspaces. All commands should be run from the root directory unless specified otherwise.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mustafaakagunduz/meatec-task-management.git
    cd MEAtec
    ```

2.  **Install Dependencies:**

    - Run the following command in the root directory. It will install dependencies for both `frontend` and `backend` workspaces.
      ```bash
      npm install
      ```

3.  **Backend Environment Setup:**

    - Create a `.env` file in the `backend` directory by copying the example file:
      ```bash
      cp backend/.env.example backend/.env
      ```
    - Open the `backend/.env` file and fill in your PostgreSQL database URL.

4.  **Database Migration:**

    - Run the Prisma migration to set up your database schema. This command needs to be run from the `backend` workspace.
      ```bash
      npx prisma migrate dev --schema=./backend/prisma/schema.prisma
      ```

5.  **Run the Application:**
    - Start both the backend and frontend development servers with a single command from the root directory:
      ```bash
      npm run dev
      ```
    - The backend server will be available at `http://localhost:3000`.
    - The frontend application will be available at `http://localhost:5173`.

## Running Tests

Tests need to be run within their specific workspaces.

### Backend

- Navigate to the `backend` directory:
  ```bash
  cd backend
  ```
- To run tests:
  ```bash
  npm test
  ```
- To view test coverage:
  ```bash
  npm run test:coverage
  ```
  Open `coverage/lcov-report/index.html` in your browser.

### Frontend

- Navigate to the `frontend` directory:
  ```bash
  cd frontend
  ```
- To run tests:
  ```bash
  npm test
  ```
- To view test coverage:
  ```bash
  npm run test:coverage
  ```
  Open `coverage/lcov-report/index.html` in your browser.

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate and return a JWT.

### Tasks

_All task-related routes require a valid JWT._

- `GET /api/tasks`: Get tasks for the logged-in user.
- `POST /api/tasks`: Create a new task.
- `PUT /api/tasks/:id`: Update an existing task.
- `DELETE /api/tasks/:id`: Delete a task.
