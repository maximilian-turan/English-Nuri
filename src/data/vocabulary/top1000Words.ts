import { VocabWord } from './vocabTypes';
import { A1_WORDS } from './a1Words';
import { A2_WORDS } from './a2Words';
import { B1_WORDS } from './b1Words';
import { B2_WORDS } from './b2Words';
import { C1_WORDS } from './c1Words';
import { CEFRLevel } from '../../types';

export * from './vocabTypes';
export { A1_WORDS } from './a1Words';
export { A2_WORDS } from './a2Words';
export { B1_WORDS } from './b1Words';
export { B2_WORDS } from './b2Words';
export { C1_WORDS } from './c1Words';

/**
 * Complete collection of 1,000 Most Used English Words, stratified into 5 CEFR levels (200 words each).
 */
export const TOP_1000_WORDS: VocabWord[] = [
  ...A1_WORDS,
  ...A2_WORDS,
  ...B1_WORDS,
  ...B2_WORDS,
  ...C1_WORDS
];

export const VOCAB_BY_LEVEL: Record<CEFRLevel, VocabWord[]> = {
  A1: A1_WORDS,
  A2: A2_WORDS,
  B1: B1_WORDS,
  B2: B2_WORDS,
  C1: C1_WORDS
};

export const LEVEL_STATS: Record<CEFRLevel, { count: number; startRank: number; endRank: number; label: string; deDescription: string }> = {
  A1: {
    count: 200,
    startRank: 1,
    endRank: 200,
    label: 'A1 - Anfänger (Grundwortschatz)',
    deDescription: 'Die 200 grundlegendsten Wörter des Englischen: Verben des Alltags, Zahlen, Fragewörter, Familie und essenzielle Höflichkeitsformen.'
  },
  A2: {
    count: 200,
    startRank: 201,
    endRank: 400,
    label: 'A2 - Grundlegende Kenntnisse',
    deDescription: 'Alltägliche Konversation, Beschreibungen, Reisen, Arbeit, Emotionen und praktische Handlungen.'
  },
  B1: {
    count: 200,
    startRank: 401,
    endRank: 600,
    label: 'B1 - Fortgeschrittene Sprachverwendung',
    deDescription: 'Berufliche Kommunikation, Argumentation, Problemlösung, Zukunftspläne und differenzierte Sachverhalte.'
  },
  B2: {
    count: 200,
    startRank: 601,
    endRank: 800,
    label: 'B2 - Selbstständige Sprachverwendung',
    deDescription: 'Gehobenes Business-Englisch, Management, Verhandlung, präzise Adjektive und abstrakte Zusammenhänge.'
  },
  C1: {
    count: 200,
    startRank: 801,
    endRank: 1000,
    label: 'C1 - Fachkundige Sprachkenntnisse',
    deDescription: 'Akademische und rhetorische Eloquenz, subtile Nuancen, anspruchsvolle Führungssprache und stilistische Vielfalt.'
  }
};

/**
 * Fast lookup map by lowercase word
 */
export const VOCAB_MAP = new Map<string, VocabWord>(
  TOP_1000_WORDS.map(w => [w.word.toLowerCase(), w])
);

/**
 * Fast lookup map by ID
 */
export const VOCAB_BY_ID = new Map<string, VocabWord>(
  TOP_1000_WORDS.map(w => [w.id, w])
);
