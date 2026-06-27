import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppTopBar } from "./app-top-bar";

const meta = {
  title: "Layout/AppTopBar",
  component: AppTopBar,
  decorators: [
    (Story) => (
      <SidebarProvider>
        <MemoryRouter initialEntries={["/projects"]}>
          <Story />
        </MemoryRouter>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AppTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
