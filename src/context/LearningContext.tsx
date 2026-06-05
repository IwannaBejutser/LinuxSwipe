import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

import { cards } from "../constants/cards";
import { loadLearningState, saveLearningState } from "../storage/learningStorage";
import { Card } from "../types/card";
import {
  CardOutcome,
  DailyProgress,
  LearningState,
  LearningStats,
  ManualStats,
  ReviewMeta
} from "../types/progress";

type MarkSource = "swipe" | "manual";

type LearningContextValue = {
  cards: Card[];
  isHydrated: boolean;
  progress: Record<string, CardOutcome>;
  reviewMeta: Record<string, ReviewMeta>;
  stats: LearningStats;
  markCardKnown: (cardId: string, source?: MarkSource) => Promise<void>;
  markCardForReview: (cardId: string, source?: MarkSource) => Promise<void>;
  restart: () => Promise<void>;
};

const DAILY_GOAL = 10;

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

function getLocalDateStamp(reference = new Date()) {
  const year = reference.getFullYear();
  const month = `${reference.getMonth() + 1}`.padStart(2, "0");
  const day = `${reference.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildInitialDailyProgress(date = getLocalDateStamp()): DailyProgress {
  return {
    date,
    completed: 0
  };
}

function buildInitialManualStats(): ManualStats {
  return {
    attempts: 0,
    correct: 0
  };
}

const buildInitialState = (): LearningState => ({
  progress: {},
  reviewMeta: {},
  xp: 0,
  streak: 0,
  lastActiveOn: null,
  dailyGoal: DAILY_GOAL,
  dailyProgress: buildInitialDailyProgress(),
  manualStats: buildInitialManualStats()
});

function parseDateStamp(dateStamp: string) {
  const [year, month, day] = dateStamp.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function diffInDays(current: string, previous: string) {
  const currentDate = parseDateStamp(current);
  const previousDate = parseDateStamp(previous);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round((currentDate.getTime() - previousDate.getTime()) / millisecondsPerDay);
}

function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 120) + 1);
}

const sanitizeState = (state: Partial<LearningState> | null): LearningState => {
  const today = getLocalDateStamp();
  const validIds = new Set(cards.map((card) => card.id));
  const progress = Object.fromEntries(
    Object.entries(state?.progress ?? {}).filter(([cardId]) => validIds.has(cardId))
  ) as Record<string, CardOutcome>;

  const reviewMeta = Object.fromEntries(
    Object.entries(state?.reviewMeta ?? {}).filter(
      ([cardId, meta]) =>
        validIds.has(cardId) &&
        typeof meta?.count === "number" &&
        typeof meta?.lastReviewedOn === "string"
    )
  ) as Record<string, ReviewMeta>;

  const dailyGoal =
    typeof state?.dailyGoal === "number" && state.dailyGoal > 0 ? state.dailyGoal : DAILY_GOAL;
  const dailyProgress =
    state?.dailyProgress && typeof state.dailyProgress.date === "string"
      ? state.dailyProgress.date === today
        ? {
            date: state.dailyProgress.date,
            completed: Math.max(0, state.dailyProgress.completed ?? 0)
          }
        : buildInitialDailyProgress(today)
      : buildInitialDailyProgress(today);

  const manualStats =
    state?.manualStats &&
    typeof state.manualStats.attempts === "number" &&
    typeof state.manualStats.correct === "number"
      ? {
          attempts: Math.max(0, state.manualStats.attempts),
          correct: Math.max(0, state.manualStats.correct)
        }
      : buildInitialManualStats();

  return {
    progress,
    reviewMeta,
    xp: Math.max(0, state?.xp ?? 0),
    streak: Math.max(0, state?.streak ?? 0),
    lastActiveOn: typeof state?.lastActiveOn === "string" ? state.lastActiveOn : null,
    dailyGoal,
    dailyProgress,
    manualStats
  };
};

const buildStats = (state: LearningState): LearningStats => {
  const progressValues = Object.values(state.progress);
  const known = progressValues.filter((value) => value === "known").length;
  const review = progressValues.filter((value) => value === "review").length;
  const completed = progressValues.length;
  const total = cards.length;
  const todayCompleted =
    state.dailyProgress.date === getLocalDateStamp() ? state.dailyProgress.completed : 0;
  const manualAttempts = state.manualStats.attempts;
  const manualCorrect = state.manualStats.correct;

  return {
    total,
    completed,
    known,
    review,
    remaining: Math.max(total - completed, 0),
    completion: total === 0 ? 0 : completed / total,
    reviewQueueCount: review,
    xp: state.xp,
    level: levelFromXp(state.xp),
    streak: state.streak,
    dailyGoal: state.dailyGoal,
    todayCompleted,
    dailyGoalProgress: state.dailyGoal === 0 ? 0 : Math.min(todayCompleted / state.dailyGoal, 1),
    dailyGoalDone: todayCompleted >= state.dailyGoal,
    manualAttempts,
    manualCorrect,
    manualAccuracy: manualAttempts === 0 ? 0 : manualCorrect / manualAttempts
  };
};

function getXpGain(outcome: CardOutcome, source: MarkSource) {
  if (source === "manual") {
    return outcome === "known" ? 18 : 6;
  }

  return outcome === "known" ? 10 : 3;
}

function bumpStreak(currentStreak: number, lastActiveOn: null | string, today: string) {
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

function buildNextState(
  previousState: LearningState,
  cardId: string,
  outcome: CardOutcome,
  source: MarkSource
): LearningState {
  const today = getLocalDateStamp();
  const nextReviewMeta = { ...previousState.reviewMeta };

  if (outcome === "review") {
    const currentCount = nextReviewMeta[cardId]?.count ?? 0;
    nextReviewMeta[cardId] = {
      count: currentCount + 1,
      lastReviewedOn: today
    };
  } else {
    delete nextReviewMeta[cardId];
  }

  return {
    progress: {
      ...previousState.progress,
      [cardId]: outcome
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
            completed: previousState.dailyProgress.completed + 1
          }
        : {
            date: today,
            completed: 1
          },
    manualStats:
      source === "manual"
        ? {
            attempts: previousState.manualStats.attempts + 1,
            correct:
              previousState.manualStats.correct + (outcome === "known" ? 1 : 0)
          }
        : previousState.manualStats
  };
}

export function LearningProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LearningState>(buildInitialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const stateRef = useRef<LearningState>(buildInitialState());
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const storedState = await loadLearningState();
      const nextState = sanitizeState(storedState);

      if (isMounted) {
        stateRef.current = nextState;
        setState(nextState);
      }

      if (isMounted) {
        setIsHydrated(true);
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistState = async (nextState: LearningState) => {
    stateRef.current = nextState;
    setState(nextState);
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(() => saveLearningState(nextState));

    await saveQueueRef.current;
  };

  const markOutcome = async (
    cardId: string,
    outcome: CardOutcome,
    source: MarkSource = "swipe"
  ) => {
    const nextState = buildNextState(stateRef.current, cardId, outcome, source);
    await persistState(nextState);
  };

  const restart = async () => {
    await persistState(buildInitialState());
  };

  const value: LearningContextValue = {
    cards,
    isHydrated,
    progress: state.progress,
    reviewMeta: state.reviewMeta,
    stats: buildStats(state),
    markCardKnown: async (cardId, source = "swipe") => markOutcome(cardId, "known", source),
    markCardForReview: async (cardId, source = "swipe") => markOutcome(cardId, "review", source),
    restart
  };

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);

  if (!context) {
    throw new Error("useLearning must be used inside LearningProvider");
  }

  return context;
}
