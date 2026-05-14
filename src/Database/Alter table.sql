
-- ============================================
-- DISABILITA RLS (per ora)
-- ============================================
alter table members disable row level security;
alter table authors disable row level security;
alter table books disable row level security;
alter table proposals disable row level security;
alter table book_ratings disable row level security;
alter table voting_sessions disable row level security;
alter table voting_candidates disable row level security;
alter table voting_votes disable row level security;
alter table events disable row level security;

-- ============================================
-- aggiungo password
-- ============================================
alter table members add column password_hash text;

-- ============================================
-- aggiungo note e tipo agli eventi
-- ============================================
alter table events add column notes text;

alter table events add column type text check (type in ('ufficiale', 'vario')) default 'ufficiale';
alter table events add column ics_uid text;

create table event_rsvp (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  created_at timestamptz default now(),
  unique(event_id, member_id)
);

alter table event_rsvp disable row level security;

alter table books add column isbn text;
alter table books add column cover_url text;

ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_url text;