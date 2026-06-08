create table if not exists public.cards (
  id text primary key,
  command text not null,
  question text not null,
  hint text not null,
  explanation text not null default '',
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

alter table public.cards
  add column if not exists explanation text not null default '';

create index if not exists cards_category_idx on public.cards (category);
create index if not exists cards_difficulty_idx on public.cards (difficulty);
create index if not exists cards_is_active_idx on public.cards (is_active);
create index if not exists cards_sort_order_idx on public.cards (sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cards_updated_at on public.cards;

create trigger set_cards_updated_at
  before update on public.cards
  for each row
  execute function public.set_updated_at();

alter table public.cards enable row level security;

drop policy if exists "Active cards are publicly readable" on public.cards;

create policy "Active cards are publicly readable"
  on public.cards
  for select
  using (is_active = true);

comment on table public.cards is
  'LinuxSwipe learning cards. The local cards.json file is the current content source and can be exported into this table.';

comment on column public.cards.accepted_answers is
  'Alternative valid answers for manual input matching.';
