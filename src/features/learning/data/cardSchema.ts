import { Card } from '../types/card';

const difficulties = new Set<Card['difficulty']>(['easy', 'medium', 'hard']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: Record<string, unknown>, key: keyof Card) {
  const field = value[key];

  if (typeof field !== 'string' || field.trim().length === 0) {
    throw new Error(`Card field "${key}" must be a non-empty string.`);
  }

  return field;
}

function readAcceptedAnswers(value: Record<string, unknown>) {
  const acceptedAnswers = value.acceptedAnswers;

  if (acceptedAnswers === undefined) {
    return undefined;
  }

  if (
    !Array.isArray(acceptedAnswers) ||
    acceptedAnswers.some((answer) => typeof answer !== 'string')
  ) {
    throw new Error('Card field "acceptedAnswers" must be an array of strings.');
  }

  return acceptedAnswers;
}

function validateCard(value: unknown): Card {
  if (!isRecord(value)) {
    throw new Error('Card must be an object.');
  }

  const difficulty = readString(value, 'difficulty');

  if (!difficulties.has(difficulty as Card['difficulty'])) {
    throw new Error(`Unsupported card difficulty "${difficulty}".`);
  }

  return {
    id: readString(value, 'id'),
    command: readString(value, 'command'),
    question: readString(value, 'question'),
    hint: readString(value, 'hint'),
    answer: readString(value, 'answer'),
    acceptedAnswers: readAcceptedAnswers(value),
    example: readString(value, 'example'),
    category: readString(value, 'category'),
    difficulty: difficulty as Card['difficulty'],
  };
}

export function validateCards(value: unknown): Card[] {
  if (!Array.isArray(value)) {
    throw new Error('Learning cards content must be an array.');
  }

  const cards = value.map(validateCard);
  const ids = new Set<string>();

  cards.forEach((card) => {
    if (ids.has(card.id)) {
      throw new Error(`Duplicate card id "${card.id}".`);
    }

    ids.add(card.id);
  });

  return cards;
}
