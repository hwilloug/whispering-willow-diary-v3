'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { Overview } from '@/components/overview';
import { RecentEntries } from '@/components/recent-entries';
import { Analytics } from '@/components/analytics';
import { JournalTab } from '@/components/journal-tab';
import { DailyAffirmation } from '@/components/daily-affirmation';
import { Brain, CalendarDays, Dumbbell, Moon, Plus, Pill } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { HeaderNav } from '@/components/header-nav';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    router.push(`/dashboard?tab=${value}`, { scroll: false });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DailyAffirmation />
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-outline text-primary-light">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Link href={`/entry/${format(new Date(), 'yyyy-MM-dd')}/new`}>
              <Button className="bg-secondary hover:bg-secondary-dark text-white">
                <Plus className="mr-2 h-4 w-4" /> New Entry
              </Button>
            </Link>
          </div>
        </div>
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="bg-primary-dark/80 backdrop-blur-sm shadow-xl border border-black">
            <TabsTrigger value="overview" className="text-primary-light data-[state=active]:bg-primary-light/80 data-[state=active]:text-primary-dark">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="text-primary-light data-[state=active]:bg-primary-light/80 data-[state=active]:text-primary-dark">Analytics</TabsTrigger>
            <TabsTrigger value="journal" className="text-primary-light data-[state=active]:bg-primary-light/80 data-[state=active]:text-primary-dark">Journal</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Sleep Quality</CardTitle>
                  <Moon className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">7.5h</div>
                  <p className="text-xs text-primary-dark/70">
                    +0.5h from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Exercise</CardTitle>
                  <Dumbbell className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">45min</div>
                  <p className="text-xs text-primary-dark/70">
                    +10min from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Mental Health</CardTitle>
                  <Brain className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">Good</div>
                  <p className="text-xs text-primary-dark/70">
                    Improved from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Medication</CardTitle>
                  <Pill className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">Taken</div>
                  <p className="text-xs text-primary-dark/70">
                    On schedule
                  </p>
                </CardContent>
              </Card>
            </div>
            <Overview />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
          <TabsContent value="journal">
            <JournalTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}