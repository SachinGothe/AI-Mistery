import { Router } from 'express';
import { z } from 'zod';
import Case from '../models/Case.js';
import { generateMystery, interrogate } from '../services/gemini.js';
import { LEVELS, computeScore } from '../services/scoring.js';
import { rateLimit } from '../middleware/rateLimit.js';

const r = Router();
const PER_SUSPECT = 3;
const fail = (status, message) => Object.assign(new Error(message), { status });
const wrap = fn => (req, res, next) => fn(req, res).catch(next);
const found = c => c.clues.filter(x => x.discovered).length;

const pub = c => ({
  id: c._id, title: c.title, story: c.story, difficulty: c.difficulty, status: c.status,
  suspects: c.suspects,
  clues: c.clues.map(x => ({ id: x.id, label: x.label, discovered: x.discovered, text: x.discovered ? x.text : null })),
  hintsUsed: c.hintsUsed, hintsMax: LEVELS[c.difficulty].hints,
  hintsRevealed: c.hints.slice(0, c.hintsUsed),
  interrogations: c.interrogations, questionsPerSuspect: PER_SUSPECT,
});

const result = c => ({
  title: c.title, difficulty: c.difficulty, correct: c.accusation.correct,
  accused: c.suspects.find(s => s.id === c.accusation.suspectId),
  culprit: c.suspects.find(s => s.id === c.solution.culpritId),
  explanation: c.solution.explanation, score: c.score,
  breakdown: { base: c.accusation.correct ? LEVELS[c.difficulty].points : 0, clues: found(c) * 5, hints: -10 * c.hintsUsed },
});

const load = async id => {
  const c = await Case.findById(id).catch(() => null);
  if (!c) throw fail(404, 'Case not found');
  return c;
};
const active = c => { if (c.status !== 'active') throw fail(409, 'Case is closed'); };

r.post('/', rateLimit(6), wrap(async (req, res) => {
  const p = z.object({ premise: z.string().trim().min(10).max(300), difficulty: z.enum(['easy', 'medium', 'hard']) }).safeParse(req.body);
  if (!p.success) throw fail(400, 'Premise must be 10-300 characters and difficulty must be easy, medium or hard.');
  const d = await generateMystery(p.data.premise, p.data.difficulty);
  res.status(201).json(pub(await Case.create({ ...d, premise: p.data.premise, difficulty: p.data.difficulty })));
}));

// History: GET /api/cases?ids=a,b,c  (ids are kept in the player's browser)
r.get('/', wrap(async (req, res) => {
  const ids = String(req.query.ids || '').split(',').filter(x => /^[a-f0-9]{24}$/.test(x)).slice(0, 50);
  const list = await Case.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
  res.json(list.map(c => ({ id: c._id, title: c.title, difficulty: c.difficulty, status: c.status, score: c.status === 'solved' ? c.score : null, createdAt: c.createdAt })));
}));

r.get('/:id', wrap(async (req, res) => res.json(pub(await load(req.params.id)))));

// Share: "play a copy" gives a friend a fresh run of the same mystery
r.post('/:id/clone', wrap(async (req, res) => {
  const o = (await load(req.params.id)).toObject();
  delete o._id; delete o.createdAt; delete o.updatedAt; delete o.__v;
  o.clues = o.clues.map(x => ({ ...x, discovered: false }));
  Object.assign(o, { hintsUsed: 0, interrogations: [], accusation: undefined, score: 0, status: 'active' });
  res.status(201).json(pub(await Case.create(o)));
}));

r.post('/:id/clues/:clueId/discover', wrap(async (req, res) => {
  const c = await load(req.params.id); active(c);
  const clue = c.clues.find(x => x.id === req.params.clueId);
  if (!clue) throw fail(404, 'Clue not found');
  clue.discovered = true;
  await c.save();
  res.json(pub(c));
}));

r.post('/:id/hints', wrap(async (req, res) => {
  const c = await load(req.params.id); active(c);
  if (c.hintsUsed >= LEVELS[c.difficulty].hints) throw fail(400, 'No hints left');
  c.hintsUsed += 1;
  await c.save();
  res.json({ hint: c.hints[c.hintsUsed - 1], hintsUsed: c.hintsUsed });
}));

r.post('/:id/interrogate', rateLimit(15), wrap(async (req, res) => {
  const p = z.object({ suspectId: z.string(), question: z.string().trim().min(3).max(200) }).safeParse(req.body);
  const c = await load(req.params.id); active(c);
  const suspect = p.success && c.suspects.find(s => s.id === p.data.suspectId);
  if (!suspect) throw fail(400, 'Choose a suspect and ask a question of 3-200 characters.');
  if (c.interrogations.filter(i => i.suspectId === suspect.id).length >= PER_SUSPECT) throw fail(400, `You have used all ${PER_SUSPECT} questions for ${suspect.name}.`);
  let answer;
  try { answer = await interrogate(c, suspect, p.data.question); }
  catch (e) { throw fail(502, `${suspect.name} is not answering right now. Try again.`); }
  c.interrogations.push({ suspectId: suspect.id, question: p.data.question, answer });
  await c.save();
  res.json(pub(c));
}));

r.post('/:id/accuse', wrap(async (req, res) => {
  const p = z.object({ suspectId: z.string() }).safeParse(req.body);
  const c = await load(req.params.id);
  if (!p.success || !c.suspects.some(s => s.id === p.data.suspectId)) throw fail(400, 'Choose a valid suspect');
  if (c.status !== 'active') throw fail(409, 'Case already solved');
  const correct = p.data.suspectId === c.solution.culpritId;
  c.accusation = { suspectId: p.data.suspectId, correct };
  c.score = computeScore({ difficulty: c.difficulty, correct, cluesFound: found(c), hintsUsed: c.hintsUsed });
  c.status = 'solved';
  await c.save();
  res.json(result(c));
}));

r.get('/:id/result', wrap(async (req, res) => {
  const c = await load(req.params.id);
  if (c.status !== 'solved') throw fail(409, 'Case not solved yet');
  res.json(result(c));
}));

export default r;
