'use client';

import { NewEntryForm } from '@/components/new-entry-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HeaderNav } from '@/components/header-nav';

export default function NewEntryPage() {
  const { date } = useParams();
  const formattedDate = new Date(date as string).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <main className="flex-1 container max-w-3xl py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="hover:text-primary-light">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <NewEntryForm date={date as string} />
      </main>
    </div>
  );
}
