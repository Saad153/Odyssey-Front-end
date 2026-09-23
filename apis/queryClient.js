import { QueryClient } from '@tanstack/react-query';

// The single app-wide React Query client. It lives in its own module (rather
// than being constructed inside _app.js) so that non-component code can reach
// the same instance - Components/Layouts/JobsLayout/Jobs/states.js needs it to
// refresh the cached charge list after a save, and it must be the very client
// the provider hands to the components, not a second one.
//
// staleTime is deliberately enormous and refetchOnWindowFocus is off: data is
// fetched once and then reused for the whole session. That makes it essential
// that anything writing to the server also updates the corresponding cache
// entry, because nothing else is ever going to re-fetch it.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 9_900_600_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;
