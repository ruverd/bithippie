export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w && !w.endsWith("."))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function titleInitials(title: string): string[] {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() ?? "");
}
