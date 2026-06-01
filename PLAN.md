# Palabras — Build Plan

## What we're building

A mobile-first Spanish vocabulary learning web app. Daily batches of words, swipe-driven exposure, multiple-choice quiz, lightweight spaced repetition.

---

## Tech stack

- Vue 3 + TypeScript + Vite
- Pinia (state management)
- localStorage (IndexedDB only if storage grows large)
- Pointer events + CSS transforms for swipe gestures (no external gesture lib)

---

## Word data

Static TypeScript file (`src/data/words.ts`). Structure:

```ts
interface Word {
  id: string;
  spanish: string;
  english: string;
  level: "A0" | "A1" | "A2";
  example: string; // Spanish sentence using the word
}
```

Words to be populated later. Seed with ~30 placeholder words across levels to develop against.

---

## Data model (localStorage)

```ts
interface WordProgress {
  wordId: string;
  streak: number; // consecutive correct quiz answers
  nextReview: string; // ISO date — when to resurface
  lastResult: "pass" | "fail" | null;
}

interface SessionRecord {
  date: string; // YYYY-MM-DD
  wordIds: string[];
  exposureFlags: Record<string, "know" | "dont-know">;
  quizResults: Record<string, "pass" | "fail">;
  completed: boolean;
}
```

---

## SRS algorithm (lightweight)

After each quiz:

| Result | Streak     | Next review                           |
| ------ | ---------- | ------------------------------------- |
| Pass   | +1         | `2 ^ streak` days (1, 2, 4, 8, 16...) |
| Fail   | reset to 0 | 1 day                                 |

Exposure flag from phase 1 influences initial weight:

- Swiped "don't know" + failed quiz → resurface daily until streak ≥ 1
- Swiped "know" + failed quiz → normal fail path (1 day)

Words with streak ≥ 5 are considered "learned" and resurface rarely (every 30 days).

---

## Daily batch selection

1. Collect all words where `nextReview <= today` (resurfaced words)
2. Fill remaining slots with new words (never seen), ordered by level (A0 → A1 → A2)
3. Target batch size: 10–20 words (configurable constant)
4. If resurfaced words exceed batch size, prioritize lowest streak
5. Always make sure at least 50% of the words in batch are new

---

## Session flow

```
Home screen
  └─ "Start today's session" button
       └─ Exposure pass (swipe cards)
            └─ Quiz pass (multiple choice, all batch words)
                 └─ Results screen
```

### Phase 1: Exposure pass

- Full-screen swipe card: Spanish word (large) + English translation + Spanish example sentence
- Swipe right → "know it" (green flash)
- Swipe left → "don't know it" (red flash)
- Tap card → no action (not a flip card)
- Progress bar at top (card N of total)
- Can also tap left/right buttons as fallback (accessibility)

### Phase 2: Quiz pass

- All words from the batch, shuffled
- Show Spanish word + example sentence
- 4–6 multiple choice options (English translations)
  - 1 correct answer
  - Distractors pulled from same level words (A0 with A0, etc.)
- Tap to select → immediate feedback (green = correct, red = wrong + show correct answer)
- No swiping — tap only
- Progress bar at top

### Phase 3: Results screen

- Score: X / Y correct
- List of failed words with their translations
- "Done for today" — saves session, updates SRS data

---

## Component architecture

```
src/
  data/
    words.ts                  # static word list
  stores/
    progress.ts               # Pinia: SRS state, localStorage persistence
    session.ts                # Pinia: current session state
  components/
    SwipeCard.vue             # swipeable card with gesture handling
    QuizCard.vue              # multiple choice question card
    ProgressBar.vue           # top progress indicator
    ResultsList.vue           # failed words summary
  views/
    HomeView.vue              # start screen
    ExposureView.vue          # phase 1: swipe through cards
    QuizView.vue              # phase 2: multiple choice
    ResultsView.vue           # phase 3: results
  router/
    index.ts
  App.vue
  main.ts
```

---

## Swipe gesture implementation

Use `pointer events` directly — no library needed:

1. `pointerdown` → record start X
2. `pointermove` → translate card + rotate slightly (CSS transform)
3. `pointerup` → if delta X > threshold (80px) → commit swipe, else snap back
4. CSS transition on snap-back only (not during drag)

---

## Build phases

### Phase 1 — scaffold + data

- [ ] Vite + Vue 3 + TypeScript project setup
- [ ] Pinia, Vue Router installed
- [ ] `words.ts` with ~30 seed words (A0/A1/A2)
- [ ] Progress store with localStorage persistence
- [ ] Session store

### Phase 2 — exposure pass

- [ ] `SwipeCard.vue` with gesture handling
- [ ] `ExposureView.vue` — card stack, records know/don't-know flags
- [ ] Progress bar component

### Phase 3 — quiz pass

- [ ] Distractor selection logic (same-level words, no duplicates)
- [ ] `QuizCard.vue` — tap to answer, immediate feedback
- [ ] `QuizView.vue` — iterates through all batch words

### Phase 4 — results + SRS

- [ ] `ResultsView.vue`
- [ ] SRS update logic on session complete
- [ ] Daily batch selection logic
- [ ] `HomeView.vue` — shows today's word count, start button

### Phase 5 — polish

- [ ] Smooth swipe animations (spring-like snap-back)
- [ ] Transition animations between views
- [ ] Mobile viewport fixes (safe area, no scroll bounce)
- [ ] Empty state (all words learned, nothing due today)
