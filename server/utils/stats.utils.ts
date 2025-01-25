import { differenceInDays, parse, format } from 'date-fns';

export class StatsCalculator {
  static calculateStreak(entries: any[]) {
    let currentStreak = 0;
    let prevDate: Date | null = null;

    for (const entry of entries) {
      const entryDate = parse(entry.date, 'yyyy-MM-dd', new Date());

      if (!prevDate) {
        if (entry.date === format(new Date(), 'yyyy-MM-dd')) currentStreak = 1;
        prevDate = entryDate;
        continue;
      }

      if (format(entryDate, 'yyyy-MM-dd') === format(prevDate, 'yyyy-MM-dd')) continue;

      const dayDiff = differenceInDays(entryDate, prevDate);
      if (dayDiff <= 1) {
        currentStreak++;
      } else {
        break;
      }

      prevDate = entryDate;
    }

    return currentStreak;
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
