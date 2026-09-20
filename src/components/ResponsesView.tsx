import { useEffect, useState } from 'react';
import * as storage from '@/lib/storage';
import type { Form, Question, ResponseWithAnswers } from '@/types';
import { ArrowLeft, Inbox, Trash2 } from 'lucide-react';

interface Props {
  form: Form;
  onBack: () => void;
}

export default function ResponsesView({ form, onBack }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const [qs, rs] = await Promise.all([
        storage.getQuestions(form.id),
        storage.getResponses(form.id),
      ]);
      setQuestions(qs);
      setResponses(rs);
      setLoading(false);
    })();
  }, [form.id]);

  async function deleteResponse(id: string) {
    if (!confirm('Delete this response?')) return;
    await storage.deleteResponse(id);
    const updated = responses.filter((r) => r.id !== id);
    setResponses(updated);
    if (selectedIdx >= updated.length) setSelectedIdx(Math.max(0, updated.length - 1));
  }

  function getAnswer(resp: ResponseWithAnswers, qId: string): string {
    const a = resp.answers.find((a) => a.question_id === qId);
    return a?.answer_text || '';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-3.5 flex items-center justify-between">
          <button onClick={onBack} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            All forms
          </button>
          <span className="text-sm font-medium text-gray-500">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">{form.title || 'Untitled form'}</h1>
        <p className="text-sm text-gray-500 mb-6">Responses</p>

        {loading ? (
          <div className="text-sm text-gray-400">Loading…</div>
        ) : responses.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mb-4">
              <Inbox className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No responses yet</h3>
            <p className="text-sm text-gray-500">Responses to this form will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-[260px_1fr]">
            {/* Response list */}
            <div className="card overflow-hidden h-fit">
              <div className="max-h-[600px] overflow-y-auto">
                {responses.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedIdx(i)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${selectedIdx === i ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-0.5">
                      Response {i + 1}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(r.submitted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Response detail */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Response {selectedIdx + 1} of {responses.length}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(responses[selectedIdx].submitted_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <button
                  onClick={() => deleteResponse(responses[selectedIdx].id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5">
                {questions.map((q, i) => {
                  const ans = getAnswer(responses[selectedIdx], q.id);
                  return (
                    <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                        Q{i + 1}: {q.question_text || 'Untitled question'}
                      </div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {ans || <span className="text-gray-300 italic">No answer</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
