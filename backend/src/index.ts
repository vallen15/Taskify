import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./routes/auth";
import { categoryRoutes } from "./routes/categories";
import { taskRoutes } from "./routes/tasks";
import { dashboardRoutes } from "./routes/dashboard";

const PORT = Number(process.env.PORT) || 3001;

export const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Taskify API Documentation",
          version: "1.0.0",
          description: "API Backend Todo & Productivity App built with Bun & Elysia.js",
        },
      },
    })
  )
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: "Endpoint tidak ditemukan" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        message: "Validasi request gagal",
        errors: error.all,
      };
    }
    console.error("⚠️ [API Error Handler]:", error.message);
    return {
      success: false,
      message: error.message || "Terjadi kendala pada server database",
      data: [],
    };
  })
  .get("/", () => ({
    success: true,
    message: "Taskify Todo & Productivity API Server is running",
    swagger: `/swagger`,
  }))
  .use(authRoutes)
  .use(categoryRoutes)
  .use(taskRoutes)
  .use(dashboardRoutes)
  .listen({
    port: PORT,
    hostname: "0.0.0.0",
  });

console.log(`🚀 Taskify API server running at http://0.0.0.0:${PORT}`);
console.log(`📄 Swagger documentation at http://0.0.0.0:${PORT}/swagger`);
