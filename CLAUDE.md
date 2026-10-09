# Project instructions

See `AGENTS.md` first: this Next.js version has breaking changes, read `node_modules/next/dist/docs/` before changing framework-level code.

## Documentation lives in the Obsidian vault (`vault/`)

Keep it current as part of every change, in the same piece of work:

- Changed design tokens, type or components: update `vault/02 Design System.md`, `vault/07 Components.md`.
- Changed animation: update `vault/03 Motion System.md`.
- Changed data layer, caching or routes: update `vault/04 Architecture.md`.
- Changed tables or fields: update `supabase/schema.sql` **and** `vault/05 Content Model.md`, `vault/06 Supabase Setup.md`.
- Made a trade-off: add an entry to `vault/09 Decisions.md`.
- Shipped something: add a line to `vault/11 Changelog.md` (newest first).
- Deferred or found a limitation: `vault/10 Backlog.md`.
- Ran checks: record results, and what was NOT verified, in `vault/08 Quality and Verification.md`.
- Bump `updated:` in the note's frontmatter and the status block in `vault/00 Home.md`.

Use `[[wikilinks]]` between notes.

## Ground rules

- Sample content is never presented as the author's travel history. Keep `is_sample` accurate and do not invent dates, social accounts or contact details.
- No scroll hijacking; respect `prefers-reduced-motion`; every photograph needs real alt text and reserved dimensions.
- The service-role key never goes in client code or a public env var.
- `supabase/seed.sql` is generated from `src/content/data/sample.ts` (`npm run seed:sql`); do not edit it by hand.
- Before calling work done: `npm run typecheck && npm run lint && npm run build`.
