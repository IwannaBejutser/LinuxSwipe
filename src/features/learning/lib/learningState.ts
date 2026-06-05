import { cards } from '../data/learningCards';
import {
  CardOutcome,
  DailyProgress,
  LearningState,
  ManualStats,
  ReviewMeta,
} from '../types/progress';
import { getLocalDateStamp } from './date';

export const DAILY_GOAL = 10;

export function buildInitialDailyProgress(date = getLocalDateStamp()): DailyProgress {
  return {
    date,
    completed: 0,
  };
}

export function buildInitialManualStats(): ManualStats {
  return {
    attempts: 0,
    correct: 0,
  };
}

export const buildInitialState = (): LearningState => ({
  progress: {},
  reviewMeta: {},
  xp: 0,
  streak: 0,
  lastActiveOn: null,
  dailyGoal: DAILY_GOAL,
  dailyProgress: buildInitialDailyProgress(),
  manualStats: buildInitialManualStats(),
});

export const sanitizeState = (state: Partial<LearningState> | null): LearningState => {
  const today = getLocalDateStamp();
  const validIds = new Set(cards.map((card) => card.id));
  const progress = Object.fromEntries(
    Object.entries(state?.progress ?? {}).filter(([cardId]) => validIds.has(cardId)),
  ) as Record<string, CardOutcome>;

  const reviewMeta = Object.fromEntries(
    Object.entries(state?.reviewMeta ?? {}).filter(
      ([cardId, meta]) =>
        validIds.has(cardId) &&
        typeof meta?.count === 'number' &&
        typeof meta?.lastReviewedOn === 'string',
    ),
  ) as Record<string, ReviewMeta>;

  const dailyGoal =
    typeof state?.dailyGoal === 'number' && state.dailyGoal > 0
      ? state.dailyGoal
      : DAILY_GOAL;
  const dailyProgress =
    state?.dailyProgress && typeof state.dailyProgress.date === 'string'
      ? state.dailyProgress.date === today
        ? {
            date: state.dailyProgress.date,
            completed: Math.max(0, state.dailyProgress.completed ?? 0),
          }
        : buildInitialDailyProgress(today)
      : buildInitialDailyProgress(today);

  const manualStats =
    state?.manualStats &&
    typeof state.manualStats.attempts === 'number' &&
    typeof state.manualStats.correct === 'number'
      ? {
          attempts: Math.max(0, state.manualStats.attempts),
          correct: Math.max(0, state.manualStats.correct),
        }
      : buildInitialManualStats();

  return {
    progress,
    reviewMeta,
    xp: Math.max(0, state?.xp ?? 0),
    streak: Math.max(0, state?.streak ?? 0),
    lastActiveOn: typeof state?.lastActiveOn === 'string' ? state.lastActiveOn : null,
    dailyGoal,
    dailyProgress,
    manualStats,
  };
};
