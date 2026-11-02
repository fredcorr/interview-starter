@AGENTS.md

# Project conventions

Next.js (App Router) + TypeScript strict + Tailwind v4 + TanStack Query + Yup. Tests: Jest + React Testing Library.

## Commands

- `npm run dev` - dev server
- `npm run typecheck` - generate route types, then `tsc --noEmit`
- `npm run lint` - ESLint
- `npm test` - Jest
- `npm run build` - production build

Run typecheck, lint and test before calling a change done.

## App Router

- Routes live in `app/`. Use `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` by convention.
- **Server components by default.** Add `"use client"` only for state, effects, event handlers, browser APIs or client-only hooks (e.g. `useQuery`). Push the client boundary as far down the tree as possible.
- The root layout stays a server component. Client context lives in `app/providers.tsx` (TanStack Query).
- Fetch on the server where you can; use TanStack Query for client-side fetching, caching and mutations.

## Structure

- `components/atoms` - smallest building blocks (Button, Input)
- `components/molecules` - small compositions of atoms (FormField, SearchBar)
- `components/organisms` - larger sections (Header, a full form)
- `utils/` - helpers, kebab-case filenames (`format-date.ts`). `cn()` in `utils/cn.ts` merges classes.
- `types/` - shared interfaces used in more than one place. Component-only props stay with the component.
- `mocks/{atoms,molecules,organisms}` - mock data, mirroring the component level it serves.
- Tests sit next to the component: `Button.tsx` + `Button.test.tsx`.

## Rules

- **No `any`.** Use precise types, generics, or `unknown` plus narrowing. Infer form types from Yup with `yup.InferType<typeof schema>`.
- **Tokens, not raw values.** Use theme tokens from `app/globals.css` (`bg-primary`, `text-muted`), not hex codes or arbitrary values like `text-[#333]` / `p-[13px]`. Need a new value? Add a token.
- **Reuse before creating.** Check `components/` and `utils/` for something that already fits before adding a new component or helper. Extend with props or `className` (merged through `cn`) rather than copying.
- **Tests for new components.** Every new component gets a colocated RTL test that covers what it renders and its main interaction. Query by role and accessible name.
- Validate user input with Yup schemas, kept next to the form that uses them unless shared.
