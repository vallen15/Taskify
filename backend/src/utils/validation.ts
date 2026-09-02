export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  categoryId?: string;
}

export function validateTaskInput(input: Partial<TaskInput>): { valid: boolean; error?: string } {
  if (!input.title || input.title.trim().length === 0) {
    return { valid: false, error: "Judul tugas wajib diisi" };
  }
  if (input.title.trim().length < 3) {
    return { valid: false, error: "Judul tugas minimal 3 karakter" };
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  if (input.priority && !validPriorities.includes(input.priority.toUpperCase())) {
    return { valid: false, error: "Tingkat prioritas tidak valid" };
  }

  const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
  if (input.status && !validStatuses.includes(input.status.toUpperCase())) {
    return { valid: false, error: "Status tugas tidak valid" };
  }

  if (input.dueDate) {
    const d = new Date(input.dueDate);
    if (isNaN(d.getTime())) {
      return { valid: false, error: "Format tanggal jatuh tempo tidak valid" };
    }
  }

  return { valid: true };
}

export function sanitizeSearchQuery(query: string | undefined): string {
  if (!query) return "";
  return query.trim().replace(/[%_]/g, "");
}
