import { CEFRLevel } from '../types';

export interface ClassicBook {
  id: string;
  title: string;
  author: string;
  year: number;
  wordCount: number;
  estimatedReadTimeMinutes: number;
  cefrLevel: CEFRLevel;
  genre: string;
  subtitle: string;
  synopsis: string;
  vocabulary: Array<{
    word: string;
    ipa: string;
    definition: string;
    germanTranslation: string;
    contextSentence: string;
  }>;
  discussionQuestions: string[];
  paragraphs: string[];
}
