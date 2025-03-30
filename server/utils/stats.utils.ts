import { differenceInDays, parse, format, subDays } from 'date-fns';

export class StatsCalculator {
  static calculateStreak(entries: any[]) {
    if (!entries.length) return 0;

    // Sort entries by date in descending order (newest first)
    const uniqueDates = new Set(entries.map(entry => entry.date));
    const sortedDates = Array.from(uniqueDates).sort().reverse();

    let currentStreak = 0;
    let lastDate = new Date();
    const today = format(lastDate, 'yyyy-MM-dd');

    // If no entry for today, start counting from yesterday
    if (!uniqueDates.has(today)) {
      lastDate = subDays(lastDate, 1);
    }

    // Count consecutive days
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
