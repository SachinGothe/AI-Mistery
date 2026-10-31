import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { errMsg, getResult } from '../api.js';
import { ErrorBanner, LinkBtn, Loading, ShareBtn } from '../ui.jsx';

export default function Results() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getResult(id).then(setR).catch(e => setError(errMsg(e))); }, [id]);

  if (!r) return error ? <ErrorBanner msg={error} /> : <Loading text="Reading the verdict..." />;
  return (
    <section>
      <h1 className={`stamp font-display text-4xl font-bold ${r.correct ? 'text-tag' : 'text-red'}`}>
        {r.correct ? 'Case closed. You got them.' : 'Wrong person.'}
      </h1>
      <p className="rise mt-3 text-lg" style={{ animationDelay: '.5s' }}>The culprit was <strong>{r.culprit.name}</strong> ({r.culprit.role}).</p>
      {!r.correct && <p className="text-paper/70">You accused {r.accused.name}.</p>}
      <p className="mt-6 max-w-2xl whitespace-pre-line leading-relaxed">{r.explanation}</p>
      <div className="mt-8 rounded border border-line bg-panel p-5">
        <p className="font-display text-5xl">{r.score} <span className="text-lg text-paper/60">points</span></p>
        <ul className="mt-3 text-sm text-paper/80">
          <li>Correct accusation: +{r.breakdown.base}</li>
          <li>Clues discovered: +{r.breakdown.clues}</li>
          <li>Hints used: {r.breakdown.hints}</li>
        </ul>
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><LinkBtn to="/create">Start another mystery</LinkBtn><ShareBtn id={id} /></div>
    </section>
  );
}
