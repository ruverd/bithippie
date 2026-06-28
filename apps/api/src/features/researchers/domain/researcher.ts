export interface Researcher {
  id: string;
  name: string;
  email: string;
  globalRole: string;
  projectCount: number;
  measurementCount: number;
}

export interface CreateResearcherInput {
  name: string;
  email: string;
  globalRole: string;
  projectId?: string | null;
  projectRole?: string | null;
}

export interface UpdateResearcherInput {
  name?: string;
  email?: string;
  globalRole?: string;
}
