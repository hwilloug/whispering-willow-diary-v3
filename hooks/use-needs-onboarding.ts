'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@clerk/nextjs';

export function useNeedsOnboarding() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { data: settings } = trpc.settings.get.useQuery();

  useEffect(() => {
    if (isLoaded && isSignedIn && settings) {
      // If user has no settings configured, they need onboarding
      const needsOnboarding = !settings.categories?.length && !settings.suggestedSymptoms?.length;
      
      if (window.location.pathname === '/onboarding' && !needsOnboarding) {
        router.replace('/dashboard');
      } else if (window.location.pathname !== '/onboarding' && needsOnboarding) {
        router.replace('/onboarding');
      }
    }
  }, [isLoaded, isSignedIn, settings, router]);

  return {
    isLoading: !isLoaded || !settings,
    needsOnboarding: !settings?.categories?.length && !settings?.suggestedSymptoms?.length
  };
} 