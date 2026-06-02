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
  isHydrated: boolean;
  progress: Record<string, CardOutcome>;
  stats: LearningStats;
  markCardKnown: (cardId: string) => Promise<void>;
  markCardForReview: (cardId: string) => Promise<void>;
  restart: () => Promise<void>;
};

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

const buildInitialState = (): LearningState => ({
  progress: {}
});

const sanitizeState = (state: Partial<LearningState> | null): LearningState => {
  const validIds = new Set(cards.map((card) => card.id));
  const progress = Object.fromEntries(
    Object.entries(state?.progress ?? {}).filter(([cardId]) => validIds.has(cardId))
  ) as Record<string, CardOutcome>;

  return {
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

      if (isMounted) {
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

  const markOutcome = async (cardId: string, outcome: CardOutcome) => {
    const nextState: LearningState = {
      progress: {
        ...state.progress,
        [cardId]: outcome
      }
    };

    await persistState(nextState);
  };

  const restart = async () => {
    await persistState(buildInitialState());
  };

  const value: LearningContextValue = {
    cards,
    isHydrated,
    progress: state.progress,
    stats: buildStats(state),
    markCardKnown: async (cardId) => markOutcome(cardId, "known"),
    markCardForReview: async (cardId) => markOutcome(cardId, "review"),
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
