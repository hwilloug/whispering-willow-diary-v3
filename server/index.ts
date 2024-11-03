import { router } from './trpc';
import { journalRouter } from './routers/journal';
import { settingsRouter } from './routers/settings';

export const appRouter = router({
  journal: journalRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;