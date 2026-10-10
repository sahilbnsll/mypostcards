-- My Postcards: the guest desk (visitor cards)
--
-- The journal itself (postcards, trips, places, cafés, stories) lives in the repository, in
-- content/ and public/images/. Supabase holds only what visitors leave: cards they write or draw.
--
-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor > New query > paste > Run).
-- It is idempotent: safe to run again, it never drops or overwrites existing rows.
--
-- Safety model
--   * Visitors cannot touch the table. The only way in is submit_visitor_card(), which validates
--     everything again, rate limits, and always stores the card as NOT approved.
--   * The public (anon) key can read only APPROVED cards, and only the public columns. The hashed
--     visitor fingerprint (ip_hash) is never readable by it.
--   * You moderate in the dashboard: Table Editor > visitor_cards > tick "approved" on the cards
--     you want on the wall. Tick "pinned" to keep one at the top. Delete the ones you do not want.
--   * The site never needs the service-role key. Do not put it in Vercel.

begin;

create table if not exists public.visitor_cards (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- hello: a greeting · place: somewhere I should go · feedback: about the site · other
  kind       text not null check (kind in ('hello', 'place', 'feedback', 'other')),
  name       text check (name is null or char_length(name) between 1 and 40),
  message    text check (message is null or char_length(message) between 1 and 280),

  -- A drawing is a list of strokes: [{"c":"ink","w":6,"p":[[x,y],[x,y],...]}, ...]
  -- on a 1000 x 600 canvas. Colours and widths are names and numbers, never raw CSS.
  drawing    jsonb check (
    drawing is null or (
      jsonb_typeof(drawing) = 'array'
      and jsonb_array_length(drawing) between 1 and 60
      and pg_column_size(drawing) <= 24000
    )
  ),

  color      text not null default 'paper' check (color in ('paper', 'sky', 'rose', 'sun', 'mint')),

  approved   boolean not null default false,
  pinned     boolean not null default false,

  -- sha256 of (visitor address + secret + today's date). Used only to limit spam; it changes
  -- every day, so it cannot be used to follow anyone over time. Never exposed publicly.
  ip_hash    text,

  check (message is not null or drawing is not null)
);

create index if not exists visitor_cards_wall_idx on public.visitor_cards (approved, pinned desc, created_at desc);
create index if not exists visitor_cards_ip_idx   on public.visitor_cards (ip_hash, created_at);

alter table public.visitor_cards enable row level security;

-- Public read: approved rows only, public columns only.
drop policy if exists "Public can read approved visitor cards" on public.visitor_cards;
create policy "Public can read approved visitor cards"
  on public.visitor_cards for select
  to anon, authenticated
  using (approved);

revoke all on public.visitor_cards from anon, authenticated;
grant select (id, created_at, kind, name, message, drawing, color, pinned)
  on public.visitor_cards to anon, authenticated;

-- The only way to add a card. SECURITY DEFINER so it can insert although visitors cannot; it
-- therefore validates by itself and pins its search_path.
create or replace function public.submit_visitor_card(
  p_kind    text,
  p_name    text,
  p_message text,
  p_drawing jsonb,
  p_color   text,
  p_ip_hash text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  p_name    := nullif(btrim(p_name), '');
  p_message := nullif(btrim(p_message), '');

  if p_message is null and p_drawing is null then
    raise exception 'empty_card';
  end if;

  -- A drawing must look like what the site produces: known colours, bounded stroke length.
  if p_drawing is not null then
    if jsonb_typeof(p_drawing) <> 'array' then
      raise exception 'bad_drawing';
    end if;
    if exists (
      select 1
      from jsonb_array_elements(p_drawing) as stroke
      where jsonb_typeof(stroke) <> 'object'
         or coalesce(stroke ->> 'c', '') <> all (array['ink', 'blue', 'red'])
         or jsonb_typeof(stroke -> 'p') <> 'array'
         or jsonb_array_length(stroke -> 'p') > 400
    ) then
      raise exception 'bad_drawing';
    end if;
  end if;

  -- Limits: the whole desk, then each visitor.
  if (select count(*) from public.visitor_cards where created_at > now() - interval '1 hour') >= 40 then
    raise exception 'busy';
  end if;
  if p_ip_hash is not null and (
    (select count(*) from public.visitor_cards where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= 3
    or (select count(*) from public.visitor_cards where ip_hash = p_ip_hash and created_at > now() - interval '1 day') >= 8
  ) then
    raise exception 'rate_limited';
  end if;

  -- Always unapproved. The table's own checks validate lengths and the kind.
  insert into public.visitor_cards (kind, name, message, drawing, color, approved, pinned, ip_hash)
  values (p_kind, p_name, p_message, p_drawing, coalesce(p_color, 'paper'), false, false, p_ip_hash);
end;
$$;

revoke all on function public.submit_visitor_card(text, text, text, jsonb, text, text) from public;
grant execute on function public.submit_visitor_card(text, text, text, jsonb, text, text) to anon, authenticated;

commit;

-- ---------------------------------------------------------------------------------------------
-- Optional cleanup. If you ran an EARLIER version of this file that created the journal tables
-- (postcards, trips, destinations, cafes, stories) and a 'postcards' storage bucket, and you do
-- not need them any more, uncomment and run this. It deletes those tables and everything in them.
--
-- drop table if exists public.postcards, public.stories, public.cafes, public.trips, public.destinations cascade;
--
-- Supabase does not allow deleting storage rows with SQL. To remove the old 'postcards' bucket,
-- use Dashboard > Storage > postcards > Delete bucket.
