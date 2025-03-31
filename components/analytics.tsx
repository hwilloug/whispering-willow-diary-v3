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
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
} from 'recharts';
import { trpc } from '@/lib/trpc';
import { format, parse, eachDayOfInterval, addDays, subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import NoDataAvailable from './no-data-available';

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

type Filter = 'week' | 'weeks' | 'month' | 'months' | 'year' | 'custom';

export function Analytics({ filter }: { filter: Filter }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
    } else if (filter === 'custom' && dateRange?.from && dateRange?.to) {
      return eachDayOfInterval({ start: dateRange.to, end: dateRange.from });
    } else {
      return [new Date()];
    }
  }, [filter, dateRange]);

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
      
      // For each field, first try to get valid values
      const validMoods = entries
        .map(entry => entry.mood)
        .filter((mood): mood is number => mood !== null && mood !== undefined);
      
      const validSleepHours = entries
        .map(entry => entry.sleepHours)
        .filter((sleep): sleep is string => sleep !== null && sleep !== undefined)
        .map(Number);

      // Calculate symptom counts - take max count per category per day
      const symptomCounts = entries.reduce((acc, entry) => {
        const depression = getSymptomCount(entry.symptoms, 'Depression');
        const anxiety = getSymptomCount(entry.symptoms, 'Anxiety');
        const mania = getSymptomCount(entry.symptoms, 'Mania');
        const ocd = getSymptomCount(entry.symptoms, 'OCD');
        const adhd = getSymptomCount(entry.symptoms, 'ADHD');
        const other = getSymptomCount(entry.symptoms, 'Other');

        return {
          depression: Math.max(acc.depression, depression),
          anxiety: Math.max(acc.anxiety, anxiety),
          mania: Math.max(acc.mania, mania),
          ocd: Math.max(acc.ocd, ocd),
          adhd: Math.max(acc.adhd, adhd),
          other: Math.max(acc.other, other),
        };
      }, {
        depression: 0,
        anxiety: 0,
        mania: 0,
        ocd: 0,
        adhd: 0,
        other: 0
      });

      return {
        date: format(date, 'EEE'),
        // If we have valid values, calculate average, otherwise undefined
        mood: validMoods.length > 0 
          ? validMoods.reduce((sum, val) => sum + val, 0) / validMoods.length 
          : undefined,
        sleep: validSleepHours.length > 0
          ? validSleepHours.reduce((sum, val) => sum + val, 0) / validSleepHours.length
          : undefined,
        depression: symptomCounts.depression || undefined,
        anxiety: symptomCounts.anxiety || undefined,
        mania: symptomCounts.mania || undefined,
        ocd: symptomCounts.ocd || undefined,
        adhd: symptomCounts.adhd || undefined,
        other: symptomCounts.other || undefined
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

  // Add export functionality
  const exportData = () => {
    if (!entriesData) return;

    // Create CSV content
    const csvContent = [
      // Headers
      ['Date', 'Mood', 'Sleep', 'Depression', 'Anxiety', 'Mania', 'OCD', 'ADHD', 'Other'].join(','),
      // Data rows
      ...weekData.map(day => [
        day.date,
        day.mood || '',
        day.sleep || '',
        day.depression,
        day.anxiety,
        day.mania,
        day.ocd,
        day.adhd,
        day.other
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mental-health-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Add correlation data transformations
  const correlationData = useMemo(() => {
    if (!entriesData) return [];
    
    const dataByDate = new Map();
    
    entriesData.forEach(entry => {
      const date = new Date(entry.date);
      const dateStr = format(date, 'MMM dd');
      
      if (!dataByDate.has(dateStr)) {
        // Initialize new date entry
        dataByDate.set(dateStr, {
          moods: [],
          sleepHours: [],
          exerciseMinutes: [],
          date: dateStr,
          dateObj: date,
          symptoms: {
            depression: 0,
            anxiety: 0,
            mania: 0
          }
        });
      }

      const dateData = dataByDate.get(dateStr);
      
      // Collect all valid values for the day
      if (entry.mood !== null && entry.mood !== undefined) {
        dateData.moods.push(entry.mood);
      }
      if (entry.sleepHours !== null && entry.sleepHours !== undefined) {
        dateData.sleepHours.push(Number(entry.sleepHours));
      }
      if (entry.exerciseMinutes) {
        dateData.exerciseMinutes.push(entry.exerciseMinutes);
      }

      // Update maximum symptom counts
      const depressionCount = entry.symptoms?.filter(s => s.category === 'Depression').length || 0;
      const anxietyCount = entry.symptoms?.filter(s => s.category === 'Anxiety').length || 0;
      const maniaCount = entry.symptoms?.filter(s => s.category === 'Mania').length || 0;

      dateData.symptoms.depression = Math.max(dateData.symptoms.depression, depressionCount);
      dateData.symptoms.anxiety = Math.max(dateData.symptoms.anxiety, anxietyCount);
      dateData.symptoms.mania = Math.max(dateData.symptoms.mania, maniaCount);
    });

    // Process the collected data into averages
    return Array.from(dataByDate.values())
      .map(dateData => ({
        date: dateData.date,
        dateObj: dateData.dateObj,
        mood: dateData.moods.length > 0 
          ? dateData.moods.reduce((sum: number, val: number) => sum + val, 0) / dateData.moods.length 
          : undefined,
        sleep: dateData.sleepHours.length > 0
          ? dateData.sleepHours.reduce((sum: number, val: number) => sum + val, 0) / dateData.sleepHours.length
          : undefined,
        exercise: dateData.exerciseMinutes.length > 0
          ? dateData.exerciseMinutes.reduce((sum: number, val: number) => sum + val, 0) / dateData.exerciseMinutes.length
          : undefined,
        depression: dateData.symptoms.depression || undefined,
        anxiety: dateData.symptoms.anxiety || undefined,
        mania: dateData.symptoms.mania || undefined
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [entriesData]);

  if (entriesData?.length === 0) {
    return <div className="h-full card-glass p-8 rounded-lg"><NoDataAvailable /></div>
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        {filter === 'custom' && (
          <DatePickerWithRange 
            date={dateRange}
            onDateChange={setDateRange}
          />
        )}
        <Button 
          variant="outline" 
          className="ml-auto bg-primary-dark/80 text-primary-light border-black hover:bg-primary-dark/90 backdrop-blur-sm shadow-lg"
          onClick={exportData}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

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
          <CardTitle>Mood vs Sleep Correlation</CardTitle>
          <CardDescription>How sleep duration affects mood</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={correlationData}>
              <XAxis dataKey="date" {...chartConfig.xAxis} />
              <YAxis 
                yAxisId="left"
                {...chartConfig.yAxis}
                domain={[0, 10]}
                label={{ value: 'Mood', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                {...chartConfig.yAxis}
                domain={[0, 12]}
                label={{ value: 'Sleep (hours)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip {...chartConfig.tooltip} />
              <Legend {...chartConfig.legend} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="mood"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                name="Mood"
                dot={{
                  stroke: 'rgb(var(--primary))',
                  strokeWidth: 1,
                  fill: 'rgb(var(--primary))',
                  r: 3
                }}
                activeDot={{
                  stroke: 'rgb(var(--primary))',
                  strokeWidth: 2,
                  fill: 'rgb(var(--primary))',
                  r: 5
                }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sleep"
                stroke="rgb(var(--secondary))"
                strokeWidth={2}
                name="Sleep Hours"
                dot={{
                  stroke: 'rgb(var(--secondary))',
                  strokeWidth: 1,
                  fill: 'rgb(var(--secondary))',
                  r: 3
                }}
                activeDot={{
                  stroke: 'rgb(var(--secondary))',
                  strokeWidth: 2,
                  fill: 'rgb(var(--secondary))',
                  r: 5
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glass shadow-lg">
        <CardHeader>
          <CardTitle>Exercise Impact Analysis</CardTitle>
          <CardDescription>Relationship between exercise and mental health</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={correlationData}>
              <XAxis dataKey="date" {...chartConfig.xAxis} />
              <YAxis 
                yAxisId="left"
                {...chartConfig.yAxis}
                domain={[0, 10]}
                label={{ value: 'Mood', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                {...chartConfig.yAxis}
                label={{ value: 'Exercise (min)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip {...chartConfig.tooltip} />
              <Legend {...chartConfig.legend} />
              <Bar
                yAxisId="right"
                dataKey="exercise"
                fill="rgb(var(--secondary))"
                name="Exercise Minutes"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="mood"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                name="Mood"
                dot={{
                  stroke: 'rgb(var(--primary))',
                  strokeWidth: 1,
                  fill: 'rgb(var(--primary))',
                  r: 3
                }}
                activeDot={{
                  stroke: 'rgb(var(--primary))',
                  strokeWidth: 2,
                  fill: 'rgb(var(--primary))',
                  r: 5
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glass shadow-lg">
        <CardHeader>
          <CardTitle>Symptom Relationships</CardTitle>
          <CardDescription>How different symptoms relate to mood and each other</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={correlationData}>
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
                dot={{
                  stroke: 'rgb(var(--primary))',
                  strokeWidth: 1,
                  fill: 'rgb(var(--primary))',
                  r: 3
                }}
                activeDot={{
                  stroke: 'rgb(var(--primary))',
                  strokeWidth: 2,
                  fill: 'rgb(var(--primary))',
                  r: 5
                }}
              />
              <Bar
                dataKey="depression" 
                fill="#436228" 
                name="Depression Symptoms"
                stackId="symptoms"
              />
              <Bar
                dataKey="anxiety" 
                fill="#673AB7" 
                name="Anxiety Symptoms"
                stackId="symptoms"
              />
              <Bar
                dataKey="mania" 
                fill="#214C14" 
                name="Mania Symptoms"
                stackId="symptoms"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

const getSymptomCount = (symptoms: { category: string }[] | undefined, category: string) => {
  return symptoms?.filter(s => s.category === category).length || 0;
}