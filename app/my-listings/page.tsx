"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Listing = {
  id: string;
  title: string;
  price_ils: number | null;
  city: string;
  region: string;
  board_type: string;
  condition: string;
  sold_at: string | null;
  created_at: string;
};

function getSoldNotifyUrl(title: string, id: string) {
  const url = `${window.location.origin}/listing/${id}`;
  const message = `עדכון: הגלשן "${title}" נמכר. תודה על הפנייה!\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export default function MyListingsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>>((resolve) =>
          window.setTimeout(() => resolve({ data: { session: null }, error: null }), 3000)
        ),
      ]);

      const uid = sessionResult.data.session?.user?.id;
      if (!uid) {
        router.replace("/login?redirect=/my-listings");
        return;
      }

      setUserId(uid);
      setCheckingAuth(false);
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, title, price_ils, city, region, board_type, condition, sold_at, created_at"
        )
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) {
        setStatus(`Error loading listings: ${error.message}`);
      } else {
        setListings(data ?? []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this listing?");
    if (!confirmed) return;

    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      setStatus(`Error deleting listing: ${error.message}`);
      return;
    }

    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleMarkSold(id: string) {
    if (!userId) return;
    const confirmed = window.confirm("Mark this listing as sold?");
    if (!confirmed) return;

    const soldAt = new Date().toISOString();
    const { error } = await supabase
      .from("listings")
      .update({ sold_at: soldAt })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setStatus(`Error marking as sold: ${error.message}`);
      return;
    }

    setListings((prev) =>
      prev.map((listing) => (listing.id === id ? { ...listing, sold_at: soldAt } : listing))
    );
    setStatus("Marked as sold. You can notify interested buyers on WhatsApp.");
  }

  async function handleUnmarkSold(id: string) {
    if (!userId) return;
    const confirmed = window.confirm("Mark this listing as available again?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("listings")
      .update({ sold_at: null })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setStatus(`Error restoring listing: ${error.message}`);
      return;
    }

    setListings((prev) =>
      prev.map((listing) => (listing.id === id ? { ...listing, sold_at: null } : listing))
    );
    setStatus("Listing is available again.");
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--surf-muted-text)]">Checking permissions...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] py-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Listings</h1>
          <Link
            href="/account"
            className="text-sm font-medium text-[var(--surf-primary)] hover:underline"
          >
            Account settings
          </Link>
        </div>

        {loading ? (
          <p className="text-[var(--surf-muted-text)]">Loading your listings...</p>
        ) : listings.length === 0 ? (
          <p className="text-[var(--surf-muted-text)]">
            You do not have any listings yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex flex-col gap-3 rounded border border-[var(--surf-border)] px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-[var(--foreground)]">{listing.title}</div>
                    {listing.sold_at && (
                      <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Sold
                      </span>
                    )}
                  </div>
                  <div className="text-[var(--surf-muted-text)]">
                    {listing.city}, {listing.region} · {listing.board_type} · {listing.condition}
                  </div>
                  {listing.price_ils !== null && (
                    <div className="text-[var(--foreground)]">{listing.price_ils} ILS</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/listing/${listing.id}`}
                    className="rounded border border-[var(--surf-border)] px-2 py-1 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surf-border)]"
                  >
                    View
                  </Link>
                  {!listing.sold_at && (
                    <>
                      <Link
                        href={`/listing/${listing.id}/edit`}
                        className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-300"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleMarkSold(listing.id)}
                        className="rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                      >
                        Mark sold
                      </button>
                    </>
                  )}
                  {listing.sold_at && (
                    <>
                      <a
                        href={getSoldNotifyUrl(listing.title, listing.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        Notify sold
                      </a>
                      <button
                        type="button"
                        onClick={() => handleUnmarkSold(listing.id)}
                        className="rounded border border-amber-500 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        Undo sold
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(listing.id)}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {status && <p className="mt-4 text-sm text-[var(--surf-muted-text)]">{status}</p>}
      </div>
    </main>
  );
}
