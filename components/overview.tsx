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
      domain: [0, "auto"],
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
        : null;

      // Sum up sleep hours
      data.sleep = entries.reduce((sum, entry) => sum + (Number(entry.sleepHours) || 0), 0);

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
          <CardTitle>Mental Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekData}>
              <XAxis dataKey="name" {...chartConfig.xAxis} />
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
              {substances.map((substance, index) => (
                <Bar
                  key={substance}
                  dataKey={`substance_${substance}`}
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

const getSymptomCount = (symptoms: { category: string }[] | undefined, category: string) => {
  return symptoms?.filter(s => s.category === category).length || 0;
}