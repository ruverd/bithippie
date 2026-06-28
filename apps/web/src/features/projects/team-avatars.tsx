import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { titleInitials } from "@/utils/initials";

interface TeamAvatarsProps {
  title: string;
}

export function TeamAvatars({ title }: TeamAvatarsProps) {
  const initials = titleInitials(title);
  return (
    <AvatarGroup>
      {initials.map((initial, i) => (
        <Avatar
          key={i}
          size="sm"
          className="size-7 border-2 border-card"
        >
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
