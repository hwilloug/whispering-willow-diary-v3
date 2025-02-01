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
import { Brain, CalendarDays, Dumbbell, Moon, Plus, Pill, Flame, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { HeaderNav } from '@/components/header-nav';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { trpc } from '@/lib/trpc';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const [isDailyAffirmationHidden, setIsDailyAffirmationHidden] = useState(false);
  const [filter, setFilter] = useState<'week' | 'weeks' | 'month' | 'months' | 'year'>('week')

  const handleTabChange = (value: string) => {
    router.push(`/dashboard?tab=${value}`, { scroll: false });
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const { data: stats, isLoading: statsLoading } = trpc.journal.getStats.useQuery({ startDate: format(dateRange?.from || new Date(), 'yyyy-MM-dd'), endDate: format(dateRange?.to || new Date(), 'yyyy-MM-dd') });

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const { data: todayEntries } = trpc.journal.getByDate.useQuery({ date: today });
  const { data: yesterdayEntries } = trpc.journal.getByDate.useQuery({ date: yesterday });

  const todayStats = useMemo(() => {
    if (!todayEntries?.length) return { sleep: 0, mood: 0, exercise: 0 };
    
    const totalSleep = todayEntries.reduce((sum, entry) => sum + (entry.sleepHours ? Number(entry.sleepHours) : 0), 0);
    const moodEntries = todayEntries.filter(entry => entry.mood);
    const avgMood = moodEntries.length ? moodEntries.reduce((sum, entry) => sum + entry.mood!, 0) / moodEntries.length : 0;
    const totalExercise = todayEntries.reduce((sum, entry) => sum + (entry.exerciseMinutes || 0), 0);

    return { sleep: totalSleep, mood: avgMood, exercise: totalExercise };
  }, [todayEntries]);

  const yesterdayStats = useMemo(() => {
    if (!yesterdayEntries?.length) return { sleep: 0, mood: 0, exercise: 0 };
    
    const totalSleep = yesterdayEntries.reduce((sum, entry) => sum + (entry.sleepHours ? Number(entry.sleepHours) : 0), 0);
    const moodEntries = yesterdayEntries.filter(entry => entry.mood);
    const avgMood = moodEntries.length ? moodEntries.reduce((sum, entry) => sum + entry.mood!, 0) / moodEntries.length : 0;
    const totalExercise = yesterdayEntries.reduce((sum, entry) => sum + (entry.exerciseMinutes || 0), 0);

    return { sleep: totalSleep, mood: avgMood, exercise: totalExercise };
  }, [yesterdayEntries]);

  const sleepDiff = todayStats.sleep && yesterdayStats.sleep
    ? todayStats.sleep - yesterdayStats.sleep
    : 0;

  const exerciseDiff = todayStats.exercise && yesterdayStats.exercise
    ? todayStats.exercise - yesterdayStats.exercise
    : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <div className="flex-1 space-y-4 p-8 pt-6">
        {statsLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" color='purple' />
          </div>
        ) : (
          <>
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
                  <div className="text-2xl font-bold text-on-glass">{todayStats.sleep || '-'}h</div>
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
                  <div className="text-2xl font-bold text-on-glass">{todayStats.exercise || '-'}min</div>
                  <p className="text-xs text-primary-dark/70">
                    {exerciseDiff > 0 ? '+' : ''}{exerciseDiff}min from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card className="card-glass shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-on-glass">Mood</CardTitle>
                  <Brain className="h-4 w-4 text-primary-dark/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-on-glass">{todayStats.mood ? `${todayStats.mood}/10` : '-'}</div>
                  <p className="text-xs text-primary-dark/70">
                    {todayStats.mood && yesterdayStats.mood && todayStats.mood > yesterdayStats.mood 
                      ? 'Improved from yesterday'
                      : todayStats.mood && yesterdayStats.mood && todayStats.mood < yesterdayStats.mood
                      ? 'Declined from yesterday'
                      : 'Same as yesterday'}
                  </p>
                </CardContent>
              </Card>
            </div>
            <Overview />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics filter={filter} />
          </TabsContent>
          <TabsContent value="journal">
            <JournalTab selectedDates={dateRange || {}} />
          </TabsContent>
        </Tabs>
        </>
        )}
      </div>
    </div>
  );
}