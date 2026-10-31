import { Link } from 'react-router-dom';
import { LinkBtn } from '../ui.jsx';
export default function Home() {
  return (
    <section className="py-12">
      <h1 className="font-display text-4xl leading-tight sm:text-6xl">Someone in this room is lying.</h1>
      <p className="mt-6 max-w-xl text-lg text-paper/80">
        Give us any setting. Gemini writes a fresh case with suspects, hidden clues and one culprit. Dig through the evidence, use hints sparingly, then name who did it.
      </p>
      <div className="mt-8 flex gap-3"><LinkBtn to="/create">Open a case</LinkBtn><Link to="/history" className="rounded border border-line px-5 py-2.5 hover:border-tag">My cases</Link></div>
    </section>
  );
}
