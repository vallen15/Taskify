import {
  DashboardData,
  Task,
  Category,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response, defaultFallback: any = []): Promise<T> {
  try {
    const json = await response.json();
    if (json.data !== undefined) {
      return json.data as T;
    }
    if (json.success === false) {
      console.warn('API Notice:', json.message);
    }
    return defaultFallback as T;
  } catch (err) {
    console.error('API Response parsing error:', err);
    return defaultFallback as T;
  }
}

export const api = {
  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardData> {
    const fallbackStats: DashboardData = {
      summary: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        totalCategories: 0,
      },
      recentTasks: [],
      overdueWarningList: [],
      weeklyProgressChart: [],
    };
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return handleResponse<DashboardData>(res, fallbackStats);
  },

  // Tasks CRUD
  async getTasks(params?: {
    search?: string;
    status?: string;
    priority?: string;
    categoryId?: string;
  }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.categoryId) query.append('categoryId', params.categoryId);

    const res = await fetch(`${API_BASE}/tasks?${query.toString()}`);
    return handleResponse<Task[]>(res, []);
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res, {} as Task);
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res, {} as Task);
  },

  async deleteTask(id: string): Promise<void> {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories CRUD
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<Category[]>(res, []);
  },

  async createCategory(data: { name: string; color?: string; icon?: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res, {} as Category);
  },
};
