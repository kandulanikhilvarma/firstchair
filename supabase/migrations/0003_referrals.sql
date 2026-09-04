-- Referral tracking: tag an incoming free-audit lead with the referrer's code
-- (the referring workspace id, passed as ?ref=). Nullable and free-text — it is
-- only ever stored and read back for the founder to honour a referral manually
-- via a Stripe promotion code; nothing authorises off it.
alter table audit_leads add column if not exists referred_by text;

-- Find a referrer's leads quickly when reconciling credits.
create index if not exists audit_leads_referred_by_idx
  on audit_leads (referred_by)
  where referred_by is not null;
