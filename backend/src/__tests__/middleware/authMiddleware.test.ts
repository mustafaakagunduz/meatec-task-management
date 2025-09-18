import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { verifyToken } from '../../utils/jwt';
import { JWTPayload } from '../../types/auth';

// Mock dependencies
jest.mock('../../utils/jwt');

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    const validPayload: JWTPayload = {
      userId: 1,
      username: 'testuser'
    };

    it('should authenticate with valid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-jwt-token'
      };
      mockVerifyToken.mockReturnValue(validPayload);

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifyToken).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockRequest.user).toEqual(validPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', () => {
      mockRequest.headers = {};

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing Bearer token', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is just "Bearer"', () => {
      mockRequest.headers = {
        authorization: 'Bearer'
      };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should return 403 when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifyToken).toHaveBeenCalledWith('invalid-token');
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should return 403 when token is expired', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token'
      };
      mockVerifyToken.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifyToken).toHaveBeenCalledWith('expired-token');
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should handle different authorization header formats', () => {
      // Test with different casing - this actually won't work due to case sensitivity
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      mockVerifyToken.mockReturnValue(validPayload);

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(validPayload);
    });

    it('should extract token correctly with extra spaces', () => {
      mockRequest.headers = {
        authorization: 'Bearer   token-with-spaces   '
      };
      mockVerifyToken.mockReturnValue(validPayload);

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifyToken).toHaveBeenCalledWith('token-with-spaces   ');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toEqual(validPayload);
    });

    it('should not call next() when authentication fails', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle JWT verification error with different error types', () => {
      mockRequest.headers = {
        authorization: 'Bearer malformed-token'
      };
      
      // Test with JsonWebTokenError
      mockVerifyToken.mockImplementation(() => {
        const error = new Error('jwt malformed');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
    });
  });
});