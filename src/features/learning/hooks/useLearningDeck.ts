import { useMemo, useState } from 'react';

import {
  ALL_CATEGORIES_LABEL,
  buildLearningDeck,
  DeckMode,
  DifficultyFilter,
  difficultyOptions,
} from '../lib/deckBuilder';
import { Card } from '../types/card';
import { CardOutcome, ReviewMeta } from '../types/progress';

type UseLearningDeckParams = {
  cards: Card[];
  progress: Record<string, CardOutcome>;
  reviewMeta: Record<string, ReviewMeta>;
};

export function useLearningDeck({ cards, progress, reviewMeta }: UseLearningDeckParams) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_LABEL);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');
  const [deckMode, setDeckMode] = useState<DeckMode>('all');

  const categories = useMemo(
    () => [ALL_CATEGORIES_LABEL, ...new Set(cards.map((card) => card.category))],
    [cards],
  );

  const { filteredCards, remainingCards } = useMemo(
    () =>
      buildLearningDeck({
        cards,
        deckMode,
        progress,
        reviewMeta,
        selectedCategory,
        selectedDifficulty,
      }),
    [cards, deckMode, progress, reviewMeta, selectedCategory, selectedDifficulty],
  );

  const completedInFeed =
    deckMode === 'review'
      ? filteredCards.length - remainingCards.length
      : filteredCards.filter((card) => progress[card.id] === 'known').length;
  const progressRatio =
    filteredCards.length === 0 ? 0 : completedInFeed / Math.max(filteredCards.length, 1);
  const activeFiltersCount =
    (selectedCategory === ALL_CATEGORIES_LABEL ? 0 : 1) +
    (selectedDifficulty === 'all' ? 0 : 1);
  const sessionIndex = Math.min(completedInFeed + 1, Math.max(filteredCards.length, 1));
  const deckLabel = deckMode === 'review' ? 'Очередь повторения' : 'Основная колода';

  const clearFilters = () => {
    setSelectedCategory(ALL_CATEGORIES_LABEL);
    setSelectedDifficulty('all');
    setDeckMode('all');
  };

  return {
    activeFiltersCount,
    categories,
    clearFilters,
    completedInFeed,
    currentCard: remainingCards[0] ?? null,
    deckLabel,
    deckMode,
    filteredCards,
    progressRatio,
    remainingCards,
    selectedCategory,
    selectedDifficulty,
    sessionIndex,
    setDeckMode,
    setSelectedCategory,
    setSelectedDifficulty,
    difficultyOptions,
    nextCard: remainingCards[1] ?? null,
  };
}
