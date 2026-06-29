export const RESEARCHER_ROLES = [
  "PRINCIPAL_INVESTIGATOR",
  "POSTDOC",
  "GRADUATE_STUDENT",
  "LAB_TECHNICIAN",
] as const;

export type ResearcherRole = (typeof RESEARCHER_ROLES)[number];
