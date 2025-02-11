'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { trpc } from '@/lib/trpc';
import { format, parse, eachDayOfInterval, addDays, subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

const COLORS = ['#436228', '#673AB7', '#214C14', '#9575CD', '#E0F0BB', '#4A148C'];

const chartConfig = {
  xAxis: {
    stroke: '#000000',
    tick: { fill: '#000000' },
    style: { fontSize: '12px' },
  },
  yAxis: {
    stroke: '#000000',
    tick: { fill: '#000000' },
    style: { fontSize: '12px' },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #000000',
    },
    labelStyle: { color: '#000000' },
  },
  legend: {
    wrapperStyle: { color: '#000000' },
  },
};

type Filter = 'week' | 'weeks' | 'month' | 'months' | 'year'


export function Analytics({ filter }: { filter: Filter }) {

  const dates = useMemo(() => {
    if (filter === 'week') {
      return eachDayOfInterval({ start: new Date(), end: subDays(new Date(), 6) });
    } else if (filter === 'weeks') {
      return eachDayOfInterval({ start: new Date(), end: subDays(new Date(), 13) });
    } else if (filter === 'month') {
      return eachDayOfInterval({ start: new Date(), end: subDays(new Date(), 29) });
    } else if (filter === 'months') {
      return eachDayOfInterval({ start: new Date(), end: subDays(new Date(), 89) });
    } else if (filter === 'year') {
      return eachDayOfInterval({ start: new Date(), end: subDays(new Date(), 364) });
    } else {
      return [new Date()];
    }
  }, [filter]);

  // Use a single query for all dates instead of multiple queries
  const { data: entriesData } = trpc.journal.getByDateRange.useQuery({
    startDate: format(dates[dates.length - 1], 'yyyy-MM-dd'),
    endDate: format(dates[0], 'yyyy-MM-dd')
  });

  // Get stats for date range
  const { data: stats } = trpc.journal.getStats.useQuery({
    startDate: format(dates[dates.length - 1], 'yyyy-MM-dd'),
    endDate: format(dates[0], 'yyyy-MM-dd')
  });

  // Transform data for charts
  const weekData = useMemo(() => {
    if (!dates || !entriesData) return [];

    return dates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const entries = entriesData.filter(entry => entry.date === dateStr) || [];
      
      // Calculate totals and averages across all entries for the day
      let totalMood = 0;
      let moodCount = 0;
      let totalSleep = 0;
      let depressionCount = 0;
      let anxietyCount = 0;
      let maniaCount = 0;
      let ocdCount = 0;
      let adhdCount = 0;
      let otherCount = 0;

      entries.forEach(entry => {
        totalMood += entry.mood ?? 0;
        moodCount += entry.mood ? 1 : 0;
        totalSleep += Number(entry.sleepHours) || 0;
        depressionCount += getSymptomCount(entry.symptoms, 'Depression');
        anxietyCount += getSymptomCount(entry.symptoms, 'Anxiety'); 
        maniaCount += getSymptomCount(entry.symptoms, 'Mania');
        ocdCount += getSymptomCount(entry.symptoms, 'OCD');
        adhdCount += getSymptomCount(entry.symptoms, 'ADHD');
        otherCount += getSymptomCount(entry.symptoms, 'Other');
      });

      const avgMood = moodCount > 0 ? totalMood / moodCount : 0;
      return {
        date: format(date, 'EEE'),
        sleep: totalSleep === 0 ? undefined : totalSleep,
        mood: avgMood === 0 ? undefined : avgMood,
        depression: depressionCount,
        anxiety: anxietyCount,
        mania: maniaCount,
        ocd: ocdCount,
        adhd: adhdCount,
        other: otherCount
      };
    });
  }, [dates, entriesData]);

  const averageMood = stats?.averageMood || '-';
  const averageSleep = stats?.averageSleep || '-';

  console.log(stats)

  // Transform activity data for pie chart
  const activityData = useMemo(() => {
    if (!stats?.topActivities) return [];
    return Object.entries(stats.topActivities).map(([name, count]) => ({
      name,
      value: count
    }));
  }, [stats?.topActivities]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-glass shadow-lg">
          <CardHeader>
            <CardTitle>Average Mood</CardTitle>
            <CardDescription>Weekly average mood score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{averageMood}/10</div>
          </CardContent>
        </Card>

        <Card className="card-glass shadow-lg">
          <CardHeader>
            <CardTitle>Sleep</CardTitle>
            <CardDescription>Average hours of sleep</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{averageSleep}h</div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glass shadow-lg">
        <CardHeader>
          <CardTitle>Mental Health Indicators</CardTitle>
          <CardDescription>Weekly tracking of mental health conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekData}>
              <XAxis dataKey="date" {...chartConfig.xAxis} />
              <YAxis {...chartConfig.yAxis} />
              <Tooltip {...chartConfig.tooltip} />
              <Legend {...chartConfig.legend} />
              <Line
                type="monotone"
                dataKey="depression"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                name="Depression"
              />
              <Line
                type="monotone"
                dataKey="anxiety"
                stroke="rgb(var(--secondary))"
                strokeWidth={2}
                name="Anxiety"
              />
              <Line
                type="monotone"
                dataKey="mania"
                stroke="rgb(var(--primary-dark))"
                strokeWidth={2}
                name="Mania"
              />
              <Line
                type="monotone"
                dataKey="ocd"
                stroke="#673AB7"
                strokeWidth={2}
                name="OCD"
              />
              <Line
                type="monotone"
                dataKey="adhd"
                stroke="#9575CD"
                strokeWidth={2}
                name="ADHD"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-glass shadow-lg">
          <CardHeader>
            <CardTitle>Mood vs Sleep Correlation</CardTitle>
            <CardDescription>Impact of sleep on mood levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weekData}>
                <XAxis dataKey="date" {...chartConfig.xAxis} />
                <YAxis {...chartConfig.yAxis} />
                <Tooltip {...chartConfig.tooltip} />
                <Legend {...chartConfig.legend} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="rgb(var(--primary))"
                  strokeWidth={2}
                  name="Mood"
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="rgb(var(--secondary))"
                  strokeWidth={2}
                  name="Sleep Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-glass shadow-lg">
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>Number of times an entry included each activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {activityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartConfig.tooltip} />
                <Legend {...chartConfig.legend} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glass shadow-lg">
        <CardHeader>
          <CardTitle>Weekly Mental Health Summary</CardTitle>
          <CardDescription>Combined view of all mental health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekData}>
              <XAxis dataKey="date" {...chartConfig.xAxis} />
              <YAxis {...chartConfig.yAxis} />
              <Tooltip {...chartConfig.tooltip} />
              <Legend {...chartConfig.legend} />
              <Bar dataKey="depression" stackId="a" fill="rgb(var(--primary))" name="Depression" />
              <Bar dataKey="anxiety" stackId="a" fill="rgb(var(--secondary))" name="Anxiety" />
              <Bar dataKey="mania" stackId="a" fill="rgb(var(--primary-dark))" name="Mania" />
              <Bar dataKey="ocd" stackId="a" fill="#673AB7" name="OCD" />
              <Bar dataKey="adhd" stackId="a" fill="#9575CD" name="ADHD" />
              <Bar dataKey="other" stackId="a" fill="#E0F0BB" name="Other" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

const getSymptomCount = (symptoms: { category: string }[] | undefined, category: string) => {
  return symptoms?.filter(s => s.category === category).length || 0;
}