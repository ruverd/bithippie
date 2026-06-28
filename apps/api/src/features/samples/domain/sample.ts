export interface Sample {
  id: string;
  code: string;
  specimenType: string;
  collectedAt: string | null;
  storageLocation: string | null;
  experimentCount: number;
}

export interface CreateSampleInput {
  code: string;
  specimenType: string;
  collectedAt?: string | null;
  storageLocation?: string | null;
}

export interface UpdateSampleInput {
  code?: string;
  specimenType?: string;
  collectedAt?: string | null;
  storageLocation?: string | null;
}
