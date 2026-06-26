export interface MeasurementDefinition {
  id: string;
  name: string;
  valueType: string;
  defaultUnit: string | null;
  allowedCategories: string[];
  description: string | null;
}
