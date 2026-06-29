import type { QueryClient } from "@tanstack/react-query";

/**
 * Invalidate (and refetch) every query whose Kubb query key targets a URL
 * containing any of the given path fragments. Centralizes the `queryKey[0].url`
 * cast and substring match that several write dialogs would otherwise duplicate.
 */
export function invalidateByUrl(queryClient: QueryClient, ...fragments: string[]) {
  return queryClient.invalidateQueries({
    refetchType: "all",
    predicate: (query) => {
      const key = query.queryKey?.[0] as { url?: string } | undefined;
      return typeof key?.url === "string" && fragments.some((fragment) => key.url!.includes(fragment));
    },
  });
}
