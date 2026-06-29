import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./form-field";

describe("Field", () => {
  it("should render the label and its children", () => {
    render(
      <Field label="Name">
        <input aria-label="name-input" />
      </Field>,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("name-input")).toBeInTheDocument();
  });

  it("should mark required fields with an asterisk", () => {
    render(
      <Field label="Name" required>
        <input />
      </Field>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should render the error message when provided", () => {
    render(
      <Field label="Name" error="Required">
        <input />
      </Field>,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("should associate the label with a control via htmlFor", () => {
    render(
      <Field label="Email" htmlFor="email">
        <input id="email" />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
