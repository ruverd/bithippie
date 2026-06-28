import { z } from "zod";

export const createdMeasurementSchema = z.object({
  id: z.string(),
  experimentId: z.string(),
  measurementDefinitionId: z.string(),
  numericValue: z.number().nullable(),
  unit: z.string().nullable(),
  categoricalValue: z.string().nullable(),
  textValue: z.string().nullable(),
  notes: z.string().nullable(),
  recordedAt: z.string(),
  recordedById: z.string().nullable(),
  sampleIds: z.array(z.string()),
});

export const updateMeasurementSchema = z.object({
  numericValue: z.number().nullish(),
  categoricalValue: z.string().nullish(),
  textValue: z.string().nullish(),
  unit: z.string().nullish(),
  notes: z.string().nullish(),
  recordedAt: z.string().datetime().nullish(),
  recordedById: z.string().nullish(),
  sampleIds: z.array(z.string()).optional(),
});

export const measurementListItemSchema = z.object({
  id: z.string(),
  experimentId: z.string(),
  experimentName: z.string(),
  measurementDefinitionId: z.string(),
  definitionName: z.string(),
  valueType: z.enum(["NUMERIC", "CATEGORICAL", "TEXT"]),
  numericValue: z.number().nullable(),
  unit: z.string().nullable(),
  categoricalValue: z.string().nullable(),
  textValue: z.string().nullable(),
  notes: z.string().nullable(),
  recordedAt: z.string(),
  recordedById: z.string().nullable(),
  recordedByName: z.string().nullable(),
});
export const measurementListSchema = z.array(measurementListItemSchema);
