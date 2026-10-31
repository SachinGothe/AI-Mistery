import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase, errMsg } from '../api.js';
import { saveCaseId } from '../store.js';
import { Btn, ErrorBanner, Loading } from '../ui.jsx';

const LEVELS = [
  ['easy', 'Easy', '3 suspects, 5 clues'],
  ['medium', 'Medium', '4 suspects, 7 clues'],
  ['hard', 'Hard', '5 suspects, 9 clues'],
];

export default function Create() {
  const nav = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (premise.trim().length < 10) return setError('Describe the setting in at least 10 characters.');
    setLoading(true);
    try { const c = await createCase(premise.trim(), difficulty); saveCaseId(c.id); nav(`/case/${c.id}`); }
    catch (e) { setError(errMsg(e)); setLoading(false); }
  };

  if (loading) return <Loading text="Gemini is writing your case. This can take up to 30 seconds." />;
  return (
    <section>
      <h1 className="font-display text-3xl">New case</h1>
      <ErrorBanner msg={error} />
      <label htmlFor="premise" className="mt-6 block font-medium">What is the setting?</label>
      <textarea id="premise" value={premise} onChange={e => setPremise(e.target.value)} maxLength={300} rows={4}
        placeholder="A jewel goes missing during a midnight train journey across Europe"
        className="mt-2 w-full rounded border border-line bg-panel p-3" />
      <p className="mt-1 text-right text-xs text-paper/60">{premise.length}/300</p>
      <fieldset className="mt-4">
        <legend className="font-medium">Difficulty</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {LEVELS.map(([v, name, desc]) => (
            <button key={v} type="button" onClick={() => setDifficulty(v)} aria-pressed={difficulty === v}
              className={`rounded border p-4 text-left ${difficulty === v ? 'border-tag bg-tag/15' : 'border-line bg-panel'}`}>
              <span className="block font-semibold">{name}</span>
              <span className="text-sm text-paper/70">{desc}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <Btn onClick={submit} className="mt-6">Generate mystery</Btn>
    </section>
  );
}
