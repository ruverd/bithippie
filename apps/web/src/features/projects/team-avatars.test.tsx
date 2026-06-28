import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { titleInitials } from "@/utils/initials";
import { TeamAvatars } from "./team-avatars";

describe("TeamAvatars", () => {
  it("should render one avatar fallback per initial returned by titleInitials", () => {
    const title = "Microbiome Diet Study";
    const expected = titleInitials(title);

    renderWithProviders(<TeamAvatars title={title} />);

    expect(expected).toEqual(["M", "D", "S"]);
    for (const initial of expected) {
      expect(screen.getByText(initial)).toBeInTheDocument();
    }
  });

  it("should cap the initials at three for a longer title", () => {
    const title = "Deep Sea Coral Reef Survey";
    const expected = titleInitials(title);

    renderWithProviders(<TeamAvatars title={title} />);

    expect(expected).toHaveLength(3);
    expect(expected).toEqual(["D", "S", "C"]);
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("should render a single fallback for a one-word title", () => {
    renderWithProviders(<TeamAvatars title="Genomics" />);

    expect(titleInitials("Genomics")).toEqual(["G"]);
    expect(screen.getByText("G")).toBeInTheDocument();
  });
});
