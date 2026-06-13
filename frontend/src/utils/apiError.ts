type ApiErrorPayload = {
  status?: number | string;
  data?: unknown;
  error?: string;
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const payload = error as ApiErrorPayload;
  const data = payload.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const nestedError = record.error;
    const nestedMessage = record.message;

    if (typeof nestedError === "string" && nestedError.trim()) {
      return nestedError;
    }

    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage;
    }
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (payload.status === "FETCH_ERROR") {
    return "Unable to reach the server. Check your connection and try again.";
  }

  if (payload.status === "PARSING_ERROR") {
    return "Received an invalid response from the server.";
  }

  if (typeof payload.status === "number") {
    return `Request failed (${payload.status}). Please try again.`;
  }

  return fallback;
}
