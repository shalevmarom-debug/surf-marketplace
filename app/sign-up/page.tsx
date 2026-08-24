"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isValidUsername, normalizeUsername, toInternalEmail, isValidRecoveryEmail, normalizeRecoveryEmail } from "@/lib/auth";

function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
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

    const recovery = normalizeRecoveryEmail(recoveryEmail);
    if (!isValidRecoveryEmail(recovery)) {
      setStatus("Enter a valid recovery email (for password reset).");
      setLoading(false);
      return;
    }

    const internalEmail = toInternalEmail(un);
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: internalEmail,
      password,
      options: { data: { first_name: firstName.trim(), last_name: lastName.trim() } },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
        setStatus("Username already taken. Choose another.");
      } else {
        setStatus(`Error: ${signUpError.message}`);
      }
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setStatus("Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    if (!authData.session) {
      setStatus("Account created but login failed. Please try logging in.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: authData.user.id,
      username: normalizeUsername(un),
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      recovery_email: recovery,
    });

    if (profileError) {
      setStatus(`Error saving profile: ${profileError.message}. Please contact support.`);
      setLoading(false);
      return;
    }

    window.location.href = redirectTo;
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
            minLength={3}
            maxLength={50}
            autoComplete="username"
            placeholder="e.g. surfer123"
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="firstName">First name</label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="recoveryEmail">
            Recovery email
          </label>
          <input
            id="recoveryEmail"
            type="email"
            required
            autoComplete="email"
            placeholder="For password reset only"
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--surf-muted-text)]">
            We&apos;ll send reset links here. You still log in with username, not email.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--foreground)]" htmlFor="password">Password</label>
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--surf-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)] disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
      {status && <p className="mt-4 text-center text-sm text-[var(--surf-muted-text)]">{status}</p>}
      <p className="mt-4 text-center text-sm text-[var(--surf-muted-text)]">
        Already have an account?{" "}
        <Link
          href={redirectTo !== "/" ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
          className="font-medium text-[var(--surf-primary)] hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-center text-[var(--foreground)]">Sign up</h1>
        <Suspense fallback={<p className="text-center text-sm text-[var(--surf-muted-text)]">Loading...</p>}>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  );
}
