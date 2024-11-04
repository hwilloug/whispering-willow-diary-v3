'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

export function DailyAffirmation() {
  const { data } = trpc.journal.getAll.useQuery();

  const affirmation = useMemo(() => {
    if (!data) return '';

    // Sort entries by date descending and find first non-empty affirmation
    const latestAffirmation = data
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find(entry => entry.affirmation)?.affirmation;

    return latestAffirmation
  }, [data]);

  if (!affirmation) return null;

  return (
    <Card className="card-glass text-center bg-secondary/60">
      <CardHeader>
        <CardTitle>🌸 Daily Affirmation 🌸</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <p className="text-lg font-medium">{affirmation}</p>
      </CardContent>
    </Card>
  );
}
