'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStreakIncentive } from '@/server/utils/streak-incentives';
import { Award } from 'lucide-react';

interface StreakIncentiveProps {
  currentStreak: number;
}

export function StreakIncentive({ currentStreak }: StreakIncentiveProps) {
  const currentIncentive = getStreakIncentive(currentStreak);
  
  return (
    <div className="space-y-4 h-full">
      {currentIncentive && (
        <Card className="card-glass shadow-lg border-2 border-secondary/50 bg-secondary/60 text-center h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium w-full text-center">Current Achievement</CardTitle>
            <Award className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent className="flex flex-col justify-center flex-1">
            <div className="text-xl font-bold mb-1">
              {currentIncentive.badge}
            </div>
            <p className="text-sm">
              {currentIncentive.message}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 