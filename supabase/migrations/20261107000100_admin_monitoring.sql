create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username is null or username ~ '^[a-z0-9_]{3,32}$'),
  full_name text not null default '' check (char_length(full_name) <= 120),
  grade text check (grade is null or grade in ('Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12')),
  avatar_url text check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 2048)),
  account_status text not null default 'active'
    check (account_status in ('active', 'suspended', 'disabled')),
  current_level integer not null default 1 check (current_level between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null
);

create table if not exists public.user_sessions (
  session_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '2 minutes',
  ended_at timestamptz
);

create index if not exists user_sessions_online_idx
  on public.user_sessions (expires_at, user_id) where ended_at is null;

create table if not exists public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'registration', 'login', 'logout', 'quiz_attempted', 'quiz_completed',
    'answer_correct', 'answer_incorrect', 'reading_completed', 'math_completed', 'quest_completed',
    'coins_earned', 'level_achieved', 'achievement_unlocked',
    'account_suspended', 'account_reactivated', 'account_disabled',
    'password_reset_requested'
  )),
  mode text check (mode is null or mode in ('basa', 'math')),
  score numeric,
  coins integer check (coins is null or coins >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  details jsonb not null default '{}'::jsonb
    check (jsonb_typeof(details) = 'object' and pg_column_size(details) <= 4096),
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_date_idx
  on public.activity_events (user_id, created_at desc);
create index if not exists activity_events_type_date_idx
  on public.activity_events (event_type, created_at desc);

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  affected_user_id uuid,
  action text not null,
  previous_values jsonb,
  updated_values jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_date_idx
  on public.admin_audit_logs (created_at desc);

create or replace function public.audit_admin_grant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.admin_audit_logs (admin_id, affected_user_id, action, updated_values)
  values (new.granted_by, new.user_id, 'administrator_granted', jsonb_build_object('role', 'admin'));
  return new;
end;
$$;

drop trigger if exists audit_admin_grant_questar on public.admin_users;
create trigger audit_admin_grant_questar
  after insert on public.admin_users
  for each row execute function public.audit_admin_grant();

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.user_sessions enable row level security;
alter table public.activity_events enable row level security;
alter table public.admin_audit_logs enable row level security;

revoke all on public.profiles, public.admin_users, public.user_sessions,
  public.activity_events, public.admin_audit_logs from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (username, full_name, avatar_url) on public.profiles to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a
    join public.profiles p on p.id=a.user_id
    where a.user_id = (select auth.uid()) and p.account_status='active'
  );
$$;

create or replace function private.current_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.account_status = 'active'
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.current_user_is_active() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.current_user_is_active() to authenticated;

create policy "Users read their own active profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) and private.current_user_is_active());

create policy "Users update permitted profile fields"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()) and private.current_user_is_active())
  with check (id = (select auth.uid()) and account_status = 'active');

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name, grade, avatar_url)
  values (
    new.id,
    case when lower(trim(coalesce(new.raw_user_meta_data ->> 'username', ''))) ~ '^[a-z0-9_]{3,32}$'
      then lower(trim(new.raw_user_meta_data ->> 'username')) else null end,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), ''), 120),
    case when new.raw_user_meta_data ->> 'grade' in ('Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12')
      then new.raw_user_meta_data ->> 'grade' else null end,
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  insert into public.activity_events (user_id, event_type)
  values (new.id, 'registration');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_questar on auth.users;
create trigger on_auth_user_created_questar
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.heartbeat_session(p_session_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  was_existing boolean;
  affected_rows integer;
  next_expiry timestamptz := now() + interval '2 minutes';
begin
  if current_user_id is null or p_session_id is null
     or not private.current_user_is_active() then
    raise exception 'Active authenticated account required';
  end if;

  select exists (
    select 1 from public.user_sessions
    where session_id=p_session_id and user_id=current_user_id and ended_at is null
  ) into was_existing;
  insert into public.user_sessions (session_id, user_id, last_seen_at, expires_at)
  values (p_session_id, current_user_id, now(), next_expiry)
  on conflict (session_id) do update
    set last_seen_at = now(), expires_at = next_expiry
    where public.user_sessions.user_id = current_user_id
      and public.user_sessions.ended_at is null;

  if not found then
    raise exception 'Session is not available';
  end if;
  get diagnostics affected_rows = row_count;
  if affected_rows = 0 then raise exception 'Session is not available'; end if;

  if not was_existing then
    insert into public.activity_events (user_id, event_type)
    values (current_user_id, 'login');
  end if;
  return next_expiry;
end;
$$;

create or replace function public.end_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  update public.user_sessions
    set ended_at = now(), expires_at = now()
    where session_id = p_session_id
      and user_id = current_user_id
      and ended_at is null;
  if found then
    insert into public.activity_events (user_id, event_type)
    values (current_user_id, 'logout');
  end if;
end;
$$;

create or replace function public.record_learning_event(
  p_event_type text,
  p_mode text default null,
  p_score numeric default null,
  p_coins integer default null,
  p_duration_seconds integer default null,
  p_details jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_id bigint;
begin
  if auth.uid() is null or not private.current_user_is_active() then
    raise exception 'Active authenticated account required';
  end if;
  if p_score is not null and (p_score < 0 or p_score > 10000) then
    raise exception 'Score is out of range';
  end if;
  if p_coins is not null and p_coins > 100000 then
    raise exception 'Coin event is out of range';
  end if;
  if p_duration_seconds is not null and p_duration_seconds > 86400 then
    raise exception 'Duration is out of range';
  end if;
  if p_event_type not in (
    'quiz_attempted', 'quiz_completed', 'answer_correct', 'answer_incorrect',
    'reading_completed', 'math_completed', 'quest_completed', 'coins_earned', 'level_achieved',
    'achievement_unlocked'
  ) then
    raise exception 'Unsupported learning event';
  end if;
  insert into public.activity_events
    (user_id, event_type, mode, score, coins, duration_seconds, details)
  values
    (auth.uid(), p_event_type, p_mode, p_score, p_coins, p_duration_seconds,
     coalesce(p_details, '{}'::jsonb))
  returning id into inserted_id;
  if p_event_type = 'level_achieved' then
    if coalesce(p_details ->> 'level', '') !~ '^[0-9]{1,3}$'
       or (p_details ->> 'level')::integer not between 1 and 100 then
      raise exception 'A valid level is required';
    end if;
    update public.profiles
      set current_level=greatest(current_level, (p_details ->> 'level')::integer),
          updated_at=now()
      where id=auth.uid();
  end if;
  return inserted_id;
end;
$$;

create or replace function public.admin_list_users(
  p_search text default '',
  p_status text default 'all',
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  user_id uuid,
  full_name text,
  username text,
  email text,
  avatar_url text,
  registered_at timestamptz,
  last_login_at timestamptz,
  account_status text,
  account_role text,
  is_online boolean,
  last_active_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  if p_status not in ('all', 'active', 'suspended', 'disabled', 'online', 'offline', 'admin', 'student') then
    raise exception 'Invalid status filter';
  end if;
  return query
  with presence as (
    select s.user_id, max(s.last_seen_at) as last_active_at,
      bool_or(s.expires_at > now() and s.ended_at is null) as online
    from public.user_sessions s group by s.user_id
  ), logins as (
    select e.user_id, max(e.created_at) as last_login_at
    from public.activity_events e where e.event_type = 'login' group by e.user_id
  )
  select p.id, p.full_name, p.username, u.email, p.avatar_url, p.created_at,
    coalesce(l.last_login_at, u.last_sign_in_at), p.account_status,
    case when a.user_id is null then 'student' else 'admin' end,
    (coalesce(pr.online, false) and p.account_status='active'), pr.last_active_at
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.admin_users a on a.user_id = p.id
  left join presence pr on pr.user_id = p.id
  left join logins l on l.user_id = p.id
  where (p_search = '' or p.full_name ilike '%' || p_search || '%'
      or coalesce(p.username, '') ilike '%' || p_search || '%'
      or coalesce(u.email, '') ilike '%' || p_search || '%')
    and (p_status = 'all'
      or p.account_status = p_status
      or (p_status = 'online' and coalesce(pr.online, false) and p.account_status='active')
      or (p_status = 'offline' and (not coalesce(pr.online, false) or p.account_status<>'active'))
      or (p_status = 'admin' and a.user_id is not null)
      or (p_status = 'student' and a.user_id is null))
  order by p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 100))
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

create or replace function public.admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'students', (select count(*) from public.profiles p where not exists (select 1 from public.admin_users a where a.user_id = p.id)),
    'admins', (select count(*) from public.admin_users),
    'active_accounts', (select count(*) from public.profiles where account_status='active'),
    'online_users', (select count(distinct s.user_id) from public.user_sessions s join public.profiles p on p.id=s.user_id where s.expires_at > now() and s.ended_at is null and p.account_status='active'),
    'offline_users', (select count(*) from public.profiles p where p.account_status='active' and not exists (select 1 from public.user_sessions s where s.user_id=p.id and s.expires_at > now() and s.ended_at is null)),
    'suspended_users', (select count(*) from public.profiles where account_status='suspended'),
    'disabled_users', (select count(*) from public.profiles where account_status='disabled'),
    'new_today', (select count(*) from public.profiles where created_at >= date_trunc('day', now())),
    'new_this_month', (select count(*) from public.profiles where created_at >= date_trunc('month', now())),
    'active_today', (select count(distinct user_id) from public.user_sessions where last_seen_at >= now() - interval '24 hours')
  ) into result;
  return result;
end;
$$;

create or replace function public.admin_user_profile(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  select jsonb_build_object(
    'user', jsonb_build_object(
      'id', p.id, 'full_name', p.full_name, 'username', p.username, 'email', u.email,
      'avatar_url', p.avatar_url, 'grade', p.grade, 'account_status', p.account_status,
      'role', case when a.user_id is null then 'student' else 'admin' end,
      'created_at', p.created_at, 'last_sign_in_at', u.last_sign_in_at
    ),
    'metrics', jsonb_build_object(
      'coins_earned', coalesce(sum(e.coins) filter (where e.event_type='coins_earned'), 0),
      'current_level', greatest(p.current_level, 1 + ((count(*) filter (where e.event_type='quiz_completed')) / 5)::integer),
      'correct_answers', count(*) filter (where e.event_type='answer_correct'),
      'incorrect_answers', count(*) filter (where e.event_type='answer_incorrect'),
      'quizzes_attempted', count(*) filter (where e.event_type='quiz_attempted'),
      'quizzes_completed', count(*) filter (where e.event_type='quiz_completed'),
      'quests_completed', count(*) filter (where e.event_type='quest_completed'),
      'reading_completed', count(*) filter (where e.event_type='reading_completed'),
      'math_completed', count(*) filter (where e.event_type='math_completed'),
      'achievements', count(*) filter (where e.event_type='achievement_unlocked'),
      'basa_events', count(*) filter (where e.mode='basa'),
      'math_events', count(*) filter (where e.mode='math'),
      'average_score', avg(e.score) filter (where e.score is not null),
      'learning_seconds', coalesce(sum(e.duration_seconds), 0)
    ),
    'activity', coalesce((
      select jsonb_agg(to_jsonb(recent) order by recent.created_at desc)
      from (
        select event_type, mode, score, coins, duration_seconds, details, created_at
        from public.activity_events where user_id=p_user_id
        order by created_at desc limit 100
      ) recent
    ), '[]'::jsonb),
    'sessions', coalesce((
      select jsonb_agg(to_jsonb(recent_sessions) order by recent_sessions.started_at desc)
      from (
        select started_at, last_seen_at, expires_at, ended_at
        from public.user_sessions where user_id=p_user_id
        order by started_at desc limit 20
      ) recent_sessions
    ), '[]'::jsonb)
  ) into result
  from public.profiles p
  join auth.users u on u.id=p.id
  left join public.admin_users a on a.user_id=p.id
  left join public.activity_events e on e.user_id=p.id
  where p.id=p_user_id
  group by p.id, u.id, a.user_id;
  return result;
end;
$$;

create or replace function public.admin_list_activity(
  p_user_id uuid default null,
  p_event_type text default null,
  p_since timestamptz default now() - interval '30 days',
  p_limit integer default 100
)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  return query
  select jsonb_build_object(
    'id', e.id, 'user_id', e.user_id, 'full_name', p.full_name,
    'event_type', e.event_type, 'mode', e.mode, 'score', e.score,
    'coins', e.coins, 'duration_seconds', e.duration_seconds,
    'details', e.details, 'created_at', e.created_at
  )
  from public.activity_events e join public.profiles p on p.id=e.user_id
  where (p_user_id is null or e.user_id=p_user_id)
    and (p_event_type is null or e.event_type=p_event_type)
    and e.created_at >= coalesce(p_since, now() - interval '30 days')
  order by e.created_at desc limit greatest(1, least(coalesce(p_limit, 100), 500));
end;
$$;

create or replace function public.admin_analytics(p_since timestamptz default now() - interval '30 days')
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  select jsonb_build_object(
    'registrations', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'count', d.count) order by d.day)
      from (
        select date_trunc('day', created_at)::date as day, count(*)::int as count
        from public.profiles where created_at >= coalesce(p_since, now() - interval '30 days')
        group by 1
      ) d
    ), '[]'::jsonb),
    'daily_active', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'count', d.count) order by d.day)
      from (
        select date_trunc('day', last_seen_at)::date as day, count(distinct user_id)::int as count
        from public.user_sessions where last_seen_at >= coalesce(p_since, now() - interval '30 days')
        group by 1
      ) d
    ), '[]'::jsonb),
    'monthly_active', coalesce((
      select jsonb_agg(jsonb_build_object('month', m.month, 'count', m.count) order by m.month)
      from (
        select date_trunc('month', last_seen_at)::date as month, count(distinct user_id)::int as count
        from public.user_sessions where last_seen_at >= coalesce(p_since, now() - interval '30 days')
        group by 1
      ) m
    ), '[]'::jsonb),
    'learning', coalesce((
      select jsonb_agg(jsonb_build_object('event_type', x.event_type, 'mode', x.mode, 'count', x.count))
      from (
        select event_type, mode, count(*)::int as count from public.activity_events
        where created_at >= coalesce(p_since, now() - interval '30 days')
        group by event_type, mode
      ) x
    ), '[]'::jsonb),
    'average_score', (select avg(score) from public.activity_events where score is not null and created_at >= coalesce(p_since, now() - interval '30 days')),
    'most_active', coalesce((
      select jsonb_agg(to_jsonb(x)) from (
        select p.id, p.full_name, count(e.id)::int as events
        from public.profiles p join public.activity_events e on e.user_id=p.id
        where e.created_at >= coalesce(p_since, now() - interval '30 days')
        group by p.id order by count(e.id) desc limit 10
      ) x
    ), '[]'::jsonb),
    'top_quizzes', coalesce((
      select jsonb_agg(to_jsonb(x)) from (
        select p.id, p.full_name, count(*)::int as completed
        from public.profiles p join public.activity_events e on e.user_id=p.id
        where e.event_type='quiz_completed' and e.created_at >= coalesce(p_since, now() - interval '30 days')
        group by p.id order by count(*) desc limit 10
      ) x
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

create or replace function public.admin_list_audit_logs(
  p_since timestamptz default now() - interval '90 days',
  p_limit integer default 200
)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  return query
  select jsonb_build_object(
    'id', l.id, 'admin_id', l.admin_id, 'admin_email', u.email,
    'affected_user_id', l.affected_user_id, 'action', l.action,
    'previous_values', l.previous_values, 'updated_values', l.updated_values,
    'created_at', l.created_at
  )
  from public.admin_audit_logs l left join auth.users u on u.id=l.admin_id
  where l.created_at >= coalesce(p_since, now() - interval '90 days')
  order by l.created_at desc limit greatest(1, least(coalesce(p_limit, 200), 500));
end;
$$;

create or replace function public.admin_set_account_status(p_user_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare old_status text;
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  if p_status not in ('active', 'suspended', 'disabled') then raise exception 'Invalid account status'; end if;
  select account_status into old_status from public.profiles where id=p_user_id for update;
  if old_status is null then raise exception 'Account not found'; end if;
  if exists (select 1 from public.admin_users where user_id=p_user_id) and p_status <> 'active' then
    raise exception 'Administrator accounts cannot be disabled from this action';
  end if;
  update public.profiles set account_status=p_status, updated_at=now() where id=p_user_id;
  if old_status <> p_status then
    insert into public.admin_audit_logs (admin_id, affected_user_id, action, previous_values, updated_values)
    values (auth.uid(), p_user_id, 'account_status_changed',
      jsonb_build_object('account_status', old_status),
      jsonb_build_object('account_status', p_status));
    insert into public.activity_events (user_id, event_type)
    values (p_user_id, case p_status
      when 'suspended' then 'account_suspended'
      when 'disabled' then 'account_disabled'
      else 'account_reactivated' end);
  end if;
end;
$$;

create or replace function public.admin_notifications(p_limit integer default 50)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  return query
  select events.event from (
    select jsonb_build_object(
    'id', e.id, 'user_id', e.user_id, 'full_name', p.full_name,
    'event_type', e.event_type, 'created_at', e.created_at
    ) as event, e.created_at as occurred_at
    from public.activity_events e join public.profiles p on p.id=e.user_id
    where e.event_type in ('registration', 'account_suspended', 'account_reactivated',
        'account_disabled', 'password_reset_requested')
    union all
    select jsonb_build_object(
      'id', l.id, 'user_id', l.affected_user_id, 'admin_email', u.email,
      'event_type', l.action, 'created_at', l.created_at
    ) as event, l.created_at as occurred_at
    from public.admin_audit_logs l left join auth.users u on u.id=l.admin_id
    where l.action='administrator_granted'
  ) events
  order by events.occurred_at desc limit greatest(1, least(coalesce(p_limit, 50), 200));
end;
$$;

create or replace function public.admin_update_profile(
  p_user_id uuid,
  p_full_name text,
  p_username text,
  p_avatar_url text,
  p_grade text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare old_profile jsonb;
begin
  if not private.is_admin() then raise exception 'Administrator access required'; end if;
  select jsonb_build_object('full_name', full_name, 'username', username, 'avatar_url', avatar_url, 'grade', grade)
    into old_profile from public.profiles where id=p_user_id for update;
  if old_profile is null then raise exception 'Account not found'; end if;
  update public.profiles set
    full_name=left(coalesce(p_full_name, ''), 120),
    username=nullif(left(lower(trim(coalesce(p_username, ''))), 32), ''),
    avatar_url=nullif(left(coalesce(p_avatar_url, ''), 2048), ''),
    grade=case when p_grade in ('Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12') then p_grade else null end,
    updated_at=now()
  where id=p_user_id;
  insert into public.admin_audit_logs (admin_id, affected_user_id, action, previous_values, updated_values)
  values (auth.uid(), p_user_id, 'profile_updated', old_profile,
    jsonb_build_object('full_name', left(coalesce(p_full_name, ''), 120),
      'username', nullif(left(lower(trim(coalesce(p_username, ''))), 32), ''),
      'avatar_url', nullif(left(coalesce(p_avatar_url, ''), 2048), ''),
      'grade', case when p_grade in ('Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12') then p_grade else null end));
end;
$$;

revoke all on function public.heartbeat_session(uuid) from public, anon;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.audit_admin_grant() from public, anon, authenticated;
revoke all on function public.end_session(uuid) from public, anon;
revoke all on function public.record_learning_event(text,text,numeric,integer,integer,jsonb) from public, anon;
revoke all on function public.admin_list_users(text,text,integer,integer) from public, anon;
revoke all on function public.admin_dashboard_summary() from public, anon;
revoke all on function public.admin_user_profile(uuid) from public, anon;
revoke all on function public.admin_list_activity(uuid,text,timestamptz,integer) from public, anon;
revoke all on function public.admin_analytics(timestamptz) from public, anon;
revoke all on function public.admin_list_audit_logs(timestamptz,integer) from public, anon;
revoke all on function public.admin_set_account_status(uuid,text) from public, anon;
revoke all on function public.admin_notifications(integer) from public, anon;
revoke all on function public.admin_update_profile(uuid,text,text,text,text) from public, anon;
grant execute on function public.heartbeat_session(uuid) to authenticated;
grant execute on function public.end_session(uuid) to authenticated;
grant execute on function public.record_learning_event(text,text,numeric,integer,integer,jsonb) to authenticated;
grant execute on function public.admin_list_users(text,text,integer,integer) to authenticated;
grant execute on function public.admin_dashboard_summary() to authenticated;
grant execute on function public.admin_user_profile(uuid) to authenticated;
grant execute on function public.admin_list_activity(uuid,text,timestamptz,integer) to authenticated;
grant execute on function public.admin_analytics(timestamptz) to authenticated;
grant execute on function public.admin_list_audit_logs(timestamptz,integer) to authenticated;
grant execute on function public.admin_set_account_status(uuid,text) to authenticated;
grant execute on function public.admin_notifications(integer) to authenticated;
grant execute on function public.admin_update_profile(uuid,text,text,text,text) to authenticated;
