import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cards } from '../data/learningCards';
import { buildInitialState, sanitizeState } from '../lib/learningState';
import { buildStats } from '../lib/learningStats';
import { MarkSource } from '../lib/xp';
import { loadLearningState, saveLearningState } from '../storage/learningStorage';
import { Card } from '../types/card';
import { CardOutcome, LearningState, LearningStats, ReviewMeta } from '../types/progress';
import { buildNextState } from './learningReducer';

type LearningContextValue = {
  cards: Card[];
  isHydrated: boolean;
  progress: Record<string, CardOutcome>;
  reviewMeta: Record<string, ReviewMeta>;
  stats: LearningStats;
  markCardKnown: (cardId: string, source?: MarkSource) => Promise<void>;
  markCardForReview: (cardId: string, source?: MarkSource) => Promise<void>;
  restart: () => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
};

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

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
    source: MarkSource = 'swipe',
  ) => {
    const nextState = buildNextState(stateRef.current, cardId, outcome, source);
    await persistState(nextState);
  };

  const restart = async () => {
    await persistState(buildInitialState());
  };

  const setDailyGoal = async (goal: number) => {
    const nextGoal = Math.max(1, Math.round(goal));

    await persistState({
      ...stateRef.current,
      dailyGoal: nextGoal,
    });
  };

  const value: LearningContextValue = {
    cards,
    isHydrated,
    progress: state.progress,
    reviewMeta: state.reviewMeta,
    stats: buildStats(state),
    markCardKnown: async (cardId, source = 'swipe') =>
      markOutcome(cardId, 'known', source),
    markCardForReview: async (cardId, source = 'swipe') =>
      markOutcome(cardId, 'review', source),
    restart,
    setDailyGoal,
  };

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);

  if (!context) {
    throw new Error('useLearning must be used inside LearningProvider');
  }

  return context;
}
