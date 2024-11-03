'use client';

import { useState } from 'react';
import { HeaderNav } from '@/components/header-nav';
import { SuggestionList } from '@/components/settings/suggestion-list';

export default function SettingsPage() {
  const [feelings, setFeelings] = useState([
    'Happy', 'Sad', 'Anxious', 'Excited', 'Frustrated',
    'Grateful', 'Peaceful', 'Overwhelmed', 'Motivated',
    'Tired', 'Energetic', 'Content'
  ]);
  
  const [activities, setActivities] = useState([
    'Meditation', 'Exercise', 'Reading', 'Work', 'Therapy',
    'Self-care', 'Socializing', 'Hobbies', 'Learning', 'Rest'
  ]);
  
  const [symptoms, setSymptoms] = useState([
    // Depression
    '--- Depression ---',
    'Depressed Mood',
    'Loss of Interest',
    'Changes in Appetite',
    'Sleep Problems',
    'Fatigue',
    'Worthlessness',
    'Difficulty Concentrating',
    'Suicidal Thoughts',
    'Social Withdrawal',
    
    // Anxiety
    '--- Anxiety ---',
    'Excessive Worry',
    'Restlessness',
    'Panic Attacks',
    'Heart Palpitations',
    'Sweating',
    'Trembling',
    'Shortness of Breath',
    'Social Anxiety',
    'Performance Anxiety',
    
    // Mania
    '--- Mania ---',
    'Elevated Mood',
    'Decreased Sleep Need',
    'Racing Thoughts',
    'Increased Energy',
    'Risky Behavior',
    'Rapid Speech',
    'Grandiose Ideas',
    'Hypersexuality',
    'Impulsivity',
    
    // OCD
    '--- OCD ---',
    'Intrusive Thoughts',
    'Compulsive Behaviors',
    'Checking Rituals',
    'Contamination Fears',
    'Symmetry Obsessions',
    'Hoarding',
    'Mental Rituals',
    'Reassurance Seeking',
    'Perfectionism',
    
    // ADHD
    '--- ADHD ---',
    'Difficulty Focusing',
    'Easily Distracted',
    'Procrastination',
    'Forgetfulness',
    'Disorganization',
    'Impulsive Decisions',
    'Hyperactivity',
    'Time Management Issues',
    'Task Switching Difficulty',
    'Emotional Dysregulation',
    'Rejection Sensitivity',
    'Executive Function Problems',
    
    // Physical
    '--- Physical ---',
    'Headache',
    'Nausea',
    'Muscle Tension',
    'Chest Pain',
    'Dizziness',
    'Insomnia'
  ]);
  
  const [substances, setSubstances] = useState([
    'Alcohol', 'Cannabis', 'Tobacco', 'Caffeine',
    'Prescription Medication'
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <main className="flex-1 container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>
        
        <div className="grid gap-6">
          <SuggestionList
            title="Feelings"
            description="Customize your suggested feelings for journal entries"
            items={feelings}
            onUpdate={setFeelings}
          />
          
          <SuggestionList
            title="Activities"
            description="Customize your suggested activities for journal entries"
            items={activities}
            onUpdate={setActivities}
          />
          
          <SuggestionList
            title="Symptoms"
            description="Customize your suggested symptoms for mental health tracking"
            items={symptoms}
            onUpdate={setSymptoms}
            allowHeaders={true}
          />
          
          <SuggestionList
            title="Substances"
            description="Customize your suggested substances for tracking usage"
            items={substances}
            onUpdate={setSubstances}
          />
        </div>
      </main>
    </div>
  );
}