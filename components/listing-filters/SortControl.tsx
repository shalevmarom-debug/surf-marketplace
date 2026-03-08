"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { filterInputClass } from "./FilterFields";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price low–high" },
  { value: "price_desc", label: "Price high–low" },
] as const;

type SortControlProps = {
  value: string;
  onSelect: (sort: string) => void;
  variant: "inline" | "dropdown";
  id?: string;
};

/** Inline: select in bar. Dropdown: button that opens a small dropdown (for mobile). */
export function SortControl({ value, onSelect, variant, id = "sort" }: SortControlProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (variant === "inline") {
    return (
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--surf-muted-text)]" htmlFor={id}>
          Sort
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onSelect(e.target.value)}
          className={filterInputClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surf-border)]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] py-1 shadow-lg"
        >
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value} role="option" aria-selected={value === opt.value}>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--surf-border)]"
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
