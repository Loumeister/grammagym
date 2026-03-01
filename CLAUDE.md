# CLAUDE.md

## Project Overview

Zinsontledingstrainer - An interactive browser-based app that teaches Dutch sentence parsing (zinsontleding) to students aged 12-15 (onderbouw havo/vwo).

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- No backend - fully client-side
- localStorage for persistence

## Commands

- `npm run dev` - Start dev server (port 5173)
- `npm run build` - Production build (`tsc && vite build`)
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

## Architecture

```
App.tsx                    → Thin shell: routes between screens
hooks/useTrainer.ts        → Core state management and all business logic
screens/HomeScreen.tsx     → Configuration & session start UI
screens/TrainerScreen.tsx  → Active two-step parsing exercise
screens/ScoreScreen.tsx    → Session results & mistake analysis
components/
  ConfirmationModal.tsx    → Reusable confirmation dialog
  DropZone.tsx             → SentenceChunk drop target with validation
  WordChip.tsx             → DraggableRole tag component
  HelpModal.tsx            → Instructions overlay
constants.ts               → Sentence data, roles, feedback strings (91KB)
types.ts                   → TypeScript interfaces
```

## Key Concepts

- **Two-step parsing**: Step 1 (Verdelen/Split) → Step 2 (Benoemen/Label)
- **Roles**: 13 grammatical roles (PV, OW, LV, MV, BWB, VV, WG, NG, Bijzin, etc.)
- **Token**: A word in a sentence with a grammatical role
- **Chunk**: A group of consecutive tokens belonging to the same constituent
- **newChunk**: Flag on tokens to force split even when adjacent tokens share the same role
- **PlacementMap**: Record mapping token IDs to role keys (for chunk labels and sub-labels)

## Conventions

- All UI text is in Dutch
- Tailwind classes include dark mode variants (`dark:bg-...`, `dark:text-...`)
- Component files use PascalCase (e.g., `DropZone.tsx`)
- Hook files use camelCase with `use` prefix (e.g., `useTrainer.ts`)
- Screen files use PascalCase (e.g., `HomeScreen.tsx`)
- Drag-and-drop uses native HTML5 API (`dataTransfer.setData/getData`)
- No external state management library - React hooks only

## State Management

All application state lives in `hooks/useTrainer.ts`. The hook returns a `TrainerState` object that is passed to screen components. State categories:

1. **Config state**: difficulty level, predicate mode, focus filters, complexity filters
2. **Session state**: queue, index, stats, mistake tracking
3. **Trainer state**: current sentence, step, splits, labels, validation
4. **UI state**: dark mode, large font, help modal, confirmation dialogs

## Adding Sentences

Add to the `SENTENCES` array in `constants.ts`. Each sentence needs:
- Unique `id` and human-readable `label`
- `predicateType`: `'WG'` or `'NG'`
- `level`: 1 (Basis), 2 (Middel), 3 (Hoog), 4 (Samengesteld)
- `tokens[]`: words with `role` and optional `subRole`/`newChunk`

See README.md for detailed rules (especially the `newChunk` flag).

## Future Modules

The app is designed for modular expansion. See:
- `TODO.md` - Prioritized roadmap with scientific references
- `SPEC.md` - Full specification for werkwoordspelling, foutentekst, and peer-review modules
