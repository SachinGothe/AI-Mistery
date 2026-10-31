# SPEC.md — AI Mystery Room

## 1. Overview
AI-powered web app: the player enters a premise + difficulty, Gemini generates a mystery (story, suspects, clues, hints, hidden solution). The player discovers clues, requests hints, accuses a suspect, and gets a verdict and score.
**Problem:** mystery games are static; this one generates a fresh, solvable case on any premise.
**Users:** casual players who like puzzles; desktop and mobile.
**Stack:** React, Vite, Tailwind CSS, React Router, Axios | Node.js, Express, MongoDB/Mongoose, Zod | Gemini API (`@google/genai`).
**Core:** generate case, investigate, clues, hints, accuse, score, replay. **Optional:** share link, case history.
**Limits:** no auth; single-player; one case per ID; Gemini rate limits apply.
**Deliverables:** GitHub repo, live URL, this SPEC.md.

## 2. User Flow
1. Open site (Home) -> 2. Enter premise + difficulty -> 3. Gemini generates case -> 4. Investigate, discover clues -> 5. Request hints (optional) -> 6. Accuse a suspect -> 7. See verdict, culprit, explanation, score -> 8. Start another.

## 3. Pages
| Page | Route | Purpose / elements |
|---|---|---|
| Home | `/` | Intro, "Open a case" button |
| Create | `/create` | Premise textarea (10-300 chars), difficulty selector, submit; loading state "Gemini is writing your case..." |
| Investigation | `/case/:id` | Story, suspect cards, clue list (tap to discover), hint button + hints used, progress (clues x/y, hints x/y), "Make accusation" |
| Accusation | `/case/:id/accuse` | Suspect radio cards, confirm button |
| Results | `/case/:id/result` | Verdict, score breakdown, culprit, explanation, "New case" |

Errors: inline red banner with what failed and a retry. Navigation: top bar with logo -> Home. Responsive: single column on mobile, 2-3 column grids from `md`.

## 4. Backend & DB
**Case model:** `title, premise, story, difficulty, suspects[{id,name,role,description,alibi}], clues[{id,label,text,discovered}], hints[string], hintsUsed, solution{culpritId,explanation} (private), accusation{suspectId,correct}, score, status(active|solved)`.

**Endpoints**
- `POST /api/cases` body `{premise, difficulty}` -> 201 public case
- `GET /api/cases/:id` -> public case
- `POST /api/cases/:id/clues/:clueId/discover` -> public case
- `POST /api/cases/:id/hints` -> `{hint, hintsUsed}` (400 if none left)
- `POST /api/cases/:id/accuse` body `{suspectId}` -> result
- `GET /api/cases/:id/result` -> result (409 until accused)

**Validation:** Zod on all bodies; 400 invalid input, 404 unknown id, 409 wrong state, 502 on AI failure.
**Security:** `solution` and undiscovered clue `text` never leave the server until accusation / discovery.

## 5. AI & Scoring
Gemini returns JSON only: `{title, story, suspects[], clues[], hints[], solution}`. Validated with Zod (counts, unique IDs, culprit exists); retry up to 3x, else 502; nothing invalid is saved. The solution must be logically supported by the clues.

| Difficulty | Suspects | Clues | Hints | Correct pts |
|---|---|---|---|---|
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

**Score** = (correct ? base : 0) + 5 x clues discovered - 10 x hints used; minimum 0. Computed on the backend only. One accusation per case.

## 6. Acceptance Criteria
- [ ] Cases generate at all 3 difficulties
- [ ] Clues, hints, accusation work
- [ ] Solution not exposed before accusation
- [ ] Score calculated by backend
- [ ] Result shows culprit + explanation
- [ ] Invalid AI output / API failure handled gracefully
- [ ] Works on the deployed site

## 7. Advanced Features
- **Self-check:** after generation, a second Gemini call solves the case from public data only; mismatch = reject and regenerate (set `SELF_CHECK=off` to disable).
- **History:** ids stored in the browser; `GET /api/cases?ids=` returns summaries; page `/history`.
- **Share:** `POST /api/cases/:id/clone` creates a fresh run; share link `/play/:id`.
- **Interrogation:** `POST /api/cases/:id/interrogate {suspectId, question}`; 3 questions per suspect; the culprit lies but never confesses; no score impact.
- **Clue board and notes:** client-side links from clues to suspects, plus free-text notes (localStorage).
- **Reliability:** per-IP rate limits (120/min API, 6/min generation, 15/min interrogation), request logging, `npm test` covers scoring rules.
