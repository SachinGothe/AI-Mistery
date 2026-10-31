export const LEVELS = {
  easy:   { suspects: 3, clues: 5, hints: 2, points: 100 },
  medium: { suspects: 4, clues: 7, hints: 3, points: 150 },
  hard:   { suspects: 5, clues: 9, hints: 3, points: 200 },
};
export const computeScore = ({ difficulty, correct, cluesFound, hintsUsed }) =>
  Math.max(0, (correct ? LEVELS[difficulty].points : 0) + 5 * cluesFound - 10 * hintsUsed);
