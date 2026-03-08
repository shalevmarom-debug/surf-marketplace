"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type ListingFilterParams = {
  region: string;
  city: string;
  boardType: string;
  condition: string;
  finSetup: string;
  construction: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  q: string;
  includeSold: boolean;
  sort: string;
};

function getParamsFromSearchParams(searchParams: ReturnType<typeof useSearchParams>): ListingFilterParams {
  return {
    region: searchParams.get("region") ?? "",
    city: searchParams.get("city") ?? "",
    boardType: searchParams.get("boardType") ?? "",
    condition: searchParams.get("condition") ?? "",
    finSetup: searchParams.get("finSetup") ?? "",
    construction: searchParams.get("construction") ?? "",
    brand: searchParams.get("brand") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    q: searchParams.get("q") ?? "",
    includeSold: searchParams.get("includeSold") === "1" || searchParams.get("includeSold") === "true",
    sort: searchParams.get("sort") ?? "newest",
  };
}

function buildQueryString(params: ListingFilterParams): string {
  const search = new URLSearchParams();
  if (params.region) search.set("region", params.region);
  if (params.city) search.set("city", params.city);
  if (params.boardType) search.set("boardType", params.boardType);
  if (params.condition) search.set("condition", params.condition);
  if (params.finSetup) search.set("finSetup", params.finSetup);
  if (params.construction) search.set("construction", params.construction);
  if (params.brand) search.set("brand", params.brand);
  if (params.minPrice) search.set("minPrice", params.minPrice);
  if (params.maxPrice) search.set("maxPrice", params.maxPrice);
  if (params.q) search.set("q", params.q);
  if (params.includeSold) search.set("includeSold", "1");
  if (params.sort && params.sort !== "newest") search.set("sort", params.sort);
  const s = search.toString();
  return s ? `?${s}` : "";
}

/**
 * Shared filter state driven by URL. Same params on desktop and mobile; applyFilters navigates so state stays in sync.
 */
export function useListingFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useMemo(() => getParamsFromSearchParams(searchParams), [searchParams]);

  const applyFilters = useCallback(
    (updates: Partial<ListingFilterParams>) => {
      const next: ListingFilterParams = { ...params, ...updates };
      const qs = buildQueryString(next);
      router.push(pathname + qs);
    },
    [pathname, params, router]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return { params, applyFilters, clearFilters };
}
