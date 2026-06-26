import { describe, expect, it } from "vitest";
import { listExperiments } from "../list-experiments";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import type { ExperimentListItem } from "../../domain/experiment";

const item: ExperimentListItem = {
  id: "e1",
  title: "Protein folding kinetics",
  hypothesis: "Folds faster at 37C",
  status: "ACTIVE",
  projectId: "p1",
  projectName: "Neuro Regeneration",
  leadName: "Dr. Amara Mensah",
  measurementCount: 128,
  startDate: "2026-03-03T00:00:00.000Z",
};

describe("listExperiments", () => {
  it("returns the enriched experiment rows", async () => {
    const repo = new InMemoryExperimentsRepository([], {}, {}, [item]);
    expect(await listExperiments(repo)).toEqual([item]);
  });

  it("returns an empty array when none exist", async () => {
    const repo = new InMemoryExperimentsRepository();
    expect(await listExperiments(repo)).toEqual([]);
  });
});
