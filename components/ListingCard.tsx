import Link from "next/link";

type ListingCardProps = {
  id: string;
  title: string;
  price_ils: number | null;
  region: string;
  board_type: string;
  condition: string;
  brand_raw?: string | null;
  brand?: string | null;
  sold_at?: string | null;
  created_at: string;
  primaryImageUrl: string | null;
  displayCity: string;
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
  brand_raw,
  brand,
  sold_at,
  created_at,
  primaryImageUrl,
  displayCity,
}: ListingCardProps) {
  const brandLabel = brand_raw ?? brand;

  return (
    <Link href={`/listing/${id}`} className="group block">
      <article
        className={`overflow-hidden rounded-2xl border border-[var(--surf-border)] bg-[var(--surf-card)] shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 ${sold_at ? "opacity-85" : ""}`}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--surf-border)]">
          {primaryImageUrl ? (
            <img
              src={primaryImageUrl}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--surf-muted-text)] text-sm">
              No image
            </div>
          )}
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
          <p className="mb-2 text-sm text-[var(--surf-muted-text)]">
            {displayCity}, {region}
          </p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--surf-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
              {board_type}
            </span>
            <span className="rounded-full bg-[var(--surf-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
              {condition}
            </span>
            {brandLabel && (
              <span className="rounded-full bg-[var(--surf-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                {brandLabel}
              </span>
            )}
          </div>
          {price_ils !== null && (
            <p className="text-lg font-bold text-[var(--foreground)]">
              {price_ils.toLocaleString()} ILS
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--surf-muted-text)]">
            Posted {daysAgo(created_at)}
          </p>
        </div>
      </article>
    </Link>
  );
}
