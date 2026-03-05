"use client";

import { useRef, useState, useMemo } from "react";
import { CITY_OPTIONS_FOR_FORM } from "@/lib/data/citiesHe";

type CitySelectHeProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  /** Use 56 + "אחר" for forms; omit for filter (uses static list) */
  options?: string[];
  /** For home filter: show "city (count)", value is city */
  optionsWithCount?: { city: string; count: number }[];
  /** When value is this (e.g. "אחר"), show extra text input */
  otherValue?: string;
  otherText?: string;
  onOtherTextChange?: (v: string) => void;
  otherPlaceholder?: string;
};

/** Searchable city combobox – Hebrew cities. Type to filter by prefix; on focus show all. Optional "Other" + free text. */
export function CitySelectHe({
  value,
  onChange,
  id,
  className = "",
  placeholder = "Search city...",
  options: optionsProp,
  optionsWithCount,
  otherValue = "אחר",
  otherText = "",
  onOtherTextChange,
  otherPlaceholder = "Specify city / יישוב",
}: CitySelectHeProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const options = optionsWithCount ? optionsWithCount.map((c) => c.city) : (optionsProp ?? CITY_OPTIONS_FOR_FORM);

  const filtered = useMemo(() => {
    const q = query.trim().replace(/\s+/g, " ");
    if (!q) return options;
    return options.filter((c) => c.startsWith(q));
  }, [query, options]);

  const filteredWithCount = optionsWithCount
    ? optionsWithCount.filter((c) => filtered.includes(c.city))
    : null;

  const selectedWithCount = optionsWithCount?.find((c) => c.city === value);
  const displayValue =
    open && query !== ""
      ? query
      : optionsWithCount && selectedWithCount
        ? `${value} (${selectedWithCount.count})`
        : value;

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      setQuery("");
    }, 200);
  };

  return (
    <div className="relative" dir="rtl">
      <input
        ref={inputRef}
        type="text"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        className={`w-full rounded border border-gray-300 px-3 py-2 text-sm ${className}`}
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={handleBlur}
      />
      {open && (
        <ul
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border border-gray-200 bg-white py-1 shadow"
          role="listbox"
          dir="rtl"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
          ) : filteredWithCount ? (
            filteredWithCount.map((item) => (
              <li
                key={item.city}
                role="option"
                aria-selected={value === item.city}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${value === item.city ? "bg-gray-50" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(item.city);
                  setQuery("");
                  setOpen(false);
                  inputRef.current?.blur();
                }}
              >
                {item.city} ({item.count})
              </li>
            ))
          ) : (
            filtered.map((city) => (
              <li
                key={city}
                role="option"
                aria-selected={value === city}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${value === city ? "bg-gray-50" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(city);
                  setQuery("");
                  setOpen(false);
                  inputRef.current?.blur();
                }}
              >
                {city}
              </li>
            ))
          )}
        </ul>
      )}
      {value === otherValue && onOtherTextChange && (
        <input
          type="text"
          placeholder={otherPlaceholder}
          maxLength={100}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={otherText}
          onChange={(e) => onOtherTextChange(e.target.value)}
          dir="rtl"
        />
      )}
    </div>
  );
}
