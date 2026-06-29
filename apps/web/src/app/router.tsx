import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layout";
import { DashboardPage } from "./pages/dashboard/dashboard";
import { ProjectsPage } from "./pages/projects/projects";
import { ProjectDetailPage } from "./pages/project-detail/project-detail";
import { ExperimentsPage } from "./pages/experiments/experiments";
import { ExperimentDetailPage } from "@/features/experiments/components/experiment-detail";
import { SamplesPage } from "./pages/samples/samples";
import { SampleDetailPage } from "@/features/samples/components/sample-detail";
import { MeasurementsPage } from "./pages/measurements/measurements";
import { ResearchersPage } from "./pages/researchers/researchers";

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
      { path: "researchers", element: <ResearchersPage /> },
    ],
  },
]);
