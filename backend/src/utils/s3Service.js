import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_BUCKET_NAME;
const prefix = (process.env.AWS_S3_UPLOAD_PREFIX || "bea_uploads").replace(/\/$/, "");

let s3Client = null;

const getS3Client = () => {
    if (!s3Client) {
        s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
};

export const isS3Enabled = () =>
    Boolean(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_BUCKET_NAME &&
        process.env.AWS_REGION
    );

export const buildS3Key = (filename) => `${prefix}/${filename}`;

export const buildPublicUrl = (key) =>
    `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

export const isRemoteFileUrl = (value) =>
    typeof value === "string" && /^https?:\/\//i.test(value);

export const resolveS3Key = (storedValue) => {
    if (!storedValue || typeof storedValue !== "string") return null;

    if (isRemoteFileUrl(storedValue)) {
        try {
            const url = new URL(storedValue);
            const key = decodeURIComponent(url.pathname.replace(/^\//, ""));
            return key || null;
        } catch {
            return null;
        }
    }

    // Strip leading slash for normalisation
    const normalized = storedValue.replace(/^\//, "");

    // Local path stored as /uploads/filename or uploads/filename
    if (normalized.startsWith("uploads/")) {
        const filename = normalized.replace(/^uploads\//, "");
        return buildS3Key(filename);
    }

    // Already a valid S3 key with the correct prefix
    if (normalized.startsWith(`${prefix}/`)) {
        return normalized;
    }

    // Other slash-containing paths: return as-is (e.g. already resolved)
    if (normalized.includes("/")) return normalized;

    return buildS3Key(normalized);
};

export async function uploadBufferToS3({ buffer, originalname, mimetype }) {
    if (!isS3Enabled()) {
        throw new Error("S3 is not configured");
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}${path.extname(originalname || "")}`;
    const key = buildS3Key(filename);

    await getS3Client().send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: mimetype || "application/octet-stream",
        })
    );

    return {
        filename,
        key,
        url: buildPublicUrl(key),
    };
}

export async function getSignedFileUrl(storedValue, expiresIn = 3600) {
    if (!isS3Enabled()) return null;

    const key = resolveS3Key(storedValue);
    if (!key) return null;

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function getS3ObjectStream(storedValue) {
    if (!isS3Enabled()) return null;

    const key = resolveS3Key(storedValue);
    if (!key) return null;

    const response = await getS3Client().send(
        new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    return {
        stream: response.Body,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
    };
}
