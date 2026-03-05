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
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (loading || !listing) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
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

  return (
    <main className="flex min-h-screen justify-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-6 mt-6 mb-6 rounded-lg shadow">
        <div className="flex items-start justify-between gap-2">
          <h1 className="mb-2 text-2xl font-bold">{listing.title}</h1>
          {currentUserId && (
            <button
              type="button"
              onClick={toggleFavorite}
              className="shrink-0 rounded p-2 text-gray-500 hover:bg-gray-100"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          )}
        </div>

        {listing.sold_at && (
          <p className="mb-2 rounded bg-amber-100 px-2 py-1 text-sm font-medium text-amber-800">Sold</p>
        )}

        <p className="text-gray-600 mb-1">
          {displayCity(listing)}, {listing.region}
        </p>

        <p className="text-gray-600 mb-1">
          {listing.board_type} · {listing.condition}
          {(listing.brand_raw ?? listing.brand) && ` · ${listing.brand_raw ?? listing.brand}`}
        </p>

        {listing.price_ils !== null && (
          <p className="text-xl font-semibold text-gray-900 mb-3">
            {listing.price_ils} ILS
          </p>
        )}

        {imageUrls.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            {imageUrls.map((url) => (
              <div key={url} className="overflow-hidden rounded border">
                <img
                  src={url}
                  alt={listing.title}
                  className="h-40 w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mb-4 text-sm text-gray-700 space-y-1">
          {(listing.brand_raw ?? listing.brand) && <p>Brand: {listing.brand_raw ?? listing.brand}</p>}
          {listing.length_ft !== null && <p>Length: {listing.length_ft} ft</p>}
          {listing.volume_l !== null && <p>Volume: {listing.volume_l} L</p>}
          {listing.fin_setup && <p>Fin setup: {listing.fin_setup}</p>}
          {listing.construction && <p>Construction: {listing.construction}</p>}
          <p>Repairs: {listing.repairs ? "Yes" : "No"}</p>
          <p>Fins included: {listing.fins_included ? "Yes" : "No"}</p>
          {listing.whatsapp_phone && (
            <p>WhatsApp: {listing.whatsapp_phone}</p>
          )}
          <p className="text-xs text-gray-400">
            Posted {new Date(listing.created_at).toLocaleString()}
          </p>
        </div>

        {listing.description && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold mb-1">Description</h2>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
            >
              Contact on WhatsApp
            </a>
          )}
          {currentUserId === listing.user_id && !listing.sold_at && (
            <button
              type="button"
              onClick={markSold}
              className="rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Mark as sold
            </button>
          )}
          <ReportButton listingId={listing.id} onReport={reportListing} />
        </div>
        {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
      </div>
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
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
        className="rounded border px-2 py-1 text-sm"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button
        type="button"
        onClick={() => { onReport(reason.trim() || "Report"); setOpen(false); setReason(""); }}
        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
      >
        Submit report
      </button>
      <button type="button" onClick={() => { setOpen(false); setReason(""); }} className="text-sm text-gray-500 hover:underline">
        Cancel
      </button>
    </div>
  );
}