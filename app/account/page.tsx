"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isValidRecoveryEmail, normalizeRecoveryEmail } from "@/lib/auth";

export default function AccountPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace("/login?redirect=/account");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username, recovery_email")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (profileError) {
        setStatus(`Error loading profile: ${profileError.message}`);
      } else {
        setUsername(profile?.username ?? null);
        setRecoveryEmail(profile?.recovery_email ?? "");
      }

      setCheckingAuth(false);
    }

    load();
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const email = normalizeRecoveryEmail(recoveryEmail);
    if (!isValidRecoveryEmail(email)) {
      setStatus("Enter a valid recovery email address.");
      return;
    }

    setLoading(true);
    setStatus(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace("/login?redirect=/account");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ recovery_email: email })
      .eq("id", userData.user.id);

    if (error) {
      setStatus(`Error saving: ${error.message}`);
    } else {
      setStatus("Recovery email saved. Use Forgot password if you need to reset your password.");
    }

    setLoading(false);
  }

  if (checkingAuth) {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <p className="text-center text-sm text-[var(--surf-muted-text)]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">Account</h1>
      {username && (
        <p className="mb-6 text-sm text-[var(--surf-muted-text)]">
          Logged in as <strong className="text-[var(--foreground)]">@{username}</strong>
        </p>
      )}

      <div className="rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-[var(--foreground)]">Recovery email</h2>
        <p className="mb-4 text-sm text-[var(--surf-muted-text)]">
          Used only to send password reset links. Login stays username + password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="recoveryEmail">
              Email
            </label>
            <input
              id="recoveryEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--surf-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save recovery email"}
          </button>
        </form>
        {status && <p className="mt-4 text-center text-sm text-[var(--surf-muted-text)]">{status}</p>}
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/my-listings" className="font-medium text-[var(--surf-primary)] hover:underline">
          My listings
        </Link>
      </p>
    </main>
  );
}
