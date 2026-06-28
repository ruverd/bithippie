import type { CreateSampleInput, UpdateSampleInput } from "../../domain/sample";
import type { SamplesServices } from "../../application/services";

type ResponseSet = { status?: number | string };

export class SamplesController {
  constructor(private readonly services: SamplesServices) {}

  getSamples() {
    return this.services.getSamples.execute();
  }

  async createSample(body: CreateSampleInput, set: ResponseSet) {
    const result = await this.services.createSample.execute(body);
    set.status = 201;
    return result;
  }

  getSample(id: string) {
    return this.services.getSample.execute(id);
  }

  updateSample(id: string, body: UpdateSampleInput) {
    return this.services.updateSample.execute(id, body);
  }

  async deleteSample(id: string, set: ResponseSet) {
    await this.services.deleteSample.execute(id);
    set.status = 204;
  }
}
