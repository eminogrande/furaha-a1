// Furaha & Emin — bilingual learning app (German <-> Swahili).
// Real learning loops: active recall, objective checks, per-track persisted review,
// review-driven flashcards (Again/Got it), honest progress. Safe DOM building only
// (user text is never injected via innerHTML). No backend, no runtime deps.

import { vocabulary, TOPICS, TOPIC_IDS } from '../data/vocabulary.js';
import { grammarLessons } from '../data/grammar.js';
import { readingPassages } from '../data/reading.js';
import { writingPrompts } from '../data/writing.js';
import { speakingPrompts } from '../data/speaking.js';
import { proverbs, PROVERB_SOURCE } from '../data/proverbs.js';
import { filterVocab, searchVocab } from './vocab.js';
import { filterProverbs, searchProverbs, buildProverbQuiz } from './proverbs.js';
import { buildQuiz, QuizSession } from './quiz.js';
import { countWords } from './wordcount.js';
import { createReview, todayStr } from './review.js';
import { createStorage } from './storage.js';
import { parseAudioManifest, emptyAudioManifest } from './audio.js';
import { buildListeningQuiz } from './listening.js';
import { parseCurriculum, toQuizQuestions } from './curriculum.js';

// ---------- i18n ----------
const I18N = {
  en: {
    tagline: 'Learn German & Swahili — with English support.',
    decide: 'Literacy', learn: 'Practice',
    chooseTrack: 'Choose your track', continue_T: 'Continue', switchTrack: 'Switch track',
    furaha: 'Furaha — German', emin: 'Emin — Swahili',
    germanScope: 'German for Furaha (A1 focus, Goethe-aligned)',
    swahiliScope: 'Swahili for Emin (graded beginner lessons)',
    vocab: 'Vocabulary', flashcards: 'Flashcards', quiz: 'Quiz', listening: 'Listening',
    grammar: 'Grammar', reading: 'Reading', writing: 'Writing', speaking: 'Speaking',
    proverbs: 'Proverbs & sayings', lessons: 'Lessons', roadmap: 'Roadmap',
    progress: 'My progress', dailyPath: "Today's path",
    search: 'Search German, English or Swahili…', allTopics: 'All topics',
    flip: 'Tap to flip', next: 'Next', prev: 'Previous', back: 'Back', check: 'Check',
    again: 'Again', gotIt: 'Got it', repeat: 'Repeat',
    retryMistakes: 'Retry mistakes', newQuiz: 'New quiz',
    showTranslation: 'Show translation', hideTranslation: 'Hide translation',
    wordCount: 'words', modelExample: 'Model example', revealed: 'Reveal model', hideModel: 'Hide model',
    selfAssess: "Mark as practised", selfAssessNote: 'No automatic grading — review the model and mark honestly.',
    draftSaved: 'Draft saved on this device.',
    resetProgress: 'Reset progress', resetConfirm: 'Reset all progress? This cannot be undone.',
    cancel: 'Cancel', confirm: 'Reset', done: 'Done', score: 'Score',
    answered: 'Answered', total: 'Total', mistakes: 'Mistakes',
    noMistakes: 'No mistakes — well done!',
    notOfficial: 'Original practice material, not an official Goethe exam.',
    storageUnavailable: 'Progress cannot be saved (storage unavailable). Your work still works in this session.',
    pathDone: "Today’s path complete. Well done!", pathNothingYet: 'Complete an activity to mark today’s steps.',
    pathProgress: 'of', activities: 'activities', completed: 'completed',
    start: 'Start', continue_L: 'Continue', home: 'Home',
    writingNote: 'There is no automatic grading here. Compare your text with the model and mark your own work.',
    speakingNote: 'Read the prompt aloud and try to answer, then reveal the model.',
    grammarPractice: 'Practice', readingQuestions: 'Questions', readingCheck: 'Start questions',
    backToReading: 'Back to reading', hiddenReading: 'Text hidden during the check — answer from memory.',
    chooseTopic: 'Choose a topic', all: 'All',
    proverbIntro: 'Common German sayings and authentic Swahili proverbs, with meanings in English and Swahili.',
    proverbEnrich: 'Enrichment — beyond the required A1 course; some idioms go above A1 level.',
    startProverbQuiz: 'Start proverb quiz', germanSaying: 'German saying', swahiliProverb: 'Swahili proverb',
    germanChip: 'German sayings', swahiliChip: 'Swahili proverbs',
    proverbMeaning: 'Meaning', proverbLiteral: 'Literal', proverbNote: 'Notes', proverbSource: 'Source',
    proverbSourceNote: 'Source', audioLabel: 'AI-generated Nuri voice / Sauti ya Nuri iliyotengenezwa kwa AI',
    audioTranscriptDe: 'Übung macht den Meister. Aller Anfang ist schwer. Eile mit Weile. Schritt für Schritt lerne ich Deutsch.',
    audioTranscriptEn: 'Practice makes perfect. Every beginning is hard. More haste, less speed. Step by step I learn German.',
    audioTranscriptSw: 'Kujizoeza huja ustadi. Mwanzo wa kila kitu ni mgumu. Haraka haina baraka. Hatua kwa hatua najifunza Kijerumani.',
    audioUnavailable: 'audio unavailable', play: 'Play audio',
    listeningIntro: 'Listen and choose the meaning. The German word and transcript stay hidden until you answer.',
    roadIntro: 'The Goethe-Institut certifies six levels (CEFR). A1–A2 = Basic, B1–B2 = Independent, C1–C2 = Proficient.',
    roadGuidance: 'Levels above A1 are shown as guidance for your path — this app only teaches the German A1 course.',
    roadGoethe: 'Goethe official level info',
    lessonsIntro: 'Bilingual lessons: short reading, phrases, and checked questions.',
    lessonsComingSoon: 'Lessons will appear here once the curriculum is added.',
    readLesson: 'Read', lessonPhrases: 'Phrases', lessonQuestions: 'Questions', lessonSources: 'Sources',
    objective: 'objective checks', weak: 'weak', due: 'due today', familiar: 'self-familiar',
    noAudio: 'No audio is available for this item yet.',
        swComingSoon: 'Swahili lessons will appear here once the curriculum is ready.',
        news: 'Daily news', newsIntro: 'Short daily news from Germany and Tanzania, with a language lesson.',
        newsNoEdition: 'No edition is available today. Check back later.',
        newsLesson: "Today's language lesson", newsQuestion: 'Knowledge check',
        newsSource: 'Source', newsDate: 'Edition', newsListen: 'Listen', newsRead: 'Read the the news',
      },
  sw: {
    tagline: 'Jifunze Kijerumani na Kiswahili — kwa msaada wa Kiingereza.',
    decide: 'Kusoma', learn: 'Mazoezi',
    chooseTrack: 'Chagua njia yako', continue_T: 'Endelea', switchTrack: 'Badilisha njia',
    furaha: 'Furaha — Kijerumani', emin: 'Emin — Kiswahili',
    germanScope: 'Kijerumani kwa Furaha (lengo A1, kufuatana na Goethe)',
    swahiliScope: 'Kiswahili kwa Emin (masomo ya mwanzo)',
    vocab: 'Msamiati', flashcards: 'Kadi za kumbukumbu', quiz: 'Maswali', listening: 'Kusikiliza',
    grammar: 'Sarufi', reading: 'Kusoma', writing: 'Kuandika', speaking: 'Kusema',
    proverbs: 'Methali na misemo', lessons: 'Masomo', roadmap: 'Ramani ya njia',
    progress: 'Maendeleo yangu', dailyPath: 'Njia ya leo',
    search: 'Tafuta Kijerumani, Kiingereza au Kiswahili…', allTopics: 'Mada zote',
    flip: 'Bonyeza kugeuza', next: 'Inayofuata', prev: 'Iliyopita', back: 'Rudi', check: 'Angalia',
    again: 'Tena', gotIt: 'Nimefahamu', repeat: 'Rudia',
    retryMistakes: 'Rudia makosa', newQuiz: 'Maswali mapya',
    showTranslation: 'Onyesha tafsiri', hideTranslation: 'Ficha tafsiri',
    wordCount: 'maneno', modelExample: 'Mfano wa kielelezo', revealed: 'Onyesha mfano', hideModel: 'Ficha mfano',
    selfAssess: 'Weka kama umejitendeza', selfAssessNote: 'Hakuna ukadiriaji wa kiotomatiki — linganisha na mfano na uweke kwa uaminifu.',
    draftSaved: 'Rasimu imehifadhiwa kwenye kifaa hiki.',
    resetProgress: 'Futa maendeleo', resetConfirm: 'Futa maendeleo yote? Hili haliwezi kurejeshwa.',
    cancel: 'Ghairi', confirm: 'Futa', done: 'Imekamilika', score: 'Alama',
    answered: 'Umejibu', total: 'Jumla', mistakes: 'Makosa',
    noMistakes: 'Hakuna makosa — umefanya vizuri!',
    notOfficial: 'Mazoezi ya asili, si mtihani rasmi wa Goethe.',
    storageUnavailable: 'Maendeleo hayawezi kuhifadhiwa (hifadhi haipatikani). Kazi yako bado inafanya kazi katika kikao hiki.',
    pathDone: 'Njia ya leo imekamilika. Umefanya vizuri!', pathNothingYet: 'Kamilisha shughuli kuashiria hatua za leo.',
    pathProgress: 'kati ya', activities: 'shughuli', completed: 'zimekamilika',
    start: 'Anza', continue_L: 'Endelea', home: 'Nyumbani',
    writingNote: 'Hakuna ukadiriaji wa kiotomatiki hapa. Linganisha maandishi yako na mfano na uweke kazi yako mwenyewe.',
    speakingNote: 'Soma swali kwa sauti na ujaribu kujibu, kisha onyesha mfano.',
    grammarPractice: 'Mazoezi', readingQuestions: 'Maswali', readingCheck: 'Anza maswali',
    backToReading: 'Rudi kwenye kusoma', hiddenReading: 'Maandishi yamefichwa wakati wa maswali — jibu kwa kumbukumbu.',
    chooseTopic: 'Chagua mada', all: 'Zote',
    proverbIntro: 'Misemo ya Kijerumani na methali halisi za Kiswahili, na maana kwa Kiingereza na Kiswahili.',
    proverbEnrich: 'Nyongeza ya kujifunza — zaidi ya kozi ya A1; baadhi ya misemo ipo juu ya kiwango cha A1.',
    startProverbQuiz: 'Anza maswali ya methali', germanSaying: 'Misemo ya Kijerumani', swahiliProverb: 'Methali ya Kiswahili',
    germanChip: 'Misemo ya Kijerumani', swahiliChip: 'Methali za Kiswahili',
    proverbMeaning: 'Maana', proverbLiteral: 'Tafsiri halisi', proverbNote: 'Maelezo', proverbSource: 'Chanzo',
    proverbSourceNote: 'Chanzo', audioLabel: 'AI-generated Nuri voice / Sauti ya Nuri iliyotengenezwa kwa AI',
    audioTranscriptDe: 'Übung macht den Meister. Aller Anfang ist schwer. Eile mit Weile. Schritt für Schritt lerne ich Deutsch.',
    audioTranscriptEn: 'Practice makes perfect. Every beginning is hard. More haste, less speed. Step by step I learn German.',
    audioTranscriptSw: 'Kujizoeza huja ustadi. Mwanzo wa kila kitu ni mgumu. Haraka haina baraka. Hatua kwa hatua najifunza Kijerumani.',
    audioUnavailable: 'sauti haipatikani', play: 'Cheza sauti',
    listeningIntro: 'Sikiliza kisha uchague maana. Neno la Kijerumani na nakala hufichwa hadi ujibu.',
    roadIntro: 'Goethe-Institut hutoa vithibitisho katika viwango sita (CEFR). A1–A2 = Msingi, B1–B2 = Bia, C1–C2 = Mahiri.',
    roadGuidance: 'Viwango juu ya A1 ni mwongozo wa njia — app hii inafundisha kozi ya Kijerumani A1 pekee.',
    roadGoethe: 'Taarifa rasmi za viwango vya Goethe',
    lessonsIntro: 'Masomo ya lugha mbili: kusoma kifupi, misemo, na maswali yaliyojaribiwa.',
    lessonsComingSoon: 'Masomo yataonekana hapa kurikulamu inapoongezwa.',
    readLesson: 'Soma', lessonPhrases: 'Misemo', lessonQuestions: 'Maswali', lessonSources: 'Vyanzo',
    objective: 'majaribio halisi', weak: 'dhaifu', due: 'yanayodaiwa leo', familiar: 'nimejifahamisha',
    noAudio: 'Hakuna sauti kwa kipengee hiki bado.',
        swComingSoon: 'Masomo ya Kiswahili yataonekana hapa kurikulamu inapoandaliwa.',
        news: 'Habari za kila siku', newsIntro: 'Habari fupi za kila siku kutoka Ujerumani na Tanzania, pamoja na somo la lugha.',
        newsNoEdition: 'Hakuna toleo leo. Rudi baadaye.',
        newsLesson: 'Somo la lugha la leo', newsQuestion: 'Jaribio la maarifa',
        newsSource: 'Chanzo', newsDate: 'Toleo', newsListen: 'Sikiliza', newsRead: 'Soma habari',
      },
};

// ---------- state ----------
const storage = createStorage();
const review = createReview();
const state = {
  lang: 'en',
  track: storage.get('furaha.activeTrack', 'de') === 'sw' ? 'sw' : 'de',
  view: 'home',
  // vocabulary
  vocabTopic: 'all', vocabQuery: '',
  // flashcards
  flashTopic: 'all', flashQueue: [], flashIdx: 0, flashFlipped: false,
  // quiz
  quizQuestions: null, quizSession: null,
  // listening
  listeningQuestions: null, listeningSession: null,
  // grammar
  grammarIndex: 0,
  // reading
  readingIndex: 0, readingPhase: 'read',
  // writing / speaking
  writingIndex: 0, writingReveal: false, writingDraft: null,
  speakingIndex: 0, speakingReveal: false,
  // proverbs
  proverbType: 'all', proverbQuery: '', proverbShowTr: false,
  proverbQuizSession: null, proverbQuizQuestions: null,
  // lessons (curriculum)
  curriculumList: [], curriculumIndex: null, curriculumPhase: 'read',
    curriculumQuizSession: null,
    news: null, newsPhase: 'read', newsQuizSession: null,
  };
let audioManifest = emptyAudioManifest();
let curriculumParsed = null;

const app = document.getElementById('app');
const footerNote = document.getElementById('footer-note');
const modalRoot = document.getElementById('modal-root');
const audioEl = new Audio(); // single shared audio element for all play controls

function t(key) { return I18N[state.lang][key] || key; }

function isSw() { return state.track === 'sw'; }

// ---------- safe DOM helpers ----------
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v; // only trusted static markup
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (typeof v === 'boolean') { if (v) node.setAttribute(k, ''); }
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

// ---------- audio control (manifest-driven; no synthetic speech) ----------
function playUrl(url) {
  if (!url) return;
  audioEl.src = url;
  audioEl.play().catch(() => {});
}

function playControl(text, className = '') {
  const url = audioManifest.urlFor(String(text || '').trim());
  if (!url) {
    return el('span', { class: 'audio-none small ' + className, text: '· ' + t('audioUnavailable') });
  }
  return el('button', { class: 'play-btn ' + className, 'aria-label': t('play'), title: t('play'),
    onclick: (e) => { e.stopPropagation(); playUrl(url); } }, ['▶']);
}

// ---------- header / lang ----------
function setLang(lang) {
  state.lang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach((b) => {
    const active = b.dataset.lang === lang;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  render();
}

// ---------- router ----------
function render() {
  clear(app);
  footerNote.textContent = t('notOfficial');
  const views = { home: renderHome, vocab: renderVocab, flashcards: renderFlashcards,
    quiz: renderQuiz, listening: renderListening, grammar: renderGrammar, reading: renderReading,
    writing: renderWriting, speaking: renderSpeaking, proverbs: renderProverbs,
    lessons: renderLessons, lesson: renderLessonView, roadmap: renderRoadmap,
        path: renderPath, progress: renderProgress, news: renderNews };
  (views[state.view] || renderHome)();
  app.focus();
}

function go(view) { state.view = view; render(); }

function setTrack(tr) {
  state.track = tr === 'sw' ? 'sw' : 'de';
  storage.set('furaha.activeTrack', state.track);
  state.flashQueue = []; state.flashIdx = 0; state.view = 'home';
  render();
}

function today() { return todayStr(); }

// ---------- home + track picker ----------
function renderHome() {
  const hero = el('div', { class: 'home-hero' }, [
    el('h1', { text: isSw() ? 'Emin — Kiswahili' : 'Furaha — Deutsch' }),
    el('p', { class: 'lead', text: t('tagline') }),
  ]);
  const card = el('div', { class: 'card' });
  card.appendChild(hero);
  card.appendChild(renderTrackPicker());
  const list = el('div', { class: 'activity-list', id: 'activity-list' });
  for (const [view, label] of activities()) {
    list.appendChild(el('button', { class: 'activity-card', onclick: () => go(view) },
      [el('span', { text: label }), el('span', { class: 'arrow', text: '→' })]));
  }
  card.appendChild(el('h2', { class: 'mt', text: t('learn') }));
  card.appendChild(list);
  app.appendChild(card);
}

function activities() {
  const base = isSw() ? [
      ['lessons', t('lessons')], ['flashcards', t('flashcards')], ['news', t('news')],
    ] : [
      ['vocab', t('vocab')], ['flashcards', t('flashcards')], ['quiz', t('quiz')],
      ['listening', t('listening')], ['grammar', t('grammar')], ['reading', t('reading')],
      ['writing', t('writing')], ['speaking', t('speaking')], ['proverbs', t('proverbs')],
      ['lessons', t('lessons')], ['roadmap', t('roadmap')], ['news', t('news')],
    ];
  return [...base, ['path', t('dailyPath')], ['progress', t('progress')]];
}

function trackStatLine(tr) {
  const s = review.stats(tr, today());
  return el('p', { class: 'muted small' }, [
    `${t('objective')}: ${s.objective.attempts} · ${t('weak')}: ${s.weak} · ${t('due')}: ${s.dueToday}`,
  ]);
}

function renderTrackPicker() {
  const pick = el('div', { class: 'track-picker' });
  const mk = (tr, label, scope) => {
    const active = state.track === tr;
    const btn = el('button', { class: 'track-card' + (active ? ' is-active' : ''), onclick: () => setTrack(tr) },
      [el('span', { class: 'track-name', text: label }), el('span', { class: 'muted small', text: scope }), trackStatLine(tr)]);
    if (active) btn.appendChild(el('span', { class: 'track-cur', text: '✓' }));
    return btn;
  };
  pick.appendChild(mk('de', t('furaha'), t('germanScope')));
  pick.appendChild(mk('sw', t('emin'), t('swahiliScope')));
  return el('div', {}, [
    el('h2', { class: 'section-title', text: t('chooseTrack') }),
    pick,
  ]);
}

// ---------- vocabulary ----------
function renderVocab() {
  if (isSw()) { app.appendChild(comingSoon(t('swComingSoon'))); return; }
  const chips = el('div', { class: 'topic-chips' }, [
    el('button', { class: 'chip' + (state.vocabTopic === 'all' ? ' is-active' : ''), onclick: () => { state.vocabTopic = 'all'; render(); } }, [t('allTopics')]),
  ]);
  for (const id of TOPIC_IDS) {
    chips.appendChild(el('button', { class: 'chip' + (state.vocabTopic === id ? ' is-active' : ''), onclick: () => { state.vocabTopic = id; render(); } }, [TOPICS[id][state.lang]]));
  }
  const search = el('input', { type: 'search', placeholder: t('search'), value: state.vocabQuery,
    oninput: (e) => { state.vocabQuery = e.target.value; renderList(); } });
  const listWrap = el('div', { id: 'vocab-list' });
  function renderList() {
    clear(listWrap);
    let words = searchVocab(filterVocab(vocabulary, { topic: state.vocabTopic }), state.vocabQuery);
    if (words.length === 0) { listWrap.appendChild(el('p', { class: 'muted', text: '—' })); return; }
    for (const w of words) {
      const de = el('div', { class: 'vocab-de' });
      if (w.article) de.appendChild(el('span', { class: 'vocab-article', text: w.article + ' ' }));
      de.appendChild(document.createTextNode(w.word));
      de.appendChild(playControl(w.de, 'inline'));
      const tr = el('div', { class: 'vocab-tr', text: `${w.en} · ${w.sw}` });
      const ex = el('div', { class: 'vocab-example' }, [
        el('div', {}, [document.createTextNode(w.example.de), playControl(w.example.de, 'inline')]),
        el('div', { text: `${w.example.en} · ${w.example.sw}` }),
      ]);
      const topic = el('div', { class: 'vocab-topic', text: TOPICS[w.topic][state.lang] });
      listWrap.appendChild(el('div', { class: 'vocab-item' }, [el('div', {}, [de, tr, ex]), topic]));
    }
  }
  renderList();
  app.appendChild(el('div', { class: 'card' }, [
    el('h2', { text: t('vocab') }),
    el('p', { class: 'muted small', text: `${vocabulary.length} ${t('activities')}` }),
    search, chips, listWrap,
  ]));
}

// ---------- flashcards (review-driven: Again / Got it) ----------
function flashPoolIds() {
  if (isSw()) return curriculumPhraseIds();
  return filterVocab(vocabulary, { topic: state.flashTopic }).map((w) => w.id);
}
function startFlashSession() {
  state.flashQueue = review.buildFlashQueue(state.track, flashPoolIds(), undefined, 14);
  state.flashIdx = 0; state.flashFlipped = false; render();
}
function flashWord(id) { return vocabulary.find((w) => w.id === id); }
function flashPhrase(id) { return curriculumPhrases().find((p) => p.key === id); }

function renderFlashcards() {
  const chips = el('div', { class: 'topic-chips' }, [
    el('button', { class: 'chip' + (state.flashTopic === 'all' ? ' is-active' : ''), onclick: () => { state.flashTopic = 'all'; state.flashQueue = []; render(); } }, [t('allTopics')]),
  ]);
  if (!isSw()) for (const id of TOPIC_IDS) {
    chips.appendChild(el('button', { class: 'chip' + (state.flashTopic === id ? ' is-active' : ''), onclick: () => { state.flashTopic = id; state.flashQueue = []; render(); } }, [TOPICS[id][state.lang]]));
  }
  if (state.flashQueue.length === 0) {
    app.appendChild(el('div', { class: 'card' }, [
      el('h2', { text: t('flashcards') }), chips,
      (!isSw() || curriculumParsed) ? el('button', { class: 'btn btn--block', text: t('start'), onclick: startFlashSession })
        : el('p', { class: 'muted', text: t('swComingSoon') }),
    ]));
    return;
  }
  const idx = Math.min(state.flashIdx, state.flashQueue.length - 1);
  const id = state.flashQueue[idx];
  const isPhrase = typeof flashWord(id) === 'undefined';
  const card = el('div', { class: 'card flashcard', onclick: () => { state.flashFlipped = !state.flashFlipped; render(); } });
  if (isPhrase) {
    const p = flashPhrase(id);
    if (state.flashFlipped) card.appendChild(el('div', { class: 'fc-back' }, [el('div', { text: p.sw }), el('div', { class: 'tr', text: p.en })]));
    else { card.appendChild(el('div', { class: 'fc-front', text: p.sw })); card.appendChild(el('div', { class: 'fc-hint', text: t('flip') })); }
  } else {
    const w = flashWord(id);
    if (state.flashFlipped) {
      const back = el('div', { class: 'fc-back' });
      back.appendChild(el('div', { text: w.de, class: 'de' }));
      back.appendChild(playControl(w.de, 'inline'));
      back.appendChild(el('div', { class: 'tr', text: `${w.en} · ${w.sw}` }));
      back.appendChild(el('div', { class: 'fc-hint', text: w.example.de }));
      card.appendChild(back);
    } else { card.appendChild(el('div', { class: 'fc-front', text: w.de })); card.appendChild(el('div', { class: 'fc-hint', text: t('flip') })); }
  }
  const controls = el('div', { class: 'flashcard-controls' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: idx === 0, onclick: () => { state.flashIdx = idx - 1; state.flashFlipped = false; render(); } }),
    el('span', { class: 'muted', text: `${idx + 1} / ${state.flashQueue.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: idx >= state.flashQueue.length - 1, onclick: () => { state.flashIdx = idx + 1; state.flashFlipped = false; render(); } }),
  ]);
  const verdict = el('div', { class: 'flashcard-verdict' });
  if (state.flashFlipped) {
    verdict.appendChild(el('button', { class: 'btn btn--ghost', text: t('again'), onclick: () => rateFlash(id, 'again') }));
        verdict.appendChild(el('span', { class: 'spacer' }));
    verdict.appendChild(el('button', { class: 'btn', text: t('gotIt'), onclick: () => rateFlash(id, 'gotit') }));
  }
  app.appendChild(el('div', { class: 'card' }, [el('h2', { text: t('flashcards') }), chips, card, controls, verdict]));
}

function rateFlash(id, verdict) {
  review.recordFlash(state.track, id, verdict);
  // re-queue 'again' items at the end for same-session reinforcement
  let queue = state.flashQueue.slice();
  const cur = queue.splice(state.flashIdx, 1)[0];
  if (verdict === 'again') queue.push(cur);
  state.flashQueue = queue;
  state.flashIdx = Math.min(state.flashIdx, queue.length);
  state.flashFlipped = false;
  if (state.flashIdx >= queue.length) state.flashQueue = [];
  render();
}

// ---------- quiz (objective vocab checks + retry) ----------
function startQuiz() {
  state.quizQuestions = buildQuiz(vocabulary, 8);
  state.quizSession = new QuizSession(state.quizQuestions);
  render();
}
function endVocabQuiz() { state.quizQuestions = null; state.quizSession = null; render(); }

function renderQuiz() {
  if (isSw()) { app.appendChild(comingSoon(t('swComingSoon'))); return; }
  const wrap = el('div', { class: 'card' });
  if (!state.quizSession) {
    wrap.appendChild(el('h2', { text: t('quiz') }));
    wrap.appendChild(el('p', { class: 'lead', text: t('tagline') }));
    wrap.appendChild(el('button', { class: 'btn btn--block', text: t('start'), onclick: startQuiz }));
    app.appendChild(wrap); return;
  }
  const s = state.quizSession;
  const q = s.questions[s.answered] || null;
  if (!q) {
    wrap.appendChild(el('h2', { text: t('quiz') }));
    wrap.appendChild(el('p', { class: 'lead', text: `${t('score')}: ${s.score} / ${s.total}` }));
    if (s.mistakes.length > 0) {
      wrap.appendChild(el('p', { text: `${t('mistakes')}: ${s.mistakes.length}` }));
      wrap.appendChild(el('button', { class: 'btn btn--block', text: t('retryMistakes'), onclick: () => { state.quizSession = new QuizSession(s.retryQuiz()); render(); } }));
    } else wrap.appendChild(el('p', { class: 'muted', text: t('noMistakes') }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('newQuiz'), onclick: startQuiz }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('back'), onclick: endVocabQuiz }));
    app.appendChild(wrap); return;
  }
  wrap.appendChild(el('h2', { text: t('quiz') }));
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${s.answered} / ${s.total}` }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) list.appendChild(el('li', {}, [el('button', { class: 'option-btn', text: opt, onclick: () => answerQuiz(q, opt) })]));
  wrap.appendChild(list);
  app.appendChild(wrap);
}

function answerQuiz(q, chosen) {
  const r = state.quizSession.answer(q, chosen);
  if (!r) return;
  review.recordCheck(state.track, 'vocab', q.id, r.correct); // one objective outcome
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('quiz') }));
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${state.quizSession.answered} / ${state.quizSession.total}` }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) {
    let cls = 'option-btn';
    if (opt === q.correct) cls += ' is-correct';
    else if (opt === chosen) cls += ' is-wrong';
    list.appendChild(el('li', {}, [el('button', { class: cls, text: opt, disabled: true })]));
  }
  wrap.appendChild(list);
  const fb = el('div', { class: 'feedback ' + (r.correct ? 'feedback--ok' : 'feedback--no') }, [el('strong', { text: r.correct ? '✓' : '✗' }), el('span', { text: r.explanation }), playControl(q.correct, 'inline')]);
  wrap.appendChild(fb);
  const nextLabel = state.quizSession.answered >= state.quizSession.total ? t('done') : t('next');
  wrap.appendChild(el('button', { class: 'btn btn--block mt', text: nextLabel, onclick: render }));
  clear(app); app.appendChild(wrap);
}

// ---------- listening ----------
function startListening() {
  state.listeningQuestions = buildListeningQuiz(vocabulary, 6);
  state.listeningSession = new QuizSession(state.listeningQuestions);
  render();
}
function renderListening() {
  if (isSw()) { app.appendChild(comingSoon(t('swComingSoon'))); return; }
  const wrap = el('div', { class: 'card' });
  if (!state.listeningSession) {
    wrap.appendChild(el('h2', { text: t('listening') }));
    wrap.appendChild(el('p', { class: 'lead', text: t('listeningIntro') }));
    wrap.appendChild(el('button', { class: 'btn btn--block', text: t('start'), onclick: startListening }));
    app.appendChild(wrap); return;
  }
  const s = state.listeningSession;
  const q = s.questions[s.answered] || null;
  if (!q) {
    wrap.appendChild(el('h2', { text: t('listening') }));
    wrap.appendChild(el('p', { class: 'lead', text: `${t('score')}: ${s.score} / ${s.total}` }));
    if (s.mistakes.length > 0) { wrap.appendChild(el('p', { text: `${t('mistakes')}: ${s.mistakes.length}` })); wrap.appendChild(el('button', { class: 'btn btn--block', text: t('retryMistakes'), onclick: () => { state.listeningSession = new QuizSession(s.retryQuiz()); render(); } })); }
    else wrap.appendChild(el('p', { class: 'muted', text: t('noMistakes') }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('newQuiz'), onclick: startListening }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('back'), onclick: () => { state.listeningSession = null; render(); } }));
    app.appendChild(wrap); return;
  }
  wrap.appendChild(el('h2', { text: t('listening') }));
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${s.answered} / ${s.total}` }));
  // audio control: plays the German word; meaning/transcript remain hidden pre-answer
  wrap.appendChild(el('div', { class: 'listen-control' }, [playControl(q.audioText, 'big')]));
  wrap.appendChild(el('p', { class: 'muted small', text: t('listeningIntro') }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) list.appendChild(el('li', {}, [el('button', { class: 'option-btn', text: opt, onclick: () => answerListening(q, opt) })]));
  wrap.appendChild(list);
  app.appendChild(wrap);
}

function answerListening(q, chosen) {
  const r = state.listeningSession.answer(q, chosen);
  if (!r) return;
  review.recordCheck(state.track, 'listening', q.id.replace('list-', ''), r.correct);
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('listening') }));
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${state.listeningSession.answered} / ${state.listeningSession.total}` }));
  wrap.appendChild(el('div', { class: 'listen-control' }, [playControl(q.audioText, 'big')]));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) {
    let cls = 'option-btn';
    if (opt === q.correct) cls += ' is-correct';
    else if (opt === chosen) cls += ' is-wrong';
    list.appendChild(el('li', {}, [el('button', { class: cls, text: opt, disabled: true })]));
  }
  wrap.appendChild(list);
  // after answering we reveal the transcript + meaning
  const fb = el('div', { class: 'feedback ' + (r.correct ? 'feedback--ok' : 'feedback--no') }, [el('strong', { text: r.correct ? '✓' : '✗' }), el('span', { text: `“${q.transcript}” — ${r.explanation}` })]);
  wrap.appendChild(fb);
  const nextLabel = state.listeningSession.answered >= state.listeningSession.total ? t('done') : t('next');
  wrap.appendChild(el('button', { class: 'btn btn--block mt', text: nextLabel, onclick: render }));
  clear(app); app.appendChild(wrap);
}

// ---------- grammar ----------
function renderGrammar() {
  if (isSw()) { app.appendChild(comingSoon(t('swComingSoon'))); return; }
  const lesson = grammarLessons[state.grammarIndex];
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.grammarIndex === 0, onclick: () => { state.grammarIndex--; render(); } }),
    el('span', { class: 'muted', text: `${state.grammarIndex + 1} / ${grammarLessons.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.grammarIndex >= grammarLessons.length - 1, onclick: () => { state.grammarIndex++; render(); } }),
  ]);
  const table = el('table', { class: 'grammar-table' }, [el('thead', {}, [el('tr', {}, [el('th', { text: 'Deutsch' }), el('th', { text: 'English' }), el('th', { text: 'Kiswahili' })])]),
    el('tbody', {}, lesson.table.map((row) => el('tr', {}, [el('td', { class: 'g-td' }, [document.createTextNode(row[0]), playControl(row[0], 'inline')]), el('td', { text: row[1] }), el('td', { text: row[2] })])))]);
  const practice = el('div', { class: 'mt' }, [el('h3', { text: t('grammarPractice') })]);
  for (let i = 0; i < lesson.practice.length; i++) practice.appendChild(renderGrammarItem(lesson, i));
  app.appendChild(el('div', { class: 'card' }, [nav, el('h2', { text: lesson.title }), el('p', { text: lesson.en }), el('p', { class: 'muted', text: lesson.sw }), table, practice]));
}

function completedSentence(q) { return q.q.replace(/___+/g, q.correct); }

function renderGrammarItem(lesson, i) {
  const p = lesson.practice[i];
  const box = el('div', { class: 'mb' });
  box.appendChild(el('p', { text: p.q }));
  const opts = el('div', { class: 'row' });
  for (const o of p.options) {
    opts.appendChild(el('button', { class: 'btn btn--ghost', text: o, onclick: () => {
      const correct = o === p.correct;
      review.recordCheck(state.track, 'grammar', `${lesson.id}-p${i}`, correct);
      clear(box);
      box.appendChild(el('p', { text: p.q }));
      const row = el('div', { class: 'row' });
      for (const oo of p.options) {
        let cls = 'btn btn--ghost';
        if (oo === p.correct) cls = 'btn';
        else if (oo === o) cls = 'btn btn--danger';
        row.appendChild(el('button', { class: cls, text: oo, disabled: true }));
      }
      box.appendChild(row);
      box.appendChild(el('div', { class: 'feedback ' + (correct ? 'feedback--ok' : 'feedback--no') }, [el('span', { text: (correct ? '✓ ' : '✗ ') + p.why }), playControl(completedSentence(p), 'inline')]));
    } }));
  }
  box.appendChild(opts);
  return box;
}

// ---------- reading (text hidden during check) ----------
function renderReading() {
  if (isSw()) { app.appendChild(comingSoon(t('swComingSoon'))); return; }
  const p = readingPassages[state.readingIndex];
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.readingIndex === 0, onclick: () => { state.readingIndex--; state.readingPhase = 'read'; render(); } }),
    el('span', { class: 'muted', text: `${state.readingIndex + 1} / ${readingPassages.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.readingIndex >= readingPassages.length - 1, onclick: () => { state.readingIndex++; state.readingPhase = 'read'; render(); } }),
  ]);
  const wrap = el('div', { class: 'card' }, [nav, el('h2', { text: p.title })]);
  if (state.readingPhase === 'check') {
    // HIDDEN reading: text/translation are not rendered during the check
    wrap.appendChild(el('div', { class: 'notice', text: t('hiddenReading') }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost small', text: t('backToReading'), onclick: () => { state.readingPhase = 'read'; render(); } }));
    wrap.appendChild(el('h3', { class: 'mt', text: t('readingQuestions') }));
    for (let i = 0; i < p.questions.length; i++) wrap.appendChild(renderReadingQuestion(p, i));
  } else {
    const passage = el('div', { class: 'passage' }, [el('p', {}, [document.createTextNode(p.de), playControl(p.de, 'inline')])]);
    const toggle = el('button', { class: 'btn btn--ghost translation-toggle', text: state.readingShowTr ? t('hideTranslation') : t('showTranslation'), onclick: () => { state.readingShowTr = !state.readingShowTr; render(); } });
    wrap.appendChild(passage);
    wrap.appendChild(toggle);
    if (state.readingShowTr) wrap.appendChild(el('div', { class: 'model-box' }, [el('div', { class: 'de', text: p.en }), el('div', { class: 'en', text: p.sw })]));
    wrap.appendChild(el('button', { class: 'btn btn--accent mt', text: t('readingCheck'), onclick: () => { state.readingPhase = 'check'; render(); } }));
  }
  app.appendChild(wrap);
}

function renderReadingQuestion(p, i) {
  const q = p.questions[i];
  const box = el('div', { class: 'mb' });
  box.appendChild(el('p', {}, [document.createTextNode(q.q), playControl(q.q, 'inline')]));
  const opts = el('div', { class: 'row' });
  for (const o of q.options) {
    opts.appendChild(el('button', { class: 'btn btn--ghost', text: o, onclick: () => {
      const correct = o === q.correct;
      review.recordCheck(state.track, 'reading', `${p.id}-q${i}`, correct);
      clear(box);
      box.appendChild(el('p', { text: q.q }));
      const row = el('div', { class: 'row' });
      for (const oo of q.options) {
        let cls = 'btn btn--ghost';
        if (oo === q.correct) cls = 'btn';
        else if (oo === o) cls = 'btn btn--danger';
        row.appendChild(el('button', { class: cls, text: oo, disabled: true }));
      }
      box.appendChild(row);
      box.appendChild(el('div', { class: 'feedback ' + (correct ? 'feedback--ok' : 'feedback--no') }, [el('span', { text: (correct ? '✓ ' : '✗ ') + q.why }), playControl(q.correct, 'inline')]));
    } }));
  }
  box.appendChild(opts);
  return box;
}

// ---------- writing (model hidden until reveal; local drafts; honest self-assess) ----------
function renderWriting() {
  if (isSw()) { app.appendChild(comingSoon(t('swComingSoon'))); return; }
  const p = writingPrompts[state.writingIndex];
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.writingIndex === 0, onclick: () => { state.writingIndex--; state.writingReveal = false; render(); } }),
    el('span', { class: 'muted', text: `${state.writingIndex + 1} / ${writingPrompts.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.writingIndex >= writingPrompts.length - 1, onclick: () => { state.writingIndex++; state.writingReveal = false; render(); } }),
  ]);
  const stored = storage.get(`furaha.draft.${p.id}`, '');
  const count = el('div', { class: 'word-count' });
  const textarea = el('textarea', { value: stored, placeholder: '...',
    oninput: (e) => { count.textContent = `${countWords(e.target.value)} ${t('wordCount')}`; storage.set(`furaha.draft.${p.id}`, e.target.value); } });
  count.textContent = `${countWords(stored)} ${t('wordCount')}`;
  const card = el('div', { class: 'card' }, [nav, el('h2', { text: p.title }), el('p', { text: p.prompt }), el('p', { class: 'muted', text: p.promptSw }),
    el('div', { class: 'field' }, [el('label', { text: t('writing') }), textarea, count]),
    el('p', { class: 'muted small', text: t('draftSaved') }),
    el('div', { class: 'notice', text: t('writingNote') })]);
  if (state.writingReveal) {
    card.appendChild(el('h3', { text: t('modelExample') }));
    card.appendChild(el('div', { class: 'model-box' }, [el('div', { class: 'de' }, [document.createTextNode(p.model), playControl(p.model, 'inline')]), el('div', { class: 'en', text: p.modelEn })]));
    card.appendChild(el('button', { class: 'btn btn--ghost', text: t('hideModel'), onclick: () => { state.writingReveal = false; render(); } }));
  } else {
    card.appendChild(el('button', { class: 'btn', text: t('revealed'), onclick: () => { state.writingReveal = true; render(); } }));
  }
  card.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('selfAssess'), onclick: () => { selfAssess(p.id, 'writing'); } }));
  app.appendChild(card);
}

function selfAssess(key, type) {
  review.recordPractice(state.track, type, key);
  // brief confirm state
  const done = el('p', { class: 'muted small', text: t('selfAssessNote') });
  app.appendChild(done);
}

// ---------- speaking ----------
function renderSpeaking() {
  if (isSw()) { app.appendChild(comingSoon(t('swComingSoon'))); return; }
  const p = speakingPrompts[state.speakingIndex];
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.speakingIndex === 0, onclick: () => { state.speakingIndex--; state.speakingReveal = false; render(); } }),
    el('span', { class: 'muted', text: `${state.speakingIndex + 1} / ${speakingPrompts.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.speakingIndex >= speakingPrompts.length - 1, onclick: () => { state.speakingIndex++; state.speakingReveal = false; render(); } }),
  ]);
  const card = el('div', { class: 'card' }, [nav, el('h2', { text: p.title }),
    el('div', { class: 'speak-prompt' }, [document.createTextNode(p.prompt), playControl(p.prompt, 'inline')]),
    el('div', { class: 'speak-sw', text: p.promptSw }), el('div', { class: 'notice', text: t('speakingNote') })]);
  if (state.speakingReveal) {
    card.appendChild(el('h3', { text: t('modelExample') }));
    card.appendChild(el('div', { class: 'model-box' }, [el('div', { class: 'de' }, [document.createTextNode(p.model), playControl(p.model, 'inline')]), el('div', { class: 'en', text: p.modelEn })]));
    card.appendChild(el('button', { class: 'btn btn--ghost', text: t('hideModel'), onclick: () => { state.speakingReveal = false; render(); } }));
  } else {
    card.appendChild(el('button', { class: 'btn', text: t('revealed'), onclick: () => { state.speakingReveal = true; render(); } }));
  }
  card.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('selfAssess'), onclick: () => { selfAssess(p.id, 'speaking'); } }));
  app.appendChild(card);
}

// ---------- proverbs ----------
function startProverbQuiz() {
  state.proverbQuizQuestions = buildProverbQuiz(proverbs, 8);
  state.proverbQuizSession = new QuizSession(state.proverbQuizQuestions);
  render();
}
function renderProverbs() {
  if (isSw()) { app.appendChild(comingSoon(t('swComingSoon'))); return; }
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('proverbs') }));
  if (state.proverbQuizSession) { renderProverbQuizContent(wrap); app.appendChild(wrap); return; }
  wrap.appendChild(el('p', { class: 'lead', text: t('proverbIntro') }));
  wrap.appendChild(el('div', { class: 'notice', text: t('proverbEnrich') }));
  wrap.appendChild(renderAudioPreview());
  const search = el('input', { type: 'search', placeholder: t('search'), value: state.proverbQuery, oninput: (e) => { state.proverbQuery = e.target.value; renderList(); } });
  const chips = el('div', { class: 'topic-chips' }, [
    el('button', { class: 'chip' + (state.proverbType === 'all' ? ' is-active' : ''), onclick: () => { state.proverbType = 'all'; render(); } }, [t('all')]),
    el('button', { class: 'chip' + (state.proverbType === 'german' ? ' is-active' : ''), onclick: () => { state.proverbType = 'german'; render(); } }, [t('germanChip')]),
    el('button', { class: 'chip' + (state.proverbType === 'swahili' ? ' is-active' : ''), onclick: () => { state.proverbType = 'swahili'; render(); } }, [t('swahiliChip')]),
  ]);
  const toggle = el('button', { class: 'btn btn--ghost proverb-toggle mb', text: state.proverbShowTr ? t('hideTranslation') : t('showTranslation'), onclick: () => { state.proverbShowTr = !state.proverbShowTr; render(); } });
  const quizBtn = el('button', { class: 'btn btn--accent mb', text: t('startProverbQuiz'), onclick: startProverbQuiz });
  const listWrap = el('div', { id: 'proverb-list' });
  function renderList() {
    clear(listWrap);
    let items = searchProverbs(filterProverbs(proverbs, state.proverbType), state.proverbQuery);
    for (const p of items) listWrap.appendChild(renderProverbCard(p));
    if (state.proverbType !== 'german') listWrap.appendChild(el('p', { class: 'muted small proverb-source-note', text: `${t('proverbSourceNote')}: ${PROVERB_SOURCE.name} (${PROVERB_SOURCE.theme}) — ${PROVERB_SOURCE.url}` }));
  }
  renderList();
  wrap.appendChild(search); wrap.appendChild(chips);
  wrap.appendChild(el('div', { class: 'row' }, [toggle, el('span', { class: 'spacer' }), quizBtn]));
  wrap.appendChild(listWrap);
  app.appendChild(wrap);
}

function renderAudioPreview() {
  return el('div', { class: 'audio-preview' }, [
    el('p', { class: 'audio-label small', text: t('audioLabel') }),
    el('audio', { id: 'proverbs-audio', controls: 'controls', preload: 'none' }, [el('source', { src: 'audio/proverbs-preview.mp3', type: 'audio/mpeg' })]),
    el('div', { class: 'audio-transcript' }, [el('div', { class: 'de', text: t('audioTranscriptDe') }), el('div', { class: 'en', text: t('audioTranscriptEn') }), el('div', { class: 'sw', text: t('audioTranscriptSw') })]),
  ]);
}

function renderProverbCard(p) {
  const isSwP = p.type === 'swahili';
  const card = el('article', { class: 'proverb-card' });
  const head = el('div', { class: 'proverb-head' }, [el('div', { class: 'proverb-phrase' }, [document.createTextNode(p.phrase)])]);
  // audio: German proverbs play the phrase; Swahili have no Swahili audio (voice model lacks SW) — only German translation if available
  if (!isSwP) head.appendChild(playControl(p.phrase, 'inline'));
  head.appendChild(el('span', { class: 'proverb-type' + (isSwP ? ' is-sw' : ''), text: isSwP ? t('swahiliProverb') : t('germanSaying') }));
  if (isSwP) head.appendChild(el('span', { class: 'proverb-item', text: `${t('proverbSource')} · item ${p.item}` }));
  card.appendChild(head);
  if (state.proverbShowTr) {
    const body = el('div', { class: 'proverb-body' });
    if (isSwP) {
      const row = el('p', {}, [el('strong', { text: `${t('germanChip')}: ` }), document.createTextNode(p.de), playControl(p.de, 'inline')]);
      body.appendChild(row);
      body.appendChild(el('p', {}, [el('strong', { text: `${t('proverbMeaning')}:` }), document.createTextNode(` ${p.en}`)]));
    } else {
      const row = el('p', {}, [el('strong', { text: `${t('proverbMeaning')}:` }), document.createTextNode(` ${p.en} · ${p.sw}`)]);
      body.appendChild(row);
      if (p.example) body.appendChild(el('div', { class: 'proverb-example' }, [el('div', {}, [document.createTextNode(p.example.de), playControl(p.example.de, 'inline')]), el('div', { class: 'muted small', text: `${p.example.en} · ${p.example.sw}` })]));
      body.appendChild(el('p', { class: 'proverb-literal', text: `${t('proverbLiteral')}: ${p.literal}` }));
    }
    body.appendChild(el('p', { class: 'proverb-note', text: `${t('proverbNote')}: ${p.note.en} · ${p.note.sw}` }));
    if (isSwP) body.appendChild(el('p', { class: 'proverb-source' }, [el('a', { href: p.source, target: '_blank', rel: 'noopener noreferrer', text: `${t('proverbSource')} — ${p.item}` })]));
    card.appendChild(body);
  }
  return card;
}

function renderProverbQuizContent(wrap) {
  const s = state.proverbQuizSession;
  const q = s.questions[s.answered] || null;
  if (!q) {
    wrap.appendChild(el('p', { class: 'lead', text: `${t('score')}: ${s.score} / ${s.total}` }));
    if (s.mistakes.length > 0) { wrap.appendChild(el('p', { text: `${t('mistakes')}: ${s.mistakes.length}` })); wrap.appendChild(el('button', { class: 'btn btn--block', text: t('retryMistakes'), onclick: () => { state.proverbQuizSession = new QuizSession(s.retryQuiz()); render(); } })); }
    else wrap.appendChild(el('p', { class: 'muted', text: t('noMistakes') }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('newQuiz'), onclick: startProverbQuiz }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('back'), onclick: () => { state.proverbQuizSession = null; render(); } }));
    return;
  }
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${s.answered} / ${s.total}` }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) list.appendChild(el('li', {}, [el('button', { class: 'option-btn', text: opt, onclick: () => answerProverbQuiz(q, opt) })]));
  wrap.appendChild(list);
}

function answerProverbQuiz(q, chosen) {
  const r = state.proverbQuizSession.answer(q, chosen);
  if (!r) return;
  review.recordCheck(state.track, 'proverb', q.id, r.correct);
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('proverbs') }));
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${state.proverbQuizSession.answered} / ${state.proverbQuizSession.total}` }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) {
    let cls = 'option-btn';
    if (opt === q.correct) cls += ' is-correct';
    else if (opt === chosen) cls += ' is-wrong';
    list.appendChild(el('li', {}, [el('button', { class: cls, text: opt, disabled: true })]));
  }
  wrap.appendChild(list);
  const fb = el('div', { class: 'feedback ' + (r.correct ? 'feedback--ok' : 'feedback--no') }, [el('strong', { text: r.correct ? '✓' : '✗' }), el('span', { text: r.explanation })]);
  wrap.appendChild(fb);
  const nextLabel = state.proverbQuizSession.answered >= state.proverbQuizSession.total ? t('done') : t('next');
  wrap.appendChild(el('button', { class: 'btn btn--block mt', text: nextLabel, onclick: render }));
  clear(app); app.appendChild(wrap);
}

// ---------- lessons (curriculum reader) ----------
function curriculumPhrases() {
  if (!curriculumParsed) return [];
  const list = curriculumParsed.lessons.filter((l) => l.track === (isSw() ? 'swahili' : 'german'));
  const out = [];
  for (const l of list) for (let i = 0; i < l.phrases.length; i++) {
    const ph = l.phrases[i];
    out.push({ key: `cur-phrase-${l.id}-${i}`, lessonId: l.id, lesson: l, ...ph });
  }
  return out;
}
function curriculumPhraseIds() { return curriculumPhrases().map((p) => p.key); }

function renderLessons() {
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('lessons') }));
  if (!curriculumParsed || curriculumParsed.lessonCount === 0) {
    wrap.appendChild(el('p', { class: 'muted', text: t('lessonsComingSoon') }));
    app.appendChild(wrap); return;
  }
  wrap.appendChild(el('p', { class: 'lead', text: t('lessonsIntro') }));
  const lessons = curriculumParsed.lessons.filter((l) => l.track === (isSw() ? 'swahili' : 'german'));
  if (lessons.length === 0) { wrap.appendChild(el('p', { class: 'muted', text: t('lessonsComingSoon') })); app.appendChild(wrap); return; }
  const list = el('div', { class: 'mt' });
  for (const l of lessons) {
    list.appendChild(el('button', { class: 'lesson-card btn btn--ghost', onclick: () => openLesson(l) }, [
      el('span', { class: 'k', text: l.type }), el('span', { class: 'v', text: l.title[state.lang] }), el('span', { class: 'arrow', text: '→' }),
    ]));
  }
  wrap.appendChild(list);
  app.appendChild(wrap);
}

function openLesson(l) {
  state.curriculumList = (curriculumParsed ? curriculumParsed.lessons.filter((x) => x.track === l.track) : [l]);
  state.curriculumIndex = state.curriculumList.findIndex((x) => x.id === l.id);
  state.curriculumPhase = 'read';
  state.curriculumQuizSession = null;
  go('lesson');
}

function renderLessonView() {
  const lesson = state.curriculumList[state.curriculumIndex];
  const wrap = el('div', { class: 'card' });
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.curriculumIndex === 0, onclick: () => { state.curriculumIndex--; state.curriculumPhase = 'read'; state.curriculumQuizSession = null; render(); } }),
    el('span', { class: 'muted', text: `${state.curriculumIndex + 1} / ${state.curriculumList.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.curriculumIndex >= state.curriculumList.length - 1, onclick: () => { state.curriculumIndex++; state.curriculumPhase = 'read'; state.curriculumQuizSession = null; render(); } }),
  ]);
  wrap.appendChild(nav);
  wrap.appendChild(el('h2', { text: lesson.title[state.lang] }));
  wrap.appendChild(el('button', { class: 'btn btn--ghost small', text: t('back'), onclick: () => go('lessons') }));
  if (state.curriculumPhase === 'check' && state.curriculumQuizSession) {
    renderCurriculumQuizContent(wrap, lesson);
    app.appendChild(wrap); return;
  }
  if (state.curriculumPhase === 'check') {
    // hidden body while answering from memory
    wrap.appendChild(el('div', { class: 'notice', text: t('hiddenReading') }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost small', text: t('backToReading'), onclick: () => { state.curriculumPhase = 'read'; state.curriculumQuizSession = null; render(); } }));
    const qs = toQuizQuestions(lesson, state.lang === 'sw' ? 'sw' : 'en');
    if (qs.length) {
      state.curriculumQuizSession = new QuizSession(qs);
    }
    renderCurriculumQuizContent(wrap, lesson);
    app.appendChild(wrap); return;
  }
  // read phase: body + phrases (with flip + Again/Got it) + sources
  wrap.appendChild(el('div', { class: 'lesson-body' }, [el('p', { text: lesson.body[state.lang] })]));
  if (lesson.phrases.length) {
    wrap.appendChild(el('h3', { text: t('lessonPhrases') }));
    for (let i = 0; i < lesson.phrases.length; i++) wrap.appendChild(renderCurriculumPhrase(lesson, i));
  }
  if (lesson.sources.length) {
    wrap.appendChild(el('h3', { text: t('lessonSources') }));
    for (const s of lesson.sources) wrap.appendChild(el('p', { class: 'small' }, [el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.title })]));
  }
  wrap.appendChild(el('button', { class: 'btn btn--accent mt', text: t('readingCheck'), onclick: () => { state.curriculumPhase = 'check'; state.curriculumQuizSession = null; render(); } }));
  app.appendChild(wrap);
}

function renderCurriculumPhrase(lesson, i) {
  const ph = lesson.phrases[i];
  const box = el('div', { class: 'cur-phrase' });
  const front = ph.de || ph.sw;
  box.appendChild(el('div', { class: 'cp-front', text: front }));
  const reveal = el('div', { class: 'cp-reveal', hidden: true });
  reveal.appendChild(el('div', { text: ph.en }));
  if (ph.de) reveal.appendChild(playControl(ph.de, 'inline'));
  box.appendChild(reveal);
  box.appendChild(el('div', { class: 'row small' }, [
    el('button', { class: 'btn btn--ghost small', text: t('flip'), onclick: () => { reveal.hidden = !reveal.hidden; } }),
    el('span', { class: 'spacer' }),
    el('button', { class: 'btn btn--ghost small', text: t('again'), onclick: () => { review.recordFlash(state.track, `cur-phrase-${lesson.id}-${i}`, 'again'); } }),
    el('button', { class: 'btn small', text: t('gotIt'), onclick: () => { review.recordFlash(state.track, `cur-phrase-${lesson.id}-${i}`, 'gotit'); } }),
  ]));
  return box;
}

function renderCurriculumQuizContent(wrap, lesson) {
  const s = state.curriculumQuizSession;
  if (!s) return;
  const q = s.questions[s.answered] || null;
  if (!q) {
    wrap.appendChild(el('p', { class: 'lead', text: `${t('score')}: ${s.score} / ${s.total}` }));
    if (s.mistakes.length > 0) { wrap.appendChild(el('p', { text: `${t('mistakes')}: ${s.mistakes.length}` })); wrap.appendChild(el('button', { class: 'btn btn--block', text: t('retryMistakes'), onclick: () => { state.curriculumQuizSession = new QuizSession(s.retryQuiz()); render(); } })); }
    else wrap.appendChild(el('p', { class: 'muted', text: t('noMistakes') }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('backToReading'), onclick: () => { state.curriculumPhase = 'read'; state.curriculumQuizSession = null; render(); } }));
    return;
  }
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${s.answered} / ${s.total}` }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) list.appendChild(el('li', {}, [el('button', { class: 'option-btn', text: opt, onclick: () => answerCurriculumQuiz(lesson, q, opt) })]));
  wrap.appendChild(list);
}

function answerCurriculumQuiz(lesson, q, chosen) {
  const r = state.curriculumQuizSession.answer(q, chosen);
  if (!r) return;
  review.recordCheck(state.track, 'curriculum', lesson.id, r.correct);
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: lesson.title[state.lang] }));
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${state.curriculumQuizSession.answered} / ${state.curriculumQuizSession.total}` }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) {
    let cls = 'option-btn';
    if (opt === q.correct) cls += ' is-correct';
    else if (opt === chosen) cls += ' is-wrong';
    list.appendChild(el('li', {}, [el('button', { class: cls, text: opt, disabled: true })]));
  }
  wrap.appendChild(list);
  const fb = el('div', { class: 'feedback ' + (r.correct ? 'feedback--ok' : 'feedback--no') }, [el('strong', { text: r.correct ? '✓' : '✗' }), el('span', { text: r.explanation })]);
  wrap.appendChild(fb);
  wrap.appendChild(el('button', { class: 'btn btn--block mt', text: t('next'), onclick: render }));
  clear(app); app.appendChild(wrap);
}

// ---------- roadmap ----------
function renderRoadmap() {
  const levels = [
    { l: 'A1', en: 'Start Deutsch 1 — greet, introduce yourself, simple questions', sw: 'Kusalimu, kujitambulisha, maswali rahisi', done: true },
    { l: 'A2', en: 'Basic user: everyday topics', sw: 'Mtumiaji msingi: mada za kila siku', done: false },
    { l: 'B1', en: 'Independent user: deal with everyday situations', sw: 'Mtumiaji bia: kukabiliana na mambo ya kila siku', done: false },
    { l: 'B2', en: 'Independent user: explain opinions, viewpoints', sw: 'Kueleza maoni na mitazamo', done: false },
    { l: 'C1', en: 'Proficient user', sw: 'Mtumiaji mahiri', done: false },
    { l: 'C2', en: 'Proficient user — near-native', sw: 'Mtumiaji mahiri kabisa', done: false },
  ];
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('roadmap') }));
  wrap.appendChild(el('p', { class: 'lead', text: t('roadIntro') }));
  wrap.appendChild(el('div', { class: 'notice', text: t('roadGuidance') }));
  const list = el('div', { class: 'road-list' });
  for (const lv of levels) {
    const row = el('div', { class: 'road-row' + (lv.done ? ' is-done' : '') }, [
      el('span', { class: 'road-level', text: lv.l }),
      el('span', { class: 'v', text: lv[state.lang] }),
      lv.done ? el('span', { class: 'road-cur', text: '★' }) : el('span', { class: 'road-guide', text: '·' }),
    ]);
    list.appendChild(row);
  }
  wrap.appendChild(list);
  wrap.appendChild(el('p', { class: 'mt' }, [el('a', { href: 'https://www.goethe.de/ins/us/en/spr/prf.html', target: '_blank', rel: 'noopener noreferrer', text: t('roadGoethe') })]));
    wrap.appendChild(el('p', { class: 'mt' }, [el('a', { href: './levels.html', text: isSw() ? 'Baada ya A1: mwongozo' : 'After A1: study guide' })]));
  app.appendChild(wrap);
    }

// ---------- daily path (completion comes from real attempts) ----------
function pathSteps() {
  const defs = isSw() ? [
    ['lessons', 'curriculum', t('lessons')], ['flashcards', 'flash', t('flashcards')],
  ] : [
    ['vocab', 'vocab', t('vocab')], ['quiz', 'vocab', t('quiz')], ['grammar', 'grammar', t('grammar')],
    ['reading', 'reading', t('reading')], ['listening', 'listening', t('listening')], ['flashcards', 'flash', t('flashcards')],
  ];
  return defs.map(([view, type, label]) => ({ id: `${state.track}-${type}`, view, type, label }));
}

function renderPath() {
  const steps = pathSteps();
  const doneCount = steps.filter((s) => review.isActivityDone(state.track, s.type, today())).length;
  const list = el('div', { class: 'mt' });
  for (const s of steps) {
    const isDone = review.isActivityDone(state.track, s.type, today());
    list.appendChild(el('div', { class: 'path-step' }, [
      el('span', { class: 'path-check' + (isDone ? ' is-done' : ''), text: isDone ? '✓' : '' }),
      el('span', { text: s.label }), el('span', { class: 'spacer' }),
      el('button', { class: 'btn btn--ghost small', text: isDone ? t('done') : t('start'), onclick: () => go(s.view) }),
    ]));
  }
  const summary = doneCount >= steps.length
    ? el('p', { class: 'lead', text: t('pathDone') })
    : el('p', { class: 'muted', text: `${doneCount} ${t('pathProgress')} ${steps.length} ${t('activities')}` + (doneCount === 0 ? ` — ${t('pathNothingYet')}` : '') });
  app.appendChild(el('div', { class: 'card' }, [el('h2', { text: t('dailyPath') }), summary, list]));
}

// ---------- progress ----------
function renderProgress() {
  const s = review.stats(state.track, today());
  const fam = review.stats(state.track, today()).flash.familiar;
  const rows = el('div', { class: 'mt' });
  rows.appendChild(el('div', { class: 'stat-row' }, [el('span', { class: 'k', text: t('objective') }), el('span', { class: 'v', text: String(s.objective.attempts) })]));
  rows.appendChild(el('div', { class: 'stat-row' }, [el('span', { class: 'k', text: t('score') }), el('span', { class: 'v', text: `${s.objective.correct} / ${s.objective.attempts}` })]));
  rows.appendChild(el('div', { class: 'stat-row' }, [el('span', { class: 'k', text: t('weak') }), el('span', { class: 'v', text: String(s.weak) })]));
  rows.appendChild(el('div', { class: 'stat-row' }, [el('span', { class: 'k', text: t('due') }), el('span', { class: 'v', text: String(s.dueToday) })]));
  rows.appendChild(el('div', { class: 'stat-row' }, [el('span', { class: 'k', text: t('familiar') }), el('span', { class: 'v', text: String(fam) })]));
  rows.appendChild(el('p', { class: 'muted small', text: t('selfAssessNote') }));
  const resetBtn = el('button', { class: 'btn btn--danger btn--block mt', text: t('resetProgress'), onclick: confirmReset });
  app.appendChild(el('div', { class: 'card' }, [el('h2', { text: t('progress') }), rows, resetBtn]));
}

function confirmReset() {
  modalRoot.hidden = false;
  clear(modalRoot);
  const modal = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, [
    el('h3', { text: t('resetProgress') }), el('p', { text: t('resetConfirm') }),
    el('div', { class: 'modal-actions' }, [
      el('button', { class: 'btn btn--ghost', text: t('cancel'), onclick: closeModal }),
      el('button', { class: 'btn btn--danger', text: t('confirm'), onclick: () => { review.reset(); closeModal(); render(); } }),
    ]),
  ]);
  modalRoot.appendChild(modal);
}
function closeModal() { modalRoot.hidden = true; clear(modalRoot); }

// ---------- daily news ----------
function playSrc(url) {
  return el('button', { class: 'play-btn', 'aria-label': t('play'), title: t('play'),
    onclick: (e) => { e.stopPropagation(); playUrl(url); } }, ['▶']);
}

function buildNewsQuiz(n) {
  const lesson = n.lesson;
  const lang = state.lang === 'sw' ? 'sw' : 'en';
  const options = (lesson.options || []).map((o) => o[lang]);
  const correct = (lesson.options && lesson.options[lesson.correctIndex]) ? lesson.options[lesson.correctIndex][lang] : '';
  return new QuizSession([{ id: 'news-' + (n.date || 'x'), prompt: (lesson.question && lesson.question[lang]) || '', options, correct, explanation: (lesson.explanation && lesson.explanation[lang]) || '' }]);
}

function renderNews() {
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('news') }));
  if (!state.news || !Array.isArray(state.news.items) || state.news.items.length === 0) {
    wrap.appendChild(el('p', { class: 'muted', text: t('newsNoEdition') }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost', text: t('back'), onclick: () => go('home') }));
    app.appendChild(wrap); return;
  }
  const n = state.news;
  wrap.appendChild(el('p', { class: 'muted small', text: `${t('newsDate')}: ${n.date || ''}` }));
  if (Array.isArray(n.audio)) {
    for (const a of n.audio) {
      if (a && a.src) {
        wrap.appendChild(el('div', { class: 'row small' }, [
          el('span', { text: (a.language === 'de' ? 'Deutsch' : 'English') + ' · ' + (a.transcript || '') }),
          el('span', { class: 'spacer' }), playSrc(a.src),
        ]));
      }
    }
  }
  for (const it of n.items) {
    const card = el('div', { class: 'news-item' });
    card.appendChild(el('div', { class: 'news-region', text: it.region }));
    card.appendChild(el('h3', { text: it.title[state.lang] }));
    card.appendChild(el('p', { text: it.summary[state.lang] }));
    if (it.sourceUrl) card.appendChild(el('p', { class: 'small' }, [el('a', { href: it.sourceUrl, target: '_blank', rel: 'noopener noreferrer', text: t('newsSource') })]));
    wrap.appendChild(card);
  }
  if (n.lesson && n.lesson.question) {
    wrap.appendChild(el('h3', { class: 'mt', text: t('newsLesson') }));
    wrap.appendChild(el('p', { text: n.lesson[state.lang] }));
    if (state.newsPhase === 'check' && state.newsQuizSession) {
      renderNewsQuiz(wrap, n);
    } else {
      wrap.appendChild(el('button', { class: 'btn btn--accent mt', text: t('newsQuestion'), onclick: () => { state.newsPhase = 'check'; state.newsQuizSession = buildNewsQuiz(n); render(); } }));
    }
  }
  app.appendChild(wrap);
}

function renderNewsQuiz(wrap, n) {
  const s = state.newsQuizSession;
  const q = s.questions[s.answered] || null;
  if (!q) {
    wrap.appendChild(el('p', { class: 'lead', text: `${t('score')}: ${s.score} / ${s.total}` }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('back'), onclick: () => { state.newsPhase = 'read'; state.newsQuizSession = null; render(); } }));
    return;
  }
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) list.appendChild(el('li', {}, [el('button', { class: 'option-btn', text: opt, onclick: () => answerNewsQuiz(n, q, opt) })]));
  wrap.appendChild(list);
}

function answerNewsQuiz(n, q, chosen) {
  const r = state.newsQuizSession.answer(q, chosen);
  if (!r) return;
  review.recordCheck(state.track, 'news', n.date || 'news', r.correct);
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('news') }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) {
    let cls = 'option-btn';
    if (opt === q.correct) cls += ' is-correct';
    else if (opt === chosen) cls += ' is-wrong';
    list.appendChild(el('li', {}, [el('button', { class: cls, text: opt, disabled: true })]));
  }
  wrap.appendChild(list);
  const fb = el('div', { class: 'feedback ' + (r.correct ? 'feedback--ok' : 'feedback--no') }, [el('strong', { text: r.correct ? '✓' : '✗' }), el('span', { text: r.explanation })]);
  wrap.appendChild(fb);
  wrap.appendChild(el('button', { class: 'btn btn--block mt', text: t('done'), onclick: () => { state.newsPhase = 'read'; state.newsQuizSession = null; render(); } }));
  clear(app); app.appendChild(wrap);
}

// ---------- helpers ----------
function comingSoon(msg) {
  return el('div', { class: 'card' }, [el('h2', { text: '…' }), el('p', { class: 'muted', text: msg }), el('button', { class: 'btn btn--ghost', text: t('back'), onclick: () => go('home') })]);
}

// ---------- init ----------
const ENVS = {
  audio: 'data/audio-manifest.json',
  curriculum: 'data/learning-curriculum.json',
  news: 'data/daily-news.json',
};

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function init() {
  const [audioJson] = await Promise.all([fetchJson(ENVS.audio)]);
  audioManifest = audioJson ? parseAudioManifest(audioJson) : emptyAudioManifest();
  const curJson = typeof window !== 'undefined' && window.__CURRICULUM_JSON__ ? window.__CURRICULUM_JSON__ : await fetchJson(ENVS.curriculum);
    curriculumParsed = curJson ? parseCurriculum(curJson) : null;
      state.news = await fetchJson(ENVS.news);
      bindHeader();
  if (!storage.isAvailable()) footerNote.textContent = t('storageUnavailable');
  render();
}

function bindHeader() {
  document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  document.querySelector('.brand').addEventListener('click', () => go('home'));
  modalRoot.addEventListener('click', (e) => { if (e.target === modalRoot) closeModal(); });
}

// allow tests to inject curriculum JSON without touching data files
window.__injectCurriculum__ = (obj) => { curriculumParsed = obj ? parseCurriculum(obj) : null; render(); };
window.__injectAudioManifest__ = (obj) => { audioManifest = obj ? parseAudioManifest(obj) : emptyAudioManifest(); render(); };
window.__audioEl = audioEl; // test hook: shared playback element

init();
