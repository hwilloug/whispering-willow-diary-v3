import { router } from './trpc';
import { journalRouter } from './routers/journal';
import { settingsRouter } from './routers/settings';
import { goalsRouter } from './routers/goals';

export const appRouter = router({
  journal: journalRouter,
  settings: settingsRouter,
  goals: goalsRouter,
});

export type AppRouter = typeof appRouter;