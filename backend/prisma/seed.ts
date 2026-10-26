import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Tech Lead',
    },
  });

  const david = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Backend Senior',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Frontend Lead',
    },
  });

  const maya = await prisma.user.create({
    data: {
      name: 'Maya Patel',
      email: 'maya@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      role: 'Fullstack Dev',
    },
  });

  const liam = await prisma.user.create({
    data: {
      name: 'Liam Wilson',
      email: 'liam@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'QA Engineer',
    },
  });

  console.log('Seeding project...');
  const project = await prisma.project.create({
    data: {
      name: 'SaaS Platform v2.0',
      description: 'Main production release sprint containing core Kanban, API refactor, and security modules.',
      members: {
        create: [
          { userId: alex.id, permission: 'ADMIN' },
          { userId: david.id, permission: 'MEMBER' },
          { userId: sarah.id, permission: 'MEMBER' },
          { userId: maya.id, permission: 'MEMBER' },
          { userId: liam.id, permission: 'VIEWER' },
        ],
      },
    },
  });

  console.log('Seeding tasks...');
  // To-Do tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Design Dark Mode Design System Tokens',
        description: 'Standardize slate palette, border contrasts, and badge variants across all screens.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 86400000 * 5),
        order: 0,
        projectId: project.id,
        assignedUserId: sarah.id,
      },
      {
        title: 'Implement Webhook Delivery Retries',
        description: 'Add exponential backoff strategy with dead-letter queue for failed webhook deliveries.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 86400000 * 3),
        order: 1,
        projectId: project.id,
        assignedUserId: maya.id,
      },
      {
        title: 'Automated E2E Cypress Test Suite',
        description: 'Cover login flow, board drag-and-drop actions, and task creation modals.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date(Date.now() + 86400000 * 7),
        order: 2,
        projectId: project.id,
        assignedUserId: liam.id,
      },
      {
        title: 'Audit Postgres Index Usage on Task Queries',
        description: 'Run EXPLAIN ANALYZE on status and project filter queries to optimize execution time.',
        status: 'TODO',
        priority: 'URGENT',
        dueDate: new Date(Date.now() + 86400000 * 2),
        order: 3,
        projectId: project.id,
        assignedUserId: alex.id,
      },
    ],
  });

  // In-Progress tasks
  // Giving David Kim 6 tasks in "IN_PROGRESS" to trigger the burnout pulsing red avatar!
  const davidTasks = [
    { title: 'Migrate PostgreSQL Connection Pool to PgBouncer', priority: 'HIGH', dueInDays: 1 },
    { title: 'Refactor REST API Endpoints to Express Router Modules', priority: 'MEDIUM', dueInDays: 2 },
    { title: 'Add Redis Cache Layer for User Permissions', priority: 'HIGH', dueInDays: 3 },
    { title: 'Implement Rate Limiting Middleware with Sliding Window', priority: 'URGENT', dueInDays: 2 },
    { title: 'Write Database Migration Script for Soft Deletes', priority: 'LOW', dueInDays: 4 },
    { title: 'Fix JWT Token Refresh Expiry Edge Case', priority: 'HIGH', dueInDays: 1 },
  ];

  for (let i = 0; i < davidTasks.length; i++) {
    await prisma.task.create({
      data: {
        title: davidTasks[i].title,
        description: `High-priority backend engineering task assigned to David Kim (${i + 1}/6).`,
        status: 'IN_PROGRESS',
        priority: davidTasks[i].priority,
        dueDate: new Date(Date.now() + 86400000 * davidTasks[i].dueInDays),
        order: i,
        projectId: project.id,
        assignedUserId: david.id,
      },
    });
  }

  // Sarah has 1 In-Progress task
  await prisma.task.create({
    data: {
      title: 'Kanban Column Smooth Drop Indicator Animation',
      description: 'Refine visual placeholder styling when dragging task cards across columns.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 86400000 * 2),
      order: 6,
      projectId: project.id,
      assignedUserId: sarah.id,
    },
  });

  // Maya has 1 In-Progress task
  await prisma.task.create({
    data: {
      title: 'Implement Chatbot Workload Balancing API integration',
      description: 'Wire up assistant quick actions with backend task rebalance endpoint.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 86400000 * 1),
      order: 7,
      projectId: project.id,
      assignedUserId: maya.id,
    },
  });

  // Done tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Project Architecture & Schema Initialization',
        description: 'Set up Prisma ORM, models for User, Project, ProjectMember, and Task.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(Date.now() - 86400000 * 2),
        order: 0,
        projectId: project.id,
        assignedUserId: alex.id,
      },
      {
        title: 'Docker Compose Container Configuration',
        description: 'Configure Postgres 16 Alpine container with persistent storage volumes.',
        status: 'DONE',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() - 86400000 * 1),
        order: 1,
        projectId: project.id,
        assignedUserId: david.id,
      },
      {
        title: 'Tailwind CSS Custom Theme & Keyframe Setup',
        description: 'Configured pulse-burnout keyframes and slate color tokens.',
        status: 'DONE',
        priority: 'LOW',
        dueDate: new Date(Date.now() - 86400000 * 1),
        order: 2,
        projectId: project.id,
        assignedUserId: sarah.id,
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
