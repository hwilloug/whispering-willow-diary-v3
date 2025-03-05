import { db } from '@/db';
import { userStreaks } from '@/db/v3.schema';
import { eq } from 'drizzle-orm';
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
    // Get the user's current streak info
    const userStreak = await tx.query.userStreaks.findFirst({
      where: eq(userStreaks.userId, userId)
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    const entryDateObj = parse(entryDate, 'yyyy-MM-dd', new Date());
    
    // If entry date is in the future, don't update streak
    if (entryDate > today) {
      return userStreak;
    }

    let currentStreak = 1; // Default to 1 for a new streak
    let longestStreak = userStreak?.longestStreak || 0;

    // If user has a previous streak
    if (userStreak?.lastEntryDate) {
      const lastEntryDateObj = parse(userStreak.lastEntryDate, 'yyyy-MM-dd', new Date());
          
      // Calculate the expected next day for the streak
      const expectedNextDay = addDays(lastEntryDateObj, 1);
            
      // If the entry is for the expected next day, increment streak
      if (isSameDay(entryDateObj, expectedNextDay)) {
        currentStreak = (userStreak.currentStreak || 0) + 1;
      } 
      // If the entry is for the same day as the last entry, maintain current streak
      else if (isSameDay(entryDateObj, lastEntryDateObj)) {
        currentStreak = userStreak.currentStreak || 1;
      }
      // Otherwise (gap in days or entry for a previous day), reset to 1
      else {
        console.log("Entry is not consecutive, resetting streak to 1");
      }
    } else {
      console.log("No previous streak data, starting new streak");
    }

    // Update longest streak if current streak is longer
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update or create the user streak record
    if (userStreak) {
      return await tx
        .update(userStreaks)
        .set({
          currentStreak,
          longestStreak,
          lastEntryDate: entryDate,
          updatedAt: new Date()
        })
        .where(eq(userStreaks.userId, userId))
        .returning();
    } else {
      return await tx
        .insert(userStreaks)
        .values({
          userId,
          currentStreak,
          longestStreak,
          lastEntryDate: entryDate,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }
  }
} 