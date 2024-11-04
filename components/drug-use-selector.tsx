'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const SUGGESTED_SUBSTANCES = [
  'Alcohol',
  'Cannabis', 
  'Tobacco',
  'Caffeine',
  'Prescription Medication',
];

interface DrugUseSelectorProps {
  selected: {
    substance: string;
    amount?: string;
    notes?: string;
  }[];
  onSelect: (substances: {
    substance: string;
    amount?: string;
    notes?: string;
  }[]) => void;
}

export function DrugUseSelector({ selected, onSelect }: DrugUseSelectorProps) {
  const [newSubstance, setNewSubstance] = useState('');

  const addSubstance = (substanceName: string) => {
    if (substanceName && !selected.some(s => s.substance === substanceName)) {
      onSelect([...selected, {
        substance: substanceName
      }]);
    }
    setNewSubstance('');
  };

  const removeSubstance = (substanceName: string) => {
    onSelect(selected.filter((s) => s.substance !== substanceName));
  };

  return (
    <div className="space-y-2">
      <Label>Substance Use</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((s) => (
          <Badge
            key={s.substance}
            variant="outline"
            className="cursor-pointer bg-primary-dark hover:primary-light text-white"
          >
            {s.substance}
            <X
              className="ml-1 h-3 w-3"
              onClick={() => removeSubstance(s.substance)}
            />
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {SUGGESTED_SUBSTANCES.filter(
          (substance) => !selected.some(s => s.substance === substance)
        ).map((substance) => (
          <Badge
            key={substance}
            variant="secondary"
            className="cursor-pointer bg-primary hover:bg-primary-dark text-white"
            onClick={() => addSubstance(substance)}
          >
            {substance}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add substance"
          value={newSubstance}
          className="bg-primary-light"
          onChange={(e) => setNewSubstance(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSubstance(newSubstance);
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => addSubstance(newSubstance)}
          className="bg-primary-dark text-white"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
