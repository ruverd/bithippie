import { z } from "zod";

export const researcherSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  globalRole: z.enum([
    "PRINCIPAL_INVESTIGATOR",
    "POSTDOC",
    "GRADUATE_STUDENT",
    "LAB_TECHNICIAN",
  ]),
  projectCount: z.number(),
  measurementCount: z.number(),
});
export const researcherListSchema = z.array(researcherSchema);
