'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const SUGGESTED_ACTIVITIES = [
  'Meditation',
  'Exercise',
  'Reading',
  'Work',
  'Therapy',
  'Self-care',
  'Socializing',
  'Hobbies',
  'Learning',
  'Rest',
];

interface ActivitySelectorProps {
  selected: {
    id?: string;
    activity: string;
  }[];
  onSelect: (activities: { id?: string; activity: string }[]) => void;
}

export function ActivitySelector({
  selected,
  onSelect,
}: ActivitySelectorProps) {
  const [newActivity, setNewActivity] = useState('');

  const addActivity = (activity: string) => {
    if (activity && !selected.some((a) => a.activity === activity)) {
      onSelect([...selected, { activity }]);
    }
    setNewActivity('');
  };

  const removeActivity = (activity: string) => {
    onSelect(selected.filter((a) => a.activity !== activity));
  };

  return (
    <div className="space-y-2">
      <Label>Activities</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((activity) => (
          <Badge
            key={activity.activity}
            variant="secondary"
            className="cursor-pointer bg-primary-dark hover:primary-light text-white"
          >
            {activity.activity}
            <X
              className="ml-1 h-3 w-3"
              onClick={() => removeActivity(activity.activity)}
            />
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {SUGGESTED_ACTIVITIES.filter(
          (activity) => !selected.some((a) => a.activity === activity)
        ).map((activity) => (
          <Badge
            key={activity}
            variant="secondary"
            className="cursor-pointer bg-primary hover:bg-primary-dark text-white"
            onClick={() => addActivity(activity)}
          >
            {activity}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add custom activity"
          value={newActivity}
          className="bg-primary-light"
          onChange={(e) => setNewActivity(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addActivity(newActivity);
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => addActivity(newActivity)}
          className="bg-primary-dark text-white"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
