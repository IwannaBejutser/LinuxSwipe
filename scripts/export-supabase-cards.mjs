/* global console */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cardsPath = resolve(rootDir, 'src/features/learning/data/cards.json');
const outputPath = resolve(rootDir, 'supabase/cards.seed.sql');

function escapeSqlString(value) {
  return String(value).replace(/'/g, "''");
}

function toSqlString(value) {
  return `'${escapeSqlString(value)}'`;
}

function toSqlTextArray(values = []) {
  if (!values.length) {
    return 'ARRAY[]::text[]';
  }

  return `ARRAY[${values.map(toSqlString).join(', ')}]::text[]`;
}

function toRow(card, index) {
  return [
    toSqlString(card.id),
    toSqlString(card.command),
    toSqlString(card.question),
    toSqlString(card.hint),
    toSqlString(card.explanation),
    toSqlString(card.answer),
    toSqlTextArray(card.acceptedAnswers),
    toSqlString(card.example),
    toSqlString(card.category),
    toSqlString(card.difficulty),
    String(index + 1),
  ].join(', ');
}

const rawCards = await readFile(cardsPath, 'utf8');
const cards = JSON.parse(rawCards);

if (!Array.isArray(cards)) {
  throw new Error('cards.json must contain an array.');
}

const rows = cards.map((card, index) => `  (${toRow(card, index)})`).join(',\n');
const content = `-- Generated from src/features/learning/data/cards.json.
-- Regenerate with: npm run content:seed:supabase

insert into public.cards (
  id,
  command,
  question,
  hint,
  explanation,
  answer,
  accepted_answers,
  example,
  category,
  difficulty,
  sort_order
)
values
${rows}
on conflict (id) do update set
  command = excluded.command,
  question = excluded.question,
  hint = excluded.hint,
  explanation = excluded.explanation,
  answer = excluded.answer,
  accepted_answers = excluded.accepted_answers,
  example = excluded.example,
  category = excluded.category,
  difficulty = excluded.difficulty,
  sort_order = excluded.sort_order,
  updated_at = now();
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, content, 'utf8');

console.log(`Exported ${cards.length} cards to ${outputPath}`);
