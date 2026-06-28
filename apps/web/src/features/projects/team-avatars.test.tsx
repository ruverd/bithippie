import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { TeamAvatars } from "./team-avatars";

describe("TeamAvatars", () => {
  it("should render a dash when there are no members", () => {
    renderWithProviders(<TeamAvatars members={[]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("should render initials for each member", () => {
    renderWithProviders(
      <TeamAvatars
        members={[
          { name: "Ada Lovelace", projectRole: "LEAD" },
          { name: "Grace Hopper", projectRole: "COLLABORATOR" },
        ]}
      />,
    );
    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByText("GH")).toBeInTheDocument();
  });

  it("should cap visible avatars at four and show an overflow count", () => {
    const members = ["Aa Bb", "Cc Dd", "Ee Ff", "Gg Hh", "Ii Jj", "Kk Ll"].map((name) => ({
      name,
      projectRole: "COLLABORATOR",
    }));
    renderWithProviders(<TeamAvatars members={members} />);
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});
