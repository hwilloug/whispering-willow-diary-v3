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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ActivitySelector } from '@/components/activity-selector';
import { SymptomSelector } from '@/components/symptom-selector';
import { DrugUseSelector } from '@/components/drug-use-selector';
import { FeelingSelector } from '@/components/feeling-selector';
import { trpc } from '@/lib/trpc'
import { AppRouter } from '@/server';
import { inferRouterOutputs } from '@trpc/server';
import TagSelector from "@/components/journal/tag-selector";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { Image, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { GoalSelector } from './journal/goal-selector';

interface NewEntryFormProps {
  date: string;
  id?: string;
}
export function NewEntryForm({ date, id }: NewEntryFormProps) {
  const router = useRouter();
  const { toast } = useToast();

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
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [goalUpdates, setGoalUpdates] = useState<Array<{ 
    goalId: string; 
    progress: number; 
    notes: string; 
  }>>([]);

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
      setSleepHours(parseFloat(existingEntry.sleepHours || "0"))
      setAffirmation(existingEntry.affirmation ?? '');
      setFeelings(existingEntry.feelings ?? []);
      setDrugUse(existingEntry.substances?.map(substance => ({
        id: substance.id,
        substance: substance.substance,
        amount: substance.amount?.toString(),
        notes: substance.notes || undefined
      })) || []);
      setExerciseMinutes(existingEntry.exerciseMinutes ?? 0);
      setTags(existingEntry.tags || []);
      setImages(existingEntry.images || []);
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

  const deleteImage = trpc.journal.deleteImage.useMutation({
    onSuccess: () => {
      // No need to invalidate queries since we're managing state locally
    },
    onError: (error) => {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleImageDelete = async (imageUrl: string, index: number) => {
    try {
      await deleteImage.mutateAsync({
        imageUrl,
        entryId: id
      });
      
      // Only update local state after successful deletion
      setImages(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error handling image deletion:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const entryData = {
        date,
        title: title || (content ? content.substring(0, 50) + (content.length > 50 ? "..." : "") : "Untitled Entry"),
        content: content || '',
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
          amount: d.amount || '1',
          notes: d.notes || ''
        })),
        tags,
        images: images,
        goalUpdates,
      };

      if (!existingEntry) {
        const result = await createEntry.mutateAsync(entryData);
      } else if (id) {
        const result = await updateEntry.mutateAsync({
          id,
          data: entryData
        });
      }
    } catch (error) {
      console.error("Error saving entry:", error);
    } finally {
      setIsLoading(false);
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
            <div className="min-h-[200px]">
              <MDEditor
                value={content || ''}
                onChange={(val) => setContent(val || '')}
                preview="edit"
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
                height={200}
                className="bg-background"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label>Add Images</Label>
            <div className="mt-2">
              <UploadDropzone<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res) {
                    const newImages = res.map((file) => file.url);
                    setImages((prev) => [...prev, ...newImages]);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error(`Upload error: ${error.message}`);
                  toast({
                    title: "Upload Failed",
                    description: error.message,
                    variant: "destructive",
                  });
                }}
                className={`
                  [&_[data-ut-element=button]]:hover:bg-primary-light/90 [&_[data-ut-element=button]]:p-2 [&_[data-ut-element=button]]:text-primary-dark
                  [&_[data-ut-element=upload-icon]]:text-primary-dark [&_[data-ut-element=upload-icon]]:h-8 [&_[data-ut-element=upload-icon]]:w-8
                  [&_[data-ut-element=label]]:text-primary-dark [&_[data-ut-element=label]]:font-medium
                  [&_[data-ut-element=allowed-content]]:text-primary-dark
                  border-2 border-dashed
                  border-primary-dark/20
                  bg-primary-light/20
                  p-8
                  hover:bg-primary-light/20
                  rounded-lg
                  transition-colors duration-200
                `}
              />
            </div>
            
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={`Uploaded image ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                      <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                      <div className="relative z-10 flex gap-2">
                        <a 
                          href={image} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
                        >
                          <Image className="h-5 w-5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleImageDelete(image, index)}
                          className="p-1.5 rounded-full bg-white/10 text-white hover:bg-red-500/50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

          <GoalSelector 
            onUpdate={(updates) => {
              setGoalUpdates(updates);
            }}
          />

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="mt-1">
              <TagSelector selectedTags={tags} onChange={setTags} />
            </div>
          </div>


          <div className="flex justify-end space-x-4">
            <Button
              variant="default"
              type="button"
              className="bg-transparent text-primary-dark"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : id === "new" ? "Create Entry" : "Update Entry"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
