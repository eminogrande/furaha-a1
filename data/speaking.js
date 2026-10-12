// Furaha A1 — speaking prompts with model answers. No audio (out of scope).

export const speakingPrompts = [
  {
    id: 's1',
    title: 'Sich vorstellen',
    prompt: 'Introduce yourself: say your name, where you are from, and where you live.',
    promptSw: 'Jitambulishe: sema jina lako, unakotoka, na unakoishi.',
    model: 'Hallo! Ich heiße Furaha. Ich komme aus Tansania. Ich wohne in Dar es Salaam.',
    modelEn: 'Hello! My name is Furaha. I come from Tanzania. I live in Dar es Salaam.',
  },
  {
    id: 's2',
    title: 'Essen bestellen',
    prompt: 'Order food and a drink in a restaurant. Ask for the price.',
    promptSw: 'Agiza chakula na kinywaji kwenye mgahawa. Uliza bei.',
    model: 'Guten Tag! Ich möchte ein Brot und einen Kaffee, bitte. Was kostet das? Danke!',
    modelEn: 'Good day! I would like a bread and a coffee, please. How much does that cost? Thank you!',
  },
  {
    id: 's3',
    title: 'Nach dem Weg fragen',
    prompt: 'Ask where the train station is and how to get there.',
    promptSw: 'Uliza kituo cha treni kiko wapi na jinsi ya kufika.',
    model: 'Entschuldigung, wo ist der Bahnhof? Wie komme ich zum Bahnhof? Ist es weit?',
    modelEn: 'Excuse me, where is the train station? How do I get to the station? Is it far?',
  },
];

export default speakingPrompts;
