import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  FlaskConical,
  TestTube,
  Activity,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useCommandPalette } from "./command-palette-context";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import { ExperimentFormDialog } from "@/features/experiments/experiment-form-dialog";
import { SampleFormDialog } from "@/features/samples/sample-form-dialog";
import { ResearcherFormDialog } from "@/features/researchers/researcher-form-dialog";
import { CreateMeasurementDialog } from "@/features/measurements/create-measurement-dialog";

type CreateTarget =
  | "project"
  | "experiment"
  | "sample"
  | "measurement"
  | "researcher";

const CREATE_ITEMS: { target: CreateTarget; label: string; icon: LucideIcon }[] = [
  { target: "project", label: "New Project", icon: FolderKanban },
  { target: "experiment", label: "New Experiment", icon: FlaskConical },
  { target: "sample", label: "New Sample", icon: TestTube },
  { target: "measurement", label: "New Measurement", icon: Activity },
  { target: "researcher", label: "New Researcher", icon: Users },
];

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const [createTarget, setCreateTarget] = useState<CreateTarget | null>(null);
  const { data: projects } = useGetProjects();

  const closeCreate = (next: boolean) => {
    if (!next) setCreateTarget(null);
  };

  const runCreate = (target: CreateTarget) => {
    setOpen(false);
    queueMicrotask(() => setCreateTarget(target));
  };

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const openProject = (id: string) => {
    setOpen(false);
    navigate(`/projects/${id}`);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
        <CommandInput placeholder="Search or jump to…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          <CommandGroup heading="Create">
            {CREATE_ITEMS.map(({ target, label, icon: Icon }) => (
              <CommandItem key={target} onSelect={() => runCreate(target)}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Go to">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <CommandItem key={to} onSelect={() => go(to)}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Projects">
            {(projects ?? []).map((project) => (
              <CommandItem
                key={project.id}
                value={`${project.title} ${project.id}`}
                onSelect={() => openProject(project.id)}
              >
                <FolderKanban />
                {project.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {createTarget === "project" && (
        <ProjectFormDialog open onOpenChange={closeCreate} />
      )}
      {createTarget === "experiment" && (
        <ExperimentFormDialog open onOpenChange={closeCreate} />
      )}
      {createTarget === "sample" && (
        <SampleFormDialog open onOpenChange={closeCreate} />
      )}
      {createTarget === "researcher" && (
        <ResearcherFormDialog open onOpenChange={closeCreate} />
      )}
      {createTarget === "measurement" && (
        <CreateMeasurementDialog open onOpenChange={closeCreate} />
      )}
    </>
  );
}
