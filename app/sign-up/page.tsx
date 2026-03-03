"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus("Signup successful! You can now try logging in.");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold text-center">Sign up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded border px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded border px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}