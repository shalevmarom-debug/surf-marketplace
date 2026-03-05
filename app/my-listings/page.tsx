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
  created_at: string;
};

export default function MyListingsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, title, price_ils, city, region, board_type, condition, created_at"
        )
        .eq("user_id", userData.user.id)
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
        <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">My Listings</h1>

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
                className="flex items-center justify-between rounded border px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-semibold">{listing.title}</div>
                  <div className="text-gray-600">
                    {listing.city}, {listing.region} · {listing.board_type} ·{" "}
                    {listing.condition}
                  </div>
                  {listing.price_ils !== null && (
                    <div className="text-gray-800">
                      {listing.price_ils} ILS
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/listing/${listing.id}/edit`}
                    className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-300"
                  >
                    Edit
                  </Link>
                  <button
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

        {status && (
          <p className="mt-4 text-sm text-gray-700">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}