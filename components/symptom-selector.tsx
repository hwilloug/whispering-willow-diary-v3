'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

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
  const { data: settings } = trpc.settings.get.useQuery();
  const [newSymptom, setNewSymptom] = useState('');
  const [newSymptomCategory, setNewSymptomCategory] = useState('');

  const addSymptom = (symptomName: string) => {
    if (symptomName && !selected.some(s => s.symptom === symptomName)) {
      // Check if symptom exists in suggested symptoms
      const suggestedSymptom = settings?.suggestedSymptoms?.find(
        s => s.symptom.toLowerCase() === symptomName.toLowerCase()
      );

      onSelect([...selected, {
        symptom: symptomName,
        severity: 5, // Default severity
        category: suggestedSymptom?.category || newSymptomCategory || 'Other'
      }]);
    }
    setNewSymptom('');
  };

  const removeSymptom = (symptomName: string) => {
    onSelect(selected.filter((s) => s.symptom !== symptomName));
  };

  // Group symptoms by category
  const groupedSymptoms = (settings?.suggestedSymptoms || []).reduce((acc: Record<string, Array<{symptom: string, category: string}>>, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = [];
    }
    acc[curr.category].push(curr);
    return acc;
  }, {});

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
      <div className="space-y-4">
        {Object.entries(groupedSymptoms).map(([category, symptoms]) => (
          <div key={category} className="space-y-2">
            <Label className="text-sm text-muted-foreground">{category}</Label>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                !selected.some(s => s.symptom === symptom.symptom) && (
                  <Badge
                    key={symptom.symptom}
                    variant="secondary"
                    className="cursor-pointer bg-primary hover:bg-primary-dark text-white"
                    onClick={() => addSymptom(symptom.symptom)}
                  >
                    {symptom.symptom}
                  </Badge>
                )
              ))}
            </div>
          </div>
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
        <select
          className="bg-primary-light rounded-md border border-input px-3 py-2"
          value={newSymptomCategory}
          onChange={(e) => setNewSymptomCategory(e.target.value)}
        >
          <option value="">Select category</option>
          <option value="mania">Mania</option>
          <option value="depression">Depression</option>
          <option value="anxiety">Anxiety</option>
          <option value="adhd">ADHD</option>
          <option value="ocd">OCD</option>
        </select>
        <Button
          type="button"
          variant="secondary"
          onClick={() => addSymptom(newSymptom, )}
          className="bg-primary-dark text-white"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
