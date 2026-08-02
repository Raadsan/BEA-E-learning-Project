import { NextRequest, NextResponse } from "next/server";

const backendOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:7004")
  .trim()
  .replace(/\/api\/?$/, "");

const BACKEND_UPLOAD_PATHS = ["/api/uploads", "/api/materials/upload"];

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {};
  }
  return response.json().catch(() => ({}));
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const requireS3 = request.headers.get("x-require-s3");
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const outbound = new FormData();
    outbound.append("file", file);

    let lastStatus = 502;
    let lastError = "Upload endpoint not available on server";

    for (const path of BACKEND_UPLOAD_PATHS) {
      const response = await fetch(`${backendOrigin}${path}`, {
        method: "POST",
        headers: { ...(auth ? { Authorization: auth } : {}), ...(requireS3 ? { "x-require-s3": requireS3 } : {}) },
        body: outbound,
      });

      const data = await parseJsonResponse(response);
      lastStatus = response.status;

      if (response.status === 404) {
        continue;
      }

      if (response.ok) {
        return NextResponse.json(data);
      }

      lastError =
        data.error ||
        data.message ||
        `Upload failed (${response.status})`;

      return NextResponse.json({ error: lastError }, { status: response.status });
    }

    return NextResponse.json({ error: lastError }, { status: lastStatus });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
