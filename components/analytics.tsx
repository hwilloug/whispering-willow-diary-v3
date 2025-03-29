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
        dataByDate.set(dateStr, {
          mood: entry.mood || 0,
          sleep: entry.sleepHours ? Number(entry.sleepHours) : undefined,
          exercise: entry.exerciseMinutes || 0,
          symptoms: entry.symptoms?.length || 0,
          date: dateStr,
          dateObj: date,
          depression: entry.symptoms?.filter(s => s.category === 'Depression').length || 0,
          anxiety: entry.symptoms?.filter(s => s.category === 'Anxiety').length || 0,
          mania: entry.symptoms?.filter(s => s.category === 'Mania').length || 0,
        });
      }
    });

    // Convert to array and sort by date (oldest to newest)
    return Array.from(dataByDate.values())
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [entriesData]);

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
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sleep"
                stroke="rgb(var(--secondary))"
                strokeWidth={2}
                name="Sleep Hours"
                dot={false}
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
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="mood"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                name="Mood"
                dot={false}
              />
              <Bar
                yAxisId="right"
                dataKey="exercise"
                fill="rgb(var(--secondary))"
                name="Exercise Minutes"
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