/** Age in full years from YYYY-MM-DD date of birth. */
export function calculateAgeFromDob(dateOfBirth: string): number | "" {
  if (!dateOfBirth) return "";
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : "";
}

export function splitDurationMinutes(totalMinutes: number | string | null | undefined) {
  const total = Math.max(0, parseInt(String(totalMinutes || 0), 10) || 0);
  return {
    hours: Math.floor(total / 60),
    minutes: total % 60,
    totalMinutes: total,
  };
}

export function combineDurationParts(hours: number | string, minutes: number | string) {
  const h = Math.max(0, parseInt(String(hours || 0), 10) || 0);
  const m = Math.max(0, parseInt(String(minutes || 0), 10) || 0);
  return h * 60 + m;
}

export function formatDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseLocalDateTime(value?: string | null) {
  if (!value) return null;
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );
  if (!match) return null;

  const [, year, month, day, hours, minutes] = match;
  const d = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes)
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Sync start/end/duration when any schedule field changes. */
export function syncAssignmentSchedule(
  prev: Record<string, unknown>,
  field: string,
  value: string,
  endKey: "due_date" | "end_date" = "due_date"
) {
  const next = { ...prev, [field]: value };
  const start = parseLocalDateTime(String(next.start_date || ""));
  const end = parseLocalDateTime(String(next[endKey] || ""));
  const durationHours = next.duration_hours ?? splitDurationMinutes(next.duration as number).hours;
  const durationMinutes = next.duration_minutes ?? splitDurationMinutes(next.duration as number).minutes;

  if (field === "start_date" || field === endKey) {
    if (start && end && end > start) {
      const diffMins = Math.round((end.getTime() - start.getTime()) / 60000);
      const parts = splitDurationMinutes(diffMins);
      next.duration = diffMins;
      next.duration_hours = parts.hours;
      next.duration_minutes = parts.minutes;
    }
    return next;
  }

  if (field === "duration_hours" || field === "duration_minutes") {
    const total = combineDurationParts(
      field === "duration_hours" ? value : String(durationHours),
      field === "duration_minutes" ? value : String(durationMinutes)
    );
    next.duration = total;
    next.duration_hours = Math.floor(total / 60);
    next.duration_minutes = total % 60;
    if (start && total > 0) {
      const newEnd = new Date(start.getTime() + total * 60000);
      next[endKey] = formatDatetimeLocalValue(newEnd);
    }
    return next;
  }

  if (field === "duration") {
    const total = Math.max(0, parseInt(String(value || 0), 10) || 0);
    const parts = splitDurationMinutes(total);
    next.duration = total;
    next.duration_hours = parts.hours;
    next.duration_minutes = parts.minutes;
    if (start && total > 0) {
      const newEnd = new Date(start.getTime() + total * 60000);
      next[endKey] = formatDatetimeLocalValue(newEnd);
    }
    return next;
  }

  return next;
}

/** Student countdown target (ms). Prefers absolute end date, else duration from session start. */
export function getAssignmentTimerTargetMs(
  assignment: {
    due_date?: string | null;
    end_date?: string | null;
    duration?: number | null;
  },
  sessionStartedAtMs?: number
) {
  const endRaw = assignment.due_date || assignment.end_date;
  if (endRaw) {
    const endMs = new Date(endRaw).getTime();
    if (!Number.isNaN(endMs)) return endMs;
  }
  if (assignment.duration && sessionStartedAtMs) {
    return sessionStartedAtMs + assignment.duration * 60 * 1000;
  }
  return null;
}

export function getOralSubmissionAccept(submissionType?: string) {
  switch (submissionType) {
    case "video":
      return "video/*";
    case "image":
      return "image/*";
    case "both":
      return "audio/*,video/*";
    case "all":
      return "audio/*,video/*,image/*";
    case "audio":
    default:
      return "audio/*";
  }
}

export function isAllowedOralSubmissionFile(file: File, submissionType?: string) {
  const type = submissionType || "audio";
  const isAudio = file.type.startsWith("audio/");
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");

  if (type === "audio") return isAudio;
  if (type === "video") return isVideo;
  if (type === "image") return isImage;
  if (type === "both") return isAudio || isVideo;
  if (type === "all") return isAudio || isVideo || isImage;
  return isAudio || isVideo;
}

export function getOralSubmissionLabel(submissionType?: string) {
  switch (submissionType) {
    case "video":
      return "video recording";
    case "image":
      return "image file";
    case "both":
      return "audio or video recording";
    case "all":
      return "audio, video, or image file";
    default:
      return "audio recording";
  }
}
