// Furaha A1 — reading comprehension passages (A1 level) with questions.

export const readingPassages = [
  {
    id: 'r1',
    title: 'Meine Familie',
    de: 'Hallo! Ich heiße Anna. Ich bin aus Tansania. Meine Familie ist groß. Ich habe einen Bruder und zwei Schwestern. Mein Vater arbeitet in einem Büro. Meine Mutter kocht gern. Wir wohnen in einem Haus. Das Haus ist schön und groß.',
    en: 'Hello! My name is Anna. I am from Tanzania. My family is big. I have one brother and two sisters. My father works in an office. My mother likes to cook. We live in a house. The house is beautiful and big.',
    sw: 'Habari! Ninaitwa Anna. Ninatoka Tanzania. Familia yangu ni kubwa. Nina kaka mmoja na dada wawili. Baba yangu anafanya kazi ofisini. Mama yangu anapenda kupika. Tunaishi katika nyumba. Nyumba ni nzuri na kubwa.',
    questions: [
      { q: 'Woher kommt Anna?', options: ['aus Tansania', 'aus Deutschland', 'aus Kenia'], correct: 'aus Tansania', why: 'Anna sagt: "Ich bin aus Tansania."' },
      { q: 'Wie viele Schwestern hat Anna?', options: ['zwei', 'eine', 'drei'], correct: 'zwei', why: 'Anna hat zwei Schwestern.' },
      { q: 'Was macht der Vater?', options: ['Er arbeitet in einem Büro.', 'Er kocht.', 'Er lernt.'], correct: 'Er arbeitet in einem Büro.', why: 'Der Vater arbeitet in einem Büro.' },
    ],
  },
  {
    id: 'r2',
    title: 'Einkaufen',
    de: 'Heute ist Samstag. Ich gehe auf den Markt. Ich kaufe Brot, Milch und Äpfel. Das Brot kostet zwei Euro. Die Milch kostet einen Euro. Die Äpfel sind rot und süß. Ich bezahle an der Kasse. Dann gehe ich nach Hause.',
    en: 'Today is Saturday. I go to the market. I buy bread, milk and apples. The bread costs two euros. The milk costs one euro. The apples are red and sweet. I pay at the checkout. Then I go home.',
    sw: 'Leo ni Jumamosi. Ninaenda sokoni. Ninunua mkate, maziwa na matufaa. Mkate unagharimu euro mbili. Maziwa yanagharimu euro moja. Matufaa ni mekundu na matamu. Ninalipa kwenye kaunta. Kisha narudi nyumbani.',
    questions: [
      { q: 'Wann geht er auf den Markt?', options: ['am Samstag', 'am Montag', 'am Sonntag'], correct: 'am Samstag', why: 'Heute ist Samstag.' },
      { q: 'Was kostet das Brot?', options: ['zwei Euro', 'einen Euro', 'drei Euro'], correct: 'zwei Euro', why: 'Das Brot kostet zwei Euro.' },
      { q: 'Was kauft er nicht?', options: ['Fleisch', 'Brot', 'Äpfel'], correct: 'Fleisch', why: 'Er kauft Brot, Milch und Äpfel.' },
    ],
  },
  {
    id: 'r3',
    title: 'Das Wetter',
    de: 'Heute ist das Wetter schön. Die Sonne scheint und der Himmel ist blau. Es ist warm, aber nicht heiß. Ich gehe mit meinem Freund in den Park. Wir spielen Fußball. Am Abend regnet es. Wir gehen nach Hause.',
    en: 'Today the weather is nice. The sun shines and the sky is blue. It is warm, but not hot. I go to the park with my friend. We play football. In the evening it rains. We go home.',
    sw: 'Leo hali ya hewa ni nzuri. Jua linaangaza na anga ni la bluu. Kuna joto, lakini si moto. Ninaenda mbugani na rafiki yangu. Tunacheza mpira. Jioni kunanyesha. Tunarudi nyumbani.',
    questions: [
      { q: 'Wie ist das Wetter heute?', options: ['schön', 'schlecht', 'kalt'], correct: 'schön', why: 'Das Wetter ist schön.' },
      { q: 'Was machen sie im Park?', options: ['Sie spielen Fußball.', 'Sie kaufen ein.', 'Sie schlafen.'], correct: 'Sie spielen Fußball.', why: 'Wir spielen Fußball.' },
      { q: 'Wann regnet es?', options: ['am Abend', 'am Morgen', 'am Mittag'], correct: 'am Abend', why: 'Am Abend regnet es.' },
    ],
  },
];

export default readingPassages;
