import crypto from "crypto";

/** In-memory OTP sessions (cleared on server restart). */
const sessions = new Map();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function cleanupExpired() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt <= now) sessions.delete(id);
  }
}

export function createOtpSession({ email, userData }) {
  cleanupExpired();
  const otp = String(crypto.randomInt(100000, 999999));
  const sessionId = crypto.randomBytes(24).toString("hex");
  const codeHash = crypto.createHash("sha256").update(otp).digest("hex");

  sessions.set(sessionId, {
    email,
    userData,
    codeHash,
    attempts: 0,
    expiresAt: Date.now() + OTP_TTL_MS,
    createdAt: Date.now(),
  });

  return { sessionId, otp, expiresInMinutes: OTP_TTL_MS / 60000 };
}

export function verifyOtpSession(sessionId, code) {
  cleanupExpired();
  const session = sessions.get(sessionId);
  if (!session) return { ok: false, error: "OTP session expired or invalid. Please sign in again." };
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return { ok: false, error: "OTP has expired. Please sign in again." };
  }
  if (session.attempts >= MAX_ATTEMPTS) {
    sessions.delete(sessionId);
    return { ok: false, error: "Too many failed attempts. Please sign in again." };
  }

  const codeHash = crypto.createHash("sha256").update(String(code).trim()).digest("hex");
  if (codeHash !== session.codeHash) {
    session.attempts += 1;
    const remaining = MAX_ATTEMPTS - session.attempts;
    return {
      ok: false,
      error: remaining > 0
        ? `Invalid OTP. ${remaining} attempt(s) remaining.`
        : "Too many failed attempts. Please sign in again.",
    };
  }

  sessions.delete(sessionId);
  return { ok: true, userData: session.userData };
}

export function canResendOtp(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  return Date.now() - session.createdAt >= 60 * 1000;
}

export function refreshOtpCode(sessionId) {
  cleanupExpired();
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (!canResendOtp(sessionId)) return { tooSoon: true };

  const otp = String(crypto.randomInt(100000, 999999));
  session.codeHash = crypto.createHash("sha256").update(otp).digest("hex");
  session.attempts = 0;
  session.expiresAt = Date.now() + OTP_TTL_MS;
  session.createdAt = Date.now();
  return { otp, email: session.email, name: session.userData?.full_name || "" };
}
