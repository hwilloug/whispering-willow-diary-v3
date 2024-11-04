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
  selected: {
    symptom: string;
    severity?: number;
    category?: string;
    id?: string;
  }[];
  onSelect: (symptoms: {
    symptom: string;
    severity?: number;
    category?: string;
    id?: string;
  }[]) => void;
}

export function SymptomSelector({ selected, onSelect }: SymptomSelectorProps) {
  const [newSymptom, setNewSymptom] = useState('');

  const addSymptom = (symptomName: string) => {
    if (symptomName && !selected.some(s => s.symptom === symptomName)) {
      onSelect([...selected, {
        symptom: symptomName,
        severity: 5, // Default severity
        category: 'Custom' // Default category
      }]);
    }
    setNewSymptom('');
  };

  const removeSymptom = (symptomName: string) => {
    onSelect(selected.filter((s) => s.symptom !== symptomName));
  };

  return (
    <div className="space-y-2">
      <Label>Symptoms</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((s) => (
          <Badge
            key={s.symptom}
            variant="destructive"
            className="cursor-pointer bg-primary-dark hover:primary-light text-white"
          >
            {s.symptom}
            <X
              className="ml-1 h-3 w-3"
              onClick={() => removeSymptom(s.symptom)}
            />
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {SUGGESTED_SYMPTOMS.filter(
          (symptom) => !selected.some(s => s.symptom === symptom)
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
