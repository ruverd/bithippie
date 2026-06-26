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
