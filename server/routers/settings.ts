import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { userSettings } from '@/db/v3.schema';
import { eq } from 'drizzle-orm';

export const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, ctx.userId)
    });

    return settings || {
      suggestedFeelings: [],
      suggestedActivities: [],
      suggestedSymptoms: [],
      suggestedSubstances: [],
      categories: ['Depression', 'Anxiety', 'Mania', 'OCD', 'ADHD', 'Other']
    };
  }),

  update: protectedProcedure
    .input(z.object({
      suggestedFeelings: z.array(z.string()).optional(),
      suggestedActivities: z.array(z.string()).optional(),
      suggestedSymptoms: z.array(z.object({
        symptom: z.string(),
        category: z.string()
      })).optional(),
      suggestedSubstances: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, ctx.userId)
      });

      if (existing) {
        return await db
          .update(userSettings)
          .set({
            ...input,
            updatedAt: new Date()
          })
          .where(eq(userSettings.userId, ctx.userId))
          .returning();
      }

      return await db
        .insert(userSettings)
        .values({
          userId: ctx.userId,
          ...input
        })
        .returning();
    })
});