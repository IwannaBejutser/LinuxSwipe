import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

import { cards } from "../constants/cards";
import {
  loadLearningState,
  saveLearningState
} from "../storage/learningStorage";
import { Card } from "../types/card";
import { CardOutcome, LearningState, LearningStats } from "../types/progress";

type LearningContextValue = {
  cards: Card[];
  currentCard: Card | null;
  currentIndex: number;
  isHydrated: boolean;
  stats: LearningStats;
  markKnown: () => Promise<void>;
  markForReview: () => Promise<void>;
  restart: () => Promise<void>;
};

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

const buildInitialState = (): LearningState => ({
  currentIndex: 0,
  progress: {}
});

const sanitizeState = (state: LearningState): LearningState => {
  const validIds = new Set(cards.map((card) => card.id));
  const progress = Object.fromEntries(
    Object.entries(state.progress).filter(([cardId]) => validIds.has(cardId))
  ) as Record<string, CardOutcome>;

  return {
    currentIndex: Math.min(Math.max(state.currentIndex, 0), cards.length),
    progress
  };
};

const buildStats = (state: LearningState): LearningStats => {
  const progressValues = Object.values(state.progress);
  const known = progressValues.filter((value) => value === "known").length;
  const review = progressValues.filter((value) => value === "review").length;
  const completed = progressValues.length;
  const total = cards.length;

  return {
    total,
    completed,
    known,
    review,
    remaining: Math.max(total - completed, 0),
    completion: total === 0 ? 0 : completed / total
  };
};

export function LearningProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LearningState>(buildInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const storedState = await loadLearningState();

      if (isMounted && storedState) {
        setState(sanitizeState(storedState));
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
    setState(nextState);
    await saveLearningState(nextState);
  };

  const markOutcome = async (outcome: CardOutcome) => {
    const card = cards[state.currentIndex];

    if (!card) {
      return;
    }

    const nextState: LearningState = {
      currentIndex: Math.min(state.currentIndex + 1, cards.length),
      progress: {
        ...state.progress,
        [card.id]: outcome
      }
    };

    await persistState(nextState);
  };

  const restart = async () => {
    await persistState(buildInitialState());
  };

  const value: LearningContextValue = {
    cards,
    currentCard: cards[state.currentIndex] ?? null,
    currentIndex: state.currentIndex,
    isHydrated,
    stats: buildStats(state),
    markKnown: async () => markOutcome("known"),
    markForReview: async () => markOutcome("review"),
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
