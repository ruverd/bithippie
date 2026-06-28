import type { CreateResearcherInput, UpdateResearcherInput } from "../../domain/researcher";
import type { ResearchersServices } from "../../application/services";

type ResponseSet = { status?: number | string };

export class ResearchersController {
  constructor(private readonly services: ResearchersServices) {}

  getResearchers() {
    return this.services.getResearchers.execute();
  }

  async createResearcher(body: CreateResearcherInput, set: ResponseSet) {
    const result = await this.services.createResearcher.execute(body);
    set.status = 201;
    return result;
  }

  updateResearcher(id: string, body: UpdateResearcherInput) {
    return this.services.updateResearcher.execute(id, body);
  }
}
