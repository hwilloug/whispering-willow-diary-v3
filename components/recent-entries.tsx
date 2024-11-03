'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function RecentEntries() {
  return (
    <div className="space-y-8">
      {recentEntries.map((entry, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{entry.mood}/10</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{entry.title}</p>
            <p className="text-sm text-muted-foreground">
              {entry.date}
            </p>
          </div>
          <div className="ml-auto font-medium">{entry.symptoms.join(', ')}</div>
        </div>
      ))}
    </div>
  );
}

const recentEntries = [
  {
    title: 'Productive day',
    mood: 8,
    date: 'Today, 2:45 PM',
    symptoms: ['Anxiety'],
  },
  {
    title: 'Morning reflection',
    mood: 7,
    date: 'Today, 9:00 AM',
    symptoms: ['Stress'],
  },
  {
    title: 'Evening thoughts',
    mood: 9,
    date: 'Yesterday, 8:30 PM',
    symptoms: ['None'],
  },
  {
    title: 'Weekly check-in',
    mood: 6,
    date: 'Yesterday, 2:15 PM',
    symptoms: ['Depression', 'Anxiety'],
  },
  {
    title: 'Morning meditation',
    mood: 8,
    date: '2 days ago',
    symptoms: ['None'],
  },
];