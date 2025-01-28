import { db } from '@/db';
import { journalEntries, entryActivities, entryFeelings, entrySymptoms, substanceUse } from '@/db/v3.schema';
import { eq, and, desc, or, Column, ilike, sql } from 'drizzle-orm';
import type { DbTransaction } from '@/db/types';

export class JournalService {
  static async getAllEntries(userId: string, input: { page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc', searchQuery?: string, groupBy?: string } | undefined) {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', searchQuery = '', groupBy = 'date' } = input || {};
    const offset = (page - 1) * limit;

    // Build dynamic orderBy based on sortBy parameter
    const orderByField = journalEntries[sortBy as keyof typeof journalEntries] as Column;
    const orderByClause = sortOrder === 'desc' && orderByField ? desc(orderByField) : orderByField;

    const [entries, [{ count }]] = await Promise.all([
      db.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.userId, userId),
          ilike(journalEntries.title, `%${searchQuery}%`)
        ),
        orderBy: [orderByClause],
        limit: limit,
        offset: offset,
        with: {
          activities: true,
          feelings: true,
          symptoms: true,
          substances: true
        },
      }),
      db.select({ count: sql`count(*)`.mapWith(Number) })
        .from(journalEntries)
        .where(and(
          eq(journalEntries.userId, userId),
          ilike(journalEntries.title, `%${searchQuery}%`)
        ))
    ]);

    return {
      entries,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  static async getEntryById(userId: string, id: string) {
    return await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.id, id)
      ),
      with: {
        activities: true,
        feelings: true,
        symptoms: true,
        substances: true
      }
    });
  }

  static async getEntriesByDate(userId: string, date: string) {
    return await db.query.journalEntries.findMany({
      where: and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.date, date)
      ),
      with: {
        activities: true,
        feelings: true,
        symptoms: true,
        substances: true
      }
    });
  }

  static async createEntry(tx: DbTransaction, userId: string, input: any) {
    const [entry] = await tx
      .insert(journalEntries)
      .values({
        userId,
        date: input.date,
        title: input.title,
        content: input.content,
        mood: input.mood,
        sleepHours: input.sleepHours?.toFixed(1),
        exerciseMinutes: input.exerciseMinutes,
        affirmation: input.affirmation,
      })
      .returning();

    await this.createRelatedRecords(tx, entry.id, input);
    return entry;
  }

  static async updateEntry(tx: DbTransaction, userId: string, id: string, input: any) {
    const [entry] = await tx
      .update(journalEntries)
      .set({
        title: input.title,
        content: input.content,
        mood: input.mood,
        sleepHours: input.sleepHours?.toFixed(1),
        exerciseMinutes: input.exerciseMinutes,
        affirmation: input.affirmation,
        updatedAt: new Date()
      })
      .where(and(
        eq(journalEntries.id, id),
        eq(journalEntries.userId, userId)
      ))
      .returning();

    await this.deleteRelatedRecords(tx, id);
    await this.createRelatedRecords(tx, entry.id, input);
    return entry;
  }

  static async deleteEntry(userId: string, id: string) {
    return await db
      .delete(journalEntries)
      .where(and(
        eq(journalEntries.id, id),
        eq(journalEntries.userId, userId)
      ))
      .returning();
  }

  static async createRelatedRecords(tx: DbTransaction, entryId: string, input: any) {
    if (input.activities?.length > 0) {
      await tx.insert(entryActivities).values(
        input.activities.map((activity: string) => ({
          entryId,
          activity
        }))
      );
    }

    if (input.feelings?.length > 0) {
      await tx.insert(entryFeelings).values(
        input.feelings.map((feeling: string) => ({
          entryId,
          feeling
        }))
      );
    }

    if (input.symptoms?.length > 0) {
      await tx.insert(entrySymptoms).values(
        input.symptoms.map(({ symptom, severity, category }: any) => ({
          entryId,
          symptom,
          severity,
          category
        }))
      );
    }

    if (input.substances?.length > 0) {
      await tx.insert(substanceUse).values(
        input.substances.map(({ substance, amount, notes }: any) => ({
          entryId,
          substance,
          amount,
          notes
        }))
      );
    }
  }

  static async deleteRelatedRecords(tx: DbTransaction, entryId: string) {
    await tx.delete(entryActivities).where(eq(entryActivities.entryId, entryId));
    await tx.delete(entryFeelings).where(eq(entryFeelings.entryId, entryId));
    await tx.delete(entrySymptoms).where(eq(entrySymptoms.entryId, entryId));
    await tx.delete(substanceUse).where(eq(substanceUse.entryId, entryId));
  }

  static async getEntriesInDateRange(userId: string, dates: string[]) {
    return await db.query.journalEntries.findMany({
      where: and(
        eq(journalEntries.userId, userId),
        or(...dates.map(date => eq(journalEntries.date, date)))
      ),
      with: {
        activities: true,
        feelings: true,
        symptoms: true,
        substances: true
      }
    });
  }

  static async getAllEntriesForStreak(userId: string) {
    return await db.query.journalEntries.findMany({
      where: eq(journalEntries.userId, userId),
      orderBy: [desc(journalEntries.date)]
    });
  }
} 