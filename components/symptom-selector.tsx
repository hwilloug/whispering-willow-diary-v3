'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const SUGGESTED_SYMPTOMS = [
  'Anxiety',
  'Depression',
  'Stress',
  'Fatigue',
  'Insomnia',
  'Pain',
  'Headache',
  'Nausea',
];

interface SymptomSelectorProps {
  selected: string[];
  onSelect: (symptoms: string[]) => void;
}

export function SymptomSelector({ selected, onSelect }: SymptomSelectorProps) {
  const [newSymptom, setNewSymptom] = useState('');

  const addSymptom = (symptom: string) => {
    if (symptom && !selected.includes(symptom)) {
      onSelect([...selected, symptom]);
    }
    setNewSymptom('');
  };

  const removeSymptom = (symptom: string) => {
    onSelect(selected.filter((s) => s !== symptom));
  };

  return (
    <div className="space-y-2">
      <Label>Symptoms</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((symptom) => (
          <Badge
            key={symptom}
            variant="destructive"
            className="cursor-pointer bg-primary-dark hover:primary-light text-white"
          >
            {symptom}
            <X
              className="ml-1 h-3 w-3"
              onClick={() => removeSymptom(symptom)}
            />
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {SUGGESTED_SYMPTOMS.filter(
          (symptom) => !selected.includes(symptom)
        ).map((symptom) => (
          <Badge
            key={symptom}
            variant="secondary"
            className="cursor-pointer bg-primary hover:bg-primary-dark text-white"
            onClick={() => addSymptom(symptom)}
          >
            {symptom}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add custom symptom"
          value={newSymptom}
          className="bg-primary-light"
          onChange={(e) => setNewSymptom(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSymptom(newSymptom);
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => addSymptom(newSymptom)}
          className="bg-primary-dark text-white"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
