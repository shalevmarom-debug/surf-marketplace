"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ReportRow = {
  id: string;
  listing_id: string;
  reporter_id: string | null;
  reason: string;
  created_at: string;
  listings: { id: string; title: string; user_id: string; sold_at: string | null } | null;
};

type UserRow = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  recovery_email: string | null;
  created_at: string;
};

type ListingRow = {
  id: string;
  title: string;
  price_ils: number | null;
  city: string;
  region: string;
  board_type: string;
  sold_at: string | null;
  created_at: string;
  user_id: string;
};

function isAdminUserId(userId: string | null | undefined): boolean {
  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  return !!adminId && !!userId && userId === adminId;
}

async function getAccessToken(): Promise<string | null> {
  const sessionResult = await Promise.race([
    supabase.auth.getSession(),
    new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>>((resolve) =>
      window.setTimeout(() => resolve({ data: { session: null }, error: null }), 3000)
    ),
  ]);
  return sessionResult.data.session?.access_token ?? null;
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated.");

  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const data = (await response.json().catch(() => null)) as T & { error?: string };
  if (!response.ok) throw new Error(data?.error ?? "Request failed.");
  return data;
}

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>>((resolve) =>
          window.setTimeout(() => resolve({ data: { session: null }, error: null }), 3000)
        ),
      ]);

      const userId = sessionResult.data.session?.user?.id;
      if (!isAdminUserId(userId)) {
        router.replace("/login?redirect=/admin");
        return;
      }

      setChecking(false);
      await loadAll();
    }

    init();
  }, [router]);

  async function loadAll() {
    setLoading(true);
    setStatus(null);
    try {
      const [reportsData, usersData, listingsData] = await Promise.all([
        adminFetch<{ reports: ReportRow[] }>("/api/admin/reports"),
        adminFetch<{ users: UserRow[] }>("/api/admin/users"),
        adminFetch<{ listings: ListingRow[] }>("/api/admin/listings"),
      ]);
      setReports(reportsData.reports);
      setUsers(usersData.users);
      setListings(listingsData.listings);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteListing(id: string, title: string) {
    const confirmed = window.confirm(`Delete listing "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await adminFetch(`/api/admin/listings/${id}`, { method: "DELETE" });
      setListings((prev) => prev.filter((listing) => listing.id !== id));
      setReports((prev) => prev.filter((report) => report.listing_id !== id));
      setStatus(`Deleted listing "${title}".`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--surf-muted-text)]">Checking admin access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] py-8">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin</h1>
            <p className="text-sm text-[var(--surf-muted-text)]">
              Reports, user emails, and listing moderation.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="rounded-xl border border-[var(--surf-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surf-border)] disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {status && <p className="text-sm text-[var(--surf-muted-text)]">{status}</p>}

        <section className="rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recent reports</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-[var(--surf-muted-text)]">No reports yet.</p>
          ) : (
            <ul className="space-y-3">
              {reports.map((report) => (
                <li key={report.id} className="rounded-xl border border-[var(--surf-border)] p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">
                        {report.listings?.title ?? "Deleted listing"}
                      </p>
                      <p className="mt-1 text-[var(--surf-muted-text)]">{report.reason}</p>
                      <p className="mt-2 text-xs text-[var(--surf-muted-text)]">
                        {new Date(report.created_at).toLocaleString()}
                        {report.reporter_id ? ` · reporter ${report.reporter_id}` : " · anonymous"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {report.listings && (
                        <Link
                          href={`/listing/${report.listing_id}`}
                          className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-300"
                        >
                          View
                        </Link>
                      )}
                      {report.listings && (
                        <button
                          type="button"
                          onClick={() => deleteListing(report.listing_id, report.listings!.title)}
                          className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Delete listing
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Users & recovery emails</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--surf-border)] text-left text-[var(--surf-muted-text)]">
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Recovery email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--surf-border)]">
                    <td className="px-3 py-2 font-medium">{user.username ? `@${user.username}` : "—"}</td>
                    <td className="px-3 py-2">
                      {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {user.recovery_email ? (
                        <a href={`mailto:${user.recovery_email}`} className="text-[var(--surf-primary)] hover:underline">
                          {user.recovery_email}
                        </a>
                      ) : (
                        <span className="text-[var(--surf-muted-text)]">No email</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">All listings</h2>
          <ul className="space-y-3">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex flex-col gap-3 rounded-xl border border-[var(--surf-border)] p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-[var(--foreground)]">{listing.title}</div>
                  <div className="text-[var(--surf-muted-text)]">
                    {listing.city}, {listing.region} · {listing.board_type}
                    {listing.sold_at ? " · Sold" : ""}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/listing/${listing.id}`}
                    className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-300"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteListing(listing.id, listing.title)}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
