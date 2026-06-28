import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useGetMeasurementDefinitions } from "@/generated/hooks/measurementDefinitions/useGetMeasurementDefinitions";
import { useGetResearchers } from "@/generated/hooks/researchers/useGetResearchers";
import { usePatchMeasurementsByMeasurementId } from "@/generated/hooks/measurements/usePatchMeasurementsByMeasurementId";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";
import { MeasurementValueField } from "./MeasurementValueField";

type Measurement = GetMeasurements200[number];

export interface EditMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measurement: Measurement | null;
}

function initialValue(m: Measurement | null): string {
  if (!m) return "";
  if (m.valueType === "NUMERIC") return m.numericValue == null ? "" : String(m.numericValue);
  if (m.valueType === "CATEGORICAL") return m.categoricalValue ?? "";
  return m.textValue ?? "";
}

export function EditMeasurementDialog({ open, onOpenChange, measurement }: EditMeasurementDialogProps) {
  const queryClient = useQueryClient();
  const definitions = useGetMeasurementDefinitions();
  const researchers = useGetResearchers();
  const update = usePatchMeasurementsByMeasurementId();

  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [recordedById, setRecordedById] = useState("");

  useEffect(() => {
    if (!open || !measurement) return;
    setValue(initialValue(measurement));
    setUnit(measurement.unit ?? "");
    setRecordedById(measurement.recordedById ?? "");
  }, [open, measurement]);

  if (!measurement) return null;

  const def = (definitions.data ?? []).find((d) => d.id === measurement.measurementDefinitionId);
  const allowedCategories = def?.allowedCategories ?? [];

  const onSubmit = () => {
    const valuePart =
      measurement.valueType === "NUMERIC"
        ? { numericValue: value === "" ? null : Number(value) }
        : measurement.valueType === "CATEGORICAL"
          ? { categoricalValue: value || null }
          : { textValue: value || null };
    const data = {
      ...valuePart,
      ...(measurement.valueType === "NUMERIC" ? { unit: unit.trim() ? unit : null } : {}),
      recordedById: recordedById || null,
    };
    update.mutate(
      { measurementId: measurement.id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            refetchType: "all",
            predicate: (q) => {
              const k = q.queryKey?.[0] as { url?: string } | undefined;
              return typeof k?.url === "string" && k.url.includes("measurements");
            },
          });
          toast.success("Measurement updated");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Edit Measurement</DialogTitle>
            <DialogDescription>
              Update the recorded value for {measurement.definitionName}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3">
            <Field label="Definition" className="flex-1">
              <Input value={measurement.definitionName} disabled readOnly />
            </Field>
            <Field label="Experiment" className="flex-1">
              <Input value={measurement.experimentName} disabled readOnly />
            </Field>
          </div>

          <div className="flex gap-3">
            <Field label="Value" className="flex-1">
              <MeasurementValueField
                valueType={measurement.valueType}
                allowedCategories={allowedCategories}
                value={value}
                onChange={setValue}
              />
            </Field>
            {measurement.valueType === "NUMERIC" && (
              <Field label="Unit" className="flex-1">
                <Input placeholder="e.g. mg/mL" value={unit} onChange={(e) => setUnit(e.target.value)} />
              </Field>
            )}
          </div>

          <Field label="Recorded by">
            <Select
              items={Object.fromEntries((researchers.data ?? []).map((r) => [r.id, r.name]))}
              value={recordedById || undefined}
              onValueChange={(v) => setRecordedById(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select researcher" />
              </SelectTrigger>
              <SelectContent>
                {(researchers.data ?? []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={update.isPending || value === ""}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
