-- My Postcards: database schema
--
-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor > New query > paste > Run).
-- It is idempotent: safe to run again, it will not drop or overwrite existing rows.
--
-- Design notes
--   * Every table is keyed by a human-readable `slug` (e.g. 'alpine-light'). Rows are easy to
--     create by hand in the Table Editor, and relations read naturally.
--   * The website only ever READS, using the public anon key. Row Level Security allows
--     SELECT on published rows and nothing else. Writes happen from the Supabase dashboard or
--     with the service-role key (see scripts/seed.mjs). Never expose the service-role key.
--   * Images live in Supabase Storage (bucket `postcards`) or any HTTPS URL. The row stores the
--     URL plus width/height so the site can reserve space and avoid layout shift.

begin;

-- Shared slug rule: lowercase words joined by single hyphens.
-- (Inlined per table so there is nothing else to maintain.)

create table if not exists public.destinations (
  slug         text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null,
  country      text not null,
  region       text,
  description  text not null default '',
  cover_src    text not null,
  cover_alt    text not null,
  cover_width  integer not null check (cover_width > 0),
  cover_height integer not null check (cover_height > 0),
  cover_color  text check (cover_color is null or cover_color ~ '^#[0-9a-fA-F]{6}$'),
  lat          double precision check (lat between -90 and 90),
  lng          double precision check (lng between -180 and 180),
  is_sample    boolean not null default false,
  published    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.trips (
  slug             text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title            text not null,
  summary          text not null,
  story            text,
  cover_src        text not null,
  cover_alt        text not null,
  cover_width      integer not null check (cover_width > 0),
  cover_height     integer not null check (cover_height > 0),
  cover_color      text check (cover_color is null or cover_color ~ '^#[0-9a-fA-F]{6}$'),
  destination_slug text references public.destinations (slug) on update cascade on delete set null,
  start_date       date,
  end_date         date,
  period_label     text,
  is_sample        boolean not null default false,
  featured         boolean not null default false,
  published        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.cafes (
  slug             text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name             text not null,
  city             text,
  country          text,
  neighborhood     text,
  destination_slug text references public.destinations (slug) on update cascade on delete set null,
  cover_src        text not null,
  cover_alt        text not null,
  cover_width      integer not null check (cover_width > 0),
  cover_height     integer not null check (cover_height > 0),
  cover_color      text check (cover_color is null or cover_color ~ '^#[0-9a-fA-F]{6}$'),
  vibe_tags        text[] not null default '{}',
  notes            text,
  favorite_order   text,
  is_sample        boolean not null default false,
  published        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.stories (
  slug                 text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title                text not null,
  subtitle             text,
  published_at         date,
  reading_time_minutes integer not null default 3 check (reading_time_minutes > 0),
  excerpt              text not null,
  -- Paragraphs separated by a blank line. A line starting with "## " is a subheading.
  body                 text not null,
  cover_src            text not null,
  cover_alt            text not null,
  cover_width          integer not null check (cover_width > 0),
  cover_height         integer not null check (cover_height > 0),
  cover_color          text check (cover_color is null or cover_color ~ '^#[0-9a-fA-F]{6}$'),
  trip_slug            text references public.trips (slug) on update cascade on delete set null,
  destination_slug     text references public.destinations (slug) on update cascade on delete set null,
  is_sample            boolean not null default false,
  featured             boolean not null default false,
  published            boolean not null default true,
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now()
);

create table if not exists public.postcards (
  slug             text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title            text not null,
  caption          text,
  -- The short handwritten message shown on the back of the card. Optional.
  note             text,
  image_src        text not null,
  image_alt        text not null,
  image_width      integer not null check (image_width > 0),
  image_height     integer not null check (image_height > 0),
  image_color      text check (image_color is null or image_color ~ '^#[0-9a-fA-F]{6}$'),
  category         text not null check (category in ('travel', 'city', 'cafe', 'food', 'getaway')),
  place_name       text,
  city             text,
  region           text,
  country          text,
  lat              double precision check (lat between -90 and 90),
  lng              double precision check (lng between -180 and 180),
  taken_on         date,
  -- For approximate dates, e.g. 'Late autumn 2024'. Shown when taken_on is empty.
  period_label     text,
  trip_slug        text references public.trips (slug) on update cascade on delete set null,
  destination_slug text references public.destinations (slug) on update cascade on delete set null,
  cafe_slug        text references public.cafes (slug) on update cascade on delete set null,
  story_slug       text references public.stories (slug) on update cascade on delete set null,
  tags             text[] not null default '{}',
  -- Optional: {"body":"Sony A7 IV","lens":"35mm f/1.4","focalLength":"35mm","aperture":"f/2.8","iso":200,"shutterSpeed":"1/250s"}
  camera           jsonb,
  credit           text,
  credit_url       text,
  is_sample        boolean not null default false,
  featured         boolean not null default false,
  published        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists postcards_trip_idx        on public.postcards (trip_slug);
create index if not exists postcards_destination_idx on public.postcards (destination_slug);
create index if not exists postcards_cafe_idx        on public.postcards (cafe_slug);
create index if not exists postcards_story_idx       on public.postcards (story_slug);
create index if not exists postcards_category_idx    on public.postcards (category);
create index if not exists trips_destination_idx     on public.trips (destination_slug);
create index if not exists stories_trip_idx          on public.stories (trip_slug);

-- Row Level Security: the public (anon) key can read published rows. It cannot write.
alter table public.destinations enable row level security;
alter table public.trips        enable row level security;
alter table public.cafes        enable row level security;
alter table public.stories      enable row level security;
alter table public.postcards    enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['destinations', 'trips', 'cafes', 'stories', 'postcards'] loop
    execute format('drop policy if exists "Public can read published %1$s" on public.%1$s', t);
    execute format(
      'create policy "Public can read published %1$s" on public.%1$s for select to anon, authenticated using (published)',
      t
    );
    -- Least privilege: read-only for the public roles.
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to anon, authenticated', t);
  end loop;
end
$$;

-- Storage bucket for your own photographs. Public read; uploads go through the dashboard or
-- the service-role key. After uploading, copy the object's public URL into image_src.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'postcards',
  'postcards',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

commit;
