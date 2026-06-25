import { z } from "zod";

export type MeasurementValueType = "NUMERIC" | "CATEGORICAL" | "TEXT";

export interface MeasurementDefinitionRule {
  valueType: MeasurementValueType;
  allowedCategories: string[];
}

export interface MeasurementValueInput {
  numericValue?: number | null;
  categoricalValue?: string | null;
  textValue?: string | null;
}

export type ValueValidation = { ok: true } | { ok: false; reason: string };

function nonNullCount(input: MeasurementValueInput): number {
  return [input.numericValue, input.categoricalValue, input.textValue].filter(
    (v) => v !== undefined && v !== null,
  ).length;
}

export function validateMeasurementValue(
  def: MeasurementDefinitionRule,
  input: MeasurementValueInput,
): ValueValidation {
  if (nonNullCount(input) !== 1) {
    return { ok: false, reason: "Exactly one of numericValue, categoricalValue, textValue must be set." };
  }
  switch (def.valueType) {
    case "NUMERIC":
      if (input.numericValue === undefined || input.numericValue === null) {
        return { ok: false, reason: "A NUMERIC measurement requires numericValue." };
      }
      return { ok: true };
    case "CATEGORICAL":
      if (input.categoricalValue === undefined || input.categoricalValue === null) {
        return { ok: false, reason: "A CATEGORICAL measurement requires categoricalValue." };
      }
      if (def.allowedCategories.length > 0 && !def.allowedCategories.includes(input.categoricalValue)) {
        return { ok: false, reason: `categoricalValue must be one of: ${def.allowedCategories.join(", ")}.` };
      }
      return { ok: true };
    case "TEXT":
      if (input.textValue === undefined || input.textValue === null) {
        return { ok: false, reason: "A TEXT measurement requires textValue." };
      }
      return { ok: true };
  }
}

export const measurementValueInputSchema = z.object({
  measurementDefinitionId: z.string().min(1),
  numericValue: z.number().nullish(),
  categoricalValue: z.string().nullish(),
  textValue: z.string().nullish(),
  unit: z.string().nullish(),
  notes: z.string().nullish(),
  recordedAt: z.string().datetime().nullish(),
  recordedById: z.string().nullish(),
  sampleIds: z.array(z.string()).optional(),
});

export type MeasurementValueInputDto = z.infer<typeof measurementValueInputSchema>;
