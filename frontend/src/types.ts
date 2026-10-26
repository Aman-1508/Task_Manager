export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  inProgressCount?: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  permission: 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  members: ProjectMember[];
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  order: number;
  projectId: string;
  assignedUserId?: string | null;
  assignedUser?: User | null;
  parentId?: string | null;
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  badgeColor: string;
  accentColor: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actionType?: 'REBALANCE_SUGGESTION' | 'TASK_BREAKDOWN_PROPOSAL' | 'QUICK_ACTION';
  actionData?: any;
}
