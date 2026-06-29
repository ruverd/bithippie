import { useGetMeasurementDefinitions } from "@/generated/hooks/measurementDefinitions/useGetMeasurementDefinitions";

export function MeasurementDefinitionsPage() {
  const { data, isLoading, isError } = useGetMeasurementDefinitions();
  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p role="alert">Failed to load measurement definitions.</p>;
  if (!data || data.length === 0) return <p>No measurement definitions.</p>;
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
}
