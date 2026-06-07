import { Card } from '../types/card';
import { CardOutcome, ReviewMeta } from '../types/progress';

export const ALL_CATEGORIES_LABEL = 'Все темы';

export const deckModeOptions = [
  { key: 'all', label: 'Вся колода' },
  { key: 'review', label: 'На повторе' },
] as const;

export type DeckMode = (typeof deckModeOptions)[number]['key'];

export const collectionOptions = [
  { key: 'all', label: 'Вся база', categories: null },
  {
    key: 'devops',
    label: 'DevOps',
    categories: ['Services', 'System Monitoring', 'Processes', 'Automation'],
  },
  {
    key: 'files',
    label: 'Файлы и права',
    categories: ['File Management', 'Permissions', 'Archives'],
  },
  {
    key: 'networking',
    label: 'Сеть',
    categories: ['Networking', 'Services'],
  },
  {
    key: 'shell',
    label: 'Shell-практика',
    categories: ['Search', 'Text Processing', 'Shell'],
  },
] as const;

export type CollectionFilter = (typeof collectionOptions)[number]['key'];

export const difficultyOptions = [
  { key: 'all', label: 'Все уровни' },
  { key: 'easy', label: 'Легко' },
  { key: 'medium', label: 'Средне' },
  { key: 'hard', label: 'Сложно' },
] as const;

export type DifficultyFilter = (typeof difficultyOptions)[number]['key'];

type BuildLearningDeckParams = {
  cards: Card[];
  deckMode: DeckMode;
  progress: Record<string, CardOutcome>;
  reviewMeta: Record<string, ReviewMeta>;
  selectedCollection: CollectionFilter;
  selectedCategory: string;
  selectedDifficulty: DifficultyFilter;
};

export function interleaveDeck(primaryCards: Card[], reviewCards: Card[], every = 3) {
  const deck: Card[] = [];
  let primaryIndex = 0;
  let reviewIndex = 0;

  while (primaryIndex < primaryCards.length || reviewIndex < reviewCards.length) {
    for (let count = 0; count < every && primaryIndex < primaryCards.length; count += 1) {
      deck.push(primaryCards[primaryIndex]);
      primaryIndex += 1;
    }

    if (reviewIndex < reviewCards.length) {
      deck.push(reviewCards[reviewIndex]);
      reviewIndex += 1;
    }

    if (primaryIndex >= primaryCards.length && reviewIndex < reviewCards.length) {
      deck.push(...reviewCards.slice(reviewIndex));
      break;
    }
  }

  return deck;
}

export function filterCards({
  cards,
  deckMode,
  progress,
  selectedCollection,
  selectedCategory,
  selectedDifficulty,
}: Omit<BuildLearningDeckParams, 'reviewMeta'>) {
  const collection = collectionOptions.find(
    (option) => option.key === selectedCollection,
  );

  return cards.filter((card) => {
    const collectionCategories = collection?.categories as readonly string[] | null;
    const collectionMatches =
      !collectionCategories || collectionCategories.includes(card.category);
    const categoryMatches =
      selectedCategory === ALL_CATEGORIES_LABEL || card.category === selectedCategory;
    const difficultyMatches =
      selectedDifficulty === 'all' || card.difficulty === selectedDifficulty;
    const deckModeMatches = deckMode === 'all' ? true : progress[card.id] === 'review';

    return collectionMatches && categoryMatches && difficultyMatches && deckModeMatches;
  });
}

export function sortReviewCards(
  reviewCards: Card[],
  allCards: Card[],
  reviewMeta: Record<string, ReviewMeta>,
) {
  return [...reviewCards].sort((left, right) => {
    const reviewDiff =
      (reviewMeta[right.id]?.count ?? 0) - (reviewMeta[left.id]?.count ?? 0);

    if (reviewDiff !== 0) {
      return reviewDiff;
    }

    return (
      allCards.findIndex((card) => card.id === left.id) -
      allCards.findIndex((card) => card.id === right.id)
    );
  });
}

export function buildLearningDeck(params: BuildLearningDeckParams) {
  const filteredCards = filterCards(params);
  const reviewCards = sortReviewCards(
    filteredCards.filter((card) => params.progress[card.id] === 'review'),
    params.cards,
    params.reviewMeta,
  );

  if (params.deckMode === 'review') {
    return {
      filteredCards,
      remainingCards: reviewCards,
    };
  }

  const newCards = filteredCards.filter((card) => !(card.id in params.progress));

  return {
    filteredCards,
    remainingCards: interleaveDeck(newCards, reviewCards, 3),
  };
}
