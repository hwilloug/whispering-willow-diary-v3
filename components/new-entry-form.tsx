'use client';

import { useState } from 'react';
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

interface NewEntryFormProps {
  date: string;
}

export function NewEntryForm({ date }: NewEntryFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState([5]);
  const [activities, setActivities] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState([7]);
  const [affirmation, setAffirmation] = useState('');
  const [feelings, setFeelings] = useState<string[]>([]);
  const [drugUse, setDrugUse] = useState<string[]>([]);
  const [exerciseMinutes, setExerciseMinutes] = useState([30]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>New Journal Entry</CardTitle>
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
            />
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={mood}
                onValueChange={setMood}
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
                value={sleepHours}
                onValueChange={setSleepHours}
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
                value={exerciseMinutes}
                onValueChange={setExerciseMinutes}
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
              required
            />
          </div>

          <FeelingSelector selected={feelings} onSelect={setFeelings} />

          <ActivitySelector selected={activities} onSelect={setActivities} />

          <SymptomSelector selected={symptoms} onSelect={setSymptoms} />

          <DrugUseSelector selected={drugUse} onSelect={setDrugUse} />

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
