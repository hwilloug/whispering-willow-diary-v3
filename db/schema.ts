import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  integer, 
  boolean,
  date,
  json,
  primaryKey
} from "drizzle-orm/pg-core";

// User settings for customizable suggestions
export const userSettings = pgTable('user_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  suggestedFeelings: json('suggested_feelings').$type<string[]>().default([]).notNull(),
  suggestedActivities: json('suggested_activities').$type<string[]>().default([]).notNull(),
  suggestedSymptoms: json('suggested_symptoms').$type<string[]>().default([]).notNull(),
  suggestedSubstances: json('suggested_substances').$type<string[]>().default([]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Journal entries
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  date: date('date').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  mood: integer('mood').notNull(), // 1-10 scale
  sleepHours: integer('sleep_hours'),
  exerciseMinutes: integer('exercise_minutes'),
  affirmation: text('affirmation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activities logged for each journal entry
export const entryActivities = pgTable('entry_activities', {
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  activity: text('activity').notNull(),
  id: primaryKey(uuid('id').defaultRandom()),
});

// Feelings logged for each journal entry
export const entryFeelings = pgTable('entry_feelings', {
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  feeling: text('feeling').notNull(),
  id: primaryKey(uuid('id').defaultRandom()),
});

// Symptoms logged for each journal entry
export const entrySymptoms = pgTable('entry_symptoms', {
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  symptom: text('symptom').notNull(),
  severity: integer('severity'), // 1-10 scale
  category: text('category').notNull(), // 'depression', 'anxiety', 'mania', 'ocd', 'adhd'
  id: primaryKey(uuid('id').defaultRandom()),
});

// Substance use tracking for each journal entry
export const substanceUse = pgTable('substance_use', {
  id: uuid('id').defaultRandom().primaryKey(),
  entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  substance: text('substance').notNull(),
  amount: text('amount'),
  notes: text('notes'),
});

// Goals and intentions
export const goals = pgTable('goals', {
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
export const reminders = pgTable('reminders', {
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