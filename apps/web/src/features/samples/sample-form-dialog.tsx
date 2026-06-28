import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form-field";
import { DatePicker } from "@/components/date-picker";
import { ChipMultiSelect } from "@/components/chip-multi-select";
import { invalidateByUrl } from "@/lib/invalidate-queries";
import { usePostSamples } from "@/generated/hooks/samples/usePostSamples";
import { usePatchSamplesBySampleId } from "@/generated/hooks/samples/usePatchSamplesBySampleId";
import { useDeleteSamplesBySampleId } from "@/generated/hooks/samples/useDeleteSamplesBySampleId";
import { usePostExperimentsByExperimentIdSamples } from "@/generated/hooks/experiments/usePostExperimentsByExperimentIdSamples";
import { useDeleteExperimentsByExperimentIdSamplesBySampleId } from "@/generated/hooks/experiments/useDeleteExperimentsByExperimentIdSamplesBySampleId";
import { emptyToUndefined } from "@/utils/empty-to-undefined";

type SampleRef = {
  id: string;
  code: string;
  specimenType: string;
  collectedAt: string | null;
  storageLocation: string | null;
  experimentIds?: string[];
};

export interface ExperimentOption {
  id: string;
  title: string;
}

const specimenTypes = [
  "Blood plasma",
  "Tissue biopsy",
  "Cell culture",
  "DNA extract",
  "Serum",
  "Saliva",
  "Plasma",
  "Urine",
  "Bone marrow",
  "CSF",
];

const schema = z.object({
  code: z.string().min(1, "Required"),
  specimenType: z.string().min(1, "Required"),
  collectedAt: z.string().optional(),
  storageLocation: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const BLANK: FormValues = {
  code: "",
  specimenType: "",
  collectedAt: "",
  storageLocation: "",
};

export interface SampleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sample?: SampleRef | null;
  /** When provided, the dialog shows an experiment picker scoped to these options. */
  availableExperiments?: ExperimentOption[];
}

export function SampleFormDialog({
  open,
  onOpenChange,
  sample,
  availableExperiments,
}: SampleFormDialogProps) {
  const isEdit = Boolean(sample);
  const queryClient = useQueryClient();
  const create = usePostSamples();
  const update = usePatchSamplesBySampleId();
  const remove = useDeleteSamplesBySampleId();
  const attach = usePostExperimentsByExperimentIdSamples();
  const detach = useDeleteExperimentsByExperimentIdSamplesBySampleId();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>([]);
  const pending =
    create.isPending || update.isPending || attach.isPending || detach.isPending;
  const showExperiments = availableExperiments !== undefined;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: BLANK });

  useEffect(() => {
    if (!open) return;
    setSelectedExperiments(sample?.experimentIds ?? []);
    if (!sample) {
      reset(BLANK);
      return;
    }
    reset({
      code: sample.code,
      specimenType: sample.specimenType,
      collectedAt: sample.collectedAt ? sample.collectedAt.slice(0, 10) : "",
      storageLocation: sample.storageLocation ?? "",
    });
  }, [open, sample, reset]);

  const invalidate = () =>
    invalidateByUrl(queryClient, "/samples", "/experiments", "/projects");

  const syncExperiments = async (sampleId: string, previous: string[]) => {
    if (!showExperiments) return;
    const added = selectedExperiments.filter((id) => !previous.includes(id));
    const removed = previous.filter((id) => !selectedExperiments.includes(id));
    for (const experimentId of added) {
      await attach.mutateAsync({ experimentId, data: { sampleId } });
    }
    for (const experimentId of removed) {
      await detach.mutateAsync({ experimentId, sampleId });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const data = {
      code: values.code,
      specimenType: values.specimenType,
      collectedAt: emptyToUndefined(values.collectedAt),
      storageLocation: emptyToUndefined(values.storageLocation),
    };
    try {
      if (sample) {
        await update.mutateAsync({ sampleId: sample.id, data });
        await syncExperiments(sample.id, sample.experimentIds ?? []);
        toast.success("Sample updated");
      } else {
        const created = await create.mutateAsync({ data });
        await syncExperiments(created.id, []);
        toast.success("Sample registered");
      }
      invalidate();
      onOpenChange(false);
    } catch {
      toast.error("Could not save the sample");
    }
  });

  const onDelete = () => {
    if (!sample) return;
    remove.mutate(
      { sampleId: sample.id },
      {
        onSuccess: () => {
          invalidate();
          toast.success("Sample deleted");
          setConfirmOpen(false);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Sample" : "Register Sample"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this specimen's details."
                : "Log a new specimen and where it is stored."}
            </DialogDescription>
          </DialogHeader>

          <Field label="Sample code" required error={errors.code?.message}>
            <Input placeholder="e.g. SMP-001" {...register("code")} />
          </Field>

          <div className="flex gap-3">
            <Field
              label="Specimen type"
              required
              error={errors.specimenType?.message}
              className="flex-1"
            >
              <Controller
                control={control}
                name="specimenType"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(v) => field.onChange(v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {specimenTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="Collected date"
              error={errors.collectedAt?.message}
              className="flex-1"
            >
              <Controller
                control={control}
                name="collectedAt"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Collected date"
                  />
                )}
              />
            </Field>
          </div>

          <Field label="Storage location" error={errors.storageLocation?.message}>
            <Input
              placeholder="e.g. Freezer A, Shelf 3"
              {...register("storageLocation")}
            />
          </Field>

          {showExperiments && (
            <Field label="Experiments">
              {availableExperiments.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  This project has no experiments yet.
                </p>
              ) : (
                <ChipMultiSelect
                  value={selectedExperiments}
                  onChange={setSelectedExperiments}
                  options={availableExperiments.map((e) => ({ id: e.id, label: e.title }))}
                  addPlaceholder="+ Add experiment"
                />
              )}
            </Field>
          )}

          <DialogFooter>
            {isEdit && (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger
                  render={
                    <Button type="button" variant="destructive" className="mr-auto">
                      Delete
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete sample?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes “{sample?.code}” and removes it from any
                      experiments and measurements. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      type="button"
                      variant="destructive"
                      disabled={remove.isPending}
                      onClick={onDelete}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={pending}>
              {isEdit ? "Save Changes" : "Register Sample"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
