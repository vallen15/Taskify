import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { validateTaskInput, sanitizeSearchQuery } from "../utils/validation";
import { isOverdue } from "../utils/calculations";

export const taskRoutes = new Elysia({ prefix: "/api/tasks" })
  .get("/", async ({ query }) => {
    try {
      const { search, status, priority, categoryId, page = "1", limit = "50" } = query || {};
      const cleanSearch = sanitizeSearchQuery(search as string);

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (cleanSearch) {
        where.OR = [
          { title: { contains: cleanSearch } },
          { description: { contains: cleanSearch } },
        ];
      }

      if (status) {
        where.status = (status as string).toUpperCase();
      }

      if (priority) {
        where.priority = (priority as string).toUpperCase();
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      const totalCount = await prisma.task.count({ where });

      const tasks = await prisma.task.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
        },
        orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
        skip,
        take: limitNum,
      });

      const formatted = tasks.map((t) => ({
        ...t,
        isOverdue: isOverdue(t.dueDate, t.isCompleted),
      }));

      return {
        success: true,
        data: formatted,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      };
    } catch (err: any) {
      console.warn("⚠️ [Tasks Notice]: Returning empty tasks fallback");
      return {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
      };
    }
  })
  .get("/:id", async ({ params: { id }, set }) => {
    try {
      const task = await prisma.task.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!task) {
        set.status = 404;
        return { success: false, message: "Tugas tidak ditemukan" };
      }

      return {
        success: true,
        data: {
          ...task,
          isOverdue: isOverdue(task.dueDate, task.isCompleted),
        },
      };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: `Gagal memuat detail tugas: ${err.message}` };
    }
  })
  .post(
    "/",
    async ({ body, set }) => {
      const validation = validateTaskInput(body);
      if (!validation.valid) {
        set.status = 400;
        return { success: false, message: validation.error };
      }

      try {
        if (body.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: body.categoryId },
          });
          if (!category) {
            set.status = 404;
            return { success: false, message: "Kategori yang dipilih tidak ditemukan" };
          }
        }

        const task = await prisma.task.create({
          data: {
            title: body.title.trim(),
            description: body.description ? body.description.trim() : null,
            priority: (body.priority || "MEDIUM").toUpperCase(),
            status: (body.status || "PENDING").toUpperCase(),
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
            categoryId: body.categoryId || null,
          },
          include: { category: true },
        });

        return {
          success: true,
          message: "Tugas berhasil ditambahkan",
          data: {
            ...task,
            isOverdue: isOverdue(task.dueDate, task.isCompleted),
          },
        };
      } catch (err: any) {
        set.status = 500;
        return { success: false, message: `Gagal membuat tugas: ${err.message}` };
      }
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        status: t.Optional(t.String()),
        dueDate: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
          set.status = 404;
          return { success: false, message: "Tugas tidak ditemukan" };
        }

        let isCompleted = body.isCompleted !== undefined ? body.isCompleted : task.isCompleted;
        let status = body.status ? body.status.toUpperCase() : task.status;

        // Auto update completedAt timestamp and status
        let completedAt = task.completedAt;
        if (body.isCompleted === true && !task.isCompleted) {
          completedAt = new Date();
          status = "COMPLETED";
        } else if (body.isCompleted === false && task.isCompleted) {
          completedAt = null;
          status = "PENDING";
        }

        const updated = await prisma.task.update({
          where: { id },
          data: {
            ...(body.title && { title: body.title.trim() }),
            ...(body.description !== undefined && { description: body.description ? body.description.trim() : null }),
            ...(body.priority && { priority: body.priority.toUpperCase() }),
            status,
            isCompleted,
            completedAt,
            ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
            ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
          },
          include: { category: true },
        });

        return {
          success: true,
          message: "Tugas berhasil diperbarui",
          data: {
            ...updated,
            isOverdue: isOverdue(updated.dueDate, updated.isCompleted),
          },
        };
      } catch (err: any) {
        set.status = 500;
        return { success: false, message: `Gagal memperbarui tugas: ${err.message}` };
      }
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        status: t.Optional(t.String()),
        isCompleted: t.Optional(t.Boolean()),
        dueDate: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async ({ params: { id }, set }) => {
    try {
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        set.status = 404;
        return { success: false, message: "Tugas tidak ditemukan" };
      }

      await prisma.task.delete({ where: { id } });

      return {
        success: true,
        message: "Tugas berhasil dihapus",
      };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: `Gagal menghapus tugas: ${err.message}` };
    }
  });
