import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-primary-light">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-primary-dark text-white">
        <Link className="flex items-center justify-center" href="/">
          <BookOpen className="h-6 w-6 text-white" />
          <span className="ml-2 text-2xl font-dancing-script text-white">
            Whispering Willow Diary
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:text-secondary-light hover:underline underline-offset-4"
            href="/sign-in"
          >
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-poetsen tracking-tighter text-primary-dark sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Digital Safe Space
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-400 font-ubuntu">
                  Write, reflect, and grow with our secure journaling platform.
                  Your thoughts, safely stored and always private.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/sign-up">
                  <Button className="bg-primary hover:bg-primary-dark text-white">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
