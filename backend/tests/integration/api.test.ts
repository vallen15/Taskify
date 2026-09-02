import { describe, expect, test } from "bun:test";
import { app } from "../../src/index";

describe("Integration Tests: Elysia.js API Endpoints & Prisma Layer", () => {
  test("GET / should return server status and 200 OK", async () => {
    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("Taskify Todo & Productivity API Server is running");
  });

  test("GET /api/unknown-endpoint should return 404 Not Found error response", async () => {
    const response = await app.handle(new Request("http://localhost/api/unknown-endpoint"));
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("Endpoint tidak ditemukan");
  });

  test("POST /api/auth/register should validate invalid email format", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "invalid-email-format",
          password: "123",
        }),
      })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("Format email tidak valid");
  });

  test("GET /api/categories should handle Elysia route execution and return category list array", async () => {
    const response = await app.handle(new Request("http://localhost/api/categories"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  test("GET /api/tasks should return task list with pagination structure", async () => {
    const response = await app.handle(new Request("http://localhost/api/tasks"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.pagination).toBeDefined();
  });

  test("GET /api/dashboard/stats should compile aggregate metrics and return productivity stats structure", async () => {
    const response = await app.handle(new Request("http://localhost/api/dashboard/stats"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.summary).toBeDefined();
    expect(json.data.weeklyProgressChart).toBeDefined();
  });
});
