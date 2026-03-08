"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--surf-border)] bg-[var(--surf-card)]/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm md:hidden"
      aria-label="Main navigation"
    >
      <Link
        href="/"
        className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 md:px-4 ${pathname === "/" ? "text-[var(--surf-primary)]" : "text-[var(--surf-muted-text)] hover:text-[var(--foreground)]"}`}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <Home className="h-6 w-6" strokeWidth={2} />
        <span className="text-[10px] font-medium leading-tight md:text-xs">Home</span>
      </Link>
      <Link
        href="/new-listing"
        className="-mt-6 flex h-14 w-14 min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--surf-primary)] text-white shadow-lg hover:bg-[var(--surf-primary-hover)]"
        aria-label="Post a board"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </Link>
      <Link
        href="/my-listings"
        className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 md:px-4 ${pathname === "/my-listings" ? "text-[var(--surf-primary)]" : "text-[var(--surf-muted-text)] hover:text-[var(--foreground)]"}`}
        aria-current={pathname === "/my-listings" ? "page" : undefined}
      >
        <User className="h-6 w-6" strokeWidth={2} />
        <span className="text-[10px] font-medium leading-tight md:text-xs">Profile</span>
      </Link>
    </nav>
  );
}
