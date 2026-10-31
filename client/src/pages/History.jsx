import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { errMsg, listCases } from '../api.js';
import { savedIds } from '../store.js';
import { ErrorBanner, LinkBtn, Loading } from '../ui.jsx';

export default function History() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const ids = savedIds();
    if (!ids.length) return setList([]);
    listCases(ids).then(setList).catch(e => { setError(errMsg(e)); setList([]); });
  }, []);

  if (!list) return <Loading text="Loading your cases..." />;
  return (
    <section>
      <h1 className="font-display text-3xl font-bold">My cases</h1>
      <ErrorBanner msg={error} />
      {!list.length && !error && (
        <div className="mt-6"><p className="mb-4 text-paper/70">You have not opened any cases on this device yet.</p><LinkBtn to="/create">Open a case</LinkBtn></div>
      )}
      <ul className="mt-6 grid gap-3">
        {list.map(c => (
          <li key={c.id}>
            <Link to={`/case/${c.id}`} className="flex items-center justify-between rounded border border-line bg-panel p-4 hover:border-tag">
              <span><span className="block font-semibold">{c.title}</span>
                <span className="text-sm text-paper/60">{c.difficulty} · {new Date(c.createdAt).toLocaleDateString()}</span></span>
              <span className="text-sm">{c.status === 'solved' ? `${c.score} pts` : 'In progress'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
