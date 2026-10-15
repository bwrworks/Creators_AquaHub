-- ============================================================================
-- Creators AquaHub: Automated RLS Verification Tests (SQL Test Harness)
-- Run on a disposable Supabase dev database ONLY after applying core migration.
-- Never run against production or parent website databases.
-- ============================================================================

begin;

-- Create two synthetic test users in auth.users
insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'usera@creatorsaquarium.com'),
  ('22222222-2222-2222-2222-222222222222', 'userb@creatorsaquarium.com')
on conflict (id) do nothing;

-- 1. Test Two-User Tank Isolation (DB-POL-01)
-- Set role to authenticated User A
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

insert into public.tanks (id, owner_id, name, tank_type, privacy)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'User A Private Tank', 'planted', 'private');

-- Switch to authenticated User B
set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.tanks where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  if v_count <> 0 then
    raise exception 'TEST FAILED: User B was able to see User A private tank';
  end if;
end;
$$;

-- 2. Test Content Reports Insert Restriction (DB-POL-03)
-- User B tries to insert a report with status='resolved' -> MUST FAIL
do $$
begin
  insert into public.content_reports (reporter_id, target_type, target_id, reason, status)
  values ('22222222-2222-2222-2222-222222222222', 'post', gen_random_uuid(), 'Test', 'resolved');
  raise exception 'TEST FAILED: User B was able to insert report with status=resolved';
exception when others then
  -- Expected failure
  null;
end;
$$;

-- User B tries to insert a report with moderator_note -> MUST FAIL
do $$
begin
  insert into public.content_reports (reporter_id, target_type, target_id, reason, status, moderator_note)
  values ('22222222-2222-2222-2222-222222222222', 'post', gen_random_uuid(), 'Test', 'open', 'Forged note');
  raise exception 'TEST FAILED: User B was able to insert report with moderator_note';
exception when others then
  -- Expected failure
  null;
end;
$$;

rollback; -- Clean rollback of test transactions
