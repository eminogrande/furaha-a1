// Furaha A1 — main application. View router + all activities.
// Safe DOM building only: user text is never injected via innerHTML.

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
import { buildDailyPath, isPathDone } from './studyPath.js';
import { createProgress } from './progress.js';
import { createStorage } from './storage.js';

// ---------- i18n ----------
const I18N = {
  en: {
    tagline: 'Learn German A1 — with English and Swahili support.',
    decide: 'Decide',
    learn: 'Learn',
    vocab: 'Vocabulary',
    flashcards: 'Flashcards',
    quiz: 'Quiz',
    grammar: 'Grammar',
    reading: 'Reading',
    writing: 'Writing',
    speaking: 'Speaking',
    progress: 'My progress',
    dailyPath: 'Today\u2019s path',
    search: 'Search German, English or Swahili\u2026',
    allTopics: 'All topics',
    flip: 'Tap to flip',
    next: 'Next',
    prev: 'Previous',
    back: 'Back',
    check: 'Check',
    retryMistakes: 'Retry mistakes',
    newQuiz: 'New quiz',
    showTranslation: 'Show translation',
    hideTranslation: 'Hide translation',
    wordCount: 'words',
    modelExample: 'Model example',
    modelEn: 'English',
    resetProgress: 'Reset progress',
    resetConfirm: 'Reset all progress? This cannot be undone.',
    cancel: 'Cancel',
    confirm: 'Reset',
    done: 'Done',
    score: 'Score',
    answered: 'Answered',
    total: 'Total',
    mistakes: 'Mistakes',
    noMistakes: 'No mistakes — well done!',
    notOfficial: 'This is original practice material, not an official Goethe test.',
    storageUnavailable: 'Progress cannot be saved (storage unavailable). Your work still works in this session.',
    pathDone: 'Today\u2019s path complete. Well done!',
    pathProgress: 'of',
    activities: 'activities',
    completed: 'completed',
    start: 'Start',
    continue: 'Continue',
    home: 'Home',
    writingNote: 'There is no automatic grading here. Compare your text with the model example and check your own work.',
    speakingNote: 'Read the prompt aloud and try to answer. Then compare with the model answer.',
    grammarPractice: 'Practice',
    readingQuestions: 'Questions',
    chooseTopic: 'Choose a topic',
    all: 'All',
    proverbs: 'Proverbs & sayings',
    proverbIntro: 'Common German sayings and authentic Swahili proverbs, with meanings in English and Swahili.',
    proverbEnrich: 'Enrichment material \u2014 beyond the required A1 course; some idioms go above A1 level.',
    startProverbQuiz: 'Start proverb quiz',
    germanSaying: 'German saying',
    swahiliProverb: 'Swahili proverb',
    germanChip: 'German sayings',
    swahiliChip: 'Swahili proverbs',
    proverbMeaning: 'Meaning',
    proverbLiteral: 'Literal',
    proverbNote: 'Notes',
    proverbSource: 'Source',
    proverbSourceNote: 'Source',
    audioLabel: 'AI-generated Nuri voice / Sauti ya Nuri iliyotengenezwa kwa AI',
    audioTranscriptDe: '\u00dcbung macht den Meister. Aller Anfang ist schwer. Eile mit Weile. Schritt f\u00fcr Schritt lerne ich Deutsch.',
    audioTranscriptEn: 'Practice makes perfect. Every beginning is hard. More haste, less speed. Step by step I learn German.',
    audioTranscriptSw: 'Kujizoeza huja ustadi. Mwanzo wa kila kitu ni mgumu. Haraka haina baraka. Hatua kwa hatua najifunza Kijerumani.',
  },
  sw: {
    tagline: 'Jifunze Kijerumani A1 — kwa msaada wa Kiingereza na Kiswahili.',
    decide: 'Chagua',
    learn: 'Jifunze',
    vocab: 'Msamiati',
    flashcards: 'Kadi za kumbukumbu',
    quiz: 'Maswali',
    grammar: 'Sarufi',
    reading: 'Kusoma',
    writing: 'Kuandika',
    speaking: 'Kusema',
    progress: 'Maendeleo yangu',
    dailyPath: 'Njia ya leo',
    search: 'Tafuta Kijerumani, Kiingereza au Kiswahili\u2026',
    allTopics: 'Mada zote',
    flip: 'Bonyeza kugeuza',
    next: 'Inayofuata',
    prev: 'Iliyopita',
    back: 'Rudi',
    check: 'Angalia',
    retryMistakes: 'Rudia makosa',
    newQuiz: 'Maswali mapya',
    showTranslation: 'Onyesha tafsiri',
    hideTranslation: 'Ficha tafsiri',
    wordCount: 'maneno',
    modelExample: 'Mfano wa kielelezo',
    modelEn: 'Kiingereza',
    resetProgress: 'Futa maendeleo',
    resetConfirm: 'Futa maendeleo yote? Hili haliwezi kurejeshwa.',
    cancel: 'Ghairi',
    confirm: 'Futa',
    done: 'Imekamilika',
    score: 'Alama',
    answered: 'Umejibu',
    total: 'Jumla',
    mistakes: 'Makosa',
    noMistakes: 'Hakuna makosa — umefanya vizuri!',
    notOfficial: 'Hii ni mazoezi ya asili, si mtihani rasmi wa Goethe.',
    storageUnavailable: 'Maendeleo hayawezi kuhifadhiwa (hifadhi haipatikani). Kazi yako bado inafanya kazi katika kikao hiki.',
    pathDone: 'Njia ya leo imekamilika. Umefanya vizuri!',
    pathProgress: 'kati ya',
    activities: 'shughuli',
    completed: 'zimekamilika',
    start: 'Anza',
    continue: 'Endelea',
    home: 'Nyumbani',
    writingNote: 'Hakuna ukadiriaji wa kiotomatiki hapa. Linganisha maandishi yako na mfano na uangalie kazi yako mwenyewe.',
    speakingNote: 'Soma swali kwa sauti na ujaribu kujibu. Kisha linganisha na jibu la mfano.',
    grammarPractice: 'Mazoezi',
    readingQuestions: 'Maswali',
    chooseTopic: 'Chagua mada',
    all: 'Zote',
    proverbs: 'Methali na misemo',
    proverbIntro: 'Misemo ya Kijerumani na methali halisi za Kiswahili, na maana kwa Kiingereza na Kiswahili.',
    proverbEnrich: 'Nyongeza ya kujifunza \u2014 zaidi ya kozi ya A1; baadhi ya misemo ipo juu ya kiwango cha A1.',
    startProverbQuiz: 'Anza maswali ya methali',
    germanSaying: 'Misemo ya Kijerumani',
    swahiliProverb: 'Methali ya Kiswahili',
    germanChip: 'Misemo ya Kijerumani',
    swahiliChip: 'Methali za Kiswahili',
    proverbMeaning: 'Maana',
    proverbLiteral: 'Tafsiri halisi',
    proverbNote: 'Maelezo',
    proverbSource: 'Chanzo',
    proverbSourceNote: 'Chanzo',
    audioLabel: 'AI-generated Nuri voice / Sauti ya Nuri iliyotengenezwa kwa AI',
    audioTranscriptDe: '\u00dcbung macht den Meister. Aller Anfang ist schwer. Eile mit Weile. Schritt f\u00fcr Schritt lerne ich Deutsch.',
    audioTranscriptEn: 'Practice makes perfect. Every beginning is hard. More haste, less speed. Step by step I learn German.',
    audioTranscriptSw: 'Kujizoeza huja ustadi. Mwanzo wa kila kitu ni mgumu. Haraka haina baraka. Hatua kwa hatua najifunza Kijerumani.',
  },
};

// ---------- state ----------
const storage = createStorage();
const progress = createProgress();
const state = {
  lang: 'en',
  view: 'home',
  quizSession: null,
  quizQuestions: null,
  flashIndex: 0,
  flashTopic: 'all',
  flashFlipped: false,
  vocabTopic: 'all',
  vocabQuery: '',
  readingIndex: 0,
  readingShowTr: false,
  writingIndex: 0,
  speakingIndex: 0,
  grammarIndex: 0,
  proverbType: 'all',
  proverbQuery: '',
  proverbShowTr: false,
  proverbQuizSession: null,
  proverbQuizQuestions: null,
  pathCompleted: new Set(),
};

const app = document.getElementById('app');
const footerNote = document.getElementById('footer-note');
const modalRoot = document.getElementById('modal-root');

function t(key) { return I18N[state.lang][key] || key; }

// ---------- safe DOM helpers ----------
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v; // only for trusted static markup
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

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
  const views = {
    home: renderHome,
    vocab: renderVocab,
    flashcards: renderFlashcards,
    quiz: renderQuiz,
    grammar: renderGrammar,
    reading: renderReading,
    writing: renderWriting,
    speaking: renderSpeaking,
    progress: renderProgress,
    path: renderPath,
    proverbs: renderProverbs,
  };
  (views[state.view] || renderHome)();
  app.focus();
}

function go(view) {
  state.view = view;
  render();
}

// ---------- home ----------
function renderHome() {
  const hero = el('div', { class: 'home-hero' }, [
    el('h1', { text: 'Furaha A1' }),
    el('p', { class: 'lead', text: t('tagline') }),
  ]);
  const list = el('div', { class: 'activity-list' });
  const activities = [
    ['vocab', t('vocab')],
    ['flashcards', t('flashcards')],
    ['quiz', t('quiz')],
    ['grammar', t('grammar')],
    ['reading', t('reading')],
    ['writing', t('writing')],
    ['speaking', t('speaking')],
    ['proverbs', t('proverbs')],
    ['path', t('dailyPath')],
    ['progress', t('progress')],
  ];
  for (const [view, label] of activities) {
    list.appendChild(el('button', {
      class: 'activity-card',
      onclick: () => go(view),
    }, [
      el('span', { text: label }),
      el('span', { class: 'arrow', text: '\u2192' }),
    ]));
  }
  app.appendChild(el('div', { class: 'card' }, [hero, list]));
}

// ---------- vocabulary ----------
function renderVocab() {
  const chips = el('div', { class: 'topic-chips' }, [
    el('button', { class: 'chip' + (state.vocabTopic === 'all' ? ' is-active' : ''), onclick: () => { state.vocabTopic = 'all'; render(); } }, [t('allTopics')]),
  ]);
  for (const id of TOPIC_IDS) {
    chips.appendChild(el('button', {
      class: 'chip' + (state.vocabTopic === id ? ' is-active' : ''),
      onclick: () => { state.vocabTopic = id; render(); },
    }, [TOPICS[id][state.lang]]));
  }
  const search = el('input', {
    type: 'search', placeholder: t('search'), value: state.vocabQuery,
    oninput: (e) => { state.vocabQuery = e.target.value; renderList(); },
  });
  const listWrap = el('div', { id: 'vocab-list' });
  function renderList() {
    clear(listWrap);
    let words = filterVocab(vocabulary, { topic: state.vocabTopic });
    words = searchVocab(words, state.vocabQuery);
    if (words.length === 0) {
      listWrap.appendChild(el('p', { class: 'muted', text: '—' }));
      return;
    }
    for (const w of words) {
      const de = el('div', { class: 'vocab-de' });
      if (w.article) de.appendChild(el('span', { class: 'vocab-article', text: w.article + ' ' }));
      de.appendChild(document.createTextNode(w.word));
      const tr = el('div', { class: 'vocab-tr', text: `${w.en} \u00b7 ${w.sw}` });
      const ex = el('div', { class: 'vocab-example' }, [
        el('div', { text: w.example.de }),
        el('div', { text: `${w.example.en} \u00b7 ${w.example.sw}` }),
      ]);
      const topic = el('div', { class: 'vocab-topic', text: TOPICS[w.topic][state.lang] });
      listWrap.appendChild(el('div', { class: 'vocab-item' }, [
        el('div', {}, [de, tr, ex]),
        topic,
      ]));
    }
  }
  renderList();
  app.appendChild(el('div', { class: 'card' }, [
    el('h2', { text: t('vocab') }),
    el('p', { class: 'muted small', text: `${vocabulary.length} ${t('activities')}` }),
    search,
    chips,
    listWrap,
  ]));
}

// ---------- flashcards ----------
function renderFlashcards() {
  const chips = el('div', { class: 'topic-chips' }, [
    el('button', { class: 'chip' + (state.flashTopic === 'all' ? ' is-active' : ''), onclick: () => { state.flashTopic = 'all'; state.flashIndex = 0; state.flashFlipped = false; render(); } }, [t('allTopics')]),
  ]);
  for (const id of TOPIC_IDS) {
    chips.appendChild(el('button', {
      class: 'chip' + (state.flashTopic === id ? ' is-active' : ''),
      onclick: () => { state.flashTopic = id; state.flashIndex = 0; state.flashFlipped = false; render(); },
    }, [TOPICS[id][state.lang]]));
  }
  const words = filterVocab(vocabulary, { topic: state.flashTopic });
  const idx = Math.min(state.flashIndex, words.length - 1);
  const w = words[idx];
  const card = el('div', { class: 'card flashcard', onclick: () => { state.flashFlipped = !state.flashFlipped; render(); } });
  if (state.flashFlipped) {
    card.appendChild(el('div', { class: 'fc-back' }, [
      el('div', { text: w.de }),
      el('div', { class: 'tr', text: `${w.en} \u00b7 ${w.sw}` }),
      el('div', { class: 'fc-hint', text: w.example.de }),
    ]));
  } else {
    card.appendChild(el('div', { class: 'fc-front', text: w.de }));
    card.appendChild(el('div', { class: 'fc-hint', text: t('flip') }));
  }
  const controls = el('div', { class: 'flashcard-controls' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: idx === 0, onclick: () => { state.flashIndex = Math.max(0, idx - 1); state.flashFlipped = false; render(); } }),
    el('span', { class: 'muted', text: `${idx + 1} / ${words.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: idx >= words.length - 1, onclick: () => { state.flashIndex = Math.min(words.length - 1, idx + 1); state.flashFlipped = false; render(); } }),
  ]);
  app.appendChild(el('div', { class: 'card' }, [
    el('h2', { text: t('flashcards') }),
    chips,
    card,
    controls,
  ]));
}

// ---------- quiz ----------
function startQuiz() {
  state.quizQuestions = buildQuiz(vocabulary, 8);
  state.quizSession = new QuizSession(state.quizQuestions);
  render();
}

function renderQuiz() {
  const wrap = el('div', { class: 'card' });
  if (!state.quizSession) {
    wrap.appendChild(el('h2', { text: t('quiz') }));
    wrap.appendChild(el('p', { class: 'lead', text: t('tagline') }));
    wrap.appendChild(el('button', { class: 'btn btn--block', text: t('start'), onclick: startQuiz }));
    app.appendChild(wrap);
    return;
  }
  const s = state.quizSession;
  const q = s.questions[s.answered] || null;
  if (!q) {
    // quiz finished
    wrap.appendChild(el('h2', { text: t('quiz') }));
    wrap.appendChild(el('p', { class: 'lead', text: `${t('score')}: ${s.score} / ${s.total}` }));
    if (s.mistakes.length > 0) {
      wrap.appendChild(el('p', { text: `${t('mistakes')}: ${s.mistakes.length}` }));
      wrap.appendChild(el('button', { class: 'btn btn--block', text: t('retryMistakes'), onclick: () => { state.quizSession = new QuizSession(s.retryQuiz()); render(); } }));
    } else {
      wrap.appendChild(el('p', { class: 'muted', text: t('noMistakes') }));
    }
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('newQuiz'), onclick: startQuiz }));
    app.appendChild(wrap);
    return;
  }
  wrap.appendChild(el('h2', { text: t('quiz') }));
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${s.answered} / ${s.total}` }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) {
    list.appendChild(el('li', {}, [
      el('button', { class: 'option-btn', text: opt, onclick: () => answerQuiz(q, opt) }),
    ]));
  }
  wrap.appendChild(list);
  app.appendChild(wrap);
}

function answerQuiz(q, chosen) {
  const r = state.quizSession.answer(q, chosen);
  if (!r) return;
  // re-render with feedback
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
  const fb = el('div', { class: 'feedback ' + (r.correct ? 'feedback--ok' : 'feedback--no') }, [
    el('strong', { text: r.correct ? '\u2713' : '\u2717' }),
    el('span', { text: r.explanation }),
  ]);
  wrap.appendChild(fb);
  const nextLabel = state.quizSession.answered >= state.quizSession.total ? t('done') : t('next');
  wrap.appendChild(el('button', { class: 'btn btn--block mt', text: nextLabel, onclick: () => { progress.record('quiz', 'all'); render(); } }));
  clear(app);
  app.appendChild(wrap);
}

// ---------- grammar ----------
function renderGrammar() {
  const lesson = grammarLessons[state.grammarIndex];
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.grammarIndex === 0, onclick: () => { state.grammarIndex--; render(); } }),
    el('span', { class: 'muted', text: `${state.grammarIndex + 1} / ${grammarLessons.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.grammarIndex >= grammarLessons.length - 1, onclick: () => { state.grammarIndex++; render(); } }),
  ]);
  const table = el('table', { class: 'grammar-table' }, [
    el('thead', {}, [el('tr', {}, [el('th', { text: 'Deutsch' }), el('th', { text: 'English' }), el('th', { text: 'Kiswahili' })])]),
    el('tbody', {}, lesson.table.map((row) => el('tr', {}, row.map((c) => el('td', { text: c }))))),
  ]);
  const practice = el('div', { class: 'mt' }, [el('h3', { text: t('grammarPractice') })]);
  for (const p of lesson.practice) {
    practice.appendChild(renderGrammarItem(p));
  }
  app.appendChild(el('div', { class: 'card' }, [
    nav,
    el('h2', { text: lesson.title }),
    el('p', { text: lesson.en }),
    el('p', { class: 'muted', text: lesson.sw }),
    table,
    practice,
  ]));
}

function renderGrammarItem(p) {
  const box = el('div', { class: 'mb' });
  box.appendChild(el('p', { text: p.q }));
  const opts = el('div', { class: 'row' });
  for (const o of p.options) {
    opts.appendChild(el('button', { class: 'btn btn--ghost', text: o, onclick: () => {
      const correct = o === p.correct;
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
      box.appendChild(el('div', { class: 'feedback ' + (correct ? 'feedback--ok' : 'feedback--no') }, [
        el('span', { text: (correct ? '\u2713 ' : '\u2717 ') + p.why }),
      ]));
    } }));
  }
  box.appendChild(opts);
  return box;
}

// ---------- reading ----------
function renderReading() {
  const p = readingPassages[state.readingIndex];
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.readingIndex === 0, onclick: () => { state.readingIndex--; render(); } }),
    el('span', { class: 'muted', text: `${state.readingIndex + 1} / ${readingPassages.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.readingIndex >= readingPassages.length - 1, onclick: () => { state.readingIndex++; render(); } }),
  ]);
  const passage = el('div', { class: 'passage' }, [el('p', { text: p.de })]);
  const toggle = el('button', {
    class: 'btn btn--ghost translation-toggle',
    text: state.readingShowTr ? t('hideTranslation') : t('showTranslation'),
    onclick: () => { state.readingShowTr = !state.readingShowTr; render(); },
  });
  const wrap = el('div', { class: 'card' }, [nav, el('h2', { text: p.title }), passage, toggle]);
  if (state.readingShowTr) {
    wrap.appendChild(el('div', { class: 'model-box' }, [
      el('div', { class: 'de', text: p.en }),
      el('div', { class: 'en', text: p.sw }),
    ]));
  }
  wrap.appendChild(el('h3', { class: 'mt', text: t('readingQuestions') }));
  for (const q of p.questions) {
    wrap.appendChild(renderReadingQuestion(q));
  }
  app.appendChild(wrap);
}

function renderReadingQuestion(q) {
  const box = el('div', { class: 'mb' });
  box.appendChild(el('p', { text: q.q }));
  const opts = el('div', { class: 'row' });
  for (const o of q.options) {
    opts.appendChild(el('button', { class: 'btn btn--ghost', text: o, onclick: () => {
      const correct = o === q.correct;
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
      box.appendChild(el('div', { class: 'feedback ' + (correct ? 'feedback--ok' : 'feedback--no') }, [
        el('span', { text: (correct ? '\u2713 ' : '\u2717 ') + q.why }),
      ]));
    } }));
  }
  box.appendChild(opts);
  return box;
}

// ---------- writing ----------
function renderWriting() {
  const p = writingPrompts[state.writingIndex];
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.writingIndex === 0, onclick: () => { state.writingIndex--; render(); } }),
    el('span', { class: 'muted', text: `${state.writingIndex + 1} / ${writingPrompts.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.writingIndex >= writingPrompts.length - 1, onclick: () => { state.writingIndex++; render(); } }),
  ]);
  const count = el('div', { class: 'word-count' });
  const textarea = el('textarea', {
    placeholder: '...',
    oninput: (e) => { count.textContent = `${countWords(e.target.value)} ${t('wordCount')}`; },
  });
  const model = el('div', { class: 'model-box' }, [
    el('div', { class: 'de', text: p.model }),
    el('div', { class: 'en', text: p.modelEn }),
  ]);
  app.appendChild(el('div', { class: 'card' }, [
    nav,
    el('h2', { text: p.title }),
    el('p', { text: p.prompt }),
    el('p', { class: 'muted', text: p.promptSw }),
    el('div', { class: 'field' }, [el('label', { text: t('writing') }), textarea, count]),
    el('div', { class: 'notice', text: t('writingNote') }),
    el('h3', { text: t('modelExample') }),
    model,
  ]));
}

// ---------- speaking ----------
function renderSpeaking() {
  const p = speakingPrompts[state.speakingIndex];
  const nav = el('div', { class: 'row mb' }, [
    el('button', { class: 'btn btn--ghost', text: t('prev'), disabled: state.speakingIndex === 0, onclick: () => { state.speakingIndex--; render(); } }),
    el('span', { class: 'muted', text: `${state.speakingIndex + 1} / ${speakingPrompts.length}` }),
    el('button', { class: 'btn btn--ghost', text: t('next'), disabled: state.speakingIndex >= speakingPrompts.length - 1, onclick: () => { state.speakingIndex++; render(); } }),
  ]);
  const model = el('div', { class: 'model-box' }, [
    el('div', { class: 'de', text: p.model }),
    el('div', { class: 'en', text: p.modelEn }),
  ]);
  app.appendChild(el('div', { class: 'card' }, [
    nav,
    el('h2', { text: p.title }),
    el('div', { class: 'speak-prompt', text: p.prompt }),
    el('div', { class: 'speak-sw', text: p.promptSw }),
    el('div', { class: 'notice', text: t('speakingNote') }),
    el('h3', { text: t('modelExample') }),
    model,
  ]));
}

// ---------- daily path ----------
function renderPath() {
  const today = new Date().toISOString().slice(0, 10);
  const path = buildDailyPath(today);
  const saved = storage.get('furaha.path', {});
  const completed = new Set(saved[today] || []);
  const done = isPathDone(path, completed);
  const list = el('div', { class: 'mt' });
  for (const step of path) {
    const isDone = completed.has(step.id);
    const check = el('span', { class: 'path-check' + (isDone ? ' is-done' : ''), text: isDone ? '\u2713' : '' });
    const label = el('span', { text: step.label });
    const btn = el('button', {
      class: 'btn btn--ghost small',
      text: isDone ? t('done') : t('start'),
      onclick: () => {
        const target = { vocab: 'vocab', quiz: 'quiz', grammar: 'grammar', reading: 'reading', writing: 'writing', speaking: 'speaking' }[step.type];
        if (target) go(target);
      },
    });
    list.appendChild(el('div', { class: 'path-step' }, [check, label, el('span', { class: 'spacer' }), btn]));
  }
  const summary = done
    ? el('p', { class: 'lead', text: t('pathDone') })
    : el('p', { class: 'muted', text: `${completed.size} ${t('pathProgress')} ${path.length} ${t('activities')}` });
  app.appendChild(el('div', { class: 'card' }, [
    el('h2', { text: t('dailyPath') }),
    summary,
    list,
  ]));
}

// ---------- progress ----------
function renderProgress() {
  const s = progress.stats();
  const rows = el('div', { class: 'mt' });
  const order = [['vocab', t('vocab')], ['quiz', t('quiz')], ['grammar', t('grammar')], ['reading', t('reading')], ['writing', t('writing')], ['speaking', t('speaking')]];
  for (const [k, label] of order) {
    rows.appendChild(el('div', { class: 'stat-row' }, [
      el('span', { class: 'k', text: label }),
      el('span', { class: 'v', text: String(s.byType[k] || 0) }),
    ]));
  }
  rows.appendChild(el('div', { class: 'stat-row' }, [
    el('span', { class: 'k', text: t('total') }),
    el('span', { class: 'v', text: String(s.total) }),
  ]));
  if (s.lastDate) {
    rows.appendChild(el('div', { class: 'stat-row' }, [
      el('span', { class: 'k', text: t('answered') }),
      el('span', { class: 'v', text: s.lastDate }),
    ]));
  }
  const resetBtn = el('button', { class: 'btn btn--danger btn--block mt', text: t('resetProgress'), onclick: confirmReset });
  app.appendChild(el('div', { class: 'card' }, [
    el('h2', { text: t('progress') }),
    rows,
    resetBtn,
  ]));
}

function confirmReset() {
  modalRoot.hidden = false;
  clear(modalRoot);
  const modal = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, [
    el('h3', { text: t('resetProgress') }),
    el('p', { text: t('resetConfirm') }),
    el('div', { class: 'modal-actions' }, [
      el('button', { class: 'btn btn--ghost', text: t('cancel'), onclick: closeModal }),
      el('button', { class: 'btn btn--danger', text: t('confirm'), onclick: () => { progress.reset(); closeModal(); render(); } }),
    ]),
  ]);
  modalRoot.appendChild(modal);
}

function closeModal() {
  modalRoot.hidden = true;
  clear(modalRoot);
}

// ---------- proverbs ----------
function startProverbQuiz() {
  state.proverbQuizQuestions = buildProverbQuiz(proverbs, 8);
  state.proverbQuizSession = new QuizSession(state.proverbQuizQuestions);
  render();
}

function renderProverbs() {
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('h2', { text: t('proverbs') }));
  if (state.proverbQuizSession) {
    renderProverbQuizContent(wrap);
    app.appendChild(wrap);
    return;
  }
  wrap.appendChild(el('p', { class: 'lead', text: t('proverbIntro') }));
  wrap.appendChild(el('div', { class: 'notice', text: t('proverbEnrich') }));
  wrap.appendChild(renderAudioPreview());
  const search = el('input', {
    type: 'search', placeholder: t('search'), value: state.proverbQuery,
    oninput: (e) => { state.proverbQuery = e.target.value; renderList(); },
  });
  const chips = el('div', { class: 'topic-chips' }, [
    el('button', { class: 'chip' + (state.proverbType === 'all' ? ' is-active' : ''), onclick: () => { state.proverbType = 'all'; render(); } }, [t('all')]),
    el('button', { class: 'chip' + (state.proverbType === 'german' ? ' is-active' : ''), onclick: () => { state.proverbType = 'german'; render(); } }, [t('germanChip')]),
    el('button', { class: 'chip' + (state.proverbType === 'swahili' ? ' is-active' : ''), onclick: () => { state.proverbType = 'swahili'; render(); } }, [t('swahiliChip')]),
  ]);
  const toggle = el('button', {
    class: 'btn btn--ghost proverb-toggle mb', text: state.proverbShowTr ? t('hideTranslation') : t('showTranslation'),
    onclick: () => { state.proverbShowTr = !state.proverbShowTr; render(); },
  });
  const quizBtn = el('button', { class: 'btn btn--accent mb', text: t('startProverbQuiz'), onclick: startProverbQuiz });
  const listWrap = el('div', { id: 'proverb-list' });
  function renderList() {
    clear(listWrap);
    let items = filterProverbs(proverbs, state.proverbType);
    items = searchProverbs(items, state.proverbQuery);
    if (items.length === 0) {
      listWrap.appendChild(el('p', { class: 'muted', text: '\u2014' }));
      return;
    }
    for (const p of items) listWrap.appendChild(renderProverbCard(p));
    if (state.proverbType !== 'german') {
      listWrap.appendChild(el('p', { class: 'muted small proverb-source-note', text: `${t('proverbSourceNote')}: ${PROVERB_SOURCE.name} (${PROVERB_SOURCE.theme}) \u2014 ${PROVERB_SOURCE.url}` }));
    }
  }
  renderList();
  wrap.appendChild(search);
  wrap.appendChild(chips);
  wrap.appendChild(el('div', { class: 'row' }, [toggle, el('span', { class: 'spacer' }), quizBtn]));
  wrap.appendChild(listWrap);
  app.appendChild(wrap);
}

function renderAudioPreview() {
  return el('div', { class: 'audio-preview' }, [
    el('p', { class: 'audio-label small', text: t('audioLabel') }),
    el('audio', { id: 'proverbs-audio', controls: 'controls', preload: 'none' }, [
      el('source', { src: 'audio/proverbs-preview.mp3', type: 'audio/mpeg' }),
    ]),
    el('div', { class: 'audio-transcript' }, [
      el('div', { class: 'de', text: t('audioTranscriptDe') }),
      el('div', { class: 'en', text: t('audioTranscriptEn') }),
      el('div', { class: 'sw', text: t('audioTranscriptSw') }),
    ]),
  ]);
}

function renderProverbCard(p) {
  const isSw = p.type === 'swahili';
  const card = el('article', { class: 'proverb-card' });
  const head = el('div', { class: 'proverb-head' }, [
    el('div', { class: 'proverb-phrase', text: p.phrase }),
    el('span', { class: 'proverb-type' + (isSw ? ' is-sw' : ''), text: isSw ? t('swahiliProverb') : t('germanSaying') }),
  ]);
  if (isSw) head.appendChild(el('span', { class: 'proverb-item', text: `${t('proverbSource')} \u00b7 item ${p.item}` }));
  card.appendChild(head);
  if (state.proverbShowTr) {
    const body = el('div', { class: 'proverb-body' });
    if (isSw) {
      body.appendChild(el('p', {}, [
        el('strong', { text: t('proverbMeaning') + ':' }),
        document.createTextNode(` ${t('germanChip')}: ${p.de} \u00b7 ${t('swahiliChip')}: ${p.en}`),
      ]));
    } else {
      body.appendChild(el('p', {}, [
        el('strong', { text: t('proverbMeaning') + ':' }),
        document.createTextNode(` ${p.en} \u00b7 ${p.sw}`),
      ]));
    }
    body.appendChild(el('p', { class: 'proverb-literal', text: `${t('proverbLiteral')}: ${p.literal}` }));
    if (p.example) {
      body.appendChild(el('div', { class: 'proverb-example' }, [
        el('div', { text: p.example.de }),
        el('div', { class: 'muted small', text: `${p.example.en} \u00b7 ${p.example.sw}` }),
      ]));
    }
    body.appendChild(el('p', { class: 'proverb-note', text: `${t('proverbNote')}: ${p.note.en} \u00b7 ${p.note.sw}` }));
    if (isSw) {
      body.appendChild(el('p', { class: 'proverb-source' }, [
        el('a', { href: p.source, target: '_blank', rel: 'noopener noreferrer', text: `${t('proverbSource')} \u2014 ${p.item}` }),
      ]));
    }
    card.appendChild(body);
  }
  return card;
}

function renderProverbQuizContent(wrap) {
  const s = state.proverbQuizSession;
  const q = s.questions[s.answered] || null;
  if (!q) {
    wrap.appendChild(el('p', { class: 'lead', text: `${t('score')}: ${s.score} / ${s.total}` }));
    if (s.mistakes.length > 0) {
      wrap.appendChild(el('p', { text: `${t('mistakes')}: ${s.mistakes.length}` }));
      wrap.appendChild(el('button', { class: 'btn btn--block', text: t('retryMistakes'), onclick: () => { state.proverbQuizSession = new QuizSession(s.retryQuiz()); render(); } }));
    } else {
      wrap.appendChild(el('p', { class: 'muted', text: t('noMistakes') }));
    }
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('newQuiz'), onclick: startProverbQuiz }));
    wrap.appendChild(el('button', { class: 'btn btn--ghost btn--block mt', text: t('back'), onclick: () => { state.proverbQuizSession = null; render(); } }));
    return;
  }
  wrap.appendChild(el('div', { class: 'quiz-progress', text: `${t('answered')}: ${s.answered} / ${s.total}` }));
  wrap.appendChild(el('h3', { text: q.prompt }));
  const list = el('ul', { class: 'option-list' });
  for (const opt of q.options) {
    list.appendChild(el('li', {}, [el('button', { class: 'option-btn', text: opt, onclick: () => answerProverbQuiz(q, opt) })]));
  }
  wrap.appendChild(list);
}

function answerProverbQuiz(q, chosen) {
  const r = state.proverbQuizSession.answer(q, chosen);
  if (!r) return;
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
  const fb = el('div', { class: 'feedback ' + (r.correct ? 'feedback--ok' : 'feedback--no') }, [
    el('strong', { text: r.correct ? '\u2713' : '\u2717' }),
    el('span', { text: r.explanation }),
  ]);
  wrap.appendChild(fb);
  const nextLabel = state.proverbQuizSession.answered >= state.proverbQuizSession.total ? t('done') : t('next');
  wrap.appendChild(el('button', { class: 'btn btn--block mt', text: nextLabel, onclick: () => { progress.record('proverbs', 'all'); render(); } }));
  clear(app);
  app.appendChild(wrap);
}

// ---------- init ----------
document.querySelectorAll('.lang-btn').forEach((b) => {
  b.addEventListener('click', () => setLang(b.dataset.lang));
});
document.querySelector('.brand').addEventListener('click', () => go('home'));
modalRoot.addEventListener('click', (e) => { if (e.target === modalRoot) closeModal(); });

if (!storage.isAvailable()) {
  footerNote.textContent = t('storageUnavailable');
}

render();
