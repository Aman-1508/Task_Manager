import { Task, Project, User, TaskPriority, TaskStatus } from './types';

const API_BASE = '/api';

export const api = {
  // Tasks
  async getTasks(projectId?: string, priority?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (priority && priority !== 'ALL') params.append('priority', priority);

    const res = await fetch(`${API_BASE}/tasks?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(data: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    projectId: string;
    assignedUserId?: string;
    parentId?: string;
  }): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async batchMoveTask(taskId: string, newStatus: TaskStatus, newOrder: number, reorderedTaskIds: string[]): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks/batch/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, newStatus, newOrder, reorderedTaskIds }),
    });
    if (!res.ok) throw new Error('Failed to move task');
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async addProjectMember(projectId: string, userId: string, permission: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, permission }),
    });
    if (!res.ok) throw new Error('Failed to add project member');
    return res.json();
  },

  // Users
  async getUsers(projectId?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    const res = await fetch(`${API_BASE}/users?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(data: { name: string; email: string; avatar?: string; role?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  // Chatbot
  async sendChatMessage(message: string, projectId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, projectId }),
    });
    if (!res.ok) throw new Error('Failed to send chat message');
    return res.json();
  },

  async executeRebalance(reassignments: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/chatbot/execute-rebalance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reassignments }),
    });
    if (!res.ok) throw new Error('Failed to execute rebalance');
    return res.json();
  },

  async applyTaskBreakdown(projectId: string, tasks: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/chatbot/apply-breakdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, tasks }),
    });
    if (!res.ok) throw new Error('Failed to apply task breakdown');
    return res.json();
  },
};
