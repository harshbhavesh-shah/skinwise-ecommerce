"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";
import { useCustomerSession } from "@/lib/customer-session-context";

const RESEND_COOLDOWN_SECONDS = 30;

async function exchangeForSession(user: User): Promise<{ ok: boolean; error?: string }> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    await clientAuth.signOut();
    return { ok: false, error: data?.error || "Couldn't sign in." };
  }
  return { ok: true };
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const { refresh } = useCustomerSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState<"google" | "email" | "reset" | "otp" | "resend" | null>(null);

  // Email/password sign-ins go through a second step: the code we email to
  // the address they just proved they control the password for. Google
  // sign-in skips this entirely — it's already been through Google's own
  // strong auth, so another OTP step would just be redundant friction.
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const finishLogin = async () => {
    await refresh();
    router.push(redirectTo);
    router.refresh();
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading("google");
    try {
      const credential = await signInWithPopup(clientAuth, new GoogleAuthProvider());
      const result = await exchangeForSession(credential.user);
      if (!result.ok) {
        setError(result.error || "Couldn't sign in.");
        setLoading(null);
        return;
      }
      await finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setLoading(null);
    }
  };

  const requestCode = async (user: User) => {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false as const, error: data?.error || "Couldn't send a verification code." };
    }
    return { ok: true as const };
  };

  const handleEmailPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading("email");
    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email, password);
      const result = await requestCode(credential.user);
      if (!result.ok) {
        await clientAuth.signOut();
        setError(result.error);
        setLoading(null);
        return;
      }
      setPendingUser(credential.user);
      setStep("otp");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setLoading(null);
    } catch {
      setError("Incorrect email or password.");
      setLoading(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pendingUser) return;
    setError(null);
    setLoading("otp");
    try {
      const idToken = await pendingUser.getIdToken();
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't verify that code.");
        setLoading(null);
        return;
      }
      await finishLogin();
    } catch {
      setError("Couldn't verify that code. Please try again.");
      setLoading(null);
    }
  };

  const handleResend = async () => {
    if (!pendingUser || cooldown > 0) return;
    setError(null);
    setLoading("resend");
    const result = await requestCode(pendingUser);
    if (!result.ok) {
      setError(result.error);
    } else {
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
    setLoading(null);
  };

  const handleUseDifferentAccount = async () => {
    await clientAuth.signOut();
    setPendingUser(null);
    setStep("credentials");
    setCode("");
    setError(null);
    setPassword("");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email above first, then click “Forgot password”.");
      return;
    }
    setError(null);
    setLoading("reset");
    try {
      await sendPasswordResetEmail(clientAuth, email);
      setResetSent(true);
    } catch {
      setError("Couldn't send a reset email. Check the address and try again.");
    } finally {
      setLoading(null);
    }
  };

  if (step === "otp") {
    return (
      <div className="mx-auto flex max-w-sm flex-col px-8 py-24">
        <h1 className="mb-2 text-[26px] font-medium">Enter your code</h1>
        <p className="mb-8 text-sm text-ink-soft">
          We emailed a 6-digit verification code to {email}.
        </p>

        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            placeholder="123456"
            className="rounded-lg border border-line bg-white px-4 py-3 text-center text-lg tracking-[0.3em] outline-none focus:border-accent"
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading !== null || code.length !== 6}
            className="cursor-pointer rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white hover:bg-[#3a352d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "otp" ? "Verifying…" : "Verify & sign in"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-[12.5px]">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading !== null || cooldown > 0}
            className="cursor-pointer text-ink-soft underline disabled:cursor-not-allowed disabled:no-underline"
          >
            {cooldown > 0 ? `Resend code (${cooldown}s)` : loading === "resend" ? "Sending…" : "Resend code"}
          </button>
          <button
            type="button"
            onClick={handleUseDifferentAccount}
            className="cursor-pointer text-ink-soft underline"
          >
            Use a different account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-8 py-24">
      <h1 className="mb-2 text-[26px] font-medium">Sign in</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Access your saved details and order history.
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="mb-5 flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-line bg-white py-3 text-[14px] font-medium hover:bg-bg-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.29A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.29 5.37z" />
          <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77z" />
        </svg>
        {loading === "google" ? "Signing in…" : "Continue with Google"}
      </button>

      <div className="mb-5 flex items-center gap-3 text-[12px] text-ink-soft">
        <div className="h-px flex-1 bg-line" />
        or
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleEmailPassword} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loading !== null}
          className="cursor-pointer self-start text-[12.5px] text-ink-soft underline disabled:cursor-not-allowed"
        >
          {loading === "reset" ? "Sending…" : "Forgot password?"}
        </button>
        {resetSent && (
          <p className="rounded-lg bg-accent-soft px-4 py-3 text-[13px] text-accent">
            Check your inbox for a password reset link.
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading !== null}
          className="cursor-pointer rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white hover:bg-[#3a352d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "email" ? "Sending code…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-soft">
        Don&rsquo;t have an account?{" "}
        <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
