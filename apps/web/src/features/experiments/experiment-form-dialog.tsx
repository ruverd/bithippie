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
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/form-field";
import { DatePicker } from "@/components/date-picker";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import { usePostExperiments } from "@/generated/hooks/experiments/usePostExperiments";
import { usePatchExperimentsByExperimentId } from "@/generated/hooks/experiments/usePatchExperimentsByExperimentId";
import { useDeleteExperimentsByExperimentId } from "@/generated/hooks/experiments/useDeleteExperimentsByExperimentId";
import { useGetExperimentsByExperimentId } from "@/generated/hooks/experiments/useGetExperimentsByExperimentId";
import { emptyToUndefined } from "@/utils/empty-to-undefined";

type ExperimentRef = { id: string; title: string };

const schema = z.object({
  title: z.string().min(1, "Required"),
  hypothesis: z.string().optional(),
  projectId: z.string().min(1, "Required"),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const BLANK: FormValues = {
  title: "",
  hypothesis: "",
  projectId: "",
  startDate: "",
  endDate: "",
};

export interface ExperimentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experiment?: ExperimentRef | null;
  defaultProjectId?: string;
}

export function ExperimentFormDialog({
  open,
  onOpenChange,
  experiment,
  defaultProjectId,
}: ExperimentFormDialogProps) {
  const isEdit = Boolean(experiment);
  const queryClient = useQueryClient();
  const projects = useGetProjects();
  const create = usePostExperiments();
  const update = usePatchExperimentsByExperimentId();
  const remove = useDeleteExperimentsByExperimentId();
  const detail = useGetExperimentsByExperimentId(experiment?.id, {
    query: { enabled: open && isEdit },
  });
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
    if (!isEdit) {
      reset({ ...BLANK, projectId: defaultProjectId ?? "" });
      return;
    }
    const d = detail.data;
    if (!d) return;
    reset({
      title: d.title,
      hypothesis: d.hypothesis ?? "",
      projectId: d.projectId,
      status: (d.status as FormValues["status"]) ?? undefined,
      startDate: d.startDate ? d.startDate.slice(0, 10) : "",
      endDate: d.endDate ? d.endDate.slice(0, 10) : "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, detail.data]);

  const invalidate = () =>
    queryClient.invalidateQueries({
      refetchType: "all",
      predicate: (q) => {
        const k = q.queryKey?.[0] as { url?: string } | undefined;
        return typeof k?.url === "string" && k.url.includes("/experiments");
      },
    });

  const onSubmit = handleSubmit((values) => {
    const data = {
      title: values.title,
      projectId: values.projectId,
      hypothesis: emptyToUndefined(values.hypothesis),
      status: values.status,
      startDate: emptyToUndefined(values.startDate),
      endDate: emptyToUndefined(values.endDate),
    };
    if (experiment) {
      update.mutate(
        { experimentId: experiment.id, data },
        {
          onSuccess: () => {
            invalidate();
            toast.success("Experiment updated");
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
            toast.success("Experiment created");
            onOpenChange(false);
          },
        },
      );
    }
  });

  const onDelete = () => {
    if (!experiment) return;
    remove.mutate(
      { experimentId: experiment.id },
      {
        onSuccess: () => {
          invalidate();
          toast.success("Experiment deleted");
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
            <DialogTitle>{isEdit ? "Edit Experiment" : "New Experiment"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this experiment's details."
                : "Add an experiment to a project and set its hypothesis."}
            </DialogDescription>
          </DialogHeader>

          <Field label="Experiment title" required error={errors.title?.message}>
            <Input placeholder="Experiment title" {...register("title")} />
          </Field>

          <Field label="Hypothesis" error={errors.hypothesis?.message}>
            <Textarea className="resize-none" placeholder="Hypothesis" {...register("hypothesis")} />
          </Field>

          <div className="flex gap-3">
            <Field label="Project" required error={errors.projectId?.message} className="flex-1">
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select items={Object.fromEntries((projects.data ?? []).map((p) => [p.id, p.title]))} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {(projects.data ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Status" error={errors.status?.message} className="flex-1">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select items={{ PLANNING: "Planning", ACTIVE: "Active", COMPLETED: "Completed", CANCELLED: "Cancelled" }} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNING">Planning</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <div className="flex gap-3">
            <Field label="Start date" error={errors.startDate?.message} className="flex-1">
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker value={field.value} onChange={field.onChange} placeholder="Start date" />
                )}
              />
            </Field>

            <Field label="Expected end" error={errors.endDate?.message} className="flex-1">
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker value={field.value} onChange={field.onChange} placeholder="Expected end" />
                )}
              />
            </Field>
          </div>

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
                    <AlertDialogTitle>Delete experiment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes “{experiment?.title}” and all its measurements. This
                      action cannot be undone.
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
              {isEdit ? "Save Changes" : "Create Experiment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
