export type UploadResponse = {
  url: string;
  filename?: string;
  mimetype?: string;
  message?: string;
  error?: string;
};

/** Same-origin backend route: browser -> BEA backend -> S3. */
const UPLOAD_URL = "/api/uploads";

export async function uploadFileRequest(file: File, options?: { requireS3?: boolean }): Promise<UploadResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("You must be logged in to upload files.");
  }

  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(UPLOAD_URL, {
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
