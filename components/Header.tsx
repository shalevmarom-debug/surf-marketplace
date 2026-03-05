"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { APP_NAME } from "@/lib/constants";

type UserInfo = { email: string | null } | null;

export default function Header() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setSearchQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    function setHeaderHeight() {
      if (headerRef.current) {
        document.documentElement.style.setProperty("--header-height", `${headerRef.current.offsetHeight}px`);
      }
    }
    setHeaderHeight();
    window.addEventListener("resize", setHeaderHeight);
    return () => window.removeEventListener("resize", setHeaderHeight);
  }, []);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser({ email: data.user?.email ?? null });
      setLoading(false);
    }
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser({ email: session?.user?.email ?? null });
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-[var(--surf-border)] bg-[var(--surf-card)] shadow-sm">
      {/* Row 1: logo + Post a board (mobile compact) */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:py-3">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-[var(--foreground)] hover:opacity-90 sm:text-xl"
        >
          {APP_NAME}
        </Link>

        <form action="/" method="GET" className="hidden flex-1 max-w-xl mx-auto sm:block">
          <input
            type="search"
            name="q"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search title, brand, city..."
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-4 py-2.5 text-sm placeholder:text-[var(--surf-muted-text)] focus:border-[var(--surf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--surf-primary)]/20"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/new-listing"
            className="rounded-xl bg-[var(--surf-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)] transition-colors sm:px-4 sm:py-2.5"
          >
            Post a board
          </Link>
          {loading ? (
            <span className="text-xs text-[var(--surf-muted-text)]">...</span>
          ) : user?.email ? (
            <div className="flex items-center gap-2">
              <Link
                href="/my-listings"
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
              >
                My listings
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--surf-primary)] hover:bg-[var(--surf-border)]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      {/* Row 2: full-width search (mobile only) */}
      <div className="border-t border-[var(--surf-border)] px-4 py-2 sm:hidden">
        <form action="/" method="GET">
          <input
            type="search"
            name="q"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search title, brand, city..."
            className="w-full rounded-xl border border-[var(--surf-border)] bg-[var(--background)] px-4 py-2 text-sm placeholder:text-[var(--surf-muted-text)] focus:border-[var(--surf-primary)] focus:outline-none"
          />
        </form>
      </div>
    </header>
  );
}
