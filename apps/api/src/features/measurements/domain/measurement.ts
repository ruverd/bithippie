import type { MeasurementValueType } from "@lab/shared";

export interface CreateMeasurementInput {
  experimentId: string;
  measurementDefinitionId: string;
  numericValue?: number | null;
  unit?: string | null;
  categoricalValue?: string | null;
  textValue?: string | null;
  notes?: string | null;
  recordedAt?: string | null;
  recordedById?: string | null;
  sampleIds?: string[];
}

export interface UpdateMeasurementInput {
  numericValue?: number | null;
  unit?: string | null;
  categoricalValue?: string | null;
  textValue?: string | null;
  notes?: string | null;
  recordedAt?: string | null;
  recordedById?: string | null;
  sampleIds?: string[];
}

export interface CreatedMeasurement {
  id: string;
  experimentId: string;
  measurementDefinitionId: string;
  numericValue: number | null;
  unit: string | null;
  categoricalValue: string | null;
  textValue: string | null;
  notes: string | null;
  recordedAt: string;
  recordedById: string | null;
  sampleIds: string[];
}

export interface DefinitionRuleRow {
  id: string;
  valueType: MeasurementValueType;
  allowedCategories: string[];
}

export interface MeasurementListItem {
  id: string;
  experimentId: string;
  experimentName: string;
  measurementDefinitionId: string;
  definitionName: string;
  valueType: MeasurementValueType;
  numericValue: number | null;
  unit: string | null;
  categoricalValue: string | null;
  textValue: string | null;
  notes: string | null;
  recordedAt: string;
  recordedById: string | null;
  recordedByName: string | null;
}
