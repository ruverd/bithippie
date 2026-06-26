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

export const experimentMeasurementSchema = z.object({
  id: z.string(),
  measurementDefinitionId: z.string(),
  definitionName: z.string(),
  valueType: z.string(),
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
