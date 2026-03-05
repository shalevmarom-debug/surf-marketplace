"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price_ils: number | null;
  city: string | null;
  city_he: string | null;
  city_other: string | null;
  region: string;
  board_type: string;
  length_ft: number | null;
  volume_l: number | null;
  brand: string | null;
  brand_raw: string | null;
  condition: string;
  repairs: boolean;
  fins_included: boolean;
  fin_setup: string | null;
  construction: string | null;
  whatsapp_phone: string | null;
  sold_at: string | null;
  created_at: string;
};

function displayCity(listing: Listing): string {
  return listing.city_he !== "אחר" ? (listing.city_he ?? listing.city ?? "") : (listing.city_other?.trim() || "אחר");
}

export default function ListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData?.user?.id ?? null);
      setCheckingAuth(false);
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select(
          `id, user_id, title, description, price_ils, city, city_he, city_other, region, board_type,
           length_ft, volume_l, brand, brand_raw, condition, repairs, fins_included,
           fin_setup, construction, whatsapp_phone, sold_at, created_at`
        )
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setStatus(error?.message ?? "Listing not found");
        setLoading(false);
        return;
      }

      const listingData = data as Listing;
      setListing(listingData);

      if (userData?.user?.id) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", userData.user.id)
          .eq("listing_id", params.id)
          .maybeSingle();
        setIsFavorite(!!fav?.id);
      }

      const { data: imagesData, error: imagesError } = await supabase
        .from("listing_images")
        .select("storage_path, sort_order, is_primary")
        .eq("listing_id", params.id)
        .order("is_primary", { ascending: false })
        .order("sort_order", { ascending: true });

      if (!imagesError && imagesData) {
        const urls = imagesData.map((img) =>
          supabase.storage.from("listing-images").getPublicUrl(img.storage_path)
            .data.publicUrl
        );
        setImageUrls(urls);
      }

      setLoading(false);
    }

    if (params.id) {
      load();
    }
  }, [params.id, router]);

  function getWhatsappUrl(listing: Listing) {
    if (!listing.whatsapp_phone) return null;
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const message = `Hi, I saw your surfboard listing "${listing.title}" on Surf Marketplace. Is it still available? ${currentUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const phone = listing.whatsapp_phone.replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--surf-muted-text)]">Loading...</p>
      </main>
    );
  }

  if (loading || !listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--surf-muted-text)]">
          {loading ? "Loading listing..." : status ?? "Listing not found."}
        </p>
      </main>
    );
  }

  async function toggleFavorite() {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", currentUserId).eq("listing_id", listing!.id);
      setIsFavorite(false);
    } else {
      await supabase.from("favorites").insert({ user_id: currentUserId, listing_id: listing!.id });
      setIsFavorite(true);
    }
  }

  async function markSold() {
    if (!currentUserId || currentUserId !== listing!.user_id) return;
    const { error } = await supabase.from("listings").update({ sold_at: new Date().toISOString() }).eq("id", listing!.id).eq("user_id", currentUserId);
    if (!error) setListing((prev) => (prev ? { ...prev, sold_at: new Date().toISOString() } : null));
  }

  async function reportListing(reason: string) {
    await supabase.from("reports").insert({ listing_id: listing!.id, reporter_id: currentUserId ?? undefined, reason });
    setStatus("Report submitted. Thank you.");
  }

  const whatsappUrl = getWhatsappUrl(listing);
  const mainImageUrl = imageUrls[selectedImageIndex] ?? imageUrls[0];

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Above the fold: gallery + info */}
        <div className="mb-10 grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[var(--surf-border)]">
              {mainImageUrl ? (
                <img
                  src={mainImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--surf-muted-text)]">
                  No image
                </div>
              )}
              {listing.sold_at && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                  <span className="rounded-lg bg-amber-500 px-4 py-2 text-lg font-bold uppercase tracking-wide text-white">
                    Sold
                  </span>
                </div>
              )}
            </div>
            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imageUrls.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      i === selectedImageIndex
                        ? "border-[var(--surf-primary)] ring-2 ring-[var(--surf-primary)]/30"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="h-16 w-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + CTA */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">
                {listing.title}
              </h1>
              {currentUserId && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="shrink-0 rounded-lg p-2 text-[var(--surf-muted-text)] hover:bg-[var(--surf-border)]"
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? "❤️" : "🤍"}
                </button>
              )}
            </div>

            <p className="mt-2 text-[var(--surf-muted-text)]">
              {displayCity(listing)}, {listing.region}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--surf-border)] px-3 py-1 text-sm font-medium text-[var(--foreground)]">
                {listing.board_type}
              </span>
              <span className="rounded-full bg-[var(--surf-border)] px-3 py-1 text-sm font-medium text-[var(--foreground)]">
                {listing.condition}
              </span>
              {(listing.brand_raw ?? listing.brand) && (
                <span className="rounded-full bg-[var(--surf-border)] px-3 py-1 text-sm font-medium text-[var(--foreground)]">
                  {listing.brand_raw ?? listing.brand}
                </span>
              )}
              {listing.fin_setup && (
                <span className="rounded-full bg-[var(--surf-border)] px-3 py-1 text-sm font-medium text-[var(--foreground)]">
                  {listing.fin_setup}
                </span>
              )}
            </div>

            {listing.price_ils !== null && (
              <p className="mt-4 text-3xl font-bold text-[var(--foreground)]">
                {listing.price_ils.toLocaleString()} ILS
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-green-500 px-6 py-3 text-base font-semibold text-white hover:bg-green-600"
                >
                  Contact on WhatsApp
                </a>
              )}
              <ReportButton listingId={listing.id} onReport={reportListing} />
              {currentUserId === listing.user_id && !listing.sold_at && (
                <button
                  type="button"
                  onClick={markSold}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  Mark as sold
                </button>
              )}
            </div>

            <p className="mt-4 text-sm text-[var(--surf-muted-text)]">
              Posted {new Date(listing.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Details grid */}
        <section className="mb-8 rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Details</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {(listing.brand_raw ?? listing.brand) && (
              <>
                <dt className="text-sm text-[var(--surf-muted-text)]">Brand</dt>
                <dd className="text-sm font-medium text-[var(--foreground)]">{listing.brand_raw ?? listing.brand}</dd>
              </>
            )}
            {listing.length_ft != null && (
              <>
                <dt className="text-sm text-[var(--surf-muted-text)]">Length</dt>
                <dd className="text-sm font-medium text-[var(--foreground)]">{listing.length_ft} ft</dd>
              </>
            )}
            {listing.volume_l != null && (
              <>
                <dt className="text-sm text-[var(--surf-muted-text)]">Volume</dt>
                <dd className="text-sm font-medium text-[var(--foreground)]">{listing.volume_l} L</dd>
              </>
            )}
            {listing.fin_setup && (
              <>
                <dt className="text-sm text-[var(--surf-muted-text)]">Fin setup</dt>
                <dd className="text-sm font-medium text-[var(--foreground)]">{listing.fin_setup}</dd>
              </>
            )}
            {listing.construction && (
              <>
                <dt className="text-sm text-[var(--surf-muted-text)]">Construction</dt>
                <dd className="text-sm font-medium text-[var(--foreground)]">{listing.construction}</dd>
              </>
            )}
            <dt className="text-sm text-[var(--surf-muted-text)]">Repairs</dt>
            <dd className="text-sm font-medium text-[var(--foreground)]">{listing.repairs ? "Yes" : "No"}</dd>
            <dt className="text-sm text-[var(--surf-muted-text)]">Fins included</dt>
            <dd className="text-sm font-medium text-[var(--foreground)]">{listing.fins_included ? "Yes" : "No"}</dd>
          </dl>
        </section>

        {/* Description */}
        {listing.description && (
          <section className="rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Description</h2>
            <p className="whitespace-pre-line text-[var(--foreground)] leading-relaxed">
              {listing.description}
            </p>
          </section>
        )}

        {status && <p className="mt-4 text-sm text-[var(--surf-muted-text)]">{status}</p>}
      </div>

      {/* Sticky WhatsApp bar on mobile */}
      {whatsappUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--surf-border)] bg-[var(--surf-card)] p-4 shadow-lg md:hidden">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-xl bg-green-500 py-3.5 text-base font-semibold text-white hover:bg-green-600"
          >
            Contact on WhatsApp
          </a>
        </div>
      )}
    </main>
  );
}

function ReportButton({ listingId, onReport }: { listingId: string; onReport: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-[var(--surf-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
      >
        Report listing
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        placeholder="Reason for report"
        maxLength={500}
        className="rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button
        type="button"
        onClick={() => { onReport(reason.trim() || "Report"); setOpen(false); setReason(""); }}
        className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
      >
        Submit report
      </button>
      <button type="button" onClick={() => { setOpen(false); setReason(""); }} className="text-sm text-[var(--surf-muted-text)] hover:underline">
        Cancel
      </button>
    </div>
  );
}