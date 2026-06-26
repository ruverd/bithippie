import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layout";
import { HomePage } from "./routes/home";
import { ProjectsPage } from "./routes/projects";
import { ProjectDetailPage } from "./routes/project-detail";
import { ExperimentDetailPage } from "./routes/experiment-detail";
import { SamplesPage } from "./routes/samples";
import { SampleDetailPage } from "./routes/sample-detail";
import { MeasurementDefinitionsPage } from "./routes/measurement-definitions";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      { path: "experiments/:experimentId", element: <ExperimentDetailPage /> },
      { path: "samples", element: <SamplesPage /> },
      { path: "samples/:sampleId", element: <SampleDetailPage /> },
      { path: "measurement-definitions", element: <MeasurementDefinitionsPage /> },
    ],
  },
]);
