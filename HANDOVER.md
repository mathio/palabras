# Palabras — Agent Handover

## What this app is

A mobile-first Spanish/English vocab flashcard PWA. Users swipe through a daily batch of words (exposure phase), then get quizzed (quiz phase), and see results. Spaced-repetition progress is stored in localStorage; a sync code (base64) lets users move progress between devices.

## Architecture in brief

```
src/
  data/
    words-en-es.ts    # Spanish word list (learning Spanish from English)
    words-sk-en.ts    # English word list (learning English from Slovak)
    languages.ts      # LANGUAGE_PAIRS config + LanguagePair interface
    icons.ts          # emoji icon map keyed by word id
  stores/
    language.ts       # active language pair (persisted to localStorage)
    session.ts        # daily batch, phases (exposure→quiz→results), persistence
    progress.ts       # per-word SRS state (streak, nextReview, seen/learned flags)
  views/
    HomeView.vue      # landing: start/continue session, stats, lang switcher
    ExposureView.vue  # swipe cards (SwipeCard.vue)
    QuizView.vue      # quiz cards (QuizCard.vue / ContextualQuizCard.vue)
    ResultsView.vue   # end-of-session summary
  components/
    SwipeCard.vue     # exposure swipe UI
    QuizCard.vue      # multiple-choice or type-in quiz card
    ContextualQuizCard.vue  # fill-in-the-blank variant
    SyncPanel.vue     # language switcher + import/export sync code
```

## Word data schema

```ts
interface Word {
  id: string        // stable, e.g. 'a0-001', 'tener-003'
  word: string      // the language being learned (Spanish for ES, English for EN-SK)
  translation: string  // the learner's native language (English for ES, Slovak for EN-SK)
  level: 'A0' | 'A1' | 'A2'
  example: string   // sentence in the language being learned
}
```

`translation` was renamed from `english` in this session to be language-agnostic.

## Language pairs

| id      | learning | from   | sourceName |
|---------|----------|--------|------------|
| `es-en` | Spanish  | English | "Spanish" |
| `en-sk` | English  | Slovak  | "English"  |

`sourceName` = the language being learned (shown in UI as "learn spanish" / "learn english").

## Session lifecycle

1. `HomeView` mounts → calls `session.startSession()`
2. `startSession()` restores localStorage save for the active pair (same day, incomplete) or builds a fresh batch via `buildBatch()`
3. Language switch (`lang.setPair(id)`) triggers a `watch` in session store that resets state and immediately calls `startSession()` for the new pair
4. Phases: `idle` → `exposure` → `quiz` → `results`
5. Batch size and new-word ratio constants are at the top of `session.ts`

## Recent changes (this session)

- **Renamed `Word.english` → `Word.translation`** across all files (data, components, views, stores)
- **Renamed data files**: `words.ts` → `words-en-es.ts`, `words-sk.ts` → `words-sk-en.ts`
- **Fixed words-sk-en.ts examples**: were in Slovak, now in English (~868 entries)
- **Language switch now rebuilds session**: session store watch calls `startSession()` so "all done" never flashes after switching
- **SyncPanel closes immediately on language select** (was staying open)
- **Subtitle simplified**: HomeView shows "learn spanish" / "learn english" (dropped "· with english")

## Known sharp edges

- `SyncPanel.vue` handles both language switching and progress sync (copy/paste code). These are unrelated concerns in one component.
- `progress.ts` stores all pairs' progress in one localStorage key — switching languages does not reset progress for the previous pair.
- `words-sk-en.ts` is not under git tracking yet (was created as a new file, not `git mv`).

## Stack

Vue 3 + Vite + Pinia + TypeScript. No component library. Router: hash mode (`vue-router`). Package manager: pnpm.
