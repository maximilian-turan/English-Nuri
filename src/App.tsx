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
import { PronunciationMirrorModal } from './components/PronunciationMirrorModal';
import { HomeDashboard } from './components/HomeDashboard';
import { TOPICS_DATA } from './data/topics';
import { audioService } from './utils/audio';
import { generateLocalCoachResponse } from './utils/localCoach';
import { Sparkles, MessageSquare, BookOpen, Volume2, Eye } from 'lucide-react';

const INITIAL_FIRST_MESSAGE = `Hello Family Turan! I'm your NextLumen English coach.

Click the microphone to speak, explore the 1,000 most used English words, or read world classics!`;

const GREETING_SPOKEN_TEXT = 'Hello Family Turan!';

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
        "Hello Family Turan! I'm your English coach. Click the microphone to speak, explore the 1,000 words, or choose what you would like to practice today!",
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
  const [isGreetingPlaying, setIsGreetingPlaying] = useState<boolean>(false);
  const [showGreetingBanner, setShowGreetingBanner] = useState<boolean>(true);

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
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);

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
      console.warn('Backend API unavailable, using client-side smart coach (Ohne API):', err);
      const localResult = generateLocalCoachResponse({
        message: userText,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        topic: currentTopic,
        currentLevel,
        mode: currentMode,
        stage: sessionStage,
        questionCount,
        isDrillRepeat: wasInRepeat,
        repeatTarget,
        isGermanRequested: germanAssistance,
      });

      const coachWords = localResult.coachSpokenReply.trim().split(/\s+/).length;
      setCoachWordCount((prev) => prev + coachWords);

      const localModelMsg: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: localResult.coachSpokenReply,
        cleanSpeechText: localResult.cleanSpeechText,
        timestamp: Date.now(),
        correction: localResult.correction,
        requiresRepeat: localResult.requiresRepeat,
        repeatTarget: localResult.repeatTargetSentence,
      };

      setMessages((prev) => [...prev, localModelMsg]);
      setSessionStage(localResult.nextStage);
      setStageProgressText(localResult.stageProgressText);
      setQuestionCount((prev) => prev + 1);

      if (localResult.correction?.pronunciationGuide?.problemWord) {
        handleSaveWordToBank(
          localResult.correction.pronunciationGuide.problemWord,
          localResult.correction.pronunciationGuide.ipa || '',
          localResult.correction.pronunciationGuide.howToProduce || ''
        );
      }
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

  // Manual replay of Family Turan greeting
  const handlePlayGreeting = async () => {
    audioService.playSoundCheckTone();
    try {
      setIsGreetingPlaying(true);
      await audioService.playGreeting(
        () => setIsGreetingPlaying(true),
        () => setIsGreetingPlaying(false)
      );
    } catch (e) {
      console.warn('Manual greeting audio error:', e);
    } finally {
      setIsGreetingPlaying(false);
    }
  };

  // Sound check test handler
  const handleTestSound = () => {
    audioService.playSoundCheckTone();
    handlePlayGreeting();
  };

  // Spoken greeting on app start: "Hello Family Turan!"
  useEffect(() => {
    let greetedSuccessfully = false;

    const speakGreeting = async () => {
      if (greetedSuccessfully) return;
      try {
        setIsGreetingPlaying(true);
        const success = await audioService.playGreeting(
          () => setIsGreetingPlaying(true),
          () => setIsGreetingPlaying(false)
        );
        if (success) {
          greetedSuccessfully = true;
        } else {
          setIsGreetingPlaying(false);
        }
      } catch (e) {
        setIsGreetingPlaying(false);
        console.warn('Autoplay restricted by browser policy; will greet on first user gesture.');
      }
    };

    // Attempt direct audio playback immediately upon app start
    speakGreeting();

    // Fallback: If browser autoplay policy blocked the immediate call, trigger on first user interaction anywhere
    const handleGesture = () => {
      if (!greetedSuccessfully) {
        audioService.playSoundCheckTone();
        speakGreeting();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('click', handleGesture);
    };

    window.addEventListener('pointerdown', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    window.addEventListener('click', handleGesture, { once: true });

    return cleanup;
  }, []);

  const handleResetSession = () => {
    setMessages([
      {
        id: `first-msg-${Date.now()}`,
        role: 'model',
        text: INITIAL_FIRST_MESSAGE,
        cleanSpeechText:
          "Hello Family Turan! I'm your NextLumen English coach. Click the microphone to speak, or tell me what you would like to practice today.",
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
        onPlayGreetingVoice={handlePlayGreeting}
        isGreetingPlaying={isGreetingPlaying}
        onOpenMirror={() => setIsMirrorOpen(true)}
        onTestSound={handleTestSound}
      />

      {/* App-Start Greeting Banner for Family Turan & Kids (10–15 Jahre) */}
      {showGreetingBanner && (
        <div
          role="region"
          aria-label="Begrüßung Family Turan"
          className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-950/40 border-b border-amber-500/30 px-4 py-2.5 sm:px-6 shadow-sm flex items-center justify-between gap-3 text-xs z-20 shrink-0"
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="font-serif font-bold text-amber-200 text-sm">
              Hello Family Turan! 👋
            </span>
            <span className="text-slate-300 hidden md:inline font-sans">
              Willkommen bei NextLumen English Academy für Schüler & Jugendliche (10–15 Jahre).
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ⚡ 100% Ohne API (Sehen & Hören lokal)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePlayGreeting}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isGreetingPlaying
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 border border-amber-500/40'
              }`}
              title="Hello Family Turan anhören"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isGreetingPlaying ? 'Spielt...' : 'Begrüßung hören 🔊'}</span>
            </button>

            <button
              onClick={() => setIsMirrorOpen(true)}
              className="px-2.5 py-1.5 rounded-lg font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Aussprache-Mundspiegel (Sehen) öffnen"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Spiegel (Sehen) 📹</span>
            </button>

            <button
              onClick={handleTestSound}
              className="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer text-[11px]"
              title="Kurzen Ton-Check abspielen"
            >
              Ton-Test 🔔
            </button>

            <button
              onClick={() => setShowGreetingBanner(false)}
              className="text-slate-400 hover:text-slate-200 p-1 text-xs cursor-pointer ml-1"
              title="Begrüßung schließen"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
            onPlayGreetingVoice={handlePlayGreeting}
            isGreetingPlaying={isGreetingPlaying}
            onOpenMirror={() => setIsMirrorOpen(true)}
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

      {/* Aussprache-Mundspiegel (Sehen & Hören) Modal */}
      <PronunciationMirrorModal
        isOpen={isMirrorOpen}
        onClose={() => setIsMirrorOpen(false)}
      />
    </div>
  );
}
