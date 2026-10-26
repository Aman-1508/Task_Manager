import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// GET all projects with members
router.get('/', async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        tasks: {
          include: {
            assignedUser: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST create project
router.post('/', async (req, res) => {
  try {
    const { name, description, memberUserIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        members: {
          create: memberUserIds.map((userId: string, idx: number) => ({
            userId,
            permission: idx === 0 ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// POST add user to project with permissions
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, permission = 'MEMBER' } = req.body;
    const projectId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Upsert project member
    const member = await prisma.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      update: {
        permission,
      },
      create: {
        projectId,
        userId,
        permission,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding user to project:', error);
    res.status(500).json({ error: 'Failed to add user to project' });
  }
});

// DELETE remove user from project
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    res.json({ message: 'User removed from project', projectId, userId });
  } catch (error) {
    console.error('Error removing user from project:', error);
    res.status(500).json({ error: 'Failed to remove user from project' });
  }
});

export default router;
