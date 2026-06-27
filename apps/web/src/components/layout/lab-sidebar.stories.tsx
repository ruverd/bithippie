import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LabSidebar } from "./lab-sidebar";

const meta = {
  title: "Layout/LabSidebar",
  component: LabSidebar,
  decorators: [
    (Story) => (
      <SidebarProvider>
        <MemoryRouter initialEntries={["/projects"]}>
          <Story />
        </MemoryRouter>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof LabSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
