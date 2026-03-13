/**
 * Tests for useTrainer hook.
 *
 * Kept tests must earn their place: complex multi-condition logic or
 * guards against non-obvious silent failures.
 *
 * 1. Sentence filtering (getFilteredSentences) – complex multi-condition logic
 * 2. Session queue capping – boundary logic
 * 3. Session finish detection – terminal state guard
 * 4. handleCheck double-count prevention – subtle first-check-only guard
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Sentence } from '../types';
import { useTrainer } from './useTrainer';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeSentence(overrides: Partial<Sentence> & { id: number }): Sentence {
  return {
    label: `Zin ${overrides.id}`,
    predicateType: 'WG',
    level: 1,
    tokens: [
      { id: `${overrides.id}-t1`, text: 'De', role: 'ow' },
      { id: `${overrides.id}-t2`, text: 'kat', role: 'ow' },
      { id: `${overrides.id}-t3`, text: 'slaapt', role: 'pv' },
    ],
    ...overrides,
  };
}

const SENTENCES: Sentence[] = [
  makeSentence({ id: 1, predicateType: 'WG', level: 1 }),
  makeSentence({ id: 2, predicateType: 'WG', level: 1 }),

  // NG sentence
  {
    ...makeSentence({ id: 3, predicateType: 'NG', level: 1 }),
    tokens: [
      { id: '3-t1', text: 'De', role: 'ow' },
      { id: '3-t2', text: 'kat', role: 'ow' },
      { id: '3-t3', text: 'is', role: 'pv' },
      { id: '3-t4', text: 'ziek', role: 'nwd' },
    ],
  },

  // Sentence with LV (level 2)
  {
    ...makeSentence({ id: 4, predicateType: 'WG', level: 2 }),
    tokens: [
      { id: '4-t1', text: 'De', role: 'ow' },
      { id: '4-t2', text: 'kat', role: 'lv' },
      { id: '4-t3', text: 'slaapt', role: 'pv' },
    ],
  },

  // Sentence with MV (level 2)
  {
    ...makeSentence({ id: 5, predicateType: 'WG', level: 2 }),
    tokens: [
      { id: '5-t1', text: 'De', role: 'mv' },
      { id: '5-t2', text: 'kat', role: 'ow' },
      { id: '5-t3', text: 'slaapt', role: 'pv' },
    ],
  },

  // Sentence with bijst (level 2)
  {
    ...makeSentence({ id: 6, predicateType: 'WG', level: 2 }),
    tokens: [
      { id: '6-t1', text: 'De', role: 'bijst' },
      { id: '6-t2', text: 'kat', role: 'ow' },
      { id: '6-t3', text: 'slaapt', role: 'pv' },
    ],
  },

  // Sentence with VV (level 2)
  {
    ...makeSentence({ id: 7, predicateType: 'WG', level: 2 }),
    tokens: [
      { id: '7-t1', text: 'De', role: 'ow' },
      { id: '7-t2', text: 'kat', role: 'pv' },
      { id: '7-t3', text: 'geslapen', role: 'vv' },
    ],
  },

  // Compound sentence with bijzin (level 4)
  {
    ...makeSentence({ id: 8, predicateType: 'WG', level: 4 }),
    tokens: [
      { id: '8-t1', text: 'De', role: 'ow' },
      { id: '8-t2', text: 'kat', role: 'bijzin' },
      { id: '8-t3', text: 'slaapt', role: 'pv' },
    ],
  },
];

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('./useSentences', () => ({
  useSentences: (_level: unknown) => ({
    sentences: SENTENCES,
    isLoading: false,
    error: null,
    findSentenceById: async (id: number) => SENTENCES.find(s => s.id === id),
  }),
}));

vi.mock('../data/customSentenceStore', () => ({
  getCustomSentences: () => [],
}));

vi.mock('../usageData', () => ({
  recordAttempt: vi.fn(),
  recordShowAnswer: vi.fn(),
}));

vi.mock('../interactionLog', () => ({
  logInteraction: vi.fn(),
}));

function setup() {
  return renderHook(() => useTrainer());
}

// ─── getFilteredSentences (via availableSentences) ────────────────────────────
//
// This is the most complex logic in the hook: a 6-condition filter with
// interactions between level, predicateMode, focus flags, and bijst/bijzin
// inclusion. Each test targets a distinct code path.

describe('getFilteredSentences (via availableSentences)', () => {
  it('excludes compound (level 4) sentences by default', () => {
    const { result } = setup();
    const ids = result.current.availableSentences.map(s => s.id);
    expect(ids).not.toContain(8);
  });

  it('filters by predicateMode WG – excludes NG sentences', () => {
    const { result } = setup();
    act(() => result.current.setPredicateMode('WG'));
    const ids = result.current.availableSentences.map(s => s.id);
    expect(ids).not.toContain(3);
  });

  it('filters by predicateMode NG – includes only NG sentences', () => {
    const { result } = setup();
    act(() => result.current.setPredicateMode('NG'));
    const ids = result.current.availableSentences.map(s => s.id);
    expect(ids).toContain(3);
    expect(ids).not.toContain(1);
  });

  it('includes compound sentences when focusBijzin is true', () => {
    const { result } = setup();
    act(() => result.current.setFocusBijzin(true));
    expect(result.current.availableSentences.map(s => s.id)).toContain(8);
  });

  it('shows ONLY compound sentences when focusBijzin is the only active focus', () => {
    // focusBijzin without LV/MV/VV means: only level-4 sentences pass
    const { result } = setup();
    act(() => result.current.setFocusBijzin(true));
    const levels = new Set(result.current.availableSentences.map(s => s.level));
    expect(levels.has(4)).toBe(true);
    expect(levels.has(1)).toBe(false);
  });

  it('focuses on sentences with LV when focusLV is set', () => {
    const { result } = setup();
    act(() => result.current.setFocusLV(true));
    const ids = result.current.availableSentences.map(s => s.id);
    expect(ids).toContain(4);
    expect(ids).not.toContain(1);
  });

  it('focuses on sentences with MV when focusMV is set', () => {
    const { result } = setup();
    act(() => result.current.setFocusMV(true));
    const ids = result.current.availableSentences.map(s => s.id);
    expect(ids).toContain(5);
    expect(ids).not.toContain(1);
  });

  it('focuses on sentences with VV when focusVV is set', () => {
    const { result } = setup();
    act(() => result.current.setFocusVV(true));
    const ids = result.current.availableSentences.map(s => s.id);
    expect(ids).toContain(7);
    expect(ids).not.toContain(1);
  });

  it('filters to a specific level when selectedLevel is set', () => {
    const { result } = setup();
    act(() => result.current.setSelectedLevel(2));
    const levels = result.current.availableSentences.map(s => s.level);
    expect(levels.every(l => l === 2)).toBe(true);
  });

  it('excludes bijst sentences at a non-high level unless includeBijst is on', () => {
    const { result } = setup();
    act(() => result.current.setSelectedLevel(2));
    expect(result.current.availableSentences.map(s => s.id)).not.toContain(6);

    act(() => result.current.setIncludeBijst(true));
    expect(result.current.availableSentences.map(s => s.id)).toContain(6);
  });
});

// ─── startSession ─────────────────────────────────────────────────────────────

describe('startSession', () => {
  it('caps sessionQueue at the available pool size when count exceeds it', () => {
    // Math.min(Math.max(1, count), pool.length) — ensures no out-of-bounds queue
    const { result } = setup();
    act(() => { result.current.setCustomSessionCount(999); });
    act(() => { result.current.startSession(); });
    expect(result.current.sessionQueue.length).toBeLessThanOrEqual(
      result.current.availableSentences.length
    );
  });
});

// ─── nextSessionSentence ──────────────────────────────────────────────────────

describe('nextSessionSentence', () => {
  it('sets isSessionFinished when the last sentence in the queue is done', () => {
    // Guard: nextIndex >= sessionQueue.length → setIsSessionFinished(true)
    const { result } = setup();
    act(() => { result.current.setCustomSessionCount(1); });
    act(() => { result.current.startSession(); });
    act(() => { result.current.nextSessionSentence(); });
    expect(result.current.isSessionFinished).toBe(true);
  });
});

// ─── handleCheck double-count guard ──────────────────────────────────────────

describe('handleCheck', () => {
  it('only updates session stats on the first check per sentence', () => {
    // The guard `if (!validationResult)` in handleCheck ensures that calling
    // Controleer multiple times on the same sentence does not inflate the score.
    // A refactor removing that guard would cause double-counted stats.
    const { result } = setup();

    // Start a session and move to the label step
    act(() => { result.current.startSession(); });
    act(() => { result.current.handleNextStep(); });

    // First check: stats should be updated
    act(() => { result.current.handleCheck(); });
    const afterFirst = result.current.sessionStats.total;
    expect(afterFirst).toBeGreaterThan(0);

    // Second check on the same sentence: stats must NOT change
    act(() => { result.current.handleCheck(); });
    expect(result.current.sessionStats.total).toBe(afterFirst);
  });
});
