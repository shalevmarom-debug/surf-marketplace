"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { APP_NAME } from "@/lib/constants";

type UserInfo = {
  email: string | null;
} | null;

export default function AuthStatus() {
  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser({ email: data.user?.email ?? null });
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser({ email: session?.user.email ?? null });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="border-b bg-white shadow-sm">
      {/* Top bar: logo + auth state */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
        {APP_NAME}
        </Link>

        {loading ? (
          <span className="text-sm text-gray-500">Checking session...</span>
        ) : user?.email ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-700">
              Logged in as <strong>{user.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-300"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
            <Link href="/sign-up" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Bottom bar: dev navigation */}
      <nav className="border-t bg-gray-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2 text-xs sm:text-sm">
          <Link
            href="/"
            className="rounded px-3 py-1 font-medium text-gray-800 hover:bg-gray-200"
          >
            Home
          </Link>
          <Link
            href="/new-listing"
            className="rounded px-3 py-1 font-medium text-gray-800 hover:bg-gray-200"
          >
            New listing
          </Link>
          <Link
            href="/my-listings"
            className="rounded px-3 py-1 font-medium text-gray-800 hover:bg-gray-200"
          >
            My listings
          </Link>
        </div>
      </nav>
    </header>
  );
}