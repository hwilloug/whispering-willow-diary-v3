import { HeaderNav } from '@/components/header-nav';
import { Button } from '@/components/ui/button';
import { Brain, Moon, Dumbbell, ArrowRight, Heart, Pill } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 card-glass p-6 bg-secondary-light/60 rounded-lg">
                <h1 className="text-4xl font-dancing-script tracking-tighter text-primary-dark sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Whispering Willow Diary
                </h1>
                <p className="mx-auto max-w-[800px] text-primary-dark md:text-xl font-ubuntu">
                  Your personal wellness companion for tracking mood, sleep, exercise, and daily reflections.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
                <div className="p-6 card-glass rounded-lg shadow-lg">
                  <Brain className="h-12 w-12 text-primary-dark mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary-dark mb-2">Mental Wellness</h3>
                  <p className="text-primary-dark">Track your mood, symptoms, and daily affirmations</p>
                </div>

                <div className="p-6 card-glass rounded-lg shadow-lg">
                  <Moon className="h-12 w-12 text-primary-dark mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary-dark mb-2">Sleep Tracking</h3>
                  <p className="text-primary-dark">Monitor your sleep patterns and quality</p>
                </div>

                <div className="p-6 card-glass rounded-lg shadow-lg">
                  <Pill className="h-12 w-12 text-primary-dark mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary-dark mb-2">Substance Use Tracking</h3>
                  <p className="text-primary-dark">Monitor your drug use and how it affects your mental health</p>
                </div>
              </div>

              <div className="space-y-4">
                <Link href="/sign-up">
                  <Button className="bg-secondary hover:bg-secondary-light text-white text-lg px-8 py-6">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
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
