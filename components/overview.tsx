'use client';

import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
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
      const entry = queries[i].data?.[0];
      const data: any = {
        name: format(parse(date, 'yyyy-MM-dd', new Date()), 'EEE'),
        mood: entry?.mood,
        sleep: entry?.sleepHours,
        exercise: entry?.exerciseMinutes,
      };

      // Add substance amounts dynamically
      entry?.substances?.forEach(substance => {
        data[substance.substance] = substance.amount || 0;
      });

      return data;
    });
  }, [dates, queries]);

  // Get unique substances across all entries
  const substances = useMemo(() => {
    const substanceSet = new Set<string>();
    weekData.forEach(day => {
      Object.keys(day).forEach(key => {
        if (!['name', 'mood', 'sleep', 'exercise'].includes(key)) {
          substanceSet.add(key);
        }
      });
    });
    return substanceSet;
  }, [weekData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Mood & Sleep</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weekData}>
              <XAxis 
                dataKey="name" 
                {...chartConfig.xAxis}
              />
              <YAxis 
                {...chartConfig.yAxis}
                domain={[0, 10]}
              />
              <Tooltip {...chartConfig.tooltip} />
              <Legend {...chartConfig.legend} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                name="Mood (1-10)"
                dot={{ fill: 'rgb(var(--primary))' }}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="rgb(var(--secondary))"
                strokeWidth={2}
                name="Sleep (hours)"
                dot={{ fill: 'rgb(var(--secondary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Exercise Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekData}>
              <XAxis 
                dataKey="name" 
                {...chartConfig.xAxis}
              />
              <YAxis 
                {...chartConfig.yAxis}
                label={{ 
                  value: 'Minutes', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#000000' }
                }}
              />
              <Tooltip {...chartConfig.tooltip} />
              <Legend {...chartConfig.legend} />
              <Bar
                dataKey="exercise"
                fill="rgb(var(--primary))"
                name="Exercise (minutes)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glass col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Substance Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekData}>
              <XAxis 
                dataKey="name" 
                {...chartConfig.xAxis}
              />
              <YAxis 
                {...chartConfig.yAxis}
                label={{ 
                  value: 'Usage', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#000000' }
                }}
              />
              <Tooltip {...chartConfig.tooltip} />
              <Legend {...chartConfig.legend} />
              {Array.from(substances).map((substance, index) => (
                <Bar
                  key={substance}
                  dataKey={substance}
                  fill={`rgb(var(${index === 0 ? '--primary' : index === 1 ? '--secondary' : '--primary-dark'}))`}
                  name={substance}
                  stackId="stack"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}