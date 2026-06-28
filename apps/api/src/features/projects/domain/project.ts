import type { MeasurementValueType } from "@lab/shared";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
}

export interface ProjectListItem extends Project {
  experimentCount: number;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  createdAt: string;
  leadName: string | null;
  experimentCount: number;
  sampleCount: number;
}

export interface CreateProjectInput {
  title: string;
  description?: string | null;
  status?: string | null;
  leadResearcherId?: string | null;
  collaboratorIds?: string[];
}

export interface UpdateProjectInput {
  title?: string;
  description?: string | null;
  status?: string | null;
  leadResearcherId?: string | null;
  collaboratorIds?: string[];
}

export interface ResearcherMembership {
  researcherId: string;
  name: string;
  email: string;
  globalRole: string;
  projectRole: string;
}

export interface ProjectExperiment {
  id: string;
  title: string;
  status: string | null;
  previousExperimentId: string | null;
}

export interface ProjectSample {
  id: string;
  code: string;
  specimenType: string;
  collectedAt: string | null;
  storageLocation: string | null;
  experimentIds: string[];
}

export interface ProjectMeasurement {
  id: string;
  definitionName: string;
  valueType: MeasurementValueType;
  numericValue: number | null;
  unit: string | null;
  categoricalValue: string | null;
  textValue: string | null;
  experimentId: string;
  experimentName: string;
  recordedAt: string;
  recordedById: string | null;
  recordedByName: string | null;
}
