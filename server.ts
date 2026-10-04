import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not set. Gemini API calls will fail.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface LearnerProfile {
  reading: string;
  listening: string;
  speaking: string;
  pronunciation: string;
  vocabulary: string;
  grammar: string;
}

export interface ChatRequest {
  history: Array<{
    role: 'user' | 'model';
    text: string;
    correction?: any;
    isDrillRepeat?: boolean;
  }>;
  message: string;
  learnerProfile: LearnerProfile;
  mode: string;
  topic: string;
  currentLevel: string;
  stage: 'warmup' | 'main' | 'challenge' | 'final_task' | 'wrapup';
  questionCount: number;
  inRepeatPhase?: boolean;
  repeatTarget?: string;
  targetSound?: string;
  isGermanRequested?: boolean;
}

// 1. CHAT & COACHING ENDPOINT
app.post('/api/coach/chat', async (req: Request, res: Response) => {
  try {
    const {
      history = [],
      message,
      learnerProfile,
      mode = 'Daily English',
      topic = 'Introducing yourself',
      currentLevel = 'A1',
      stage = 'warmup',
      questionCount = 1,
      inRepeatPhase = false,
      repeatTarget = '',
      targetSound = '',
      isGermanRequested = false,
    }: ChatRequest = req.body;

    const systemInstruction = `You are an expert AI English Speaking and Pronunciation Coach named "SpeakWise Coach".
Your learner is Master Nuri. Always address them respectfully and warmly as "Master Nuri".
Your primary goal is to help Master Nuri improve their spoken English, pronunciation, fluency, listening comprehension and confidence.

LEARNER PROFILE:
- The learner is Master Nuri. Master Nuri understands written English approx at B1 level, but speaking and pronunciation are significantly weaker (currently close to beginner level ${currentLevel}).
- Current Skill Levels: Speaking: ${learnerProfile?.speaking || 'A1'}, Pronunciation: ${learnerProfile?.pronunciation || 'A1'}, Grammar: ${learnerProfile?.grammar || 'A2'}, Vocabulary: ${learnerProfile?.vocabulary || 'B1'}, Listening: ${learnerProfile?.listening || 'A2'}, Reading: ${learnerProfile?.reading || 'B1'}.
- Target practice mode: ${mode}
- Topic: ${topic}
- Current level setting: ${currentLevel}
- Current session stage: ${stage} (Warm-up -> Main Conversation -> Pronunciation Challenges -> Final Speaking Challenge -> Feedback)
- Question count in stage: ${questionCount}

CORE COACH PRINCIPLES:
1. THE LEARNER MUST DO 70-80% OF THE SPEAKING. You do 20-30%. Keep your responses SHORT, encouraging, and clear.
2. Ask ONE short, clear question at a time. Encourage verbal answers. Prefer: "Where did you go yesterday, Master Nuri?" over long preambles.
3. Keep your own language simple, natural, learner-friendly, matching level ${currentLevel}.
4. PRONUNCIATION IS HIGHEST PRIORITY. Pay special attention to:
   - TH sounds (voiceless /θ/ vs voiced /ð/)
   - R, W, V, B, P, F, S, Z, SH, CH
   - Vowel sounds (long vs short vowels, e.g. ship vs sheep, full vs fool)
   - Word stress & sentence stress
   - Connected speech & silent letters
   - Final consonants & plural endings (-s) & past-tense endings (-ed: /t/, /d/, /ɪd/)
5. Explain HOW to produce difficult sounds physically (tongue position between teeth, lip rounded, voice box vibrating, etc.).
6. THREE CORRECTION LEVELS:
   - LEVEL 1 (Gentle): Small mistake that doesn't hinder flow. "Good! One small correction: say 'went' instead of 'go'."
   - LEVEL 2 (Focused): Important mistake or unnatural phrasing. Structure:
     * What learner said (quote only relevant short part)
     * Correct version (natural and correct)
     * Explanation (very simple English)
     * Pronunciation (if phonetic error, explain sound and mouth placement)
     * Repeat prompt (ask learner to repeat corrected sentence)
   - LEVEL 3 (Pronunciation Drill): Repeated pronunciation error or difficult phonetic sound. Break down: Sound -> Word -> Short phrase -> Full sentence.
7. DO NOT OVERCORRECT. Max 1-2 important mistakes per turn. If the learner communicates successfully and mistake is minor, do not stop them.
8. GERMAN EXPLANATION: ${isGermanRequested ? 'The learner asked for German support. Include a concise, simple German explanation of the grammar/pronunciation tip in the "germanExplanation" field, but keep your main coach question in English.' : 'Stay in English. Only use German in "germanExplanation" if a sound or grammar concept is notoriously difficult for German speakers (e.g., TH sound, V vs W confusion). Always return to English immediately.'}
9. ADAPTIVE DIFFICULTY:
   - If learner speaks fluently and accurately: gradually raise complexity.
   - If learner struggles: simplify question, use shorter words, give hints.
10. REPEAT HANDLING:
    - If inRepeatPhase is true, the learner was asked to repeat: "${repeatTarget}".
    - Evaluate whether their repetition was successful or needs one more gentle attempt.
    - If good: praise warmly ("Great pronunciation!", "Much better!") and immediately ask the next conversation question.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with valid JSON matching the schema provided.`;

    const contents = [
      ...history.map((h) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [
          {
            text:
              h.role === 'user'
                ? `Learner said: "${h.text}"${h.isDrillRepeat ? ' (Learner repeating drill)' : ''}`
                : `Coach: ${h.text}`,
          },
        ],
      })),
      {
        role: 'user',
        parts: [
          {
            text: `Learner said: "${message}"\n${
              inRepeatPhase
                ? `Note: Learner is attempting to repeat: "${repeatTarget}". Evaluate this repetition.`
                : `Stage: ${stage}, question #${questionCount}. Evaluate learner speech, decide if correction is needed, and formulate your short reply.`
            }`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coachSpokenReply: {
              type: Type.STRING,
              description: 'Short, clear spoken message from the coach (max 1-3 sentences) ending with a short question.',
            },
            cleanSpeechText: {
              type: Type.STRING,
              description: 'Plain text suitable for audio TTS without markdown formatting.',
            },
            correction: {
              type: Type.OBJECT,
              description: 'Correction object if correction is necessary, otherwise null or omit.',
              properties: {
                level: {
                  type: Type.INTEGER,
                  description: '1 for gentle, 2 for focused, 3 for pronunciation drill',
                },
                learnerSaid: {
                  type: Type.STRING,
                  description: 'Short quoted error phrase the learner said.',
                },
                correctVersion: {
                  type: Type.STRING,
                  description: 'The natural and grammatically correct version.',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Simple, concise explanation of the grammar or vocabulary mistake.',
                },
                germanExplanation: {
                  type: Type.STRING,
                  description: 'Optional German translation/tip for difficult pronunciation or grammar mechanics.',
                },
                pronunciationGuide: {
                  type: Type.OBJECT,
                  description: 'Detailed pronunciation guidance for the problematic sound or word.',
                  properties: {
                    problemWord: { type: Type.STRING },
                    targetSound: { type: Type.STRING, description: 'e.g. /θ/ (unvoiced TH), /v/ vs /w/, /iː/ vs /ɪ/' },
                    ipa: { type: Type.STRING },
                    howToProduce: {
                      type: Type.STRING,
                      description: 'Physical mouth/tongue/vocal cord instruction (e.g. "Tongue tip between teeth, blow air")',
                    },
                    minimalPair: {
                      type: Type.STRING,
                      description: 'Contrast word pair, e.g. "think / sink" or "wet / vet"',
                    },
                    drillSteps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Step 1 sound, Step 2 word, Step 3 short phrase, Step 4 full sentence',
                    },
                  },
                },
                repeatPrompt: {
                  type: Type.STRING,
                  description: 'Prompt asking the learner to repeat, e.g. "Now repeat after me: I went to the supermarket yesterday."',
                },
              },
            },
            requiresRepeat: {
              type: Type.BOOLEAN,
              description: 'True if learner must repeat the sentence/word before proceeding.',
            },
            repeatTargetSentence: {
              type: Type.STRING,
              description: 'The exact sentence or word the learner should repeat.',
            },
            repeatEvaluation: {
              type: Type.OBJECT,
              properties: {
                wasRepeatAttempt: { type: Type.BOOLEAN },
                isSuccessful: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING },
              },
            },
            nextStage: {
              type: Type.STRING,
              description: 'Current or next stage: warmup, main, challenge, final_task, wrapup',
            },
            stageProgressText: {
              type: Type.STRING,
              description: 'e.g. "Warm-up Question 2 of 3" or "Final Speaking Task"',
            },
            skillRatingDelta: {
              type: Type.OBJECT,
              description: 'Current estimated level for each skill based on this interaction',
              properties: {
                speaking: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                grammar: { type: Type.STRING },
                vocabulary: { type: Type.STRING },
                fluency: { type: Type.STRING },
              },
            },
            adaptiveDifficultyNote: {
              type: Type.STRING,
              description: 'Internal note on whether difficulty was slightly increased, maintained, or eased.',
            },
          },
          required: ['coachSpokenReply', 'cleanSpeechText', 'requiresRepeat', 'nextStage'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/coach/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate coach response',
      coachSpokenReply: "I'm sorry, I missed that. Could you please say that again?",
      cleanSpeechText: "I'm sorry, I missed that. Could you please say that again?",
      requiresRepeat: false,
      nextStage: 'main',
    });
  }
});

// 2. TEXT-TO-SPEECH (TTS) ENDPOINT USING gemini-3.8-flash-lite-tts
app.post('/api/coach/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', speed = 'normal' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Limit text length to reasonable size for coach turn
    const cleanText = text.replace(/[*_#`]/g, '').trim().slice(0, 500);

    const stylePrompt =
      speed === 'slow'
        ? 'Speak very clearly, slightly slower than normal, with clear articulation for an English language learner.'
        : 'Warm, patient, clear, and encouraging English speaking coach speaking at an accessible pace.';

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any || 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated by TTS model' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error in /api/coach/tts:', error);
    return res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// 3. PRONUNCIATION DRILL GENERATOR ENDPOINT
app.post('/api/coach/drill', async (req: Request, res: Response) => {
  try {
    const { word, targetSound, currentLevel = 'A1' } = req.body;

    const prompt = `Create a Level 3 pronunciation drill for the word "${word}" targeting the sound "${targetSound || 'general pronunciation'}" for an English learner at level ${currentLevel}.
Explain the exact physical mouth mechanics (tongue placement, lips, breath, vibration) clearly. Provide minimal pairs and a 4-step progressive drill:
1. Sound isolation
2. Word practice
3. Short phrase
4. Full sentence in natural conversation.
Include a brief German tip for German-speaking learners if this sound is commonly tricky (e.g. TH, V vs W, R, short/long vowels).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            ipa: { type: Type.STRING },
            targetSound: { type: Type.STRING },
            soundCategory: { type: Type.STRING, description: 'e.g. Consonant, Vowel, Connected Speech, Word Stress' },
            mouthGuide: {
              type: Type.OBJECT,
              properties: {
                tongue: { type: Type.STRING },
                teethAndLips: { type: Type.STRING },
                voiceVibration: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ['tongue', 'teethAndLips', 'voiceVibration', 'summary'],
            },
            germanTip: { type: Type.STRING },
            minimalPairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  wordA: { type: Type.STRING },
                  wordB: { type: Type.STRING },
                  distinction: { type: Type.STRING },
                },
                required: ['wordA', 'wordB', 'distinction'],
              },
            },
            drillSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  targetText: { type: Type.STRING },
                  instruction: { type: Type.STRING },
                },
                required: ['step', 'title', 'targetText', 'instruction'],
              },
            },
          },
          required: ['word', 'ipa', 'targetSound', 'mouthGuide', 'drillSteps'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/coach/drill:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate drill' });
  }
});

// 4. END-OF-SESSION REPORT ENDPOINT
app.post('/api/coach/session-report', async (req: Request, res: Response) => {
  try {
    const { transcript = [], topic = 'Conversation', level = 'A1' } = req.body;

    const prompt = `Based on the following English speaking coaching session transcript on topic "${topic}" at requested level "${level}", produce the required END-OF-SESSION REPORT following these exact specifications:

1. Speaking Performance (Separate levels for: Pronunciation, Grammar, Vocabulary, Fluency, Listening - each rated on CEFR scale A1, A2, B1, B2, or C1).
2. Main pronunciation problems (List the 1 to 3 most important pronunciation problems observed, explaining why and how to fix them).
3. Words to practice (List up to 5 specific words with IPA and tip).
4. Sentences to repeat (Give 2 to 3 natural sentences for repetition practice).
5. Next recommendation (Recommend the next appropriate difficulty level and topic).
6. Learner speaking ratio estimate (e.g. "72% learner / 28% coach").

TRANSCRIPT:
${transcript
  .map(
    (t: any) =>
      `${t.role === 'user' ? 'Learner' : 'Coach'}: ${t.text}${
        t.correction ? ` [Correction: ${t.correction.correctVersion}]` : ''
      }`
  )
  .join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speakingPerformance: {
              type: Type.OBJECT,
              properties: {
                pronunciation: { type: Type.STRING, description: 'A1, A2, B1, B2, or C1' },
                grammar: { type: Type.STRING, description: 'A1, A2, B1, B2, or C1' },
                vocabulary: { type: Type.STRING, description: 'A1, A2, B1, B2, or C1' },
                fluency: { type: Type.STRING, description: 'A1, A2, B1, B2, or C1' },
                listening: { type: Type.STRING, description: 'A1, A2, B1, B2, or C1' },
                reading: { type: Type.STRING, description: 'A1, A2, B1, B2, or C1' },
              },
              required: ['pronunciation', 'grammar', 'vocabulary', 'fluency', 'listening'],
            },
            performanceSummary: {
              type: Type.STRING,
              description: '2-3 sentence encouraging, honest assessment of the learner strengths and progress.',
            },
            mainPronunciationProblems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sound: { type: Type.STRING },
                  description: { type: Type.STRING },
                  howToFix: { type: Type.STRING },
                },
                required: ['sound', 'description', 'howToFix'],
              },
              description: '1 to 3 key pronunciation issues',
            },
            wordsToPractice: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  soundFocus: { type: Type.STRING },
                  mouthTip: { type: Type.STRING },
                },
                required: ['word', 'ipa', 'soundFocus', 'mouthTip'],
              },
              description: 'Up to 5 words to practice',
            },
            sentencesToRepeat: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 sentences to repeat',
            },
            nextRecommendation: {
              type: Type.OBJECT,
              properties: {
                recommendedLevel: { type: Type.STRING },
                recommendedTopic: { type: Type.STRING },
                rationale: { type: Type.STRING },
              },
              required: ['recommendedLevel', 'recommendedTopic', 'rationale'],
            },
            speakingRatioEstimate: {
              type: Type.OBJECT,
              properties: {
                learnerPercentage: { type: Type.INTEGER },
                coachPercentage: { type: Type.INTEGER },
              },
              required: ['learnerPercentage', 'coachPercentage'],
            },
          },
          required: [
            'speakingPerformance',
            'performanceSummary',
            'mainPronunciationProblems',
            'wordsToPractice',
            'sentencesToRepeat',
            'nextRecommendation',
            'speakingRatioEstimate',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/coach/session-report:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

// 5. AUDIO TRANSCRIBE ENDPOINT (using gemini-3.5-transcribe)
app.post('/api/coach/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: 'Transcribe the spoken English accurately. Return only the transcription.',
          },
        ],
      },
    });

    return res.json({ text: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Error in /api/coach/transcribe:', error);
    return res.status(500).json({ error: error.message || 'Transcription failed' });
  }
});

// Full-stack Vite mounting
async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpeakWise server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
