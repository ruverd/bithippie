import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useGetResearchers } from "@/generated/hooks/researchers/useGetResearchers";
import { usePostProjects } from "@/generated/hooks/projects/usePostProjects";
import { usePatchProjectsByProjectId } from "@/generated/hooks/projects/usePatchProjectsByProjectId";
import { getProjectsQueryKey } from "@/generated/hooks/projects/useGetProjects";
import { getProjectsByProjectIdQueryKey } from "@/generated/hooks/projects/useGetProjectsByProjectId";
import {
  Dialog,
  DialogContent,
  DialogClose,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/form-field";

const STATUSES = ["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
const STATUS_LABELS: Record<string, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const schema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  status: z.enum(STATUSES).optional(),
  leadResearcherId: z.string().optional(),
  collaboratorIds: z.array(z.string()).optional(),
});
type Values = z.infer<typeof schema>;

export interface ProjectFormDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  projectId?: string;
  initial?: Partial<Values>;
}

export function ProjectFormDialog({
  trigger,
  open: openProp,
  onOpenChange,
  projectId,
  initial,
}: ProjectFormDialogProps) {
  const isEdit = Boolean(projectId);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const queryClient = useQueryClient();
  const researchers = useGetResearchers();
  const create = usePostProjects();
  const update = usePatchProjectsByProjectId();
  const pending = create.isPending || update.isPending;

  const defaults: Values = {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    status: initial?.status,
    leadResearcherId: initial?.leadResearcherId,
    collaboratorIds: initial?.collaboratorIds ?? [],
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (open) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const researcherList = researchers.data ?? [];
  const researcherItems: Record<string, string> = Object.fromEntries(
    researcherList.map((r) => [r.id, r.name]),
  );
  const nameOf = (id: string) => researcherList.find((r) => r.id === id)?.name ?? id;
  const leadId = watch("leadResearcherId");

  const onSubmit = handleSubmit((values) => {
    const data = {
      title: values.title,
      description: values.description?.trim() ? values.description : null,
      status: values.status ?? null,
      leadResearcherId: values.leadResearcherId || null,
      collaboratorIds: values.collaboratorIds ?? [],
    };
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getProjectsQueryKey() });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: getProjectsByProjectIdQueryKey(projectId) });
      }
      toast.success(projectId ? "Project updated" : "Project created");
      setOpen(false);
    };
    if (projectId) update.mutate({ projectId, data }, { onSuccess });
    else create.mutate({ data }, { onSuccess });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Project" : "New Project"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this project's details and team."
                : "Create a new research project and assign a lead."}
            </DialogDescription>
          </DialogHeader>

          <Field label="Project title" htmlFor="project-title" required error={errors.title?.message}>
            <Input id="project-title" placeholder="Microbiome Response to Diet" {...register("title")} />
          </Field>

          <Field label="Description" htmlFor="project-desc">
            <Textarea
              id="project-desc"
              className="resize-none"
              placeholder="Summarize the goals and scope…"
              {...register("description")}
            />
          </Field>

          <div className="flex gap-3">
            <Field label="Status" className="flex-1">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select items={STATUS_LABELS} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Lead researcher" className="flex-1">
              <Controller
                control={control}
                name="leadResearcherId"
                render={({ field }) => (
                  <Select items={researcherItems} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {researcherList.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field label="Collaborators">
            <Controller
              control={control}
              name="collaboratorIds"
              render={({ field }) => {
                const selected = field.value ?? [];
                const available = researcherList.filter(
                  (r) => !selected.includes(r.id) && r.id !== leadId,
                );
                return (
                  <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2">
                    {selected.map((id) => (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {nameOf(id)}
                        <button
                          type="button"
                          aria-label={`Remove ${nameOf(id)}`}
                          onClick={() => field.onChange(selected.filter((x) => x !== id))}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    {available.length > 0 && (
                      <Select value="" onValueChange={(v) => v && field.onChange([...selected, v])}>
                        <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent px-1 text-[13px] text-muted-foreground shadow-none">
                          <SelectValue placeholder="+ Add" />
                        </SelectTrigger>
                        <SelectContent>
                          {available.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              }}
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={pending}>
              {isEdit ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
