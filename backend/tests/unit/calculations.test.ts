import { describe, expect, test } from "bun:test";
import {
  calculateCompletionRate,
  isOverdue,
  getPriorityWeight,
  formatDueDate,
} from "../../src/utils/calculations";

describe("Unit Tests: Task Productivity Calculations", () => {
  describe("calculateCompletionRate", () => {
    test("should calculate correct percentage rate", () => {
      expect(calculateCompletionRate(10, 5)).toBe(50);
      expect(calculateCompletionRate(3, 1)).toBe(33.3);
      expect(calculateCompletionRate(4, 4)).toBe(100);
    });

    test("should return 0 when total tasks is 0", () => {
      expect(calculateCompletionRate(0, 0)).toBe(0);
    });

    test("should throw error if completed exceeds total", () => {
      expect(() => calculateCompletionRate(5, 10)).toThrow(
        "Completed count cannot exceed total tasks"
      );
    });
  });

  describe("isOverdue", () => {
    test("should return true for uncompleted past due date", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      expect(isOverdue(pastDate, false)).toBe(true);
    });

    test("should return false for completed task even if past due date", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      expect(isOverdue(pastDate, true)).toBe(false);
    });

    test("should return false for future due date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(isOverdue(futureDate, false)).toBe(false);
    });

    test("should return false for null due date", () => {
      expect(isOverdue(null, false)).toBe(false);
    });
  });

  describe("getPriorityWeight", () => {
    test("should return correct numerical weight for sorting", () => {
      expect(getPriorityWeight("URGENT")).toBe(4);
      expect(getPriorityWeight("HIGH")).toBe(3);
      expect(getPriorityWeight("MEDIUM")).toBe(2);
      expect(getPriorityWeight("LOW")).toBe(1);
      expect(getPriorityWeight("UNKNOWN")).toBe(0);
    });
  });

  describe("formatDueDate", () => {
    test("should return formatted date or fallback string", () => {
      expect(formatDueDate(null)).toBe("Tanpa Tenggat");
      const formatted = formatDueDate(new Date(2026, 8, 2));
      expect(formatted).toContain("2");
    });
  });
});
