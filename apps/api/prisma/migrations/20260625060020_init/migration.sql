-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('NUMERIC', 'CATEGORICAL', 'TEXT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResearcherRole" AS ENUM ('PRINCIPAL_INVESTIGATOR', 'POSTDOC', 'GRADUATE_STUDENT', 'LAB_TECHNICIAN');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('LEAD', 'COLLABORATOR', 'CONTRIBUTOR');

-- CreateTable
CREATE TABLE "researchers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "global_role" "ResearcherRole" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "researchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_researchers" (
    "project_id" TEXT NOT NULL,
    "researcher_id" TEXT NOT NULL,
    "project_role" "ProjectRole" NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_researchers_pkey" PRIMARY KEY ("project_id","researcher_id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hypothesis" TEXT,
    "status" "ExperimentStatus",
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "project_id" TEXT NOT NULL,
    "previous_experiment_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "specimen_type" TEXT NOT NULL,
    "collected_at" TIMESTAMPTZ(6),
    "storage_location" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_samples" (
    "experiment_id" TEXT NOT NULL,
    "sample_id" TEXT NOT NULL,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiment_samples_pkey" PRIMARY KEY ("experiment_id","sample_id")
);

-- CreateTable
CREATE TABLE "measurement_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value_type" "ValueType" NOT NULL,
    "default_unit" TEXT,
    "allowed_categories" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "measurement_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "measurement_definition_id" TEXT NOT NULL,
    "recorded_by_id" TEXT,
    "numeric_value" DECIMAL(20,6),
    "unit" TEXT,
    "categorical_value" TEXT,
    "text_value" TEXT,
    "notes" TEXT,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_samples" (
    "measurement_id" TEXT NOT NULL,
    "sample_id" TEXT NOT NULL,

    CONSTRAINT "measurement_samples_pkey" PRIMARY KEY ("measurement_id","sample_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "researchers_email_key" ON "researchers"("email");

-- CreateIndex
CREATE INDEX "project_researchers_researcher_id_idx" ON "project_researchers"("researcher_id");

-- CreateIndex
CREATE INDEX "experiments_project_id_idx" ON "experiments"("project_id");

-- CreateIndex
CREATE INDEX "experiments_previous_experiment_id_idx" ON "experiments"("previous_experiment_id");

-- CreateIndex
CREATE UNIQUE INDEX "samples_code_key" ON "samples"("code");

-- CreateIndex
CREATE INDEX "experiment_samples_sample_id_idx" ON "experiment_samples"("sample_id");

-- CreateIndex
CREATE UNIQUE INDEX "measurement_definitions_name_key" ON "measurement_definitions"("name");

-- CreateIndex
CREATE INDEX "measurements_experiment_id_idx" ON "measurements"("experiment_id");

-- CreateIndex
CREATE INDEX "measurements_measurement_definition_id_idx" ON "measurements"("measurement_definition_id");

-- CreateIndex
CREATE INDEX "measurements_recorded_by_id_idx" ON "measurements"("recorded_by_id");

-- CreateIndex
CREATE INDEX "measurement_samples_sample_id_idx" ON "measurement_samples"("sample_id");

-- AddForeignKey
ALTER TABLE "project_researchers" ADD CONSTRAINT "project_researchers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_researchers" ADD CONSTRAINT "project_researchers_researcher_id_fkey" FOREIGN KEY ("researcher_id") REFERENCES "researchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_previous_experiment_id_fkey" FOREIGN KEY ("previous_experiment_id") REFERENCES "experiments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_samples" ADD CONSTRAINT "experiment_samples_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_samples" ADD CONSTRAINT "experiment_samples_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_measurement_definition_id_fkey" FOREIGN KEY ("measurement_definition_id") REFERENCES "measurement_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "researchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_samples" ADD CONSTRAINT "measurement_samples_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_samples" ADD CONSTRAINT "measurement_samples_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;
