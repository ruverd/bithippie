import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryResearchersRepository } from "../../infrastructure/repositories/memory";
import { UpdateResearcherService } from "../update-researcher.service";
import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";

let service: UpdateResearcherService;

beforeEach(() => {
  service = new UpdateResearcherService(
    new InMemoryResearchersRepository([
      { id: "r1", name: "Alice", email: "alice@lab.test", globalRole: "PRINCIPAL_INVESTIGATOR", projectCount: 1, measurementCount: 0 },
      { id: "r2", name: "Bob", email: "bob@lab.test", globalRole: "GRADUATE_STUDENT", projectCount: 0, measurementCount: 0 },
    ]),
  );
});

describe("UpdateResearcherService", () => {
  it("should update the editable fields and leave the rest", async () => {
    const result = await service.execute("r1", { name: "Alice N.", globalRole: "POSTDOC" });
    expect(result.name).toBe("Alice N.");
    expect(result.globalRole).toBe("POSTDOC");
    expect(result.email).toBe("alice@lab.test");
  });

  it("should throw NotFoundError for an unknown researcher", async () => {
    await expect(service.execute("nope", { name: "X" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should throw ValidationError when the email is already in use", async () => {
    await expect(service.execute("r1", { email: "bob@lab.test" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
