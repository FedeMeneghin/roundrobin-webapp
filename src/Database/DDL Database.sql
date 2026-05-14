-- ============================================
-- PULIZIA SCHEMA PRECEDENTE
-- ============================================
drop table if exists voting_votes cascade;
drop table if exists voting_candidates cascade;
drop table if exists voting_sessions cascade;
drop table if exists suggestion_votes cascade;
drop table if exists suggestions_users cascade;
drop table if exists suggestions_library cascade;
drop table if exists book_ratings cascade;
drop table if exists books cascade;
drop table if exists authors cascade;
drop table if exists members cascade;
drop table if exists proposals cascade;
drop table if exists events cascade;
drop type if exists gender_type cascade;
drop type if exists book_status cascade;
drop type if exists book_genre cascade;
drop type if exists proposal_source cascade;
drop type if exists session_status cascade;

-- ============================================
-- TIPI ENUM
-- ============================================
create type gender_type as enum ('M', 'F', 'Non binario', 'Sconosciuto');
create type book_status as enum ('backlog', 'active', 'completed');
create type book_genre as enum ('Romanzo', 'Saggio', 'Racconto', 'Poesia', 'Graphic novel', 'Altro');
create type proposal_source as enum ('library', 'user');
create type session_status as enum ('open', 'runoff', 'closed');

-- ============================================
-- MEMBRI (i Pirati)
-- ============================================
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- ============================================
-- AUTORI
-- ============================================
create table authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender gender_type default 'Sconosciuto',
  nationality text,
  birth_year int,
  created_at timestamptz default now()
);

-- ============================================
-- LIBRI
-- ============================================
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_id uuid references authors(id) on delete set null,
  genre book_genre,
  publisher text,
  publication_year int,
  selected_date date,         -- quando è diventato libro del mese
  status book_status default 'backlog',
  created_at timestamptz default now()
);

-- ============================================
-- PROPOSTE
-- uno stesso libro può essere proposto più volte
-- ============================================
create table proposals (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  proposed_by uuid references members(id) on delete set null,  -- null = proposta libreria
  source proposal_source not null,
  created_at timestamptz default now()
);

-- ============================================
-- VOTI STELLINE
-- ============================================
create table book_ratings (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  has_read boolean default false,
  rating int check (rating between 1 and 5),  -- null se has_read = false
  created_at timestamptz default now(),
  unique(book_id, member_id)
);

-- ============================================
-- SESSIONI DI VOTAZIONE MENSILE
-- ============================================
create table voting_sessions (
  id uuid primary key default gen_random_uuid(),
  status session_status default 'open',
  round int default 1,        -- 1 = due voti, 2 = spareggio con un voto
  created_at timestamptz default now(),
  closed_at timestamptz
);

-- ============================================
-- CANDIDATI PER SESSIONE
-- un libro può essere candidato in più sessioni
-- ============================================
create table voting_candidates (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references voting_sessions(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  unique(session_id, book_id)   -- stesso libro non può essere candidato due volte nella stessa sessione
);

-- ============================================
-- VOTI NELLE SESSIONI
-- ============================================
create table voting_votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references voting_sessions(id) on delete cascade,
  candidate_id uuid references voting_candidates(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  round int default 1,
  created_at timestamptz default now()
  -- max 2 voti al round 1, max 1 voto al round 2: controllo lato app
);

-- ============================================
-- EVENTI CALENDARIO
-- ============================================
create table events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  created_at timestamptz default now()
);
