import { CardOutcome } from '../types/progress';

export type MarkSource = 'swipe' | 'manual';

export function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 120) + 1);
}

export function getXpGain(outcome: CardOutcome, source: MarkSource) {
  if (source === 'manual') {
    return outcome === 'known' ? 18 : 6;
  }

  return outcome === 'known' ? 10 : 3;
}
