import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";

interface TeamAvatarsProps {
  title: string;
}

function titleInitials(title: string): string[] {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0].toUpperCase());
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
