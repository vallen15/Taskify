import { Elysia } from "elysia";
import { prisma } from "../db";
import { calculateCompletionRate, isOverdue } from "../utils/calculations";

export const dashboardRoutes = new Elysia({ prefix: "/api/dashboard" })
  .get("/stats", async () => {
    try {
      const totalTasks = await prisma.task.count();
      const completedTasks = await prisma.task.count({ where: { isCompleted: true } });
      const pendingTasks = await prisma.task.count({ where: { status: "PENDING", isCompleted: false } });
      const inProgressTasks = await prisma.task.count({ where: { status: "IN_PROGRESS", isCompleted: false } });
      const totalCategories = await prisma.category.count();

      // Fetch all uncompleted tasks with due date to count overdue tasks
      const uncompletedWithDueDate = await prisma.task.findMany({
        where: { isCompleted: false, dueDate: { not: null } },
        select: { id: true, title: true, dueDate: true, priority: true, category: true },
      });

      const overdueList = uncompletedWithDueDate.filter((t) => isOverdue(t.dueDate, false));
      const overdueTasks = overdueList.length;

      const completionRate = calculateCompletionRate(totalTasks, completedTasks);

      // Recent 5 tasks
      const recentTasks = await prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { category: true },
      });

      // Weekly productivity chart (last 7 days completion)
      const daysMap: Record<string, { day: string; completed: number; created: number }> = {};
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        const label = `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;
        daysMap[key] = { day: label, completed: 0, created: 0 };
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const pastTasks = await prisma.task.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, completedAt: true, isCompleted: true },
      });

      pastTasks.forEach((t) => {
        const createdKey = t.createdAt.toISOString().split("T")[0];
        if (daysMap[createdKey]) {
          daysMap[createdKey].created += 1;
        }
        if (t.isCompleted && t.completedAt) {
          const completedKey = t.completedAt.toISOString().split("T")[0];
          if (daysMap[completedKey]) {
            daysMap[completedKey].completed += 1;
          }
        }
      });

      const weeklyProgressChart = Object.values(daysMap);

      return {
        success: true,
        data: {
          summary: {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            overdueTasks,
            completionRate,
            totalCategories,
          },
          recentTasks: recentTasks.map((t) => ({
            ...t,
            isOverdue: isOverdue(t.dueDate, t.isCompleted),
          })),
          overdueWarningList: overdueList.slice(0, 5),
          weeklyProgressChart,
        },
      };
    } catch (err: any) {
      console.warn("⚠️ [Dashboard Notice]: Returning fallback default stats");
      return {
        success: true,
        data: {
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
        },
      };
    }
  });
