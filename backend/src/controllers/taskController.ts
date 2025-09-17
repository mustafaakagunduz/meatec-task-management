import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { CreateTaskRequest, UpdateTaskRequest } from '../types/task';

const prisma = new PrismaClient();

// GET /api/tasks - Get all tasks for authenticated user
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      tasks,
      total: tasks.length
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/tasks - Create new task
export const createTask = async (req: Request<{}, {}, CreateTaskRequest>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, description, status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'PENDING',
        userId
      }
    });

    res.status(201).json(task);

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/tasks/:id - Update existing task
export const updateTask = async (req: Request<{ id: string }, {}, UpdateTaskRequest>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const taskId = parseInt(req.params.id);
    const { title, description, status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Validate title if provided
    if (title !== undefined && title.trim().length === 0) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status })
      }
    });

    res.json(updatedTask);

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/tasks/:id - Delete task
export const deleteTask = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const taskId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};