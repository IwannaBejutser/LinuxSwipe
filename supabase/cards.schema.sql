create table if not exists public.cards (
  id text primary key,
  command text not null,
  question text not null,
  hint text not null,
  answer text not null,
  accepted_answers text[] not null default '{}',
  example text not null,
  category text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  is_active boolean not null default true,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cards_category_idx on public.cards (category);
create index if not exists cards_difficulty_idx on public.cards (difficulty);
create index if not exists cards_is_active_idx on public.cards (is_active);

comment on table public.cards is
  'LinuxSwipe learning cards. The local cards.json file is the current content source and can be exported into this table.';

comment on column public.cards.accepted_answers is
  'Alternative valid answers for manual input matching.';
