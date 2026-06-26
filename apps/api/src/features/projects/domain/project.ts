export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
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
