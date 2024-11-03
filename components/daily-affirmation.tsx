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
import { useState } from 'react';

const affirmations = [
  'I am capable of achieving anything I set my mind to',
  'Every day is a new opportunity for growth',
  'I trust in my journey and embrace the process',
  'I am worthy of love, respect, and happiness',
  'My potential to succeed is infinite',
  'I choose to be confident and self-assured',
  'I am in charge of my own happiness',
  'I celebrate my individuality',
  'I am resilient and can overcome any challenge',
  'My possibilities are endless',
];

export function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState(() => {
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  });

  const getNewAffirmation = () => {
    const newAffirmation =
      affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(newAffirmation);
  };

  return (
    <Card className="card-glass text-center bg-secondary/60">
      <CardHeader>
        <CardTitle>Daily Affirmation</CardTitle>
        <CardDescription>Start your day with positivity</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <p className="text-lg font-medium">{affirmation}</p>
        <Button variant="ghost" size="icon" onClick={getNewAffirmation}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
