import { Link, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useGetProjectsByProjectId } from "@/generated/hooks/projects/useGetProjectsByProjectId";
import { useGetProjectsByProjectIdResearchers } from "@/generated/hooks/projects/useGetProjectsByProjectIdResearchers";
import { useGetProjectsByProjectIdExperiments } from "@/generated/hooks/projects/useGetProjectsByProjectIdExperiments";
import { useGetProjectsByProjectIdSamples } from "@/generated/hooks/projects/useGetProjectsByProjectIdSamples";
import { useGetProjectsByProjectIdMeasurements } from "@/generated/hooks/projects/useGetProjectsByProjectIdMeasurements";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import { CreateExperimentDialog } from "@/features/experiments/create-experiment-dialog";
import { formatDate } from "@/utils/format-date";
import { initials } from "@/utils/initials";
import { formatRole } from "@/utils/format-role";
import { measurementValue } from "@/utils/measurement-value";
import { TitledCard } from "@/components/titled-card";
import { MetaChip } from "@/components/meta-chip";
import { Empty } from "@/components/empty";
import { SimpleTable } from "@/components/simple-table";

export function ProjectDetailPage() {
  const { projectId = "" } = useParams();
  const project = useGetProjectsByProjectId(projectId);
  const members = useGetProjectsByProjectIdResearchers(projectId);
  const experiments = useGetProjectsByProjectIdExperiments(projectId);
  const samples = useGetProjectsByProjectIdSamples(projectId);
  const measurements = useGetProjectsByProjectIdMeasurements(projectId);

  if (project.isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (project.isError || !project.data)
    return (
      <div className="p-8 text-sm text-muted-foreground" role="alert">
        Failed to load project.
      </div>
    );

  const p = project.data;
  const memberList = members.data ?? [];
  const lead = memberList.find((m) => m.projectRole === "LEAD");
  const editInitial = {
    title: p.title,
    description: p.description ?? "",
    status: (p.status ?? undefined) as "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | undefined,
    leadResearcherId: lead?.researcherId,
    collaboratorIds: memberList.filter((m) => m.projectRole !== "LEAD").map((m) => m.researcherId),
  };
  const exps = experiments.data ?? [];
  const sampleRows = samples.data ?? [];
  const recentMeasurements = (measurements.data ?? []).slice(0, 5);

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold leading-tight">{p.title}</h1>
            {p.status ? <StatusBadge status={p.status} /> : null}
          </div>
          {p.description ? (
            <p className="max-w-[640px] text-sm text-muted-foreground">{p.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2.5">
          <ProjectFormDialog
            projectId={projectId}
            initial={editInitial}
            trigger={
              <Button variant="outline">
                <Pencil size={15} />
                Edit
              </Button>
            }
          />
          <CreateExperimentDialog />
        </div>
      </div>

      <div className="flex gap-4">
        <MetaChip label="Status" value={p.status ? formatRole(p.status) : "—"} />
        <MetaChip label="Created" value={formatDate(p.createdAt)} />
        <MetaChip label="Lead" value={p.leadName ?? "—"} />
        <MetaChip label="Experiments" value={String(p.experimentCount)} />
      </div>

      <Tabs defaultValue="overview" className="gap-5">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="researchers">Researchers</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex gap-5">
          <div className="flex flex-1 flex-col gap-5">
            <TitledCard title="Experiments">
              {exps.length === 0 ? (
                <Empty>No experiments.</Empty>
              ) : (
                exps.slice(0, 6).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                  >
                    <Link to={`/experiments/${e.id}`} className="text-sm font-medium hover:underline">
                      {e.title}
                    </Link>
                    {e.status ? <StatusBadge status={e.status} /> : null}
                  </div>
                ))
              )}
            </TitledCard>
            <TitledCard title="Recent Measurements">
              {recentMeasurements.length === 0 ? (
                <Empty>No measurements.</Empty>
              ) : (
                recentMeasurements.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{m.definitionName}</span>
                      <span className="text-xs text-muted-foreground">{m.experimentName}</span>
                    </div>
                    <span className="text-sm font-semibold">{measurementValue(m)}</span>
                  </div>
                ))
              )}
            </TitledCard>
          </div>

          <div className="flex w-[360px] shrink-0 flex-col gap-5">
            <TitledCard title="Research Team">
              {memberList.length === 0 ? (
                <Empty>No members.</Empty>
              ) : (
                memberList.map((m) => (
                  <div
                    key={m.researcherId}
                    className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                  >
                    <Avatar className="size-9 bg-muted">
                      <AvatarFallback className="bg-muted text-xs font-semibold">
                        {initials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{m.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{m.email}</span>
                    </div>
                    <Badge variant="outline">{formatRole(m.projectRole)}</Badge>
                  </div>
                ))
              )}
            </TitledCard>
            <TitledCard title="Samples">
              {sampleRows.length === 0 ? (
                <Empty>No samples.</Empty>
              ) : (
                sampleRows.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                  >
                    <span className="w-[84px] shrink-0 text-sm font-semibold">{s.code}</span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {s.specimenType}
                    </span>
                  </div>
                ))
              )}
            </TitledCard>
          </div>
        </TabsContent>

        <TabsContent value="experiments">
          <SimpleTable
            head={["Name", "Status", "Follow-up of"]}
            empty={exps.length === 0}
            emptyLabel="No experiments."
          >
            {exps.map((e) => (
              <TableRow key={e.id} className="hover:bg-muted/40">
                <TableCell className="py-3 px-4">
                  <Link to={`/experiments/${e.id}`} className="text-sm font-medium hover:underline">
                    {e.title}
                  </Link>
                </TableCell>
                <TableCell className="py-3 px-4">
                  {e.status ? <StatusBadge status={e.status} /> : "—"}
                </TableCell>
                <TableCell className="py-3 px-4 text-[13px] text-muted-foreground">
                  {e.previousExperimentId ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </SimpleTable>
        </TabsContent>

        <TabsContent value="researchers">
          <SimpleTable
            head={["Name", "Role", "Email", "Project role"]}
            empty={memberList.length === 0}
            emptyLabel="No researchers."
          >
            {memberList.map((m) => (
              <TableRow key={m.researcherId} className="hover:bg-muted/40">
                <TableCell className="py-3 px-4 text-sm font-medium">{m.name}</TableCell>
                <TableCell className="py-3 px-4 text-[13px]">{formatRole(m.globalRole)}</TableCell>
                <TableCell className="py-3 px-4 text-[13px] text-muted-foreground">
                  {m.email}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Badge variant="outline">{formatRole(m.projectRole)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </SimpleTable>
        </TabsContent>

        <TabsContent value="samples">
          <SimpleTable
            head={["Code", "Specimen type", "Collected", "Storage"]}
            empty={sampleRows.length === 0}
            emptyLabel="No samples."
          >
            {sampleRows.map((s) => (
              <TableRow key={s.id} className="hover:bg-muted/40">
                <TableCell className="py-3 px-4">
                  <Link to={`/samples/${s.id}`} className="text-sm font-semibold hover:underline">
                    {s.code}
                  </Link>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm">{s.specimenType}</TableCell>
                <TableCell className="py-3 px-4 text-[13px] text-muted-foreground">
                  {formatDate(s.collectedAt)}
                </TableCell>
                <TableCell className="py-3 px-4 text-[13px]">{s.storageLocation ?? "—"}</TableCell>
              </TableRow>
            ))}
          </SimpleTable>
        </TabsContent>
      </Tabs>
    </div>
  );
}
