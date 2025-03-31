'use client';

import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { trpc } from '@/lib/trpc';
import { ClerkProvider } from '@clerk/nextjs';
import { useNeedsOnboarding } from '@/hooks/use-needs-onboarding';

function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  useNeedsOnboarding();
  return <>{children}</>;
}

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-ubuntu">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OnboardingWrapper>{children}</OnboardingWrapper>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

export default trpc.withTRPC(RootLayout);
