import React, { useState, useEffect } from 'react';
import {
  CEFRLevel,
  ConversationMode,
  LearnerProfile,
  Message,
  SessionReportData,
  SessionStage,
  TopicItem,
} from './types';
import { Header } from './components/Header';
import { ConversationView } from './components/ConversationView';
import { SkillsModal } from './components/SkillsModal';
import { SoundLabModal } from './components/SoundLabModal';
import { TopicPickerModal } from './components/TopicPickerModal';
import { FinalSpeakingChallenge } from './components/FinalSpeakingChallenge';
import { SessionReportModal } from './components/SessionReportModal';
import { WordBankModal, SavedWord } from './components/WordBankModal';
import { ReadingClassicsModal } from './components/ReadingClassicsModal';
import { Top1000WordsModal } from './components/Top1000WordsModal';
import { HomeDashboard } from './components/HomeDashboard';
import { TOPICS_DATA } from './data/topics';
import { audioService } from './utils/audio';
import { Sparkles, MessageSquare, BookOpen, Volume2 } from 'lucide-react';

const INITIAL_FIRST_MESSAGE = `Hi Master Nuri! I'm your NextLumen English coach.

Click the microphone to speak, or tell me: What would you like to practice today?`;

const DEFAULT_PROFILE: LearnerProfile = {
  reading: 'B1',
  listening: 'A2',
  speaking: 'A1',
  pronunciation: 'A1',
  vocabulary: 'B1',
  grammar: 'A2',
};

export default function App() {
  // Session & Learner State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'first-msg',
      role: 'model',
      text: INITIAL_FIRST_MESSAGE,
      cleanSpeechText:
        "Hi Master Nuri! I'm your English speaking coach. What would you like to practice today? Free conversation, Pronunciation, Daily English, Job and business, Travel, or a specific topic? And what level would you like? A1, A2, B1, B2, or C1?",
      timestamp: Date.now(),
    },
  ]);

  const [activeView, setActiveView] = useState<'dashboard' | 'conversation'>('dashboard');
  const [classicsTargetLevel, setClassicsTargetLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>('A1');
  const [currentMode, setCurrentMode] = useState<ConversationMode>('Daily English');
  const [currentTopic, setCurrentTopic] = useState<string>('Introducing yourself');
  const [sessionStage, setSessionStage] = useState<SessionStage>('warmup');
  const [stageProgressText, setStageProgressText] = useState<string>('Warm-up • Question 1 of 3');
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>(DEFAULT_PROFILE);

  // Audio & Settings State
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(true);
  const [voiceSpeed, setVoiceSpeed] = useState<'normal' | 'slow'>('normal');
  const [germanAssistance, setGermanAssistance] = useState<boolean>(false);

  // Modals State
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isSoundLabOpen, setIsSoundLabOpen] = useState(false);
  const [isTopicPickerOpen, setIsTopicPickerOpen] = useState(false);
  const [isFinalChallengeOpen, setIsFinalChallengeOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isWordBankOpen, setIsWordBankOpen] = useState(false);
  const [isClassicsOpen, setIsClassicsOpen] = useState(false);
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [vocabTargetLevel, setVocabTargetLevel] = useState<CEFRLevel | 'ALL'>('ALL');

  // Word Bank & Reports
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [sessionReport, setSessionReport] = useState<SessionReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

  // Live Speaking Stats
  const [learnerWordCount, setLearnerWordCount] = useState(0);
  const [coachWordCount, setCoachWordCount] = useState(40); // seed with initial coach greeting

  // Load saved words from localStorage
  useEffect(() => {
    try {
      const storedWords = localStorage.getItem('speakwise_saved_words');
      if (storedWords) {
        setSavedWords(JSON.parse(storedWords));
      }
      const storedProfile = localStorage.getItem('speakwise_profile');
      if (storedProfile) {
        setLearnerProfile(JSON.parse(storedProfile));
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
  }, []);

  const handleUpdateProfile = (newProfile: LearnerProfile) => {
    setLearnerProfile(newProfile);
    try {
      localStorage.setItem('speakwise_profile', JSON.stringify(newProfile));
    } catch (e) {
      // ignore
    }
  };

  const handleSaveWordToBank = (word: string, ipa: string, tip: string) => {
    const newWord: SavedWord = {
      id: `${word}-${Date.now()}`,
      word,
      ipa,
      mouthTip: tip,
      timestamp: Date.now(),
    };
    const updated = [newWord, ...savedWords.filter((w) => w.word.toLowerCase() !== word.toLowerCase())];
    setSavedWords(updated);
    try {
      localStorage.setItem('speakwise_saved_words', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleRemoveWord = (id: string) => {
    const updated = savedWords.filter((w) => w.id !== id);
    setSavedWords(updated);
    try {
      localStorage.setItem('speakwise_saved_words', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Calculate live speaking ratio (target: learner 70-80%, coach 20-30%)
  const totalWords = learnerWordCount + coachWordCount || 1;
  const learnerRatio = Math.round((learnerWordCount / totalWords) * 100) || 75;

  // Send message to coach
  const handleSendMessage = async (userText: string, isDrillRepeat: boolean = false) => {
    if (!userText.trim()) return;

    // Track learner word count
    const words = userText.trim().split(/\s+/).length;
    setLearnerWordCount((prev) => prev + words);

    // Check if the user is in a repetition phase
    const lastMsg = messages[messages.length - 1];
    const wasInRepeat = !!(lastMsg && lastMsg.role === 'model' && lastMsg.requiresRepeat);
    const repeatTarget = lastMsg?.repeatTarget || '';

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: Date.now(),
      isRepeatAttempt: wasInRepeat,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoadingCoach(true);

    try {
      // Check if user is asking to change topic or mode in text
      const cleanLower = userText.toLowerCase();
      if (cleanLower.includes('a1')) setCurrentLevel('A1');
      else if (cleanLower.includes('a2')) setCurrentLevel('A2');
      else if (cleanLower.includes('b1')) setCurrentLevel('B1');
      else if (cleanLower.includes('b2')) setCurrentLevel('B2');
      else if (cleanLower.includes('c1')) setCurrentLevel('C1');

      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.map((m) => ({
            role: m.role,
            text: m.text,
            correction: m.correction,
            isDrillRepeat: m.isRepeatAttempt,
          })),
          message: userText,
          learnerProfile,
          mode: currentMode,
          topic: currentTopic,
          currentLevel,
          stage: sessionStage,
          questionCount,
          inRepeatPhase: wasInRepeat,
          repeatTarget,
          isGermanRequested: germanAssistance,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      // Track coach word count (kept short: 20-30%)
      const coachWords = (data.coachSpokenReply || '').trim().split(/\s+/).length;
      setCoachWordCount((prev) => prev + coachWords);

      // Create model message
      const newModelMsg: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.coachSpokenReply,
        cleanSpeechText: data.cleanSpeechText,
        timestamp: Date.now(),
        correction: data.correction,
        requiresRepeat: data.requiresRepeat,
        repeatTarget: data.repeatTargetSentence || data.correction?.correctVersion,
      };

      setMessages((prev) => [...prev, newModelMsg]);

      // Update stage & progress
      if (data.nextStage && data.nextStage !== sessionStage) {
        setSessionStage(data.nextStage);
      }
      if (data.stageProgressText) {
        setStageProgressText(data.stageProgressText);
      }
      setQuestionCount((prev) => prev + 1);

      // Auto-save problem words to bank if correction had pronunciation guide
      if (data.correction?.pronunciationGuide?.problemWord) {
        handleSaveWordToBank(
          data.correction.pronunciationGuide.problemWord,
          data.correction.pronunciationGuide.ipa || '',
          data.correction.pronunciationGuide.howToProduce || ''
        );
      }

      // Update skill delta if provided
      if (data.skillRatingDelta) {
        setLearnerProfile((prev) => ({
          ...prev,
          speaking: (data.skillRatingDelta.speaking as CEFRLevel) || prev.speaking,
          pronunciation: (data.skillRatingDelta.pronunciation as CEFRLevel) || prev.pronunciation,
          grammar: (data.skillRatingDelta.grammar as CEFRLevel) || prev.grammar,
          vocabulary: (data.skillRatingDelta.vocabulary as CEFRLevel) || prev.vocabulary,
          fluency: (data.skillRatingDelta.fluency as CEFRLevel) || prev.fluency,
        }));
      }

      // Trigger 60s final challenge if stage transitioned to final_task
      if (data.nextStage === 'final_task' && sessionStage !== 'final_task') {
        setIsFinalChallengeOpen(true);
      }
    } catch (err: any) {
      console.error('Error contacting coach API:', err);
      const fallbackMsg: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: "I'm listening! Could you please repeat that? What do you think about our topic?",
        cleanSpeechText: "I'm listening! Could you please repeat that? What do you think about our topic?",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoadingCoach(false);
    }
  };

  // Generate End-of-Session Report
  const handleFinishSession = async () => {
    setIsReportOpen(true);
    setIsGeneratingReport(true);

    try {
      const res = await fetch('/api/coach/session-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: messages.map((m) => ({
            role: m.role,
            text: m.text,
            correction: m.correction,
          })),
          topic: currentTopic,
          level: currentLevel,
        }),
      });

      if (!res.ok) throw new Error('Report generation error');
      const data = await res.json();
      setSessionReport({
        ...data,
        totalTurns: messages.length,
        learnerWordCount,
      });

      // Update profile with final report ratings
      if (data.speakingPerformance) {
        handleUpdateProfile({
          ...learnerProfile,
          pronunciation: data.speakingPerformance.pronunciation || learnerProfile.pronunciation,
          grammar: data.speakingPerformance.grammar || learnerProfile.grammar,
          vocabulary: data.speakingPerformance.vocabulary || learnerProfile.vocabulary,
          fluency: data.speakingPerformance.fluency || learnerProfile.fluency,
          listening: data.speakingPerformance.listening || learnerProfile.listening,
        });
      }
    } catch (e: any) {
      console.error('Failed to generate report:', e);
      // Fallback structured report
      setSessionReport({
        speakingPerformance: {
          pronunciation: currentLevel,
          grammar: currentLevel,
          vocabulary: currentLevel,
          fluency: currentLevel,
          listening: currentLevel,
        },
        performanceSummary:
          'Great effort during today’s session! You actively answered questions and practiced spoken English.',
        mainPronunciationProblems: [
          {
            sound: '/θ/ (TH)',
            description: 'Make sure your tongue tip comes between your teeth lightly.',
            howToFix: 'Practice saying "think" and "three" slowly in front of a mirror.',
          },
        ],
        wordsToPractice: [
          { word: 'think', ipa: '/θɪŋk/', soundFocus: 'TH unvoiced', mouthTip: 'Tongue tip between teeth' },
          { word: 'worked', ipa: '/wɜːkt/', soundFocus: '-ED as /t/', mouthTip: '1 syllable ending in crisp T' },
        ],
        sentencesToRepeat: [
          'I went to the supermarket yesterday.',
          'They thought that their friends were coming.',
        ],
        nextRecommendation: {
          recommendedLevel: currentLevel,
          recommendedTopic: 'Daily routine',
          rationale: 'Solidify past-tense verbs and daily activity vocabulary.',
        },
        speakingRatioEstimate: {
          learnerPercentage: learnerRatio,
          coachPercentage: 100 - learnerRatio,
        },
        totalTurns: messages.length,
        learnerWordCount,
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGoHome = () => {
    setIsSkillsOpen(false);
    setIsSoundLabOpen(false);
    setIsTopicPickerOpen(false);
    setIsFinalChallengeOpen(false);
    setIsReportOpen(false);
    setIsWordBankOpen(false);
    setIsClassicsOpen(false);
    setIsVocabOpen(false);
    setActiveView('dashboard');
  };

  // Global Keyboard shortcut listener for the "Home" key (Taste Home / Pos1)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user pressed the physical "Home" key
      if (event.key === 'Home') {
        const activeEl = document.activeElement as HTMLElement | null;
        const isEditing =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable);

        // If user is actively typing in a text field, let them navigate text unless Alt or Ctrl is held
        if (isEditing && !event.altKey && !event.ctrlKey) {
          return;
        }

        event.preventDefault();
        handleGoHome();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResetSession = () => {
    setMessages([
      {
        id: `first-msg-${Date.now()}`,
        role: 'model',
        text: INITIAL_FIRST_MESSAGE,
        cleanSpeechText:
          "Hi Master Nuri! I'm your NextLumen English coach. Click the microphone to speak, or tell me what you would like to practice today.",
        timestamp: Date.now(),
      },
    ]);
    setSessionStage('warmup');
    setStageProgressText('Warm-up • Question 1 of 3');
    setQuestionCount(1);
    setLearnerWordCount(0);
    setCoachWordCount(20);
  };

  const handleSelectTopicItem = (topicItem: TopicItem) => {
    setCurrentTopic(topicItem.title);
    setCurrentLevel(topicItem.level);
    handleResetSession();
    setActiveView('conversation');
    handleSendMessage(`Let's practice the topic "${topicItem.title}" at ${topicItem.level} level.`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        currentLevel={currentLevel}
        onSelectLevel={(lvl) => {
          setCurrentLevel(lvl);
          handleSendMessage(`I'd like to switch to level ${lvl}.`);
        }}
        topic={currentTopic}
        mode={currentMode}
        learnerProfile={learnerProfile}
        learnerRatio={learnerRatio}
        autoPlayAudio={autoPlayAudio}
        onToggleAutoPlay={() => {
          setAutoPlayAudio(!autoPlayAudio);
        }}
        voiceSpeed={voiceSpeed}
        onToggleVoiceSpeed={() => {
          const newSpeed = voiceSpeed === 'normal' ? 'slow' : 'normal';
          setVoiceSpeed(newSpeed);
        }}
        germanAssistance={germanAssistance}
        onToggleGermanAssistance={() => {
          setGermanAssistance(!germanAssistance);
        }}
        onOpenSkills={() => setIsSkillsOpen(true)}
        onOpenSoundLab={() => setIsSoundLabOpen(true)}
        onOpenWordBank={() => setIsWordBankOpen(true)}
        onOpenClassics={(lvl?: CEFRLevel) => {
          if (lvl) setClassicsTargetLevel(lvl);
          else setClassicsTargetLevel('ALL');
          setIsClassicsOpen(true);
        }}
        onOpenVocab={(lvl?: CEFRLevel | 'ALL') => {
          setVocabTargetLevel(lvl || 'ALL');
          setIsVocabOpen(true);
        }}
        onOpenTopicPicker={() => setIsTopicPickerOpen(true)}
        onGoHome={handleGoHome}
        onFinishSession={handleFinishSession}
        onResetSession={() => {
          handleResetSession();
        }}
        isSessionActive={messages.length > 1}
        activeView={activeView}
        onSwitchView={(view) => {
          setActiveView(view);
        }}
      />

      {/* Main Content Area: Dashboard OR Conversation Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeView === 'dashboard' ? (
          <HomeDashboard
            currentLevel={currentLevel}
            onSelectLevel={(lvl) => {
              setCurrentLevel(lvl);
            }}
            currentTopic={currentTopic}
            learnerProfile={learnerProfile}
            learnerRatio={learnerRatio}
            savedWordsCount={savedWords.length}
            onStartSpeaking={() => {
              setActiveView('conversation');
            }}
            onOpenClassics={(lvl) => {
              if (lvl) setClassicsTargetLevel(lvl);
              else setClassicsTargetLevel('ALL');
              setIsClassicsOpen(true);
            }}
            onOpenVocab={(lvl) => {
              setVocabTargetLevel(lvl || 'ALL');
              setIsVocabOpen(true);
            }}
            onOpenSoundLab={() => setIsSoundLabOpen(true)}
            onOpenSkills={() => setIsSkillsOpen(true)}
            onOpenWordBank={() => setIsWordBankOpen(true)}
            onOpenTopicPicker={() => setIsTopicPickerOpen(true)}
            onTriggerFinalChallenge={() => {
              setIsFinalChallengeOpen(true);
            }}
            onPlayGreetingVoice={() => {
              audioService.playCoachSpeech(masterNuriGreeting, { voice: 'Kore', speed: voiceSpeed });
            }}
          />
        ) : (
          <ConversationView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoadingCoach}
            currentLevel={currentLevel}
            onSelectLevel={setCurrentLevel}
            currentTopic={currentTopic}
            onSelectTopic={setCurrentTopic}
            currentMode={currentMode}
            onSelectMode={setCurrentMode}
            learnerProfile={learnerProfile}
            sessionStage={sessionStage}
            stageProgressText={stageProgressText}
            autoPlayAudio={autoPlayAudio}
            voiceSpeed={voiceSpeed}
            germanAssistance={germanAssistance}
            onTriggerFinalChallenge={() => setIsFinalChallengeOpen(true)}
            onSaveWord={handleSaveWordToBank}
            onGoHome={handleGoHome}
            onOpenClassics={() => {
              setIsClassicsOpen(true);
            }}
            onOpenVocab={(lvl) => {
              setVocabTargetLevel(lvl || 'ALL');
              setIsVocabOpen(true);
            }}
            onOpenTopicPicker={() => setIsTopicPickerOpen(true)}
            onOpenSoundLab={() => setIsSoundLabOpen(true)}
            onOpenSkills={() => setIsSkillsOpen(true)}
            onOpenWordBank={() => setIsWordBankOpen(true)}
          />
        )}
      </main>

      {/* Skills Matrix Modal */}
      <SkillsModal
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        onGoHome={handleGoHome}
        profile={learnerProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Pronunciation Lab & Sound Studio Modal */}
      <SoundLabModal
        isOpen={isSoundLabOpen}
        onClose={() => setIsSoundLabOpen(false)}
        onGoHome={handleGoHome}
        voiceSpeed={voiceSpeed}
      />

      {/* Topic Picker Modal */}
      <TopicPickerModal
        isOpen={isTopicPickerOpen}
        onClose={() => setIsTopicPickerOpen(false)}
        onGoHome={handleGoHome}
        currentLevel={currentLevel}
        currentTopic={currentTopic}
        onSelectTopic={handleSelectTopicItem}
      />

      {/* Stage 6: 30-60s Monologue Final Challenge */}
      {isFinalChallengeOpen && (
        <FinalSpeakingChallenge
          topic={currentTopic}
          level={currentLevel}
          onComplete={(spokenText) => {
            setIsFinalChallengeOpen(false);
            handleSendMessage(
              `[Final Speaking Challenge Complete - Monologue]: "${spokenText}"`
            );
          }}
          onCancel={() => {
            setIsFinalChallengeOpen(false);
          }}
          onGoHome={handleGoHome}
        />
      )}

      {/* End-of-Session Report Modal */}
      <SessionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onGoHome={handleGoHome}
        report={sessionReport}
        isLoading={isGeneratingReport}
        onStartNextTopic={(level, topic) => {
          setIsReportOpen(false);
          setCurrentLevel(level);
          setCurrentTopic(topic);
          handleResetSession();
          handleSendMessage(`I want to start the next session on "${topic}" at level ${level}.`);
        }}
        onSaveWordToBank={handleSaveWordToBank}
      />

      {/* Word Bank Modal */}
      <WordBankModal
        isOpen={isWordBankOpen}
        onClose={() => setIsWordBankOpen(false)}
        onGoHome={handleGoHome}
        savedWords={savedWords}
        onRemoveWord={handleRemoveWord}
      />

      {/* World Classics Reading Room (≥ 2,000 words per classic) */}
      <ReadingClassicsModal
        isOpen={isClassicsOpen}
        initialLevelFilter={classicsTargetLevel}
        onClose={() => setIsClassicsOpen(false)}
        onGoHome={handleGoHome}
        onStartDiscussion={(classicTitle, question) => {
          setIsClassicsOpen(false);
          setCurrentTopic(classicTitle);
          handleSendMessage(
            `Let's discuss "${classicTitle}". Question: "${question}"`
          );
        }}
        onSaveWord={handleSaveWordToBank}
        savedWordsList={savedWords.map((w) => w.word)}
      />

      {/* Top 1,000 Most Used English Words Modal (5 Levels × 200 Words) */}
      <Top1000WordsModal
        isOpen={isVocabOpen}
        initialLevel={vocabTargetLevel}
        onClose={() => setIsVocabOpen(false)}
        onGoHome={handleGoHome}
        savedWords={savedWords}
        onSaveWord={handleSaveWordToBank}
      />
    </div>
  );
}
