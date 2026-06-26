import type { PrismaClient } from "@prisma/client";
import { PrismaProjectsRepository } from "./features/projects/infrastructure/repositories/prisma";

export interface Container {
  prisma: PrismaClient;
  projects: PrismaProjectsRepository;
}
export function buildContainer(prisma: PrismaClient): Container {
  return { prisma, projects: new PrismaProjectsRepository(prisma) };
}
