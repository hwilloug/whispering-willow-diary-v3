'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

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
  const { data: settings } = trpc.settings.get.useQuery();
  const [newSubstance, setNewSubstance] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const addSubstance = (substanceName: string, amount: string) => {
    if (substanceName && !selected.some(s => s.substance === substanceName)) {
      onSelect([...selected, {
        substance: substanceName,
        amount: amount
      }]);
    }
    setNewSubstance('');
    setNewAmount('');
  };

  const removeSubstance = (substanceName: string) => {
    onSelect(selected.filter((s) => s.substance !== substanceName));
  };

  const updateAmount = (substanceName: string, amount: string) => {
    onSelect(selected.map(s => 
      s.substance === substanceName 
        ? { ...s, amount } 
        : s
    ));
  };

  return (
    <div className="space-y-2">
      <Label>Substance Use</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((s) => (
          <div key={s.substance} className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer bg-primary-dark hover:primary-light text-white"
            >
              {s.substance}
              <X
                className="ml-1 h-3 w-3"
                onClick={() => removeSubstance(s.substance)}
              />
            </Badge>
            <Input
              type="text"
              placeholder="Amount"
              value={s.amount || ''}
              onChange={(e) => updateAmount(s.substance, e.target.value)}
              className="w-24 h-8 bg-primary-light"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {(settings?.suggestedSubstances ?? []).filter(
          (substance: string) => !selected.some(s => s.substance === substance)
        ).map((substance: string) => (
          <Badge
            key={substance}
            variant="secondary"
            className="cursor-pointer bg-primary hover:bg-primary-dark text-white"
            onClick={() => addSubstance(substance, '')}
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
              addSubstance(newSubstance, newAmount);
            }
          }}
        />
        <Input
          placeholder="Amount"
          value={newAmount}
          className="bg-primary-light w-24"
          onChange={(e) => setNewAmount(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSubstance(newSubstance, newAmount);
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => addSubstance(newSubstance, newAmount)}
          className="bg-primary-dark text-white"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
