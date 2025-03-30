import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface NewGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Milestone {
  description: string;
  dueDate: string;
}

export default function NewGoalDialog({ open, onOpenChange }: NewGoalDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subcategoryId: '',
    targetDate: '',
  });

  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const { data: categories } = trpc.goals.getCategories.useQuery();
  const utils = trpc.useContext();
  
  const createGoal = trpc.goals.createWithMilestones.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      utils.goals.getStats.invalidate();
      onOpenChange(false);
      setFormData({ title: '', description: '', subcategoryId: '', targetDate: '' });
      setMilestones([]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGoal.mutate({ ...formData, milestones });
  };

  const addMilestone = () => {
    setMilestones([...milestones, { description: '', dueDate: '' }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    setMilestones(
      milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-primary-light/90 backdrop-blur-md border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter goal title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-white border-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your goal"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px] bg-white border-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.subcategoryId || 'none'} 
              onValueChange={(value) => setFormData({ 
                ...formData, 
                subcategoryId: value === 'none' ? '' : value 
              })}
            >
              <SelectTrigger className="bg-white border-none">
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur border-primary-dark">
                <SelectItem 
                  value="none" 
                  className="text-primary-dark/70 hover:bg-primary-light/20"
                >
                  No category
                </SelectItem>
                {categories?.map(category => (
                  <SelectGroup key={category.id}>
                    <SelectLabel className="text-primary-dark font-medium">
                      {category.name}
                    </SelectLabel>
                    {category.subcategories?.map(subcategory => (
                      <SelectItem 
                        key={subcategory.id} 
                        value={subcategory.id}
                        className="text-primary-dark/80 hover:bg-primary-light/20"
                      >
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
              className="bg-white border-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Milestones</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                className="flex items-center gap-2 bg-white border-none hover:bg-primary-light/20"
              >
                <Plus className="h-4 w-4" />
                Add Milestone
              </Button>
            </div>
            
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-3 items-start p-3 rounded-lg bg-primary-dark/20">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Milestone description"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      required
                      className="bg-white border-none"
                    />
                    <Input
                      type="date"
                      value={milestone.dueDate}
                      onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                      required
                      className="bg-white border-none"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMilestone(index)}
                    className="text-destructive hover:bg-destructive/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
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
              disabled={createGoal.isLoading}
              className="bg-primary-dark text-white hover:bg-primary-dark/90"
            >
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 