import Link from "next/link";
import { Box, Waves, MapPin, Heart, MoreHorizontal } from "lucide-react";

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

          {/* Corner badges on image: board type, condition (grey) or SOLD (red) */}
          <div className="absolute left-0 top-0 flex flex-wrap gap-1 p-2">
            {sold_at ? (
              <span className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-semibold uppercase text-white">
                Sold
              </span>
            ) : (
              <>
                <span className="rounded-md bg-gray-500/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  {board_type}
                </span>
                <span className="rounded-md bg-gray-500/70 px-2 py-0.5 text-xs text-white/95 backdrop-blur-sm">
                  {condition}
                </span>
              </>
            )}
          </div>

          {/* Heart icon top-right */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm hover:bg-white"
            aria-label="Add to favorites"
          >
            <Heart className="h-4 w-4 text-[var(--foreground)]" strokeWidth={2} />
          </button>

          {/* Price pill bottom-left - dark blue rounded background */}
          {price_ils !== null && (
            <div className="absolute bottom-2 left-2">
              <span className="rounded-lg bg-[var(--surf-price-pill)] px-2.5 py-1.5 text-base font-bold text-white shadow">
                ₪{price_ils.toLocaleString()}
              </span>
            </div>
          )}

          {/* SOLD overlay - full card dimmed, badge already in corner */}
          {sold_at && (
            <div className="absolute inset-0 bg-black/30" aria-hidden />
          )}
        </div>

        <div className="p-3 md:p-4">
          <h2 className="mb-1 line-clamp-2 font-bold text-[var(--foreground)] group-hover:text-[var(--surf-primary)]">
            {title}
          </h2>
          <p className="mb-1.5 flex items-center gap-1 text-sm text-[var(--surf-muted-text)]">
            <MapPin className="h-3.5 w-5 shrink-0" />
            {displayCity}, {region}
          </p>
          {/* Icon row: length ft, volume L + fin setup */}
          {(length_ft != null || volume_l != null || fin_setup) && (
            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[var(--surf-muted-text)]">
              {length_ft != null && (
                <span className="flex items-center gap-1">
                  <Waves className="h-3.5 w-3.5" />
                  {length_ft} ft
                </span>
              )}
              {(volume_l != null || fin_setup) && (
                <span className="flex items-center gap-1">
                  <Box className="h-3.5 w-3.5" />
                  {[volume_l != null ? `${volume_l} L` : "", fin_setup].filter(Boolean).join(" ")}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              {price_ils !== null && (
                <p className="text-base font-bold text-[var(--foreground)]">
                  ₪{price_ils.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-[var(--surf-muted-text)]">
                Posted {daysAgo(created_at)}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="rounded p-1 text-[var(--surf-muted-text)] hover:bg-[var(--surf-border)]"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
