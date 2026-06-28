import type { ResearchersRepository } from "../domain/researchers.repository";
import { CreateResearcherService } from "./create-researcher.service";
import { GetResearchersService } from "./get-researchers.service";
import { UpdateResearcherService } from "./update-researcher.service";

export interface ResearchersServices {
  createResearcher: CreateResearcherService;
  getResearchers: GetResearchersService;
  updateResearcher: UpdateResearcherService;
}

export function buildResearchersServices(repo: ResearchersRepository): ResearchersServices {
  return {
    createResearcher: new CreateResearcherService(repo),
    getResearchers: new GetResearchersService(repo),
    updateResearcher: new UpdateResearcherService(repo),
  };
}
