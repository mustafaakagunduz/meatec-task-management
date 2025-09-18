// Test setup file
process.env.DATABASE_URL = 'postgresql://testuser:testpass@localhost:5432/testdb';

// Mock Prisma for testing
jest.mock('../generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  })),
  TaskStatus: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED'
  }
}));

// Add a dummy test to prevent the setup file from being treated as a test suite
describe('Setup', () => {
  it('should setup test environment', () => {
    expect(true).toBe(true);
  });
});

export {};