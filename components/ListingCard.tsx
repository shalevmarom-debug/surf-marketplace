import Link from "next/link";
import { Box, Waves, MapPin, MoreHorizontal } from "lucide-react";

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
        className={`overflow-hidden rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 md:rounded-2xl ${sold_at ? "opacity-90" : ""}`}
      >
        {/* Image: 1:1 mobile (compact), 16:9 desktop */}
        <div className="relative aspect-square w-full overflow-hidden bg-[var(--surf-border)] md:aspect-video">
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

          {/* Corner badges on image - smaller on mobile */}
          <div className="absolute left-0 top-0 flex flex-wrap gap-0.5 p-1.5 md:gap-1 md:p-2">
            {sold_at ? (
              <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white md:rounded-md md:px-2.5 md:py-1 md:text-xs">
                Sold
              </span>
            ) : (
              <>
                <span className="rounded bg-gray-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm md:rounded-md md:px-2 md:text-xs">
                  {board_type}
                </span>
                <span className="rounded bg-gray-500/70 px-1.5 py-0.5 text-[10px] text-white/95 backdrop-blur-sm md:rounded-md md:px-2 md:text-xs">
                  {condition}
                </span>
              </>
            )}
          </div>

          {/* Price pill - smaller on mobile */}
          {price_ils !== null && (
            <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2">
              <span className="rounded-md bg-[var(--surf-price-pill)] px-2 py-1 text-sm font-bold text-white shadow md:rounded-lg md:px-2.5 md:py-1.5 md:text-base">
                ₪{price_ils.toLocaleString()}
              </span>
            </div>
          )}

          {/* SOLD overlay - full card dimmed, badge already in corner */}
          {sold_at && (
            <div className="absolute inset-0 bg-black/30" aria-hidden />
          )}
        </div>

        <div className="p-1.5 md:p-4">
          <h2 className="mb-0.5 line-clamp-1 text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--surf-primary)] md:mb-1 md:line-clamp-2 md:text-base">
            {title}
          </h2>
          <p className="mb-0.5 flex items-center gap-0.5 text-[10px] text-[var(--surf-muted-text)] md:mb-1.5 md:text-sm">
            <MapPin className="h-3 w-4 shrink-0 md:h-3.5 md:w-5" />
            <span className="truncate">{displayCity}, {region}</span>
          </p>
          {/* Icon row - hidden on mobile to keep card compact; show on md+ */}
          {(length_ft != null || volume_l != null || fin_setup) && (
            <div className="mb-1 hidden flex-wrap items-center gap-2 text-[10px] text-[var(--surf-muted-text)] md:mb-2 md:flex md:gap-3 md:text-xs">
              {length_ft != null && (
                <span className="flex items-center gap-0.5 md:gap-1">
                  <Waves className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  {length_ft} ft
                </span>
              )}
              {(volume_l != null || fin_setup) && (
                <span className="flex items-center gap-0.5 md:gap-1">
                  <Box className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  {[volume_l != null ? `${volume_l} L` : "", fin_setup].filter(Boolean).join(" ")}
                </span>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
            <div className="flex min-w-0 flex-1 items-baseline gap-1 overflow-hidden">
              {price_ils !== null && (
                <p className="shrink-0 text-xs font-bold text-[var(--foreground)] md:text-base">
                  ₪{price_ils.toLocaleString()}
                </p>
              )}
              <p className="min-w-0 truncate text-[10px] text-[var(--surf-muted-text)] md:text-xs">
                Posted {daysAgo(created_at)}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded text-[var(--surf-muted-text)] hover:bg-[var(--surf-border)] md:min-h-[44px] md:min-w-[44px] md:p-1"
              aria-label="More options"
            >
              <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
