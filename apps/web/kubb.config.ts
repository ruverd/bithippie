import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import { pluginClient } from "@kubb/plugin-client";
import { pluginReactQuery } from "@kubb/plugin-react-query";

export default defineConfig({
  root: ".",
  input: { path: "../api/openapi.json" },
  output: { path: "./src/generated", clean: true },
  plugins: [
    pluginOas(),
    pluginTs({ output: { path: "types" }, group: { type: "tag" } }),
    pluginZod({ output: { path: "zod" }, group: { type: "tag" } }),
    pluginClient({
      output: { path: "clients" },
      group: { type: "tag" },
      client: "fetch",
    }),
    pluginReactQuery({
      output: { path: "hooks" },
      group: { type: "tag" },
      client: { client: "fetch" },
      parser: "zod",
    }),
  ],
});
