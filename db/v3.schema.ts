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
  categories: json('categories').$type<string[]>().default(['Depression', 'Anxiety', 'Mania', 'OCD', 'ADHD', 'Other']).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add this new table after the userSettings table
export const userStreaks = v3.table('user_streaks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastEntryDate: date('last_entry_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  tags: json('tags').$type<string[]>().default([]).notNull(),
  images: json('images').$type<string[]>().default([]).notNull(),
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

// Goal Categories
export const goalCategories = v3.table('goal_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Goal Subcategories
export const goalSubcategories = v3.table('goal_subcategories', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').notNull().references(() => goalCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Replace the existing goals table with the new schema
export const goals = v3.table('goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  subcategoryId: uuid('subcategory_id').references(() => goalSubcategories.id),
  startDate: date('start_date'),
  targetDate: date('target_date'),
  percentComplete: numeric('percent_complete').default('0'),
  status: text('status').default('active').notNull(), // 'active', 'completed', 'on_hold'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Goal Milestones
export const goalMilestones = v3.table('goal_milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  isComplete: boolean('is_complete').default(false).notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Goal Journal Entries (Check-ins)
export const goalJournalEntries = v3.table('goal_journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  entryDate: date('entry_date').notNull(),
  notes: text('notes'),
  progressUpdate: numeric('progress_update'),
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

// Goal Relations
export const goalCategoriesRelations = relations(goalCategories, ({ many }) => ({
  subcategories: many(goalSubcategories),
}));

export const goalSubcategoriesRelations = relations(goalSubcategories, ({ one }) => ({
  category: one(goalCategories, {
    fields: [goalSubcategories.categoryId],
    references: [goalCategories.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  subcategory: one(goalSubcategories, {
    fields: [goals.subcategoryId],
    references: [goalSubcategories.id],
  }),
  milestones: many(goalMilestones),
  journalEntries: many(goalJournalEntries),
}));

export const goalMilestonesRelations = relations(goalMilestones, ({ one }) => ({
  goal: one(goals, {
    fields: [goalMilestones.goalId],
    references: [goals.id],
  }),
}));

export const goalJournalEntriesRelations = relations(goalJournalEntries, ({ one }) => ({
  goal: one(goals, {
    fields: [goalJournalEntries.goalId],
    references: [goals.id],
  }),
}));