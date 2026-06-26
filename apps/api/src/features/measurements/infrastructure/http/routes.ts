import { Elysia, t } from "elysia";
import { measurementValueInputSchema } from "@lab/shared";
import type { MeasurementsRepository } from "../../domain/measurements.repository";
import { createMeasurement } from "../../application/create-measurement";
import { createdMeasurementSchema } from "../../application/schemas";

export function measurementsRouter(repo: MeasurementsRepository) {
  return new Elysia().post(
    "/experiments/:experimentId/measurements",
    async ({ params, body, set }) => {
      const result = await createMeasurement(repo, { ...body, experimentId: params.experimentId });
      set.status = 201;
      return result;
    },
    {
      params: t.Object({ experimentId: t.String() }),
      body: measurementValueInputSchema,
      response: { 201: createdMeasurementSchema },
      detail: { tags: ["Measurements"], summary: "Record a measurement for an experiment" },
    },
  );
}
