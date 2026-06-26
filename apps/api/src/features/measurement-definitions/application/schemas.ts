import { z } from "zod";

export const measurementDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  valueType: z.string(),
  defaultUnit: z.string().nullable(),
  allowedCategories: z.array(z.string()),
  description: z.string().nullable(),
});
export const measurementDefinitionListSchema = z.array(measurementDefinitionSchema);
