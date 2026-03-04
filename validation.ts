import { ROLES, FEEDBACK_MATRIX, FEEDBACK_STRUCTURE } from './constants';
import { Sentence, PlacementMap, RoleKey, Token, ValidationState } from './types';

export interface ChunkData {
  tokens: Token[];
  originalIndices: number[];
}

export interface ValidationResult {
  score: number;
  total: number;
  chunkStatus: Record<number, ValidationState>;
  chunkFeedback: Record<number, string>;
  isPerfect: boolean;
}

/**
 * Build user chunks from tokens and split indices.
 * A split index marks the end of a chunk (inclusive).
 */
export function buildUserChunks(tokens: Token[], splitIndices: Set<number>): ChunkData[] {
  const chunks: ChunkData[] = [];
  let currentChunkTokens: Token[] = [];
  let currentChunkIndices: number[] = [];

  tokens.forEach((token, index) => {
    currentChunkTokens.push(token);
    currentChunkIndices.push(index);

    if (splitIndices.has(index) || index === tokens.length - 1) {
      chunks.push({
        tokens: currentChunkTokens,
        originalIndices: currentChunkIndices
      });
      currentChunkTokens = [];
      currentChunkIndices = [];
    }
  });
  return chunks;
}

/**
 * Count the real number of chunks in a sentence based on token roles and newChunk flags.
 */
export function countRealChunks(tokens: Token[]): number {
  let count = 0;
  tokens.forEach((t, i) => {
    if (i === 0 || t.role !== tokens[i - 1].role || t.newChunk) count++;
  });
  return count;
}

/**
 * Compute the correct split indices for a sentence.
 * A split index marks the end of a chunk (inclusive, between two different chunks).
 */
export function computeCorrectSplits(tokens: Token[]): Set<number> {
  const correctSplits = new Set<number>();
  tokens.forEach((t, i) => {
    const next = tokens[i + 1];
    if (next && (t.role !== next.role || next.newChunk)) correctSplits.add(i);
  });
  return correctSplits;
}

/**
 * Check whether a user-assigned role matches a token's role,
 * considering the primary role and any acceptable alternativeRole.
 */
export function roleMatchesToken(userLabel: RoleKey, token: Token): boolean {
  return userLabel === token.role || (token.alternativeRole !== undefined && userLabel === token.alternativeRole);
}

/**
 * Check whether all tokens in a chunk agree on the same effective role
 * (primary or alternative). Returns the agreed-upon role, or null if inconsistent.
 */
export function getConsistentRole(tokens: Token[]): RoleKey | null {
  if (tokens.length === 0) return null;
  const firstRole = tokens[0].role;

  // Check primary role consistency
  if (tokens.every(t => t.role === firstRole)) return firstRole;

  // Check if all tokens share a common alternativeRole
  const firstAlt = tokens[0].alternativeRole;
  if (firstAlt && tokens.every(t => t.alternativeRole === firstAlt)) return firstAlt;

  // Check if there's a mix but all tokens allow the first token's primary role
  if (tokens.every(t => t.role === firstRole || t.alternativeRole === firstRole)) return firstRole;

  // Check if all tokens allow the first token's alternativeRole
  if (firstAlt && tokens.every(t => t.role === firstAlt || t.alternativeRole === firstAlt)) return firstAlt;

  return null;
}

/**
 * Main validation function: checks user's splits and labels against the sentence data.
 */
export function validateAnswer(
  sentence: Sentence,
  splitIndices: Set<number>,
  chunkLabels: PlacementMap,
  subLabels: PlacementMap,
  includeBB: boolean
): { result: ValidationResult; mistakes: Record<string, number> } {
  const userChunks = buildUserChunks(sentence.tokens, splitIndices);
  const chunkStatus: Record<number, ValidationState> = {};
  const chunkFeedback: Record<number, string> = {};
  let correctChunksCount = 0;
  const currentMistakes: Record<string, number> = {};

  userChunks.forEach((chunk, idx) => {
    const chunkTokens = chunk.tokens;
    const firstTokenId = chunkTokens[0].id;
    const firstTokenRole = chunkTokens[0].role;
    const missedInternalSplit = chunkTokens.slice(1).some(t => t.newChunk);

    // Check role consistency considering alternative roles
    const consistentRole = getConsistentRole(chunkTokens);
    const isConsistentRole = consistentRole !== null;

    const lastTokenId = chunkTokens[chunkTokens.length - 1].id;
    const lastTokenIndex = sentence.tokens.findIndex(t => t.id === lastTokenId);
    const nextToken = sentence.tokens[lastTokenIndex + 1];

    // Split too early: next token shares a role with this chunk (primary or alt) and no newChunk
    const splitTooEarly = nextToken && !nextToken.newChunk &&
      consistentRole !== null && roleMatchesToken(consistentRole, nextToken);

    const firstTokenIndexInSent = sentence.tokens.findIndex(t => t.id === firstTokenId);
    const prevToken = sentence.tokens[firstTokenIndexInSent - 1];

    // Started too late: previous token shares a role with this chunk and no newChunk on first token
    const startedTooLate = prevToken && !chunkTokens[0].newChunk &&
      consistentRole !== null && roleMatchesToken(consistentRole, prevToken);

    const isValidSplit = isConsistentRole && !splitTooEarly && !startedTooLate && !missedInternalSplit;

    if (!isValidSplit) {
      chunkStatus[idx] = 'incorrect-split';
      if (!isConsistentRole || missedInternalSplit) chunkFeedback[idx] = FEEDBACK_STRUCTURE.INCONSISTENT;
      else if (splitTooEarly || startedTooLate) chunkFeedback[idx] = FEEDBACK_STRUCTURE.TOO_MANY_SPLITS;
      else chunkFeedback[idx] = "De verdeling klopt niet.";
      currentMistakes['Verdeling'] = (currentMistakes['Verdeling'] || 0) + 1;
    } else {
      const userLabel = chunkLabels[firstTokenId];
      // Safe: isValidSplit is true only when isConsistentRole is true, which means consistentRole !== null
      const effectiveRole = consistentRole!;

      if (userLabel === effectiveRole) {
        chunkStatus[idx] = 'correct';
        correctChunksCount++;
      } else if (userLabel && chunkTokens.every(t => roleMatchesToken(userLabel, t))) {
        // User chose an alternative role that all tokens accept
        chunkStatus[idx] = 'correct';
        correctChunksCount++;
      } else {
        const correctRoleName = ROLES.find(r => r.key === firstTokenRole)?.label || firstTokenRole;
        if (firstTokenRole === 'pv' && userLabel === 'wg') {
          chunkStatus[idx] = 'warning';
          chunkFeedback[idx] = FEEDBACK_MATRIX['wg'] && FEEDBACK_MATRIX['wg']['pv'] ? FEEDBACK_MATRIX['wg']['pv'] : "Dit hoort bij het gezegde.";
          currentMistakes[correctRoleName] = (currentMistakes[correctRoleName] || 0) + 1;
        } else {
          chunkStatus[idx] = 'incorrect-role';
          if (userLabel && FEEDBACK_MATRIX[userLabel] && FEEDBACK_MATRIX[userLabel][firstTokenRole]) {
            chunkFeedback[idx] = FEEDBACK_MATRIX[userLabel][firstTokenRole];
          } else {
            const userRoleName = ROLES.find(r => r.key === userLabel)?.label || "Gekozen";
            chunkFeedback[idx] = `Dit is niet ${userRoleName}, maar het ${correctRoleName}.`;
          }
          currentMistakes[correctRoleName] = (currentMistakes[correctRoleName] || 0) + 1;
        }
      }
    }
  });

  let subRoleMismatch = false;
  sentence.tokens.forEach(t => {
    const userSub = subLabels[t.id];
    let expectedSub = t.subRole;
    if (!includeBB && expectedSub === 'bijv_bep') expectedSub = undefined;
    if (userSub !== expectedSub) subRoleMismatch = true;
  });

  const isSplitPerfect = correctChunksCount === userChunks.length;
  const realChunkCount = countRealChunks(sentence.tokens);
  const isPerfect = isSplitPerfect && userChunks.length === realChunkCount && !subRoleMismatch;

  return {
    result: {
      score: correctChunksCount,
      total: userChunks.length,
      chunkStatus,
      chunkFeedback,
      isPerfect
    },
    mistakes: currentMistakes
  };
}
