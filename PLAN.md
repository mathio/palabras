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

## Batch selection

1. Collect all words where `nextReview <= today` (resurfaced words), lowest streak first
2. Fill remaining slots with new words (never seen), ordered by level (A0 → A1 → A2)
3. If still short of batch size, fill with non-learned words soonest due next — enables unlimited sessions per day
4. Target batch size: 15 words (configurable constant)
5. At least 50% of the batch must be new words (when available)

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
    icons.ts                  # word icon map (thiings.co PNGs)
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
- [x] Vite + Vue 3 + TypeScript project setup
- [x] Pinia, Vue Router installed
- [x] `words.ts` with seed words (A0/A1/A2)
- [x] Progress store with localStorage persistence
- [x] Session store

### Phase 2 — exposure pass
- [x] `SwipeCard.vue` with gesture handling
- [x] `ExposureView.vue` — card stack, records know/don't-know flags
- [x] Progress bar component

### Phase 3 — quiz pass
- [x] Distractor selection logic (same-level words, no duplicates)
- [x] `QuizCard.vue` — tap to answer, immediate feedback
- [x] `QuizView.vue` — iterates through all batch words

### Phase 4 — results + SRS
- [x] `ResultsView.vue`
- [x] SRS update logic on session complete
- [x] Daily batch selection logic
- [x] `HomeView.vue` — shows today's word count, start button

### Phase 5 — polish
- [x] Smooth swipe animations (spring-like snap-back)
- [x] Transition animations between views
- [x] Mobile viewport fixes (safe area, no scroll bounce)
- [x] Empty state (all words learned, nothing due today)
- [x] iOS PWA cancel button fix, prevent pinch-zoom

---

## Shipped (post-plan)

- [x] 50/50 ES→EN and EN→ES quiz directions
- [x] Category-aware distractor selection (numbers vs numbers, days vs days, etc.)
- [x] Unlimited sessions per day (batch fills from soonest-due words)
- [x] **868 words** across 35+ topic categories, cross-referenced against DELE A0/A1/A2 reference lists
- [x] GitHub Actions deploy to GitHub Pages
- [x] Completed batch counter (localStorage)
- [x] Word icons from thiings.co — every word has an illustrated icon (256×256 PNG)
- [x] `scripts/download-icons.sh` — automated icon fetching and resizing tool
- [x] Seasons, geography, comparatives, documents, nationalities, ordinals, civic/society categories
- [x] Daily routine reflexive verbs, professions, greetings, time units, basic people words
- [x] `words.ts` comment documenting icon-add workflow for future contributors

---

## Next steps

### High impact — learning quality
- **Audio pronunciation** — tap word to hear it via Web Speech API (no backend needed). Essential for a language app. Especially valuable now the word set covers conversational phrases.
- **Smarter SRS** — replace 2^streak with SM-2 algorithm (Anki's algorithm). Adds ease factor per word; resurfaces at more optimal intervals. B1+ words will need longer intervals.
- **Contextual quiz** — show an example sentence with one word blanked, pick the missing word. Tests understanding in context rather than isolated translation.
- **Typing mode for A2** — once a word has been seen N times, switch from multiple-choice to free-text input. Much stronger retention for higher-level vocab.
- **Direction weighting** — learn which direction (ES→EN vs EN→ES) each user finds harder; weight the quiz mix accordingly per word.

### Motivation & progress
- **Daily streak counter** — days in a row with at least one completed batch. Show on home screen.
- **Per-level progress bars** — "A0: 100% · A1: 43% · A2: 12%" on home screen. Now meaningful with 868 words fully categorised.
- **Word mastery list** — browsable view of all words with status: new / learning / learned. Filterable by category and level.
- **Session results animation** — confetti or score animation on completion, especially for high scores.

### UX polish
- **Undo last swipe** — button to undo an accidental swipe during exposure.
- **Keyboard shortcuts** — arrow keys to swipe, 1–4 to select quiz answer (desktop use).
- **Light mode** — currently dark only.
- **PWA / installable** — `manifest.json` + service worker so the app installs to home screen and works fully offline.

### Content
- **User-added words** — simple form to add custom words/phrases stored in localStorage.
- **B1 word list** — next level once A2 is mastered (~500 more words). Topic areas: subjunctive triggers, imperfect vs preterite contrasts, idiomatic expressions.
- **Verb conjugation mode** — separate drill for conjugation tables (present, past, future). High-value for Spanish specifically. Could reuse the quiz card UI.
- **Phrase/sentence cards** — longer multi-word entries (idioms, collocations). `words.ts` already supports phrases; just needs a dedicated batch mode.

### Technical
- **Cloud sync** — magic-link auth + backend so progress survives device switches and storage clears. LocalStorage-only is fragile long-term.
- **Export/import progress** — simpler than cloud sync: let user download a JSON backup and restore it. One afternoon of work.
- **Category filtering on home** — let user choose which categories to focus a session on (e.g. "food only" or "verbs only").
