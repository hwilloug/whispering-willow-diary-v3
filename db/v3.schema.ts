import { 
  text, 
  timestamp, 
  uuid, 
  integer, 
  boolean,
  date,
  json,
  pgSchema,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export const v3 = pgSchema('v3');

// User settings for customizable suggestions
export const userSettings = v3.table('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  suggestedFeelings: json('suggested_feelings').$type<string[]>().default([]).notNull(),
  suggestedActivities: json('suggested_activities').$type<string[]>().default([]).notNull(),
  suggestedSymptoms: json('suggested_symptoms').$type<{symptom: string, category: string}[]>().default([]).notNull(),
  suggestedSubstances: json('suggested_substances').$type<string[]>().default([]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Journal entries
export const journalEntries = v3.table('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  date: date('date').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  mood: integer('mood'), // 1-10 scale
  sleepHours: numeric('sleep_hours'),
  exerciseMinutes: integer('exercise_minutes'),
  affirmation: text('affirmation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activities logged for each journal entry
export const entryActivities = v3.table('entry_activities', {
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  activity: text('activity').notNull(),
  id: uuid('id').defaultRandom().primaryKey(),
});

// Feelings logged for each journal entry
export const entryFeelings = v3.table('entry_feelings', {
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  feeling: text('feeling').notNull(),
  id: uuid('id').defaultRandom().primaryKey(),
});

// Symptoms logged for each journal entry
export const entrySymptoms = v3.table('entry_symptoms', {
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  symptom: text('symptom').notNull(),
  severity: integer('severity'), // 1-10 scale
  category: text('category').notNull(), // 'depression', 'anxiety', 'mania', 'ocd', 'adhd'
  id: uuid('id').defaultRandom().primaryKey(),
});

// Substance use tracking for each journal entry
export const substanceUse = v3.table('substance_use', {
  id: uuid('id').defaultRandom().primaryKey(),
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  substance: text('substance').notNull(),
  amount: text('amount'),
  notes: text('notes'),
});

// Goals and intentions
export const goals = v3.table('goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  targetDate: date('target_date'),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reminders for journaling and goals
export const reminders = v3.table('reminders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'journal' or 'goal'
  title: text('title').notNull(),
  message: text('message'),
  frequency: text('frequency').notNull(), // 'daily', 'weekly', etc.
  time: timestamp('time').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  activities: many(entryActivities, {
    relationName: 'entry_activities',
  }),
  feelings: many(entryFeelings, {
    relationName: 'entry_feelings',
  }),
  symptoms: many(entrySymptoms, {
    relationName: 'entry_symptoms',
  }),
  substances: many(substanceUse, {
    relationName: 'substance_use',
  })
}));

export const entryActivitiesRelations = relations(entryActivities, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [entryActivities.entryId],
    relationName: 'entry_activities',
    references: [journalEntries.id]
  })
}));

export const entryFeelingsRelations = relations(entryFeelings, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [entryFeelings.entryId],
    relationName: 'entry_feelings',
    references: [journalEntries.id]
  })
}));

export const entrySymptomsRelations = relations(entrySymptoms, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [entrySymptoms.entryId],
    relationName: 'entry_symptoms',
    references: [journalEntries.id]
  })
}));

export const substanceUseRelations = relations(substanceUse, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [substanceUse.entryId],
    relationName: 'substance_use',
    references: [journalEntries.id]
  })
}));