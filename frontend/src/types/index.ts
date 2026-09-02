export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  taskCount?: number;
  createdAt?: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  categoryId?: string;
  category?: Category;
  isOverdue?: boolean;
  createdAt?: string;
}

export interface DashboardSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  totalCategories: number;
}

export interface WeeklyChartData {
  day: string;
  completed: number;
  created: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentTasks: Task[];
  overdueWarningList: { id: string; title: string; dueDate?: string; priority: string; category?: Category }[];
  weeklyProgressChart: WeeklyChartData[];
}
