import { trpc } from '@/lib/trpc';

export default function GoalStats() {
  const { data: stats } = trpc.goals.getStats.useQuery();

  const statCards = [
    {
      title: 'Active Goals',
      value: stats?.activeGoals ?? 0,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Completed Goals',
      value: stats?.completedGoals ?? 0,
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Overall Progress',
      value: `${stats?.overallProgress ?? 0}%`,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <>
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className={`rounded-lg p-4 ${stat.color}`}
        >
          <h3 className="text-sm font-medium">{stat.title}</h3>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
    </>
  );
} 