import { z } from 'zod';

// Define validation schemas similar to those used in the app
const TaskSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
});

const LoginSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

const RegisterSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(6, 'String must contain at least 6 character(s)'),
});

describe('Validation Schemas', () => {
  describe('TaskSchema', () => {
    it('should validate valid task data', () => {
      const validTask = {
        title: 'Valid Task Title',
        description: 'Valid description'
      };

      const result = TaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validTask);
      }
    });

    it('should validate task with only title', () => {
      const taskWithoutDescription = {
        title: 'Valid Task Title'
      };

      const result = TaskSchema.safeParse(taskWithoutDescription);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.title).toBe('Valid Task Title');
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should reject empty title', () => {
      const invalidTask = {
        title: '',
        description: 'Valid description'
      };

      const result = TaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject task without title', () => {
      const invalidTask = {
        description: 'Valid description'
      };

      const result = TaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should accept task with empty description', () => {
      const taskWithEmptyDescription = {
        title: 'Valid Task Title',
        description: ''
      };

      const result = TaskSchema.safeParse(taskWithEmptyDescription);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.description).toBe('');
      }
    });

    it('should reject non-string title', () => {
      const invalidTask = {
        title: 123,
        description: 'Valid description'
      };

      const result = TaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should reject non-string description', () => {
      const invalidTask = {
        title: 'Valid title',
        description: 123
      };

      const result = TaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });
  });

  describe('LoginSchema', () => {
    it('should validate valid login credentials', () => {
      const validLogin = {
        username: 'testuser',
        password: 'password123'
      };

      const result = LoginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validLogin);
      }
    });

    it('should reject empty username', () => {
      const invalidLogin = {
        username: '',
        password: 'password123'
      };

      const result = LoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject empty password', () => {
      const invalidLogin = {
        username: 'testuser',
        password: ''
      };

      const result = LoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject login without username', () => {
      const invalidLogin = {
        password: 'password123'
      };

      const result = LoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject login without password', () => {
      const invalidLogin = {
        username: 'testuser'
      };

      const result = LoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject both empty fields', () => {
      const invalidLogin = {
        username: '',
        password: ''
      };

      const result = LoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors).toHaveLength(2);
        expect(result.error.errors[0].message).toBe('Required');
        expect(result.error.errors[1].message).toBe('Required');
      }
    });
  });

  describe('RegisterSchema', () => {
    it('should validate valid registration data', () => {
      const validRegister = {
        username: 'testuser',
        password: 'password123'
      };

      const result = RegisterSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validRegister);
      }
    });

    it('should reject empty username', () => {
      const invalidRegister = {
        username: '',
        password: 'password123'
      };

      const result = RegisterSchema.safeParse(invalidRegister);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should reject short password', () => {
      const invalidRegister = {
        username: 'testuser',
        password: '12345'
      };

      const result = RegisterSchema.safeParse(invalidRegister);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('String must contain at least 6 character(s)');
      }
    });

    it('should accept exactly 6 character password', () => {
      const validRegister = {
        username: 'testuser',
        password: '123456'
      };

      const result = RegisterSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.password).toBe('123456');
      }
    });

    it('should accept longer passwords', () => {
      const validRegister = {
        username: 'testuser',
        password: 'verylongpassword123456789'
      };

      const result = RegisterSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.password).toBe('verylongpassword123456789');
      }
    });

    it('should reject empty password', () => {
      const invalidRegister = {
        username: 'testuser',
        password: ''
      };

      const result = RegisterSchema.safeParse(invalidRegister);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('String must contain at least 6 character(s)');
      }
    });

    it('should handle multiple validation errors', () => {
      const invalidRegister = {
        username: '',
        password: '123'
      };

      const result = RegisterSchema.safeParse(invalidRegister);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors).toHaveLength(2);
        expect(result.error.errors[0].message).toBe('Required');
        expect(result.error.errors[1].message).toBe('String must contain at least 6 character(s)');
      }
    });

    it('should accept special characters in username', () => {
      const validRegister = {
        username: 'test_user.123',
        password: 'password123'
      };

      const result = RegisterSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    it('should accept special characters in password', () => {
      const validRegister = {
        username: 'testuser',
        password: 'P@ssw0rd!'
      };

      const result = RegisterSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace-only values', () => {
      const taskWithWhitespace = {
        title: '   ',
        description: '   '
      };

      // Note: Current validation allows whitespace-only titles
      // In a real app, you might want to add .trim() or custom validation
      const result = TaskSchema.safeParse(taskWithWhitespace);
      expect(result.success).toBe(true);
    });

    it('should handle null values', () => {
      const taskWithNull = {
        title: null,
        description: null
      };

      const result = TaskSchema.safeParse(taskWithNull);
      expect(result.success).toBe(false);
    });

    it('should handle undefined values', () => {
      const taskWithUndefined = {
        title: undefined,
        description: undefined
      };

      const result = TaskSchema.safeParse(taskWithUndefined);
      expect(result.success).toBe(false);
    });
  });
});