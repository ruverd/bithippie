import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectFormDialog } from "./project-form-dialog";

vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => ({ data: [] }),
}));

function wrap(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("ProjectFormDialog (controlled)", () => {
  it("shows the create form when open is true and no trigger is given", () => {
    wrap(<ProjectFormDialog open onOpenChange={() => {}} />);
    expect(
      screen.getByText("Create a new research project and assign a lead."),
    ).toBeInTheDocument();
  });

  it("stays closed when open is false", () => {
    wrap(<ProjectFormDialog open={false} onOpenChange={() => {}} />);
    expect(
      screen.queryByText("Create a new research project and assign a lead."),
    ).not.toBeInTheDocument();
  });
});
