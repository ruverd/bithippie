import { useParams } from "react-router-dom";
import { useGetExperimentsByExperimentId } from "@/generated/hooks/experiments/useGetExperimentsByExperimentId";
import { useGetExperimentsByExperimentIdMeasurements } from "@/generated/hooks/experiments/useGetExperimentsByExperimentIdMeasurements";
import { useGetExperimentsByExperimentIdSamples } from "@/generated/hooks/experiments/useGetExperimentsByExperimentIdSamples";
import { CreateMeasurementForm } from "@/features/measurements/create-measurement-form";

export function ExperimentDetailPage() {
  const { experimentId = "" } = useParams();
  const experiment = useGetExperimentsByExperimentId(experimentId);
  const measurements = useGetExperimentsByExperimentIdMeasurements(experimentId);
  const samples = useGetExperimentsByExperimentIdSamples(experimentId);
  if (experiment.isLoading) return <p>Loading…</p>;
  if (experiment.isError) return <p role="alert">Failed to load experiment.</p>;
  return (
    <div className="flex flex-col gap-4 text-xs">
      <pre>{JSON.stringify(experiment.data, null, 2)}</pre>
      <pre>{JSON.stringify(measurements.data ?? [], null, 2)}</pre>
      <pre>{JSON.stringify(samples.data ?? [], null, 2)}</pre>
      <CreateMeasurementForm experimentId={experimentId} />
    </div>
  );
}
