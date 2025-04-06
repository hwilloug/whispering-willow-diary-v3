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
import Image from 'next/image';

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left space-y-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-dancing-script text-primary-dark text-outline-light leading-tight">
                  Your Digital Safe Space
                </h1>
                <p className="text-xl md:text-2xl text-primary-dark font-ubuntu max-w-2xl mx-auto lg:mx-0 font-bold text-outline-light">
                  Capture your thoughts, track your journey, and nurture your well-being with our thoughtfully designed digital journal.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/sign-up">
                    <Button className="bg-secondary hover:bg-secondary-dark text-white text-lg px-8 py-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl">
                      Start Journaling
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero image placeholder */}
              <div className="flex-1 relative aspect-square max-w-xl">
                <div className="w-full h-full rounded-2xl overflow-hidden card-glass">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-secondary-light/20" />
                  <Image
                    src="/screenshot.jpg"
                    alt="Digital journal illustration"
                    fill
                    className="object-cover mix-blend-overlay"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 section-glass">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-dancing-script text-primary-dark font-bold mb-4">
                Your Wellness Journey Companion
              </h2>
              <p className="text-lg text-primary-dark font-medium max-w-2xl mx-auto">
                Everything you need to maintain a meaningful journaling practice
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Core feature cards with subtle animations */}
              <div className="group card-glass p-8 rounded-2xl hover:card-glass-hover">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-primary mb-3">Mental Wellness</h3>
                <p className="text-primary-dark">Track your emotional journey with guided reflections and mood tracking</p>
              </div>

              <div className="group card-glass p-8 rounded-2xl hover:card-glass-hover">
                <Moon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-primary mb-3">Sleep Tracking</h3>
                <p className="text-primary-dark">Monitor your sleep patterns, quality, and establish healthy sleep routines</p>
              </div>

              <div className="group card-glass p-8 rounded-2xl hover:card-glass-hover">
                <LineChart className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-primary mb-3">Symptom Tracking</h3>
                <p className="text-primary-dark">Monitor mental health symptoms and identify patterns to better manage your well-being</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center card-glass p-12 rounded-3xl">
              <h2 className="text-3xl md:text-4xl font-dancing-script text-primary mb-6">
                Begin Your Journey Today
              </h2>
              <Link href="/sign-up">
                <Button className="bg-secondary hover:bg-secondary-dark text-white text-lg px-8 py-6 rounded-full transition-all duration-300">
                  Create Your Free Journal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
