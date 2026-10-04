export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface LearnerProfile {
  reading: CEFRLevel;
  listening: CEFRLevel;
  speaking: CEFRLevel;
  pronunciation: CEFRLevel;
  vocabulary: CEFRLevel;
  grammar: CEFRLevel;
  fluency?: CEFRLevel;
}

export type ConversationMode =
  | 'Free conversation'
  | 'Pronunciation'
  | 'Daily English'
  | 'Job and business'
  | 'Travel'
  | 'A specific topic';

export type SessionStage =
  | 'warmup'
  | 'main'
  | 'challenge'
  | 'final_task'
  | 'wrapup';

export interface PronunciationGuide {
  problemWord?: string;
  targetSound: string;
  ipa?: string;
  howToProduce: string;
  minimalPair?: string;
  drillSteps?: string[];
}

export interface Correction {
  level: 1 | 2 | 3;
  learnerSaid: string;
  correctVersion: string;
  explanation: string;
  germanExplanation?: string;
  pronunciationGuide?: PronunciationGuide;
  repeatPrompt?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  cleanSpeechText?: string;
  timestamp: number;
  correction?: Correction;
  requiresRepeat?: boolean;
  repeatTarget?: string;
  isRepeatAttempt?: boolean;
  repeatSuccess?: boolean;
  audioUrl?: string;
  audioDuration?: number;
}

export interface TopicItem {
  id: string;
  title: string;
  level: CEFRLevel;
  category: string;
  description: string;
  starterQuestion: string;
}

export interface SoundGuide {
  id: string;
  symbol: string;
  name: string;
  category: 'consonants' | 'vowels' | 'stress_and_flow' | 'endings';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  mouthGuide: {
    tongue: string;
    teethAndLips: string;
    vocalCords: string;
    summary: string;
  };
  germanTip?: string;
  exampleWords: Array<{ word: string; ipa: string }>;
  minimalPairs: Array<{ wordA: string; wordB: string; note: string }>;
  practiceSentence: string;
}

export interface SessionReportData {
  speakingPerformance: {
    pronunciation: CEFRLevel;
    grammar: CEFRLevel;
    vocabulary: CEFRLevel;
    fluency: CEFRLevel;
    listening: CEFRLevel;
    reading?: CEFRLevel;
  };
  performanceSummary: string;
  mainPronunciationProblems: Array<{
    sound: string;
    description: string;
    howToFix: string;
  }>;
  wordsToPractice: Array<{
    word: string;
    ipa: string;
    soundFocus: string;
    mouthTip: string;
  }>;
  sentencesToRepeat: string[];
  nextRecommendation: {
    recommendedLevel: CEFRLevel;
    recommendedTopic: string;
    rationale: string;
  };
  speakingRatioEstimate: {
    learnerPercentage: number;
    coachPercentage: number;
  };
  totalTurns: number;
  learnerWordCount: number;
}
