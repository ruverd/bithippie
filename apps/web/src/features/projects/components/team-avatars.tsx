import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { initials } from "@/utils/initials";
import { formatRole } from "@/utils/format-role";

export interface TeamMember {
  name: string;
  projectRole?: string | null;
}

const MAX_VISIBLE = 4;

export function TeamAvatars({ members }: { members: TeamMember[] }) {
  if (!members || members.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - visible.length;

  return (
    <TooltipProvider delay={0}>
      <AvatarGroup>
        {visible.map((member, i) => (
          <Tooltip key={i}>
            <TooltipTrigger
              render={
                <Avatar size="sm" className="size-7 cursor-default border-2 border-card">
                  <AvatarFallback className="text-xs">{initials(member.name)}</AvatarFallback>
                </Avatar>
              }
            />
            <TooltipContent>
              {member.name}
              {member.projectRole ? ` · ${formatRole(member.projectRole)}` : ""}
            </TooltipContent>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Avatar size="sm" className="size-7 cursor-default border-2 border-card">
                  <AvatarFallback className="text-xs">+{overflow}</AvatarFallback>
                </Avatar>
              }
            />
            <TooltipContent>
              {members
                .slice(MAX_VISIBLE)
                .map((member) => member.name)
                .join(", ")}
            </TooltipContent>
          </Tooltip>
        )}
      </AvatarGroup>
    </TooltipProvider>
  );
}
