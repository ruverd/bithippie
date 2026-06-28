import { ChipMultiSelect } from "@/components/chip-multi-select";

export interface SampleOption {
  id: string;
  code: string;
  specimenType?: string | null;
}

export interface SampleMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  options: SampleOption[];
  disabled?: boolean;
}

export function SampleMultiSelect({ value, onChange, options, disabled }: SampleMultiSelectProps) {
  if (disabled) {
    return <p className="text-[13px] text-muted-foreground">Select an experiment first.</p>;
  }
  if (options.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">This experiment has no samples.</p>
    );
  }
  return (
    <ChipMultiSelect
      value={value}
      onChange={onChange}
      options={options.map((s) => ({ id: s.id, label: s.code }))}
      addPlaceholder="+ Add sample"
    />
  );
}
