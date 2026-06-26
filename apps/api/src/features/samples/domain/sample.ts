export interface Sample {
  id: string;
  code: string;
  specimenType: string;
  collectedAt: string | null;
  storageLocation: string | null;
  experimentCount: number;
}
