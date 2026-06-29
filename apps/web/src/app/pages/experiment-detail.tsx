import { Link, useParams } from "react-router-dom";
import { useGetExperimentsByExperimentId } from "@/generated/hooks/experiments/useGetExperimentsByExperimentId";
import { useGetExperimentsByExperimentIdMeasurements } from "@/generated/hooks/experiments/useGetExperimentsByExperimentIdMeasurements";
import { useGetExperimentsByExperimentIdSamples } from "@/generated/hooks/experiments/useGetExperimentsByExperimentIdSamples";
import { useGetProjectsByProjectId } from "@/generated/hooks/projects/useGetProjectsByProjectId";
import { useGetProjectsByProjectIdExperiments } from "@/generated/hooks/projects/useGetProjectsByProjectIdExperiments";
import { StatusBadge } from "@/components/status-badge";
import { MetaChip } from "@/components/meta-chip";
import { TitledCard } from "@/components/titled-card";
import { SimpleTable } from "@/components/simple-table";
import { Empty } from "@/components/empty";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utils/format-date";
import { measurementValue } from "@/utils/measurement-value";
import { CreateMeasurementForm } from "@/features/measurements/components/create-measurement-form";

export function ExperimentDetailPage() {
  const { experimentId = "" } = useParams();
  const experiment = useGetExperimentsByExperimentId(experimentId);
  const measurements = useGetExperimentsByExperimentIdMeasurements(experimentId);
  const samples = useGetExperimentsByExperimentIdSamples(experimentId);
  const projectId = experiment.data?.projectId ?? "";
  const project = useGetProjectsByProjectId(projectId, {
    query: { enabled: Boolean(projectId) },
  });
  const projectExperiments = useGetProjectsByProjectIdExperiments(projectId, {
    query: { enabled: Boolean(projectId) },
  });

  if (experiment.isLoading)
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (experiment.isError || !experiment.data)
    return (
      <div className="p-8 text-sm text-muted-foreground" role="alert">
        Failed to load experiment.
      </div>
    );

  const e = experiment.data;
  const experimentList = projectExperiments.data ?? [];
  const previous = e.previousExperimentId
    ? experimentList.find((x) => x.id === e.previousExperimentId)
    : undefined;
  const followUps = experimentList.filter((x) => x.previousExperimentId === e.id);
  const measurementRows = measurements.data ?? [];
  const sampleRows = samples.data ?? [];

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] font-bold leading-tight">{e.title}</h1>
          {e.status ? <StatusBadge status={e.status} /> : null}
        </div>
        {project.data ? (
          <Link
            to={`/projects/${e.projectId}`}
            className="w-fit text-sm text-primary hover:underline"
          >
            {project.data.title}
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-4">
        <MetaChip label="Start date" value={formatDate(e.startDate)} />
        <MetaChip label="End date" value={formatDate(e.endDate)} />
        <MetaChip
          label="Follow-up of"
          value={previous?.title ?? e.previousExperimentId ?? "—"}
        />
        <MetaChip label="Measurements" value={String(measurementRows.length)} />
      </div>

      {e.hypothesis ? (
        <TitledCard title="Hypothesis">
          <p className="px-4 py-3.5 text-sm text-muted-foreground">{e.hypothesis}</p>
        </TitledCard>
      ) : null}

      <div className="flex gap-5">
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-base font-semibold">Measurements</p>
            <SimpleTable
              head={["Definition", "Value", "Recorded", "Notes"]}
              empty={measurementRows.length === 0}
              emptyLabel="No measurements yet."
            >
              {measurementRows.map((m) => (
                <TableRow key={m.id} className="hover:bg-muted/40">
                  <TableCell className="py-3 px-4 text-sm font-medium">
                    {m.definitionName}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm font-semibold">
                    {measurementValue(m)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[13px] text-muted-foreground">
                    {formatDate(m.recordedAt)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[13px] text-muted-foreground">
                    {m.notes ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </SimpleTable>
          </div>

          <TitledCard title="Record a measurement">
            <div className="px-4 py-3.5">
              <CreateMeasurementForm experimentId={experimentId} />
            </div>
          </TitledCard>
        </div>

        <div className="flex w-[360px] shrink-0 flex-col gap-5">
          <TitledCard title="Samples">
            {sampleRows.length === 0 ? (
              <Empty>No samples linked.</Empty>
            ) : (
              sampleRows.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                >
                  <Link
                    to={`/samples/${s.id}`}
                    className="w-[96px] shrink-0 text-sm font-semibold hover:underline"
                  >
                    {s.code}
                  </Link>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {s.specimenType}
                  </span>
                </div>
              ))
            )}
          </TitledCard>

          <TitledCard title="Follow-up experiments">
            {followUps.length === 0 ? (
              <Empty>No follow-ups.</Empty>
            ) : (
              followUps.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                >
                  <Link
                    to={`/experiments/${f.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {f.title}
                  </Link>
                  {f.status ? <StatusBadge status={f.status} /> : null}
                </div>
              ))
            )}
          </TitledCard>
        </div>
      </div>
    </div>
  );
}
