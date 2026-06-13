# CLAUDE.md

## TIER 1: HARD RULES — Never Skip These

### Before writing any code, you MUST

1. Enter plan mode and read the relevant files first
2. State what files will change and why
3. Get confirmation before proceeding if the change touches more than 2 files

### Before committing, you MUST

1. Run `npm run lint` — fix all errors, do not suppress them
2. Run `npm test` — all tests must pass
3. If you added a feature, add a test for it first

---

## Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript — no `any`, ever
- **Styling**: Tailwind
- **Component Library**: ShadCN
- **Testing**: Jest
- **Linting**: ESLint + Prettier — enforced, not optional

---

## Workflow

- **Plan before coding.** For any change touching more than one file, use plan mode first. State your approach and wait.
- **Small diffs.** One feature or fix per session. Do not refactor unrelated code while implementing something.
- **TDD where possible.** Write the failing test first, commit it, then implement.
- **Do not modify tests to make them pass.** Fix the implementation instead.

---

## Code Style

- Use ES modules (`import/export`), not CommonJS (`require`)
- Named exports only — no default exports
- Strict TypeScript — no `any`, no `@ts-ignore` without a comment explaining why
- Prettier handles formatting — do not manually format; run `npm run format` if needed
- Follow patterns already in the codebase. Look before you invent.

---

## Next.js Conventions

- Use the App Router (`/app` directory), not Pages Router
- Server Components by default — add `"use client"` only when necessary
- API routes live in `/app/api/` — keep them thin, logic goes in `/lib/`
- Do not fetch data in client components if it can be done in a Server Component

---

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build — run this to catch type errors
npm run lint      # ESLint check
npm run format    # Prettier format
npm test          # Run Jest test suite
npm test:watch        # Watch mode for TDD
```

---

## What NOT to Do

- Do not install new dependencies without asking first
- Do not create new utility files if something similar already exists
- Do not leave `console.log` in committed code
- Do not skip tests under time pressure — flag it instead
