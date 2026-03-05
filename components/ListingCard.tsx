import Link from "next/link";
import { Ruler, Box, Waves, MapPin } from "lucide-react";

type ListingCardProps = {
  id: string;
  title: string;
  price_ils: number | null;
  region: string;
  board_type: string;
  condition: string;
  fin_setup?: string | null;
  brand_raw?: string | null;
  brand?: string | null;
  sold_at?: string | null;
  created_at: string;
  primaryImageUrl: string | null;
  displayCity: string;
  length_ft?: number | null;
  volume_l?: number | null;
};

function daysAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
}

export function ListingCard({
  id,
  title,
  price_ils,
  region,
  board_type,
  condition,
  fin_setup,
  brand_raw,
  brand,
  sold_at,
  created_at,
  primaryImageUrl,
  displayCity,
  length_ft,
  volume_l,
}: ListingCardProps) {
  const brandLabel = brand_raw ?? brand;

  return (
    <Link
      href={`/listing/${id}`}
      className="group block transition-transform active:scale-[0.98] md:active:scale-100"
    >
      <article
        className={`overflow-hidden rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 ${sold_at ? "opacity-90" : ""}`}
      >
        {/* Image: 4:3 on mobile, 16:9 on desktop; edge-to-edge */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surf-border)] md:aspect-video">
          {primaryImageUrl ? (
            <img
              src={primaryImageUrl}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--surf-muted)]/50 to-[var(--surf-primary)]/20 p-4">
              <Waves className="h-12 w-12 text-[var(--surf-primary)]/60" strokeWidth={1.5} />
              <span className="mt-2 text-xs font-medium text-[var(--surf-muted-text)]">No image</span>
            </div>
          )}

          {/* Corner badges on image: board type, condition */}
          <div className="absolute left-0 top-0 flex flex-wrap gap-1 p-2">
            <span className="rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {board_type}
            </span>
            <span className="rounded-md bg-black/50 px-2 py-0.5 text-xs text-white/95 backdrop-blur-sm">
              {condition}
            </span>
          </div>

          {/* Price overlay bottom-left */}
          {price_ils !== null && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
              <p className="text-lg font-bold text-white drop-shadow-md">
                ₪{price_ils.toLocaleString()}
              </p>
            </div>
          )}

          {/* SOLD overlay */}
          {sold_at && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-lg bg-amber-500 px-4 py-2 text-lg font-bold uppercase tracking-wide text-white shadow">
                Sold
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h2 className="mb-1 line-clamp-2 font-semibold text-[var(--foreground)] group-hover:text-[var(--surf-primary)]">
            {title}
          </h2>
          <p className="mb-2 flex items-center gap-1 text-sm text-[var(--surf-muted-text)]">
            <MapPin className="h-3.5 w-5 shrink-0" />
            {displayCity}, {region}
          </p>
          {/* Optional icon row: length, volume, fin setup */}
          {(length_ft != null || volume_l != null || fin_setup) && (
            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[var(--surf-muted-text)]">
              {length_ft != null && (
                <span className="flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5" />
                  {length_ft} ft
                </span>
              )}
              {volume_l != null && (
                <span className="flex items-center gap-1">
                  <Box className="h-3.5 w-3.5" />
                  {volume_l} L
                </span>
              )}
              {fin_setup && (
                <span className="flex items-center gap-1">
                  <Waves className="h-3.5 w-3.5" />
                  {fin_setup}
                </span>
              )}
            </div>
          )}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {brandLabel && (
              <span className="rounded-full bg-[var(--surf-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                {brandLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--surf-muted-text)]">
            Posted {daysAgo(created_at)}
          </p>
        </div>
      </article>
    </Link>
  );
}
