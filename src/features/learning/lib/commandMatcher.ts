import { Card } from '../types/card';

export type ManualAnswerResult = {
  body: string;
  correct: boolean;
  kind:
    | 'empty'
    | 'exact'
    | 'extra-sudo'
    | 'missing-flag'
    | 'wrong-flag'
    | 'wrong-path'
    | 'missing-argument'
    | 'similar-command'
    | 'close'
    | 'miss';
  suggestion?: {
    correction?: string;
    expected?: string;
    reason: string;
    title: string;
  };
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

function parseCommand(value: string) {
  const normalized = normalizeCommand(value);
  const withoutSudo = stripLeadingSudo(normalized);
  const tokens = withoutSudo.split(' ').filter(Boolean);
  const command = tokens[0] ?? '';
  const args = tokens.slice(1);

  return {
    args,
    command,
    flags: args.filter((token) => /^-{1,2}\w/.test(token)),
    hasSudo: /^sudo\s+/i.test(normalized),
    normalized,
    positional: args.filter((token) => !/^-{1,2}\w/.test(token)),
    tokens,
    withoutSudo,
  };
}

function hasSameBaseCommand(left: string, right: string) {
  return getCommandName(left) === getCommandName(right);
}

function canonicalToken(value: string) {
  return value.replace(/^(['"])(.*)\1$/, '$2');
}

function uniqueMissingTokens(expectedTokens: string[], actualTokens: string[]) {
  const actualSet = new Set(actualTokens.map(canonicalToken));

  return expectedTokens.filter((token) => !actualSet.has(canonicalToken(token)));
}

function levenshteinDistance(left: string, right: string) {
  if (left === right) {
    return 0;
  }

  if (!left.length) {
    return right.length;
  }

  if (!right.length) {
    return left.length;
  }

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;

      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

function isSimilarCommandName(inputCommand: string, answerCommand: string) {
  if (!inputCommand || !answerCommand) {
    return false;
  }

  if (inputCommand[0] !== answerCommand[0]) {
    return false;
  }

  return levenshteinDistance(inputCommand, answerCommand) <= 2;
}

function formatTokens(tokens: string[]) {
  return tokens.map((token) => `\`${token}\``).join(', ');
}

export function evaluateManualAnswer(card: Card, value: string): ManualAnswerResult {
  const normalizedValue = normalizeCommand(value);
  const normalizedAnswer = normalizeCommand(card.answer);
  const acceptedCommands = buildAcceptedCommands(card);
  const inputCommand = parseCommand(normalizedValue);
  const answerCommand = parseCommand(normalizedAnswer);

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
    const correction = stripLeadingSudo(normalizedValue);

    return {
      body: 'Команда по сути верная, но здесь `sudo` лишний. В реальной системе это может дать слишком широкие права.',
      correct: false,
      kind: 'extra-sudo',
      suggestion: {
        correction,
        expected: normalizedAnswer,
        reason: 'Уберите `sudo` и оставьте команду без повышения прав.',
        title: 'Как исправить',
      },
      title: 'Лишний sudo',
    };
  }

  const inputFlags = inputCommand.flags;
  const answerFlags = answerCommand.flags;
  const missingFlags = uniqueMissingTokens(answerFlags, inputFlags);
  const hasWrongFlag =
    hasSameBaseCommand(normalizedValue, normalizedAnswer) &&
    answerFlags.length > 0 &&
    inputFlags.length > 0 &&
    inputFlags.some((flag) => !answerFlags.includes(flag));

  if (
    hasSameBaseCommand(normalizedValue, normalizedAnswer) &&
    missingFlags.length > 0 &&
    inputFlags.every((flag) => answerFlags.includes(flag))
  ) {
    return {
      body: `Команда выбрана правильно, но не хватает флага ${formatTokens(missingFlags)}.`,
      correct: false,
      kind: 'missing-flag',
      suggestion: {
        correction: normalizedAnswer,
        expected: formatTokens(answerFlags),
        reason: 'Добавьте недостающий флаг к этой же команде.',
        title: 'Не хватает флага',
      },
      title: 'Флаг забыли',
    };
  }

  if (hasWrongFlag) {
    const wrongFlags = inputFlags.filter((flag) => !answerFlags.includes(flag));

    return {
      body: `Команда выбрана правильно, но флаг отличается: ${formatTokens(wrongFlags)}.`,
      correct: false,
      kind: 'wrong-flag',
      suggestion: {
        correction: normalizedAnswer,
        expected: formatTokens(answerFlags),
        reason: `Замените флаг на ${formatTokens(answerFlags)}.`,
        title: 'Ожидался другой флаг',
      },
      title: 'Команда верная, флаг другой',
    };
  }

  const inputTokens = inputCommand.tokens;
  const answerTokens = answerCommand.tokens;
  const hasSameCommand = hasSameBaseCommand(normalizedValue, normalizedAnswer);
  const missingTokens = uniqueMissingTokens(answerTokens, inputTokens);
  const inputPositionals = inputCommand.positional;
  const answerPositionals = answerCommand.positional;
  const flagsAreCompatible =
    answerFlags.every((flag) => inputFlags.includes(flag)) ||
    inputFlags.every((flag) => answerFlags.includes(flag));

  if (
    hasSameCommand &&
    missingTokens.length > 0 &&
    inputTokens.length < answerTokens.length
  ) {
    return {
      body: `Команда выбрана правильно, но не хватает аргумента: ${missingTokens.join(' ')}.`,
      correct: false,
      kind: 'missing-argument',
      suggestion: {
        correction: normalizedAnswer,
        expected: formatTokens(missingTokens),
        reason: 'Допишите недостающий путь, шаблон или аргумент в конец команды.',
        title: 'Добавьте аргумент',
      },
      title: 'Не хватает пути или аргумента',
    };
  }

  const hasWrongPath =
    hasSameCommand &&
    answerPositionals.length > 0 &&
    inputPositionals.length > 0 &&
    flagsAreCompatible &&
    inputPositionals.some((token) => {
      const expectedSet = new Set(answerPositionals.map(canonicalToken));

      return !expectedSet.has(canonicalToken(token));
    });

  if (hasWrongPath) {
    const expectedPositionals = uniqueMissingTokens(answerPositionals, inputPositionals);

    return {
      body: `Команда похожа на нужную, но путь или аргумент другой: ожидается ${formatTokens(expectedPositionals)}.`,
      correct: false,
      kind: 'wrong-path',
      suggestion: {
        correction: normalizedAnswer,
        expected: formatTokens(expectedPositionals),
        reason: 'Оставьте команду и флаги, но замените путь, файл или шаблон.',
        title: 'Не тот путь или аргумент',
      },
      title: 'Путь не совпал',
    };
  }

  const sharedTokens = inputTokens.filter((token) => answerTokens.includes(token)).length;
  const hasSimilarCommand =
    !hasSameCommand &&
    (isSimilarCommandName(inputCommand.command, answerCommand.command) ||
      (sharedTokens >= 1 &&
        inputTokens.some(
          (token) => token.length > 2 && normalizedAnswer.includes(token),
        )));

  if (hasSimilarCommand) {
    return {
      body: `Вы близко к нужному сценарию, но ожидается команда \`${getCommandName(normalizedAnswer)}\`.`,
      correct: false,
      kind: 'similar-command',
      suggestion: {
        correction: normalizedAnswer,
        expected: `\`${answerCommand.command}\``,
        reason: `Начните с команды \`${answerCommand.command}\`, затем добавьте нужные флаги и аргументы.`,
        title: 'Похожая команда',
      },
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
      suggestion: {
        correction: normalizedAnswer,
        expected: normalizedAnswer,
        reason:
          'Сверьте команду с правильным вариантом и поправьте один отличающийся фрагмент.',
        title: 'Почти',
      },
      title: 'Почти получилось',
    };
  }

  return {
    body: 'Попробуйте еще раз, переверните карточку или отправьте ее на повтор.',
    correct: false,
    kind: 'miss',
    suggestion: {
      expected: `\`${answerCommand.command}\``,
      reason: 'Начните с определения основной команды, затем добавляйте флаги и путь.',
      title: 'С чего начать',
    },
    title: 'Пока мимо',
  };
}
