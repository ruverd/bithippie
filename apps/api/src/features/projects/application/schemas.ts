import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  experimentCount: z.number(),
  updatedAt: z.string(),
  team: z.array(z.object({ name: z.string(), projectRole: z.string() })),
});
export const projectListSchema = z.array(projectSchema);

export const projectDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string(),
  leadName: z.string().nullable(),
  experimentCount: z.number(),
  sampleCount: z.number(),
});

const projectStatusEnum = z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]);

export const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullish(),
  status: projectStatusEnum.nullish(),
  leadResearcherId: z.string().nullish(),
  collaboratorIds: z.array(z.string()).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullish(),
  status: projectStatusEnum.nullish(),
  leadResearcherId: z.string().nullish(),
  collaboratorIds: z.array(z.string()).optional(),
});

export const researcherMembershipSchema = z.object({
  researcherId: z.string(),
  name: z.string(),
  email: z.string(),
  globalRole: z.string(),
  projectRole: z.string(),
});
export const researcherMembershipListSchema = z.array(researcherMembershipSchema);

export const projectExperimentSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string().nullable(),
  previousExperimentId: z.string().nullable(),
});
export const projectExperimentListSchema = z.array(projectExperimentSchema);

export const projectSampleSchema = z.object({
  id: z.string(),
  code: z.string(),
  specimenType: z.string(),
  collectedAt: z.string().nullable(),
  storageLocation: z.string().nullable(),
  experimentIds: z.array(z.string()),
});
export const projectSampleListSchema = z.array(projectSampleSchema);

export const projectMeasurementSchema = z.object({
  id: z.string(),
  definitionName: z.string(),
  valueType: z.enum(["NUMERIC", "CATEGORICAL", "TEXT"]),
  numericValue: z.number().nullable(),
  unit: z.string().nullable(),
  categoricalValue: z.string().nullable(),
  textValue: z.string().nullable(),
  experimentId: z.string(),
  experimentName: z.string(),
  recordedAt: z.string(),
  recordedById: z.string().nullable(),
  recordedByName: z.string().nullable(),
});
export const projectMeasurementListSchema = z.array(projectMeasurementSchema);
