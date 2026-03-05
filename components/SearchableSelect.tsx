"use client";

import { useRef, useState, useMemo } from "react";

type SearchableSelectProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  /** When value is this (e.g. "Other"), show extra text input */
  otherValue?: string;
  otherText?: string;
  onOtherTextChange?: (v: string) => void;
  otherPlaceholder?: string;
  otherMaxLength?: number;
};

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search or select...",
  id,
  className = "",
  otherValue = "Other",
  otherText = "",
  onOtherTextChange,
  otherPlaceholder = "Please specify",
  otherMaxLength = 100,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="relative">
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
        value={open ? query : value}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && (
        <ul
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border border-gray-200 bg-white py-1 shadow"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">No match</li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt}
                role="option"
                aria-selected={value === opt}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${value === opt ? "bg-gray-50" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  setQuery("");
                  setOpen(false);
                  inputRef.current?.blur();
                }}
              >
                {opt}
              </li>
            ))
          )}
        </ul>
      )}
      {value === otherValue && onOtherTextChange && (
        <input
          type="text"
          placeholder={otherPlaceholder}
          maxLength={otherMaxLength}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={otherText}
          onChange={(e) => onOtherTextChange(e.target.value)}
        />
      )}
    </div>
  );
}
