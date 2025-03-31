'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Image,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { addDays, format, parse, toDate } from 'date-fns';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import type { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '@/server';
import React from 'react';
import { Toggle } from './ui/toggle';
import { Switch } from './ui/switch';
import EntryTags from './journal/entry-tags';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from "rehype-sanitize";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Entry = RouterOutput['journal']['getAll']['entries'][number] & {
  images?: string[];
};

type DayEntry = {
  date: Date;
  entries: Entry[];
  expanded: boolean;
};

interface JournalTabProps {
  selectedDates: { from?: Date, to?: Date };
}

export function JournalTab({ selectedDates }: JournalTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [showEmptyDays, setShowEmptyDays] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const { data } = trpc.journal.getAll.useQuery({ searchQuery: searchQuery, page, limit: 10 });
  const utils = trpc.useContext();
  const { mutate: deleteEntry } = trpc.journal.delete.useMutation({
    onSuccess: () => {
      utils.journal.getAll.invalidate();
    }
  });
  const groupedEntries = useMemo(() => {
    if (!data?.entries) return [];
    
    const groups = new Map<string, Entry[]>();
    data.entries.forEach(entry => {
      console.log(entry.date)
      const dateStr = entry.date
      if (!groups.has(dateStr)) {
        groups.set(dateStr, []);
      }
      groups.get(dateStr)?.push(entry);
    });

    let entries = Array.from(groups.entries()).map(([dateStr, entries]) => ({
      date: parse(dateStr, 'yyyy-MM-dd', new Date()),
      entries: entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      expanded: true
    }));

    if (showEmptyDays && entries.length > 0) {
      // Sort entries by date
      entries.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      // Find date range
      const latestDate = entries[0].date;
      const earliestDate = entries[entries.length - 1].date;
      
      // Create array of all dates in range
      const allDates: DayEntry[] = [];
      let currentDate = earliestDate;
      
      while (currentDate <= latestDate) {
        const existingEntry = entries.find(
          entry => format(entry.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
        );
        
        if (existingEntry) {
          allDates.push(existingEntry);
        } else {
          allDates.push({
            date: currentDate,
            entries: [],
            expanded: true
          });
        }
        
        currentDate = addDays(currentDate, 1);
      }
      
      return allDates.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    return entries;
  }, [data?.entries, showEmptyDays]);

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
        <div className="flex items-center gap-2">
          <Pagination page={page} setPage={setPage} totalPages={data?.pagination.totalPages || 1} />
          <Switch
            checked={showEmptyDays}
            onCheckedChange={setShowEmptyDays}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {groupedEntries.map((day) => (
          <DayEntries day={day} toggleDay={() => {}} onDeleteEntry={(id) => setEntryToDelete(id)} />
        ))}
      </div>

      <Pagination page={page} setPage={setPage} totalPages={data?.pagination.totalPages || 1} />

      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent className="bg-primary-light border-primary-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary-dark">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete your journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-primary-dark border-primary-dark/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (entryToDelete) {
                  deleteEntry(entryToDelete);
                  setEntryToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-none"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const DayEntries = ({
  day,
  toggleDay,
  onDeleteEntry
}: {
  day: DayEntry;
  toggleDay: (date: Date) => void;
  onDeleteEntry: (id: string) => void;
}) => {
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
              <EntryCard 
                key={index} 
                entry={entry} 
                day={day}
                onDelete={onDeleteEntry}
              />
            ))}
            <div className="flex justify-center px-2 pb-2">
              <Link
                href={`/entry/${format(day.date, 'yyyy-MM-dd')}/new`}
                className="w-full"
              >
                <Button 
                  className="bg-primary-dark hover:bg-primary-dark/90 text-white w-full" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </Link>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

const EntryCard = ({
  entry,
  day,
  onDelete
}: {
  entry: Entry;
  day: DayEntry;
  onDelete: (id: string) => void;
}) => {
  return (
    <div
    className="bg-primary-light border m-2 py-2 px-4 rounded-lg hover:bg-muted/50"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-medium">{format(entry.createdAt, 'h:mm a')}</span>
        {entry.mood && <span className="text-sm text-muted-foreground">
          Mood: {entry.mood}/10
        </span>}
      </div>
      <div className="flex gap-2">
        <Link
          href={`/entry/${format(day.date, 'yyyy-MM-dd')}/${entry.id}`}
        >
          <Button variant="ghost" size="icon">
            <Edit2 className="h-4 w-4" />
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onDelete(entry.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
    <h4 className="font-semibold">{entry.title}</h4>

    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
        {entry.content || ''}
      </ReactMarkdown>
    </div>
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
      <EntryTags tags={entry.tags} />
    </div>
    {entry.images && entry.images.length > 0 && (
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {entry.images.map((imageUrl, index) => (
          <div key={index} className="relative aspect-square group">
            <img
              src={imageUrl}
              alt={`Image ${index + 1} for entry`}
              className="h-full w-full rounded-lg object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <a 
                href={imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-blue-200"
              >
                <Image className="h-6 w-6" />
              </a>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
  )
}

const Pagination = ({page, setPage, totalPages}: {page: number, setPage: (page: number) => void, totalPages: number}) => {
  return (
    <div className="space-x-2">
      {page > 1 && <Button onClick={() => setPage(page - 1)}>Previous Page</Button>}
      {page < totalPages && <Button onClick={() => setPage(page + 1)}>Next Page</Button>}
    </div>
  )
}