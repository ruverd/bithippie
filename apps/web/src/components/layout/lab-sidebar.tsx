import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  FlaskConical,
  TestTube,
  Activity,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.jpeg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/", end: true },
  { label: "Projects", icon: FolderKanban, to: "/projects", end: false },
  { label: "Experiments", icon: FlaskConical, to: "/experiments", end: false },
  { label: "Samples", icon: TestTube, to: "/samples", end: false },
  { label: "Measurements", icon: Activity, to: "/measurements", end: false },
  { label: "Researchers", icon: Users, to: "/researchers", end: false },
] as const;

function isActivePath(pathname: string, to: string, end: boolean): boolean {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function LabSidebar() {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar className="size-7 rounded-md bg-muted">
            <AvatarImage src={logo} alt="BitHippie Lab" className="rounded-md object-cover" />
            <AvatarFallback className="rounded-md bg-muted text-[11px] font-bold">
              PJ
            </AvatarFallback>
          </Avatar>
          <span className="text-base font-bold">BitHippie Lab</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-wide text-muted-foreground">
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, icon: Icon, to, end }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    isActive={isActivePath(pathname, to, end)}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                    render={<NavLink to={to} end={end} />}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar className="size-[34px] bg-muted">
            <AvatarFallback className="bg-muted text-xs font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold">Jason Davis-Cooke</span>
            <span className="text-[11px] text-muted-foreground">
              Principal Investigator
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
