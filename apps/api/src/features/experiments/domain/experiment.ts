export interface Experiment {
  id: string;
  title: string;
  hypothesis: string | null;
  status: string | null;
  projectId: string;
  previousExperimentId: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface ExperimentListItem {
  id: string;
  title: string;
  hypothesis: string | null;
  status: string | null;
  projectId: string;
  projectName: string;
  leadName: string | null;
  measurementCount: number;
  startDate: string | null;
}

export interface ExperimentMeasurement {
  id: string;
  measurementDefinitionId: string;
  definitionName: string;
  valueType: string;
  numericValue: number | null;
  unit: string | null;
  categoricalValue: string | null;
  textValue: string | null;
  notes: string | null;
  recordedAt: string;
  recordedById: string | null;
}

export interface ExperimentSample {
  id: string;
  code: string;
  specimenType: string;
  storageLocation: string | null;
}
