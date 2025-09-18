import request from 'supertest';
import express from 'express';
import { PrismaClient, TaskStatus } from '../../generated/prisma';
import { getTasks, createTask, updateTask, deleteTask } from '../../controllers/taskController';

// Mock dependencies
jest.mock('../../generated/prisma');

const mockPrisma = {
  task: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
} as unknown as PrismaClient;

// Setup express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { userId: 1, username: 'testuser' };
  next();
});

app.get('/tasks', getTasks);
app.post('/tasks', createTask);
app.put('/tasks/:id', updateTask);
app.delete('/tasks/:id', deleteTask);

// Mock PrismaClient constructor
(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma);

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.PENDING,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('GET /tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      const mockTasks = [mockTask];
      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        tasks: mockTasks,
        total: 1
      });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return empty array when no tasks exist', async () => {
      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        tasks: [],
        total: 0
      });
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });
  });

  describe('POST /tasks', () => {
    const validTaskData = {
      title: 'New Task',
      description: 'New Description',
      status: TaskStatus.PENDING
    };

    it('should create a new task successfully', async () => {
      (mockPrisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/tasks')
        .send(validTaskData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTask);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: 'New Description',
          status: TaskStatus.PENDING,
          userId: 1
        }
      });
    });

    it('should create task with default status when status not provided', async () => {
      const taskWithoutStatus = { title: 'New Task' };
      mockPrisma.task.create = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/tasks')
        .send(taskWithoutStatus);

      expect(response.status).toBe(201);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: null,
          status: 'PENDING',
          userId: 1
        }
      });
    });

    it('should trim whitespace from title and description', async () => {
      const taskWithWhitespace = {
        title: '  New Task  ',
        description: '  New Description  '
      };
      mockPrisma.task.create = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/tasks')
        .send(taskWithWhitespace);

      expect(response.status).toBe(201);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: 'New Description',
          status: 'PENDING',
          userId: 1
        }
      });
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ description: 'Description only' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Title is required'
      });
    });

    it('should return 400 if title is empty or only whitespace', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Title is required'
      });
    });

    it('should return 500 on database error', async () => {
      mockPrisma.task.create = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/tasks')
        .send(validTaskData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });
  });

  describe('PUT /tasks/:id', () => {
    const updateData = {
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.COMPLETED
    };

    it('should update task successfully', async () => {
      const updatedTask = { ...mockTask, ...updateData };
      mockPrisma.task.findFirst = jest.fn().mockResolvedValue(mockTask);
      mockPrisma.task.update = jest.fn().mockResolvedValue(updatedTask);

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTask);

      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Updated Task',
          description: 'Updated Description',
          status: TaskStatus.COMPLETED
        }
      });
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { title: 'Only Title Updated' };
      const updatedTask = { ...mockTask, title: 'Only Title Updated' };
      mockPrisma.task.findFirst = jest.fn().mockResolvedValue(mockTask);
      mockPrisma.task.update = jest.fn().mockResolvedValue(updatedTask);

      const response = await request(app)
        .put('/tasks/1')
        .send(partialUpdate);

      expect(response.status).toBe(200);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Only Title Updated'
        }
      });
    });

    it('should return 400 for invalid task ID', async () => {
      const response = await request(app)
        .put('/tasks/invalid')
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid task ID'
      });
    });

    it('should return 404 if task not found or does not belong to user', async () => {
      mockPrisma.task.findFirst = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Task not found or access denied'
      });
    });

    it('should return 400 if title is empty string', async () => {
      mockPrisma.task.findFirst = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .put('/tasks/1')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Title cannot be empty'
      });
    });

    it('should return 500 on database error', async () => {
      mockPrisma.task.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/tasks/1')
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete task successfully', async () => {
      mockPrisma.task.findFirst = jest.fn().mockResolvedValue(mockTask);
      mockPrisma.task.delete = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app).delete('/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Task deleted successfully'
      });

      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 }
      });
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should return 400 for invalid task ID', async () => {
      const response = await request(app).delete('/tasks/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid task ID'
      });
    });

    it('should return 404 if task not found or does not belong to user', async () => {
      mockPrisma.task.findFirst = jest.fn().mockResolvedValue(null);

      const response = await request(app).delete('/tasks/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Task not found or access denied'
      });
    });

    it('should return 500 on database error', async () => {
      mockPrisma.task.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/tasks/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });
  });

  describe('Unauthenticated requests', () => {
    const unauthenticatedApp = express();
    unauthenticatedApp.use(express.json());
    unauthenticatedApp.use((req, res, next) => {
      req.user = undefined;
      next();
    });
    unauthenticatedApp.get('/tasks', getTasks);
    unauthenticatedApp.post('/tasks', createTask);
    unauthenticatedApp.put('/tasks/:id', updateTask);
    unauthenticatedApp.delete('/tasks/:id', deleteTask);

    it('should return 401 for unauthenticated GET request', async () => {
      const response = await request(unauthenticatedApp).get('/tasks');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'User not authenticated'
      });
    });

    it('should return 401 for unauthenticated POST request', async () => {
      const response = await request(unauthenticatedApp)
        .post('/tasks')
        .send({ title: 'Test' });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'User not authenticated'
      });
    });

    it('should return 401 for unauthenticated PUT request', async () => {
      const response = await request(unauthenticatedApp)
        .put('/tasks/1')
        .send({ title: 'Test' });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'User not authenticated'
      });
    });

    it('should return 401 for unauthenticated DELETE request', async () => {
      const response = await request(unauthenticatedApp).delete('/tasks/1');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'User not authenticated'
      });
    });
  });
});