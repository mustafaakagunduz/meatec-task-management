import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../../generated/prisma';
import { register, login } from '../../controllers/authController';
import { generateToken } from '../../utils/jwt';

// Mock dependencies
jest.mock('../../generated/prisma');
jest.mock('../../utils/jwt');
jest.mock('bcrypt');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
} as unknown as PrismaClient;

const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Setup express app for testing
const app = express();
app.use(express.json());
app.post('/auth/register', register);
app.post('/auth/login', login);

// Mock PrismaClient constructor
(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const validUser = {
      username: 'testuser',
      password: 'password123'
    };

    const mockCreatedUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should register a new user successfully', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);
      mockPrisma.user.create = jest.fn().mockResolvedValue(mockCreatedUser);
      mockBcrypt.hash.mockResolvedValue('hashedpassword');
      mockGenerateToken.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser'
        }
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'testuser',
          password: 'hashedpassword'
        }
      });
      expect(mockGenerateToken).toHaveBeenCalledWith({
        userId: 1,
        username: 'testuser'
      });
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Username and password are required'
      });
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Username and password are required'
      });
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Password must be at least 6 characters long'
      });
    });

    it('should return 400 if username already exists', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Username already exists'
      });
    });

    it('should return 500 if database error occurs', async () => {
      mockPrisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });
  });

  describe('POST /auth/login', () => {
    const validCredentials = {
      username: 'testuser',
      password: 'password123'
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should login user successfully with valid credentials', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser'
        }
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(mockGenerateToken).toHaveBeenCalledWith({
        userId: 1,
        username: 'testuser'
      });
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Username and password are required'
      });
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Username and password are required'
      });
    });

    it('should return 401 if user does not exist', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid credentials'
      });
    });

    it('should return 401 if password is invalid', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid credentials'
      });
    });

    it('should return 500 if database error occurs', async () => {
      mockPrisma.user.findUnique = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/login')
        .send(validCredentials);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });
  });
});