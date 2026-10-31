import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { discover, errMsg, getCase, getHint, interrogate } from '../api.js';
import { getBoard, setBoard } from '../store.js';
import { Btn, ErrorBanner, Loading, ShareBtn } from '../ui.jsx';

export default function Investigation() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [board, setB] = useState(() => getBoard(id));
  const [who, setWho] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    getCase(id).then(d => d.status === 'solved' ? nav(`/case/${id}/result`, { replace: true }) : setC(d)).catch(e => setError(errMsg(e)));
  }, [id, nav]);

  const run = async fn => { setError(''); setBusy(true); try { await fn(); } catch (e) { setError(errMsg(e)); } setBusy(false); };
  const updateBoard = b => { setB(b); setBoard(id, b); };
  const link = (clueId, sId) => updateBoard({ ...board, links: { ...board.links, [clueId]: sId } });
  const ask = () => run(async () => { setC(await interrogate(id, who, q)); setQ(''); });

  if (!c) return error ? <ErrorBanner msg={error} /> : <Loading text="Loading case file..." />;
  const found = c.clues.filter(x => x.discovered).length;
  const linkCount = sId => Object.entries(board.links).filter(([k, v]) => v === sId && c.clues.find(x => x.id === k)?.discovered).length;
  const suspect = c.suspects.find(s => s.id === who);
  const log = c.interrogations.filter(i => i.suspectId === who);
  const left = c.questionsPerSuspect - log.length;

  return (
    <section>
      <ErrorBanner msg={error} />
      <h1 className="font-display text-3xl font-bold">{c.title}</h1>
      <p className="mt-1 text-sm text-paper/60">Clues {found}/{c.clues.length} · Hints {c.hintsUsed}/{c.hintsMax} · {c.difficulty}</p>
      <p className="mt-5 max-w-2xl whitespace-pre-line leading-relaxed">{c.story}</p>
      <div className="mt-4"><ShareBtn id={id} /></div>

      <h2 className="mt-10 font-display text-2xl font-bold">Suspects</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {c.suspects.map(s => (
          <article key={s.id} className={`rounded border bg-panel p-4 ${who === s.id ? 'border-tag' : 'border-line'}`}>
            <h3 className="font-semibold">{s.name} <span className="font-normal text-paper/60">({s.role})</span></h3>
            <p className="mt-1 text-sm">{s.description}</p>
            <p className="mt-2 text-sm text-tag">Alibi: {s.alibi}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <button onClick={() => setWho(s.id)} className="rounded border border-line px-3 py-1 hover:border-tag">Question {s.name.split(' ')[0]}</button>
              <span className="text-paper/60">{linkCount(s.id)} clue{linkCount(s.id) === 1 ? '' : 's'} linked</span>
            </div>
          </article>
        ))}
      </div>

      {suspect && (
        <div className="reveal mt-4 rounded border border-tag/60 bg-panel p-4">
          <h3 className="font-display text-xl font-bold">Interview: {suspect.name}</h3>
          {log.map((i, n) => (
            <div key={n} className="mt-3 text-sm"><p className="text-paper/60">You: {i.question}</p><p className="mt-1">{i.answer}</p></div>
          ))}
          <p className="mt-3 text-sm text-paper/60">{left > 0 ? `${left} question${left === 1 ? '' : 's'} left. Suspects can lie.` : 'No questions left for this suspect.'}</p>
          {left > 0 && (
            <div className="mt-2 flex gap-2">
              <input value={q} onChange={e => setQ(e.target.value)} maxLength={200} placeholder="Where were you at midnight?"
                aria-label="Your question" className="min-w-0 flex-1 rounded border border-line bg-ink p-2" />
              <Btn onClick={ask} disabled={busy || q.trim().length < 3}>{busy ? 'Asking...' : 'Ask'}</Btn>
            </div>
          )}
        </div>
      )}

      <h2 className="mt-10 font-display text-2xl font-bold">Evidence</h2>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {c.clues.map(x => (
          <li key={x.id}>
            {x.discovered ? (
              <div className="reveal h-full rounded border border-tag bg-tag/10 p-4">
                <p className="font-semibold">{x.label}</p><p className="mt-1 text-sm">{x.text}</p>
                <label className="mt-3 block text-xs text-paper/70">Points to
                  <select value={board.links[x.id] || ''} onChange={e => link(x.id, e.target.value)} className="ml-2 rounded border border-line bg-ink p-1 text-sm">
                    <option value="">nobody yet</option>
                    {c.suspects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
              </div>
            ) : (
              <button onClick={() => run(async () => setC(await discover(id, x.id)))} disabled={busy}
                className="h-full w-full rounded border border-dashed border-line p-4 text-left hover:border-tag disabled:opacity-60">
                <p className="font-semibold">{x.label}</p><p className="mt-1 text-sm text-paper/60">Tap to examine</p>
              </button>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-display text-2xl font-bold">Notes</h2>
      <textarea value={board.notes} onChange={e => updateBoard({ ...board, notes: e.target.value })} rows={4} aria-label="Detective notes"
        placeholder="Timelines, contradictions, hunches. Saved on this device." className="mt-3 w-full rounded border border-line bg-panel p-3" />

      <h2 className="mt-10 font-display text-2xl font-bold">Hints</h2>
      {c.hintsRevealed.map((h, i) => <p key={i} className="rise mt-2 rounded bg-panel p-3 text-sm">{h}</p>)}
      <p className="mt-2 text-sm text-paper/60">Each hint costs 10 points.</p>
      <button onClick={() => run(async () => { await getHint(id); setC(await getCase(id)); })} disabled={busy || c.hintsUsed >= c.hintsMax}
        className="mt-2 rounded border border-line px-4 py-2 hover:border-tag disabled:opacity-40">
        {c.hintsUsed >= c.hintsMax ? 'No hints left' : 'Use a hint'}
      </button>

      <div className="mt-12"><Btn onClick={() => nav(`/case/${id}/accuse`)}>Make an accusation</Btn></div>
    </section>
  );
}
