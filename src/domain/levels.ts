import type { LevelConfig } from './types';

// The level table. Tuning the game's difficulty means changing these numbers only.
const START_ALLOWANCE_SECONDS = 60;
const ALLOWANCE_STEP_SECONDS = 5;
const MIN_ALLOWANCE_SECONDS = 15;
const EARLY_TARGETS = [30, 70, 120, 180];
const LATE_TARGET_STEP = 75;
const HARD_LETTER_STEP = 0.25;
const MAX_HARD_LETTER_MULTIPLIER = 4;

function targetScore(level: number): number {
  const lastEarly = EARLY_TARGETS.length;
  return level <= lastEarly
    ? EARLY_TARGETS[level - 1]!
    : EARLY_TARGETS[lastEarly - 1]! + LATE_TARGET_STEP * (level - lastEarly);
}

export function levelConfig(level: number): LevelConfig {
  const steps = level - 1;
  const allowanceSeconds = Math.max(
    MIN_ALLOWANCE_SECONDS,
    START_ALLOWANCE_SECONDS - ALLOWANCE_STEP_SECONDS * steps,
  );
  return {
    level,
    allowanceMs: allowanceSeconds * 1000,
    targetScore: targetScore(level),
    hardLetterMultiplier: Math.min(MAX_HARD_LETTER_MULTIPLIER, 1 + HARD_LETTER_STEP * steps),
  };
}

/** Lowest level whose target is greater than `score`. */
export function levelForScore(score: number): number {
  let level = 1;
  while (targetScore(level) <= score) level++;
  return level;
}
