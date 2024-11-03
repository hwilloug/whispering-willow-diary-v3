import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { journalEntries, entryActivities, entryFeelings, entrySymptoms, substanceUse } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const createJournalEntrySchema = z.object({
  date: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  mood: z.number().min(1).max(10),
  sleepHours: z.number().optional(),
  exerciseMinutes: z.number().optional(),
  affirmation: z.string().optional(),
  activities: z.array(z.string()),
  feelings: z.array(z.string()),
  symptoms: z.array(z.object({
    symptom: z.string(),
    severity: z.number().min(1).max(10),
    category: z.string()
  })),
  substances: z.array(z.object({
    substance: z.string(),
    amount: z.string().optional(),
    notes: z.string().optional()
  }))
});

export const journalRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.journalEntries.findMany({
      where: eq(journalEntries.userId, ctx.userId),
      orderBy: [desc(journalEntries.date)],
      with: {
        activities: true,
        feelings: true,
        symptoms: true,
        substances: true
      }
    });
  }),

  getByDate: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.userId, ctx.userId),
          eq(journalEntries.date, input)
        ),
        with: {
          activities: true,
          feelings: true,
          symptoms: true,
          substances: true
        }
      });
    }),

  create: protectedProcedure
    .input(createJournalEntrySchema)
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const [entry] = await tx
          .insert(journalEntries)
          .values({
            userId: ctx.userId,
            date: new Date(input.date),
            title: input.title,
            content: input.content,
            mood: input.mood,
            sleepHours: input.sleepHours,
            exerciseMinutes: input.exerciseMinutes,
            affirmation: input.affirmation
          })
          .returning();

        if (input.activities.length > 0) {
          await tx.insert(entryActivities).values(
            input.activities.map(activity => ({
              entryId: entry.id,
              activity
            }))
          );
        }

        if (input.feelings.length > 0) {
          await tx.insert(entryFeelings).values(
            input.feelings.map(feeling => ({
              entryId: entry.id,
              feeling
            }))
          );
        }

        if (input.symptoms.length > 0) {
          await tx.insert(entrySymptoms).values(
            input.symptoms.map(({ symptom, severity, category }) => ({
              entryId: entry.id,
              symptom,
              severity,
              category
            }))
          );
        }

        if (input.substances.length > 0) {
          await tx.insert(substanceUse).values(
            input.substances.map(({ substance, amount, notes }) => ({
              entryId: entry.id,
              substance,
              amount,
              notes
            }))
          );
        }

        return entry;
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: createJournalEntrySchema
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const [entry] = await tx
          .update(journalEntries)
          .set({
            title: input.data.title,
            content: input.data.content,
            mood: input.data.mood,
            sleepHours: input.data.sleepHours,
            exerciseMinutes: input.data.exerciseMinutes,
            affirmation: input.data.affirmation,
            updatedAt: new Date()
          })
          .where(and(
            eq(journalEntries.id, input.id),
            eq(journalEntries.userId, ctx.userId)
          ))
          .returning();

        await tx.delete(entryActivities).where(eq(entryActivities.entryId, input.id));
        await tx.delete(entryFeelings).where(eq(entryFeelings.entryId, input.id));
        await tx.delete(entrySymptoms).where(eq(entrySymptoms.entryId, input.id));
        await tx.delete(substanceUse).where(eq(substanceUse.entryId, input.id));

        if (input.data.activities.length > 0) {
          await tx.insert(entryActivities).values(
            input.data.activities.map(activity => ({
              entryId: entry.id,
              activity
            }))
          );
        }

        if (input.data.feelings.length > 0) {
          await tx.insert(entryFeelings).values(
            input.data.feelings.map(feeling => ({
              entryId: entry.id,
              feeling
            }))
          );
        }

        if (input.data.symptoms.length > 0) {
          await tx.insert(entrySymptoms).values(
            input.data.symptoms.map(({ symptom, severity, category }) => ({
              entryId: entry.id,
              symptom,
              severity,
              category
            }))
          );
        }

        if (input.data.substances.length > 0) {
          await tx.insert(substanceUse).values(
            input.data.substances.map(({ substance, amount, notes }) => ({
              entryId: entry.id,
              substance,
              amount,
              notes
            }))
          );
        }

        return entry;
      });
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return await db
        .delete(journalEntries)
        .where(and(
          eq(journalEntries.id, input),
          eq(journalEntries.userId, ctx.userId)
        ))
        .returning();
    }),

  getStats: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const entries = await db.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.userId, ctx.userId),
          journalEntries.date >= new Date(input.startDate),
          journalEntries.date <= new Date(input.endDate)
        ),
        with: {
          activities: true,
          feelings: true,
          symptoms: true,
          substances: true
        }
      });

      const stats = {
        totalEntries: entries.length,
        averageMood: 0,
        averageSleep: 0,
        averageExercise: 0,
        topActivities: new Map<string, number>(),
        topFeelings: new Map<string, number>(),
        symptomFrequency: new Map<string, number>(),
        substanceUse: new Map<string, number>()
      };

      entries.forEach(entry => {
        stats.averageMood += entry.mood;
        if (entry.sleepHours) stats.averageSleep += entry.sleepHours;
        if (entry.exerciseMinutes) stats.averageExercise += entry.exerciseMinutes;

        entry.activities?.forEach(({ activity }) => {
          stats.topActivities.set(
            activity,
            (stats.topActivities.get(activity) || 0) + 1
          );
        });

        entry.feelings?.forEach(({ feeling }) => {
          stats.topFeelings.set(
            feeling,
            (stats.topFeelings.get(feeling) || 0) + 1
          );
        });

        entry.symptoms?.forEach(({ symptom }) => {
          stats.symptomFrequency.set(
            symptom,
            (stats.symptomFrequency.get(symptom) || 0) + 1
          );
        });

        entry.substances?.forEach(({ substance }) => {
          stats.substanceUse.set(
            substance,
            (stats.substanceUse.get(substance) || 0) + 1
          );
        });
      });

      if (entries.length > 0) {
        stats.averageMood /= entries.length;
        stats.averageSleep /= entries.length;
        stats.averageExercise /= entries.length;
      }

      return {
        ...stats,
        topActivities: Object.fromEntries(stats.topActivities),
        topFeelings: Object.fromEntries(stats.topFeelings),
        symptomFrequency: Object.fromEntries(stats.symptomFrequency),
        substanceUse: Object.fromEntries(stats.substanceUse)
      };
    })
});