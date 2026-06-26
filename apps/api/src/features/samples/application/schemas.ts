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
