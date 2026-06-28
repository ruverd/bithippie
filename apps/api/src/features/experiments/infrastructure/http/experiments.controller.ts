import type { CreateExperimentInput, UpdateExperimentInput } from "../../domain/experiment";
import type { ExperimentsServices } from "../../application/services";

type ResponseSet = { status?: number | string };

export class ExperimentsController {
  constructor(private readonly services: ExperimentsServices) {}

  listExperiments() {
    return this.services.listExperiments.execute();
  }

  async createExperiment(body: CreateExperimentInput, set: ResponseSet) {
    const result = await this.services.createExperiment.execute(body);
    set.status = 201;
    return result;
  }

  updateExperiment(id: string, body: UpdateExperimentInput) {
    return this.services.updateExperiment.execute(id, body);
  }

  async deleteExperiment(id: string, set: ResponseSet) {
    await this.services.deleteExperiment.execute(id);
    set.status = 204;
  }

  getExperiment(id: string) {
    return this.services.getExperiment.execute(id);
  }

  getExperimentMeasurements(id: string) {
    return this.services.getExperimentMeasurements.execute(id);
  }

  getExperimentSamples(id: string) {
    return this.services.getExperimentSamples.execute(id);
  }

  async attachExperimentSample(experimentId: string, sampleId: string, set: ResponseSet) {
    await this.services.attachExperimentSample.execute(experimentId, sampleId);
    set.status = 204;
  }

  async detachExperimentSample(experimentId: string, sampleId: string, set: ResponseSet) {
    await this.services.detachExperimentSample.execute(experimentId, sampleId);
    set.status = 204;
  }
}
