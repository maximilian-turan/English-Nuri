// Client-Side English Coach Engine (100% Ohne API / Offline-fähig)
import { CEFRLevel, ConversationMode, LearnerProfile, SessionStage } from '../types';

export interface LocalCoachInput {
  message: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
  topic: string;
  currentLevel: CEFRLevel;
  mode: ConversationMode;
  stage: SessionStage;
  questionCount: number;
  isDrillRepeat?: boolean;
  repeatTarget?: string;
  isGermanRequested?: boolean;
}

export interface LocalCoachOutput {
  coachSpokenReply: string;
  cleanSpeechText: string;
  correction?: {
    learnerSaid: string;
    correctVersion: string;
    explanation: string;
    germanExplanation?: string;
    level: 1 | 2 | 3;
    pronunciationGuide?: {
      targetSound: string;
      problemWord?: string;
      ipa?: string;
      howToProduce: string;
      contrastWord?: string;
      drillSteps?: string[];
    };
    repeatPrompt?: string;
  };
  requiresRepeat: boolean;
  repeatTargetSentence?: string;
  nextStage: SessionStage;
  stageProgressText: string;
  skillRatingDelta?: {
    speaking: CEFRLevel;
    pronunciation: CEFRLevel;
    grammar: CEFRLevel;
    vocabulary: CEFRLevel;
    fluency: CEFRLevel;
  };
}

// Common English learner patterns & gentle corrections
const COMMON_MISTAKES = [
  {
    regex: /\bi am agree\b/i,
    correct: "I agree",
    explanation: "In English, 'agree' is a verb. Say 'I agree', not 'I am agree'.",
    german: "Im Englischen ist 'agree' ein Verb. Sag einfach 'I agree'!",
    problemWord: "agree",
    targetSound: "/ə/",
    ipa: "/əˈɡriː/",
    tip: "Stress the second syllable: uh-GREE.",
  },
  {
    regex: /\bi buyed\b/i,
    correct: "I bought",
    explanation: "'Buy' has an irregular past tense: 'bought'.",
    german: "Die Vergangenheitsform von 'buy' ist unregelmäßig: 'bought'.",
    problemWord: "bought",
    targetSound: "/ɔː/",
    ipa: "/bɔːt/",
    tip: "The 'gh' is completely silent. Rhymes with 'caught'.",
  },
  {
    regex: /\bi wented\b/i,
    correct: "I went",
    explanation: "'Go' in past tense is 'went', not 'wented'.",
    german: "Vergangenheit von 'go' ist 'went'.",
    problemWord: "went",
    targetSound: "/w/",
    ipa: "/wɛnt/",
    tip: "Round your lips for the 'W' sound.",
  },
  {
    regex: /\bhe go\b/i,
    correct: "he goes",
    explanation: "Remember 3rd person singular -s: 'he goes'.",
    german: "Denke an das 'he/she/it das 's' muss mit': 'he goes'.",
    problemWord: "goes",
    targetSound: "/z/",
    ipa: "/ɡoʊz/",
    tip: "End with a vibrating /z/ sound.",
  },
  {
    regex: /\bi have (\d+) years\b/i,
    correct: "I am $1 years old",
    explanation: "In English, use 'I am ... years old', not 'I have'.",
    german: "Im Englischen sagt man 'I am ... years old', nicht 'I have'.",
    problemWord: "years",
    targetSound: "/j/",
    ipa: "/jɪərz/",
    tip: "Start with a soft 'Y' sound like in 'yes'.",
  },
];

// Topic-based prompt questions for teenagers (10–15 years)
const TOPIC_QUESTIONS: Record<string, string[]> = {
  default: [
    "What is your favourite thing to do after school or on weekends?",
    "If you could travel anywhere in the world tomorrow, where would you go?",
    "Tell me about your best friend or your favourite subject in school.",
    "Do you prefer reading books, playing games, or watching movies?",
    "What is one thing that made you smile today?",
    "What kind of music or sport do you enjoy most?",
  ],
  "Introducing yourself": [
    "Nice to meet you! How old are you, and where are you from?",
    "What are your favourite hobbies when you have free time?",
    "Do you have any pets, or would you like to have one?",
    "What is your favourite food in the whole world?",
  ],
  "School & Daily Life": [
    "What subject in school do you find most interesting, and why?",
    "How do you usually get to school in the morning?",
    "What is the best part of your school day?",
    "Do you have any fun projects you are working on right now?",
  ],
  "Hobbies & Free Time": [
    "What sport or game do you love playing the most?",
    "Do you like playing computer games or outdoor games better?",
    "Can you play any musical instruments or do you like to sing?",
    "Tell me about a great book or movie you enjoyed recently.",
  ],
  "Food & Cooking": [
    "What is your favourite meal that your family cooks?",
    "Do you like sweet desserts or salty snacks better?",
    "If you were cooking dinner tonight, what would you make?",
    "Have you ever tried food from another country, like Italian pizza or tacos?",
  ],
  "Travel & Holidays": [
    "Where was your favourite holiday destination so far?",
    "Do you prefer relaxing by the beach or exploring mountains and cities?",
    "What is the most important thing you always pack in your suitcase?",
    "If you could visit a famous landmark, like the Big Ben or Statue of Liberty, which one?",
  ],
};

export function generateLocalCoachResponse(input: LocalCoachInput): LocalCoachOutput {
  const { message, topic, currentLevel, stage, questionCount, isDrillRepeat, repeatTarget, isGermanRequested } = input;
  const cleanMsg = message.trim();

  // If in repeat phase
  if (isDrillRepeat && repeatTarget) {
    const praise = [
      "Fantastic pronunciation! That sounded so natural and clear.",
      "Well done! Much better pronunciation. Great job!",
      "Excellent work! Your articulation was spot on.",
    ][Math.floor(Math.random() * 3)];

    const followUp = getNextQuestion(topic, questionCount);

    return {
      coachSpokenReply: `${praise} Now, ${followUp}`,
      cleanSpeechText: `${praise} Now, ${followUp}`,
      requiresRepeat: false,
      nextStage: getNextStage(stage, questionCount),
      stageProgressText: getProgressText(stage, questionCount),
      skillRatingDelta: {
        speaking: currentLevel,
        pronunciation: currentLevel,
        grammar: currentLevel,
        vocabulary: currentLevel,
        fluency: currentLevel,
      },
    };
  }

  // Check for common grammatical or phonological error
  let detectedMistake = null;
  for (const m of COMMON_MISTAKES) {
    if (m.regex.test(cleanMsg)) {
      detectedMistake = m;
      break;
    }
  }

  // Next conversation prompt
  const nextQ = getNextQuestion(topic, questionCount);

  if (detectedMistake) {
    const coachSpokenReply = `Great idea! One quick tip: instead of "${detectedMistake.regex.exec(cleanMsg)?.[0]}", say "${detectedMistake.correct}". Let's practice! Can you repeat: "${detectedMistake.correct}"?`;
    return {
      coachSpokenReply,
      cleanSpeechText: coachSpokenReply,
      correction: {
        learnerSaid: detectedMistake.regex.exec(cleanMsg)?.[0] || cleanMsg,
        correctVersion: detectedMistake.correct,
        explanation: detectedMistake.explanation,
        germanExplanation: isGermanRequested ? detectedMistake.german : undefined,
        level: 2,
        pronunciationGuide: {
          targetSound: detectedMistake.targetSound,
          problemWord: detectedMistake.problemWord,
          ipa: detectedMistake.ipa,
          howToProduce: detectedMistake.tip,
        },
        repeatPrompt: `Now repeat after me: "${detectedMistake.correct}"`,
      },
      requiresRepeat: true,
      repeatTargetSentence: detectedMistake.correct,
      nextStage: stage,
      stageProgressText: `Pronunciation Practice · ${detectedMistake.problemWord}`,
    };
  }

  // Natural positive conversation reply
  const acknowledgements = [
    "That sounds wonderful!",
    "That is really interesting!",
    "I love hearing about that!",
    "Great answer! You spoke clearly.",
    "Very well said!",
    "Awesome point!",
  ];
  const ack = acknowledgements[Math.floor(Math.random() * acknowledgements.length)];

  const coachSpokenReply = `${ack} ${nextQ}`;

  return {
    coachSpokenReply,
    cleanSpeechText: coachSpokenReply,
    requiresRepeat: false,
    nextStage: getNextStage(stage, questionCount),
    stageProgressText: getProgressText(stage, questionCount),
    skillRatingDelta: {
      speaking: currentLevel,
      pronunciation: currentLevel,
      grammar: currentLevel,
      vocabulary: currentLevel,
      fluency: currentLevel,
    },
  };
}

function getNextQuestion(topic: string, questionCount: number): string {
  const list = TOPIC_QUESTIONS[topic] || TOPIC_QUESTIONS.default;
  const idx = (questionCount - 1) % list.length;
  return list[idx];
}

function getNextStage(current: SessionStage, count: number): SessionStage {
  if (count <= 2) return 'warmup';
  if (count <= 5) return 'main';
  if (count <= 7) return 'challenge';
  if (count === 8) return 'final_task';
  return 'wrapup';
}

function getProgressText(stage: SessionStage, count: number): string {
  if (count <= 2) return `Warm-up • Question ${count} of 2`;
  if (count <= 5) return `Active Dialogue • Step ${count - 2} of 3`;
  if (count <= 7) return `Challenge Task • Question ${count - 5} of 2`;
  if (count === 8) return `Final 60-Second Speaking Challenge`;
  return `Wrap-up • Reviewing Today's English Progress`;
}
