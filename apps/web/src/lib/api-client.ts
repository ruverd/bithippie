import { setConfig } from "@kubb/plugin-client/clients/fetch";

setConfig({ baseURL: import.meta.env.VITE_API_URL ?? "/api" });
