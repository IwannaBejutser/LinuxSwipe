import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  LearningCardSource,
  loadInitialLearningCards,
  syncLearningCards,
} from '../data/cardRepository';
import { cards as localCards } from '../data/learningCards';
import { buildInitialState, sanitizeState } from '../lib/learningState';
import { buildStats } from '../lib/learningStats';
import { MarkSource } from '../lib/xp';
import { loadLearningState, saveLearningState } from '../storage/learningStorage';
import { Card } from '../types/card';
import { CardOutcome, LearningState, LearningStats, ReviewMeta } from '../types/progress';
import { buildNextState } from './learningReducer';

type LearningContextValue = {
  cards: Card[];
  cardSource: LearningCardSource;
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
  const [cards, setCards] = useState<Card[]>(localCards);
  const [cardSource, setCardSource] = useState<LearningCardSource>('local');
  const cardVersionRef = useRef<string | undefined>(undefined);
  const [isHydrated, setIsHydrated] = useState(false);
  const stateRef = useRef<LearningState>(buildInitialState());
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const [storedState, loadedCards] = await Promise.all([
        loadLearningState(),
        loadInitialLearningCards(),
      ]);
      const nextState = sanitizeState(storedState);

      if (isMounted) {
        cardVersionRef.current = loadedCards.version;
        setCards(loadedCards.cards);
        setCardSource(loadedCards.source);
        stateRef.current = nextState;
        setState(nextState);
        setIsHydrated(true);
      }

      const syncedCards = await syncLearningCards(loadedCards.version);

      if (isMounted && syncedCards) {
        cardVersionRef.current = syncedCards.version;
        setCards(syncedCards.cards);
        setCardSource(syncedCards.source);
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistState = useCallback(async (nextState: LearningState) => {
    stateRef.current = nextState;
    setState(nextState);
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(() => saveLearningState(nextState));

    await saveQueueRef.current;
  }, []);

  const markOutcome = useCallback(
    async (cardId: string, outcome: CardOutcome, source: MarkSource = 'swipe') => {
      const nextState = buildNextState(stateRef.current, cardId, outcome, source);
      await persistState(nextState);
    },
    [persistState],
  );

  const markCardKnown = useCallback(
    async (cardId: string, source: MarkSource = 'swipe') =>
      markOutcome(cardId, 'known', source),
    [markOutcome],
  );

  const markCardForReview = useCallback(
    async (cardId: string, source: MarkSource = 'swipe') =>
      markOutcome(cardId, 'review', source),
    [markOutcome],
  );

  const restart = useCallback(async () => {
    await persistState(buildInitialState());
  }, [persistState]);

  const setDailyGoal = useCallback(
    async (goal: number) => {
      const nextGoal = Math.max(1, Math.round(goal));

      await persistState({
        ...stateRef.current,
        dailyGoal: nextGoal,
      });
    },
    [persistState],
  );

  const stats = useMemo(() => buildStats(state), [state]);

  const value: LearningContextValue = useMemo(
    () => ({
      cards,
      cardSource,
      isHydrated,
      progress: state.progress,
      reviewMeta: state.reviewMeta,
      stats,
      markCardKnown,
      markCardForReview,
      restart,
      setDailyGoal,
    }),
    [
      cards,
      cardSource,
      isHydrated,
      markCardForReview,
      markCardKnown,
      restart,
      setDailyGoal,
      state.progress,
      state.reviewMeta,
      stats,
    ],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);

  if (!context) {
    throw new Error('useLearning must be used inside LearningProvider');
  }

  return context;
}
