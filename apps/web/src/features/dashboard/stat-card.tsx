import { TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta: string;
}

export function StatCard({ label, value, icon: Icon, delta }: StatCardProps) {
  return (
    <Card className="flex-1 rounded-xl bg-card">
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent">
            <Icon size={16} className="text-brand-olive-dark" />
          </div>
        </div>
        <span className="text-3xl font-bold">{value}</span>
        <div className="flex items-center gap-1">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-xs text-muted-foreground">{delta}</span>
        </div>
      </CardContent>
    </Card>
  );
}
