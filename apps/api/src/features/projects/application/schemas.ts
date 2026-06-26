import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string().nullable(),
});
export const projectListSchema = z.array(projectSchema);

export const researcherMembershipSchema = z.object({
  researcherId: z.string(),
  name: z.string(),
  email: z.string(),
  globalRole: z.string(),
  projectRole: z.string(),
});
export const projectExperimentSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string().nullable(),
  previousExperimentId: z.string().nullable(),
});
