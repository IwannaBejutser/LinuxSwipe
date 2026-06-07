import { supabase } from '../../../shared/api/supabase';
import { validateCards } from './cardSchema';
import { cards as localCards } from './learningCards';
import { loadCardCache, saveCardCache } from '../storage/cardCacheStorage';
import { Card } from '../types/card';

export type LearningCardSource = 'cache' | 'local' | 'supabase';

export type LearningCardsSnapshot = {
  cards: Card[];
  source: LearningCardSource;
  version?: string;
};

type SupabaseCardRow = {
  accepted_answers: string[] | null;
  answer: string;
  category: string;
  command: string;
  difficulty: Card['difficulty'];
  example: string;
  hint: string;
  id: string;
  is_active: boolean | null;
  question: string;
  sort_order: number | null;
  updated_at: string | null;
};

function mapSupabaseCard(row: SupabaseCardRow): Card {
  return {
    id: row.id,
    command: row.command,
    question: row.question,
    hint: row.hint,
    answer: row.answer,
    acceptedAnswers: row.accepted_answers ?? undefined,
    example: row.example,
    category: row.category,
    difficulty: row.difficulty,
  };
}

function sortRemoteRows(left: SupabaseCardRow, right: SupabaseCardRow) {
  const leftOrder = left.sort_order ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.sort_order ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.id.localeCompare(right.id);
}

async function loadRemoteCardsVersion(): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    const [latestRow] = (data ?? []) as unknown as Array<{ updated_at?: string }>;

    if (error || !latestRow?.updated_at) {
      return null;
    }

    return latestRow.updated_at;
  } catch {
    return null;
  }
}

async function loadRemoteCards(): Promise<LearningCardsSnapshot | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select(
        [
          'id',
          'command',
          'question',
          'hint',
          'answer',
          'accepted_answers',
          'example',
          'category',
          'difficulty',
          'is_active',
          'sort_order',
          'updated_at',
        ].join(', '),
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data?.length) {
      return null;
    }

    const rows = data as unknown as SupabaseCardRow[];
    const cards = validateCards(rows.sort(sortRemoteRows).map(mapSupabaseCard));
    const version = rows.reduce((latestVersion, row) => {
      if (!row.updated_at) {
        return latestVersion;
      }

      if (!latestVersion || row.updated_at > latestVersion) {
        return row.updated_at;
      }

      return latestVersion;
    }, '');

    if (version) {
      await saveCardCache(version, cards);
    }

    return {
      cards,
      source: 'supabase',
      version,
    };
  } catch {
    return null;
  }
}

export async function loadInitialLearningCards(): Promise<LearningCardsSnapshot> {
  const cachedCards = await loadCardCache();

  if (cachedCards) {
    return {
      cards: cachedCards.cards,
      source: 'cache',
      version: cachedCards.version,
    };
  }

  return {
    cards: localCards,
    source: 'local',
  };
}

export async function syncLearningCards(
  currentVersion?: string,
): Promise<LearningCardsSnapshot | null> {
  if (!supabase) {
    return null;
  }

  const remoteVersion = await loadRemoteCardsVersion();

  if (remoteVersion && currentVersion === remoteVersion) {
    return null;
  }

  const remoteSnapshot = await loadRemoteCards();

  if (remoteSnapshot) {
    return remoteSnapshot;
  }

  const cachedCards = await loadCardCache();

  if (cachedCards && cachedCards.version !== currentVersion) {
    return {
      cards: cachedCards.cards,
      source: 'cache',
      version: cachedCards.version,
    };
  }

  return null;
}
