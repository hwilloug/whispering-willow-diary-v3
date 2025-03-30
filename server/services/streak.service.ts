import { db } from '@/db';
import { userStreaks, journalEntries } from '@/db/v3.schema';
import { eq, desc } from 'drizzle-orm';
import { differenceInDays, format, parse, isYesterday, isSameDay, addDays } from 'date-fns';
import { DbTransaction } from '@/db/types';

export class StreakService {
  static async getUserStreak(userId: string) {
    const streak = await db.query.userStreaks.findFirst({
      where: eq(userStreaks.userId, userId)
    });

    return streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null
    };
  }

  static async updateStreak(tx: DbTransaction, userId: string, entryDate: string) {
    const userStreak = await tx.query.userStreaks.findFirst({
      where: eq(userStreaks.userId, userId)
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    const entryDateObj = parse(entryDate, 'yyyy-MM-dd', new Date());
    
    // If entry date is in the future, don't update streak
    if (entryDate > today) {
      return userStreak;
    }

    // Get all entries to recalculate streak
    const entries = await tx.query.journalEntries.findMany({
      where: eq(journalEntries.userId, userId),
      orderBy: [desc(journalEntries.date)]
    });

    // Add the new entry date if it's not already included
    const allDates = new Set([...entries.map(e => e.date), entryDate]);
    const sortedDates = Array.from(allDates).sort().reverse();

    let currentStreak = 0;
    let lastDate = parse(today, 'yyyy-MM-dd', new Date());

    // Calculate streak by looking for consecutive days
    for (const dateStr of sortedDates) {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      const dayDiff = differenceInDays(lastDate, date);

      if (dayDiff <= 1) {
        currentStreak++;
        lastDate = date;
      } else {
        break;
      }
    }

    // Update longest streak if current streak is longer
    const longestStreak = Math.max(userStreak?.longestStreak || 0, currentStreak);

    // Update or insert streak record
    if (userStreak) {
      await tx.update(userStreaks)
        .set({
          currentStreak,
          longestStreak,
          lastEntryDate: entryDate
        })
        .where(eq(userStreaks.userId, userId));
    } else {
      await tx.insert(userStreaks)
        .values({
          userId,
          currentStreak,
          longestStreak,
          lastEntryDate: entryDate
        });
    }

    return { currentStreak, longestStreak, lastEntryDate: entryDate };
  }
} 