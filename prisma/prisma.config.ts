import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
