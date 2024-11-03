'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';

export function HeaderNav() {
  return (
    <header className="bg-primary-dark">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <Image src="/whispering_willow_logo.png" alt="Whispering Willow Diary" width={48} height={48} />
          <span className="text-2xl font-dancing-script text-primary-light">Whispering Willow Diary</span>
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
          <UserButton />
        </nav>
      </div>
    </header>
  );
}