-- Day 10: job queue claim function — master plan §2.5.
-- supabase-js has no raw multi-statement/locking API, so FOR UPDATE SKIP LOCKED
-- lives in a plpgsql function the worker calls via rpc().

create or replace function claim_scan_job()
returns scan_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  job scan_jobs;
begin
  update scan_jobs
  set status = 'running', attempts = attempts + 1, started_at = now()
  where id = (
    select id from scan_jobs
    where status = 'queued' and scheduled_for = current_date
    order by id
    for update skip locked
    limit 1
  )
  returning * into job;
  return job;
end;
$$;

-- Worker only: runs with the service-role key, which bypasses RLS but not
-- function-level grants, so lock this down explicitly.
revoke all on function claim_scan_job() from public;
grant execute on function claim_scan_job() to service_role;
