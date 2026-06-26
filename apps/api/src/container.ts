import type { PrismaClient } from "@prisma/client";
import type { ProjectsRepository } from "./features/projects/domain/projects.repository";
import { PrismaProjectsRepository } from "./features/projects/infrastructure/repositories/prisma";
import type { ExperimentsRepository } from "./features/experiments/domain/experiments.repository";
import { PrismaExperimentsRepository } from "./features/experiments/infrastructure/repositories/prisma";
import type { SamplesRepository } from "./features/samples/domain/samples.repository";
import { PrismaSamplesRepository } from "./features/samples/infrastructure/repositories/prisma";
import type { MeasurementDefinitionsRepository } from "./features/measurement-definitions/domain/measurement-definitions.repository";
import { PrismaMeasurementDefinitionsRepository } from "./features/measurement-definitions/infrastructure/repositories/prisma";
import type { MeasurementsRepository } from "./features/measurements/domain/measurements.repository";
import { PrismaMeasurementsRepository } from "./features/measurements/infrastructure/repositories/prisma";
import type { ResearchersRepository } from "./features/researchers/domain/researchers.repository";
import { PrismaResearchersRepository } from "./features/researchers/infrastructure/repositories/prisma";

export interface Container {
  prisma: PrismaClient;
  projects: ProjectsRepository;
  experiments: ExperimentsRepository;
  samples: SamplesRepository;
  measurementDefinitions: MeasurementDefinitionsRepository;
  measurements: MeasurementsRepository;
  researchers: ResearchersRepository;
}

export function buildContainer(prisma: PrismaClient): Container {
  return {
    prisma,
    projects: new PrismaProjectsRepository(prisma),
    experiments: new PrismaExperimentsRepository(prisma),
    samples: new PrismaSamplesRepository(prisma),
    measurementDefinitions: new PrismaMeasurementDefinitionsRepository(prisma),
    measurements: new PrismaMeasurementsRepository(prisma),
    researchers: new PrismaResearchersRepository(prisma),
  };
}
