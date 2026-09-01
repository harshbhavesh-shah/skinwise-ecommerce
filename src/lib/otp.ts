import crypto from "crypto";
import { getDb } from "./db";
import { sendEmail, buildOtpEmail } from "./email";

const OTP_COLLECTION = "otpCodes";
const CODE_LENGTH = 6;
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  // crypto.randomInt is uniform (unlike Math.random) — fine for a
  // short-lived, single-use, rate-limited challenge like this.
  return crypto.randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, "0");
}

export type RequestOtpResult = { ok: true } | { ok: false; error: string };

// Generates a fresh code, overwriting any previous one for this user, and
// emails it. Enforces a resend cooldown so a user (or a script hammering
// this endpoint) can't spam their own inbox or burn through Resend's quota.
export async function requestOtp(uid: string, email: string): Promise<RequestOtpResult> {
  const db = getDb();
  const ref = db.collection(OTP_COLLECTION).doc(uid);

  const existing = await ref.get();
  if (existing.exists) {
    const lastSentAt = new Date(existing.data()?.lastSentAt ?? 0).getTime();
    const waitMs = RESEND_COOLDOWN_MS - (Date.now() - lastSentAt);
    if (waitMs > 0) {
      return { ok: false, error: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.` };
    }
  }

  const code = generateCode();
  const now = new Date();
  await ref.set({
    codeHash: hashCode(code),
    expiresAt: new Date(now.getTime() + EXPIRY_MS).toISOString(),
    attempts: 0,
    lastSentAt: now.toISOString(),
  });

  const { subject, html } = buildOtpEmail(code);
  const result = await sendEmail(email, subject, html);
  if (!result.sent) {
    return { ok: false, error: "Couldn't send the verification email. Please try again shortly." };
  }
  return { ok: true };
}

export type VerifyOtpResult = { ok: true } | { ok: false; error: string };

// Single-use: deletes the code on success so it can't be replayed. Wrong
// attempts are counted per-code and cap out, so a code can't be brute-forced
// (a 6-digit code + 5 attempts + 10-minute expiry is a reasonable balance
// between security and not locking out a genuine typo).
export async function verifyOtp(uid: string, code: string): Promise<VerifyOtpResult> {
  const db = getDb();
  const ref = db.collection(OTP_COLLECTION).doc(uid);
  const doc = await ref.get();

  if (!doc.exists) {
    return { ok: false, error: "No verification code is pending. Please request a new one." };
  }

  const data = doc.data()!;
  if (new Date(data.expiresAt).getTime() < Date.now()) {
    await ref.delete();
    return { ok: false, error: "That code has expired. Please request a new one." };
  }

  if ((data.attempts ?? 0) >= MAX_ATTEMPTS) {
    await ref.delete();
    return { ok: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  const providedHash = hashCode(code);
  const storedHash: string = data.codeHash;
  const matches =
    providedHash.length === storedHash.length &&
    crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(storedHash));

  if (!matches) {
    await ref.update({ attempts: (data.attempts ?? 0) + 1 });
    return { ok: false, error: "Incorrect code. Please try again." };
  }

  await ref.delete();
  return { ok: true };
}
