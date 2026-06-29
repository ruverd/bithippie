import { describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import { invalidateByUrl } from "./invalidate-queries";

function query(url?: unknown) {
  return { queryKey: url === undefined ? [undefined] : [{ url }] };
}

describe("invalidateByUrl", () => {
  it("should invalidate with refetchType all and a url-fragment predicate", () => {
    const invalidateQueries = vi.fn();
    const queryClient = { invalidateQueries } as unknown as QueryClient;

    invalidateByUrl(queryClient, "/projects", "/experiments");

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    const arg = invalidateQueries.mock.calls[0]![0];
    expect(arg.refetchType).toBe("all");

    const predicate = arg.predicate as (q: unknown) => boolean;
    expect(predicate(query("/api/projects/1"))).toBe(true);
    expect(predicate(query("/api/experiments"))).toBe(true);
    expect(predicate(query("/api/samples"))).toBe(false);
  });

  it("should not match when the key has no url string", () => {
    const invalidateQueries = vi.fn();
    const queryClient = { invalidateQueries } as unknown as QueryClient;

    invalidateByUrl(queryClient, "/projects");
    const predicate = invalidateQueries.mock.calls[0]![0].predicate as (q: unknown) => boolean;

    expect(predicate(query(undefined))).toBe(false);
    expect(predicate({ queryKey: [] })).toBe(false);
    expect(predicate(query(123))).toBe(false);
  });
});
