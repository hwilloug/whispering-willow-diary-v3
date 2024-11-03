'use client';

import { BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function HeaderNav() {
  return (
    <header className="bg-primary-dark">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-white" />
          <span className="text-2xl font-dancing-script text-white">Whispering Willow Diary</span>
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium text-white hover:text-primary-light hover:underline underline-offset-4"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-sm font-medium text-white hover:text-primary-light hover:underline underline-offset-4"
            href="/settings"
          >
            Settings
          </Link>
          <Link href="/sign-in">
            <Button variant="ghost" size="icon" className="text-white hover:text-primary-light">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}