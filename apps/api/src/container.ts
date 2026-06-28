import type { PrismaClient } from "@prisma/client";

import { buildMemoryRepositories } from "./infrastructure/memory/fixture";
import type { MemoryRepositories } from "./infrastructure/memory/fixture";

import { PrismaProjectsRepository } from "./features/projects/infrastructure/repositories/prisma";
import { buildProjectsServices } from "./features/projects/application/services";
import type { ProjectsServices } from "./features/projects/application/services";

import { PrismaExperimentsRepository } from "./features/experiments/infrastructure/repositories/prisma";
import { buildExperimentsServices } from "./features/experiments/application/services";
import type { ExperimentsServices } from "./features/experiments/application/services";

import { PrismaSamplesRepository } from "./features/samples/infrastructure/repositories/prisma";
import { buildSamplesServices } from "./features/samples/application/services";
import type { SamplesServices } from "./features/samples/application/services";

import { PrismaMeasurementDefinitionsRepository } from "./features/measurement-definitions/infrastructure/repositories/prisma";
import { buildMeasurementDefinitionsServices } from "./features/measurement-definitions/application/services";
import type { MeasurementDefinitionsServices } from "./features/measurement-definitions/application/services";

import { PrismaMeasurementsRepository } from "./features/measurements/infrastructure/repositories/prisma";
import { buildMeasurementsServices } from "./features/measurements/application/services";
import type { MeasurementsServices } from "./features/measurements/application/services";

import { PrismaResearchersRepository } from "./features/researchers/infrastructure/repositories/prisma";
import { buildResearchersServices } from "./features/researchers/application/services";
import type { ResearchersServices } from "./features/researchers/application/services";

export interface Container {
  prisma: PrismaClient;
  projects: ProjectsServices;
  experiments: ExperimentsServices;
  samples: SamplesServices;
  measurementDefinitions: MeasurementDefinitionsServices;
  measurements: MeasurementsServices;
  researchers: ResearchersServices;
}

// REPO=memory swaps Prisma repositories for in-memory ones (used by the e2e
// suite so it runs without a database). Anything else uses Prisma.
function buildRepositories(prisma: PrismaClient): MemoryRepositories {
  if (process.env.REPO === "memory") return buildMemoryRepositories();
  return {
    projects: new PrismaProjectsRepository(prisma),
    experiments: new PrismaExperimentsRepository(prisma),
    samples: new PrismaSamplesRepository(prisma),
    measurementDefinitions: new PrismaMeasurementDefinitionsRepository(prisma),
    measurements: new PrismaMeasurementsRepository(prisma),
    researchers: new PrismaResearchersRepository(prisma),
  };
}

export function buildContainer(prisma: PrismaClient): Container {
  const repos = buildRepositories(prisma);
  return {
    prisma,
    projects: buildProjectsServices(repos.projects),
    experiments: buildExperimentsServices(repos.experiments),
    samples: buildSamplesServices(repos.samples),
    measurementDefinitions: buildMeasurementDefinitionsServices(repos.measurementDefinitions),
    measurements: buildMeasurementsServices(repos.measurements),
    researchers: buildResearchersServices(repos.researchers),
  };
}
