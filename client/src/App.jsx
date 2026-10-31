import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Create from './pages/Create.jsx';
import Investigation from './pages/Investigation.jsx';
import Accusation from './pages/Accusation.jsx';
import History from './pages/History.jsx';
import Play from './pages/Play.jsx';
import Results from './pages/Results.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-5 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold">AI Mystery Room</Link>
          <Link to="/history" className="text-sm text-paper/70 hover:text-tag">My cases</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/play/:id" element={<Play />} />
          <Route path="/create" element={<Create />} />
          <Route path="/case/:id" element={<Investigation />} />
          <Route path="/case/:id/accuse" element={<Accusation />} />
          <Route path="/case/:id/result" element={<Results />} />
        </Routes>
      </main>
    </div>
  );
}
