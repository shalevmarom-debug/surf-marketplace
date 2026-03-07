"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Plus, Heart, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--surf-border)] bg-[var(--surf-card)]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm md:hidden"
      aria-label="Main navigation"
    >
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 ${pathname === "/" ? "text-[var(--surf-primary)]" : "text-[var(--surf-muted-text)] hover:text-[var(--foreground)]"}`}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <Home className="h-6 w-6" strokeWidth={2} />
        <span className="text-xs font-medium">Home</span>
      </Link>
      <Link
        href="#"
        className="relative flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-[var(--surf-muted-text)] hover:text-[var(--foreground)]"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2} />
        <span className="text-xs font-medium">Chat</span>
      </Link>
      <Link
        href="/new-listing"
        className="-mt-6 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[var(--surf-primary)] text-white shadow-lg hover:bg-[var(--surf-primary-hover)]"
        aria-label="Post a board"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </Link>
      <Link
        href="#"
        className="flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-[var(--surf-muted-text)] hover:text-[var(--foreground)]"
      >
        <Heart className="h-6 w-6" strokeWidth={2} />
        <span className="text-xs font-medium">Favorites</span>
      </Link>
      <Link
        href="/my-listings"
        className="flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-[var(--surf-muted-text)] hover:text-[var(--foreground)]"
      >
        <User className="h-6 w-6" strokeWidth={2} />
        <span className="text-xs font-medium">Profile</span>
      </Link>
    </nav>
  );
}
