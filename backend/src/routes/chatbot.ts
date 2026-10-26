import { Router } from 'express';
import { prisma } from '../db.js';
import { processChatbotMessage } from '../services/chatbotService.js';

const router = Router();

// Chatbot query endpoint
router.post('/message', async (req, res) => {
  try {
    const { message, projectId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Default to first project if none provided
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const defaultProj = await prisma.project.findFirst();
      targetProjectId = defaultProj?.id || '';
    }

    const response = await processChatbotMessage(message, targetProjectId);
    res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Chatbot processing failed' });
  }
});

// Execute Workload Rebalancing 1-click action
router.post('/execute-rebalance', async (req, res) => {
  try {
    const { reassignments } = req.body;

    if (!Array.isArray(reassignments) || reassignments.length === 0) {
      return res.status(400).json({ error: 'Invalid reassignments payload' });
    }

    const updates = reassignments.map((item) =>
      prisma.task.update({
        where: { id: item.taskId },
        data: { assignedUserId: item.toUserId },
      })
    );

    await prisma.$transaction(updates);

    res.json({
      success: true,
      message: `Successfully rebalanced ${reassignments.length} tasks! Workload normalized.`,
      updatedCount: reassignments.length,
    });
  } catch (error) {
    console.error('Error executing rebalance:', error);
    res.status(500).json({ error: 'Failed to execute rebalance' });
  }
});

// Apply AI Task Breakdown 1-click action
router.post('/apply-breakdown', async (req, res) => {
  try {
    const { projectId, tasks } = req.body;

    if (!projectId || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Invalid task breakdown payload' });
    }

    const highestTask = await prisma.task.findFirst({
      where: { projectId, status: 'TODO' },
      orderBy: { order: 'desc' },
    });
    let currentOrder = highestTask ? highestTask.order + 1 : 0;

    const createdTasks = [];
    for (const t of tasks) {
      const task = await prisma.task.create({
        data: {
          title: t.title,
          description: t.description,
          status: 'TODO',
          priority: t.priority || 'MEDIUM',
          dueDate: new Date(Date.now() + 86400000 * (t.dueDays || 3)),
          order: currentOrder++,
          projectId,
          assignedUserId: t.assigneeId || null,
        },
        include: {
          assignedUser: true,
        },
      });
      createdTasks.push(task);
    }

    res.json({
      success: true,
      message: `Created ${createdTasks.length} tasks in the To-Do column!`,
      createdTasks,
    });
  } catch (error) {
    console.error('Error applying breakdown:', error);
    res.status(500).json({ error: 'Failed to apply task breakdown' });
  }
});

export default router;
