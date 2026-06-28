import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ChipOption {
  id: string;
  label: string;
}

export interface ChipMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  options: ChipOption[];
  addPlaceholder?: string;
}

/**
 * A bordered box of removable chips plus a borderless "+ Add" select of the
 * remaining options. Used for any "pick several from a list" field.
 */
export function ChipMultiSelect({
  value,
  onChange,
  options,
  addPlaceholder = "+ Add",
}: ChipMultiSelectProps) {
  const labelOf = (id: string) => options.find((o) => o.id === id)?.label ?? id;
  const available = options.filter((o) => !value.includes(o.id));
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2">
      {value.map((id) => (
        <Badge key={id} variant="secondary" className="gap-1">
          {labelOf(id)}
          <button
            type="button"
            aria-label={`Remove ${labelOf(id)}`}
            onClick={() => onChange(value.filter((x) => x !== id))}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {available.length > 0 && (
        <Select value="" onValueChange={(v) => v && onChange([...value, v])}>
          <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent px-1 text-[13px] text-muted-foreground shadow-none">
            <SelectValue placeholder={addPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {available.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
