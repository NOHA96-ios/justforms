import { useState } from 'react';
import type { Form } from '@/types';
import FormList from '@/components/FormList';
import FormEditor from '@/components/FormEditor';
import FormPreview from '@/components/FormPreview';
import ResponsesView from '@/components/ResponsesView';

type View = 'list' | 'editor' | 'preview' | 'responses';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [activeForm, setActiveForm] = useState<Form | null>(null);

  if (view === 'list' || !activeForm) {
    return (
      <FormList
        onOpenForm={(form) => { setActiveForm(form); setView('editor'); }}
        onOpenResponses={(form) => { setActiveForm(form); setView('responses'); }}
      />
    );
  }

  if (view === 'editor') {
    return (
      <FormEditor
        form={activeForm}
        onBack={() => setView('list')}
        onPreview={(form) => { setActiveForm(form); setView('preview'); }}
      />
    );
  }

  if (view === 'preview') {
    return <FormPreview form={activeForm} onBack={() => setView('editor')} />;
  }

  return <ResponsesView form={activeForm} onBack={() => setView('list')} />;
}
