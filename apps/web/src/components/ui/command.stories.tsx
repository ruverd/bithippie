import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

const meta = {
  title: "UI/Command",
  component: Command,
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Command className="w-80 rounded-lg border shadow-md">
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Go to">
          <CommandItem>
            Projects
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>Experiments</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Create">
          <CommandItem>New project</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
