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
import { Brain, CalendarDays, Dumbbell, Moon, Plus, Pill, Flame } from 'lucide-react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { HeaderNav } from '@/components/header-nav';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { trpc } from '@/lib/trpc';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const [isDailyAffirmationHidden, setIsDailyAffirmationHidden] = useState(false);

  const handleTabChange = (value: string) => {
    router.push(`/dashboard?tab=${value}`, { scroll: false });
  };

  const [dateRange, setDateRange] = useState<DateRange>({
    to: new Date(),
    from: subDays(new Date(), 7),
  });

  const { data: stats } = trpc.journal.getStats.useQuery({ startDate: format(dateRange.from!, 'yyyy-MM-dd'), endDate: format(dateRange.to!, 'yyyy-MM-dd') });

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const { data: todayEntries } = trpc.journal.getByDate.useQuery({ date: today });
  const { data: yesterdayEntries } = trpc.journal.getByDate.useQuery({ date: yesterday });

  const todayEntry = todayEntries?.[0];
  const yesterdayEntry = yesterdayEntries?.[0];

  const sleepDiff = todayEntry?.sleepHours && yesterdayEntry?.sleepHours
    ? Number(todayEntry.sleepHours) - Number(yesterdayEntry.sleepHours)
    : 0;

  const exerciseDiff = todayEntry?.exerciseMinutes && yesterdayEntry?.exerciseMinutes
    ? todayEntry.exerciseMinutes - yesterdayEntry.exerciseMinutes
    : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DailyAffirmation isHidden={isDailyAffirmationHidden} onHide={() => setIsDailyAffirmationHidden(true)} />
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-outline text-primary-light">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Link href={`/entry/${format(new Date(), 'yyyy-MM-dd')}/new`}>
              <Button className="bg-secondary hover:bg-secondary-dark text-white">
                <Plus className="mr-2 h-4 w-4" /> New Entry
              </Button>
            </Link>
          </div>
        </div>
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="flex justify-between items-center">
            <div className="bg-primary-dark/80 backdrop-blur-sm shadow-xl border border-black">
            <TabsTrigger value="overview" className="text-primary-light data-[state=active]:bg-primary-light/80 data-[state=active]:text-primary-dark">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="text-primary-light data-[state=active]:bg-primary-light/80 data-[state=active]:text-primary-dark">Analytics</TabsTrigger>
            <TabsTrigger value="journal" className="text-primary-light data-[state=active]:bg-primary-light/80 data-[state=active]:text-primary-dark">Journal</TabsTrigger>
            </div>
            {/* @ts-ignore */}
            { tab !== 'overview' && <CalendarDateRangePicker date={dateRange} setDate={setDateRange} className="bg-primary-light" />}
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Entry Streak</CardTitle>
                  <Flame className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">
                    {stats?.streak || 0} days
                  </div>
                  <p className="text-xs text-primary-dark/70">
                    {stats?.streak && stats.streak > 0 ? 'Keep it up!' : 'Start your streak today'}
                  </p>
                </CardContent>
              </Card>
              <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Sleep</CardTitle>
                  <Moon className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">{todayEntry?.sleepHours || '-'}h</div>
                  <p className="text-xs text-primary-dark/70">
                    {sleepDiff > 0 ? '+' : ''}{sleepDiff}h from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Exercise</CardTitle>
                  <Dumbbell className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">{todayEntry?.exerciseMinutes || '-'}min</div>
                  <p className="text-xs text-primary-dark/70">
                    {exerciseDiff > 0 ? '+' : ''}{exerciseDiff}min from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Mental Health</CardTitle>
                  <Brain className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">{todayEntry?.mood ? `${todayEntry.mood}/10` : '-'}</div>
                  <p className="text-xs text-primary-dark/70">
                    {todayEntry?.mood && yesterdayEntry?.mood && todayEntry.mood > yesterdayEntry.mood 
                      ? 'Improved from yesterday'
                      : todayEntry?.mood && yesterdayEntry?.mood && todayEntry.mood < yesterdayEntry.mood
                      ? 'Declined from yesterday'
                      : 'Same as yesterday'}
                  </p>
                </CardContent>
              </Card>
            </div>
            <Overview />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics dateRange={dateRange} />
          </TabsContent>
          <TabsContent value="journal">
            <JournalTab selectedDates={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}