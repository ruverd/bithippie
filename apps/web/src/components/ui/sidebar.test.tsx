import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";

describe("Sidebar", () => {
  it("should renders its content within a provider", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Navigation</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  it("should toggles the open state from the trigger", async () => {
    const onOpenChange = vi.fn();
    render(
      <SidebarProvider open onOpenChange={onOpenChange}>
        <SidebarTrigger />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
