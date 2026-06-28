import type { ExperimentsRepository } from "../domain/experiments.repository";

export class ListExperimentsService {
  constructor(private readonly repo: ExperimentsRepository) {}

  execute() {
    return this.repo.list();
  }
}
