export interface StreakIncentive {
  threshold: number;
  message: string;
  badge: string;
}

export const streakIncentives: StreakIncentive[] = [
  {
    threshold: 3,
    message: "You're building a great habit! Keep it up!",
    badge: "🌱 Seedling"
  },
  {
    threshold: 7,
    message: "A full week of entries! Your consistency is impressive!",
    badge: "🌿 Sprout"
  },
  {
    threshold: 14,
    message: "Two weeks strong! You're making journaling a part of your routine!",
    badge: "🌳 Sapling"
  },
  {
    threshold: 30,
    message: "A month of consistent journaling! You're a reflection master!",
    badge: "🌲 Tree"
  },
  {
    threshold: 60,
    message: "Two months of dedication! Your commitment to self-reflection is inspiring!",
    badge: "🌳🌳 Grove"
  },
  {
    threshold: 100,
    message: "100 days! You've reached the journaling elite status!",
    badge: "🌲🌳🌿 Forest"
  },
  {
    threshold: 365,
    message: "A full year of journaling! Your dedication to self-improvement is extraordinary!",
    badge: "🏆 Champion"
  }
];

export function getStreakIncentive(currentStreak: number): StreakIncentive | null {
  // Find the highest threshold that the current streak meets or exceeds
  for (let i = streakIncentives.length - 1; i >= 0; i--) {
    if (currentStreak >= streakIncentives[i].threshold) {
      return streakIncentives[i];
    }
  }
  return null;
}

export function getNextStreakIncentive(currentStreak: number): { incentive: StreakIncentive, daysRemaining: number } | null {
  // Find the next threshold that the user hasn't reached yet
  for (let i = 0; i < streakIncentives.length; i++) {
    if (currentStreak < streakIncentives[i].threshold) {
      return {
        incentive: streakIncentives[i],
        daysRemaining: streakIncentives[i].threshold - currentStreak
      };
    }
  }
  return null; // User has reached all thresholds
} 