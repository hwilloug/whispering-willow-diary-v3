'use client';

import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

export function useSettings() {
  const { toast } = useToast();
  const utils = trpc.useContext();

  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Your settings have been saved.'
      });
      utils.settings.get.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    settings,
    isLoading,
    updateSettings
  };
}