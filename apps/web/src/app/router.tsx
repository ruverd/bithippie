import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layout";
import { DashboardPage } from "./pages/dashboard";
import { ProjectsPage } from "./pages/projects";
import { ProjectDetailPage } from "./pages/project-detail";
import { ExperimentsPage } from "./pages/experiments";
import { ExperimentDetailPage } from "./pages/experiment-detail";
import { SamplesPage } from "./pages/samples";
import { SampleDetailPage } from "@/features/samples/components/sample-detail";
import { MeasurementsPage } from "./pages/measurements";
import { MeasurementDefinitionsPage } from "./pages/measurement-definitions";
import { ResearchersPage } from "./pages/researchers";

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
