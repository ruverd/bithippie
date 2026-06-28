import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { usePostSamples } from "@/generated/hooks/samples/usePostSamples";
import { getSamplesQueryKey } from "@/generated/hooks/samples/useGetSamples";
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
import { Field } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function RegisterSampleDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const create = usePostSamples();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      specimenType: "",
      collectedAt: "",
      storageLocation: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      {
        data: {
          code: values.code,
          specimenType: values.specimenType,
          collectedAt: values.collectedAt ? values.collectedAt : undefined,
          storageLocation: values.storageLocation
            ? values.storageLocation
            : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getSamplesQueryKey() });
          toast.success("Sample registered");
          setOpen(false);
          reset();
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus size={16} />
            Register Sample
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Register Sample</DialogTitle>
            <DialogDescription>
              Log a new specimen and where it is stored.
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
              <Input type="date" {...register("collectedAt")} />
            </Field>
          </div>

          <Field
            label="Storage location"
            error={errors.storageLocation?.message}
          >
            <Input
              placeholder="e.g. Freezer A, Shelf 3"
              {...register("storageLocation")}
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={create.isPending}>
              Register Sample
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
