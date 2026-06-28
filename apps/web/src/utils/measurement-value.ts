export interface MeasurementValueParts {
  valueType: "NUMERIC" | "CATEGORICAL" | "TEXT";
  numericValue: number | null;
  unit: string | null;
  categoricalValue: string | null;
  textValue: string | null;
}

export function measurementValue(m: MeasurementValueParts): string {
  switch (m.valueType) {
    case "NUMERIC":
      return m.numericValue == null ? "—" : `${m.numericValue}${m.unit ? ` ${m.unit}` : ""}`;
    case "CATEGORICAL":
      return m.categoricalValue ?? "—";
    case "TEXT":
      return m.textValue ? `“${m.textValue}”` : "—";
    default: {
      const _exhaustive: never = m.valueType;
      return _exhaustive;
    }
  }
}
