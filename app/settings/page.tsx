'use client';

import { useState, useEffect } from 'react';
import { HeaderNav } from '@/components/header-nav';
import { SuggestionList } from '@/components/settings/suggestion-list';
import { trpc } from '@/lib/trpc';

interface Symptom {
  symptom: string;
  category: string;
}

export default function SettingsPage() {
  const [feelings, setFeelings] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [substances, setSubstances] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<string[]>([]);

  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateSettings = trpc.settings.update.useMutation();

  useEffect(() => {
    if (settings) {
      setFeelings(settings.suggestedFeelings);
      setActivities(settings.suggestedActivities);
      setSymptoms(settings.suggestedSymptoms);
      setSubstances(settings.suggestedSubstances);
      setCategories(settings.categories || ['Depression', 'Anxiety', 'Mania', 'OCD', 'ADHD', 'Other']);
    }
  }, [settings]);

  const handleSymptomAdd = (item: { symptom: string, category: string }) => {
    setSymptoms(prev => {
      const newSymptoms = [...prev];
      const category = item.category || 'Other';
      
      newSymptoms.push({
        symptom: item.symptom,
        category
      });

      updateSettings.mutate({
        suggestedSymptoms: newSymptoms
      });

      return newSymptoms;
    });
  };

  const handleFeelingsUpdate = (newFeelings: string[]) => {
    setFeelings(newFeelings);
    updateSettings.mutate({
      suggestedFeelings: newFeelings
    });
  };

  const handleActivitiesUpdate = (newActivities: string[]) => {
    setActivities(newActivities);
    updateSettings.mutate({
      suggestedActivities: newActivities
    });
  };

  const handleSubstancesUpdate = (newSubstances: string[]) => {
    setSubstances(newSubstances);
    updateSettings.mutate({
      suggestedSubstances: newSubstances
    });
  };

  const handleSymptomsUpdate = (symptomStrings: string[]) => {
    // Convert array of strings to array of Symptom objects
    const newSymptoms: Symptom[] = [];
    let currentCategory = 'Other';

    for (const item of symptomStrings) {
      if (item.startsWith('#')) {
        currentCategory = item.replace('# ', '');
      } else {
        newSymptoms.push({
          symptom: item,
          category: currentCategory
        });
      }
    }

    setSymptoms(newSymptoms);
    updateSettings.mutate({
      suggestedSymptoms: newSymptoms
    });
  };

  const handleCategoriesUpdate = (newCategories: string[]) => {
    // Ensure 'Other' category is always present
    if (!newCategories.includes('Other')) {
      newCategories.push('Other');
    }
    
    setCategories(newCategories);
    
    // Update symptoms to use 'Other' category for any symptoms with removed categories
    const updatedSymptoms = symptoms.map(symptom => ({
      ...symptom,
      category: newCategories.includes(symptom.category) ? symptom.category : 'Other'
    }));
    
    setSymptoms(updatedSymptoms);
    
    updateSettings.mutate({
      categories: newCategories,
      suggestedSymptoms: updatedSymptoms
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <HeaderNav />
        <main className="flex-1 container max-w-4xl py-8">
          <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  // Convert symptoms array to display format with headers
  const symptomsDisplay = symptoms.reduce((acc: string[], s) => {
    const categoryHeader = `# ${s.category}`;
    if (!acc.includes(categoryHeader)) {
      acc.push(categoryHeader);
    }
    const categoryIndex = acc.findIndex(item => item === categoryHeader);
    let insertIndex = categoryIndex + 1;
    while (insertIndex < acc.length && !acc[insertIndex].startsWith('#')) {
      insertIndex++;
    }
    acc.splice(insertIndex, 0, s.symptom);
    return acc;
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav />
      <main className="flex-1 container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>
        
        <div className="grid gap-6">
          <SuggestionList
            title="Mental Health Categories"
            description="Customize the categories you want to track (Other category cannot be removed)"
            items={categories}
            onUpdate={handleCategoriesUpdate}
          />
          
          <SuggestionList
            title="Feelings"
            description="Customize your suggested feelings for journal entries"
            items={feelings}
            onUpdate={handleFeelingsUpdate}
          />
          
          <SuggestionList
            title="Activities"
            description="Customize your suggested activities for journal entries"
            items={activities}
            onUpdate={handleActivitiesUpdate}
          />
          
          <SuggestionList
            title="Symptoms"
            description="Customize your suggested symptoms for mental health tracking"
            items={symptomsDisplay}
            onUpdate={handleSymptomsUpdate}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAdd={handleSymptomAdd}
          />
          
          <SuggestionList
            title="Substances"
            description="Customize your suggested substances for tracking usage"
            items={substances}
            onUpdate={handleSubstancesUpdate}
          />
        </div>
      </main>
    </div>
  );
}