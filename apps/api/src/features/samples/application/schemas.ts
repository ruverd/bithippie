import { z } from "zod";

export const sampleSchema = z.object({
  id: z.string(),
  code: z.string(),
  specimenType: z.string(),
  collectedAt: z.string().nullable(),
  storageLocation: z.string().nullable(),
  experimentCount: z.number(),
});
export const sampleListSchema = z.array(sampleSchema);

export const createSampleSchema = z.object({
  code: z.string().min(1),
  specimenType: z.string().min(1),
  collectedAt: z.string().nullish(),
  storageLocation: z.string().nullish(),
});

export const updateSampleSchema = z.object({
  code: z.string().min(1).optional(),
  specimenType: z.string().min(1).optional(),
  collectedAt: z.string().nullish(),
  storageLocation: z.string().nullish(),
});
