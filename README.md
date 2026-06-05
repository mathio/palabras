# palabras

Mobile-first Spanish vocabulary learning app. Daily word batches, swipe-driven exposure, multiple-choice quiz, lightweight spaced repetition.

**Live:** https://mathio.github.io/palabras/

## How it works

Each session has three phases:

1. **Exposure** — swipe cards showing a Spanish word and example sentence. Swipe right (or tap *know it*) if you recognise it; swipe left (or tap *no idea*) to reveal the translation before dismissing.
2. **Quiz** — all words from the batch as multiple choice. Each card is randomly either ES → EN or EN → ES. Tap an answer for instant feedback; the card auto-advances after 1.2 s.
3. **Results** — score and list of words to review.

Progress is saved to `localStorage`. Words resurface based on a simple spaced-repetition schedule: pass → interval doubles (2, 4, 8 … days); fail → back tomorrow. Words with 5 consecutive passes are considered learned.

You can do as many sessions per day as you like. Once due and new words run out, the batch fills with the words soonest coming up for review.

## Running locally

```bash
pnpm install
pnpm dev
```

## Word data

Words live in [`src/data/words.ts`](src/data/words.ts) as a plain TypeScript array — no database needed. Each entry:

```ts
{ id, spanish, english, level: 'A0' | 'A1' | 'A2', example }
```

`example` is a Spanish sentence using the word.

## Icons

Word icons are sourced from [Thiings](https://www.thiings.co/) under their non-commercial license. Icons are stored locally in `public/icons/` and referenced in `src/data/icons.ts`. Icons are 256×256 PNG. When adding new words that need icons:

1. Browse and download the icon PNG from [thiings.co](https://www.thiings.co/)
2. Resize to 256×256 using `sips` (built-in on macOS):
   ```bash
   sips -z 256 256 icon.png --out public/icons/<word-id>.png
   ```
3. Add the entry to `src/data/icons.ts`: `'<word-id>': \`${base}icons/<word-id>.png\``

`scripts/download-icons.sh` automates fetching and resizing by slug name — see the script for the mapping pattern.

Always download icons locally — never reference thiings.co URLs directly.

## Deploy

Pushes to `main` deploy automatically to GitHub Pages via the workflow in `.github/workflows/deploy.yml`. Enable Pages under **Settings → Pages → Source → GitHub Actions** on first use.

## Credits

- Icons: [Thiings](https://www.thiings.co/) (non-commercial license)
