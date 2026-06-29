import { useParams } from "react-router-dom";
import { useGetSamplesBySampleId } from "@/generated/hooks/samples/useGetSamplesBySampleId";

export function SampleDetailPage() {
  const { sampleId = "" } = useParams();
  const { data, isLoading, isError } = useGetSamplesBySampleId(sampleId);
  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p role="alert">Failed to load sample.</p>;
  if (!data) return <p>No sample found.</p>;
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
}
