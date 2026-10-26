import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// GET all users with workload analytics
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;

    const users = await prisma.user.findMany({
      include: {
        tasks: {
          where: projectId ? { projectId: projectId as string } : undefined,
          select: {
            id: true,
            status: true,
            priority: true,
            title: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const enrichedUsers = users.map((user) => {
      const inProgressTasks = user.tasks.filter((t) => t.status === 'IN_PROGRESS');
      const inProgressCount = inProgressTasks.length;
      const todoCount = user.tasks.filter((t) => t.status === 'TODO').length;
      const doneCount = user.tasks.filter((t) => t.status === 'DONE').length;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        inProgressCount,
        todoCount,
        doneCount,
        totalTasks: user.tasks.length,
        isBurnoutRisk: inProgressCount > 5,
        inProgressTasks: inProgressTasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
      };
    });

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { name, email, avatar, role = 'Developer' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        avatar: avatar || defaultAvatar,
        role,
      },
    });

    res.status(201).json({
      ...user,
      inProgressCount: 0,
      todoCount: 0,
      doneCount: 0,
      totalTasks: 0,
      isBurnoutRisk: false,
      inProgressTasks: [],
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
