/*
# Create forms, questions, responses, answers tables (single-tenant, no auth)

1. New Tables
- `forms`: id, title, description, created_at, updated_at
- `questions`: id, form_id, question_text, required, position, created_at
- `responses`: id, form_id, submitted_at
- `answers`: id, response_id, question_id, answer_text
2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (single-tenant app, no sign-in).
3. Notes
- questions.form_id references forms.id ON DELETE CASCADE
- responses.form_id references forms.id ON DELETE CASCADE
- answers.response_id references responses.id ON DELETE CASCADE
- answers.question_id references questions.id ON DELETE CASCADE
*/

CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled form',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_forms" ON forms;
CREATE POLICY "anon_select_forms" ON forms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_forms" ON forms;
CREATE POLICY "anon_insert_forms" ON forms FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_forms" ON forms;
CREATE POLICY "anon_update_forms" ON forms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_forms" ON forms;
CREATE POLICY "anon_delete_forms" ON forms FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  question_text text NOT NULL DEFAULT '',
  required boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
CREATE POLICY "anon_insert_questions" ON questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_questions" ON questions;
CREATE POLICY "anon_update_questions" ON questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_questions" ON questions;
CREATE POLICY "anon_delete_questions" ON questions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_responses" ON responses;
CREATE POLICY "anon_select_responses" ON responses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_responses" ON responses;
CREATE POLICY "anon_insert_responses" ON responses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_responses" ON responses;
CREATE POLICY "anon_update_responses" ON responses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_responses" ON responses;
CREATE POLICY "anon_delete_responses" ON responses FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text text DEFAULT ''
);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_answers" ON answers;
CREATE POLICY "anon_select_answers" ON answers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_answers" ON answers;
CREATE POLICY "anon_insert_answers" ON answers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_answers" ON answers;
CREATE POLICY "anon_update_answers" ON answers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_answers" ON answers;
CREATE POLICY "anon_delete_answers" ON answers FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS questions_form_id_idx ON questions(form_id);
CREATE INDEX IF NOT EXISTS responses_form_id_idx ON responses(form_id);
CREATE INDEX IF NOT EXISTS answers_response_id_idx ON answers(response_id);
CREATE INDEX IF NOT EXISTS answers_question_id_idx ON answers(question_id);
