'use client';

import { Line, ComposedChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { format, parse, subDays } from 'date-fns';
import { useMemo } from 'react';

// Add this constant at the top of the file, before the Overview component
const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFD93D', // Yellow
  '#95A5A6', // Gray
  '#6C5CE7', // Purple
  '#A8E6CF', // Mint
  '#FF8B94', // Pink
  '#79BD9A', // Green
  '#3498DB', // Blue
  '#F1C40F', // Gold
];

export function Overview() {
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

  // Get dates for last 7 days
  const dates = useMemo(() => {
    return Array.from({length: 7}, (_, i) => {
      const date = format(subDays(new Date(), 6-i), 'yyyy-MM-dd');
      return date;
    });
  }, []);

  // Fetch data for each date
  const queries = dates.map(date => 
    trpc.journal.getByDate.useQuery({ date })
  );

  const { data: settings } = trpc.settings.get.useQuery();
  // Get unique categories from settings
  const categories = useMemo(() => {
    if (!settings?.suggestedSymptoms) {
      return ['Depression', 'Anxiety', 'Mania', 'OCD', 'ADHD', 'Other'];
    }
    // Get unique categories using Set
    const uniqueCategories = Array.from(
      new Set(settings.suggestedSymptoms.map(symptom => symptom.category))
    );
    return uniqueCategories.length ? uniqueCategories : ['Depression', 'Anxiety', 'Mania', 'OCD', 'ADHD', 'Other'];
  }, [settings?.suggestedSymptoms]);

  // Transform data for charts
  const weekData = useMemo(() => {
    return dates.map((date, i) => {
      const entries = queries[i].data || [];
      const data: any = {
        name: format(parse(date, 'yyyy-MM-dd', new Date()), 'EEE'),
      };

      // Calculate average mood (excluding entries with no mood)
      const moodEntries = entries.filter(entry => entry.mood != null);
      data.mood = moodEntries.length > 0 
        ? moodEntries.reduce((sum, entry) => sum + entry.mood!, 0) / moodEntries.length
        : undefined;

      // Sum up sleep hours
      data.sleep = entries.reduce((sum, entry) => sum + (Number(entry.sleepHours) || 0), 0) ?? undefined;

      // Sum up symptom counts for each category
      categories.forEach((category: string) => {
        data[category.toLowerCase()] = entries.reduce(
          (sum, entry) => sum + getSymptomCount(entry.symptoms, category), 
          0
        );
      });

      return data;
    });
  }, [dates, queries, categories]);

  // Get unique substances across all entries
  const substances = useMemo(() => {
    const substanceSet = new Set<string>();
    weekData.forEach(day => {
      Object.keys(day).forEach(key => {
        if (key.startsWith('substance_')) {
          substanceSet.add(key.replace('substance_', ''));
        }
      });
    });
    return Array.from(substanceSet);
  }, [weekData]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={weekData}>
              <XAxis 
                dataKey="name" 
                {...chartConfig.xAxis}
              />
              <YAxis 
                yAxisId="left"
                {...chartConfig.yAxis}
                domain={[0, 10]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                {...chartConfig.yAxis}
              />
              <Tooltip {...chartConfig.tooltip} />
              <Legend {...chartConfig.legend} />
              {/* Dynamic category bars */}
              {categories.map((category: string, index: number) => (
                <Bar
                  key={category}
                  yAxisId="right"
                  dataKey={category.toLowerCase()}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  name={category}
                />
              ))}
              {/* Mood and Sleep Lines */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="mood"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                name="Mood (1-10)"
                dot={{ fill: 'rgb(var(--primary))' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sleep"
                stroke="rgb(var(--secondary))"
                strokeWidth={2}
                name="Sleep (hours)"
                dot={{ fill: 'rgb(var(--secondary))' }}
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