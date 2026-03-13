
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
    key: 'nwd', 
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

  'ow': {
    'pv': "Tijdsproef?",
    'lv': "OW: wie/wat + PV? LV: wie/wat + OW + PV?",
    'mv': "OW: wie/wat + PV? MV: aan/voor wie + PV?",
    'bwb': "OW: wie/wat + PV?",
    'vv': "Begint dit met een voorzetsel?",
    'wg': "Zijn dit werkwoorden?",
    'nwd': "OW: wie/wat + PV?",
    'bijst': "Staat dit tussen komma's als hernoemer?",
    'bijzin': "Eigen PV?",
  },

  'pv': {
    'wg': "Tijdsproef: is dit het ene werkwoord dat verandert?",
    'ow': "Is dit een werkwoord?",
    'lv': "Is dit een werkwoord?",
    'nwd': "Is dit het koppelwerkwoord zelf?",
    'bwb': "Is dit een werkwoord?",
  },

  'wg': {
    'pv': "PV = apart label. Zijn er ook andere werkwoorden?",
    'nwd': "Koppelwerkwoord (zijn/worden/lijken…)?",
    'lv': "Zijn dit werkwoorden?",
    'ow': "Zijn dit werkwoorden?",
    'bwb': "Zijn dit werkwoorden?",
    'vv': "Begint dit met een voorzetsel?",
    'mv': "Zijn dit werkwoorden?",
  },

  'nwd': {
    'wg': "Koppelwerkwoord aanwezig?",
    'lv': "Ondergaat of beschrijft dit?",
    'bwb': "Via koppelwerkwoord, of weglasbaar?",
    'ow': "OW: wie/wat + PV?",
  },

  'lv': {
    'ow': "OW: wie/wat + PV? LV: wie/wat + OW + PV?",
    'vv': "Vast voorzetsel bij het werkwoord?",
    'bwb': "LV: wie/wat + PV + OW?",
    'mv': "LV: wie/wat + PV + OW? MV: aan/voor wie + PV + OW?",
    'nwd': "Ondergaat of beschrijft dit?",
    'bijst': "Weglasbaar zonder betekenisverlies?",
    'wg': "Zijn dit werkwoorden?",
    'bijzin': "Eigen PV?",
  },

  'mv': {
    'ow': "OW: wie/wat + PV? MV: aan/voor wie + PV?",
    'lv': "LV: wie/wat + PV + OW? MV: aan/voor wie + PV + OW?",
    'vv': "Vervangbaar door 'aan'/'voor'?",
    'bwb': "MV: aan/voor wie + PV?",
    'pv': "Tijdsproef?",
    'nwd': "Ontvangt of beschrijft dit?",
  },

  'vv': {
    'bwb': "Figuurlijk of letterlijk voorzetsel?",
    'lv': "Voorzetsel vast of los?",
    'mv': "Vervangbaar door 'aan'/'voor'?",
    'ow': "OW: wie/wat + PV?",
    'nwd': "Vast voorzetsel, of beschrijving via koppelwerkwoord?",
  },

  'bwb': {
    'vv': "Figuurlijk vast voorzetsel bij het werkwoord?",
    'lv': "LV: wie/wat + PV + OW?",
    'ow': "OW: wie/wat + PV?",
    'bijzin': "Eigen PV?",
    'mv': "MV: aan/voor wie + PV?",
    'nwd': "Via koppelwerkwoord?",
    'bijst': "Tussen komma's als hernoemer?",
    'pv': "Tijdsproef?",
    'wg': "Zijn dit werkwoorden?",
  },

  'bijst': {
    'ow': "OW: wie/wat + PV?",
    'lv': "Weglasbaar zonder betekenisverlies?",
    'bwb': "Extra info, of hernoemer?",
    'nwd': "Via koppelwerkwoord, of hernoemer?",
    'vv': "Vast voorzetsel, of hernoemer?",
    'bijzin': "Eigen PV?",
    'wg': "Werkwoorden, of hernoemer?",
  },

  'bijzin': {
    'bwb': "Eigen PV?",
    'ow': "Eigen PV?",
    'lv': "Eigen PV?",
    'bijst': "Eigen PV?",
    'vv': "Eigen PV?",
  },

  'vw_onder': {
    'vw_neven': "Afhankelijk of gelijkwaardig?",
    'bwb': "Inleidend woord of zelfstandig zinsdeel?",
    'ow': "OW: wie/wat + PV?",
    'lv': "Is dit een inhoudswoord?",
  },

  'vw_neven': {
    'vw_onder': "Twee gelijkwaardige zinnen of afhankelijke bijzin?",
    'bwb': "Verbindingswoord of inhoudelijk zinsdeel?",
    'ow': "OW: wie/wat + PV?",
  }
};

export const HINTS = {
  MISSING_PV: "Tip: Zoek eerst de persoonsvorm. Zet de zin in een andere tijd/getal – welk werkwoord verandert mee? Dat is de PV.",
  MISSING_OW: "Tip: Zoek het onderwerp. Stel de vraag: 'Wie of wat + PV?'",
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
