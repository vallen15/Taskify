import {
  DashboardData,
  Task,
  Category,
} from '../types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://taskify-production-78a7.up.railway.app/api';

async function safeFetch<T>(url: string, options?: RequestInit, fallback: any = []): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.warn(`API HTTP ${res.status} warning for ${url}`);
    }
    const json = await res.json();
    if (json.data !== undefined) {
      return json.data as T;
    }
    return fallback as T;
  } catch (err) {
    console.warn(`API network fallback for ${url}:`, err);
    return fallback as T;
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
    return safeFetch<DashboardData>(`${API_BASE}/dashboard/stats`, undefined, fallbackStats);
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

    return safeFetch<Task[]>(`${API_BASE}/tasks?${query.toString()}`, undefined, []);
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    return safeFetch<Task>(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, {} as Task);
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return safeFetch<Task>(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, {} as Task);
  },

  async deleteTask(id: string): Promise<void> {
    await safeFetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' }, null);
  },

  // Categories CRUD
  async getCategories(): Promise<Category[]> {
    return safeFetch<Category[]>(`${API_BASE}/categories`, undefined, []);
  },

  async createCategory(data: { name: string; color?: string; icon?: string }): Promise<Category> {
    return safeFetch<Category>(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, {} as Category);
  },
};
