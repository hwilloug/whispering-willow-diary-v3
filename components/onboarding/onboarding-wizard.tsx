'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SuggestionList } from '@/components/settings/suggestion-list';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Brain, Heart, Activity, Pill } from 'lucide-react';

const steps = [
  {
    title: 'Welcome to Whispering Willow Diary',
    description: "Let's personalize your experience by setting up your tracking preferences. This will help make your journaling more meaningful and tailored to your needs.",
    icon: Brain
  },
  {
    title: 'Customize Your Feelings',
    description: 'Add common feelings you want to track in your journal entries.',
    icon: Heart
  },
  {
    title: 'Set Up Activities',
    description: 'Add activities you regularly engage in or want to track.',
    icon: Activity
  },
  {
    title: 'Mental Health Categories & Symptoms',
    description: 'Customize the mental health categories and symptoms you want to monitor.',
    icon: Brain
  },
  {
    title: 'Substance Tracking',
    description: 'Add any substances you want to monitor (medications, supplements, etc.).',
    icon: Pill
  }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [feelings, setFeelings] = useState<string[]>(['Happy', 'Sad', 'Anxious', 'Excited', 'Tired']);
  const [activities, setActivities] = useState<string[]>(['Exercise', 'Reading', 'Meditation', 'Work', 'Socializing']);
  const [symptoms, setSymptoms] = useState<Array<{symptom: string, category: string}>>([]);
  const [substances, setSubstances] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['Depression', 'Anxiety', 'Mania', 'OCD', 'ADHD', 'Other']);

  const router = useRouter();
  const { toast } = useToast();
  const updateSettings = trpc.settings.update.useMutation();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await updateSettings.mutateAsync({
        suggestedFeelings: feelings,
        suggestedActivities: activities,
        suggestedSymptoms: symptoms,
        suggestedSubstances: substances,
        categories
      });

      toast({
        title: 'Setup Complete!',
        description: 'Your preferences have been saved. Welcome to Whispering Willow Diary!'
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-light/40 to-primary-dark/40 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl bg-primary-light/40 backdrop-blur-md border-primary-light/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <StepIcon className="w-8 h-8 text-primary-dark" />
            <div>
              <CardTitle className="text-2xl text-primary-dark">{steps[currentStep].title}</CardTitle>
              <CardDescription className="text-primary-dark/80">{steps[currentStep].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <SuggestionList
              title="Feelings"
              description="Add or remove feelings you want to track"
              items={feelings}
              onUpdate={setFeelings}
            />
          )}
          {currentStep === 2 && (
            <SuggestionList
              title="Activities"
              description="Add or remove activities you want to track"
              items={activities}
              onUpdate={setActivities}
            />
          )}
          {currentStep === 3 && (
            <>
              <SuggestionList
                title="Categories"
                description="Customize your mental health tracking categories"
                items={categories}
                onUpdate={setCategories}
              />
              <div className="mt-4">
                <SuggestionList
                  title="Symptoms"
                  description="Add symptoms you want to track"
                  items={symptoms.map(s => s.symptom)}
                  categories={categories}
                  onAdd={(item) => setSymptoms([...symptoms, item])}
                  onUpdate={(items) => {
                    const newSymptoms = items.map(item => ({
                      symptom: item,
                      category: symptoms.find(s => s.symptom === item)?.category || 'Other'
                    }));
                    setSymptoms(newSymptoms);
                  }}
                />
              </div>
            </>
          )}
          {currentStep === 4 && (
            <SuggestionList
              title="Substances"
              description="Add substances you want to track"
              items={substances}
              onUpdate={setSubstances}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="mr-2"
              >
                Back
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleSkip}
            >
              Skip Setup
            </Button>
          </div>
          <Button
            onClick={handleNext}
            className="bg-secondary hover:bg-secondary-dark text-white"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 