import { z } from "zod";

export const experimentSchema = z.object({
  id: z.string(),
  title: z.string(),
  hypothesis: z.string().nullable(),
  status: z.string().nullable(),
  projectId: z.string(),
  previousExperimentId: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const createExperimentSchema = z.object({
  title: z.string().min(1),
  hypothesis: z.string().nullish(),
  projectId: z.string().min(1),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).nullish(),
  previousExperimentId: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
});

export const updateExperimentSchema = z.object({
  title: z.string().min(1).optional(),
  hypothesis: z.string().nullish(),
  projectId: z.string().min(1).optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).nullish(),
  previousExperimentId: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
});

export const experimentListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  hypothesis: z.string().nullable(),
  status: z.string().nullable(),
  projectId: z.string(),
  projectName: z.string(),
  leadName: z.string().nullable(),
  measurementCount: z.number(),
  startDate: z.string().nullable(),
});
export const experimentListSchema = z.array(experimentListItemSchema);

export const experimentMeasurementSchema = z.object({
  id: z.string(),
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
});
export const experimentMeasurementListSchema = z.array(experimentMeasurementSchema);

export const experimentSampleSchema = z.object({
  id: z.string(),
  code: z.string(),
  specimenType: z.string(),
  storageLocation: z.string().nullable(),
});
export const experimentSampleListSchema = z.array(experimentSampleSchema);
