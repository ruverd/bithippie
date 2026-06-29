import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

describe("useIsMobile", () => {
  it("should report true below the mobile breakpoint", () => {
    setWidth(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should report false at or above the mobile breakpoint", () => {
    setWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should update when the media query changes", () => {
    let handler: () => void = () => {};
    const mql = {
      matches: false,
      media: "",
      onchange: null,
      addEventListener: (_: string, cb: () => void) => {
        handler = cb;
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
    const spy = vi
      .spyOn(window, "matchMedia")
      .mockReturnValue(mql as unknown as MediaQueryList);

    setWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    setWidth(500);
    act(() => handler());
    expect(result.current).toBe(true);

    spy.mockRestore();
  });
});
