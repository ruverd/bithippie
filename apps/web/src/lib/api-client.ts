import { getConfig, mergeConfig, setConfig } from "@kubb/plugin-client/clients/fetch";
import type {
  Client,
  RequestConfig,
  ResponseConfig,
  ResponseErrorConfig,
} from "@kubb/plugin-client/clients/fetch";

setConfig({ baseURL: import.meta.env.VITE_API_URL ?? "/api" });

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly response: Response;
  constructor(status: number, data: unknown, response: Response) {
    super(`Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.response = response;
  }
}

/**
 * Custom Kubb fetch client. Unlike the bundled client it (1) sends a JSON
 * `Content-Type` header so the API parses the body as an object, and (2) throws
 * on non-2xx responses so React Query routes them to `onError` instead of
 * reporting a failed write as a success.
 */
const client = (async (paramsConfig: RequestConfig) => {
  const config = mergeConfig(getConfig(), paramsConfig);

  const search = new URLSearchParams();
  Object.entries((config.params as Record<string, unknown> | undefined) ?? {}).forEach(
    ([key, value]) => {
      if (value !== undefined) search.append(key, value === null ? "null" : String(value));
    },
  );
  let url = [config.baseURL, config.url].filter(Boolean).join("");
  if (config.params) url += `?${search}`;

  const isFormData = config.data instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(Array.isArray(config.headers) ? Object.fromEntries(config.headers) : config.headers),
  };

  const response = await fetch(url, {
    method: config.method?.toUpperCase(),
    credentials: config.credentials ?? "same-origin",
    signal: config.signal,
    headers,
    body:
      config.data == null
        ? undefined
        : isFormData
          ? (config.data as FormData)
          : JSON.stringify(config.data),
  });

  const data =
    [204, 205, 304].includes(response.status) || !response.body ? {} : await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data, response);
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
}) as Client;

export default client;
export { setConfig };
export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig };
