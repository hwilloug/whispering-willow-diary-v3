'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format } from 'date-fns';
import Link from 'next/link';

type Entry = {
  time: string;
  title: string;
  content: string;
  mood: number;
  activities: string[];
  symptoms: string[];
};

type DayEntry = {
  date: Date;
  entries: Entry[];
  expanded: boolean;
};

export function JournalTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dayEntries, setDayEntries] = useState<DayEntry[]>(sampleDayEntries);

  const toggleDay = (date: Date) => {
    setDayEntries((prev) =>
      prev.map((day) =>
        day.date.getTime() === date.getTime()
          ? { ...day, expanded: !day.expanded }
          : day
      )
    );
  };

  const filteredEntries = dayEntries.filter((day) =>
    day.entries.some(
      (entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            className="pl-8 bg-primary-light text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEntries.map((day) => (
          <Card key={day.date.toISOString()} className="card-glass">
            <Collapsible open={day.expanded}>
              <CollapsibleTrigger asChild>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleDay(day.date)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {format(day.date, 'EEEE, MMMM d, yyyy')}
                      </CardTitle>
                      <CardDescription>
                        {day.entries.length} entries
                      </CardDescription>
                    </div>
                    {day.expanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent style={{ padding: 0 }}>
                  {day.entries.map((entry, index) => (
                    <div
                      key={index}
                      className="bg-primary-light border m-2 py-2 px-4 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.time}</span>
                          <span className="text-sm text-muted-foreground">
                            Mood: {entry.mood}/10
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/entry/${format(day.date, 'yyyy-MM-dd')}`}
                          >
                            <Button variant="ghost" size="icon">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-semibold">{entry.title}</h4>
                      <p className="text-muted-foreground">{entry.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.activities.map((activity, i) => (
                          <span
                            key={i}
                            className="bg-primary/10 text-primary text-sm px-2 py-1 rounded"
                          >
                            {activity}
                          </span>
                        ))}
                        {entry.symptoms.map((symptom, i) => (
                          <span
                            key={i}
                            className="bg-destructive/10 text-destructive text-sm px-2 py-1 rounded"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Link href={`/entry/${format(day.date, 'yyyy-MM-dd')}`}>
                    <Button
                      variant="outline"
                      className="w-full bg-primary-dark text-white border-none"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Entry for This Day
                    </Button>
                  </Link>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}

const sampleDayEntries: DayEntry[] = [
  {
    date: new Date(),
    expanded: true,
    entries: [
      {
        time: '9:00 AM',
        title: 'Morning Reflection',
        content:
          'Started the day with meditation and journaling. Feeling centered and ready for the day ahead.',
        mood: 8,
        activities: ['Meditation', 'Exercise'],
        symptoms: [],
      },
      {
        time: '2:30 PM',
        title: 'Afternoon Check-in',
        content:
          'Post-lunch energy dip. Taking short breaks helps maintain focus.',
        mood: 6,
        activities: ['Work', 'Reading'],
        symptoms: ['Fatigue'],
      },
    ],
  },
  {
    date: new Date(Date.now() - 86400000),
    expanded: false,
    entries: [
      {
        time: '10:00 AM',
        title: 'Therapy Session Notes',
        content: 'Productive session discussing anxiety management techniques.',
        mood: 7,
        activities: ['Therapy'],
        symptoms: ['Anxiety'],
      },
      {
        time: '8:00 PM',
        title: 'Evening Reflection',
        content: 'Completed all daily tasks. Feeling accomplished but tired.',
        mood: 8,
        activities: ['Self-care'],
        symptoms: ['Stress'],
      },
    ],
  },
  {
    date: new Date(Date.now() - 172800000),
    expanded: false,
    entries: [
      {
        time: '11:00 AM',
        title: 'Weekly Goals Review',
        content:
          'Setting intentions for the week. Focus on mindfulness and exercise.',
        mood: 9,
        activities: ['Planning', 'Goal Setting'],
        symptoms: [],
      },
    ],
  },
];
