import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { createJournalEntrySchema } from '../schemas/journal.schema';
import { JournalService } from '../services/journal.service';
import { StatsCalculator } from '../utils/stats.utils';
import { format, parse } from 'date-fns';

export const journalRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      return await JournalService.getAllEntries(ctx.userId, input);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await JournalService.getEntryById(ctx.userId, input.id);
    }),

  getByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return await JournalService.getEntriesByDate(ctx.userId, input.date);
    }),

  create: protectedProcedure
    .input(createJournalEntrySchema)
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        return await JournalService.createEntry(tx, ctx.userId, input);
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: createJournalEntrySchema
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        return await JournalService.updateEntry(tx, ctx.userId, input.id, input.data);
      });
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return await JournalService.deleteEntry(ctx.userId, input);
    }),

  getStats: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Generate date range
      const dates = [];
      let currentDate = parse(input.startDate, 'yyyy-MM-dd', new Date());
      const endDate = parse(input.endDate, 'yyyy-MM-dd', new Date());
      
      while (currentDate <= endDate) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Get entries for the date range
      const entries = await JournalService.getEntriesInDateRange(ctx.userId, dates);
      
      // Get all entries for streak calculation
      const allEntries = await JournalService.getAllEntriesForStreak(ctx.userId);

      // Calculate stats
      const streak = StatsCalculator.calculateStreak(allEntries);
      const {
        averageMood,
        averageSleep,
        averageExercise,
        topActivities,
        topFeelings,
        symptomFrequency,
        substanceUse
      } = StatsCalculator.calculateAverages(entries);

      return {
        totalEntries: entries.length,
        averageMood,
        averageSleep,
        averageExercise,
        streak,
        topActivities: Object.fromEntries(topActivities),
        topFeelings: Object.fromEntries(topFeelings),
        symptomFrequency: Object.fromEntries(symptomFrequency),
        substanceUse: Object.fromEntries(substanceUse)
      };
    })
});
