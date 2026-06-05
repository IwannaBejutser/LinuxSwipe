import { diffInDays, getLocalDateStamp } from '../lib/date';
import { getXpGain, MarkSource } from '../lib/xp';
import { CardOutcome, LearningState } from '../types/progress';

export function bumpStreak(
  currentStreak: number,
  lastActiveOn: null | string,
  today: string,
) {
  if (!lastActiveOn) {
    return 1;
  }

  const dayDiff = diffInDays(today, lastActiveOn);

  if (dayDiff <= 0) {
    return currentStreak === 0 ? 1 : currentStreak;
  }

  if (dayDiff === 1) {
    return currentStreak + 1;
  }

  return 1;
}

export function buildNextState(
  previousState: LearningState,
  cardId: string,
  outcome: CardOutcome,
  source: MarkSource,
): LearningState {
  const today = getLocalDateStamp();
  const nextReviewMeta = { ...previousState.reviewMeta };

  if (outcome === 'review') {
    const currentCount = nextReviewMeta[cardId]?.count ?? 0;
    nextReviewMeta[cardId] = {
      count: currentCount + 1,
      lastReviewedOn: today,
    };
  } else {
    delete nextReviewMeta[cardId];
  }

  return {
    progress: {
      ...previousState.progress,
      [cardId]: outcome,
    },
    reviewMeta: nextReviewMeta,
    xp: previousState.xp + getXpGain(outcome, source),
    streak: bumpStreak(previousState.streak, previousState.lastActiveOn, today),
    lastActiveOn: today,
    dailyGoal: previousState.dailyGoal,
    dailyProgress:
      previousState.dailyProgress.date === today
        ? {
            date: today,
            completed: previousState.dailyProgress.completed + 1,
          }
        : {
            date: today,
            completed: 1,
          },
    manualStats:
      source === 'manual'
        ? {
            attempts: previousState.manualStats.attempts + 1,
            correct: previousState.manualStats.correct + (outcome === 'known' ? 1 : 0),
          }
        : previousState.manualStats,
  };
}
