import { QueryClient } from "@tanstack/react-query";

// Shared by the browser provider and server-side prefetching so both use identical defaults.
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
  });
