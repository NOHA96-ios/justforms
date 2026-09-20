import { useEffect, useState, useCallback } from 'react';
import * as storage from '@/lib/storage';
import type { Form, Question } from '@/types';
import { ArrowLeft, Plus, GripVertical, Trash2, Eye, Save, Check } from 'lucide-react';

interface Props {
  form: Form;
  onBack: () => void;
  onPreview: (form: Form) => void;
}

export default function FormEditor({ form, onBack, onPreview }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadQuestions = useCallback(async () => {
    const data = await storage.getQuestions(form.id);
    setQuestions(data);
    setLoading(false);
  }, [form.id]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  async function saveFormMeta() {
    setSaving(true);
    await storage.updateForm(form.id, { title, description });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addQuestion() {
    const position = questions.length;
    const question = await storage.createQuestion(form.id, position);
    setQuestions([...questions, question]);
  }

  async function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    await storage.updateQuestion(id, patch);
  }

  async function deleteQuestion(id: string) {
    await storage.deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  async function moveQuestion(index: number, dir: -1 | 1) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const reordered = [...questions];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setQuestions(reordered);
    for (let i = 0; i < reordered.length; i++) {
      await storage.updateQuestion(reordered[i].id, { position: i });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-6 py-3.5 flex items-center justify-between">
          <button onClick={onBack} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            All forms
          </button>
          <div className="flex items-center gap-2">
            <button onClick={saveFormMeta} className="btn-secondary">
              {saved ? <Check className="h-4 w-4 text-green-600" /> : <Save className="h-4 w-4" />}
              {saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => onPreview({ ...form, title, description })} className="btn-primary">
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Form header card */}
        <div className="card p-7 mb-5 fade-in">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form title"
            className="w-full text-2xl font-semibold text-gray-900 border-none outline-none placeholder-gray-300 bg-transparent mb-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description…"
            rows={2}
            className="w-full text-sm text-gray-600 border-none outline-none placeholder-gray-300 bg-transparent resize-none"
          />
        </div>

        {/* Questions */}
        {loading ? (
          <div className="text-sm text-gray-400 text-center py-8">Loading questions…</div>
        ) : (
          <>
            {questions.map((q, i) => (
              <div key={q.id} className="card p-5 mb-3 fade-in group">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <GripVertical className="h-4 w-4 text-gray-300" />
                    <span className="text-xs font-medium text-gray-400">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <input
                      value={q.question_text}
                      onChange={(e) => updateQuestion(q.id, { question_text: e.target.value })}
                      placeholder="Your question…"
                      className="w-full text-base font-medium text-gray-900 border-none outline-none placeholder-gray-300 bg-transparent mb-3"
                    />
                    <div className="rounded-lg bg-gray-50 border border-gray-100 px-3.5 py-2.5 text-sm text-gray-400">
                      Respondent enters text here…
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={() => updateQuestion(q.id, { required: !q.required })}
                          className={`relative h-5 w-9 rounded-full transition-colors ${q.required ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${q.required ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                        <span className="text-xs text-gray-500">Required</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveQuestion(i, -1)}
                          disabled={i === 0}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                        >
                          <ArrowLeft className="h-3.5 w-3.5 rotate-90" />
                        </button>
                        <button
                          onClick={() => moveQuestion(i, 1)}
                          disabled={i === questions.length - 1}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                        >
                          <ArrowLeft className="h-3.5 w-3.5 -rotate-90" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full card p-4 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add question
            </button>
          </>
        )}
      </div>
    </div>
  );
}
