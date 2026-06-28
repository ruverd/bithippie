import type {
  CreateMeasurementInput,
  CreatedMeasurement,
  DefinitionRuleRow,
  MeasurementListItem,
  UpdateMeasurementInput,
} from "./measurement";

export interface MeasurementsRepository {
  experimentExists(id: string): Promise<boolean>;
  findDefinition(id: string): Promise<DefinitionRuleRow | null>;
  experimentSampleIds(experimentId: string): Promise<string[]>;
  researcherExists(id: string): Promise<boolean>;
  create(input: CreateMeasurementInput): Promise<CreatedMeasurement>;
  findById(id: string): Promise<CreatedMeasurement | null>;
  update(id: string, input: UpdateMeasurementInput): Promise<CreatedMeasurement>;
  list(): Promise<MeasurementListItem[]>;
}
