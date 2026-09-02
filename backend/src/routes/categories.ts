import { Elysia, t } from "elysia";
import { prisma } from "../db";

export const categoryRoutes = new Elysia({ prefix: "/api/categories" })
  .get("/", async () => {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: { select: { tasks: true } },
        },
        orderBy: { name: "asc" },
      });

      return {
        success: true,
        data: categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          taskCount: c._count?.tasks || 0,
          createdAt: c.createdAt,
        })),
      };
    } catch (err: any) {
      console.warn("⚠️ [Category Notice]: Returning fallback empty array");
      return { success: true, data: [] };
    }
  })
  .post(
    "/",
    async ({ body, set }) => {
      const { name, color = "#10b981", icon = "folder" } = body;

      try {
        const existing = await prisma.category.findUnique({ where: { name } });
        if (existing) {
          set.status = 409;
          return { success: false, message: "Kategori dengan nama ini sudah ada" };
        }

        const category = await prisma.category.create({
          data: { name: name.trim(), color, icon },
        });

        return {
          success: true,
          message: "Kategori berhasil dibuat",
          data: category,
        };
      } catch (err: any) {
        set.status = 500;
        return { success: false, message: `Gagal membuat kategori: ${err.message}` };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        color: t.Optional(t.String()),
        icon: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      const { name, color, icon } = body;

      try {
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) {
          set.status = 404;
          return { success: false, message: "Kategori tidak ditemukan" };
        }

        if (name && name !== category.name) {
          const existing = await prisma.category.findUnique({ where: { name } });
          if (existing) {
            set.status = 409;
            return { success: false, message: "Nama kategori sudah digunakan" };
          }
        }

        const updated = await prisma.category.update({
          where: { id },
          data: {
            ...(name && { name: name.trim() }),
            ...(color && { color }),
            ...(icon && { icon }),
          },
        });

        return {
          success: true,
          message: "Kategori berhasil diperbarui",
          data: updated,
        };
      } catch (err: any) {
        set.status = 500;
        return { success: false, message: `Gagal memperbarui kategori: ${err.message}` };
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 2 })),
        color: t.Optional(t.String()),
        icon: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async ({ params: { id }, set }) => {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { tasks: true } } },
      });

      if (!category) {
        set.status = 404;
        return { success: false, message: "Kategori tidak ditemukan" };
      }

      await prisma.category.delete({ where: { id } });

      return {
        success: true,
        message: "Kategori berhasil dihapus",
      };
    } catch (err: any) {
      set.status = 500;
      return { success: false, message: `Gagal menghapus kategori: ${err.message}` };
    }
  });
