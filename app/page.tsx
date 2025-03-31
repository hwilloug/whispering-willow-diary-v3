import { HeaderNav } from '@/components/header-nav';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Moon, 
  Pill, 
  ArrowRight, 
  Target, 
  LineChart, 
  Calendar, 
  Shield, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-12 text-center">
              {/* Hero Section */}
              <div className="space-y-4 card-glass p-8 bg-secondary-light/60 rounded-lg max-w-4xl">
                <h1 className="text-4xl font-dancing-script tracking-tighter text-primary-dark sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Whispering Willow Diary
                </h1>
                <p className="mx-auto max-w-[800px] text-primary-dark md:text-xl font-ubuntu">
                  Your personal wellness companion for comprehensive mental health tracking, 
                  mood monitoring, and daily reflections. Take control of your well-being journey.
                </p>
                <Link href="/sign-up">
                  <Button className="bg-secondary hover:bg-secondary-light text-white text-lg px-8 py-6 mt-4">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Core Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
                <div className="p-6 card-glass rounded-lg shadow-lg">
                  <Brain className="h-12 w-12 text-primary-dark mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary-dark mb-2">Mental Wellness</h3>
                  <p className="text-primary-dark">Track your mood, symptoms, and receive daily affirmations for emotional support</p>
                </div>

                <div className="p-6 card-glass rounded-lg shadow-lg">
                  <Moon className="h-12 w-12 text-primary-dark mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary-dark mb-2">Sleep Tracking</h3>
                  <p className="text-primary-dark">Monitor your sleep patterns, quality, and establish healthy sleep routines</p>
                </div>

                <div className="p-6 card-glass rounded-lg shadow-lg">
                  <Pill className="h-12 w-12 text-primary-dark mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary-dark mb-2">Substance Tracking</h3>
                  <p className="text-primary-dark">Monitor substance use and understand its impact on your mental well-being</p>
                </div>
              </div>

              {/* Additional Features */}
              <div className="w-full max-w-6xl">
                <h2 className="text-3xl font-bold text-primary-dark mb-8">Comprehensive Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 card-glass rounded-lg shadow-lg">
                    <Target className="h-8 w-8 text-primary-dark mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-primary-dark mb-2">Goal Setting</h3>
                    <p className="text-primary-dark text-sm">Set and track personal wellness goals with progress monitoring</p>
                  </div>

                  <div className="p-6 card-glass rounded-lg shadow-lg">
                    <LineChart className="h-8 w-8 text-primary-dark mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-primary-dark mb-2">Analytics</h3>
                    <p className="text-primary-dark text-sm">Visualize your progress with detailed charts and insights</p>
                  </div>

                  <div className="p-6 card-glass rounded-lg shadow-lg">
                    <Calendar className="h-8 w-8 text-primary-dark mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-primary-dark mb-2">Daily Journal</h3>
                    <p className="text-primary-dark text-sm">Record daily reflections and track your emotional journey</p>
                  </div>

                  <div className="p-6 card-glass rounded-lg shadow-lg">
                    <Shield className="h-8 w-8 text-primary-dark mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-primary-dark mb-2">Private & Secure</h3>
                    <p className="text-primary-dark text-sm">Your data is encrypted and completely private</p>
                  </div>

                  <div className="p-6 card-glass rounded-lg shadow-lg">
                    <Sparkles className="h-8 w-8 text-primary-dark mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-primary-dark mb-2">Achievement System</h3>
                    <p className="text-primary-dark text-sm">Earn rewards and track your wellness streaks</p>
                  </div>

                  <div className="p-6 card-glass rounded-lg shadow-lg">
                    <BookOpen className="h-8 w-8 text-primary-dark mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-primary-dark mb-2">Customizable</h3>
                    <p className="text-primary-dark text-sm">Personalize tracking categories and wellness goals</p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="card-glass p-8 rounded-lg max-w-3xl bg-secondary/40">
                <h2 className="text-2xl font-bold text-gray-300 mb-4">Begin Your Wellness Journey Today</h2>
                <p className="text-gray-300 mb-6">
                  Join thousands of users who are taking control of their mental health and well-being with Whispering Willow Diary.
                </p>
                <Link href="/sign-up">
                  <Button className="bg-secondary hover:bg-secondary-light text-white text-lg px-8 py-6">
                    Create Your Free Account
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
