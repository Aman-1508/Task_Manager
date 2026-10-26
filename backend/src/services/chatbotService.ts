import { prisma } from '../db.js';

export interface ChatbotResponse {
  text: string;
  actionType?: 'REBALANCE_SUGGESTION' | 'TASK_BREAKDOWN_PROPOSAL' | 'QUICK_ACTION';
  actionData?: any;
}

export async function processChatbotMessage(
  message: string,
  projectId: string
): Promise<ChatbotResponse> {
  const normalized = message.toLowerCase().trim();

  // 1. Burnout & Workload Rebalancing Requests
  if (
    normalized.includes('burnout') ||
    normalized.includes('rebalance') ||
    normalized.includes('overload') ||
    normalized.includes('workload') ||
    normalized.includes('who is busy')
  ) {
    return await handleWorkloadAnalysis(projectId);
  }

  // 2. Task Breakdown & Estimation Requests
  if (
    normalized.startsWith('break down') ||
    normalized.startsWith('breakdown') ||
    normalized.includes('create subtasks') ||
    normalized.includes('estimate') ||
    normalized.includes('decompose')
  ) {
    const topic = message.replace(/^(break down|breakdown|decompose|estimate tasks for|create subtasks for)\s*/i, '').trim();
    return await handleTaskBreakdown(topic || 'New Feature Architecture', projectId);
  }

  // 3. Standup / Progress Summary
  if (
    normalized.includes('standup') ||
    normalized.includes('summary') ||
    normalized.includes('status report') ||
    normalized.includes('progress')
  ) {
    return await handleStandupSummary(projectId);
  }

  // 4. Priority Filter / Query
  if (
    normalized.includes('high priority') ||
    normalized.includes('urgent') ||
    normalized.includes('critical')
  ) {
    const highTasks = await prisma.task.findMany({
      where: {
        projectId,
        priority: { in: ['HIGH', 'URGENT'] },
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
      include: { assignedUser: true },
    });

    if (highTasks.length === 0) {
      return {
        text: '🎉 Great news! There are currently no urgent or high-priority pending tasks.',
      };
    }

    const taskList = highTasks
      .map(
        (t) =>
          `• [${t.priority}] **${t.title}** (${t.status.replace('_', ' ')}) - Assigned to ${t.assignedUser?.name || 'Unassigned'}`
      )
      .join('\n');

    return {
      text: `Here are the active High & Urgent priority tasks:\n\n${taskList}`,
    };
  }

  // Default intelligent assistant response with suggested prompts
  return {
    text: `👋 I'm your **TaskFlow AI Copilot**! Here is what I can do for you right now:
    
1. 🛡️ **Workload Balancing**: Type *"Check burnout risk"* or *"Rebalance team workload"* to automatically detect overloaded members (>5 in progress) and reassign tasks.
2. ⚡ **AI Task Breakdown**: Type *"Break down [feature name]"* (e.g., *"Break down OAuth2 & MFA Authentication"*) to generate structured subtasks with estimated priorities and due dates.
3. 📊 **Daily Standup Summary**: Type *"Give me a standup summary"* for an executive overview of sprint velocity and blockages.`,
  };
}

async function handleWorkloadAnalysis(projectId: string): Promise<ChatbotResponse> {
  const users = await prisma.user.findMany({
    include: {
      tasks: {
        where: { projectId, status: 'IN_PROGRESS' },
      },
    },
  });

  const overloadedUsers = users.filter((u) => u.tasks.length > 5);
  const availableUsers = users.filter((u) => u.tasks.length <= 3).sort((a, b) => a.tasks.length - b.tasks.length);

  if (overloadedUsers.length === 0) {
    return {
      text: `✅ **Team Workload is Balanced!** No team member currently has more than 5 tasks in "In Progress". All team avatars are calm and steady.`,
    };
  }

  // Build smart rebalancing plan
  const reassignments: Array<{
    taskId: string;
    taskTitle: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
  }> = [];

  for (const overloaded of overloadedUsers) {
    const tasksToMoveCount = overloaded.tasks.length - 4; // Bring down to 4 tasks (safe threshold)
    const candidates = overloaded.tasks.slice(0, tasksToMoveCount);

    for (let i = 0; i < candidates.length; i++) {
      const recipient = availableUsers[i % availableUsers.length] || users.find((u) => u.id !== overloaded.id);
      if (recipient) {
        reassignments.push({
          taskId: candidates[i].id,
          taskTitle: candidates[i].title,
          fromUserId: overloaded.id,
          fromUserName: overloaded.name,
          toUserId: recipient.id,
          toUserName: recipient.name,
        });
      }
    }
  }

  const details = reassignments
    .map(
      (r) =>
        `• **"${r.taskTitle}"** ➔ Reassign from **${r.fromUserName}** to **${r.toUserName}**`
    )
    .join('\n');

  return {
    text: `⚠️ **Burnout Warning Detected!**\n\n${overloadedUsers.map((u) => `• **${u.name}** has **${u.tasks.length} tasks** in "In Progress" (exceeds the 5-task safety limit & avatar is pulsing red!).`).join('\n')}\n\n💡 **Recommended Balancing Action:**\n${details}\n\nClick below to execute this rebalancing instantly:`,
    actionType: 'REBALANCE_SUGGESTION',
    actionData: {
      reassignments,
    },
  };
}

async function handleTaskBreakdown(topic: string, projectId: string): Promise<ChatbotResponse> {
  // Retrieve available project members for smart assignment recommendations
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  const members = project?.members.map((m) => m.user) || [];

  // Generate decomposed tasks based on topic
  const subtasksTemplate = generateSmartDecomposition(topic, members);

  const preview = subtasksTemplate
    .map(
      (t, idx) =>
        `${idx + 1}. **${t.title}**\n   • Priority: \`${t.priority}\` | Due: in ${t.dueDays}d | Suggested Assignee: **${t.assigneeName}**\n   • Description: _${t.description}_`
    )
    .join('\n\n');

  return {
    text: `🧩 **AI Task Breakdown Generated for:** _"${topic}"_\n\nI have decomposed this feature into **${subtasksTemplate.length} actionable engineering tasks**:\n\n${preview}\n\nWould you like me to insert these into the **To-Do** column?`,
    actionType: 'TASK_BREAKDOWN_PROPOSAL',
    actionData: {
      projectId,
      tasks: subtasksTemplate,
    },
  };
}

function generateSmartDecomposition(topic: string, members: Array<{ id: string; name: string }>) {
  const getAssignee = (index: number) => {
    if (members.length === 0) return { id: null, name: 'Unassigned' };
    const member = members[index % members.length];
    return { id: member.id, name: member.name };
  };

  return [
    {
      title: `Architect & Specify: ${topic}`,
      description: `Draft API contracts, interface data models, and edge cases for ${topic}.`,
      priority: 'HIGH',
      dueDays: 2,
      assigneeId: getAssignee(0).id,
      assigneeName: getAssignee(0).name,
    },
    {
      title: `Database Schema & Migration for ${topic}`,
      description: `Implement required PostgreSQL tables, indexes, and foreign keys.`,
      priority: 'MEDIUM',
      dueDays: 3,
      assigneeId: getAssignee(1).id,
      assigneeName: getAssignee(1).name,
    },
    {
      title: `Frontend UI & User Interaction for ${topic}`,
      description: `Build responsive UI components, user feedback alerts, and interactive states.`,
      priority: 'MEDIUM',
      dueDays: 4,
      assigneeId: getAssignee(2).id,
      assigneeName: getAssignee(2).name,
    },
    {
      title: `Automated Integration Tests & Validation for ${topic}`,
      description: `Write automated tests covering success paths and boundary failure conditions.`,
      priority: 'LOW',
      dueDays: 5,
      assigneeId: getAssignee(3).id,
      assigneeName: getAssignee(3).name,
    },
  ];
}

async function handleStandupSummary(projectId: string): Promise<ChatbotResponse> {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { assignedUser: true },
  });

  const todo = tasks.filter((t) => t.status === 'TODO');
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const done = tasks.filter((t) => t.status === 'DONE');

  const text = `📋 **Daily Sprint Standup Summary**
  
• **Done (${done.length})**: Great progress! ${done.slice(0, 2).map((t) => `"${t.title}"`).join(', ')}${done.length > 2 ? ` and ${done.length - 2} more.` : '.'}
• **In Progress (${inProgress.length})**: Active velocity. ${inProgress.length > 5 ? '⚠️ Warning: high concurrent work in progress!' : 'Workload is within healthy parameters.'}
• **To-Do Backlog (${todo.length})**: Ready for sprint grooming.

💡 **Quick Action**: Type *"Rebalance workload"* if you need to optimize task distribution!`;

  return { text };
}
