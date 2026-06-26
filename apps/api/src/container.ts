import type { PrismaClient } from "@prisma/client";
import type { ProjectsRepository } from "./features/projects/domain/projects.repository";
import { PrismaProjectsRepository } from "./features/projects/infrastructure/repositories/prisma";

export interface Container {
  prisma: PrismaClient;
  projects: ProjectsRepository;
}
export function buildContainer(prisma: PrismaClient): Container {
  return { prisma, projects: new PrismaProjectsRepository(prisma) };
}
