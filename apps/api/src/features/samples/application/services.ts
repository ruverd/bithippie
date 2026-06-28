import type { SamplesRepository } from "../domain/samples.repository";
import { CreateSampleService } from "./create-sample.service";
import { DeleteSampleService } from "./delete-sample.service";
import { GetSampleService } from "./get-sample.service";
import { GetSamplesService } from "./get-samples.service";
import { UpdateSampleService } from "./update-sample.service";

export interface SamplesServices {
  createSample: CreateSampleService;
  updateSample: UpdateSampleService;
  deleteSample: DeleteSampleService;
  getSample: GetSampleService;
  getSamples: GetSamplesService;
}

export function buildSamplesServices(repo: SamplesRepository): SamplesServices {
  return {
    createSample: new CreateSampleService(repo),
    updateSample: new UpdateSampleService(repo),
    deleteSample: new DeleteSampleService(repo),
    getSample: new GetSampleService(repo),
    getSamples: new GetSamplesService(repo),
  };
}
