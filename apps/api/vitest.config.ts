import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["prisma/__tests__/**/*.test.ts"],
    fileParallelism: false, // tests share one Postgres; run serially
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
