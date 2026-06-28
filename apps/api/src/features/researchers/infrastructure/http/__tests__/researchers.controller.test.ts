import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryResearchersRepository } from "../../repositories/memory";
import { buildResearchersServices } from "../../../application/services";
import { ResearchersController } from "../researchers.controller";

let controller: ResearchersController;

beforeEach(() => {
  controller = new ResearchersController(
    buildResearchersServices(
      new InMemoryResearchersRepository([
        {
          id: "r1",
          name: "Alice Nguyen",
          email: "alice@lab.test",
          globalRole: "PRINCIPAL_INVESTIGATOR",
          projectCount: 0,
          measurementCount: 0,
        },
      ]),
    ),
  );
});

describe("ResearchersController", () => {
  it("should getResearchers forwards to the service", async () => {
    const result = await controller.getResearchers();
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Alice Nguyen");
  });

  it("should createResearcher forwards to the service and sets status 201", async () => {
    const set: { status?: number | string } = {};
    const result = await controller.createResearcher(
      {
        name: "Bob Smith",
        email: "bob@lab.test",
        globalRole: "PRINCIPAL_INVESTIGATOR",
      },
      set,
    );
    expect(set.status).toBe(201);
    expect(result.name).toBe("Bob Smith");
  });
});
