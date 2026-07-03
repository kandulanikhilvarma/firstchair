-- Rankwell initial schema — master plan §2.3.
-- Every table gets RLS in this same migration (§2.8 rule 2).

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'trial' check (plan in ('trial', 'solo', 'agency', 'canceled')),
  stripe_customer_id text,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table members (
  user_id uuid not null references auth.users (id) on delete cascade,
  workspace_id uuid not null references workspaces (id) on delete cascade,
  role text not null default 'owner',
  primary key (user_id, workspace_id)
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  aliases text[] not null default '{}',
  domain text,
  city text,
  vertical_meta jsonb not null default '{}',
  is_competitor_of uuid references brands (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table prompts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands (id) on delete cascade,
  text text not null,
  source text not null check (source in ('template', 'custom')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table scan_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands (id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  attempts int not null default 0,
  scheduled_for date not null,
  started_at timestamptz,
  finished_at timestamptz,
  error text,
  -- idempotency: never double-scan/double-bill a brand for the same day
  unique (brand_id, scheduled_for)
);

create table engine_responses (
  id uuid primary key default gen_random_uuid(),
  scan_job_id uuid not null references scan_jobs (id) on delete cascade,
  prompt_id uuid not null references prompts (id) on delete cascade,
  engine text not null check (engine in ('openai', 'gemini', 'perplexity')),
  raw_text text not null,
  citations jsonb not null default '[]',
  model text not null,
  latency_ms int,
  prompt_tokens int,
  completion_tokens int,
  cost_usd numeric(8, 5),
  created_at timestamptz not null default now()
);

create table mentions (
  id uuid primary key default gen_random_uuid(),
  engine_response_id uuid not null references engine_responses (id) on delete cascade,
  brand_id uuid not null references brands (id) on delete cascade,
  matched_alias text not null,
  position int,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  is_recommendation boolean not null default false,
  method text not null check (method in ('exact', 'llm')),
  needs_review boolean not null default false
);

create table daily_scores (
  brand_id uuid not null references brands (id) on delete cascade,
  date date not null,
  engine text not null check (engine in ('openai', 'gemini', 'perplexity')),
  visibility_score numeric not null,
  share_of_voice numeric not null,
  mention_count int not null default 0,
  recommendation_count int not null default 0,
  top_citations jsonb not null default '[]',
  primary key (brand_id, date, engine)
);

-- public lead-magnet leads; no user login attached, no RLS-by-membership possible
create table audit_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  firm_name text not null,
  city text,
  practice_area text,
  result jsonb,
  converted_workspace_id uuid references workspaces (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS. Deny-by-default: enabling RLS with no policy blocks all anon/user access.
-- Server-side cron/worker uses the service-role key, which bypasses RLS.
-- ---------------------------------------------------------------------------

create function member_workspaces()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from members where user_id = auth.uid()
$$;

alter table workspaces enable row level security;
create policy workspace_member_all on workspaces
  for all using (id in (select member_workspaces()));

alter table members enable row level security;
create policy members_self on members
  for all using (user_id = auth.uid());

alter table brands enable row level security;
create policy brands_by_workspace on brands
  for all using (workspace_id in (select member_workspaces()));

alter table prompts enable row level security;
create policy prompts_by_workspace on prompts
  for all using (
    brand_id in (
      select id from brands where workspace_id in (select member_workspaces())
    )
  );

alter table scan_jobs enable row level security;
create policy scan_jobs_by_workspace on scan_jobs
  for select using (
    brand_id in (
      select id from brands where workspace_id in (select member_workspaces())
    )
  );

alter table engine_responses enable row level security;
create policy engine_responses_by_workspace on engine_responses
  for select using (
    scan_job_id in (
      select sj.id from scan_jobs sj
      join brands b on b.id = sj.brand_id
      where b.workspace_id in (select member_workspaces())
    )
  );

alter table mentions enable row level security;
create policy mentions_by_workspace on mentions
  for select using (
    brand_id in (
      select id from brands where workspace_id in (select member_workspaces())
    )
  );

alter table daily_scores enable row level security;
create policy daily_scores_by_workspace on daily_scores
  for select using (
    brand_id in (
      select id from brands where workspace_id in (select member_workspaces())
    )
  );

-- audit_leads: RLS on, no user policy — service-role only (public API route inserts server-side)
alter table audit_leads enable row level security;
