import { Task, Project, User, TaskPriority, TaskStatus } from './types';

const API_BASE = '/api';

async function handleFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.error || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Please make sure the backend is running (npm run dev in backend directory).');
    }
    throw err;
  }
}

export const api = {
  // Tasks
  async getTasks(projectId?: string, priority?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (priority && priority !== 'ALL') params.append('priority', priority);

    return handleFetch(`${API_BASE}/tasks?${params.toString()}`);
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
    return handleFetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return handleFetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async batchMoveTask(taskId: string, newStatus: TaskStatus, newOrder: number, reorderedTaskIds: string[]): Promise<Task[]> {
    return handleFetch(`${API_BASE}/tasks/batch/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, newStatus, newOrder, reorderedTaskIds }),
    });
  },

  async deleteTask(id: string): Promise<void> {
    return handleFetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    return handleFetch(`${API_BASE}/projects`);
  },

  async addProjectMember(projectId: string, userId: string, permission: string): Promise<any> {
    return handleFetch(`${API_BASE}/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, permission }),
    });
  },

  // Users
  async getUsers(projectId?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    return handleFetch(`${API_BASE}/users?${params.toString()}`);
  },

  async createUser(data: { name: string; email: string; avatar?: string; role?: string }): Promise<User> {
    return handleFetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Chatbot
  async sendChatMessage(message: string, projectId: string): Promise<any> {
    return handleFetch(`${API_BASE}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, projectId }),
    });
  },

  async executeRebalance(reassignments: any[]): Promise<any> {
    return handleFetch(`${API_BASE}/chatbot/execute-rebalance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reassignments }),
    });
  },

  async applyTaskBreakdown(projectId: string, tasks: any[]): Promise<any> {
    return handleFetch(`${API_BASE}/chatbot/apply-breakdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, tasks }),
    });
  },
};
