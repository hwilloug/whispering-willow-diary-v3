import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AddGoalUpdateProps {
  goalId: string;
  currentProgress: number;
  onSuccess?: () => void;
}

export function AddGoalUpdate({ goalId, currentProgress, onSuccess }: AddGoalUpdateProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
    progressUpdate: currentProgress,
  });

  useEffect(() => {
    if (isAdding) {
      setFormData(prev => ({ ...prev, progressUpdate: currentProgress }));
    }
  }, [isAdding, currentProgress]);

  const utils = trpc.useContext();
  const addUpdate = trpc.goals.addUpdate.useMutation({
    onSuccess: () => {
      setIsAdding(false);
      setFormData({ notes: '', progressUpdate: 0 });
      utils.goals.list.invalidate();
      onSuccess?.();
    },
  });

  if (!isAdding) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center gap-2 bg-white/5"
      >
        <Plus className="h-4 w-4" />
        Add Update
      </Button>
    );
  }

  return (
    <div className="space-y-4 p-3 bg-white/5 rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Progress Update</Label>
          <span className="text-sm font-medium">{formData.progressUpdate}%</span>
        </div>
        <Slider
          value={[formData.progressUpdate]}
          onValueChange={(value) => setFormData({ ...formData, progressUpdate: value[0] })}
          max={100}
          step={1}
          className="my-4"
        />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add details about your progress..."
          className="bg-primary-light border-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(false)}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => {
            addUpdate.mutate({
              goalId,
              notes: formData.notes,
              progressUpdate: formData.progressUpdate,
            });
          }}
          disabled={addUpdate.isLoading || !formData.notes}
        >
          Save Update
        </Button>
      </div>
    </div>
  );
} 