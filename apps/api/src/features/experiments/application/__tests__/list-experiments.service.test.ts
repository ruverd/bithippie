import { describe, expect, it } from "vitest";
import { ListExperimentsService } from "../list-experiments.service";
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

describe("ListExperimentsService", () => {
  it("should returns the enriched experiment rows", async () => {
    const service = new ListExperimentsService(new InMemoryExperimentsRepository([], {}, {}, [item]));
    expect(await service.execute()).toEqual([item]);
  });

  it("should returns an empty array when none exist", async () => {
    const service = new ListExperimentsService(new InMemoryExperimentsRepository());
    expect(await service.execute()).toEqual([]);
  });
});
