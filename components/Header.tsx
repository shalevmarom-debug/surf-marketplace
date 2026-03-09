"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { APP_NAME } from "@/lib/constants";
import { Waves, ArrowLeft, Plus, List, LogOut } from "lucide-react";

type UserInfo = { email: string | null } | null;

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLElement>(null);

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
      {/* Row 1: logo + icon + Post a board (mobile compact) */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
          {pathname !== "/" && (
            <Link
              href="/"
              className="flex shrink-0 items-center justify-center rounded-lg p-2 text-[var(--surf-muted-text)] hover:bg-[var(--surf-border)] hover:text-[var(--foreground)] sm:px-3"
              aria-label="Back to feed"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
              <span className="hidden sm:inline">חזרה לפיד</span>
            </Link>
          )}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-[var(--surf-primary)] hover:opacity-90 sm:gap-2.5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--foreground)] text-white sm:h-9 sm:w-9">
            <Waves className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
          </span>
          <span className="hidden truncate text-lg font-bold tracking-tight text-[var(--surf-primary)] sm:block sm:text-xl sm:text-[var(--foreground)]">
            {APP_NAME}
          </span>
        </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {loading ? (
            <span className="text-xs text-[var(--surf-muted-text)]">...</span>
          ) : user?.email ? (
            <>
              <Link
                href="/new-listing"
                className="flex items-center gap-1.5 rounded-xl bg-[var(--surf-primary)] px-2 py-2 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)] transition-colors sm:px-4 sm:py-2.5"
                aria-label="Post a board"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Post a board</span>
              </Link>
              <Link
                href="/my-listings"
                className="flex items-center justify-center rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--surf-border)] sm:px-3 sm:py-2"
                aria-label="My listings"
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">My listings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--surf-border)] sm:px-3 sm:py-2"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login?redirect=/new-listing"
                className="flex items-center gap-1.5 rounded-xl bg-[var(--surf-primary)] px-2 py-2 text-sm font-semibold text-white hover:bg-[var(--surf-primary-hover)] transition-colors sm:px-4 sm:py-2.5"
                aria-label="Post a board"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Post a board</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center rounded-lg p-2 text-sm font-medium text-[var(--surf-primary)] hover:bg-[var(--surf-border)] sm:px-3 sm:py-2"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
