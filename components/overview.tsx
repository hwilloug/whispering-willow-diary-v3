'use client';

import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const weekData = [
  {
    name: 'Mon',
    mood: 8,
    sleep: 7,
    exercise: 45,
    alcohol: 2,
    cannabis: 1,
    tobacco: 3,
  },
  {
    name: 'Tue',
    mood: 7,
    sleep: 6,
    exercise: 30,
    alcohol: 0,
    cannabis: 2,
    tobacco: 2,
  },
  {
    name: 'Wed',
    mood: 9,
    sleep: 8,
    exercise: 60,
    alcohol: 1,
    cannabis: 0,
    tobacco: 1,
  },
  {
    name: 'Thu',
    mood: 6,
    sleep: 7,
    exercise: 0,
    alcohol: 0,
    cannabis: 1,
    tobacco: 2,
  },
  {
    name: 'Fri',
    mood: 8,
    sleep: 8,
    exercise: 45,
    alcohol: 3,
    cannabis: 1,
    tobacco: 4,
  },
  {
    name: 'Sat',
    mood: 7,
    sleep: 6,
    exercise: 90,
    alcohol: 4,
    cannabis: 2,
    tobacco: 3,
  },
  {
    name: 'Sun',
    mood: 9,
    sleep: 9,
    exercise: 30,
    alcohol: 1,
    cannabis: 1,
    tobacco: 2,
  },
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
              <Bar
                dataKey="alcohol"
                fill="rgb(var(--primary))"
                name="Alcohol"
                stackId="stack"
              />
              <Bar
                dataKey="cannabis"
                fill="rgb(var(--secondary))"
                name="Cannabis"
                stackId="stack"
              />
              <Bar
                dataKey="tobacco"
                fill="rgb(var(--primary-dark))"
                name="Tobacco"
                stackId="stack"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}