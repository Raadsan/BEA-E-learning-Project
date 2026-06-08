export type AssignmentTimeStatus =
  | "graded"
  | "submitted"
  | "upcoming"
  | "active"
  | "complete";

export const getAssignmentTimeStatus = (
  task: {
    submission_status?: string;
    start_date?: string | null;
    due_date?: string | null;
    end_date?: string | null;
  },
  now: Date
): AssignmentTimeStatus => {
  const isGraded = task.submission_status === "graded";
  const isSubmitted = task.submission_status === "submitted";
  if (isGraded) return "graded";
  if (isSubmitted) return "submitted";

  const start = task.start_date ? new Date(task.start_date) : null;
  const end = task.due_date || task.end_date
    ? new Date(task.due_date || task.end_date!)
    : null;

  if (start && now < start) return "upcoming";
  if (end && now > end) return "complete";
  return "active";
};

export const formatAssignmentDateTime = (value?: string | null) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const formatAssignmentCountdown = (target: string, now: Date) => {
  const diff = Math.max(0, new Date(target).getTime() - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
};

export type AssignmentWindowStatus = "pending" | "active" | "complete";

type WindowTask = {
  start_date?: string | null;
  due_date?: string | null;
  end_date?: string | null;
};

/** Time-window status for assignments (no submission context). */
export const getAssignmentWindowStatus = (
  task: WindowTask,
  now: Date
): AssignmentWindowStatus => {
  const start = task.start_date ? new Date(task.start_date) : null;
  const end = task.due_date || task.end_date
    ? new Date(task.due_date || task.end_date!)
    : null;

  if (start && now < start) return "pending";
  if (end && now > end) return "complete";
  return "active";
};

export const getWindowStatusLabel = (status: AssignmentWindowStatus) => {
  const labels: Record<AssignmentWindowStatus, string> = {
    pending: "Pending",
    active: "Active",
    complete: "Complete",
  };
  return labels[status];
};

export const getWindowStatusBadgeClass = (status: AssignmentWindowStatus) => {
  const classes: Record<AssignmentWindowStatus, string> = {
    pending:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800",
    active:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800",
    complete:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800",
  };
  return classes[status];
};

/** Badge classes for student assignment cards (includes submission states). */
export const getAssignmentTimeStatusBadgeClass = (status: AssignmentTimeStatus) => {
  if (status === "graded") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
  }
  if (status === "submitted") {
    return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400";
  }
  if (status === "upcoming") {
    return getWindowStatusBadgeClass("pending");
  }
  if (status === "active") {
    return getWindowStatusBadgeClass("active");
  }
  if (status === "complete") {
    return getWindowStatusBadgeClass("complete");
  }
  return "";
};

export const canOpenAssignmentWindow = (status: AssignmentWindowStatus) =>
  status === "active" || status === "complete";

export const getAssignmentTimeStatusLabel = (status: AssignmentTimeStatus) => {
  const labels: Record<AssignmentTimeStatus, string> = {
    graded: "Graded",
    submitted: "Submitted",
    upcoming: "Pending",
    active: "Active",
    complete: "Complete",
  };
  return labels[status];
};

export const getAssignmentTimeButtonLabel = (
  status: AssignmentTimeStatus,
  options?: { scoreText?: string; activeLabel?: string }
) => {
  if (status === "graded") {
    return options?.scoreText ? `View Grade (${options.scoreText})` : "View Results";
  }
  if (status === "submitted") return "View Submission";
  if (status === "upcoming") return "Not Open Yet";
  if (status === "complete") return "Completed";
  return options?.activeLabel || "Start Task";
};

export const isAssignmentTimeActionDisabled = (status: AssignmentTimeStatus) =>
  status === "upcoming" || status === "complete";
