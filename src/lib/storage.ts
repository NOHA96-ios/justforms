import type { Form, Question, ResponseWithAnswers, Answer } from '@/types';

const PREFIX = 'formbuilder:';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

function uid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export async function getForms(): Promise<Form[]> {
  const forms = read<Form[]>('forms', []);
  return forms.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function createForm(title = 'Untitled form', description = ''): Promise<Form> {
  const forms = read<Form[]>('forms', []);
  const form: Form = {
    id: uid(),
    title,
    description,
    created_at: now(),
    updated_at: now(),
  };
  forms.push(form);
  write('forms', forms);
  return form;
}

export async function updateForm(id: string, patch: Partial<Form>): Promise<void> {
  const forms = read<Form[]>('forms', []);
  const idx = forms.findIndex((f) => f.id === id);
  if (idx >= 0) {
    forms[idx] = { ...forms[idx], ...patch, updated_at: now() };
    write('forms', forms);
  }
}

export async function deleteForm(id: string): Promise<void> {
  const forms = read<Form[]>('forms', []).filter((f) => f.id !== id);
  write('forms', forms);
  const questions = read<Question[]>('questions', []).filter((q) => q.form_id !== id);
  write('questions', questions);
  const responses = read<ResponseWithAnswers[]>('responses', []).filter((r) => r.form_id !== id);
  write('responses', responses);
}

export async function getQuestions(formId: string): Promise<Question[]> {
  const questions = read<Question[]>('questions', []);
  return questions
    .filter((q) => q.form_id === formId)
    .sort((a, b) => a.position - b.position);
}

export async function createQuestion(formId: string, position: number): Promise<Question> {
  const questions = read<Question[]>('questions', []);
  const question: Question = {
    id: uid(),
    form_id: formId,
    question_text: '',
    required: false,
    position,
    created_at: now(),
  };
  questions.push(question);
  write('questions', questions);
  return question;
}

export async function updateQuestion(id: string, patch: Partial<Question>): Promise<void> {
  const questions = read<Question[]>('questions', []);
  const idx = questions.findIndex((q) => q.id === id);
  if (idx >= 0) {
    questions[idx] = { ...questions[idx], ...patch };
    write('questions', questions);
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  const questions = read<Question[]>('questions', []).filter((q) => q.id !== id);
  write('questions', questions);
}

export async function getResponses(formId: string): Promise<ResponseWithAnswers[]> {
  const responses = read<ResponseWithAnswers[]>('responses', []);
  return responses
    .filter((r) => r.form_id === formId)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
}

export async function createResponse(formId: string, answers: { question_id: string; answer_text: string }[]): Promise<void> {
  const responses = read<ResponseWithAnswers[]>('responses', []);
  const responseId = uid();
  const response: ResponseWithAnswers = {
    id: responseId,
    form_id: formId,
    submitted_at: now(),
    answers: answers.map((a) => ({
      id: uid(),
      response_id: responseId,
      question_id: a.question_id,
      answer_text: a.answer_text,
    })),
  };
  responses.push(response);
  write('responses', responses);
}

export async function deleteResponse(id: string): Promise<void> {
  const responses = read<ResponseWithAnswers[]>('responses', []).filter((r) => r.id !== id);
  write('responses', responses);
}
