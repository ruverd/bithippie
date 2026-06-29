import { useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/form-field";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import { usePostResearchers } from "@/generated/hooks/researchers/usePostResearchers";
import { usePatchResearchersByResearcherId } from "@/generated/hooks/researchers/usePatchResearchersByResearcherId";
import { getResearchersQueryKey } from "@/generated/hooks/researchers/useGetResearchers";
import type { GetResearchers200 } from "@/generated/types/researchers/GetResearchers";
import { formatRole } from "@/utils/format-role";
import { RESEARCHER_ROLES } from "../constants";

type Researcher = GetResearchers200[number];

const PROJECT_ROLES = ["LEAD", "COLLABORATOR", "CONTRIBUTOR"] as const;

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  globalRole: z.enum(RESEARCHER_ROLES),
  projectId: z.string().optional(),
  projectRole: z.enum(PROJECT_ROLES).optional(),
});

type FormValues = z.infer<typeof schema>;

export interface ResearcherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  researcher?: Researcher | null;
}

export function ResearcherFormDialog({ open, onOpenChange, researcher }: ResearcherFormDialogProps) {
  const isEdit = Boolean(researcher);
  const queryClient = useQueryClient();
  const projects = useGetProjects();
  const create = usePostResearchers();
  const update = usePatchResearchersByResearcherId();
  const pending = create.isPending || update.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      researcher
        ? {
            name: researcher.name,
            email: researcher.email,
            globalRole: researcher.globalRole as FormValues["globalRole"],
          }
        : { name: "", email: "" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, researcher]);

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getResearchersQueryKey() });
      toast.success(researcher ? "Researcher updated" : "Researcher created");
      onOpenChange(false);
    };
    if (researcher) {
      update.mutate(
        {
          researcherId: researcher.id,
          data: { name: values.name, email: values.email, globalRole: values.globalRole },
        },
        { onSuccess },
      );
    } else {
      create.mutate(
        {
          data: {
            name: values.name,
            email: values.email,
            globalRole: values.globalRole,
            projectId: values.projectId || undefined,
            projectRole: values.projectRole || undefined,
          },
        },
        { onSuccess },
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Researcher" : "New Researcher"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this lab member's details."
                : "Add a lab member and assign their access."}
            </DialogDescription>
          </DialogHeader>

          <Field label="Full name" required error={errors.name?.message}>
            <Input placeholder="Full name" {...register("name")} />
          </Field>

          <Field label="Email" required error={errors.email?.message}>
            <Input type="email" placeholder="name@lab.org" {...register("email")} />
          </Field>

          <Field label="Global role" required error={errors.globalRole?.message}>
            <Controller
              control={control}
              name="globalRole"
              render={({ field }) => (
                <Select items={Object.fromEntries(RESEARCHER_ROLES.map((role) => [role, formatRole(role)]))} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESEARCHER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {formatRole(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {!isEdit && (
            <div className="flex gap-3">
              <Field label="Assign to project" error={errors.projectId?.message} className="flex-1">
                <Controller
                  control={control}
                  name="projectId"
                  render={({ field }) => (
                    <Select
                      items={Object.fromEntries((projects.data ?? []).map((project) => [project.id, project.title]))}
                      value={field.value || undefined}
                      onValueChange={(v) => field.onChange(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {(projects.data ?? []).map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field label="Project role" error={errors.projectRole?.message} className="flex-1">
                <Controller
                  control={control}
                  name="projectRole"
                  render={({ field }) => (
                    <Select
                      items={Object.fromEntries(PROJECT_ROLES.map((role) => [role, formatRole(role)]))}
                      value={field.value || undefined}
                      onValueChange={(v) => field.onChange(v ?? "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {formatRole(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={pending}>
              {isEdit ? "Save Changes" : "Create Researcher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
