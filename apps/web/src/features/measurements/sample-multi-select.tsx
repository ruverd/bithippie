import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  disabledHint?: string;
}

export function SampleMultiSelect({
  value,
  onChange,
  options,
  disabled,
  disabledHint,
}: SampleMultiSelectProps) {
  if (disabled) {
    return (
      <p className="text-[13px] text-muted-foreground">
        {disabledHint ?? "Select an experiment first."}
      </p>
    );
  }
  if (options.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">This experiment has no samples.</p>
    );
  }
  const codeOf = (id: string) => options.find((o) => o.id === id)?.code ?? id;
  const available = options.filter((o) => !value.includes(o.id));
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2">
      {value.map((id) => (
        <Badge key={id} variant="secondary" className="gap-1">
          {codeOf(id)}
          <button
            type="button"
            aria-label={`Remove ${codeOf(id)}`}
            onClick={() => onChange(value.filter((x) => x !== id))}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {available.length > 0 && (
        <Select value="" onValueChange={(v) => v && onChange([...value, v])}>
          <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent px-1 text-[13px] text-muted-foreground shadow-none">
            <SelectValue placeholder="+ Add sample" />
          </SelectTrigger>
          <SelectContent>
            {available.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.code}
                {o.specimenType ? ` · ${o.specimenType}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
