import { InMemoryProjectsRepository } from "../../features/projects/infrastructure/repositories/memory";
import { InMemoryExperimentsRepository } from "../../features/experiments/infrastructure/repositories/memory";
import { InMemorySamplesRepository } from "../../features/samples/infrastructure/repositories/memory";
import { InMemoryResearchersRepository } from "../../features/researchers/infrastructure/repositories/memory";
import { InMemoryMeasurementDefinitionsRepository } from "../../features/measurement-definitions/infrastructure/repositories/memory";
import { InMemoryMeasurementsRepository } from "../../features/measurements/infrastructure/repositories/memory";

import type { ProjectsRepository } from "../../features/projects/domain/projects.repository";
import type { ExperimentsRepository } from "../../features/experiments/domain/experiments.repository";
import type { SamplesRepository } from "../../features/samples/domain/samples.repository";
import type { ResearchersRepository } from "../../features/researchers/domain/researchers.repository";
import type { MeasurementDefinitionsRepository } from "../../features/measurement-definitions/domain/measurement-definitions.repository";
import type { MeasurementsRepository } from "../../features/measurements/domain/measurements.repository";

export interface MemoryRepositories {
  projects: ProjectsRepository;
  experiments: ExperimentsRepository;
  samples: SamplesRepository;
  measurementDefinitions: MeasurementDefinitionsRepository;
  measurements: MeasurementsRepository;
  researchers: ResearchersRepository;
}

const WATER = "seed-project-water";
const SOIL = "seed-project-soil";
const EXP1 = "seed-exp-1";
const EXP2 = "seed-exp-2";
const EXP3 = "seed-exp-3";
const ALICE = "seed-researcher-alice";
const BOB = "seed-researcher-bob";
const CAROL = "seed-researcher-carol";
const BLOOD = "seed-sample-blood";
const SOIL_SAMPLE = "seed-sample-soil";

const directory = {
  [ALICE]: { name: "Alice Nguyen", email: "alice@lab.test", globalRole: "PRINCIPAL_INVESTIGATOR" },
  [BOB]: { name: "Bob Silva", email: "bob@lab.test", globalRole: "GRADUATE_STUDENT" },
  [CAROL]: { name: "Carol Tan", email: "carol@lab.test", globalRole: "LAB_TECHNICIAN" },
};

// Mirrors the anchored seed-* rows from prisma/seed.ts so the e2e suite passes
// without a database. Read models are pre-shaped per repository; counts are set
// to satisfy the suite's thresholds.
export function buildMemoryRepositories(): MemoryRepositories {
  const researchers = new InMemoryResearchersRepository([
    { id: ALICE, name: "Alice Nguyen", email: "alice@lab.test", globalRole: "PRINCIPAL_INVESTIGATOR", projectCount: 2, measurementCount: 2 },
    { id: BOB, name: "Bob Silva", email: "bob@lab.test", globalRole: "GRADUATE_STUDENT", projectCount: 2, measurementCount: 2 },
    { id: CAROL, name: "Carol Tan", email: "carol@lab.test", globalRole: "LAB_TECHNICIAN", projectCount: 1, measurementCount: 1 },
  ]);

  const samples = new InMemorySamplesRepository([
    { id: BLOOD, code: "BLD-001", specimenType: "blood", collectedAt: null, storageLocation: "Freezer A / Shelf 2", experimentCount: 2 },
    { id: SOIL_SAMPLE, code: "SOIL-001", specimenType: "soil", collectedAt: null, storageLocation: "Cabinet 3", experimentCount: 1 },
  ]);

  const measurementDefinitions = new InMemoryMeasurementDefinitionsRepository([
    { id: "seed-def-lead", name: "Lead concentration", valueType: "NUMERIC", defaultUnit: "mg/L", allowedCategories: [], description: null },
    { id: "seed-def-temp", name: "Temperature", valueType: "NUMERIC", defaultUnit: "°C", allowedCategories: [], description: null },
    { id: "seed-def-screen", name: "Screening result", valueType: "CATEGORICAL", defaultUnit: null, allowedCategories: ["positive", "negative", "inconclusive"], description: null },
    { id: "seed-def-obs", name: "Researcher observation", valueType: "TEXT", defaultUnit: null, allowedCategories: [], description: null },
  ]);

  const experiments = new InMemoryExperimentsRepository(
    [
      { id: EXP1, title: "Baseline lead screening", hypothesis: "Lead levels exceed the safe threshold.", status: "COMPLETED", projectId: WATER, previousExperimentId: null, startDate: null, endDate: null },
      { id: EXP2, title: "Lead screening replication", hypothesis: "Baseline lead levels reproduce.", status: "ACTIVE", projectId: WATER, previousExperimentId: EXP1, startDate: null, endDate: null },
      { id: EXP3, title: "Soil pH survey", hypothesis: "District A soil is more acidic.", status: "ACTIVE", projectId: SOIL, previousExperimentId: null, startDate: null, endDate: null },
    ],
    {
      [EXP1]: [
        { id: "seed-meas-lead-1", measurementDefinitionId: "seed-def-lead", definitionName: "Lead concentration", valueType: "NUMERIC", numericValue: 12.4, unit: "mg/L", categoricalValue: null, textValue: null, notes: null, recordedAt: "2026-06-03T10:00:00.000Z", recordedById: ALICE },
        { id: "seed-meas-screen-1", measurementDefinitionId: "seed-def-screen", definitionName: "Screening result", valueType: "CATEGORICAL", numericValue: null, unit: null, categoricalValue: "positive", textValue: null, notes: null, recordedAt: "2026-06-02T10:00:00.000Z", recordedById: BOB },
        { id: "seed-meas-obs-1", measurementDefinitionId: "seed-def-obs", definitionName: "Researcher observation", valueType: "TEXT", numericValue: null, unit: null, categoricalValue: null, textValue: "Sample appeared slightly turbid before testing.", notes: "Logged during intake.", recordedAt: "2026-06-01T10:00:00.000Z", recordedById: ALICE },
      ],
    },
    {
      [EXP1]: [{ id: BLOOD, code: "BLD-001", specimenType: "blood", storageLocation: "Freezer A / Shelf 2" }],
      [EXP2]: [{ id: BLOOD, code: "BLD-001", specimenType: "blood", storageLocation: "Freezer A / Shelf 2" }],
      [EXP3]: [{ id: SOIL_SAMPLE, code: "SOIL-001", specimenType: "soil", storageLocation: "Cabinet 3" }],
    },
    [
      { id: EXP1, title: "Baseline lead screening", hypothesis: "Lead levels exceed the safe threshold.", status: "COMPLETED", projectId: WATER, projectName: "Municipal Water Quality", leadName: "Alice Nguyen", measurementCount: 3, startDate: null },
      { id: EXP2, title: "Lead screening replication", hypothesis: "Baseline lead levels reproduce.", status: "ACTIVE", projectId: WATER, projectName: "Municipal Water Quality", leadName: "Alice Nguyen", measurementCount: 1, startDate: null },
      { id: EXP3, title: "Soil pH survey", hypothesis: "District A soil is more acidic.", status: "ACTIVE", projectId: SOIL, projectName: "Urban Soil Survey", leadName: "Alice Nguyen", measurementCount: 1, startDate: null },
    ],
    [WATER, SOIL],
  );

  const membership = (id: string, projectRole: string) => ({ researcherId: id, ...directory[id]!, projectRole });

  const projects = new InMemoryProjectsRepository(
    [
      { id: WATER, title: "Municipal Water Quality", description: "Lead and contaminant screening of municipal water.", status: "ACTIVE" },
      { id: SOIL, title: "Urban Soil Survey", description: "Soil composition study across city districts.", status: "PLANNING" },
    ],
    {
      [WATER]: [membership(ALICE, "LEAD"), membership(BOB, "COLLABORATOR"), membership(CAROL, "CONTRIBUTOR")],
      [SOIL]: [membership(ALICE, "LEAD"), membership(BOB, "COLLABORATOR")],
    },
    {
      [WATER]: [
        { id: EXP1, title: "Baseline lead screening", status: "COMPLETED", previousExperimentId: null },
        { id: EXP2, title: "Lead screening replication", status: "ACTIVE", previousExperimentId: EXP1 },
      ],
      [SOIL]: [{ id: EXP3, title: "Soil pH survey", status: "ACTIVE", previousExperimentId: null }],
    },
    [ALICE, BOB, CAROL],
    {
      [WATER]: [{ id: BLOOD, code: "BLD-001", specimenType: "blood", collectedAt: null, storageLocation: "Freezer A / Shelf 2" }],
      [SOIL]: [{ id: SOIL_SAMPLE, code: "SOIL-001", specimenType: "soil", collectedAt: null, storageLocation: "Cabinet 3" }],
    },
    {
      [WATER]: [
        { id: "seed-meas-lead-1", definitionName: "Lead concentration", valueType: "NUMERIC", numericValue: 12.4, unit: "mg/L", categoricalValue: null, textValue: null, experimentId: EXP1, experimentName: "Baseline lead screening", recordedAt: "2026-06-03T10:00:00.000Z", recordedById: ALICE, recordedByName: "Alice Nguyen" },
      ],
    },
    directory,
  );

  const measurements = new InMemoryMeasurementsRepository({
    experiments: [EXP1, EXP2, EXP3],
    samples: { [EXP1]: [BLOOD], [EXP2]: [BLOOD], [EXP3]: [SOIL_SAMPLE] },
    researchers: [ALICE, BOB, CAROL],
    definitions: {
      "seed-def-lead": { id: "seed-def-lead", valueType: "NUMERIC", allowedCategories: [] },
      "seed-def-temp": { id: "seed-def-temp", valueType: "NUMERIC", allowedCategories: [] },
      "seed-def-screen": { id: "seed-def-screen", valueType: "CATEGORICAL", allowedCategories: ["positive", "negative", "inconclusive"] },
      "seed-def-obs": { id: "seed-def-obs", valueType: "TEXT", allowedCategories: [] },
    },
    list: [
      { id: "seed-meas-temp-1", experimentId: EXP3, experimentName: "Soil pH survey", measurementDefinitionId: "seed-def-temp", definitionName: "Temperature", valueType: "NUMERIC", numericValue: 22.5, unit: "°C", categoricalValue: null, textValue: null, notes: null, recordedAt: "2026-06-05T10:00:00.000Z", recordedById: CAROL, recordedByName: "Carol Tan" },
      { id: "seed-meas-lead-2", experimentId: EXP2, experimentName: "Lead screening replication", measurementDefinitionId: "seed-def-lead", definitionName: "Lead concentration", valueType: "NUMERIC", numericValue: 9.8, unit: "mg/L", categoricalValue: null, textValue: null, notes: null, recordedAt: "2026-06-04T10:00:00.000Z", recordedById: BOB, recordedByName: "Bob Silva" },
      { id: "seed-meas-lead-1", experimentId: EXP1, experimentName: "Baseline lead screening", measurementDefinitionId: "seed-def-lead", definitionName: "Lead concentration", valueType: "NUMERIC", numericValue: 12.4, unit: "mg/L", categoricalValue: null, textValue: null, notes: null, recordedAt: "2026-06-03T10:00:00.000Z", recordedById: ALICE, recordedByName: "Alice Nguyen" },
      { id: "seed-meas-screen-1", experimentId: EXP1, experimentName: "Baseline lead screening", measurementDefinitionId: "seed-def-screen", definitionName: "Screening result", valueType: "CATEGORICAL", numericValue: null, unit: null, categoricalValue: "positive", textValue: null, notes: null, recordedAt: "2026-06-02T10:00:00.000Z", recordedById: BOB, recordedByName: "Bob Silva" },
      { id: "seed-meas-obs-1", experimentId: EXP1, experimentName: "Baseline lead screening", measurementDefinitionId: "seed-def-obs", definitionName: "Researcher observation", valueType: "TEXT", numericValue: null, unit: null, categoricalValue: null, textValue: "Sample appeared slightly turbid before testing.", notes: "Logged during intake.", recordedAt: "2026-06-01T10:00:00.000Z", recordedById: ALICE, recordedByName: "Alice Nguyen" },
    ],
  });

  return { projects, experiments, samples, measurementDefinitions, measurements, researchers };
}
