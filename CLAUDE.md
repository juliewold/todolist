# CLAUDE.md

Permanente prosjektregler for **todo.** (personlig planner med oppgaver og vaner).

## Prosjekt

- React, TypeScript og Vite. Ingen andre rammeverk uten god grunn.
- Supabase for database og autentisering, GitHub Pages for hosting, HashRouter for navigasjon.
- PWA, slik at appen kan legges til på hjemskjermen på iPhone og iPad.
- Vitest, ESLint, Prettier og GitHub Actions.
- Lucide-ikoner. Font: Inter.

## Språk

- Brukergrensesnittet er på norsk (bokmål).
- Kildekode, kommentarer, variabelnavn og Git-meldinger er på engelsk.

## Arkitektur

- `src/domain`: ren forretningslogikk uten React eller nettverk. Skal være enhetstestet.
- `src/data`: `TodoRepository`-grensesnittet og implementasjoner (Supabase og lokal lagring).
  UI-kode skal aldri importere `@supabase/supabase-js` direkte. Unntak: `src/app/services.ts`,
  `src/features/auth` og `src/data/supabaseRepository.ts`.
- `src/app`: providers, tjenester og oppkobling mellom data og UI.
- `src/features/*`: sider og komponenter per funksjonsområde.
- `src/components`: gjenbrukbare UI-komponenter uten forretningslogikk.
- Databaseintegrasjonen skal holdes adskilt, slik at databasen kan flyttes til egen server senere.

## Sikkerhet

- Ingen hemmelige nøkler i Git eller i frontend. Bare Supabase publishable/anon-nøkkelen brukes i klienten.
- Aldri legg inn `service_role`-nøkler, passord eller tokens i kode, `.env`-filer som committes eller i dokumentasjon.
- Alle tabeller har RLS. Nye tabeller må få RLS og policies i en egen migrasjon før de tas i bruk.

## Kodekvalitet

- TypeScript i `strict`-modus. Ingen `any` uten begrunnelse.
- Gjenbrukbare komponenter og enkle løsninger. Ingen unødvendig kompleksitet.
- Relevante tester underveis. Ny domainlogikk skal ha tester.
- Før en endring regnes som ferdig: `npm run lint`, `npm run typecheck`, `npm test` og `npm run build` må være grønne.
- Prettier formaterer koden. Kjør `npm run format` før commit.

## Git

- Conventional Commits med passende scope, for eksempel `feat(habits): add streak statistics`.
- Én logisk endring per commit.
- Engelske commit-meldinger. Maksimalt 100 tegn per linje.
- Ingen unødvendige blanklinjer i commit body.
- Hold `main` grønn. Arbeid på egne branches. Pull requests åpnes og merges av Julie selv.
