'use client';

import { Line, ComposedChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { format, parse, subDays } from 'date-fns';
import { useMemo } from 'react';

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

      // Sum up symptom counts across all entries
      data.depression = entries.reduce((sum, entry) => sum + getSymptomCount(entry.symptoms, 'Depression'), 0);
      data.anxiety = entries.reduce((sum, entry) => sum + getSymptomCount(entry.symptoms, 'Anxiety'), 0);
      data.mania = entries.reduce((sum, entry) => sum + getSymptomCount(entry.symptoms, 'Mania'), 0);
      data.ocd = entries.reduce((sum, entry) => sum + getSymptomCount(entry.symptoms, 'OCD'), 0);
      data.adhd = entries.reduce((sum, entry) => sum + getSymptomCount(entry.symptoms, 'ADHD'), 0);
      data.other = entries.reduce((sum, entry) => sum + getSymptomCount(entry.symptoms, 'Other'), 0);

      // Sum up substance amounts across all entries
      entries.forEach(entry => {
        entry.substances?.forEach(substance => {
          const key = `substance_${substance.substance}`;
          data[key] = (data[key] || 0) + (substance.amount || 0);
        });
      });

      return data;
    });
  }, [dates, queries]);

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
              {/* Mental Health Indicator Bars with updated colors */}
              <Bar yAxisId="right" dataKey="depression" stackId="a" fill="#FF6B6B" name="Depression" />
              <Bar yAxisId="right" dataKey="anxiety" stackId="a" fill="#4ECDC4" name="Anxiety" />
              <Bar yAxisId="right" dataKey="mania" stackId="a" fill="#FFD93D" name="Mania" />
              <Bar yAxisId="right" dataKey="ocd" stackId="a" fill="#95A5A6" name="OCD" />
              <Bar yAxisId="right" dataKey="adhd" stackId="a" fill="#6C5CE7" name="ADHD" />
              <Bar yAxisId="right" dataKey="other" stackId="a" fill="#A8E6CF" name="Other" />
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