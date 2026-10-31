import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { accuse, errMsg, getCase } from '../api.js';
import { Btn, ErrorBanner, Loading } from '../ui.jsx';

export default function Accusation() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState(null);
  const [pick, setPick] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { getCase(id).then(setC).catch(e => setError(errMsg(e))); }, [id]);

  const submit = async () => {
    setError(''); setBusy(true);
    try { await accuse(id, pick); nav(`/case/${id}/result`); }
    catch (e) { setError(errMsg(e)); setBusy(false); }
  };

  if (!c) return error ? <ErrorBanner msg={error} /> : <Loading text="Loading suspects..." />;
  return (
    <section>
      <h1 className="font-display text-3xl">Who did it?</h1>
      <p className="mt-2 text-paper/70">You only get one accusation.</p>
      <ErrorBanner msg={error} />
      <div role="radiogroup" className="mt-6 grid gap-3 md:grid-cols-2">
        {c.suspects.map(s => (
          <button key={s.id} role="radio" aria-checked={pick === s.id} onClick={() => setPick(s.id)}
            className={`rounded border p-4 text-left ${pick === s.id ? 'border-tag bg-tag/15' : 'border-line bg-panel'}`}>
            <span className="font-semibold">{s.name}</span>
            <span className="block text-sm text-paper/70">{s.role}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex gap-3">
        <Btn onClick={submit} disabled={!pick || busy}>{busy ? 'Submitting...' : 'Accuse'}</Btn>
        <button onClick={() => nav(`/case/${id}`)} className="rounded border border-line px-4 py-2">Back to evidence</button>
      </div>
    </section>
  );
}
