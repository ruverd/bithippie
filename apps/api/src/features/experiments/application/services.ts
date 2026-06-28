import type { ExperimentsRepository } from "../domain/experiments.repository";
import { CreateExperimentService } from "./create-experiment.service";
import { DeleteExperimentService } from "./delete-experiment.service";
import { GetExperimentService } from "./get-experiment.service";
import { GetExperimentMeasurementsService } from "./get-experiment-measurements.service";
import { GetExperimentSamplesService } from "./get-experiment-samples.service";
import { ListExperimentsService } from "./list-experiments.service";
import { UpdateExperimentService } from "./update-experiment.service";

export interface ExperimentsServices {
  createExperiment: CreateExperimentService;
  updateExperiment: UpdateExperimentService;
  deleteExperiment: DeleteExperimentService;
  listExperiments: ListExperimentsService;
  getExperiment: GetExperimentService;
  getExperimentMeasurements: GetExperimentMeasurementsService;
  getExperimentSamples: GetExperimentSamplesService;
}

export function buildExperimentsServices(repo: ExperimentsRepository): ExperimentsServices {
  return {
    createExperiment: new CreateExperimentService(repo),
    updateExperiment: new UpdateExperimentService(repo),
    deleteExperiment: new DeleteExperimentService(repo),
    listExperiments: new ListExperimentsService(repo),
    getExperiment: new GetExperimentService(repo),
    getExperimentMeasurements: new GetExperimentMeasurementsService(repo),
    getExperimentSamples: new GetExperimentSamplesService(repo),
  };
}
