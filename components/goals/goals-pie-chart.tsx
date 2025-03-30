import { trpc } from '@/lib/trpc';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function GoalsPieChart() {
  const { data: goals } = trpc.goals.list.useQuery();

  const goalsByCategory = goals
    ?.filter(goal => goal.status !== 'archived') // Exclude archived goals
    ?.reduce((acc, goal) => {
      const category = goal.subcategory?.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) ?? {};

  const chartData = Object.entries(goalsByCategory).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="h-[200px] w-full">
      <h3 className="text-sm font-medium mb-2">Goals by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={60}
            fill="#8884d8"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 