import type { ReactNode } from "react";

export function TitledCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[10px] border bg-card">
      <div className="border-b px-4 py-3.5">
        <p className="text-base font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}
