"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isValidUsername } from "@/lib/auth";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/login";
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const un = username.trim();
    if (!isValidUsername(un)) {
      setStatus("Username: 3–50 characters, letters, numbers, underscore only.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: un }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(data?.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center text-sm text-[var(--surf-muted-text)]">
        <p>
          If an account exists for <strong className="text-[var(--foreground)]">@{username.trim()}</strong>{" "}
          and has a recovery email on file, we sent a reset link to that inbox.
        </p>
        <p className="text-xs leading-relaxed">
          Check spam. The link expires after a short time. No email? Make sure you added a recovery email
          in Account settings while logged in, or sign up again with a recovery email.
        </p>
        <Link
          href={redirectTo !== "/login" ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
          className="inline-block font-medium text-[var(--surf-primary)] hover:underline"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-center text-sm text-[var(--surf-muted-text)]">
        Enter your username. We&apos;ll email a reset link to the recovery address saved on your account.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--surf-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)] disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
      {status && <p className="mt-4 text-center text-sm text-[var(--surf-muted-text)]">{status}</p>}
      <p className="mt-4 text-center text-sm text-[var(--surf-muted-text)]">
        <Link
          href={redirectTo !== "/login" ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
          className="font-medium text-[var(--surf-primary)] hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-center text-[var(--foreground)]">Forgot password</h1>
        <Suspense fallback={<p className="text-center text-sm text-[var(--surf-muted-text)]">Loading...</p>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
