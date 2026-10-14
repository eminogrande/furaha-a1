// Furaha A1 — Proverbs & sayings (DE / EN / SW)
// Enrichment material. Includes:
//  - 18 common, authentic German sayings (type: 'german'), with clear EN + SW
//    meanings, a simple German example sentence (translated EN/SW) and a short
//    learning note. Marked enrichment because some idioms go beyond A1.
//  - 6 authentic Swahili proverbs (type: 'swahili') from the University of
//    Illinois Swahili Proverbs site (hurry-patiience theme). Their German and
//    English are TRANSLATIONS of the Swahili proverb — they are NOT traditional
//    German sayings and are never presented as equivalents.

export const PROVERB_SOURCE = {
  name: 'University of Illinois Swahili Proverbs site',
  theme: 'hurry\u2013patience',
  url: 'https://swahiliproverbs.afrst.illinois.edu/hurry.html',
};

export const PROVERB_TYPES = ['german', 'swahili'];

export const proverbs = [
  // ------------------------------------------------------------------
  // German traditional sayings (enrichment)
  // ------------------------------------------------------------------
  { id: 'gp01', type: 'german', enrichment: true,
    phrase: 'Eile mit Weile',
    literal: 'Hurry with leisure',
    en: 'More haste, less speed \u2014 take your time.',
    sw: 'Haraka haina baraka \u2014 jipatie muda.',
    example: {
      de: 'Nimm dir Zeit und mach es richtig. Eile mit Weile!',
      en: 'Take your time and do it right. More haste, less speed!',
      sw: 'Jipatie muda na ufanye vizuri. Haraka haina baraka!',
    },
    note: {
      en: 'A gentle reminder to act carefully instead of rushing.',
      sw: 'Ukumbusho wa kufanya mambo kwa makini badala ya haraka.',
    } },

  { id: 'gp02', type: 'german', enrichment: true,
    phrase: '\u00dcbung macht den Meister',
    literal: 'Practice makes the master',
    en: 'Practice makes perfect.',
    sw: 'Kujizoeza huja ustadi.',
    example: {
      de: '\u00dcbe jeden Tag \u2014 \u00dcbung macht den Meister.',
      en: 'Practice every day \u2014 practice makes perfect.',
      sw: 'Jizoeze kila siku \u2014 mazoezi huleta ustadi.',
    },
    note: {
      en: 'Repeating something often makes you good at it.',
      sw: 'Kurudia jambo mara nyingi hukufanya kiwazidi.',
    } },

  { id: 'gp03', type: 'german', enrichment: true,
    phrase: 'Aller Anfang ist schwer',
    literal: 'Every beginning is hard',
    en: 'Every beginning is hard; the first step is the hardest.',
    sw: 'Mwanzo wa kila kitu ni mgumu.',
    example: {
      de: 'Deutsch ist am Anfang schwer. Aller Anfang ist schwer.',
      en: 'German is hard at the start. Every beginning is hard.',
      sw: 'Kijerumani ni ngumu mwanzoni. Mwanzo wa kila kitu ni mgumu.',
    },
    note: {
      en: 'Reassures that difficulty at the start is normal.',
      sw: 'Hutuliza kwamba ugumu wa mwanzo ni wa kawaida.',
    } },

  { id: 'gp04', type: 'german', enrichment: true,
    phrase: 'Ende gut, alles gut',
    literal: 'End good, all good',
    en: "All's well that ends well.",
    sw: 'Mwisho mwema, yote mazuri.',
    example: {
      de: 'Die Pr\u00fcfung ist bestanden. Ende gut, alles gut!',
      en: "The exam is passed. All's well that ends well!",
      sw: 'Mtihani umefaulu. Mwisho mwema, yote mazuri!',
    },
    note: {
      en: 'Used when something ends well after worries.',
      sw: 'Inatumika jambo linapomalizika vizuri baada ya wasiwasi.',
    } },

  { id: 'gp05', type: 'german', enrichment: true,
    phrase: 'Besser sp\u00e4t als nie',
    literal: 'Better late than never',
    en: 'Better late than never.',
    sw: 'Afadhali kuchelewa kuliko kutofika.',
    example: {
      de: 'Du bist sp\u00e4t, aber besser sp\u00e4t als nie!',
      en: 'You are late, but better late than never!',
      sw: 'Umechelewa, lakini afadhali kuchelewa kuliko kutofika!',
    },
    note: {
      en: 'It is still worth finishing even if you are behind.',
      sw: 'Bado ina thamani kumaliza hata ukiwa nyuma.',
    } },

  { id: 'gp06', type: 'german', enrichment: true,
    phrase: 'Morgenstund hat Gold im Mund',
    literal: 'Morning hour has gold in its mouth',
    en: 'The early bird catches the worm.',
    sw: 'Mwenye kuamka mapema hupata baraka.',
    example: {
      de: 'Ich stehe fr\u00fch auf. Morgenstund hat Gold im Mund.',
      en: 'I get up early. The early bird catches the worm.',
      sw: 'Ninaamka mapema. Mwenye kuamka mapema hupata baraka.',
    },
    note: {
      en: 'The early morning is a good time to do your work.',
      sw: 'Asubuhi ni wakati mzuri wa kufanya kazi yako.',
    } },

  { id: 'gp07', type: 'german', enrichment: true,
    phrase: 'Ohne Flei\u00df kein Preis',
    literal: 'Without diligence no prize',
    en: 'No pain, no gain \u2014 hard work brings a reward.',
    sw: 'Bila jasho, hakuna faida.',
    example: {
      de: 'Ich lerne viel. Ohne Flei\u00df kein Preis!',
      en: 'I study a lot. No pain, no gain!',
      sw: 'Ninasoma sana. Bila jasho hakuna faida!',
    },
    note: {
      en: 'Reward comes after real effort.',
      sw: 'Faida inakuja baada ya juhudi.',
    } },

  { id: 'gp08', type: 'german', enrichment: true,
    phrase: 'Viele K\u00f6che verderben den Brei',
    literal: 'Many cooks spoil the porridge',
    en: 'Too many cooks spoil the broth.',
    sw: 'Wapishi wengi huharibu chakula.',
    example: {
      de: 'Zu viele Leute helfen, jetzt ist alles durcheinander. Viele K\u00f6che verderben den Brei.',
      en: 'Too many people help, now everything is messy. Too many cooks spoil the broth.',
      sw: 'Watu wengi wanasaidia, sasa kila kitu kimechanganyika. Wapishi wengi huharibu chakula.',
    },
    note: {
      en: 'Too many helpers can make things worse.',
      sw: 'Wasaidizi wengi wanaweza kuharibu jambo.',
    } },

  { id: 'gp09', type: 'german', enrichment: true,
    phrase: 'Der Apfel f\u00e4llt nicht weit vom Stamm',
    literal: 'The apple does not fall far from the trunk',
    en: 'The apple does not fall far from the tree.',
    sw: 'Tunda la mti huanguka karibu na mti wake.',
    example: {
      de: 'Sie singt wie ihre Mutter. Der Apfel f\u00e4llt nicht weit vom Stamm.',
      en: 'She sings like her mother. The apple does not fall far from the tree.',
      sw: 'Anaimba kama mama yake. Tunda la mti huanguka karibu na mti wake.',
    },
    note: {
      en: 'Children often resemble their parents.',
      sw: 'Watoto mara nyingi hufanana na wazazi wao.',
    } },

  { id: 'gp10', type: 'german', enrichment: true,
    phrase: 'Wer rastet, der rostet',
    literal: 'Who rests, rusts',
    en: 'Use it or lose it \u2014 if you stop, you go stale.',
    sw: 'Asiyefanya mazoezi hupoteza kipaji.',
    example: {
      de: '\u00dcbe weiter Deutsch! Wer rastet, der rostet.',
      en: 'Keep practising German! Use it or lose it.',
      sw: 'Endelea kufanya mazoezi ya Kijerumani! Asiyefanya mazoezi hupoteza kipaji.',
    },
    note: {
      en: 'You lose a skill if you stop using it.',
      sw: 'Unapoteza ustadi ukiacha kuutumia.',
    } },

  { id: 'gp11', type: 'german', enrichment: true,
    phrase: 'Gut Ding will Weile haben',
    literal: 'Good things want their time',
    en: 'Good things take time.',
    sw: 'Jambo jema huchukua muda.',
    example: {
      de: 'Sei geduldig. Gut Ding will Weile haben.',
      en: 'Be patient. Good things take time.',
      sw: 'Vumilia. Jambo jema huchukua muda.',
    },
    note: {
      en: 'Patience leads to a good result.',
      sw: 'Subira huleta matokeo mazuri.',
    } },

  { id: 'gp12', type: 'german', enrichment: true,
    phrase: 'Kleider machen Leute',
    literal: 'Clothes make people',
    en: 'Clothes make the man \u2014 appearances matter.',
    sw: 'Nguo nzuri humfanya mtu aonekane bora.',
    example: {
      de: 'Mit einem Anzug siehst du wichtig aus. Kleider machen Leute.',
      en: 'In a suit you look important. Clothes make the man.',
      sw: 'Ukiwa na koti unaonekana mtukufu. Nguo nzuri humfanya mtu aonekane bora.',
    },
    note: {
      en: 'People often judge others by how they look.',
      sw: 'Watu mara nyingi huamua kwa mwonekano.',
    } },

  { id: 'gp13', type: 'german', enrichment: true,
    phrase: 'Reden ist Silber, Schweigen ist Gold',
    literal: 'Speaking is silver, silence is golden',
    en: 'Speech is silver, silence is golden.',
    sw: 'Kuongea ni fedha, kimya ni dhahabu.',
    example: {
      de: 'Manchmal ist es besser, nichts zu sagen. Reden ist Silber, Schweigen ist Gold.',
      en: 'Sometimes it is better to say nothing. Speech is silver, silence is golden.',
      sw: 'Wakati mwingine ni bora kutokulaumu. Kuongea ni fedha, kimya ni dhahabu.',
    },
    note: {
      en: 'Silence can be more valuable than many words.',
      sw: 'Kimya kinaweza kuwa na thamani kuliko maneno mengi.',
    } },

  { id: 'gp14', type: 'german', enrichment: true,
    phrase: 'Wo ein Wille ist, ist auch ein Weg',
    literal: 'Where there is a will, there is also a way',
    en: 'Where there is a will, there is a way.',
    sw: 'Mwenye nia hupata njia.',
    example: {
      de: 'Ich will Deutsch lernen, also finde ich die Zeit. Wo ein Wille ist, ist auch ein Weg.',
      en: 'I want to learn German, so I will find the time. Where there is a will, there is a way.',
      sw: 'Nataka kujifunza Kijerumani, kwa hiyo nitapata muda. Mwenye nia hupata njia.',
    },
    note: {
      en: 'Strong determination finds a way around obstacles.',
      sw: 'Nia kubwa hupata njia ya kuzunguka vizuizi.',
    } },

  { id: 'gp15', type: 'german', enrichment: true,
    phrase: 'Aus Fehlern lernt man',
    literal: 'From mistakes one learns',
    en: 'We learn from our mistakes.',
    sw: 'Mtu hujifunza kutokana na makosa yake.',
    example: {
      de: 'Der Fehler war nicht gut, aber aus Fehlern lernt man.',
      en: 'The mistake was not good, but we learn from our mistakes.',
      sw: 'Kosa halikuwa zuri, lakini mtu hujifunza kutokana na makosa yake.',
    },
    note: {
      en: 'Mistakes are a chance to improve.',
      sw: 'Makosa ni fursa ya kuboresha.',
    } },

  { id: 'gp16', type: 'german', enrichment: true,
    phrase: 'L\u00fcgen haben kurze Beine',
    literal: 'Lies have short legs',
    en: 'Lies are soon found out; a lie does not travel far.',
    sw: 'Uongo hausafiri mbali; una mwisho.',
    example: {
      de: 'Sei ehrlich! L\u00fcgen haben kurze Beine.',
      en: 'Be honest! Lies are soon found out.',
      sw: 'Kuwa mkweli! Uongo hausafiri mbali.',
    },
    note: {
      en: 'A lie is discovered quickly.',
      sw: 'Uongo hugunduliwa haraka.',
    } },

  { id: 'gp17', type: 'german', enrichment: true,
    phrase: 'Ein Bild sagt mehr als tausend Worte',
    literal: 'A picture says more than a thousand words',
    en: 'A picture is worth a thousand words.',
    sw: 'Picha moja inazidi maneno elfu.',
    example: {
      de: 'Schau dir das Bild an. Ein Bild sagt mehr als tausend Worte.',
      en: 'Look at the picture. A picture is worth a thousand words.',
      sw: 'Angalia picha hiyo. Picha moja inazidi maneno elfu.',
    },
    note: {
      en: 'Images explain things faster than words.',
      sw: 'Picha hueleza mambo haraka kuliko maneno.',
    } },

  { id: 'gp18', type: 'german', enrichment: true,
    phrase: 'Wer nicht wagt, der nicht gewinnt',
    literal: 'Who does not dare, does not win',
    en: 'Nothing ventured, nothing gained.',
    sw: 'Asiyejaribu hashibiki.',
    example: {
      de: 'Frag sie! Wer nicht wagt, der nicht gewinnt.',
      en: 'Ask her! Nothing ventured, nothing gained.',
      sw: 'Muulize! Asiyejaribu hashibiki.',
    },
    note: {
      en: 'You must take a risk in order to win something.',
      sw: 'Lazima ujaribu ili upate mafanikio.',
    } },

  // ------------------------------------------------------------------
  // Authentic Swahili proverbs from PROVERB_SOURCE (hurry\u2013patience)
  // German and English are TRANSLATIONS of the Swahili, not traditional sayings.
  // ------------------------------------------------------------------
  { id: 'sp01', type: 'swahili', item: '2739', source: PROVERB_SOURCE.url,
    phrase: 'Haraka, haraka, haina baraka.',
    literal: 'Hurry, hurry has no blessing',
    de: 'Mit Eile kommt kein Segen.',
    en: 'Haste makes waste \u2014 rushing brings no blessing.',
    note: {
      en: 'A warning that rushing brings no reward; patience does.',
      sw: 'Onyo kwamba haraka huleta hakuna baraka; subira huileta.',
    } },

  { id: 'sp02', type: 'swahili', item: '2745', source: PROVERB_SOURCE.url,
    phrase: 'Kawia ufike.',
    literal: 'Take your time and you will arrive',
    de: 'Nimm dir Zeit, dann kommst du an.',
    en: 'Take your time and you will get there.',
    note: {
      en: 'Patience helps you reach your goal safely.',
      sw: 'Subira hukusaidia kufikia lengo lako.',
    } },

  { id: 'sp03', type: 'swahili', item: '2748', source: PROVERB_SOURCE.url,
    phrase: 'Kukimbia si kufika.',
    literal: 'Running is not arriving',
    de: 'Rennen bedeutet nicht Ankommen.',
    en: 'Rushing is not the same as arriving.',
    note: {
      en: 'Speed alone does not mean you succeed.',
      sw: 'Haraka pekee haimaanishi kufanikiwa.',
    } },

  { id: 'sp04', type: 'swahili', item: '2758', source: PROVERB_SOURCE.url,
    phrase: 'Kwanza kwa saburi, kwisha kwa sururi.',
    literal: 'Begin with patience, end with joy',
    de: 'Erst mit Geduld beginnen, am Ende mit Freude.',
    en: 'Begin with patience and end with joy.',
    note: {
      en: 'Patience at the start leads to a happy ending.',
      sw: 'Subira mwanzoni huleta furaha mwishoni.',
    } },

  { id: 'sp05', type: 'swahili', item: '2764', source: PROVERB_SOURCE.url,
    phrase: 'Mbegu za leo si miti ya kesho.',
    literal: "Today's seeds are not tomorrow's trees",
    de: 'Die Saat von heute ist nicht der Baum von morgen.',
    en: "Today's seeds are not tomorrow's trees.",
    note: {
      en: 'Good results take time to grow.',
      sw: 'Matokeo mazuri huchukua muda kukua.',
    } },

  { id: 'sp06', type: 'swahili', item: '2771', source: PROVERB_SOURCE.url,
    phrase: 'Mstahamilivu hula mbivu.',
    literal: 'The patient one eats ripe fruit',
    de: 'Der Geduldige isst die reife Frucht.',
    en: 'The patient person eats the ripe fruit.',
    note: {
      en: 'People who wait patiently get the best reward.',
      sw: 'Wanaovumilia huwa wanapata manufaa bora.',
    } },
];

export default proverbs;
