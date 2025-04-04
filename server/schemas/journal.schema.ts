import { journalEntries } from '@/db/v3.schema';
import { z } from 'zod';

export const symptomSchema = z.object({
  symptom: z.string(),
  severity: z.number().min(1).max(10),
  category: z.string()
});

export const substanceSchema = z.object({
  substance: z.string(),
  amount: z.string().optional(),
  notes: z.string().optional()
});

export const createJournalEntrySchema = z.object({
  date: z.string(),
  title: z.string().min(1),
  content: z.string().min(1).optional(),
  mood: z.number().min(1).max(10).optional(),
  sleepHours: z.number().optional(),
  exerciseMinutes: z.number().optional(),
  affirmation: z.string().optional(),
  activities: z.array(z.string()).optional(),
  feelings: z.array(z.string()).optional(),
  symptoms: z.array(z.object({
    symptom: z.string(),
    severity: z.number().optional(),
    category: z.string()
  })).optional(),
  substances: z.array(z.object({
    substance: z.string(),
    amount: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
