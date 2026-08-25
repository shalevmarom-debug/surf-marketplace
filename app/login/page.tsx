"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { normalizeUsername } from "@/lib/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const resetSuccess = searchParams.get("reset") === "success";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: normalizeUsername(username),
          password,
        }),
        signal: controller.signal,
      });

      window.clearTimeout(timeout);

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        access_token?: string;
        refresh_token?: string;
      } | null;

      if (!response.ok || !data?.access_token || !data?.refresh_token) {
        setStatus(data?.error ? `Error: ${data.error}` : "Login failed.");
        setLoading(false);
        return;
      }

      const setSessionResult = await Promise.race([
        supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        }),
        new Promise<{ error: { message: string } }>((resolve) =>
          window.setTimeout(() => resolve({ error: { message: "timeout" } }), 5000)
        ),
      ]);

      if (setSessionResult.error && setSessionResult.error.message !== "timeout") {
        setStatus(`Error: ${setSessionResult.error.message}`);
        setLoading(false);
        return;
      }

      window.location.assign(redirectTo);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Login timed out. Check your connection and try again.");
      } else {
        setStatus("Login failed. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="username">Username</label>
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
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="password">
              Password
            </label>
            <Link
              href={
                redirectTo !== "/"
                  ? `/forgot-password?redirect=${encodeURIComponent(redirectTo)}`
                  : "/forgot-password"
              }
              className="text-xs font-medium text-[var(--surf-primary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--surf-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)] disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      {resetSuccess && (
        <p className="mt-4 text-center text-sm text-green-700 dark:text-green-400">
          Password updated. Log in with your new password.
        </p>
      )}
      {status && <p className="mt-4 text-center text-sm text-[var(--surf-muted-text)]">{status}</p>}
      <p className="mt-4 text-center text-sm text-[var(--surf-muted-text)]">
        Don&apos;t have an account?{" "}
        <Link
          href={redirectTo !== "/" ? `/sign-up?redirect=${encodeURIComponent(redirectTo)}` : "/sign-up"}
          className="font-medium text-[var(--surf-primary)] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-center text-[var(--foreground)]">Log in</h1>
        <Suspense fallback={<p className="text-center text-sm text-[var(--surf-muted-text)]">Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
