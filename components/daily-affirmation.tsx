'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ThumbsUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';

interface DailyAffirmationProps {
  isHidden?: boolean;
  onHide?: () => void;
}

export function DailyAffirmation({ isHidden = false, onHide }: DailyAffirmationProps) {
  const { data } = trpc.journal.getAll.useQuery({ sortBy: 'date', sortOrder: 'desc', limit: 1 });

  const affirmation = useMemo(() => {
    return data?.entries[0]?.affirmation;
  }, [data]);

  if (!affirmation || isHidden) return null;

  return (
    <Card className="card-glass text-center bg-secondary/60">
      <CardHeader className="relative">
        <CardTitle>🌸 Daily Affirmation 🌸</CardTitle>
        {!isHidden && onHide && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onHide}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <p className="text-lg font-medium">{affirmation}</p>
      </CardContent>
    </Card>
  );
}
