import { createTRPCNext } from '@trpc/next';
import { type AppRouter } from '@/server';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // You can pass any HTTP headers you wish here
          headers() {
            return {};
          },
        }),
      ],
    };
  },
  ssr: true,
});