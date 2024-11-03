CREATE TABLE IF NOT EXISTS "user_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "suggested_feelings" jsonb NOT NULL DEFAULT '[]',
  "suggested_activities" jsonb NOT NULL DEFAULT '[]',
  "suggested_symptoms" jsonb NOT NULL DEFAULT '[]',
  "suggested_substances" jsonb NOT NULL DEFAULT '[]',
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "journal_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "date" date NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "mood" integer NOT NULL,
  "sleep_hours" integer,
  "exercise_minutes" integer,
  "affirmation" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "entry_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entry_id" uuid NOT NULL REFERENCES "journal_entries" ("id") ON DELETE CASCADE,
  "activity" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "entry_feelings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entry_id" uuid NOT NULL REFERENCES "journal_entries" ("id") ON DELETE CASCADE,
  "feeling" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "entry_symptoms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entry_id" uuid NOT NULL REFERENCES "journal_entries" ("id") ON DELETE CASCADE,
  "symptom" text NOT NULL,
  "severity" integer,
  "category" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "substance_use" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entry_id" uuid NOT NULL REFERENCES "journal_entries" ("id") ON DELETE CASCADE,
  "substance" text NOT NULL,
  "amount" text,
  "notes" text
);

CREATE TABLE IF NOT EXISTS "goals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "target_date" date,
  "completed" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "reminders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "message" text,
  "frequency" text NOT NULL,
  "time" timestamp NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);