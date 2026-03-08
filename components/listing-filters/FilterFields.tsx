"use client";

import { CitySelectHe } from "@/components/CitySelectHe";
import {
  BOARD_TYPES,
  REGIONS,
  CONDITIONS,
  FIN_SETUPS,
  CONSTRUCTIONS,
} from "@/lib/validations/listing";

export const filterInputClass =
  "w-full rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--surf-primary)]/20";

const labelClass = "mb-1 block text-xs font-medium text-[var(--surf-muted-text)]";

type FieldWrapperProps = {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
};

function FieldWrapper({ id, label, children, className = "" }: FieldWrapperProps) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

type CityFieldProps = {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  citiesWithCount: { city: string; count: number }[];
};

export function CityField({ value, onChange, idPrefix = "", citiesWithCount }: CityFieldProps) {
  const id = idPrefix ? `${idPrefix}-city` : "city";
  return (
    <FieldWrapper id={id} label="City">
      <CitySelectHe
        value={value}
        onChange={onChange}
        placeholder="Search city..."
        optionsWithCount={citiesWithCount}
        id={id}
        className="rounded-xl border border-[var(--surf-border)] bg-[var(--surf-card)] px-3 py-2 text-sm focus:border-[var(--surf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--surf-primary)]/20 w-full"
      />
    </FieldWrapper>
  );
}

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  id: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
  className?: string;
};

export function SelectField({
  value,
  onChange,
  id,
  label,
  options,
  placeholder = "All",
  className = "",
}: SelectFieldProps) {
  return (
    <FieldWrapper id={id} label={label} className={className}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={filterInputClass}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export function BoardTypeField({
  value,
  onChange,
  idPrefix = "",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-boardType` : "boardType";
  return (
    <SelectField
      id={id}
      label="Board type"
      value={value}
      onChange={onChange}
      options={BOARD_TYPES}
      className={className}
    />
  );
}

export function MinPriceField({
  value,
  onChange,
  idPrefix = "",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-minPrice` : "minPrice";
  return (
    <FieldWrapper id={id} label="Min price (ILS)" className={className}>
      <input
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={filterInputClass}
      />
    </FieldWrapper>
  );
}

export function MaxPriceField({
  value,
  onChange,
  idPrefix = "",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-maxPrice` : "maxPrice";
  return (
    <FieldWrapper id={id} label="Max price (ILS)" className={className}>
      <input
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any"
        className={filterInputClass}
      />
    </FieldWrapper>
  );
}

export function RegionField({
  value,
  onChange,
  idPrefix = "",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-region` : "region";
  return (
    <SelectField
      id={id}
      label="Region"
      value={value}
      onChange={onChange}
      options={[...REGIONS]}
      className={className}
    />
  );
}

export function ConditionField({
  value,
  onChange,
  idPrefix = "",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-condition` : "condition";
  return (
    <SelectField
      id={id}
      label="Condition"
      value={value}
      onChange={onChange}
      options={[...CONDITIONS]}
      className={className}
    />
  );
}

export function FinSetupField({
  value,
  onChange,
  idPrefix = "",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-finSetup` : "finSetup";
  return (
    <SelectField
      id={id}
      label="Fin setup"
      value={value}
      onChange={onChange}
      options={[...FIN_SETUPS]}
      className={className}
    />
  );
}

export function ConstructionField({
  value,
  onChange,
  idPrefix = "",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-construction` : "construction";
  return (
    <SelectField
      id={id}
      label="Construction"
      value={value}
      onChange={onChange}
      options={[...CONSTRUCTIONS]}
      className={className}
    />
  );
}

export function BrandField({
  value,
  onChange,
  idPrefix = "",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-brand` : "brand";
  return (
    <FieldWrapper id={id} label="Brand" className={className}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search brand..."
        className={filterInputClass}
      />
    </FieldWrapper>
  );
}

export function IncludeSoldField({
  checked,
  onChange,
  idPrefix = "",
  className = "",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  idPrefix?: string;
  className?: string;
}) {
  const id = idPrefix ? `${idPrefix}-includeSold` : "includeSold";
  return (
    <div className={`flex items-center ${className}`}>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-[var(--surf-border)]"
        />
        Include sold
      </label>
    </div>
  );
}
