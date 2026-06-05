import { Card } from '../types/card';

export type ManualAnswerResult = {
  body: string;
  correct: boolean;
  title: string;
};

export function normalizeCommand(value: string) {
  return value
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function stripLeadingSudo(value: string) {
  return value.replace(/^sudo\s+/i, '');
}

export function withSingleQuotes(value: string) {
  return value.replace(/"([^"]+)"/g, "'$1'");
}

export function withoutSimpleQuotes(value: string) {
  return value.replace(/(["'])([^"'`\s]+)\1/g, '$2');
}

export function buildAcceptedCommands(card: Card) {
  const variants = new Set<string>();
  const seedAnswers = [card.answer, ...(card.acceptedAnswers ?? [])];

  seedAnswers.forEach((answer) => {
    const localVariants = [
      answer,
      withSingleQuotes(answer),
      withoutSimpleQuotes(answer),
      withSingleQuotes(withoutSimpleQuotes(answer)),
    ];

    localVariants.forEach((variant) => {
      const normalizedVariant = normalizeCommand(variant);

      if (!normalizedVariant) {
        return;
      }

      variants.add(normalizedVariant);

      if (/^sudo\s+/i.test(variant)) {
        variants.add(normalizeCommand(stripLeadingSudo(variant)));
      }
    });
  });

  return variants;
}

export function evaluateManualAnswer(card: Card, value: string): ManualAnswerResult {
  const normalizedValue = normalizeCommand(value);
  const normalizedAnswer = normalizeCommand(card.answer);

  if (!normalizedValue) {
    return {
      body: 'Введите ответ целиком, как если бы вы печатали его в терминале.',
      correct: false,
      title: 'Нужна команда',
    };
  }

  if (buildAcceptedCommands(card).has(normalizedValue)) {
    return {
      body: 'Хорошо. Такой ответ можно честно засчитать в уверенное знание.',
      correct: true,
      title: 'Верно',
    };
  }

  const inputTokens = normalizedValue.split(' ');
  const answerTokens = normalizedAnswer.split(' ');
  const sharedTokens = inputTokens.filter((token) => answerTokens.includes(token)).length;
  const isCloseMatch =
    sharedTokens >= Math.max(answerTokens.length - 1, 1) ||
    normalizeCommand(stripLeadingSudo(card.answer)) === normalizedValue;

  if (isCloseMatch) {
    return {
      body: 'Основа верная. Проверьте один флаг, кавычки или последний аргумент.',
      correct: false,
      title: 'Почти получилось',
    };
  }

  return {
    body: 'Попробуйте еще раз, переверните карточку или отправьте ее на повтор.',
    correct: false,
    title: 'Пока мимо',
  };
}
