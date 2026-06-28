import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetResearchers } from "@/generated/hooks/researchers/useGetResearchers";
import { usePatchProjectsByProjectId } from "@/generated/hooks/projects/usePatchProjectsByProjectId";
import { getProjectsQueryKey } from "@/generated/hooks/projects/useGetProjects";
import { getProjectsByProjectIdQueryKey } from "@/generated/hooks/projects/useGetProjectsByProjectId";
import { getProjectsByProjectIdResearchersQueryKey } from "@/generated/hooks/projects/useGetProjectsByProjectIdResearchers";
import type { GetProjectsByProjectIdResearchers200 } from "@/generated/types/projects/GetProjectsByProjectIdResearchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SimpleTable } from "@/components/simple-table";
import { formatRole } from "@/utils/format-role";

type Member = GetProjectsByProjectIdResearchers200[number];

export interface ProjectResearchersTabProps {
  projectId: string;
  members: Member[];
}

export function ProjectResearchersTab({ projectId, members }: ProjectResearchersTabProps) {
  const queryClient = useQueryClient();
  const researchers = useGetResearchers();
  const patch = usePatchProjectsByProjectId();
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const lead = members.find((m) => m.projectRole === "LEAD") ?? null;
  const collaboratorIds = members
    .filter((m) => m.projectRole !== "LEAD")
    .map((m) => m.researcherId);
  const memberIds = new Set(members.map((m) => m.researcherId));
  const available = (researchers.data ?? []).filter((r) => !memberIds.has(r.id));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getProjectsByProjectIdResearchersQueryKey(projectId) });
    queryClient.invalidateQueries({ queryKey: getProjectsByProjectIdQueryKey(projectId) });
    queryClient.invalidateQueries({ queryKey: getProjectsQueryKey() });
  };

  const addResearcher = (researcherId: string) => {
    patch.mutate(
      {
        projectId,
        data: {
          leadResearcherId: lead?.researcherId ?? null,
          collaboratorIds: [...collaboratorIds, researcherId],
        },
      },
      {
        onSuccess: () => {
          invalidate();
          toast.success("Researcher added");
        },
      },
    );
  };

  const removeResearcher = (member: Member) => {
    const isLead = member.projectRole === "LEAD";
    patch.mutate(
      {
        projectId,
        data: {
          leadResearcherId: isLead ? null : (lead?.researcherId ?? null),
          collaboratorIds: isLead
            ? collaboratorIds
            : collaboratorIds.filter((id) => id !== member.researcherId),
        },
      },
      {
        onSuccess: () => {
          invalidate();
          toast.success("Researcher removed");
          setPendingRemove(null);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Select
          value=""
          onValueChange={(v) => v && addResearcher(v)}
          disabled={patch.isPending || available.length === 0}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue
              placeholder={available.length === 0 ? "All researchers added" : "+ Add researcher"}
            />
          </SelectTrigger>
          <SelectContent>
            {available.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SimpleTable
        head={["Name", "Role", "Email", "Project role", ""]}
        empty={members.length === 0}
        emptyLabel="No researchers."
      >
        {members.map((m) => (
          <TableRow key={m.researcherId} className="hover:bg-muted/40">
            <TableCell className="py-3 px-4 text-sm font-medium">{m.name}</TableCell>
            <TableCell className="py-3 px-4 text-[13px]">{formatRole(m.globalRole)}</TableCell>
            <TableCell className="py-3 px-4 text-[13px] text-muted-foreground">{m.email}</TableCell>
            <TableCell className="py-3 px-4">
              <Badge variant="outline">{formatRole(m.projectRole)}</Badge>
            </TableCell>
            <TableCell className="py-3 px-4 text-right">
              <AlertDialog
                open={pendingRemove === m.researcherId}
                onOpenChange={(o) => setPendingRemove(o ? m.researcherId : null)}
              >
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${m.name}`}
                    >
                      <Trash2 />
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove researcher?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes {m.name} from this project. The researcher record is not deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      type="button"
                      variant="destructive"
                      disabled={patch.isPending}
                      onClick={() => removeResearcher(m)}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </SimpleTable>
    </div>
  );
}
