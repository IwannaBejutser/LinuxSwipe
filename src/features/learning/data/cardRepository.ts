import { supabase } from '../../../shared/api/supabase';
import { validateCards } from './cardSchema';
import { cards as localCards } from './learningCards';
import { Card } from '../types/card';

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

export async function loadLearningCards(): Promise<Card[]> {
  if (!supabase) {
    return localCards;
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
        ].join(', '),
      )
      .eq('is_active', true);

    if (error || !data?.length) {
      return localCards;
    }

    const rows = data as unknown as SupabaseCardRow[];

    return validateCards(rows.sort(sortRemoteRows).map(mapSupabaseCard));
  } catch {
    return localCards;
  }
}
