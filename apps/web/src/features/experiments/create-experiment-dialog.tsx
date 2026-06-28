import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperimentFormDialog } from "./experiment-form-dialog";

export function CreateExperimentDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        New Experiment
      </Button>
      <ExperimentFormDialog open={open} onOpenChange={setOpen} experiment={null} />
    </>
  );
}
