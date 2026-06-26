import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layout";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { ProjectsPage } from "./routes/projects";
import { ProjectDetailPage } from "./routes/project-detail";
import { ExperimentsPage } from "./routes/experiments";
import { ExperimentDetailPage } from "./routes/experiment-detail";
import { SamplesPage } from "./routes/samples";
import { SampleDetailPage } from "./routes/sample-detail";
import { MeasurementsPage } from "./routes/measurements";
import { MeasurementDefinitionsPage } from "./routes/measurement-definitions";
import { ResearchersPage } from "./routes/researchers";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      { path: "experiments", element: <ExperimentsPage /> },
      { path: "experiments/:experimentId", element: <ExperimentDetailPage /> },
      { path: "samples", element: <SamplesPage /> },
      { path: "samples/:sampleId", element: <SampleDetailPage /> },
      { path: "measurements", element: <MeasurementsPage /> },
      { path: "measurement-definitions", element: <MeasurementDefinitionsPage /> },
      { path: "researchers", element: <ResearchersPage /> },
    ],
  },
]);
