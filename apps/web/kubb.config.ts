import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import { pluginReactQuery } from "@kubb/plugin-react-query";

// Group by tag, but use the bare tag (camelCased) as the folder name instead of
// Kubb's default `<tag>Controller`. e.g. "Experiments" -> "experiments".
const group = {
  type: "tag" as const,
  name: ({ group }: { group: string }) => group.charAt(0).toLowerCase() + group.slice(1),
};

export default defineConfig({
  root: ".",
  input: { path: "../api/openapi.json" },
  output: { path: "./src/generated", clean: true },
  plugins: [
    pluginOas(),
    pluginTs({ output: { path: "types" }, group }),
    pluginClient({
      output: { path: "clients" },
      group,
      client: "fetch",
    }),
    pluginReactQuery({
      output: { path: "hooks" },
      group,
      client: { client: "fetch" },
    }),
  ],
});
