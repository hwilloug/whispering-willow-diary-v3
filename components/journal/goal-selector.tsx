import { trpc } from '@/lib/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { useState, useEffect, useRef } from 'react';
import { Textarea } from '../ui/textarea';

interface GoalUpdateProps {
  onUpdate: (updates: Array<{ goalId: string; progress: number; notes: string }>) => void;
}

export function GoalSelector({ onUpdate }: GoalUpdateProps) {
  const { data: goals } = trpc.goals.list.useQuery();
  const [updates, setUpdates] = useState<Record<string, { progress: number; notes: string }>>({});
  const updatesRef = useRef(updates);
  
  const activeGoals = goals?.filter(g => g.status !== 'archived' && g.status !== 'completed') || [];

  const handleGoalSelect = (goalId: string) => {
    const goal = goals?.find(g => g.id.toString() === goalId);
    if (goal && !updates[goalId]) {
      setUpdates(prev => ({
        ...prev,
        [goalId]: {
          progress: Number(goal.percentComplete),
          notes: ''
        }
      }));
    }
  };

  const handleProgressChange = (goalId: string, value: number) => {
    setUpdates(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], progress: value }
    }));
  };

  const handleNotesChange = (goalId: string, value: string) => {
    setUpdates(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], notes: value }
    }));
  };

  // Update parent only when updates actually change
  useEffect(() => {
    if (JSON.stringify(updatesRef.current) !== JSON.stringify(updates)) {
      const goalUpdates = Object.entries(updates).map(([goalId, update]) => ({
        goalId,
        ...update
      }));
      onUpdate(goalUpdates);
      updatesRef.current = updates;
    }
  }, [updates, onUpdate]);

  return (
    <div className="space-y-4">
      <Label>Update Goals Progress</Label>
      <div className="space-y-6">
        {Object.entries(updates).map(([goalId, update]) => (
          <div key={goalId} className="space-y-4 p-4 bg-primary-dark/5 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {goals?.find(g => g.id.toString() === goalId)?.title.toString()}
              </span>
              <button
                type="button"
                onClick={() => {
                  setUpdates(prev => {
                    const { [goalId]: _, ...rest } = prev;
                    return rest;
                  });
                }}
                className="text-sm text-primary-dark/50 hover:text-primary-dark transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Slider
                value={[update.progress]}
                onValueChange={([value]) => handleProgressChange(goalId, value)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="w-16 text-center font-medium">{update.progress}%</span>
            </div>
            <Textarea
              placeholder="Add notes about your progress..."
              value={update.notes}
              onChange={(e) => handleNotesChange(goalId, e.target.value)}
              className="min-h-[100px] bg-primary-light border-none"
            />
          </div>
        ))}

        <Select 
          value="" 
          onValueChange={handleGoalSelect}
        >
          <SelectTrigger className="bg-primary-light border-none">
            <SelectValue placeholder={
              Object.keys(updates).length === 0 
                ? "Select a goal to update progress" 
                : "Select another goal to update"
            } />
          </SelectTrigger>
          <SelectContent className="bg-primary-light/95 backdrop-blur border-primary-dark">
            {activeGoals
              .filter(goal => !updates[goal.id.toString()])
              .map(goal => (
                <SelectItem 
                  key={goal.id.toString()} 
                  value={goal.id.toString()}
                  className="hover:bg-primary-dark/10"
                >
                  {goal.title.toString()}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 