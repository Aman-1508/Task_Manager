import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// GET all tasks (with optional filter by projectId, priority, status)
router.get('/', async (req, res) => {
  try {
    const { projectId, priority, status } = req.query;

    const where: any = {};
    if (projectId && typeof projectId === 'string') {
      where.projectId = projectId;
    }
    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      where.priority = priority;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedUser: true,
        subtasks: {
          include: {
            assignedUser: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET single task
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignedUser: true,
        subtasks: {
          include: {
            assignedUser: true,
          },
        },
        project: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST create task
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'TODO',
      priority = 'MEDIUM',
      dueDate,
      projectId,
      assignedUserId,
      parentId,
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and projectId are required' });
    }

    // Get highest current order in column
    const highestTask = await prisma.task.findFirst({
      where: { projectId, status },
      orderBy: { order: 'desc' },
    });
    const order = highestTask ? highestTask.order + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        order,
        projectId,
        assignedUserId: assignedUserId || null,
        parentId: parentId || null,
      },
      include: {
        assignedUser: true,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedUserId,
      order,
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedUserId !== undefined) updateData.assignedUserId = assignedUserId || null;
    if (order !== undefined) updateData.order = order;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignedUser: true,
        subtasks: true,
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// PATCH batch update tasks (for drag and drop column movements & reordering)
router.patch('/batch/move', async (req, res) => {
  try {
    const { taskId, newStatus, newOrder, reorderedTaskIds } = req.body;

    if (!taskId || !newStatus) {
      return res.status(400).json({ error: 'taskId and newStatus are required' });
    }

    // Update target task status and order
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        order: newOrder !== undefined ? newOrder : 0,
      },
    });

    // If whole list order is provided, batch update
    if (Array.isArray(reorderedTaskIds)) {
      const updates = reorderedTaskIds.map((id, index) =>
        prisma.task.update({
          where: { id },
          data: { order: index },
        })
      );
      await prisma.$transaction(updates);
    }

    const updatedTasks = await prisma.task.findMany({
      include: {
        assignedUser: true,
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
    });

    res.json(updatedTasks);
  } catch (error) {
    console.error('Error batch moving task:', error);
    res.status(500).json({ error: 'Failed to update task position' });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
