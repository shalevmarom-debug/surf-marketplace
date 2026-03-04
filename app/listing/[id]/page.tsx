"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price_ils: number | null;
  city: string;
  region: string;
  board_type: string;
  length_ft: number | null;
  volume_l: number | null;
  brand: string | null;
  condition: string;
  repairs: boolean;
  fins_included: boolean;
  fin_setup: string | null;
  construction: string | null;
  whatsapp_phone: string | null;
  created_at: string;
};

export default function ListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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
          `id, title, description, price_ils, city, region, board_type,
           length_ft, volume_l, brand, condition, repairs, fins_included,
           fin_setup, construction, whatsapp_phone, created_at`
        )
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setStatus(`Error loading listing: ${error ? error.message : "Not found"}`);
        setLoading(false);
        return;
      }

      const listingData = data as Listing;
      setListing(listingData);

      // Load images: primary first, then by sort_order
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
        <p className="text-gray-500">Checking permissions...</p>
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

  const whatsappUrl = getWhatsappUrl(listing);

  return (
    <main className="flex min-h-screen justify-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-6 mt-6 mb-6 rounded-lg shadow">
        <h1 className="mb-2 text-2xl font-bold">{listing.title}</h1>

        <p className="text-gray-600 mb-1">
          {listing.city}, {listing.region}
        </p>

        <p className="text-gray-600 mb-1">
          {listing.board_type} · {listing.condition}
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
          {listing.brand && <p>Brand: {listing.brand}</p>}
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
            Posted at {new Date(listing.created_at).toLocaleString()}
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
      </div>
    </main>
  );
}