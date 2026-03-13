
import { RoleDefinition } from './types';

export const ROLES: RoleDefinition[] = [
  // Core Constituents
  { 
    key: 'pv', 
    label: 'Persoonsvorm', 
    shortLabel: 'PV', 
    colorClass: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-100', 
    borderColorClass: 'border-red-200 dark:border-red-700' 
  },
  { 
    key: 'ow', 
    label: 'Onderwerp', 
    shortLabel: 'OW', 
    colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100', 
    borderColorClass: 'border-blue-200 dark:border-blue-700' 
  },
  { 
    key: 'lv', 
    label: 'Lijdend Voorwerp', 
    shortLabel: 'LV', 
    colorClass: 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-100', 
    borderColorClass: 'border-green-200 dark:border-green-700' 
  },
  { 
    key: 'mv', 
    label: 'Meewerkend Voorwerp', 
    shortLabel: 'MV', 
    colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-100', 
    borderColorClass: 'border-purple-200 dark:border-purple-700' 
  },
  { 
    key: 'bwb', 
    label: 'Bijwoordelijke Bepaling', 
    shortLabel: 'BWB', 
    colorClass: 'bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-100', 
    borderColorClass: 'border-orange-200 dark:border-orange-700' 
  },
  { 
    key: 'vv', 
    label: 'Voorzetselvoorwerp', 
    shortLabel: 'VZV', 
    colorClass: 'bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-100', 
    borderColorClass: 'border-pink-200 dark:border-pink-700' 
  },
  { 
    key: 'bijst', 
    label: 'Bijstelling', 
    shortLabel: 'BIJST', 
    colorClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-100', 
    borderColorClass: 'border-indigo-200 dark:border-indigo-700' 
  },
  
  // Predicate Parts (WG/NG)
  { 
    key: 'wg', 
    label: 'Werkwoordelijk Gezegde', 
    shortLabel: 'WG', 
    colorClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-100', 
    borderColorClass: 'border-rose-300 dark:border-rose-600' 
  },
  { 
    key: 'ng',
    label: 'Naamwoordelijk Gezegde',
    shortLabel: 'NG', 
    colorClass: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-100', 
    borderColorClass: 'border-yellow-200 dark:border-yellow-600' 
  },

  // Structural/Clause Roles
  { 
    key: 'bijzin', 
    label: 'Bijzin', 
    shortLabel: 'BIJZIN', 
    colorClass: 'bg-purple-100 text-purple-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-100', 
    borderColorClass: 'border-purple-300 dark:border-fuchsia-700' 
  },
  { 
    key: 'vw_neven', 
    label: 'Nevenschikkend VW', 
    shortLabel: 'NEVEN', 
    colorClass: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200', 
    borderColorClass: 'border-stone-300 dark:border-stone-600' 
  },
  
  // Internal Structure (Sub-roles)
  { 
    key: 'bijv_bep', 
    label: 'Bijvoeglijke Bepaling', 
    shortLabel: 'BB', 
    colorClass: 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-100', 
    borderColorClass: 'border-teal-200 dark:border-teal-700', 
    isSubOnly: true 
  },
  { 
    key: 'vw_onder', 
    label: 'Onderschikkend VW', 
    shortLabel: 'ONDER', 
    colorClass: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200', 
    borderColorClass: 'border-stone-300 dark:border-stone-600', 
    isSubOnly: true 
  },
];

// Feedback for structural errors (Step 1)
export const FEEDBACK_STRUCTURE = {
  TOO_MANY_SPLITS: "Dit zinsdeel is nog niet compleet – er hoort nog minstens één woord bij. Welke woorden vormen samen één zinsdeel? Voeg ze samen.",
  MISSING_SPLIT: "Dit blokje bevat meer dan één zinsdeel. Lees de woorden één voor één en kijk waar een nieuw zinsdeel begint – knip daar.",
  INCONSISTENT: "De woorden in dit blokje horen bij verschillende zinsdelen. Kijk goed welke woorden echt bij elkaar horen en verdeel opnieuw."
};

// Matrix for Role Mismatch Feedback (Step 2)
// Indexed as FEEDBACK_MATRIX[studentLabel][correctLabel]
export const FEEDBACK_MATRIX: Record<string, Record<string, string>> = {
  // ONDERWERP
  'ow': {
    'pv': "Dit zinsdeel doet niets, maar 'doet' juist de persoonsvorm de handeling? Check: Wie of wat + persoonsvorm?",
    'lv': "Ondergaat dit zinsdeel echt de handeling? Of voert het die uit? Check: Wie of wat + persoonsvorm?",
    'mv': "Krijgt dit zinsdeel iets? Of doet het zelf iets? Stel de vraag: Wie of wat + persoonsvorm?",
    'bwb': "Geeft dit echt plaats/tijd/manier aan? Of kun je antwoorden op: Wie of wat + persoonsvorm?"
  },

  // PERSOONSVORM
  'pv': {
    'wg': "Je hebt het hele gezegde gepakt. Welk werkwoord verandert van tijd (tegenwoordige/verleden tijd)? Dat is de persoonsvorm.",
    'ow': "Dit zinsdeel voert de handeling uit, maar is geen werkwoord. Zoek het werkwoord dat van tijd kan veranderen."
  },

  // WERKWOORDELIJK GEZEGDE
  'wg': {
    'pv': "Dit is maar één woord uit het hele gezegde. Welke andere werkwoorden horen er nog bij? Pak die er ook bij.",
    'ng': "Staat hier een koppelwerkwoord (zijn, worden, blijven, lijken, schijnen…)? Dan heet het geheel Naamwoordelijk Gezegde.",
    'lv': "Is dit een 'ding' of 'persoon' die iets ondergaat, of een werkwoordsvorm (bijv. voltooid deelwoord/infinitief) die bij het gezegde hoort?"
  },

  // NAAMWOORDELIJK GEZEGDE
  'ng': {
    'wg': "Is het werkwoord hier een koppelwerkwoord? Zo niet, dan is het gewoon een Werkwoordelijk Gezegde.",
    'lv': "Zegt dit zinsdeel een eigenschap/toestand van het onderwerp? Dan is het geen LV maar deel van het Naamwoordelijk Gezegde.",
    'bwb': "Dit zegt iets over de toestand of eigenschap van het onderwerp (gekoppeld door het werkwoord), niet over de manier waarop (hoe)."
  },

  // LIJDEND VOORWERP
  'lv': {
    'ow': "Voert dit zinsdeel de actie uit of ondergaat het die? Stel eerst de vraag: Wie of wat + persoonsvorm?",
    'vv': "Begint dit zinsdeel met een vast voorzetsel bij het werkwoord (denken aan, wachten op)? Dan hoort het bij een voorzetselvoorwerp.",
    'bwb': "Krijg je hier antwoord op 'wat wordt er gedaan'? Of alleen 'waar/wanneer/waarom'? Alleen dan is het een BWB.",
    'mv': "Wie krijgt hier iets? Kun je 'aan' of 'voor' erbij denken? Dan is dat zinsdeel het Meewerkend Voorwerp, niet het LV."
  },

  // MEEWERKEND VOORWERP
  'mv': {
    'ow': "Doet dit zinsdeel zelf iets, of krijgt het juist iets? Probeer: Aan/voor wie + gezegde + onderwerp?",
    'lv': "Haal je de vragen door elkaar? LV: Wie/wat + gezegde + onderwerp. MV: Aan/voor wie + gezegde + onderwerp.",
    'vv': "Als je 'aan' of 'voor' kunt weglaten (of erbij denken), is het Meewerkend Voorwerp. Bij een VV zit het voorzetsel 'vast'."
  },

  // VOORZETSELVOORWERP
  'vv': {
    'bwb': "Kijk of je het voorzetsel nodig hebt voor de betekenis van het werkwoord (wachten op, dromen van). Zo ja, dan is het een VV.",
    'lv': "Een LV begint bijna nooit met een vast voorzetsel. Hoort dit voorzetsel echt bij het werkwoord? Dan is het een VV.",
    'mv': "Bij een VV hoort het voorzetsel vast bij het werkwoord. Bij een MV kun je vaak 'aan/voor' denken in plaats van het voorzetsel."
  },

  // BIJWOORDELIJKE BEPALING
  'bwb': {
    'vv': "Hoort dit voorzetsel vast bij het werkwoord (figuurlijk)? Of geeft het gewoon een plaats of tijd aan (letterlijk)?",
    'lv': "Wordt hier echt iets gedaan met dit zinsdeel (wie/wat)? Of krijg je extra info over tijd, plaats, reden of manier?",
    'ow': "Kun je op dit zinsdeel antwoorden met Wie of wat + persoonsvorm? Zo niet, dan geeft het waarschijnlijk alleen extra informatie: BWB.",
    'bijzin': "Dit zinsdeel heeft een eigen persoonsvorm. Dan is het een bijzin. Gebruik in deze oefening het blokje 'Bijzin'."
  },

  // BIJSTELLING
  'bijst': {
    'bijv_bep': "Dit staat tussen komma's en is een andere naam voor het zinsdeel ervoor. Dat noemen we een bijstelling.",
    'ow': "Deze woorden geven een extra naam/uitleg bij het onderwerp en kunnen ertussenuit zonder dat de zin kapot gaat. Dat is een bijstelling.",
    'lv': "Kun je deze woorden weglaten en blijft de zin kloppen? Dan is het geen LV maar een bijstelling bij een ander zinsdeel.",
    'bwb': "Staat dit los van de hoofdzin en is het eigenlijk een andere naam/omschrijving? Dan is het geen BWB maar een bijstelling."
  },

  // BIJZIN
  'bijzin': {
    'bwb': "Hoewel deze bijzin functioneert als een BWB, noemen we het in deze oefening een 'Bijzin'.",
    'ow': "Deze hele zin functioneert als onderwerp, maar noem het hier een 'Bijzin'.",
    'lv': "Deze hele zin functioneert als lijdend voorwerp, maar noem het hier een 'Bijzin'."
  },

  // ONDERSCHIKKEND VOEGWOORD
  'vw_onder': {
    'vw_neven': "Dit is een onderschikkend voegwoord, want het leidt een bijzin in.",
    'bwb': "Dit ene woord hoort bij de structuur van de zin, niet als losse tijd/plaatsbepaling. Het leidt een bijzin in: onderschikkend voegwoord."
  },

  // NEVENSCHIKKEND VOEGWOORD
  'vw_neven': {
    'vw_onder': "Dit is een nevenschikkend voegwoord (zoals 'en', 'maar', 'want'). Het verbindt twee hoofdzinnen.",
    'bwb': "Dit woord verbindt twee zinnen, het geeft niet alleen tijd of plaats aan. Kijk of het twee hoofdzinnen aan elkaar knoopt: dan is het een nevenschikkend voegwoord."
  }
};

export const FEEDBACK_SWAP = {
  BIJZIN_HAS_FUNCTIE: (functieName: string) =>
    `Goed gezien dat dit ${functieName} is! Maar omdat het een bijzin is (met eigen onderwerp en PV), gebruik je eerst 'Bijzin' als hoofdlabel. Sleep daarna '${functieName}' naar de functierij eronder.`,
};

export const FEEDBACK_BIJZIN_FUNCTIE = {
  MISSING: "Goed, je hebt de bijzin herkend! Welke rol speelt deze bijzin in de hoofdzin? Bijv. lijdend voorwerp, bijwoordelijke bepaling… Sleep het juiste label naar de functierij.",
  WRONG: (expected: string) => `De bijzin is juist! Maar de functie klopt nog niet. Welke vraag beantwoordt deze bijzin in de hoofdzin? Het juiste antwoord is: ${expected}.`,
};

export const HINTS = {
  MISSING_PV: "Tip: Zoek eerst de persoonsvorm. Zet de zin in een andere tijd – welk woord verandert mee? Dat is de PV.",
  MISSING_OW: "Tip: Zoek het onderwerp. Stel de vraag: 'Wie of wat + PV?' Het antwoord is het onderwerp.",
  MISSING_WG: "Tip: Zijn er meer werkwoorden in de zin dan alleen de PV? Die vormen samen met de PV het werkwoordelijk gezegde.",
  MISSING_NG: "Tip: Het werkwoord in deze zin is een koppelwerkwoord (zijn, worden, lijken…). Wat wordt er over het onderwerp gezegd? Dat is het naamwoordelijk gezegde.",
  MISSING_LV: "Tip: Is er een lijdend voorwerp? Vraag: 'Wie of wat + gezegde + OW?' Als je een antwoord vindt, is dat het LV.",
  MISSING_MV: "Tip: Is er een meewerkend voorwerp? Vraag: 'Aan/voor wie + gezegde + OW + LV?'",
  MISSING_VV: "Tip: Staat er een voorzetsel dat vast bij het werkwoord hoort? Bijv. 'wachten op', 'denken aan'. Dat zinsdeel is het voorzetselvoorwerp.",
  MISSING_BWB: "Tip: Geeft een zinsdeel extra informatie over hoe, waar, wanneer of waarom? Dat is een bijwoordelijke bepaling.",
  MISSING_BIJZIN: "Tip: Bevat een deel van de zin een eigen onderwerp en persoonsvorm (ingeleid door een voegwoord)? Dat is een bijzin.",
  MISSING_BIJST: "Tip: Staat er een tussenstukje (vaak tussen komma's) dat een eerder zinsdeel hernoemt? Dat is een bijstelling.",
  MISSING_BIJZIN_FUNCTIE: "Tip: Deze bijzin vervult ook een functie in de hoofdzin (bijv. lijdend voorwerp, bijwoordelijke bepaling). Sleep het juiste label naar de functierij.",
  generic: (roleLabel: string) => `Tip: Er ontbreekt nog een label. Zoek het zinsdeel '${roleLabel}'.`,
  ALL_PLACED: "Goed, je hebt alle labels geplaatst! Controleer nu of elk label op de juiste plek staat.",
};

// Study tips per role, shown on the ScoreScreen for common mistakes
export const SCORE_TIPS: Record<string, string> = {
  'Persoonsvorm': 'Doe altijd de tijdsproef: welk woord verandert als je de zin in een andere tijd zet?',
  'Onderwerp': 'Vraag: "Wie of wat + PV?" Het antwoord is het onderwerp.',
  'Lijdend Voorwerp': 'Vraag: "Wie of wat + gezegde + OW?" Het antwoord is het lijdend voorwerp.',
  'Meewerkend Voorwerp': 'Vraag: "Aan/voor wie + gezegde + OW + LV?" Het antwoord is het meewerkend voorwerp.',
  'Bijwoordelijke Bepaling': 'Bijwoordelijke bepalingen beantwoorden: "Hoe? Waar? Wanneer? Waarom?"',
  'Voorzetselvoorwerp': 'Het voorzetsel hoort vast bij het werkwoord (bijv. denken aan, wachten op).',
  'Werkwoordelijk Gezegde': 'Alle werkwoorden samen (inclusief de PV) vormen het werkwoordelijk gezegde.',
  'Naamwoordelijk Gezegde': 'Na een koppelwerkwoord (zijn, worden, lijken) volgt het naamwoordelijk gezegde.',
  'Bijzin': 'Een bijzin heeft een eigen onderwerp en persoonsvorm, vaak ingeleid door een voegwoord.',
  'Bijstelling': 'Een bijstelling hernoemt een eerder zinsdeel en staat vaak tussen komma\'s.',
  'Verdeling': 'Lees de zin woord voor woord en bepaal bij elk woord: hoort dit nog bij het vorige zinsdeel?',
  'Nevenschikkend VW': 'Nevenschikkende voegwoorden: en, maar, want, of, dus. Ze verbinden gelijkwaardige zinnen.',
  'Onderschikkend VW': 'Onderschikkende voegwoorden: omdat, dat, als, toen, wanneer. Ze leiden een bijzin in.',
  'Bijvoeglijke Bepaling': 'Een bijvoeglijke bepaling voegt een eigenschap toe aan een zelfstandig naamwoord.',
};
