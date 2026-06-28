import { zodResolver } from "@hookform/resolvers/zod";
import { measurementValueInputSchema } from "@lab/shared";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { useGetMeasurementDefinitions } from "@/generated/hooks/measurementDefinitions/useGetMeasurementDefinitions";
import { usePostExperimentsByExperimentIdMeasurements } from "@/generated/hooks/measurements/usePostExperimentsByExperimentIdMeasurements";
import { getExperimentsByExperimentIdMeasurementsQueryKey } from "@/generated/hooks/experiments/useGetExperimentsByExperimentIdMeasurements";
import { useGetExperimentsByExperimentIdSamples } from "@/generated/hooks/experiments/useGetExperimentsByExperimentIdSamples";
import { MeasurementValueField } from "./MeasurementValueField";
import { SampleMultiSelect } from "./sample-multi-select";

type FormValues = z.infer<typeof measurementValueInputSchema>;

export function CreateMeasurementForm({ experimentId }: { experimentId: string }) {
  const queryClient = useQueryClient();
  const definitions = useGetMeasurementDefinitions();
  const samples = useGetExperimentsByExperimentIdSamples(experimentId, {
    query: { enabled: Boolean(experimentId) },
  });
  const create = usePostExperimentsByExperimentIdMeasurements();
  const { control, handleSubmit, watch, register } = useForm<FormValues>({
    resolver: zodResolver(measurementValueInputSchema),
    defaultValues: { measurementDefinitionId: "" },
  });

  const selectedId = watch("measurementDefinitionId");
  const def = (definitions.data ?? []).find((d) => d.id === selectedId);

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      { experimentId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getExperimentsByExperimentIdMeasurementsQueryKey(experimentId),
          });
          toast.success("Measurement recorded");
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span>Definition</span>
        <select
          aria-label="definition"
          {...register("measurementDefinitionId")}
          className="rounded border px-2 py-1"
        >
          <option value="" disabled>
            Select…
          </option>
          {(definitions.data ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      {def && (
        <Controller
          control={control}
          name={
            def.valueType === "NUMERIC"
              ? "numericValue"
              : def.valueType === "CATEGORICAL"
                ? "categoricalValue"
                : "textValue"
          }
          render={({ field }) => (
            <label className="flex flex-col gap-1">
              <span>Value</span>
              <MeasurementValueField
                valueType={def.valueType}
                allowedCategories={def.allowedCategories ?? []}
                value={field.value == null ? "" : String(field.value)}
                onChange={(v) =>
                  field.onChange(def.valueType === "NUMERIC" ? (v === "" ? undefined : Number(v)) : v)
                }
              />
            </label>
          )}
        />
      )}

      <Controller
        control={control}
        name="sampleIds"
        render={({ field }) => (
          <label className="flex flex-col gap-1">
            <span>Samples</span>
            <SampleMultiSelect
              value={field.value ?? []}
              onChange={field.onChange}
              options={samples.data ?? []}
              disabled={!experimentId}
            />
          </label>
        )}
      />

      <button
        type="submit"
        disabled={create.isPending}
        className="self-start rounded border px-3 py-1"
      >
        Save
      </button>
    </form>
  );
}
