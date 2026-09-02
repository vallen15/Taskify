export function calculateCompletionRate(total: number, completed: number): number {
  if (total <= 0) return 0;
  if (completed < 0) throw new Error("Completed count cannot be negative");
  if (completed > total) throw new Error("Completed count cannot exceed total tasks");
  return Number(((completed / total) * 100).toFixed(1));
}

export function isOverdue(dueDate: Date | string | null | undefined, isCompleted: boolean = false): boolean {
  if (!dueDate || isCompleted) return false;
  const due = new Date(dueDate);
  const now = new Date();
  due.setHours(23, 59, 59, 999);
  return due.getTime() < now.getTime();
}

export function getPriorityWeight(priority: string): number {
  switch (priority.toUpperCase()) {
    case "URGENT":
      return 4;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    case "LOW":
      return 1;
    default:
      return 0;
  }
}

export function formatDueDate(date: Date | string | null): string {
  if (!date) return "Tanpa Tenggat";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
