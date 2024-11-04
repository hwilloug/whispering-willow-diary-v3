'use client';

import { NewEntryForm } from '@/components/new-entry-form';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function NewEntryPage() {
  const { date, id } = useParams()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link className="flex items-center justify-center" href="/">
            <BookOpen className="h-6 w-6" />
            <span className="ml-2 text-lg font-semibold">Journal</span>
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container max-w-3xl py-8">
        <NewEntryForm date={date as string} id={id as string} />
      </main>
    </div>
  );
}