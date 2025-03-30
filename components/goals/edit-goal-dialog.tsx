import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Goal } from '@/types/goal';

interface EditGoalDialogProps {
  goal: {
    id: typeof Goal.id;
    title: typeof Goal.title;
    description: typeof Goal.description;
    subcategoryId: typeof Goal.subcategoryId;
    targetDate: typeof Goal.targetDate;
    status: typeof Goal.status;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGoalDialog({ goal, open, onOpenChange }: EditGoalDialogProps) {
  const [formData, setFormData] = useState({
    title: goal.title,
    description: goal.description ?? '',
    subcategoryId: goal.subcategoryId ?? '',
    targetDate: goal.targetDate ?? '',
    status: goal.status,
  });

  const { data: categories } = trpc.goals.getCategories.useQuery();
  const utils = trpc.useContext();
  
  const updateGoal = trpc.goals.update.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoal.mutate({
      id: goal.id,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-primary-light/90 backdrop-blur-md border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-white border-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px] bg-white border-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.subcategoryId}
              onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
            >
              <SelectTrigger className="bg-white border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categories?.map((category) => (
                  <div key={category.id}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-primary-dark">
                      {category.name}
                    </div>
                    {category.subcategories.map((sub) => (
                      <SelectItem 
                        key={sub.id} 
                        value={sub.id}
                        className="text-primary-dark hover:bg-primary-light/20"
                      >
                        {sub.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-white border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Date</Label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
              className="bg-white border-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white text-primary hover:bg-white/90"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateGoal.isLoading}
              className="bg-primary-dark text-white hover:bg-primary-dark/90"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 