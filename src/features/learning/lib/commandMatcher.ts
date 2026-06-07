import { Card } from '../types/card';

export type ManualAnswerResult = {
  body: string;
  correct: boolean;
  kind:
    | 'empty'
    | 'exact'
    | 'extra-sudo'
    | 'wrong-flag'
    | 'missing-argument'
    | 'similar-command'
    | 'close'
    | 'miss';
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

function getCommandName(value: string) {
  return stripLeadingSudo(value).split(' ')[0] ?? '';
}

function getFlagTokens(value: string) {
  return stripLeadingSudo(value)
    .split(' ')
    .filter((token) => /^-{1,2}\w/.test(token));
}

function hasSameBaseCommand(left: string, right: string) {
  return getCommandName(left) === getCommandName(right);
}

export function evaluateManualAnswer(card: Card, value: string): ManualAnswerResult {
  const normalizedValue = normalizeCommand(value);
  const normalizedAnswer = normalizeCommand(card.answer);
  const acceptedCommands = buildAcceptedCommands(card);

  if (!normalizedValue) {
    return {
      body: 'Введите ответ целиком, как если бы вы печатали его в терминале.',
      correct: false,
      kind: 'empty',
      title: 'Нужна команда',
    };
  }

  if (acceptedCommands.has(normalizedValue)) {
    return {
      body: 'Хорошо. Такой ответ можно честно засчитать в уверенное знание.',
      correct: true,
      kind: 'exact',
      title: 'Верно',
    };
  }

  if (
    /^sudo\s+/i.test(normalizedValue) &&
    acceptedCommands.has(stripLeadingSudo(normalizedValue))
  ) {
    return {
      body: 'Команда по сути верная, но здесь `sudo` лишний. В реальной системе это может дать слишком широкие права.',
      correct: false,
      kind: 'extra-sudo',
      title: 'Лишний sudo',
    };
  }

  const inputFlags = getFlagTokens(normalizedValue);
  const answerFlags = getFlagTokens(normalizedAnswer);
  const hasWrongFlag =
    hasSameBaseCommand(normalizedValue, normalizedAnswer) &&
    answerFlags.length > 0 &&
    inputFlags.length > 0 &&
    inputFlags.some((flag) => !answerFlags.includes(flag));

  if (hasWrongFlag) {
    return {
      body: `Команда выбрана правильно, но флаг отличается. Здесь ожидается ${answerFlags.join(', ')}.`,
      correct: false,
      kind: 'wrong-flag',
      title: 'Команда верная, флаг другой',
    };
  }

  const inputTokens = normalizedValue.split(' ');
  const answerTokens = normalizedAnswer.split(' ');
  const hasSameCommand = hasSameBaseCommand(normalizedValue, normalizedAnswer);
  const missingTokens = answerTokens.filter((token) => !inputTokens.includes(token));

  if (
    hasSameCommand &&
    missingTokens.length > 0 &&
    inputTokens.length < answerTokens.length
  ) {
    return {
      body: `Команда выбрана правильно, но не хватает аргумента: ${missingTokens.join(' ')}.`,
      correct: false,
      kind: 'missing-argument',
      title: 'Не хватает пути или аргумента',
    };
  }

  const sharedTokens = inputTokens.filter((token) => answerTokens.includes(token)).length;
  const hasSimilarCommand =
    !hasSameCommand &&
    sharedTokens >= 1 &&
    inputTokens.some((token) => token.length > 2 && normalizedAnswer.includes(token));

  if (hasSimilarCommand) {
    return {
      body: `Вы близко к нужному сценарию, но ожидается команда \`${getCommandName(normalizedAnswer)}\`.`,
      correct: false,
      kind: 'similar-command',
      title: 'Команда похожа, но не та',
    };
  }

  const isCloseMatch =
    sharedTokens >= Math.max(answerTokens.length - 1, 1) ||
    normalizeCommand(stripLeadingSudo(card.answer)) === normalizedValue;

  if (isCloseMatch) {
    return {
      body: 'Основа верная. Проверьте один флаг, кавычки или последний аргумент.',
      correct: false,
      kind: 'close',
      title: 'Почти получилось',
    };
  }

  return {
    body: 'Попробуйте еще раз, переверните карточку или отправьте ее на повтор.',
    correct: false,
    kind: 'miss',
    title: 'Пока мимо',
  };
}
