import test from 'node:test';
import assert from 'node:assert/strict';
import { computeScore, LEVELS } from '../services/scoring.js';

test('correct easy, 3 clues, 1 hint', () => assert.equal(computeScore({ difficulty: 'easy', correct: true, cluesFound: 3, hintsUsed: 1 }), 105));
test('correct hard, all clues', () => assert.equal(computeScore({ difficulty: 'hard', correct: true, cluesFound: 9, hintsUsed: 0 }), 245));
test('wrong accusation keeps only clue points', () => assert.equal(computeScore({ difficulty: 'medium', correct: false, cluesFound: 4, hintsUsed: 0 }), 20));
test('never below zero', () => assert.equal(computeScore({ difficulty: 'medium', correct: false, cluesFound: 0, hintsUsed: 3 }), 0));
test('difficulty table matches spec', () => {
  assert.deepEqual(LEVELS.easy, { suspects: 3, clues: 5, hints: 2, points: 100 });
  assert.deepEqual(LEVELS.hard, { suspects: 5, clues: 9, hints: 3, points: 200 });
});
