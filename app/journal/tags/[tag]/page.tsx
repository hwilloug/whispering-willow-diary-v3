'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import EntryTags from '@/components/journal/entry-tags';
import React from 'react';
import { HeaderNav } from '@/components/header-nav';

export default function TaggedEntriesPage() {
  const params = useParams();
  const router = useRouter();
  const tag = decodeURIComponent(params.tag as string);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading } = trpc.journal.getAll.useQuery({
    page,
    limit,
  });
  
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  
  useEffect(() => {
    if (data?.entries) {
      setFilteredEntries(
        data.entries.filter((entry) => entry.tags && entry.tags.includes(tag))
      );
    }
  }, [data, tag]);

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Link className="flex items-center text-blue-500 hover:text-blue-700" href="/dashboard?tab=journal">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="font-medium">Back to Journal</span>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Entries tagged with #{tag}</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-lg mb-4">No entries found with this tag.</p>
            <Link href="/dashboard?tab=journal">
              <Button>Back to Journal</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="card-glass">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{entry.title}</CardTitle>
                      <CardDescription>
                        {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/entry/${entry.date}/${entry.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {entry.content?.split('\n').map((line: string, i: number) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < (entry.content?.split('\n').length || 0) - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.mood && (
                      <span className="text-sm text-muted-foreground">
                        Mood: {entry.mood}/10
                      </span>
                    )}
                    
                    {entry.activities && entry.activities.map((activity: any, i: number) => (
                      <span
                        key={i}
                        className="bg-primary/10 text-primary text-sm px-2 py-1 rounded"
                      >
                        {activity.activity}
                      </span>
                    ))}
                    
                    {entry.symptoms && entry.symptoms.map((symptom: any, i: number) => (
                      <span
                        key={i}
                        className="bg-destructive/10 text-destructive text-sm px-2 py-1 rounded"
                      >
                        {symptom.symptom}
                      </span>
                    ))}
                    
                    <EntryTags tags={entry.tags.filter((t: string) => t !== tag) || []} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {page > 1 && (
              <Button onClick={() => setPage(page - 1)}>
                Previous Page
              </Button>
            )}
            {page < data.pagination.totalPages && (
              <Button onClick={() => setPage(page + 1)}>
                Next Page
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 