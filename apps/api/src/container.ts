import type { PrismaClient } from "@prisma/client";

export interface Container {
  prisma: PrismaClient;
}

export function buildContainer(prisma: PrismaClient): Container {
  return { prisma };
}
