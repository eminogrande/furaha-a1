// Furaha A1 — A2–C2 study guide logic.
// Pure, DOM-free functions so unit tests can import this module in Node.
// The browser entry point (initLevelGuide) only runs when a document exists.
//
// Honest scope: this is a study guide + demonstration practice checks, NOT a
// complete A2–C2 course and NOT an official exam. Progress is stored per level
// as attempt counts only — never labelled "mastery".

const LEVEL_IDS = ['A2', 'B1', 'B2', 'C1', 'C2'];
const STORAGE_KEY = 'furaha-level-guide-progress';

export function loadGuide(json) {
  if (!json || !Array.isArray(json.levels)) {
    throw new Error('Guide must contain a levels array');
  }
  const ids = json.levels.map((l) => l.id);
  for (const id of LEVEL_IDS) {
    if (!ids.includes(id)) {
      throw new Error(`Guide must include all five levels A2–C2 (missing ${id})`);
    }
  }
  return json;
}

export function getLevel(guide, id) {
  return guide.levels.find((l) => l.id === id);
}

export function localize(obj, lang) {
  if (!obj) return '';
  if (obj[lang]) return obj[lang];
  return obj.en || '';
}

// --- Practice checks -------------------------------------------------------

export function checkAnswer(question, selectedIndex) {
  const correct = selectedIndex === question.correctIndex;
  return { correct, feedback: question.feedback };
}

// --- Per-level progress (attempt counts only, never mastery) --------------

function readStore(backend) {
  try {
    const raw = backend.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(backend, data) {
  try {
    backend.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable — progress simply won't persist
  }
}

export function recordAttempt(backend, level, questionId, correct) {
  const data = readStore(backend);
  const entry = data[level] || { attempts: 0, correct: 0, selfChecks: [] };
  entry.attempts += 1;
  if (correct) entry.correct += 1;
  data[level] = entry;
  writeStore(backend, data);
}

export function getProgress(backend, level) {
  const data = readStore(backend);
  const entry = data[level] || { attempts: 0, correct: 0, selfChecks: [] };
  return { level, attempts: entry.attempts, correct: entry.correct };
}

export function recordSelfCheck(backend, level, kind) {
  const data = readStore(backend);
  const entry = data[level] || { attempts: 0, correct: 0, selfChecks: [] };
  if (!entry.selfChecks.includes(kind)) entry.selfChecks.push(kind);
  data[level] = entry;
  writeStore(backend, data);
}

export function getSelfChecks(backend, level) {
  const data = readStore(backend);
  const entry = data[level] || { attempts: 0, correct: 0, selfChecks: [] };
  return entry.selfChecks || [];
}

// --- Browser rendering -----------------------------------------------------

export function initLevelGuide() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('level-guide');
  if (!root) return;
  const langSwitch = document.getElementById('guide-lang');
  let guide = null;
  let audioManifest = {};
  function audioFor(text) {
    const url=audioManifest[text.trim()];
    if(!url) return document.createTextNode('');
    const audio=document.createElement('audio');audio.controls=true;audio.preload='none';audio.src=url;
    audio.setAttribute('aria-label','German audio / Sauti ya Kijerumani');
    audio.style.maxWidth='100%';
    audio.addEventListener('play',()=>{document.querySelectorAll('audio').forEach(a=>{if(a!==audio)a.pause();});});
    return audio;
  }
  let lang = 'en';

  function setLang(next) {
    lang = next;
    if (langSwitch) {
      for (const btn of langSwitch.querySelectorAll('[data-lang]')) {
        const active = btn.dataset.lang === lang;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      }
    }
    render();
  }

  function render() {
    if (!guide) return;
    root.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (const level of guide.levels) {
      frag.appendChild(renderLevel(level, lang));
    }
    root.appendChild(frag);
  }

  function renderLevel(level, l) {
    const section = document.createElement('section');
    section.className = 'level-section';
    section.id = `level-${level.id}`;
    section.setAttribute('aria-labelledby', `level-${level.id}-title`);

    const head = document.createElement('button');
    head.className = 'level-head';
    head.setAttribute('aria-expanded', 'false');
    head.setAttribute('aria-controls', `level-${level.id}-body`);
    head.innerHTML = `
      <span class="level-badge">${level.id}</span>
      <span class="level-title" id="level-${level.id}-title">${escapeHtml(localize(level.name, l))}</span>
      <span class="level-chevron" aria-hidden="true">▸</span>`;
    head.addEventListener('click', () => {
      const open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      body.hidden = open;
      head.classList.toggle('is-open', !open);
    });

    const body = document.createElement('div');
    body.className = 'level-body';
    body.id = `level-${level.id}-body`;
    body.hidden = true;

    const summary = document.createElement('p');
    summary.id = `progress-${level.id}`;
    summary.setAttribute('aria-live', 'polite');
    body.appendChild(summary);
    body.appendChild(renderOutcomes(level, l));
    body.appendChild(renderStudyPlan(level, l));
    body.appendChild(renderLinks(level, l));
    body.appendChild(renderPractice(level, l));

    section.appendChild(head);
    section.appendChild(body);
    return section;
  }

  function renderOutcomes(level, l) {
    const box = document.createElement('div');
    box.className = 'block';
    box.innerHTML = `<h3>${escapeHtml(localize({ en: 'What you can do', sw: 'Unachoweza kufanya' }, l))}</h3>`;
    const ul = document.createElement('ul');
    ul.className = 'outcome-list';
    for (const key of ['reading', 'listening', 'writing', 'speaking']) {
      const li = document.createElement('li');
      const label = localize({ en: key, sw: key }, l);
      li.innerHTML = `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(localize(level.outcomes[key], l))}`;
      ul.appendChild(li);
    }
    box.appendChild(ul);
    return box;
  }

  function renderStudyPlan(level, l) {
    const box = document.createElement('div');
    box.className = 'block';
    box.innerHTML = `
      <h3>${escapeHtml(localize({ en: 'Recommended study plan', sw: 'Mpango wa kujifunza uliopendekezwa' }, l))}</h3>
      <p class="muted small">${escapeHtml(localize(level.studyPlan.note, l))}</p>`;
    const ol = document.createElement('ol');
    ol.className = 'unit-list';
    for (const u of level.studyPlan.units) {
      const li = document.createElement('li');
      li.textContent = localize(u, l);
      ol.appendChild(li);
    }
    box.appendChild(ol);
    return box;
  }

  function renderLinks(level, l) {
    const box = document.createElement('div');
    box.className = 'block';
    box.innerHTML = `<h3>${escapeHtml(localize({ en: 'Official exam practice', sw: 'Mazoezi rasmi ya mtihani' }, l))}</h3>`;
    const ul = document.createElement('ul');
    ul.className = 'link-list';
    for (const link of level.examPractice) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${escapeAttr(link.url)}" target="_blank" rel="noopener">${escapeHtml(localize(link.title, l))}</a> <span class="muted small">${escapeHtml(localize(link.note, l))}</span>`;
      ul.appendChild(li);
    }
    box.appendChild(ul);

    const box2 = document.createElement('div');
    box2.className = 'block';
    box2.innerHTML = `<h3>${escapeHtml(localize({ en: 'Free courses & materials', sw: 'Kozi na nyenzo za bure' }, l))}</h3>`;
    const ul2 = document.createElement('ul');
    ul2.className = 'link-list';
    for (const link of level.freeCourses) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${escapeAttr(link.url)}" target="_blank" rel="noopener">${escapeHtml(localize(link.title, l))}</a> <span class="muted small">${escapeHtml(localize(link.note, l))}</span>`;
      ul2.appendChild(li);
    }
    box2.appendChild(ul2);
    box.appendChild(box2);
    return box;
  }

  function renderPractice(level, l) {
    const box = document.createElement('div');
    box.className = 'block practice';
    box.innerHTML = `
      <h3>${escapeHtml(localize({ en: 'Mini practice check (demonstration)', sw: 'Jaribio dogo (mfano)' }, l))}</h3>
      <p class="muted small">${escapeHtml(localize({ en: 'A short sample to show the level — not a full course or exam.', sw: 'Mfano mfupi wa kukuonyesha kiwango — si kozi kamili wala mtihani.' }, l))}</p>`;

    const sit = document.createElement('div');
    sit.className = 'situation';
    sit.innerHTML = `<p class="de">${escapeHtml(level.practice.situation.de)}</p>`;
    const expBtn = document.createElement('button');
    expBtn.className = 'btn btn--ghost small';
    expBtn.textContent = localize({ en: 'Show explanation (EN + SW)', sw: 'Onyesha maelezo (EN + SW)' }, l);
    const exp = document.createElement('div');
    exp.className = 'explanation hidden';
    exp.innerHTML = `<p><strong>EN:</strong> ${escapeHtml(level.practice.explanation.en)}</p>
      <p><strong>SW:</strong> ${escapeHtml(level.practice.explanation.sw)}</p>`;
    expBtn.addEventListener('click', () => {
      exp.classList.toggle('hidden');
      expBtn.textContent = exp.classList.contains('hidden')
        ? localize({ en: 'Show explanation (EN + SW)', sw: 'Onyesha maelezo (EN + SW)' }, l)
        : localize({ en: 'Hide explanation', sw: 'Ficha maelezo' }, l);
    });
    sit.appendChild(audioFor(level.practice.situation.de));
    sit.appendChild(expBtn);
    sit.appendChild(exp);
    box.appendChild(sit);

    const qz = document.createElement('div');
    qz.className = 'mcq';
    level.practice.questions.forEach((q, qi) => {
      qz.appendChild(renderQuestion(level, q, qi, l));
    });
    box.appendChild(qz);

    box.appendChild(renderPrompt(level, 'writing', l));
    box.appendChild(renderPrompt(level, 'speaking', l));
    return box;
  }

  function renderQuestion(level, q, qi, l) {
    const wrap = document.createElement('div');
    wrap.className = 'mcq-item';
    wrap.innerHTML = `<p class="q-prompt">${qi + 1}. ${escapeHtml(localize(q.prompt, l))}</p>`;
    const opts = document.createElement('div');
    opts.className = 'option-list';
    q.options.forEach((opt, oi) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = localize(opt, l);
      btn.addEventListener('click', () => {
        const res = checkAnswer(q, oi);
        // reset styling
        for (const b of opts.querySelectorAll('.option-btn')) {
          b.classList.remove('is-correct', 'is-wrong');
          b.disabled = false;
        }
        btn.classList.add(res.correct ? 'is-correct' : 'is-wrong');
        if (!res.correct) {
          // highlight the correct one and allow retry
          opts.querySelectorAll('.option-btn')[q.correctIndex].classList.add('is-correct');
          btn.disabled = true;
        } else {
          for (const b of opts.querySelectorAll('.option-btn')) b.disabled = true;
        }
        recordAttempt(getBackend(), level.id, `q${qi}`, res.correct);
        const fb = wrap.querySelector('.feedback');
        fb.className = 'feedback ' + (res.correct ? 'feedback--ok' : 'feedback--no');
        fb.innerHTML = `<strong>${res.correct ? '✓' : '✗'}</strong> ${escapeHtml(localize(res.feedback, l))}`;
        updateProgress(level.id);
      });
      opts.appendChild(btn);
    });
    wrap.appendChild(opts);
    const fb = document.createElement('div');
    fb.className = 'feedback hidden';
    wrap.appendChild(fb);
    return wrap;
  }

  function renderPrompt(level, kind, l) {
    const p = level.practice[kind];
    const box = document.createElement('div');
    box.className = 'prompt-block';
    const label = kind === 'writing'
      ? localize({ en: 'Writing prompt', sw: 'Zoezi la kuandika' }, l)
      : localize({ en: 'Speaking prompt', sw: 'Zoezi la kusema' }, l);
    box.innerHTML = `<h4>${escapeHtml(label)}</h4>
      <p class="prompt-de">${escapeHtml(p.prompt.de)}</p>
      <p class="muted small">${escapeHtml(localize(p.prompt, l))}</p>`;
    box.appendChild(audioFor(p.prompt.de));
    if (kind === 'writing') {
      const draft = document.createElement('textarea');
      draft.setAttribute('aria-label', localize({en:'Your German answer',sw:'Jibu lako kwa Kijerumani'},l));
      const key = `level-draft-${level.id}`;
      try { draft.value = getBackend()?.getItem(key) || ''; } catch {}
      draft.addEventListener('input',()=>{try{getBackend()?.setItem(key,draft.value);}catch{}});
      box.appendChild(draft);
    }
    const reveal = document.createElement('button');
    reveal.className = 'btn btn--ghost small';
    reveal.textContent = localize({ en: 'Reveal model & self-check', sw: 'Onyesha mfano na ukaguzi' }, l);
    const model = document.createElement('div');
    model.className = 'model-box hidden';
    model.innerHTML = `<p class="de">${escapeHtml(p.model.de)}</p>
      <p class="en">${escapeHtml(localize(p.model, l))}</p>
      <p class="selfcheck">${escapeHtml(localize(p.selfCheck, l))}</p>`;
    reveal.addEventListener('click', () => {
      model.classList.toggle('hidden');
      reveal.textContent = model.classList.contains('hidden')
        ? localize({ en: 'Reveal model & self-check', sw: 'Onyesha mfano na ukaguzi' }, l)
        : localize({ en: 'Hide model', sw: 'Ficha mfano' }, l);
    });
    const checked = document.createElement('button');
    checked.className='btn';
    checked.textContent=localize({en:'I practised and compared my answer (self-report)',sw:'Nimefanya zoezi na kulinganisha jibu langu (tathmini binafsi)'},l);
    checked.addEventListener('click',()=>{recordSelfCheck(getBackend(),level.id,kind);updateProgress(level.id);checked.disabled=true;});
    model.appendChild(audioFor(p.model.de));
    model.appendChild(checked);
    box.appendChild(reveal);
    box.appendChild(model);
    return box;
  }

  function updateProgress(levelId) {
    const el = document.getElementById(`progress-${levelId}`);
    if (!el) return;
    const p = getProgress(getBackend(), levelId);
    const checks = getSelfChecks(getBackend(), levelId);
    el.textContent = `${p.correct}/${p.attempts} ${localize({ en: 'correct', sw: 'sahihi' }, lang)} · ${checks.length} ${localize({ en: 'self-checks', sw: 'ukaguzi' }, lang)}`;
  }

  function getBackend() {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  }

  // load data
  Promise.all([fetch('data/level-guide.json').then(r=>r.json()),fetch('data/audio-manifest.json').then(r=>r.json()).catch(()=>({}))])
    .then(([json, manifest]) => {
      audioManifest=manifest;
      guide = loadGuide(json);
      render();
      // progress summary per level
      for (const level of guide.levels) {
        const el = document.getElementById(`progress-${level.id}`);
        if (el) updateProgress(level.id);
      }
    })
    .catch((err) => {
      root.innerHTML = `<p class="muted">${escapeHtml(localize({ en: 'Could not load the study guide.', sw: 'Imeshindikana kupakia mwongozo wa kujifunza.' }, lang))}</p>`;
      console.error(err);
    });

  if (langSwitch) {
    langSwitch.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (btn) setLang(btn.dataset.lang);
    });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function escapeAttr(s) {
  return escapeHtml(s);
}
