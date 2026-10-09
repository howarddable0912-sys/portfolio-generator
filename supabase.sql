-- FolioForge database (Supabase / PostgreSQL)
-- Paste this whole file into Supabase > SQL Editor > New query > Run.

create table if not exists portfolios (
  id          bigint generated always as identity primary key,
  full_name   varchar(120) not null,
  headline    varchar(160),
  email       varchar(160) not null,
  phone       varchar(40),
  address     varchar(255),
  about       text,
  photo_data  text,
  template    smallint not null default 1 check (template between 1 and 3),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists education (
  id           bigint generated always as identity primary key,
  portfolio_id bigint not null references portfolios(id) on delete cascade,
  school       varchar(160) not null,
  degree       varchar(160),
  start_year   varchar(10),
  end_year     varchar(10),
  sort_order   int not null default 0
);

create table if not exists skills (
  id           bigint generated always as identity primary key,
  portfolio_id bigint not null references portfolios(id) on delete cascade,
  name         varchar(80) not null,
  level        varchar(20) not null default 'Intermediate',
  sort_order   int not null default 0
);

create table if not exists projects (
  id           bigint generated always as identity primary key,
  portfolio_id bigint not null references portfolios(id) on delete cascade,
  title        varchar(160) not null,
  description  text,
  url          varchar(255),
  sort_order   int not null default 0
);

create table if not exists experience (
  id           bigint generated always as identity primary key,
  portfolio_id bigint not null references portfolios(id) on delete cascade,
  company      varchar(160) not null,
  position     varchar(160),
  start_date   varchar(20),
  end_date     varchar(20),
  description  text,
  sort_order   int not null default 0
);

create table if not exists social_links (
  id           bigint generated always as identity primary key,
  portfolio_id bigint not null references portfolios(id) on delete cascade,
  label        varchar(60) not null,
  url          varchar(255) not null,
  sort_order   int not null default 0
);

create index if not exists idx_education_pid    on education(portfolio_id);
create index if not exists idx_skills_pid       on skills(portfolio_id);
create index if not exists idx_projects_pid     on projects(portfolio_id);
create index if not exists idx_experience_pid   on experience(portfolio_id);
create index if not exists idx_social_links_pid on social_links(portfolio_id);

-- Row Level Security: the assignment has no login, so the public (anon) role may read and write.
do $$
declare t text;
begin
  foreach t in array array['portfolios','education','skills','projects','experience','social_links'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public access" on %I', t);
    execute format('create policy "public access" on %I for all to anon using (true) with check (true)', t);
    execute format('grant select, insert, update, delete on %I to anon', t);
  end loop;
end $$;
grant usage, select on all sequences in schema public to anon;