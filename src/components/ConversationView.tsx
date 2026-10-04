import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Headphones,
  User,
  ArrowRight,
  Flame,
  HelpCircle,
  BookmarkPlus,
  BookOpen,
  Sliders,
  BarChart3,
  BookmarkCheck,
  Home,
} from 'lucide-react';
import { Message, CEFRLevel, ConversationMode, LearnerProfile, SessionStage } from '../types';
import { CorrectionCard } from './CorrectionCard';
import { audioService } from '../utils/audio';

interface ConversationViewProps {
  messages: Message[];
  onSendMessage: (text: string, isDrillRepeat?: boolean) => void;
  isLoading: boolean;
  currentLevel: CEFRLevel;
  onSelectLevel: (lvl: CEFRLevel) => void;
  currentTopic: string;
  onSelectTopic: (topic: string) => void;
  currentMode: ConversationMode;
  onSelectMode: (mode: ConversationMode) => void;
  learnerProfile: LearnerProfile;
  sessionStage: SessionStage;
  stageProgressText?: string;
  autoPlayAudio: boolean;
  voiceSpeed: 'normal' | 'slow';
  germanAssistance: boolean;
  onTriggerFinalChallenge: () => void;
  onSaveWord: (word: string, ipa: string, tip: string) => void;
  onGoHome?: () => void;
  onOpenClassics?: () => void;
  onOpenVocab?: (level?: CEFRLevel | 'ALL') => void;
  onOpenTopicPicker?: () => void;
  onOpenSoundLab?: () => void;
  onOpenSkills?: () => void;
  onOpenWordBank?: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  currentLevel,
  onSelectLevel,
  currentTopic,
  onSelectTopic,
  currentMode,
  onSelectMode,
  learnerProfile,
  sessionStage,
  stageProgressText,
  autoPlayAudio,
  voiceSpeed,
  germanAssistance,
  onTriggerFinalChallenge,
  onSaveWord,
  onGoHome,
  onOpenClassics,
  onOpenVocab,
  onOpenTopicPicker,
  onOpenSoundLab,
  onOpenSkills,
  onOpenWordBank,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [targetRepeatSentence, setTargetRepeatSentence] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMicrophoneSupported = audioService.isSupported();
  const isInitialMount = useRef(true);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText, isLoading]);

  // Check if latest model message requires repeat
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'model' && lastMsg.requiresRepeat && lastMsg.repeatTarget) {
      setTargetRepeatSentence(lastMsg.repeatTarget);
    } else {
      setTargetRepeatSentence(null);
    }
  }, [messages]);

  // Play audio for latest coach message if autoPlay is enabled (skip initial app load!)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'model' && autoPlayAudio) {
      const speechText = lastMsg.cleanSpeechText || lastMsg.text;
      audioService.playCoachSpeech(speechText, {
        speed: voiceSpeed,
        voice: 'Kore',
      });
    }
  }, [messages, autoPlayAudio, voiceSpeed]);

  const handleToggleListening = () => {
    if (isListening) {
      audioService.stopListening();
      setIsListening(false);
      if (interimText.trim()) {
        const textToSend = interimText.trim();
        setInterimText('');
        onSendMessage(textToSend, !!targetRepeatSentence);
      }
      return;
    }

    setSpeechError(null);
    setInterimText('');

    const started = audioService.startListening(
      (text, isFinal) => {
        setInterimText(text);
        if (isFinal) {
          audioService.stopListening();
          setIsListening(false);
          setInterimText('');
          onSendMessage(text, !!targetRepeatSentence);
        }
      },
      (error) => {
        setSpeechError(
          error === 'not-allowed'
            ? 'Microphone permission blocked. Please allow mic in browser settings.'
            : `Mic error: ${error}`
        );
        setIsListening(false);
      },
      (listening) => setIsListening(listening)
    );

    if (!started) {
      setSpeechError('Microphone not supported or unavailable.');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text, !!targetRepeatSentence);
  };

  const handleRepeatSentence = (sentence: string) => {
    setTargetRepeatSentence(sentence);
    // Start listening immediately
    if (!isListening) {
      handleToggleListening();
    }
  };

  const playMessageAudio = async (text: string, speed: 'normal' | 'slow' = 'normal') => {
    await audioService.playCoachSpeech(text, { speed, voice: 'Kore' });
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl w-full mx-auto overflow-hidden">
      {/* Stage Banner */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300 capitalize">
            {stageProgressText || `Stage: ${sessionStage.replace('_', ' ')}`}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 truncate max-w-[200px] sm:max-w-none">
            {currentTopic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Taste Home – Zurück zum Home Dashboard"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          )}

          {sessionStage !== 'final_task' && (
            <button
              onClick={onTriggerFinalChallenge}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-medium transition-all cursor-pointer"
            >
              Skip to 60s Challenge
            </button>
          )}
        </div>
      </div>

      {/* Prominent Quick Access Hub: Weltklassiker & Core Tools */}
      <div className="mx-3 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950 text-amber-400 border border-amber-500/30 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-serif font-semibold text-slate-100">
                  Weltklassiker Lesesaal
                </h3>
                <span className="text-[11px] font-mono text-amber-300/90">
                  50 Klassiker · A1–C1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Genau 10 Klassiker je Stufe (A1 bis C1) mit Audio-Vorleser, Aussprache-Drills & Wortschatz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenClassics && (
              <button
                onClick={onOpenClassics}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                <span>Klassiker öffnen</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Submenu Shortcuts */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Schnellzugriff:</span>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center gap-1 font-bold transition-all cursor-pointer shadow-sm"
              title="Taste Home – Zurück zum Home Dashboard"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          )}
          {onOpenVocab && (
            <button
              onClick={() => onOpenVocab('ALL')}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>1.000 Wörter (A1–C1)</span>
            </button>
          )}
          {onOpenTopicPicker && (
            <button
              onClick={onOpenTopicPicker}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Themen (A1–C1)</span>
            </button>
          )}
          {onOpenSoundLab && (
            <button
              onClick={onOpenSoundLab}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sound Lab</span>
            </button>
          )}
          {onOpenSkills && (
            <button
              onClick={onOpenSkills}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Skills Matrix ({learnerProfile.speaking})</span>
            </button>
          )}
          {onOpenWordBank && (
            <button
              onClick={onOpenWordBank}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Wortschatz-Heft</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isCoach = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isCoach ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
            >
              {/* Speaker Header */}
              <div className="flex items-center gap-2 mb-1 px-1 text-xs text-slate-400">
                {isCoach ? (
                  <>
                    <div className="w-5 h-5 rounded-md bg-indigo-600/30 flex items-center justify-center text-indigo-400">
                      <Headphones className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-indigo-300">Coach</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-slate-300">
                      {msg.isRepeatAttempt ? 'You (Repetition Attempt)' : 'You'}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                      <User className="w-3 h-3" />
                    </div>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-md ${
                  isCoach
                    ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-sm'
                    : 'bg-indigo-600 text-white rounded-tr-sm'
                }`}
              >
                {/* Spoken Text */}
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                  {msg.text}
                </div>

                {/* Coach Actions: Audio replay */}
                {isCoach && (
                  <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playMessageAudio(msg.cleanSpeechText || msg.text, 'normal')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
                        title="Listen to Coach"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                      <button
                        onClick={() => playMessageAudio(msg.cleanSpeechText || msg.text, 'slow')}
                        className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors text-[11px]"
                        title="Listen slowly"
                      >
                        🐢 Slow
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {/* Structured Correction Card (Levels 1, 2, 3) */}
                {msg.correction && (
                  <CorrectionCard
                    correction={msg.correction}
                    onRepeatClick={handleRepeatSentence}
                    isListening={isListening}
                    voiceSpeed={voiceSpeed}
                    showGermanDefault={germanAssistance}
                  />
                )}
              </div>

              {/* Initial Session Starter Chips if first message */}
              {isCoach && index === 0 && messages.length === 1 && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-xl space-y-3">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                    Quick Selection:
                  </span>

                  {/* Mode Chips */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[
                      '1. Free conversation',
                      '2. Pronunciation',
                      '3. Daily English',
                      '4. Job and business',
                      '5. Travel',
                      '6. A specific topic',
                    ].map((modeItem, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const clean = modeItem.substring(3) as ConversationMode;
                          onSelectMode(clean);
                          onSendMessage(`I want to practice ${clean} at ${currentLevel} level.`);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 font-medium transition-colors"
                      >
                        {modeItem}
                      </button>
                    ))}
                  </div>

                  {/* Level Chips */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                    <span className="text-xs text-slate-400 mr-1">Choose Level:</span>
                    {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          onSelectLevel(lvl);
                          onSendMessage(`I choose ${lvl} level.`);
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          currentLevel === lvl
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Interim Speech Transcription Preview */}
        {isListening && (
          <div className="flex flex-col items-end animate-in fade-in duration-150">
            <div className="max-w-[85%] rounded-2xl p-3.5 bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-sm shadow-lg flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-4 bg-indigo-400 rounded-full animate-pulse" />
                <span className="w-2 h-6 bg-indigo-300 rounded-full animate-pulse delay-75" />
                <span className="w-2 h-3 bg-indigo-400 rounded-full animate-pulse delay-150" />
              </div>
              <span className="italic font-medium">
                {interimText || 'Listening... Speak in English now'}
              </span>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-xs text-slate-400">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span>Coach is analyzing your speech and preparing feedback...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Target Repetition Bar (if in repeat mode) */}
      {targetRepeatSentence && (
        <div className="px-4 py-2.5 bg-emerald-950/40 border-t border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              Please repeat:{' '}
              <strong className="text-emerald-300 font-bold">"{targetRepeatSentence}"</strong>
            </span>
          </div>
          <button
            onClick={() => playMessageAudio(targetRepeatSentence, 'slow')}
            className="text-xs font-semibold text-emerald-400 hover:text-white flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Model Pronunciation</span>
          </button>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="px-4 py-2 bg-rose-950/60 border-t border-rose-900/50 text-xs text-rose-300 flex items-center justify-between">
          <span>{speechError}</span>
          <button
            onClick={() => setSpeechError(null)}
            className="text-rose-400 hover:text-white font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Control Deck */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
          {/* Main Microphone Button */}
          <button
            type="button"
            onClick={handleToggleListening}
            title={isListening ? 'Stop listening & send' : 'Speak using microphone'}
            className={`p-3.5 rounded-2xl text-white font-bold flex items-center justify-center transition-all shadow-lg ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-500/30 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Text Input Fallback */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your speech...'
                : targetRepeatSentence
                ? `Say or type: "${targetRepeatSentence}"`
                : 'Click mic to speak, or type your answer in English...'
            }
            disabled={isLoading || isListening}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold shadow-md transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>
            {isListening
              ? '🔴 Speaking into microphone... speak naturally at normal volume.'
              : '💡 Tip: Verbal answers are strongly recommended for pronunciation improvement.'}
          </span>
          <span className="hidden sm:inline">Learner level: {currentLevel}</span>
        </div>
      </div>
    </div>
  );
};
