"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

async function establishRecoverySession(searchParams: URLSearchParams): Promise<string | null> {
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error?.message ?? null;
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    return error?.message ?? null;
  }

  if (typeof window !== "undefined" && window.location.hash) {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const hashType = hash.get("type");
    if (accessToken && refreshToken && hashType === "recovery") {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      return error?.message ?? null;
    }
  }

  return null;
}

function hasRecoveryParams(searchParams: URLSearchParams): boolean {
  if (searchParams.get("code") || searchParams.get("token_hash")) return true;
  if (typeof window === "undefined") return false;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hash.get("type") === "recovery" && !!hash.get("access_token");
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      const hadRecoveryParams = hasRecoveryParams(searchParams);
      const exchangeError = await establishRecoverySession(searchParams);

      if (exchangeError && !cancelled) {
        setStatus(`Invalid or expired reset link: ${exchangeError}`);
        setChecking(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        if (session) {
          setReady(true);
          setChecking(false);
          setStatus(null);
        } else if (!hadRecoveryParams) {
          setStatus("Open the reset link from your email, or request a new one.");
          setChecking(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
        setChecking(false);
        setStatus(null);
      }
    });

    initSession();

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setChecking((prev) => {
          if (prev) {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (!cancelled && session) {
                setReady(true);
                setStatus(null);
              } else if (!cancelled && !session && hasRecoveryParams(searchParams)) {
                setStatus("Invalid or expired reset link. Request a new one.");
              } else if (!cancelled && !session) {
                setStatus("Open the reset link from your email, or request a new one.");
              }
              setChecking(false);
            });
          }
          return false;
        });
      }
    }, 2500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [searchParams]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      setStatus("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setStatus("Session expired. Request a new reset link.");
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);

      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ password }),
        signal: controller.signal,
      });

      window.clearTimeout(timeout);

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setStatus(data?.error ? `Error: ${data.error}` : "Could not update password.");
        setLoading(false);
        return;
      }

      void supabase.auth.signOut();
      window.location.href = "/login?reset=success";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Request timed out. Check your connection and try again.");
      } else {
        setStatus("Could not update password. Please try again.");
      }
      setLoading(false);
    }
  }

  if (checking) {
    return <p className="text-center text-sm text-[var(--surf-muted-text)]">Verifying reset link...</p>;
  }

  if (!ready) {
    return (
      <div className="space-y-4 text-center text-sm text-[var(--surf-muted-text)]">
        {status && <p>{status}</p>}
        <Link href="/forgot-password" className="font-medium text-[var(--surf-primary)] hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-center text-sm text-[var(--surf-muted-text)]">Choose a new password for your account.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--surf-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)] disabled:opacity-60"
        >
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
      {status && <p className="mt-4 text-center text-sm text-[var(--surf-muted-text)]">{status}</p>}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-center text-[var(--foreground)]">Reset password</h1>
        <Suspense fallback={<p className="text-center text-sm text-[var(--surf-muted-text)]">Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
