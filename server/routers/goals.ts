import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { db } from '@/db';
import { goals, goalMilestones, goalJournalEntries } from '@/db/v3.schema';
import { eq, asc } from 'drizzle-orm';

export const goalsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const goals = await db.query.goals.findMany({
      where: (goals, { eq }) => eq(goals.userId, ctx.userId),
      orderBy: (goals, { asc }) => [asc(goals.createdAt)],
      with: {
        subcategory: {
          with: {
            category: true,
          },
        },
        milestones: true,
        journalEntries: {
          orderBy: (entries, { desc }) => [desc(entries.entryDate)],
        },
      },
    });
    return goals;
  }),

  getCategories: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.goalCategories.findMany({
      with: {
        subcategories: true,
      },
    });
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const goals = await db.query.goals.findMany({
      where: (goals, { eq }) => eq(goals.userId, ctx.userId),
    });

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const nonArchivedGoals = goals.filter(g => g.status !== 'archived');

    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      overallProgress: nonArchivedGoals.length 
        ? Math.round(nonArchivedGoals.reduce((acc, g) => acc + Number(g.percentComplete), 0) / nonArchivedGoals.length) 
        : 0,
    };
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      subcategoryId: z.string(),
      targetDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.insert(goals).values({
        ...input,
        userId: ctx.userId,
      });
    }),

  createWithMilestones: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      subcategoryId: z.string(),
      targetDate: z.string(),
      milestones: z.array(z.object({
        description: z.string(),
        dueDate: z.string(),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const { milestones, ...goalData } = input;
      
      return await db.transaction(async (tx) => {
        const [goal] = await tx.insert(goals)
          .values({
            ...goalData,
            userId: ctx.userId,
          })
          .returning();

        if (milestones.length > 0) {
          await tx.insert(goalMilestones)
            .values(
              milestones.map(milestone => ({
                goalId: goal.id,
                description: milestone.description,
                dueDate: milestone.dueDate,
              }))
            );
        }

        return goal;
      });
    }),

  addUpdate: protectedProcedure
    .input(z.object({
      goalId: z.string(),
      notes: z.string(),
      progressUpdate: z.number().optional(),
      entryDate: z.string().default(() => new Date().toISOString()),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const [entry] = await tx.insert(goalJournalEntries)
          .values({
            ...input,
            userId: ctx.userId,
            progressUpdate: input.progressUpdate?.toString(),
          })
          .returning();

        if (input.progressUpdate !== undefined) {
          await tx.update(goals)
            .set({ 
              percentComplete: input.progressUpdate.toString(),
              status: input.progressUpdate === 100 ? 'completed' : 'active',
              updatedAt: new Date(),
            })
            .where(eq(goals.id, input.goalId));
        }

        return entry;
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      subcategoryId: z.string(),
      targetDate: z.string(),
      status: z.enum(['active', 'completed', 'on_hold', 'archived']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return await db.update(goals)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(goals.id, id))
        .returning();
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        // Delete related records first
        await tx.delete(goalJournalEntries)
          .where(eq(goalJournalEntries.goalId, input.id));
        await tx.delete(goalMilestones)
          .where(eq(goalMilestones.goalId, input.id));
        // Delete the goal
        return await tx.delete(goals)
          .where(eq(goals.id, input.id))
          .returning();
      });
    }),

  archive: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.update(goals)
        .set({ 
          status: 'archived',
          updatedAt: new Date(),
        })
        .where(eq(goals.id, input.id))
        .returning();
    }),
}); 