import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cloneCase, errMsg } from '../api.js';
import { saveCaseId } from '../store.js';
import { ErrorBanner, Loading } from '../ui.jsx';

export default function Play() {
  const { id } = useParams();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    cloneCase(id).then(c => { saveCaseId(c.id); nav(`/case/${c.id}`, { replace: true }); }).catch(e => setError(errMsg(e)));
  }, [id, nav]);
  return error ? <ErrorBanner msg={error} /> : <Loading text="Setting up your copy of this mystery..." />;
}
