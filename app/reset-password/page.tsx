"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function ResetPasswordForm() {
  const router = useRouter();
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
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && !cancelled) {
          setStatus(`Invalid or expired reset link: ${error.message}`);
          setChecking(false);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) {
        setReady(!!session);
        setChecking(false);
        if (!session && !code) {
          setStatus("Open the reset link from your email, or request a new one.");
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

    return () => {
      cancelled = true;
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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?reset=success");
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
