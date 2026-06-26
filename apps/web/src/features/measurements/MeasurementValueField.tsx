import type { MeasurementValueType } from "@lab/shared";

interface Props {
  valueType: MeasurementValueType;
  value: string;
  onChange: (value: string) => void;
  allowedCategories?: string[];
  unit?: string;
  onUnitChange?: (unit: string) => void;
}

export function MeasurementValueField({
  valueType,
  value,
  onChange,
  allowedCategories = [],
  unit,
  onUnitChange,
}: Props) {
  if (valueType === "NUMERIC") {
    return (
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded border px-2 py-1"
        />
        <input
          type="text"
          aria-label="unit"
          placeholder="unit"
          value={unit ?? ""}
          onChange={(e) => onUnitChange?.(e.target.value)}
          className="w-24 rounded border px-2 py-1"
        />
      </div>
    );
  }
  if (valueType === "CATEGORICAL") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border px-2 py-1"
      >
        <option value="" disabled>
          Select…
        </option>
        {allowedCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    );
  }
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border px-2 py-1"
    />
  );
}
