import { useState } from 'react';
import { Plus } from 'lucide-react';
import GoalsList from './goals/goals-list';
import NewGoalDialog from './goals/new-goal-dialog';
import GoalStats from './goals/goal-stats';
import { GoalsPieChart } from './goals/goals-pie-chart';
import { Button } from './ui/button';

export default function GoalsTab() {
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);

  return (
    <div className="relative flex flex-col gap-6 h-full w-full p-4">
      {/* Header with Stats and Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4 text-center">
          <GoalStats />
        </div>
        <div className="card-glass p-4">
          <GoalsPieChart />
        </div>
      </div>

      {/* Goals List */}
      <div className="card-glass p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-dark">My Goals</h2>
          <Button
            onClick={() => setIsNewGoalOpen(true)}
            className="btn-primary flex items-center gap-2 text-white bg-secondary hover:bg-secondary-light"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>
        <div className="relative">
          <GoalsList />
        </div>
      </div>

      <NewGoalDialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen} />
    </div>
  );
}