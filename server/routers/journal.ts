import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { db } from '@/db';
import { createJournalEntrySchema } from '../schemas/journal.schema';
import { JournalService } from '../services/journal.service';
import { StatsCalculator } from '../utils/stats.utils';
import { format, parse } from 'date-fns';
import { StreakService } from '../services/streak.service';
import { and, eq } from 'drizzle-orm';
import { utapi } from '@/app/api/uploadthing/core';
import { journalEntries } from '@/db/v3.schema';

export const journalRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      searchQuery: z.string().optional()
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

  getByDateRange: protectedProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ ctx, input }) => {
      return await JournalService.getEntriesInDateRange(ctx.userId, input.startDate, input.endDate);
    }),

  create: protectedProcedure
    .input(createJournalEntrySchema)
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const entry = await JournalService.createEntry(tx, ctx.userId, {
          ...input,
          images: input.images || [],
        });
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
        const entry = await JournalService.updateEntry(tx, ctx.userId, input.id, {
          ...input.data,
          images: input.data.images || [],
        });
        return entry;
      });
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return await JournalService.deleteEntry(ctx.userId, input);
    }),

  getStats: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      // Get existing stats
      const stats = await JournalService.getStats(ctx.userId, input);
      
      // Get streak information
      const streakInfo = await StreakService.getUserStreak(ctx.userId);
            
      // Return combined stats
      const result = {
        ...stats,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak
      };
            
      return result;
    }),

  getTags: protectedProcedure
    .query(async ({ ctx }) => {
      return await JournalService.getUserTags(ctx.userId);
    }),

  createEntry: protectedProcedure
    .input(z.object({
      content: z.string(),
      mood: z.number().min(1).max(10).optional(),
      activities: z.array(z.string()).optional(),
      symptoms: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        return await JournalService.createEntry(tx, ctx.userId, {
          date: new Date().toISOString().split('T')[0],
          title: input.content.substring(0, 50) + (input.content.length > 50 ? '...' : ''),
          content: input.content,
          mood: input.mood,
          tags: input.tags,
        });
      });
    }),

  deleteImage: protectedProcedure
    .input(z.object({
      imageUrl: z.string(),
      entryId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // If there's an entry ID, remove the image from the entry first
      if (input.entryId) {
        const entry = await db.query.journalEntries.findFirst({
          where: and(
            eq(journalEntries.id, input.entryId),
            eq(journalEntries.userId, ctx.userId)
          )
        });

        if (entry) {
          await db
            .update(journalEntries)
            .set({
              images: (entry.images as string[]).filter(img => img !== input.imageUrl),
              updatedAt: new Date()
            })
            .where(eq(journalEntries.id, input.entryId));
        }
      }

      // Extract the file key from the URL
      const fileKey = input.imageUrl.split('/').pop();
      if (!fileKey) throw new Error("Invalid image URL");

      // Delete from uploadthing
      try {
        await utapi.deleteFiles(fileKey);
      } catch (error) {
        console.error("Error deleting file from uploadthing:", error);
      }

      return { success: true };
    }),
});
