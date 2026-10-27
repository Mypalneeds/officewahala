-- ==========================================================
-- Office Wahala: optional global leaderboard for Supabase
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.
-- ==========================================================

-- 1. Scores table ------------------------------------------------------------
create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  name        text        not null check (char_length(name) between 1 and 20),
  score       integer     not null check (score between 0 and 2000000),
  duration    integer     not null check (duration between 1 and 36000),  -- seconds survived
  level       integer     not null check (level between 1 and 2000),
  ip_hash     text        not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists scores_score_idx   on public.scores (score desc);
create index if not exists scores_ip_time_idx on public.scores (ip_hash, created_at desc);

-- 2. Lock the table down -------------------------------------------------------
-- Row Level Security with NO policies means the public (anon) key cannot read,
-- insert, update or delete rows directly. All access goes through the two
-- functions below, which validate every request.
alter table public.scores enable row level security;
revoke all on table public.scores from anon, authenticated;

-- 3. Submit a score (validated + rate limited) --------------------------------
create or replace function public.submit_score(
  p_name text,
  p_score integer,
  p_duration integer,
  p_level integer
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name    text;
  v_ip      text := '';
  v_hash    text;
  v_recent  integer;
  v_hourly  integer;
begin
  -- Clean the name: letters, numbers, spaces and . _ - only, max 20 chars.
  v_name := btrim(regexp_replace(coalesce(p_name, ''), '[^A-Za-z0-9 _.\-]', '', 'g'));
  v_name := left(regexp_replace(v_name, '\s+', ' ', 'g'), 20);
  if char_length(v_name) < 1 then
    v_name := 'Anonymous';
  end if;

  if p_score is null or p_duration is null or p_level is null
     or p_score < 0 or p_duration < 1 or p_level < 1 then
    raise exception 'Invalid score.';
  end if;

  -- Plausibility checks that match the game's rules:
  --   * level = 1 + floor(seconds / 20), so the level must fit the time survived
  --   * v3 play (events, reports, bonuses) peaks well under ~150 points/second; allow headroom
  if p_level > (p_duration / 20) + 2 then
    raise exception 'Score does not match the time survived.';
  end if;
  if p_score > (p_duration * 900) + 4000 then
    raise exception 'Score does not match the time survived.';
  end if;

  -- Rate limit by hashed client IP (Supabase forwards it in request headers).
  begin
    v_ip := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  exception when others then
    v_ip := '';
  end;
  v_hash := md5(btrim(v_ip) || ':office-wahala');

  select count(*) into v_recent
    from public.scores
   where ip_hash = v_hash and created_at > now() - interval '20 seconds';
  if v_recent > 0 then
    raise exception 'Slow down. Wait a few seconds before submitting again.';
  end if;

  select count(*) into v_hourly
    from public.scores
   where ip_hash = v_hash and created_at > now() - interval '1 hour';
  if v_hourly >= 30 then
    raise exception 'Too many submissions this hour. Try again later.';
  end if;

  insert into public.scores (name, score, duration, level, ip_hash)
  values (v_name, p_score, p_duration, p_level, v_hash);

  return json_build_object('ok', true);
end;
$$;

-- 4. Read the top scores (never exposes ip_hash) ------------------------------
create or replace function public.get_leaderboard(p_limit integer default 20)
returns table (name text, score integer, duration integer, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select s.name, s.score, s.duration, s.created_at
    from public.scores s
   order by s.score desc, s.created_at asc
   limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

-- 5. Only these two functions are callable with the public key ---------------
revoke all on function public.submit_score(text, integer, integer, integer) from public;
revoke all on function public.get_leaderboard(integer) from public;
grant execute on function public.submit_score(text, integer, integer, integer) to anon, authenticated;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;
