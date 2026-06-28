import {
  ExperimentStatus,
  PrismaClient,
  ProjectRole,
  ProjectStatus,
  ResearcherRole,
  ValueType,
} from "@prisma/client";
import { faker } from "@faker-js/faker";

export async function seed(prisma: PrismaClient): Promise<void> {
  // Deterministic faker output so repeated seed() calls (per integration test
  // file) regenerate identical rows and skipDuplicates keeps them idempotent.
  faker.seed(20260626);

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

  // =========================================================================
  // Bulk realistic data (faker). Anchored seed-* rows above stay untouched so
  // integration tests keep their fixtures. Everything below uses f-* ids and
  // createMany({ skipDuplicates }) so re-running seed() is idempotent.
  // =========================================================================

  // --- Researchers ---
  const fakerResearchers = Array.from({ length: 16 }, (_, i) => {
    const role = faker.helpers.arrayElement(Object.values(ResearcherRole));
    const fullName = faker.person.fullName();
    const display = role === ResearcherRole.PRINCIPAL_INVESTIGATOR ? `Dr. ${fullName}` : fullName;
    const slug = fullName.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
    return {
      id: `f-res-${i}`,
      name: display,
      email: `${slug}.${i}@bithippie.bio`,
      phone: faker.phone.number(),
      globalRole: role,
    };
  });
  await prisma.researcher.createMany({ data: fakerResearchers, skipDuplicates: true });
  const researcherIds = [alice.id, bob.id, carol.id, ...fakerResearchers.map((r) => r.id)];

  // --- Measurement definitions ---
  const NUMERIC_DEFS = [
    { id: "f-def-edit-eff", name: "Editing efficiency", unit: "%", min: 40, max: 99, frac: 1 },
    { id: "f-def-offtarget", name: "Off-target sites", unit: "sites", min: 0, max: 12, frac: 0 },
    { id: "f-def-viability", name: "Cell viability", unit: "%", min: 60, max: 99, frac: 1 },
    { id: "f-def-indel", name: "Indel frequency", unit: "ratio", min: 0, max: 1, frac: 2 },
    { id: "f-def-ph", name: "pH level", unit: "pH", min: 4, max: 9, frac: 1 },
    { id: "f-def-carbon", name: "Carbon capture rate", unit: "mg/g", min: 0.2, max: 5, frac: 1 },
    { id: "f-def-protein", name: "Protein concentration", unit: "mg/mL", min: 0.1, max: 25, frac: 2 },
    { id: "f-def-od", name: "Optical density", unit: "OD600", min: 0.05, max: 2, frac: 2 },
    { id: "f-def-fluor", name: "Fluorescence intensity", unit: "RFU", min: 100, max: 50000, frac: 0 },
    { id: "f-def-enzyme", name: "Enzyme activity", unit: "U/mL", min: 1, max: 500, frac: 1 },
  ] as const;
  const CATEGORICAL_DEFS = [
    { id: "f-def-phenotype", name: "Phenotype class", cats: ["Resistant", "Susceptible", "Intermediate"] },
    { id: "f-def-contam", name: "Contamination status", cats: ["Clean", "Contaminated", "Suspect"] },
    { id: "f-def-outcome", name: "Assay outcome", cats: ["Pass", "Fail", "Repeat"] },
  ] as const;
  const TEXT_DEFS = [
    { id: "f-def-morphology", name: "Colony morphology" },
    { id: "f-def-fieldnotes", name: "Field notes" },
    { id: "f-def-qc", name: "QC comment" },
  ] as const;

  await prisma.measurementDefinition.createMany({
    data: [
      ...NUMERIC_DEFS.map((d) => ({
        id: d.id,
        name: d.name,
        valueType: ValueType.NUMERIC,
        defaultUnit: d.unit,
        allowedCategories: [],
      })),
      ...CATEGORICAL_DEFS.map((d) => ({
        id: d.id,
        name: d.name,
        valueType: ValueType.CATEGORICAL,
        defaultUnit: null,
        allowedCategories: [...d.cats],
      })),
      ...TEXT_DEFS.map((d) => ({
        id: d.id,
        name: d.name,
        valueType: ValueType.TEXT,
        defaultUnit: null,
        allowedCategories: [],
      })),
    ],
    skipDuplicates: true,
  });

  const TEXT_VALUES = [
    "Irregular edges with raised center.",
    "Within expected morphology range.",
    "Slight discoloration observed at margins.",
    "Sample appeared homogeneous and clear.",
    "Minor turbidity logged during intake.",
    "Growth consistent with control plate.",
    "Faint precipitate noted after spin.",
  ];

  function buildValue(
    def:
      | (typeof NUMERIC_DEFS)[number]
      | (typeof CATEGORICAL_DEFS)[number]
      | (typeof TEXT_DEFS)[number],
  ): { numericValue?: number; unit?: string; categoricalValue?: string; textValue?: string } {
    if ("unit" in def) {
      return {
        numericValue: faker.number.float({ min: def.min, max: def.max, fractionDigits: def.frac }),
        unit: def.unit,
      };
    }
    if ("cats" in def) {
      return { categoricalValue: faker.helpers.arrayElement(def.cats) };
    }
    return { textValue: faker.helpers.arrayElement(TEXT_VALUES) };
  }
  const ALL_DEFS = [...NUMERIC_DEFS, ...CATEGORICAL_DEFS, ...TEXT_DEFS];

  // --- Projects ---
  const FOCUS = [
    "Oncology",
    "Neuro Regeneration",
    "Metabolic Pathways",
    "Microbiome",
    "Immunotherapy",
    "Gene Editing",
    "Proteomics",
    "Stem Cell",
    "Antiviral",
    "Biomarker Discovery",
    "Synthetic Biology",
    "Structural Biology",
  ];
  const PTYPE = ["Panel", "Study", "Initiative", "Program", "Screen", "Cohort"];
  const projects = Array.from({ length: 22 }, (_, i) => ({
    id: `f-proj-${i}`,
    title: `${faker.helpers.arrayElement(FOCUS)} ${faker.helpers.arrayElement(PTYPE)}`,
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(Object.values(ProjectStatus)),
  }));
  await prisma.project.createMany({ data: projects, skipDuplicates: true });

  // --- Memberships (one LEAD + collaborators/contributors per project) ---
  const memberRows: Array<{ projectId: string; researcherId: string; projectRole: ProjectRole }> = [];
  const projectMembers: Record<string, string[]> = {};
  for (const p of projects) {
    const pool = faker.helpers.shuffle([...researcherIds]);
    const lead = pool[0]!;
    memberRows.push({ projectId: p.id, researcherId: lead, projectRole: ProjectRole.LEAD });
    const extras = pool.slice(1, 1 + faker.number.int({ min: 1, max: 4 }));
    for (const r of extras) {
      memberRows.push({
        projectId: p.id,
        researcherId: r,
        projectRole: faker.helpers.arrayElement([ProjectRole.COLLABORATOR, ProjectRole.CONTRIBUTOR]),
      });
    }
    projectMembers[p.id] = [lead, ...extras];
  }
  await prisma.projectResearcher.createMany({ data: memberRows, skipDuplicates: true });

  // --- Experiments ---
  const ASSAYS = [
    "Protein folding kinetics",
    "Enzyme stability assay",
    "Cell viability screen",
    "pH tolerance trial",
    "Lipid extraction yield",
    "Antibody binding affinity",
    "Thermal denaturation",
    "Gene expression profile",
    "Dose-response titration",
    "Off-target profiling",
    "Cell-line panel sweep",
  ];
  const experiments: Array<{
    id: string;
    title: string;
    hypothesis: string;
    status: ExperimentStatus;
    projectId: string;
    startDate: Date;
    endDate: Date | null;
  }> = [];
  let expCounter = 0;
  for (const p of projects) {
    const n = faker.number.int({ min: 1, max: 5 });
    for (let k = 0; k < n; k += 1) {
      const status = faker.helpers.arrayElement(Object.values(ExperimentStatus));
      const startDate = faker.date.past({ years: 2 });
      const ended =
        status === ExperimentStatus.COMPLETED || status === ExperimentStatus.CANCELLED;
      experiments.push({
        id: `f-exp-${expCounter}`,
        title: faker.helpers.arrayElement(ASSAYS),
        hypothesis: faker.lorem.sentence(),
        status,
        projectId: p.id,
        startDate,
        endDate: ended ? faker.date.soon({ days: 220, refDate: startDate }) : null,
      });
      expCounter += 1;
    }
  }
  await prisma.experiment.createMany({ data: experiments, skipDuplicates: true });

  // --- Samples ---
  const SPECIMENS = [
    "Blood plasma",
    "Tissue biopsy",
    "Cell culture",
    "DNA extract",
    "Serum",
    "Saliva",
    "Plasma",
    "Urine",
    "Bone marrow",
    "CSF",
  ];
  const STORAGE = [
    "Freezer A-3",
    "Incubator 2",
    "Freezer B-1",
    "Fridge 4",
    "Freezer A-1",
    "Incubator 1",
    "LN2 Tank 1",
    "Cabinet 3",
  ];
  const samples = Array.from({ length: 70 }, (_, i) => ({
    id: `f-samp-${i}`,
    code: `SMP-${1000 + i}`,
    specimenType: faker.helpers.arrayElement(SPECIMENS),
    collectedAt: faker.date.past({ years: 1 }),
    storageLocation: faker.helpers.arrayElement(STORAGE),
  }));
  await prisma.sample.createMany({ data: samples, skipDuplicates: true });
  const sampleIds = samples.map((s) => s.id);

  // --- Experiment ↔ sample usage ---
  const expSampleRows: Array<{ experimentId: string; sampleId: string }> = [];
  const samplesByExperiment: Record<string, string[]> = {};
  for (const e of experiments) {
    const picks = faker.helpers.arrayElements(sampleIds, { min: 1, max: 6 });
    samplesByExperiment[e.id] = picks;
    for (const s of picks) expSampleRows.push({ experimentId: e.id, sampleId: s });
  }
  await prisma.experimentSample.createMany({ data: expSampleRows, skipDuplicates: true });

  // --- Measurements (+ measurement ↔ sample links) ---
  const measRows: Array<{
    id: string;
    experimentId: string;
    measurementDefinitionId: string;
    recordedById: string | null;
    recordedAt: Date;
    notes: string | null;
    numericValue?: number;
    unit?: string;
    categoricalValue?: string;
    textValue?: string;
  }> = [];
  const measSampleRows: Array<{ measurementId: string; sampleId: string }> = [];
  let measCounter = 0;
  for (const e of experiments) {
    const members = projectMembers[e.projectId] ?? researcherIds;
    const expSamples = samplesByExperiment[e.id] ?? [];
    const count = faker.number.int({ min: 4, max: 25 });
    for (let j = 0; j < count; j += 1) {
      const def = faker.helpers.arrayElement(ALL_DEFS);
      const id = `f-meas-${measCounter}`;
      measCounter += 1;
      measRows.push({
        id,
        experimentId: e.id,
        measurementDefinitionId: def.id,
        recordedById:
          faker.helpers.maybe(() => faker.helpers.arrayElement(members), { probability: 0.85 }) ??
          null,
        recordedAt: faker.date.past({ years: 1 }),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null,
        ...buildValue(def),
      });
      const linked = faker.helpers.arrayElements(expSamples, {
        min: 0,
        max: Math.min(2, expSamples.length),
      });
      for (const s of linked) measSampleRows.push({ measurementId: id, sampleId: s });
    }
  }
  await prisma.measurement.createMany({ data: measRows, skipDuplicates: true });
  await prisma.measurementSample.createMany({ data: measSampleRows, skipDuplicates: true });
}

if (import.meta.main) {
  const prisma = new PrismaClient();
  try {
    await seed(prisma);
    // eslint-disable-next-line no-console
    console.log("Seed complete.");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
