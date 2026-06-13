import { getCategoryLabel } from './category';
export { getDifficultyLabel } from './difficulty';
import { Card } from '../types/card';

export type CommandReference = {
  answers: string[];
  cards: Card[];
  categories: string[];
  command: string;
  difficulties: Card['difficulty'][];
  searchIndex: string;
  summary: string;
};

export type SortMode = 'alphabet' | 'practice';

type FilterCommandReferencesParams = {
  commandReferences: CommandReference[];
  normalizedQuery: string;
  selectedCategory: string;
  sortMode: SortMode;
};

const difficultyOrder: Record<Card['difficulty'], number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export function buildCommandCategories(cards: Card[]) {
  return Array.from(new Set(cards.map((card) => card.category))).sort((left, right) =>
    getCategoryLabel(left).localeCompare(getCategoryLabel(right)),
  );
}

export function buildCommandReferences(cards: Card[]) {
  const commandMap = new Map<string, CommandReference>();

  cards.forEach((card) => {
    const currentReference = commandMap.get(card.command) ?? {
      answers: [],
      cards: [],
      categories: [],
      command: card.command,
      difficulties: [],
      searchIndex: '',
      summary: '',
    };

    currentReference.cards.push(card);

    if (!currentReference.categories.includes(card.category)) {
      currentReference.categories.push(card.category);
    }

    if (!currentReference.difficulties.includes(card.difficulty)) {
      currentReference.difficulties.push(card.difficulty);
    }

    commandMap.set(card.command, currentReference);
  });

  return Array.from(commandMap.values())
    .map((reference) => {
      const categories = reference.categories.sort((left, right) =>
        getCategoryLabel(left).localeCompare(getCategoryLabel(right)),
      );
      const difficulties = reference.difficulties.sort(
        (left, right) => difficultyOrder[left] - difficultyOrder[right],
      );
      const answers = getUniqueAnswers(reference.cards);
      const summary = getCommandSummary(reference.cards);

      return {
        ...reference,
        answers,
        categories,
        difficulties,
        searchIndex: getSearchIndex(reference.command, categories, reference.cards),
        summary,
      };
    })
    .sort((left, right) => left.command.localeCompare(right.command));
}

export function filterCommandReferences({
  commandReferences,
  normalizedQuery,
  selectedCategory,
  sortMode,
}: FilterCommandReferencesParams) {
  const nextReferences = commandReferences.filter((reference) => {
    const matchesCategory =
      selectedCategory === 'all' || reference.categories.includes(selectedCategory);
    const matchesQuery =
      normalizedQuery.length === 0 || reference.searchIndex.includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  if (sortMode === 'practice') {
    return nextReferences.sort(
      (left, right) =>
        right.cards.length - left.cards.length ||
        left.command.localeCompare(right.command),
    );
  }

  return nextReferences;
}

function getCommandSummary(cards: Card[]) {
  const [firstCard] = cards;

  if (!firstCard) {
    return 'Команда пока без описания.';
  }

  return firstCard.explanation.split(' Запоминайте ее как связку:')[0];
}

function getSearchIndex(command: string, categories: string[], cards: Card[]) {
  return [
    command,
    ...categories.map(getCategoryLabel),
    ...cards.flatMap((card) => [
      card.answer,
      card.example,
      card.explanation,
      card.hint,
      card.question,
    ]),
  ]
    .join(' ')
    .toLowerCase();
}

function getUniqueAnswers(cards: Card[]) {
  return Array.from(new Set(cards.map((card) => card.answer)));
}
