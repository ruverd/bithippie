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
import { usePostSamples } from "@/generated/hooks/samples/usePostSamples";
import { usePatchSamplesBySampleId } from "@/generated/hooks/samples/usePatchSamplesBySampleId";
import { useDeleteSamplesBySampleId } from "@/generated/hooks/samples/useDeleteSamplesBySampleId";
import { emptyToUndefined } from "@/utils/empty-to-undefined";

type SampleRef = {
  id: string;
  code: string;
  specimenType: string;
  collectedAt: string | null;
  storageLocation: string | null;
};

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
}

export function SampleFormDialog({ open, onOpenChange, sample }: SampleFormDialogProps) {
  const isEdit = Boolean(sample);
  const queryClient = useQueryClient();
  const create = usePostSamples();
  const update = usePatchSamplesBySampleId();
  const remove = useDeleteSamplesBySampleId();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pending = create.isPending || update.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: BLANK });

  useEffect(() => {
    if (!open) return;
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
    queryClient.invalidateQueries({
      refetchType: "all",
      predicate: (q) => {
        const k = q.queryKey?.[0] as { url?: string } | undefined;
        return typeof k?.url === "string" && k.url.includes("/samples");
      },
    });

  const onSubmit = handleSubmit((values) => {
    const data = {
      code: values.code,
      specimenType: values.specimenType,
      collectedAt: emptyToUndefined(values.collectedAt),
      storageLocation: emptyToUndefined(values.storageLocation),
    };
    if (sample) {
      update.mutate(
        { sampleId: sample.id, data },
        {
          onSuccess: () => {
            invalidate();
            toast.success("Sample updated");
            onOpenChange(false);
          },
        },
      );
    } else {
      create.mutate(
        { data },
        {
          onSuccess: () => {
            invalidate();
            toast.success("Sample registered");
            onOpenChange(false);
          },
        },
      );
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
