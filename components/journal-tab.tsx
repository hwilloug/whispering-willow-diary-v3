'use client';

import { useEffect, useState } from 'react';
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
import { format, parse, isToday } from 'date-fns';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import type { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '@/server';
import { DateRange } from 'react-day-picker';
import React from 'react';

type RouterOutput = inferRouterOutputs<AppRouter>;
type Entry = RouterOutput['journal']['getAll'][number];

type DayEntry = {
  date: Date;
  entries: Entry[];
  expanded: boolean;
};

interface JournalTabProps {
  selectedDates: { from?: Date, to?: Date };
}

export function JournalTab({ selectedDates }: JournalTabProps) {
  const { data: entries } = trpc.journal.getAll.useQuery()

  const [searchQuery, setSearchQuery] = useState('');
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);

  useEffect(() => {
    // Group entries by date if we have entries
    const entriesByDate = entries?.reduce((acc: { [key: string]: Entry[] }, entry) => {
      const date = parse(entry.date, 'yyyy-MM-dd', new Date());
      const dateStr = date.toDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(entry);
      return acc;
    }, {}) || {};

    if (!selectedDates || !selectedDates.from || !selectedDates.to) {
      setDayEntries([]);
      return;
    }

    // Create array of all dates in range
    const allDates: Date[] = [];
    const currentDate = new Date(selectedDates.from.getTime());
    while (currentDate <= new Date(selectedDates.to.getTime())) {
      allDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create DayEntry array for all dates in range
    const dayEntries: DayEntry[] = allDates.map(date => {
      // Set time to midnight for consistent comparison
      const normalizedDate = new Date(date.setHours(0, 0, 0, 0));
      return {
        date: normalizedDate,
        entries: entriesByDate[normalizedDate.toDateString()] || [],
        expanded: isToday(normalizedDate)
      };
    });

    // Sort by date descending
    dayEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

    setDayEntries(dayEntries);
  }, [entries, selectedDates]);

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
    searchQuery === '' || day.entries.some(
      (entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.content?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
          <DayEntries day={day} toggleDay={toggleDay} />
        ))}
      </div>
    </div>
  );
}

const DayEntries = ({day, toggleDay}: {day: DayEntry, toggleDay: (date: Date) => void}) => {
  return (
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
                {day.entries.length} {day.entries.length === 1 ? 'entry' : 'entries'}
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
            <EntryCard key={index} entry={entry} day={day} />
          ))}
          <Link href={`/entry/${format(day.date, 'yyyy-MM-dd')}/new`}>
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
  )
}

const EntryCard = ({entry, day}: {entry: Entry, day: DayEntry}) => {
  return (
    <div
    className="bg-primary-light border m-2 py-2 px-4 rounded-lg hover:bg-muted/50"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-medium">{format(entry.createdAt, 'h:mm a')}</span>
        <span className="text-sm text-muted-foreground">
          Mood: {entry.mood}/10
        </span>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/entry/${format(day.date, 'yyyy-MM-dd')}/${entry.id}`}
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
    <p className="text-muted-foreground">
      {entry.content?.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < (entry.content?.split('\n').length || 0) - 1 && <br />}
        </React.Fragment>
      ))}
    </p>
    <div className="flex flex-wrap gap-2">
      {entry.activities.map((activity, i) => (
        <span
          key={i}
          className="bg-primary/10 text-primary text-sm px-2 py-1 rounded"
        >
          {activity.activity}
        </span>
      ))}
      {entry.symptoms.map((symptom, i) => (
        <span
          key={i}
          className="bg-destructive/10 text-destructive text-sm px-2 py-1 rounded"
        >
          {symptom.symptom}
        </span>
      ))}
    </div>
  </div>
  )
}

const Pagination = ({page, setPage}: {page: number, setPage: (page: number) => void}) => {
  return (
    <div className="space-x-2">
      <Button>Previous Page</Button>
      <Button>Next Page</Button>
    </div>
  )
}