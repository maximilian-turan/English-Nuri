import { CEFRLevel } from '../../types';

export type VocabPartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'phrase';

export interface VocabExample {
  en: string;
  de: string;
}

export interface VocabWord {
  id: string;
  rank: number;
  word: string;
  level: CEFRLevel;
  partOfSpeech: VocabPartOfSpeech;
  meaningDe: string;
  ipa: string;
  phoneticSpelling: string;
  soundTip?: string;
  examples: VocabExample[];
}

export interface WordMasteryState {
  isMastered: boolean;
  practiceCount: number;
  lastPracticed?: number;
  bestScore?: number;
}
