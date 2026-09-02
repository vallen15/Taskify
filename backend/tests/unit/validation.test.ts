import { describe, expect, test } from "bun:test";
import {
  validateEmail,
  validateTaskInput,
  sanitizeSearchQuery,
} from "../../src/utils/validation";

describe("Unit Tests: Data Validation & Request Sanitization", () => {
  describe("validateEmail", () => {
    test("should return true for valid emails", () => {
      expect(validateEmail("budi@taskify.com")).toBe(true);
      expect(validateEmail("user.test@domain.co.id")).toBe(true);
    });

    test("should return false for invalid emails", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("validateTaskInput", () => {
    test("should pass valid task input", () => {
      const result = validateTaskInput({
        title: "Tugas Pengujian Unit",
        priority: "HIGH",
        status: "PENDING",
      });
      expect(result.valid).toBe(true);
    });

    test("should fail if title is missing or less than 3 chars", () => {
      const emptyResult = validateTaskInput({ title: "" });
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.error).toContain("Judul tugas wajib diisi");

      const shortResult = validateTaskInput({ title: "AB" });
      expect(shortResult.valid).toBe(false);
      expect(shortResult.error).toContain("minimal 3 karakter");
    });

    test("should fail for invalid priority level", () => {
      const result = validateTaskInput({
        title: "Tugas A",
        priority: "SUPER_IMPORTANT",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("prioritas tidak valid");
    });
  });

  describe("sanitizeSearchQuery", () => {
    test("should strip SQL wildcard characters % and _", () => {
      expect(sanitizeSearchQuery("tugas%_kuliah")).toBe("tugaskuliah");
    });

    test("should handle undefined and whitespace", () => {
      expect(sanitizeSearchQuery(undefined)).toBe("");
      expect(sanitizeSearchQuery("  ")).toBe("");
    });
  });
});
