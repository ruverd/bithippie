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

export const createResearcherSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  globalRole: z.enum([
    "PRINCIPAL_INVESTIGATOR",
    "POSTDOC",
    "GRADUATE_STUDENT",
    "LAB_TECHNICIAN",
  ]),
  projectId: z.string().nullish(),
  projectRole: z.enum(["LEAD", "COLLABORATOR", "CONTRIBUTOR"]).nullish(),
});

export const updateResearcherSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  globalRole: z
    .enum(["PRINCIPAL_INVESTIGATOR", "POSTDOC", "GRADUATE_STUDENT", "LAB_TECHNICIAN"])
    .optional(),
});
