# todo.

Personlig planner med oppgaver og vaner. Bygget med React, TypeScript og Vite, med Supabase for database og innlogging.

**Live:** https://juliewold.github.io/todolist/

## Funksjoner

- **Oppgaver:** I dag, Kommende, Alle oppgaver og Fullført. Dato, beskrivelse, kategori (liste), prioritet og egne lister med farge. Dra og slipp for å endre rekkefølge.
- **Habit Tracker:** Egne vaner med navn, ikon og fargetema. Årsoversikt med måneder som kolonner og dager som rader. Typer: ja/nei, varighet og mengde. Daglige eller ukentlige mål, streak, statistikk og månedsoversikt.
- **Øvrig:** Lys og mørk modus, synkronisering via Supabase, innlogging med e-post og passord, import og eksport av data (JSON).
- **PWA:** Kan legges til på hjemskjermen på iPhone og iPad.

## Teknologi

- React, TypeScript (strict), Vite
- Supabase (Postgres, Auth, Row Level Security)
- HashRouter, GitHub Pages
- Vitest og Testing Library, ESLint, Prettier
- GitHub Actions for CI og deploy
- Lucide-ikoner, Inter-font

## Arkitektur

```
src/
  domain/    ren forretningslogikk (datoer, vaner, statistikk, oppgavevalg) med tester
  data/      TodoRepository-grensesnitt, Supabase- og lokal implementasjon
  app/       providers, tjenester og oppkobling mot UI
  features/  sider og komponenter per område (tasks, habits, auth, lists, settings)
  components/ gjenbrukbare UI-komponenter
  layout/    app-skjelett med sidemeny (Mac/iPad) og bunnmeny (iPhone)
supabase/
  migrations/ databaseskjema og RLS-policyer
```

Databaseintegrasjonen ligger bak `TodoRepository`, slik at databasen kan flyttes til egen server senere uten endringer i UI.

## Kom i gang

Krav: Node.js 22 eller nyere.

```bash
npm install
npm run dev
```

Uten Supabase-variabler kjører appen i **lokal modus**: data lagres i nettleseren og synkroniseres ikke.

For å koble til Supabase, kopier `.env.example` til `.env.local` og fyll inn publishable/anon-nøkkelen:

```bash
cp .env.example .env.local
```

Bruk aldri `service_role`-nøkkelen i frontend eller i Git.

## Scripts

| Kommando               | Beskrivelse                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Starter utviklingsserver                 |
| `npm run build`        | Typesjekk og produksjonsbygg til `dist/` |
| `npm test`             | Kjører Vitest én gang                    |
| `npm run test:watch`   | Kjører Vitest i watch-modus              |
| `npm run lint`         | ESLint                                   |
| `npm run typecheck`    | TypeScript uten bygg                     |
| `npm run format`       | Prettier skriver om filer                |
| `npm run format:check` | Prettier sjekker formatering             |

## Supabase-oppsett

1. Opprett et gratis prosjekt i Supabase.
2. Kjør migrasjonene i `supabase/migrations/` i SQL-editoren, eller med Supabase CLI.
3. Under Authentication: slå av offentlig registrering, og opprett brukeren manuelt.
4. Legg publishable/anon-nøkkelen og URL-en i `.env.local` lokalt, og som GitHub-secrets `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` for deploy.

## Deploy

Push til `main` bygger og publiserer appen til GitHub Pages via `.github/workflows/deploy.yml`. Aktiver GitHub Pages under repository-innstillinger med kilden satt til **GitHub Actions**.

## Lisens

Privat prosjekt.
