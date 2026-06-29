import { zodResolver } from "@hookform/resolvers/zod";
import { measurementValueInputSchema } from "@lab/shared";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form-field";
import { useGetMeasurementDefinitions } from "@/generated/hooks/measurementDefinitions/useGetMeasurementDefinitions";
import { useGetExperiments } from "@/generated/hooks/experiments/useGetExperiments";
import { useGetExperimentsByExperimentIdSamples } from "@/generated/hooks/experiments/useGetExperimentsByExperimentIdSamples";
import { useGetResearchers } from "@/generated/hooks/researchers/useGetResearchers";
import { usePostExperimentsByExperimentIdMeasurements } from "@/generated/hooks/measurements/usePostExperimentsByExperimentIdMeasurements";
import { getExperimentsByExperimentIdMeasurementsQueryKey } from "@/generated/hooks/experiments/useGetExperimentsByExperimentIdMeasurements";
import { getMeasurementsQueryKey } from "@/generated/hooks/measurements/useGetMeasurements";
import { MeasurementValueField } from "./MeasurementValueField";
import { SampleMultiSelect } from "./sample-multi-select";

const schema = z
  .object({ experimentId: z.string().min(1, "Required") })
  .and(measurementValueInputSchema);

type FormValues = z.infer<typeof schema>;

export interface CreateMeasurementDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateMeasurementDialog({
  open: openProp,
  onOpenChange,
}: CreateMeasurementDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const queryClient = useQueryClient();
  const definitions = useGetMeasurementDefinitions();
  const experiments = useGetExperiments();
  const researchers = useGetResearchers();
  const create = usePostExperimentsByExperimentIdMeasurements();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      experimentId: "",
      measurementDefinitionId: "",
    },
  });

  const selectedId = watch("measurementDefinitionId");
  const def = (definitions.data ?? []).find((d) => d.id === selectedId);
  const selectedExperimentId = watch("experimentId");
  const experimentSamples = useGetExperimentsByExperimentIdSamples(selectedExperimentId, {
    query: { enabled: Boolean(selectedExperimentId) },
  });

  const onSubmit = handleSubmit(({ experimentId, ...data }) => {
    create.mutate(
      { experimentId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getExperimentsByExperimentIdMeasurementsQueryKey(experimentId),
          });
          queryClient.invalidateQueries({ queryKey: getMeasurementsQueryKey() });
          toast.success("Measurement recorded");
          setOpen(false);
          reset();
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {openProp === undefined && (
        <DialogTrigger
          render={
            <Button>
              <Plus size={16} />
              New Measurement
            </Button>
          }
        />
      )}
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New Measurement</DialogTitle>
            <DialogDescription>
              Record a data point for an experiment.
            </DialogDescription>
          </DialogHeader>

          <Field
            label="Measurement definition"
            required
            error={errors.measurementDefinitionId?.message}
          >
            <Controller
              control={control}
              name="measurementDefinitionId"
              render={({ field }) => (
                <Select
                  items={Object.fromEntries((definitions.data ?? []).map((d) => [d.id, d.name]))}
                  value={field.value || undefined}
                  onValueChange={(v) => field.onChange(v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select definition" />
                  </SelectTrigger>
                  <SelectContent>
                    {(definitions.data ?? []).map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Experiment" required error={errors.experimentId?.message}>
            <Controller
              control={control}
              name="experimentId"
              render={({ field }) => (
                <Select
                  items={Object.fromEntries((experiments.data ?? []).map((e) => [e.id, e.title]))}
                  value={field.value || undefined}
                  onValueChange={(v) => {
                    field.onChange(v ?? "");
                    setValue("sampleIds", []);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select experiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {(experiments.data ?? []).map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Samples" error={errors.sampleIds?.message}>
            <Controller
              control={control}
              name="sampleIds"
              render={({ field }) => (
                <SampleMultiSelect
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={experimentSamples.data ?? []}
                  disabled={!selectedExperimentId}
                />
              )}
            />
          </Field>

          {def && (
            <div className="flex gap-3">
              <Field label="Value" className="flex-1">
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
                    <MeasurementValueField
                      valueType={def.valueType}
                      allowedCategories={def.allowedCategories ?? []}
                      value={field.value == null ? "" : String(field.value)}
                      onChange={(v) =>
                        field.onChange(
                          def.valueType === "NUMERIC"
                            ? v === ""
                              ? undefined
                              : Number(v)
                            : v,
                        )
                      }
                    />
                  )}
                />
              </Field>

              <Field label="Unit" className="flex-1">
                <Input placeholder="e.g. mg/mL" {...register("unit")} />
              </Field>
            </div>
          )}

          <Field label="Recorded by" error={errors.recordedById?.message}>
            <Controller
              control={control}
              name="recordedById"
              render={({ field }) => (
                <Select
                  items={Object.fromEntries((researchers.data ?? []).map((r) => [r.id, r.name]))}
                  value={field.value || undefined}
                  onValueChange={(v) => field.onChange(v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select researcher" />
                  </SelectTrigger>
                  <SelectContent>
                    {(researchers.data ?? []).map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={create.isPending}>
              Save Measurement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
