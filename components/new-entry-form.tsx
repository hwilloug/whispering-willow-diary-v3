'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ActivitySelector } from '@/components/activity-selector';
import { SymptomSelector } from '@/components/symptom-selector';
import { DrugUseSelector } from '@/components/drug-use-selector';
import { FeelingSelector } from '@/components/feeling-selector';
import { trpc } from '@/lib/trpc'
import { AppRouter } from '@/server';
import { inferRouterOutputs } from '@trpc/server';

interface NewEntryFormProps {
  date: string;
  id?: string;
}
export function NewEntryForm({ date, id }: NewEntryFormProps) {
  const router = useRouter();

  let existingEntry: inferRouterOutputs<AppRouter>['journal']['getById'] | null = null;
  if (id) {
    const { data } = trpc.journal.getById.useQuery({ id });
    existingEntry = data;
  }

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<string | undefined>(undefined);
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [activities, setActivities] = useState<{
    id?: string;
    activity: string;
  }[]>([]);
  const [symptoms, setSymptoms] = useState<{
    id?: string;
    symptom: string;
    severity?: number;
    category?: string;
  }[]>([]);
  const [sleepHours, setSleepHours] = useState<number | undefined>(undefined);
  const [affirmation, setAffirmation] = useState<string | undefined>(undefined);
  const [feelings, setFeelings] = useState<{
    id?: string;
    feeling: string;
  }[]>([]);
  const [drugUse, setDrugUse] = useState<{
    id?: string;
    substance: string;
    amount?: string;
    notes?: string;
  }[]>([]);
  const [exerciseMinutes, setExerciseMinutes] = useState<number | undefined>(undefined);

  // Initialize with existing entry if available
  useEffect(() => {
    if (existingEntry) {
      setTitle(existingEntry.title);
      setContent(existingEntry.content ?? undefined);
      setMood(existingEntry.mood ?? undefined);
      setActivities(existingEntry.activities ?? []);
      setSymptoms(existingEntry.symptoms?.map(symptom => ({
        id: symptom.id,
        symptom: symptom.symptom,
        severity: symptom.severity ?? undefined,
        category: symptom.category
      })) ?? []);
      setSleepHours(existingEntry.sleepHours ?? 0);
      setAffirmation(existingEntry.affirmation ?? '');
      setFeelings(existingEntry.feelings ?? []);
      setDrugUse(existingEntry.substances?.map(substance => ({
        id: substance.id,
        substance: substance.substance,
        amount: substance.amount?.toString(),
        notes: substance.notes || undefined
      })) || []);
      setExerciseMinutes(existingEntry.exerciseMinutes ?? 0);
    }
  }, [existingEntry]);

  const createEntry = trpc.journal.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard?tab=journal')
    }
  });

  const updateEntry = trpc.journal.update.useMutation({
    onSuccess: () => {
      router.push('/dashboard?tab=journal')
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!existingEntry) {
      await createEntry.mutateAsync({
        date,
        title,
        content,
        mood: mood,
        sleepHours: sleepHours,
        exerciseMinutes: exerciseMinutes,
        affirmation,
        activities: activities.map(a => a.activity),
        feelings: feelings.map(f => f.feeling),
        symptoms: symptoms.map(s => ({
          symptom: s.symptom,
          severity: s.severity || 1,
          category: s.category || 'Other'
        })),
        substances: drugUse.map(d => ({
          substance: d.substance,
          amount: d.amount || '',
          notes: d.notes || ''
        }))
      });
    } else if (id) {
      await updateEntry.mutateAsync({
        id,
        data: {
          date,
          title,
          content,
          mood,
          sleepHours,
          exerciseMinutes,
          affirmation,
          activities: activities.map(a => a.activity),
          feelings: feelings.map(f => f.feeling),
          symptoms: symptoms.map(s => ({
            symptom: s.symptom,
            severity: s.severity || 1,
            category: s.category || 'Other'
          })),
          substances: drugUse.map(d => ({
            substance: d.substance,
            amount: d.amount || '',
            notes: d.notes || ''
          }))
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>{existingEntry ? 'Edit' : 'New'} Journal Entry</CardTitle>
          <CardDescription>
            Record your thoughts, feelings, and experiences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your entry a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-primary-light"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={mood ? [mood] : undefined}
                onValueChange={([value]) => setMood(value)}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-center font-medium">{mood}/10</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sleep Duration</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={sleepHours ? [sleepHours] : undefined}
                onValueChange={([value]) => setSleepHours(value)}
                min={0}
                max={12}
                step={0.5}
                className="flex-1"
              />
              <span className="w-20 text-center font-medium">
                {sleepHours}h
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Exercise Duration</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={exerciseMinutes ? [exerciseMinutes] : undefined}
                onValueChange={([value]) => setExerciseMinutes(value)}
                min={0}
                max={180}
                step={5}
                className="flex-1"
              />
              <span className="w-20 text-center font-medium">
                {exerciseMinutes}min
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="affirmation">Daily Affirmation</Label>
            <Input
              id="affirmation"
              placeholder="Today's positive affirmation..."
              value={affirmation}
              onChange={(e) => setAffirmation(e.target.value)}
              className="bg-primary-light"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Journal Entry</Label>
            <Textarea
              id="content"
              placeholder="Write your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <FeelingSelector 
            selected={feelings} 
            onSelect={setFeelings}
          />

          <ActivitySelector 
            selected={activities} 
            onSelect={setActivities}
          />

          <SymptomSelector 
            selected={symptoms} 
            onSelect={setSymptoms}
          />

          <DrugUseSelector 
            selected={drugUse} 
            onSelect={setDrugUse}
          />

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit">Save Entry</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
