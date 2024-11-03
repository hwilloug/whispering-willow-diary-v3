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

const weekData = [
  { 
    date: 'Mon', 
    sleep: 7, 
    mood: 8, 
    depression: 2,
    anxiety: 3, 
    mania: 1,
    ocd: 2,
    adhd: 4
  },
  { 
    date: 'Tue', 
    sleep: 6, 
    mood: 7, 
    depression: 3,
    anxiety: 4, 
    mania: 1,
    ocd: 3,
    adhd: 4
  },
  { 
    date: 'Wed', 
    sleep: 8, 
    mood: 9, 
    depression: 1,
    anxiety: 2, 
    mania: 2,
    ocd: 1,
    adhd: 3
  },
  { 
    date: 'Thu', 
    sleep: 7, 
    mood: 6, 
    depression: 4,
    anxiety: 5, 
    mania: 1,
    ocd: 2,
    adhd: 5
  },
  { 
    date: 'Fri', 
    sleep: 8, 
    mood: 8, 
    depression: 2,
    anxiety: 3, 
    mania: 3,
    ocd: 2,
    adhd: 4
  },
  { 
    date: 'Sat', 
    sleep: 6, 
    mood: 7, 
    depression: 3,
    anxiety: 4, 
    mania: 2,
    ocd: 3,
    adhd: 3
  },
  { 
    date: 'Sun', 
    sleep: 9, 
    mood: 9, 
    depression: 1,
    anxiety: 1, 
    mania: 1,
    ocd: 1,
    adhd: 2
  },
];

const activityData = [
  { name: 'Exercise', count: 12 },
  { name: 'Meditation', count: 8 },
  { name: 'Reading', count: 15 },
  { name: 'Socializing', count: 6 },
  { name: 'Therapy', count: 2 },
  { name: 'Work', count: 20 },
];

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

export function Analytics() {
  const averageMood = (weekData.reduce((acc, day) => acc + day.mood, 0) / weekData.length).toFixed(1);
  const averageSleep = (weekData.reduce((acc, day) => acc + day.sleep, 0) / weekData.length).toFixed(1);
  const totalActivities = activityData.reduce((acc, activity) => acc + activity.count, 0);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Average Mood</CardTitle>
            <CardDescription>Weekly average mood score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{averageMood}/10</div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Sleep Quality</CardTitle>
            <CardDescription>Average hours of sleep</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{averageSleep}h</div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glass">
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
        <Card className="card-glass">
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

        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>Number of times each activity was performed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name} (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {activityData.map((entry, index) => (
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

      <Card className="card-glass">
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
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}