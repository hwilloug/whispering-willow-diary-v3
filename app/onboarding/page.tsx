'use client';

import { useWizard } from 'react-wizard-primitive';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { useState } from 'react';
import { SuggestionList } from '@/components/settings/suggestion-list';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useNeedsOnboarding } from '@/hooks/use-needs-onboarding';

export default function OnboardingPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const [feelings, setFeelings] = useState<string[]>(['Happy', 'Sad', 'Anxious', 'Excited', 'Tired']);
  const [activities, setActivities] = useState<string[]>(['Exercise', 'Reading', 'Meditation', 'Walking', 'Socializing']);
  const [symptoms, setSymptoms] = useState<{symptom: string, category: string}[]>([
    { symptom: 'Low Mood', category: 'Depression' },
    { symptom: 'Worry', category: 'Anxiety' },
    { symptom: 'Racing Thoughts', category: 'Mania' },
    { symptom: 'Difficulty Focusing', category: 'ADHD' }
  ]);
  const [substances, setSubstances] = useState<string[]>(['Caffeine', 'Alcohol', 'Nicotine']);
  const [categories, setCategories] = useState<string[]>(['Depression', 'Anxiety', 'Mania', 'OCD', 'ADHD', 'Other']);

  const wizard = useWizard({
    initialStepIndex: 0,
  });

  const { 
    activeStepIndex,
    nextStep,
    previousStep,
  } = wizard;

  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === 5;

  const { isLoading, needsOnboarding } = useNeedsOnboarding();

  const handleComplete = async () => {
    await updateSettings.mutateAsync({
      suggestedFeelings: feelings,
      suggestedActivities: activities,
      suggestedSymptoms: symptoms,
      suggestedSubstances: substances,
      categories
    });
    router.push('/dashboard');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-light/40 to-primary-dark/40 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl bg-primary-light/40 backdrop-blur-md border-primary-light/50">
        <CardHeader>
          <CardTitle className="text-3xl text-primary-dark text-center">Welcome to Whispering Willow Diary</CardTitle>
          <CardDescription className="text-center text-primary-dark/80">
            Let's personalize your experience in a few simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="w-full bg-primary-light/30 h-2 rounded-full">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((activeStepIndex + 1) / 6) * 100}%` }}
              />
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
              {activeStepIndex === 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-primary-dark">Welcome!</h3>
                  <p className="text-primary-dark">
                    Whispering Willow Diary is your personal mental health companion. We'll help you set up your account
                    to track what matters most to you. This will only take a few minutes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="card-glass p-6 text-primary-dark">
                      <h4 className="text-xl font-bold mb-2">What you'll set up:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Customize feelings to track</li>
                        <li>Add common activities</li>
                        <li>Define symptoms to monitor</li>
                        <li>Set up substance tracking</li>
                        <li>Personalize categories</li>
                      </ul>
                    </div>
                    <div className="card-glass p-6 text-primary-dark">
                      <h4 className="text-xl font-bold mb-2">Benefits:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Personalized tracking</li>
                        <li>Better insights</li>
                        <li>Easier daily entries</li>
                        <li>More accurate monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeStepIndex === 1 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-primary-dark">Feelings</h3>
                  <p className="text-primary-dark">
                    Customize the feelings you want to track in your journal entries. 
                    We've added some common ones to start with.
                  </p>
                  <SuggestionList
                    title="Feelings"
                    description="Add or remove feelings you want to track"
                    items={feelings}
                    onUpdate={setFeelings}
                  />
                </div>
              )}

              {activeStepIndex === 2 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-primary-dark">Activities</h3>
                  <p className="text-primary-dark">
                    Add activities you commonly engage in. This helps track what affects your mood.
                  </p>
                  <SuggestionList
                    title="Activities"
                    description="Add or remove common activities"
                    items={activities}
                    onUpdate={setActivities}
                  />
                </div>
              )}

              {activeStepIndex === 3 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-primary-dark">Categories</h3>
                  <p className="text-primary-dark">
                    Customize the mental health categories you want to track.
                  </p>
                  <SuggestionList
                    title="Categories"
                    description="Add or remove tracking categories (Other category cannot be removed)"
                    items={categories}
                    onUpdate={setCategories}
                  />
                </div>
              )}

              {activeStepIndex === 4 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-primary-dark">Symptoms</h3>
                  <p className="text-primary-dark">
                    Add symptoms you want to monitor under each category.
                  </p>
                  <SuggestionList
                    title="Symptoms"
                    description="Add symptoms to track under each category"
                    items={symptoms.map(s => s.symptom)}
                    categories={categories}
                    groupByCategory={true}
                    groupedItems={categories.map(category => ({
                      category,
                      items: symptoms
                        .filter(s => s.category === category)
                        .map(s => s.symptom)
                    }))}
                    onAdd={(item) => {
                      setSymptoms([...symptoms, item]);
                    }}
                    onUpdate={(items) => {
                      const newSymptoms = items.map(item => ({
                        symptom: item,
                        category: symptoms.find(s => s.symptom === item)?.category || 'Other'
                      }));
                      setSymptoms(newSymptoms);
                    }}
                  />
                </div>
              )}

              {activeStepIndex === 5 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-primary-dark">Substance Tracking</h3>
                  <p className="text-primary-dark">
                    Add substances you want to track (optional). This helps monitor their impact on your mental health.
                  </p>
                  <SuggestionList
                    title="Substances"
                    description="Add substances you want to track (optional)"
                    items={substances}
                    onUpdate={setSubstances}
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                onClick={() => previousStep()}
                disabled={isFirstStep}
                variant="outline"
                className="bg-primary-dark text-white hover:bg-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button
                onClick={isLastStep ? handleComplete : () => nextStep()}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                {isLastStep ? (
                  <>
                    Complete <Check className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 