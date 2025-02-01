import { differenceInDays, parse, format } from 'date-fns';

export class StatsCalculator {
  static calculateStreak(entries: any[]) {
    if (!entries.length) return 0;

    // Sort entries by date in descending order (newest first)
    const sortedEntries = entries.sort((a, b) => 
      parse(b.date, 'yyyy-MM-dd', new Date()).getTime() - parse(a.date, 'yyyy-MM-dd', new Date()).getTime()
    );

    let streak = 1;
    let currentDate = parse(sortedEntries[0].date, 'yyyy-MM-dd', new Date());
    
    // Check if most recent entry is from today
    const today = new Date();
    if (format(currentDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) {
      return 0;
    }

    // Look at each consecutive day
    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = parse(sortedEntries[i].date, 'yyyy-MM-dd', new Date());
      const dayDiff = differenceInDays(currentDate, entryDate);

      // If exactly 1 day difference, increment streak
      if (dayDiff === 1) {
        streak++;
        currentDate = entryDate;
      }
      // If same day, continue checking
      else if (dayDiff === 0) {
        continue;
      }
      // If gap in days, stop counting
      else {
        break;
      }
    }

    return streak;
  }

  static calculateAverages(entries: any[]) {
    let totalMood = 0;
    let totalSleep = 0;
    let totalExercise = 0;
    let moodCount = 0;
    let sleepCount = 0;
    let exerciseCount = 0;

    const activityCounts = new Map<string, number>();
    const feelingCounts = new Map<string, number>();
    const symptomCounts = new Map<string, number>();
    const substanceCounts = new Map<string, number>();

    for (const entry of entries) {
      if (entry.mood) {
        totalMood += entry.mood;
        moodCount++;
      }
      if (entry.sleepHours) {
        totalSleep += parseFloat(entry.sleepHours);
        sleepCount++;
      }
      if (entry.exerciseMinutes) {
        totalExercise += entry.exerciseMinutes;
        exerciseCount++;
      }

      // Count activities
      entry.activities?.forEach((a: any) => {
        activityCounts.set(a.activity, (activityCounts.get(a.activity) || 0) + 1);
      });

      // Count feelings
      entry.feelings?.forEach((f: any) => {
        feelingCounts.set(f.feeling, (feelingCounts.get(f.feeling) || 0) + 1);
      });

      // Count symptoms
      entry.symptoms?.forEach((s: any) => {
        symptomCounts.set(s.symptom, (symptomCounts.get(s.symptom) || 0) + 1);
      });

      // Count substances
      entry.substances?.forEach((s: any) => {
        substanceCounts.set(s.substance, (substanceCounts.get(s.substance) || 0) + 1);
      });
    }

    // Sort maps by value in descending order
    const topActivities = new Map([...activityCounts.entries()].sort((a, b) => b[1] - a[1]));
    const topFeelings = new Map([...feelingCounts.entries()].sort((a, b) => b[1] - a[1]));
    const symptomFrequency = new Map([...symptomCounts.entries()].sort((a, b) => b[1] - a[1]));
    const substanceUse = new Map([...substanceCounts.entries()].sort((a, b) => b[1] - a[1]));

    return {
      averageMood: moodCount > 0 ? (totalMood / moodCount).toFixed(1) : "0",
      averageSleep: sleepCount > 0 ? (totalSleep / sleepCount).toFixed(1) : "0" ,
      averageExercise: exerciseCount > 0 ? Math.round(totalExercise / exerciseCount) : 0,
      topActivities,
      topFeelings,
      symptomFrequency,
      substanceUse
    };
  }
}
