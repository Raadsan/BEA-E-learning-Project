import multer from "multer";
import path from "path";
import { persistRequestUploads, getStoredFileUrl } from "../utils/fileStorage.js";
import { createPresignedUploadUrl } from "../utils/s3Service.js";

const ALLOWED_EXTENSIONS = new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".mp3",
    ".wav",
    ".m4a",
    ".ogg",
    ".webm",
    ".mp4",
    ".mov",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
]);

const isAllowedUpload = (file) => {
    const mimetype = file.mimetype || "";
    const ext = path.extname(file.originalname || "").toLowerCase();

    if (
        mimetype.startsWith("audio/") ||
        mimetype.startsWith("video/") ||
        mimetype.startsWith("image/") ||
        mimetype === "application/pdf" ||
        mimetype === "application/msword" ||
        mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimetype === "text/plain"
    ) {
        return true;
    }

    // Windows often reports Office files as octet-stream or zip
    if (
        (mimetype === "application/octet-stream" || mimetype === "application/zip") &&
        ALLOWED_EXTENSIONS.has(ext)
    ) {
        return true;
    }

    return false;
};

const fileFilter = (req, file, cb) => {
    if (isAllowedUpload(file)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only audio, video, images, PDF, Word, and text files are allowed."), false);
    }
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter,
});

export const withStoredUpload =
    (multerMiddleware) =>
    (req, res, next) => {
        multerMiddleware(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message || "File upload failed" });
            }

            try {
                await persistRequestUploads(req);
                next();
            } catch (storageErr) {
                console.error("File storage error:", storageErr);
                return res.status(500).json({ error: storageErr.message || "File upload failed" });
            }
        });
    };

export const uploadFile = (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const fileUrl = getStoredFileUrl(req.file);
        if (req.headers["x-require-s3"] === "true" && !req.file.storageKey) {
            return res.status(503).json({ error: "S3 upload failed. The file was not saved; check S3 configuration and permissions." });
        }
        res.json({
            message: "File uploaded successfully",
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "File upload failed" });
    }
};

export const createPresignedUpload = async (req, res) => {
    try {
        const { filename, mimetype, size } = req.body;
        if (!filename || !mimetype) return res.status(400).json({ error: "Filename and file type are required" });
        if (Number(size) > 500 * 1024 * 1024) return res.status(400).json({ error: "File is larger than the 500 MB limit" });
        const result = await createPresignedUploadUrl({ originalname: filename, mimetype });
        res.json(result);
    } catch (error) {
        console.error("Presigned S3 upload error:", error);
        res.status(500).json({ error: error.message || "Could not prepare S3 upload" });
    }
};