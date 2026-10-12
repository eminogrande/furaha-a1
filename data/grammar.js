// Furaha A1 — grammar lessons and practice. Each lesson has a title, an
// explanation (EN + SW), a table, and practice items with feedback.

export const grammarLessons = [
  {
    id: 'sein',
    title: 'sein (to be)',
    en: 'The verb "sein" (to be) is irregular and very common.',
    sw: 'Kitenzi "sein" (kuwa) si cha kawaida na kinatumika sana.',
    table: [
      ['ich bin', 'I am', 'mimi ni'],
      ['du bist', 'you are', 'wewe ni'],
      ['er/sie ist', 'he/she is', 'yeye ni'],
      ['wir sind', 'we are', 'sisi ni'],
      ['ihr seid', 'you (pl) are', 'nyinyi ni'],
      ['sie sind', 'they are', 'wao ni'],
    ],
    practice: [
      { q: 'Ich ___ müde.', options: ['bin', 'bist', 'ist'], correct: 'bin', why: 'ich → bin' },
      { q: 'Du ___ mein Freund.', options: ['bist', 'bin', 'sind'], correct: 'bist', why: 'du → bist' },
      { q: 'Wir ___ aus Tansania.', options: ['sind', 'seid', 'ist'], correct: 'sind', why: 'wir → sind' },
    ],
  },
  {
    id: 'haben',
    title: 'haben (to have)',
    en: 'The verb "haben" (to have) is also irregular.',
    sw: 'Kitenzi "haben" (kuwa na) pia si cha kawaida.',
    table: [
      ['ich habe', 'I have', 'nina'],
      ['du hast', 'you have', 'una'],
      ['er/sie hat', 'he/she has', 'ana'],
      ['wir haben', 'we have', 'tuna'],
      ['ihr habt', 'you (pl) have', 'mna'],
      ['sie haben', 'they have', 'wana'],
    ],
    practice: [
      { q: 'Ich ___ ein Buch.', options: ['habe', 'hast', 'hat'], correct: 'habe', why: 'ich → habe' },
      { q: 'Er ___ einen Bruder.', options: ['hat', 'haben', 'hast'], correct: 'hat', why: 'er → hat' },
      { q: 'Ihr ___ viel Zeit.', options: ['habt', 'haben', 'hast'], correct: 'habt', why: 'ihr → habt' },
    ],
  },
  {
    id: 'present',
    title: 'Present tense (Präsens)',
    en: 'Regular verbs drop -en and add -e, -st, -t, -en, -t, -en.',
    sw: 'Vitenzi vya kawaida huondoa -en na kuongeza -e, -st, -t, -en, -t, -en.',
    table: [
      ['ich lerne', 'I learn', 'ninajifunza'],
      ['du lernst', 'you learn', 'unajifunza'],
      ['er/sie lernt', 'he/she learns', 'anajifunza'],
      ['wir lernen', 'we learn', 'tunajifunza'],
      ['ihr lernt', 'you (pl) learn', 'mnajifunza'],
      ['sie lernen', 'they learn', 'wanajifunza'],
    ],
    practice: [
      { q: 'Ich ___ Deutsch.', options: ['lerne', 'lernst', 'lernt'], correct: 'lerne', why: 'ich → lerne' },
      { q: 'Du ___ gut.', options: ['arbeitest', 'arbeite', 'arbeitet'], correct: 'arbeitest', why: 'du → arbeitest' },
      { q: 'Sie ___ Musik.', options: ['hört', 'höre', 'hörst'], correct: 'hört', why: 'sie → hört' },
    ],
  },
  {
    id: 'question-words',
    title: 'Question words (W-Fragen)',
    en: 'W-Fragen start with a question word: wer, was, wo, wann, wie, warum.',
    sw: 'W-Fragen huanza na neno la swali: wer, was, wo, wann, wie, warum.',
    table: [
      ['wer', 'who', 'nani'],
      ['was', 'what', 'nini'],
      ['wo', 'where', 'wapi'],
      ['wann', 'when', 'lini'],
      ['wie', 'how', 'vipi'],
      ['warum', 'why', 'kwa nini'],
    ],
    practice: [
      { q: '___ heißt du? (What is your name?)', options: ['Wie', 'Wer', 'Wo'], correct: 'Wie', why: 'Wie = how' },
      { q: '___ wohnst du? (Where do you live?)', options: ['Wo', 'Was', 'Wann'], correct: 'Wo', why: 'Wo = where' },
      { q: '___ ist das? (Who is that?)', options: ['Wer', 'Was', 'Warum'], correct: 'Wer', why: 'Wer = who' },
    ],
  },
  {
    id: 'yes-no',
    title: 'Yes/No questions (Ja/Nein-Fragen)',
    en: 'Put the verb first to make a yes/no question.',
    sw: 'Weka kitenzi mwanzoni kuunda swali la ndiyo/la.',
    table: [
      ['Kommst du?', 'Are you coming?', 'Unakuja?'],
      ['Hast du Zeit?', 'Do you have time?', 'Una wakati?'],
      ['Ist das gut?', 'Is that good?', 'Hiyo ni nzuri?'],
    ],
    practice: [
      { q: '___ du heute? (Are you coming today?)', options: ['Kommst', 'Komm', 'Kommt'], correct: 'Kommst', why: 'du → Kommst' },
      { q: '___ du ein Auto? (Do you have a car?)', options: ['Hast', 'Habe', 'Hat'], correct: 'Hast', why: 'du → Hast' },
    ],
  },
  {
    id: 'negation',
    title: 'Negation: nicht and kein',
    en: '"nicht" negates verbs/adjectives; "kein" negates nouns.',
    sw: '"nicht" hukanusha vitenzi/vivumishi; "kein" hukanusha nomino.',
    table: [
      ['Ich bin nicht müde.', 'I am not tired.', 'Sina uchovu.'],
      ['Ich habe kein Geld.', 'I have no money.', 'Sina pesa.'],
      ['Das ist kein Problem.', 'That is no problem.', 'Hilo si tatizo.'],
    ],
    practice: [
      { q: 'Ich habe ___ Zeit. (I have no time.)', options: ['keine', 'nicht', 'kein'], correct: 'keine', why: 'Zeit is feminine → keine' },
      { q: 'Das ist ___ gut. (That is not good.)', options: ['nicht', 'kein', 'keine'], correct: 'nicht', why: 'nicht negates the adjective gut' },
    ],
  },
  {
    id: 'accusative',
    title: 'Accusative (Akkusativ)',
    en: 'The direct object changes: der→den, ein→einen. die/das stay the same.',
    sw: 'Kitu cha moja kwa moja hubadilika: der→den, ein→einen. die/das hubaki vilevile.',
    table: [
      ['der Mann → den Mann', 'the man (acc)', 'mwanaume (mtendwa)'],
      ['ein Mann → einen Mann', 'a man (acc)', 'mwanaume mmoja (mtendwa)'],
      ['die Frau → die Frau', 'the woman (acc)', 'mwanamke (mtendwa)'],
      ['das Kind → das Kind', 'the child (acc)', 'mtoto (mtendwa)'],
    ],
    practice: [
      { q: 'Ich sehe ___ Mann. (I see the man.)', options: ['den', 'der', 'dem'], correct: 'den', why: 'der → den in accusative' },
      { q: 'Ich kaufe ___ Apfel. (I buy an apple.)', options: ['einen', 'ein', 'eine'], correct: 'einen', why: 'ein → einen (masculine acc)' },
      { q: 'Ich trinke ___ Wasser. (I drink the water.)', options: ['das', 'den', 'der'], correct: 'das', why: 'das stays das in accusative' },
    ],
  },
  {
    id: 'modal',
    title: 'Modal verbs: können, müssen, wollen',
    en: 'Modals change the verb stem and send the main verb to the end.',
    sw: 'Vitenzi vya modal hubadilisha shina na kupeleka kitenzi kikuu mwishoni.',
    table: [
      ['ich kann', 'I can', 'naweza'],
      ['du musst', 'you must', 'lazima u'],
      ['wir wollen', 'we want', 'tunataka'],
    ],
    practice: [
      { q: 'Ich ___ Deutsch sprechen. (I can speak German.)', options: ['kann', 'kannst', 'können'], correct: 'kann', why: 'ich → kann' },
      { q: 'Du ___ lernen. (You must learn.)', options: ['musst', 'muss', 'müssen'], correct: 'musst', why: 'du → musst' },
    ],
  },
  {
    id: 'separable',
    title: 'Separable verbs (trennbare Verben)',
    en: 'The prefix separates and goes to the end: anrufen → Ich rufe an.',
    sw: 'Kiambishi hutengana na kwenda mwishoni: anrufen → Ich rufe an.',
    table: [
      ['anrufen', 'to call', 'kupiga simu'],
      ['aufstehen', 'to get up', 'kuamka'],
      ['einkaufen', 'to shop', 'kununua'],
    ],
    practice: [
      { q: 'Ich ___ meine Mutter ___. (I call my mother.)', options: ['rufe … an', 'anrufe …', 'rufe … auf'], correct: 'rufe … an', why: 'anrufen → rufe … an' },
      { q: 'Wir ___ heute ___. (We shop today.)', options: ['kaufen … ein', 'einkaufen …', 'kaufen … auf'], correct: 'kaufen … ein', why: 'einkaufen → kaufen … ein' },
    ],
  },
  {
    id: 'perfect',
    title: 'Perfect tense (Perfekt)',
    en: 'Past: haben/sein + ge-…-t/en. Example: Ich habe gelernt.',
    sw: 'Wakati uliopita: haben/sein + ge-…-t/en. Mfano: Ich habe gelernt.',
    table: [
      ['lernen → gelernt', 'learned', 'alijifunza'],
      ['machen → gemacht', 'made/did', 'alifanya'],
      ['gehen → gegangen', 'went', 'alienda'],
    ],
    practice: [
      { q: 'Ich habe Deutsch ___. (I learned German.)', options: ['gelernt', 'lernt', 'lernen'], correct: 'gelernt', why: 'lernen → gelernt' },
      { q: 'Er ist nach Hause ___. (He went home.)', options: ['gegangen', 'gehen', 'ging'], correct: 'gegangen', why: 'gehen → gegangen (with sein)' },
    ],
  },
  {
    id: 'dative',
    title: 'Dative basics (Dativ)',
    en: 'Indirect object: der→dem, die→der, das→dem. Often after "mit", "zu", "von".',
    sw: 'Kitu kisicho cha moja kwa moja: der→dem, die→der, das→dem. Mara nyingi baada ya "mit", "zu", "von".',
    table: [
      ['mit dem Bus', 'by bus', 'kwa basi'],
      ['zu der Schule', 'to the school', 'kwa shule'],
      ['von dem Freund', 'from the friend', 'kutoka kwa rafiki'],
    ],
    practice: [
      { q: 'Ich fahre mit ___ Bus. (I go by bus.)', options: ['dem', 'den', 'der'], correct: 'dem', why: 'der → dem in dative' },
      { q: 'Ich gehe zu ___ Schule. (I go to school.)', options: ['der', 'dem', 'den'], correct: 'der', why: 'die → der in dative' },
    ],
  },
  {
    id: 'imperative',
    title: 'Imperative (commands)',
    en: 'Commands: du-form drops -st. Example: Komm! / Kommen Sie!',
    sw: 'Amri: umbo la du huondoa -st. Mfano: Komm! / Kommen Sie!',
    table: [
      ['Komm!', 'Come!', 'Njoo!'],
      ['Hör zu!', 'Listen!', 'Sikiliza!'],
      ['Kommen Sie!', 'Come! (formal)', 'Njoo! (heshima)'],
    ],
    practice: [
      { q: '___ bitte! (Please come! to a friend)', options: ['Komm', 'Kommt', 'Kommen'], correct: 'Komm', why: 'du imperative → Komm' },
      { q: '___ Sie bitte! (formal)', options: ['Kommen', 'Komm', 'Kommt'], correct: 'Kommen', why: 'formal → Kommen Sie' },
    ],
  },
  {
    id: 'time-numbers',
    title: 'Time and numbers',
    en: 'Es ist drei Uhr. Numbers: eins, zwei, drei, vier, fünf, zehn.',
    sw: 'Ni saa tisa. Nambari: eins, zwei, drei, vier, fünf, zehn.',
    table: [
      ['eins, zwei, drei', 'one, two, three', 'moja, mbili, tatu'],
      ['Es ist drei Uhr.', 'It is 3 o\u2019clock.', 'Ni saa tisa.'],
      ['um drei Uhr', 'at 3 o\u2019clock', 'saa tisa'],
    ],
    practice: [
      { q: 'Es ist ___ Uhr. (It is 3 o\u2019clock.)', options: ['drei', 'dreißig', 'dritte'], correct: 'drei', why: 'drei = three' },
      { q: 'eins, zwei, ___', options: ['drei', 'zehn', 'fünf'], correct: 'drei', why: 'counting: eins, zwei, drei' },
    ],
  },
];

export default grammarLessons;
