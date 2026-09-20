import { useEffect, useState } from 'react';
import * as storage from '@/lib/storage';
import type { Form, Question } from '@/types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  form: Form;
  onBack: () => void;
}

export default function FormPreview({ form, onBack }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const data = await storage.getQuestions(form.id);
      setQuestions(data);
      setLoading(false);
    })();
  }, [form.id]);

  async function submit() {
    const newErrors: Record<string, boolean> = {};
    questions.forEach((q) => {
      if (q.required && !answers[q.id]?.trim()) {
        newErrors[q.id] = true;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    const answerRows = questions
      .filter((q) => answers[q.id]?.trim())
      .map((q) => ({
        question_id: q.id,
        answer_text: answers[q.id].trim(),
      }));

    await storage.createResponse(form.id, answerRows);

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="card p-12 text-center max-w-md fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mb-5">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-sm text-gray-500 mb-6">Your response has been submitted.</p>
          <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="btn-secondary">
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-3.5">
          <button onClick={onBack} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to editor
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="card p-8 fade-in">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{form.title || 'Untitled form'}</h1>
          {form.description && <p className="text-sm text-gray-500 mb-6">{form.description}</p>}
          <div className="h-px bg-gray-100 mb-6" />

          {loading ? (
            <div className="text-sm text-gray-400">Loading…</div>
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-400">This form has no questions yet.</p>
          ) : (
            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    <span className="text-gray-400 mr-1.5">{i + 1}.</span>
                    {q.question_text || 'Untitled question'}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => {
                      setAnswers({ ...answers, [q.id]: e.target.value });
                      if (errors[q.id]) setErrors({ ...errors, [q.id]: false });
                    }}
                    rows={2}
                    placeholder="Type your answer…"
                    className={`input resize-none ${errors[q.id] ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                  />
                  {errors[q.id] && <p className="text-xs text-red-500 mt-1.5">This field is required.</p>}
                </div>
              ))}
            </div>
          )}

          {questions.length > 0 && (
            <button onClick={submit} disabled={submitting} className="btn-primary mt-8">
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
