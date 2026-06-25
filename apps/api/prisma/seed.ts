import { PrismaClient, ProjectRole, ProjectStatus, ResearcherRole, ValueType } from "@prisma/client";

const prisma = new PrismaClient();

export async function seed(): Promise<void> {
  // --- Researchers ---
  const alice = await prisma.researcher.upsert({
    where: { id: "seed-researcher-alice" },
    update: {},
    create: { id: "seed-researcher-alice", name: "Alice Nguyen", email: "alice@lab.test", globalRole: ResearcherRole.PRINCIPAL_INVESTIGATOR },
  });
  const bob = await prisma.researcher.upsert({
    where: { id: "seed-researcher-bob" },
    update: {},
    create: { id: "seed-researcher-bob", name: "Bob Silva", email: "bob@lab.test", globalRole: ResearcherRole.GRADUATE_STUDENT },
  });
  const carol = await prisma.researcher.upsert({
    where: { id: "seed-researcher-carol" },
    update: {},
    create: { id: "seed-researcher-carol", name: "Carol Tan", email: "carol@lab.test", globalRole: ResearcherRole.LAB_TECHNICIAN },
  });

  // --- Projects ---
  const water = await prisma.project.upsert({
    where: { id: "seed-project-water" },
    update: {},
    create: { id: "seed-project-water", title: "Municipal Water Quality", description: "Lead and contaminant screening of municipal water.", status: ProjectStatus.ACTIVE },
  });
  const soil = await prisma.project.upsert({
    where: { id: "seed-project-soil" },
    update: {},
    create: { id: "seed-project-soil", title: "Urban Soil Survey", description: "Soil composition study across city districts.", status: ProjectStatus.PLANNING },
  });

  // --- Project membership (multiple researchers; bob + alice on >1 project) ---
  const memberships: Array<{ projectId: string; researcherId: string; projectRole: ProjectRole }> = [
    { projectId: water.id, researcherId: alice.id, projectRole: ProjectRole.LEAD },
    { projectId: water.id, researcherId: bob.id, projectRole: ProjectRole.COLLABORATOR },
    { projectId: water.id, researcherId: carol.id, projectRole: ProjectRole.CONTRIBUTOR },
    { projectId: soil.id, researcherId: alice.id, projectRole: ProjectRole.LEAD },
    { projectId: soil.id, researcherId: bob.id, projectRole: ProjectRole.COLLABORATOR },
  ];
  for (const m of memberships) {
    await prisma.projectResearcher.upsert({
      where: { projectId_researcherId: { projectId: m.projectId, researcherId: m.researcherId } },
      update: {},
      create: m,
    });
  }

  // --- Experiments (exp2 is a follow-up of exp1) ---
  const exp1 = await prisma.experiment.upsert({
    where: { id: "seed-exp-1" },
    update: {},
    create: { id: "seed-exp-1", title: "Baseline lead screening", hypothesis: "Lead levels exceed the safe threshold.", status: "COMPLETED", projectId: water.id },
  });
  const exp2 = await prisma.experiment.upsert({
    where: { id: "seed-exp-2" },
    update: {},
    create: { id: "seed-exp-2", title: "Lead screening replication", hypothesis: "Baseline lead levels reproduce.", status: "ACTIVE", projectId: water.id, previousExperimentId: exp1.id },
  });
  const exp3 = await prisma.experiment.upsert({
    where: { id: "seed-exp-3" },
    update: {},
    create: { id: "seed-exp-3", title: "Soil pH survey", hypothesis: "District A soil is more acidic.", status: "ACTIVE", projectId: soil.id },
  });

  // --- Samples ---
  const blood = await prisma.sample.upsert({
    where: { id: "seed-sample-blood" },
    update: {},
    create: { id: "seed-sample-blood", code: "BLD-001", specimenType: "blood", storageLocation: "Freezer A / Shelf 2" },
  });
  const soilSample = await prisma.sample.upsert({
    where: { id: "seed-sample-soil" },
    update: {},
    create: { id: "seed-sample-soil", code: "SOIL-001", specimenType: "soil", storageLocation: "Cabinet 3" },
  });

  // --- Sample usage (blood reused across exp1 AND exp2) ---
  const expSamples: Array<{ experimentId: string; sampleId: string }> = [
    { experimentId: exp1.id, sampleId: blood.id },
    { experimentId: exp2.id, sampleId: blood.id },
    { experimentId: exp3.id, sampleId: soilSample.id },
  ];
  for (const es of expSamples) {
    await prisma.experimentSample.upsert({
      where: { experimentId_sampleId: { experimentId: es.experimentId, sampleId: es.sampleId } },
      update: {},
      create: es,
    });
  }

  // --- Measurement definitions (numeric, numeric, categorical, text) ---
  const lead = await prisma.measurementDefinition.upsert({
    where: { id: "seed-def-lead" },
    update: {},
    create: { id: "seed-def-lead", name: "Lead concentration", valueType: ValueType.NUMERIC, defaultUnit: "mg/L", allowedCategories: [] },
  });
  const temp = await prisma.measurementDefinition.upsert({
    where: { id: "seed-def-temp" },
    update: {},
    create: { id: "seed-def-temp", name: "Temperature", valueType: ValueType.NUMERIC, defaultUnit: "°C", allowedCategories: [] },
  });
  const screen = await prisma.measurementDefinition.upsert({
    where: { id: "seed-def-screen" },
    update: {},
    create: { id: "seed-def-screen", name: "Screening result", valueType: ValueType.CATEGORICAL, allowedCategories: ["positive", "negative", "inconclusive"] },
  });
  const obs = await prisma.measurementDefinition.upsert({
    where: { id: "seed-def-obs" },
    update: {},
    create: { id: "seed-def-obs", name: "Researcher observation", valueType: ValueType.TEXT, allowedCategories: [] },
  });

  // --- Measurements: numeric/categorical/text; with and without a sample ---
  await prisma.measurement.upsert({
    where: { id: "seed-meas-lead-1" },
    update: {},
    create: { id: "seed-meas-lead-1", experimentId: exp1.id, measurementDefinitionId: lead.id, recordedById: alice.id, numericValue: 12.4, unit: "mg/L", samples: { create: [{ sampleId: blood.id }] } },
  });
  await prisma.measurement.upsert({
    where: { id: "seed-meas-screen-1" },
    update: {},
    create: { id: "seed-meas-screen-1", experimentId: exp1.id, measurementDefinitionId: screen.id, recordedById: bob.id, categoricalValue: "positive", samples: { create: [{ sampleId: blood.id }] } },
  });
  // Text measurement WITHOUT a sample (applies to the experiment as a whole).
  await prisma.measurement.upsert({
    where: { id: "seed-meas-obs-1" },
    update: {},
    create: { id: "seed-meas-obs-1", experimentId: exp1.id, measurementDefinitionId: obs.id, recordedById: alice.id, textValue: "Sample appeared slightly turbid before testing.", notes: "Logged during intake." },
  });
  await prisma.measurement.upsert({
    where: { id: "seed-meas-lead-2" },
    update: {},
    create: { id: "seed-meas-lead-2", experimentId: exp2.id, measurementDefinitionId: lead.id, recordedById: bob.id, numericValue: 9.8, unit: "mg/L", samples: { create: [{ sampleId: blood.id }] } },
  });
  await prisma.measurement.upsert({
    where: { id: "seed-meas-temp-1" },
    update: {},
    create: { id: "seed-meas-temp-1", experimentId: exp3.id, measurementDefinitionId: temp.id, recordedById: carol.id, numericValue: 22.5, unit: "°C", samples: { create: [{ sampleId: soilSample.id }] } },
  });
}

if (import.meta.main) {
  seed()
    .then(async () => {
      await prisma.$disconnect();
      // eslint-disable-next-line no-console
      console.log("Seed complete.");
    })
    .catch(async (e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
