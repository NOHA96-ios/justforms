import { useEffect, useState } from 'react';
import * as storage from '@/lib/storage';
import type { Form } from '@/types';
import { Plus, FileText, Calendar, ArrowRight, Trash2, BarChart3 } from 'lucide-react';

interface Props {
  onOpenForm: (form: Form) => void;
  onOpenResponses: (form: Form) => void;
}

export default function FormList({ onOpenForm, onOpenResponses }: Props) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    setLoading(true);
    const data = await storage.getForms();
    setForms(data);
    setLoading(false);
  }

  async function createForm() {
    setCreating(true);
    const form = await storage.createForm();
    setCreating(false);
    onOpenForm(form);
  }

  async function deleteForm(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this form and all its responses?')) return;
    await storage.deleteForm(id);
    setForms(forms.filter((f) => f.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Form Builder</span>
          </div>
          <button onClick={createForm} disabled={creating} className="btn-primary">
            <Plus className="h-4 w-4" />
            New form
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Your forms</h1>
        <p className="text-sm text-gray-500 mb-8">Create forms and collect responses — all in one place.</p>

        {loading ? (
          <div className="text-sm text-gray-400">Loading…</div>
        ) : forms.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mb-4">
              <FileText className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No forms yet</h3>
            <p className="text-sm text-gray-500 mb-5">Get started by creating your first form.</p>
            <button onClick={createForm} disabled={creating} className="btn-primary">
              <Plus className="h-4 w-4" />
              Create form
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                onClick={() => onOpenForm(form)}
                className="card p-5 cursor-pointer transition-all hover:shadow-md hover:border-gray-300 group fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <button
                    onClick={(e) => deleteForm(form.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{form.title || 'Untitled form'}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[2.5rem]">{form.description || 'No description'}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(form.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenResponses(form); }}
                    className="btn-ghost text-xs flex-1"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Responses
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenForm(form); }}
                    className="btn-ghost text-xs flex-1"
                  >
                    Edit
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
