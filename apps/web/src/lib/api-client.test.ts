import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import client, { ApiError } from "./api-client";

function mockResponse(overrides: Partial<{
  ok: boolean;
  status: number;
  statusText: string;
  body: unknown;
  json: unknown;
}> = {}) {
  const { ok = true, status = 200, statusText = "OK", body = {}, json = {} } = overrides;
  return {
    ok,
    status,
    statusText,
    body,
    headers: new Headers(),
    json: async () => json,
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(mockResponse({ json: { id: "p1" } }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api-client", () => {
  it("should build the url from baseURL and path and send JSON headers", async () => {
    const res = await client({ method: "GET", url: "/projects" });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/projects");
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("same-origin");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(res.data).toEqual({ id: "p1" });
    expect(res.status).toBe(200);
  });

  it("should append defined params as a query string and skip undefined", async () => {
    await client({ method: "GET", url: "/projects", params: { a: 1, b: undefined, c: null } });

    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/projects?a=1&c=null");
  });

  it("should JSON-stringify a non-FormData body", async () => {
    await client({ method: "POST", url: "/projects", data: { title: "Soil" } });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ title: "Soil" }));
  });

  it("should pass FormData through without a Content-Type header", async () => {
    const form = new FormData();
    form.append("file", "x");
    await client({ method: "POST", url: "/upload", data: form });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("should merge array-form headers", async () => {
    await client({ method: "GET", url: "/projects", headers: [["X-Trace", "abc"]] });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.headers["X-Trace"]).toBe("abc");
  });

  it("should not parse a body for a 204 response", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ status: 204, body: null }));
    const res = await client({ method: "DELETE", url: "/projects/p1" });
    expect(res.data).toEqual({});
    expect(res.status).toBe(204);
  });

  it("should throw an ApiError on a non-2xx response", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ ok: false, status: 422, statusText: "Unprocessable", json: { message: "bad" } }),
    );

    await expect(client({ method: "POST", url: "/projects", data: {} })).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      data: { message: "bad" },
    });
    await expect(client({ method: "POST", url: "/projects", data: {} })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
