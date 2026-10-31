import { Link } from 'react-router-dom';
export const Btn = ({ className = '', ...p }) => (
  <button className={`rounded bg-tag px-5 py-2.5 font-semibold text-ink transition hover:brightness-110 disabled:opacity-50 ${className}`} {...p} />
);
export const LinkBtn = ({ to, children }) => (
  <Link to={to} className="inline-block rounded bg-tag px-5 py-2.5 font-semibold text-ink hover:brightness-110">{children}</Link>
);
export const ErrorBanner = ({ msg }) => msg && <p role="alert" className="mb-4 rounded border border-red bg-red/15 px-4 py-3 text-sm">{msg}</p>;
export const Loading = ({ text }) => <p className="py-10 text-center text-paper/70">{text}</p>;
import { useState } from 'react';
export function ShareBtn({ id }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    const url = `${location.origin}/play/${id}`;
    try { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 2000); }
    catch { window.prompt('Copy this link:', url); }
  };
  return <button onClick={copy} className="rounded border border-line px-4 py-2 hover:border-tag">{done ? 'Link copied' : 'Share this mystery'}</button>;
}
