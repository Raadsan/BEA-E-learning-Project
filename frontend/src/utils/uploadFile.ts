import { API_URL } from "@/constants";

export type UploadResponse = {
  url: string;
  filename?: string;
  mimetype?: string;
  message?: string;
  error?: string;
};

/** Same-origin upload proxy (forwards to backend, with fallback paths). */
const UPLOAD_PROXY_URL = "/api/upload";

export async function uploadFileRequest(file: File, options?: { requireS3?: boolean }): Promise<UploadResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("You must be logged in to upload files.");
  }

  if (options?.requireS3) {
    const prepareResponse = await fetch(`${API_URL}/uploads/presign`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, mimetype: file.type || "application/octet-stream", size: file.size }),
    });
    const prepared = await prepareResponse.json().catch(() => ({}));
    if (!prepareResponse.ok || !prepared.uploadUrl || !prepared.url) {
      throw new Error(prepared.error || "Could not prepare the S3 upload.");
    }
    const s3Response = await fetch(prepared.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!s3Response.ok) {
      throw new Error(`Direct S3 upload failed (${s3Response.status}). Check the bucket CORS configuration.`);
    }
    return { url: prepared.url, filename: prepared.filename, mimetype: file.type, message: "File uploaded directly to S3" };
  }
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(UPLOAD_PROXY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, ...(options?.requireS3 ? { "x-require-s3": "true" } : {}) },
      body: formData,
    });
  } catch {
    throw new Error(
      "Could not reach the upload server. Check that the backend is running."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = (
    contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : {}
  ) as UploadResponse;

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Upload failed (${response.status})`
    );
  }

  if (!data.url) {
    throw new Error("Upload failed: no file URL returned");
  }

  return data;
}
