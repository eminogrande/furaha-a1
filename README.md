# Furaha and Emin: language practice

A static German and Swahili learning app. English and Swahili explanations, no login, no server-side learner data.

## What is included

- German A1-oriented starter: 122 words with examples, 13 grammar topics, reading checks, writing and speaking prompts.
- Flashcard recall with self-ratings, objective quizzes with feedback, listening checks, and review over time. Self-ratings are not proficiency scores.
- Separate German and Swahili practice records on the current device.
- Six beginner Swahili lessons, eight history mini-lessons and a German level roadmap, with 45 questions.
- Twenty-four German/Swahili proverbs and a meaning quiz. Source-language originals and translations are labelled separately.
- AI-generated German recordings using the approved Nuri cloned voice. The current manifest contains 433 text-to-MP3 mappings. Audio is generated in advance; no API key is shipped in the website.
- A dated, sourced news edition with German/English audio and matching transcripts. Swahili is provided as text, not supported-model speech.
- `levels.html`: A2–C2 study guidance, external courses and official practice links, plus introductory sample checks. These are **not complete A2–C2 courses or calibrated level tests**.

The learning rationale and research references are in [docs/learning-design.md](docs/learning-design.md).

## Run and test

```sh
npm ci
npm run serve
npm test
# In another terminal, with the server running:
npx playwright install chromium
node --test --test-concurrency=1 tests/browser/*.test.js
```

If browser installation needs a writable directory, use `PLAYWRIGHT_BROWSERS_PATH` consistently for installation and testing. To test a deployment, set `BASE_URL` to its full GitHub Pages project URL.

## Limits and privacy

This is original self-practice, not an official Goethe exam or a complete A1 course. Full A2–C2 curricula have not been authored here. Follow official exam links for current requirements and exam-format practice.

Writing and speaking use model comparisons and self-reports, not automated grading or accent assessment. Real conversation and qualified feedback remain important. The precise review intervals are a product choice, not a claim of scientifically optimal scheduling.

Progress and drafts are stored in this browser. They do not synchronise across devices and can be lost if browser data is cleared. Generated German audio is not a human pronunciation assessment. Swahili audio is not available from the configured model.

Third-party resources are linked, not republished. News is summarised with source links and edition dates. No credentials or voice-generation tools belong in this repository.
