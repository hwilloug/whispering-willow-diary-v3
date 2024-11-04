'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const SUGGESTED_FEELINGS = [
  'Happy',
  'Sad',
  'Anxious',
  'Excited',
  'Frustrated',
  'Grateful',
  'Peaceful',
  'Overwhelmed',
  'Motivated',
  'Tired',
  'Energetic',
  'Content',
];

interface FeelingSelectorProps {
  selected: {
    id?: string;
    feeling: string;
  }[];
  onSelect: (feelings: { id?: string; feeling: string }[]) => void;
}

export function FeelingSelector({ selected, onSelect }: FeelingSelectorProps) {
  const [newFeeling, setNewFeeling] = useState('');

  const addFeeling = (feeling: string) => {
    if (feeling && !selected.some((f) => f.feeling === feeling)) {
      onSelect([...selected, { feeling }]);
    }
    setNewFeeling('');
  };

  const removeFeeling = (feeling: string) => {
    onSelect(selected.filter((f) => f.feeling !== feeling));
  };

  return (
    <div className="space-y-2">
      <Label>Feelings</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((feeling) => (
          <Badge
            key={feeling.feeling}
            variant="outline"
            className="cursor-pointer bg-primary-dark hover:primary-light text-white"
          >
            {feeling.feeling}
            <X
              className="ml-1 h-3 w-3"
              onClick={() => removeFeeling(feeling.feeling)}
            />
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {SUGGESTED_FEELINGS.filter(
          (feeling) => !selected.some((f) => f.feeling === feeling)
        ).map((feeling) => (
          <Badge
            key={feeling}
            variant="secondary"
            className="cursor-pointer bg-primary hover:bg-primary-dark text-white"
            onClick={() => addFeeling(feeling)}
          >
            {feeling}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add feeling"
          value={newFeeling}
          onChange={(e) => setNewFeeling(e.target.value)}
          className="bg-primary-light"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addFeeling(newFeeling);
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="bg-primary-dark text-white"
          onClick={() => addFeeling(newFeeling)}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
