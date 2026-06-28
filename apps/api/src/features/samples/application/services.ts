import type { SamplesRepository } from "../domain/samples.repository";
import { CreateSampleService } from "./create-sample.service";
import { GetSampleService } from "./get-sample.service";
import { GetSamplesService } from "./get-samples.service";

export interface SamplesServices {
  createSample: CreateSampleService;
  getSample: GetSampleService;
  getSamples: GetSamplesService;
}

export function buildSamplesServices(repo: SamplesRepository): SamplesServices {
  return {
    createSample: new CreateSampleService(repo),
    getSample: new GetSampleService(repo),
    getSamples: new GetSamplesService(repo),
  };
}
