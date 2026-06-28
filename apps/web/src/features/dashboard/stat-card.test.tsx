import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Activity } from "lucide-react";
import { renderWithProviders } from "@/test/render";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("should render the label and value", () => {
    renderWithProviders(<StatCard label="Active Projects" value="12" icon={Activity} />);
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("should render the delta when provided", () => {
    renderWithProviders(
      <StatCard label="Measurements" value="340" icon={Activity} delta="+12% this month" />,
    );
    expect(screen.getByText("+12% this month")).toBeInTheDocument();
  });

  it("should not render a delta when none is provided", () => {
    renderWithProviders(<StatCard label="Samples" value="7" icon={Activity} />);
    expect(screen.queryByText(/this month/i)).not.toBeInTheDocument();
  });
});
