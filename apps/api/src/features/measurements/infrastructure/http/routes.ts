import { Elysia, t } from "elysia";
import { measurementValueInputSchema } from "@lab/shared";
import type { MeasurementsServices } from "../../application/services";
import {
  createdMeasurementSchema,
  measurementListSchema,
  updateMeasurementSchema,
} from "../../application/schemas";
import { MeasurementsController } from "./measurements.controller";

export function measurementsRouter(services: MeasurementsServices) {
  const controller = new MeasurementsController(services);
  return new Elysia()
    .get("/measurements", () => controller.listMeasurements(), {
      response: measurementListSchema,
      detail: { tags: ["Measurements"], summary: "List all recorded measurements" },
    })
    .post(
      "/experiments/:experimentId/measurements",
      ({ params, body, set }) => controller.createMeasurement(params.experimentId, body, set),
      {
        params: t.Object({ experimentId: t.String() }),
        body: measurementValueInputSchema,
        response: { 201: createdMeasurementSchema },
        detail: { tags: ["Measurements"], summary: "Record a measurement for an experiment" },
      },
    )
    .patch(
      "/measurements/:measurementId",
      ({ params, body }) => controller.updateMeasurement(params.measurementId, body),
      {
        params: t.Object({ measurementId: t.String() }),
        body: updateMeasurementSchema,
        response: createdMeasurementSchema,
        detail: { tags: ["Measurements"], summary: "Update a measurement" },
      },
    )
    .delete(
      "/measurements/:measurementId",
      ({ params, set }) => controller.deleteMeasurement(params.measurementId, set),
      {
        params: t.Object({ measurementId: t.String() }),
        detail: { tags: ["Measurements"], summary: "Delete a measurement" },
      },
    );
}
