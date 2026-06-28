import {
  LayoutDashboard,
  FolderKanban,
  FlaskConical,
  TestTube,
  Activity,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
  end: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/", end: true },
  { label: "Projects", icon: FolderKanban, to: "/projects", end: false },
  { label: "Experiments", icon: FlaskConical, to: "/experiments", end: false },
  { label: "Samples", icon: TestTube, to: "/samples", end: false },
  { label: "Measurements", icon: Activity, to: "/measurements", end: false },
  { label: "Researchers", icon: Users, to: "/researchers", end: false },
];
