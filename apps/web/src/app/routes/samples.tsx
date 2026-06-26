import { useGetSamples } from "@/generated/hooks/samplesController/useGetSamples";

export function SamplesPage() {
  const { data, isLoading, isError } = useGetSamples();
  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p role="alert">Failed to load samples.</p>;
  if (!data || data.length === 0) return <p>No samples.</p>;
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
}
