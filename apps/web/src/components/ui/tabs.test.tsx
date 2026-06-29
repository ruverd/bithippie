import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function Example() {
  return (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
      <TabsContent value="two">Second panel</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("should show the default tab panel", () => {
    render(<Example />);
    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.queryByText("Second panel")).not.toBeInTheDocument();
  });

  it("should switch panels when another tab is selected", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByText("Second panel")).toBeInTheDocument();
  });
});
