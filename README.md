# Furaha A1 — Learn German A1 (English + Swahili)

A polished, static German A1 learning website for **Furaha**, with full **English and
Swahili** support. No login, no backend, no runtime dependencies — pure HTML/CSS/JS
that runs anywhere, including GitHub Pages.

> **Important:** This is **original practice material**, not an official Goethe test.
> It is a 120+ word starter covering the A1 curriculum, not a comprehensive A1 course,
> plus an enrichment proverbs section. The only audio is a single German proverb
> sentence preview in the Proverbs section, narrated with an AI-generated Nuri voice
> (a plain MP3 in the repo — no licensed/full course audio).

## Features

- **Vocabulary** — 120+ curated German A1 words across all 12 A1 topics
  (person/family, housing, food, shopping, work, leisure, travel, health, public
  services, weather, school/language, numbers/time). Each word has its German
  article, English and Swahili translations, and an example sentence translated
  into EN and SW. Searchable and filterable by topic.
- **Flashcards** — flip cards to reveal translations, navigate through a topic or
  the whole set.
- **Quiz** — multiple-choice questions with 4 non-duplicated options, instant
  feedback with explanations, and a "retry mistakes" round.
- **Grammar** — 13 lessons with tables and practice covering: sein, haben, present
  tense, question words, yes/no questions, negation (nicht/kein), accusative,
  modal verbs, separable verbs, perfect tense, dative basics, imperative, and
  time/numbers.
- **Reading** — A1 passages with comprehension questions and optional EN/SW
  translation.
- **Writing** — prompts with a live word counter and model examples. **Honest:**
  there is no automatic grading — you compare your text with the model yourself.
- **Speaking** — prompts with model answers (no audio).
- **Proverbs & sayings** — enrichment collection: 18 common German sayings plus 6
  authentic Swahili proverbs (hurry–patience theme) with clear EN/SW meanings,
  examples and a meaning-matching quiz with retry. German entries are traditional
  German sayings; the Swahili entries carry clickable source citations and their German is
  a translation of the Swahili (never a claimed traditional equivalent).
- **Daily study path** — a short, deterministic-per-day sequence of activities.
- **Progress** — saved locally, with a confirmation dialog before reset.

## Accessibility & design

- Phone-first, responsive, keyboard-focusable.
- Warm ivory / forest green editorial aesthetic — no emoji, no gradients.
- One activity at a time (Decide/Learn surface).
- Safe DOM building: user text is never injected via `innerHTML`.

## Run locally

```bash
npm install          # dev deps (playwright for browser tests)
npm run serve        # serves at http://localhost:4173
```

Open http://localhost:4173 in a browser.

## Tests

```bash
npm test             # unit tests (node --test) — pure logic + data integrity
npm run test:browser # Playwright browser smoke tests (needs a running server)
```

If the default browser install path is not writable, set a local one first:

```bash
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.pw-browsers"
npx playwright install chromium
npm run test:browser
```

Unit tests cover: vocabulary data integrity (120+ words, 12 topics, articles,
translations), storage corruption/unavailability handling, quiz generation
(non-duplicated options, retry), vocab search/filter, word counter, daily study
path, progress tracking, and content integrity (grammar/reading/writing/speaking).
Unit tests now also cover the proverbs data (counts, translations, exact source item
numbers, German-vs-Swahili distinction) plus proverbs search/filter and the meaning quiz.

Browser tests cover: home load, activity cards, vocabulary render + filter +
search, flashcards, quiz end-to-end, grammar, reading, writing word counter,
speaking, language switch, progress + reset confirmation, daily path, the
Goethe disclaimer, and the proverbs section (cards, type filter, search, translation
toggle, clickable Swahili source, audio preview with real MP3 duration + transcript,
and a full proverb quiz with a retry-mistakes round).

## Project structure

```
index.html            # entry point (repo root, relative paths — GitHub Pages ready)
css/style.css         # styles
js/app.js             # view router + all activities
js/storage.js         # safe localStorage wrapper (corruption/unavailable-safe)
js/quiz.js            # quiz engine
js/vocab.js           # search/filter
js/wordcount.js       # word counter
js/studyPath.js       # daily study path
js/progress.js        # progress tracking
js/proverbs.js        # proverbs search/filter + meaning quiz
data/vocabulary.js    # 120+ words, 12 topics
data/grammar.js       # 13 grammar lessons
data/reading.js       # reading passages
data/writing.js       # writing prompts + models
data/speaking.js      # speaking prompts + models
data/proverbs.js      # 18 German sayings + 6 Swahili proverbs (sourced)
audio/proverbs-preview.mp3 # AI-narrated German proverb preview
scripts/serve.mjs     # local static server
tests/unit/*.test.js  # unit tests
tests/browser/*.test.js # Playwright smoke tests
```

## Limitations

- **Not a full A1 course** — this is a 120+ word starter clearly labeled as such.
- **Proverbs are enrichment** — they are practice material beyond the A1 curriculum,
  some idioms exceed A1 level.
- **Near-zero audio** — only the single AI-narrated German preview in Proverbs is
  included; full licensed course audio remains out of scope.
- **No automatic writing grading** — writing is self-assessed against a model.
- **Not an official Goethe test** — original practice material only.
- Progress is stored in `localStorage` and is per-browser; it degrades gracefully
  (in-memory only) if storage is unavailable or corrupt.

## License

MIT
