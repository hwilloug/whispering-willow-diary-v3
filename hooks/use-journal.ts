'use client';

import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

export function useJournal() {
  const { toast } = useToast();
  const utils = trpc.useContext();

  const { data: entries, isLoading } = trpc.journal.getAll.useQuery();

  const createEntry = trpc.journal.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Entry created',
        description: 'Your journal entry has been saved.'
      });
      utils.journal.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateEntry = trpc.journal.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Entry updated',
        description: 'Your journal entry has been updated.'
      });
      utils.journal.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteEntry = trpc.journal.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Entry deleted',
        description: 'Your journal entry has been deleted.'
      });
      utils.journal.getAll.invalidate();
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
    entries,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry
  };
}