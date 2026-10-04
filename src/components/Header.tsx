import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  BarChart3,
  BookOpen,
  Sliders,
  BookmarkCheck,
  RotateCcw,
  Languages,
  Mic,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  Check,
  ArrowRight,
  Home,
} from 'lucide-react';
import { CEFRLevel, LearnerProfile } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentLevel: CEFRLevel;
  onSelectLevel: (lvl: CEFRLevel) => void;
  topic: string;
  mode: string;
  learnerProfile: LearnerProfile;
  learnerRatio: number;
  autoPlayAudio: boolean;
  onToggleAutoPlay: () => void;
  voiceSpeed: 'normal' | 'slow';
  onToggleVoiceSpeed: () => void;
  germanAssistance: boolean;
  onToggleGermanAssistance: () => void;
  onOpenSkills: () => void;
  onOpenSoundLab: () => void;
  onOpenWordBank: () => void;
  onOpenClassics: (level?: CEFRLevel) => void;
  onOpenVocab: (level?: CEFRLevel | 'ALL') => void;
  onOpenTopicPicker?: () => void;
  onGoHome?: () => void;
  onFinishSession: () => void;
  onResetSession: () => void;
  isSessionActive: boolean;
  activeView: 'dashboard' | 'conversation';
  onSwitchView: (view: 'dashboard' | 'conversation') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  onSelectLevel,
  topic,
  mode,
  learnerProfile,
  learnerRatio,
  autoPlayAudio,
  onToggleAutoPlay,
  voiceSpeed,
  onToggleVoiceSpeed,
  germanAssistance,
  onToggleGermanAssistance,
  onOpenSkills,
  onOpenSoundLab,
  onOpenWordBank,
  onOpenClassics,
  onOpenVocab,
  onOpenTopicPicker,
  onGoHome,
  onFinishSession,
  onResetSession,
  isSessionActive,
  activeView,
  onSwitchView,
}) => {
  const [isSpeakMenuOpen, setIsSpeakMenuOpen] = useState(false);
  const [isReadMenuOpen, setIsReadMenuOpen] = useState(false);
  const [isVocabMenuOpen, setIsVocabMenuOpen] = useState(false);

  const speakMenuRef = useRef<HTMLDivElement>(null);
  const readMenuRef = useRef<HTMLDivElement>(null);
  const vocabMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speakMenuRef.current && !speakMenuRef.current.contains(event.target as Node)) {
        setIsSpeakMenuOpen(false);
      }
      if (readMenuRef.current && !readMenuRef.current.contains(event.target as Node)) {
        setIsReadMenuOpen(false);
      }
      if (vocabMenuRef.current && !vocabMenuRef.current.contains(event.target as Node)) {
        setIsVocabMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const levels: { level: CEFRLevel; title: string; desc: string }[] = [
    { level: 'A1', title: 'A1 – Beginner', desc: 'Sich vorstellen, Familie, Alltag, Zahlen' },
    { level: 'A2', title: 'A2 – Elementary', desc: 'Reisen, Restaurant, Wochenende, Freunde' },
    { level: 'B1', title: 'B1 – Intermediate', desc: 'Arbeit, Technologie, Beziehungen, Ziele' },
    { level: 'B2', title: 'B2 – Upper Intermediate', desc: 'Künstliche Intelligenz, Wirtschaft, Ethik' },
    { level: 'C1', title: 'C1 – Advanced', desc: 'Philosophie, Globalisierung, Führung, Wissenschaft' },
  ];

  const classicsLevels: { level: CEFRLevel; sample: string }[] = [
    { level: 'A1', sample: 'The Little Prince, Peter Pan, Wizard of Oz...' },
    { level: 'A2', sample: 'Tom Sawyer, Christmas Carol, Robinson Crusoe...' },
    { level: 'B1', sample: 'Sherlock Holmes, Dr Jekyll, Time Machine...' },
    { level: 'B2', sample: 'Dorian Gray, Frankenstein, Dracula, Jane Eyre...' },
    { level: 'C1', sample: 'Crime and Punishment, War and Peace, Ulysses...' },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Master Nuri Designation (Clicking returns to Dashboard) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onSwitchView('dashboard');
                onGoHome?.();
              }}
              className="flex items-center text-left hover:opacity-90 transition-opacity cursor-pointer group shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
              title="Home - Zurück zum Dashboard"
            >
              <BrandLogo size="md" />
            </button>

            {/* Master Nuri Learner Designation (Dignified & Editorial, Zero AI Slop) */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
              <span className="text-slate-400 font-normal">Learner:</span>
              <span className="font-serif font-semibold text-amber-200/90 tracking-tight">Master Nuri</span>
            </div>
          </div>

          {/* TWO PRIMARY MENUS: Speak (Aussprechen) & Read (Lesen) */}
          <div className="flex items-center gap-2">
            {/* 1. Hauptmenü: Speak (Aussprechen) mit Untermenü A1–C1 */}
            <div className="relative" ref={speakMenuRef}>
              <button
                onClick={() => {
                  setIsSpeakMenuOpen(!isSpeakMenuOpen);
                  setIsReadMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                  isSpeakMenuOpen
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30'
                    : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                }`}
                title="Hauptmenü: Speak (Aussprechen) – Wähle Stufe A1 bis C1"
              >
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Speak</span>
                <span className="px-1.5 py-0.2 rounded font-mono font-extrabold bg-indigo-500/30 text-white text-[11px]">
                  {currentLevel}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSpeakMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown: Speak / Aussprechen */}
              {isSpeakMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                      Hauptmenü: Speak (Aussprechen)
                    </span>
                    <span className="text-xs text-slate-300">
                      Wähle deine Sprachstufe (A1–C1):
                    </span>
                  </div>

                  <div className="py-1 space-y-1">
                    {levels.map((item) => (
                      <button
                        key={item.level}
                        onClick={() => {
                          onSelectLevel(item.level);
                          setIsSpeakMenuOpen(false);
                          onSwitchView('conversation');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                          currentLevel === item.level
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{item.title}</span>
                            {currentLevel === item.level && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                          </div>
                          <span className={`text-[10px] block ${currentLevel === item.level ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 px-1">
                    {onOpenTopicPicker && (
                      <button
                        onClick={() => {
                          setIsSpeakMenuOpen(false);
                          onOpenTopicPicker();
                        }}
                        className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 py-1"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Themen-Bibliothek</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsSpeakMenuOpen(false);
                        onSwitchView('conversation');
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 py-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Dialog öffnen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Hauptmenü: Read (Lesen) mit Untermenü Klassiker (A1–C1) */}
            <div className="relative" ref={readMenuRef}>
              <button
                onClick={() => {
                  setIsReadMenuOpen(!isReadMenuOpen);
                  setIsSpeakMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                  isReadMenuOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                }`}
                title="Hauptmenü: Read (Lesen) – 50 Weltklassiker nach Stufen"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Read (Klassiker)</span>
                <span className="hidden sm:inline text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  50 Bücher
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isReadMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown: Read / Lesen (Klassiker) */}
              {isReadMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 sm:w-88 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block">
                        Hauptmenü: Read (Lesen)
                      </span>
                      <span className="text-xs text-slate-300">
                        50 Weltklassiker (je ≥ 2.000 Wörter):
                      </span>
                    </div>
                  </div>

                  {/* Primary CTA: Open full reading room */}
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsReadMenuOpen(false);
                        onOpenClassics();
                      }}
                      className="w-full text-center py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-950" />
                      <span>Gesamten Lesesaal öffnen (50 Klassiker)</span>
                    </button>
                  </div>

                  {/* Submenu Level Jump list */}
                  <div className="py-1 space-y-1">
                    {classicsLevels.map((c) => (
                      <button
                        key={c.level}
                        onClick={() => {
                          setIsReadMenuOpen(false);
                          onOpenClassics(c.level);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-bold text-amber-300 mr-2">{c.level} (10 Klassiker):</span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                            {c.sample}
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Hauptmenü: 1.000 Wörter (Wortschatz A1–C1) */}
            <div className="relative" ref={vocabMenuRef}>
              <button
                onClick={() => {
                  setIsVocabMenuOpen(!isVocabMenuOpen);
                  setIsSpeakMenuOpen(false);
                  setIsReadMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                  isVocabMenuOpen
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30'
                    : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                }`}
                title="1.000 meistgenutzte Wörter nach 5 Stufen (A1 bis C1) mit Aussprache"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>1.000 Wörter</span>
                <span className="hidden sm:inline text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold text-white">
                  5 × 200
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isVocabMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown: 1.000 Wörter */}
              {isVocabMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 sm:w-88 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block">
                      Wortschatz-Datenbank (1.000 Wörter)
                    </span>
                    <span className="text-xs text-slate-300">
                      5 Level mit je 200 Wörtern, IPA & vertonten Sätzen:
                    </span>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsVocabMenuOpen(false);
                        onOpenVocab('ALL');
                      }}
                      className="w-full text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer mb-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Alle 1.000 Wörter durchsuchen & trainieren</span>
                    </button>
                  </div>

                  <div className="py-1 space-y-1">
                    {[
                      { level: 'A1', label: 'A1 – Anfänger', desc: 'Die 200 wichtigsten Basiswörter', color: 'text-emerald-400' },
                      { level: 'A2', label: 'A2 – Grundstufe', desc: '200 Wörter für Alltag & Reisen', color: 'text-teal-400' },
                      { level: 'B1', label: 'B1 – Fortgeschritten', desc: '200 Wörter für Beruf & Diskussion', color: 'text-indigo-400' },
                      { level: 'B2', label: 'B2 – Selbstständig', desc: '200 Wörter für Business & Führung', color: 'text-amber-400' },
                      { level: 'C1', label: 'C1 – Fachkundig', desc: '200 Wörter für Rhetorik & Eloquenz', color: 'text-rose-400' },
                    ].map((lvl) => (
                      <button
                        key={lvl.level}
                        onClick={() => {
                          setIsVocabMenuOpen(false);
                          onOpenVocab(lvl.level as CEFRLevel);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold font-mono ${lvl.color}`}>{lvl.level}:</span>
                            <span className="font-semibold text-white">{lvl.label}</span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">200 Wörter</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {lvl.desc}
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View Switcher: Home vs Coach Dialog */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60 shadow-sm">
            <button
              onClick={() => {
                onSwitchView('dashboard');
                onGoHome?.();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
              }`}
              title="Taste Home – Zurück zum Home Dashboard (auch Taste 'Home' / 'Pos1' auf der Tastatur)"
            >
              <Home className="w-3.5 h-3.5 text-emerald-300" />
              <span>Home</span>
            </button>
            <button
              onClick={() => onSwitchView('conversation')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'conversation'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/70'
              }`}
              title="Live Coach Dialog öffnen"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Coach Dialog</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Pronunciation Lab Button */}
            <button
              onClick={onOpenSoundLab}
              title="Pronunciation Sound Lab & Laut-Training"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500/50 text-indigo-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Sound Lab</span>
            </button>

            {/* Skills Profile Button */}
            <button
              onClick={onOpenSkills}
              title="Kompetenz-Matrix (Reading, Listening, Speaking, etc.)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Skills</span>
              <span className="text-[10px] bg-slate-700 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                {learnerProfile.speaking}
              </span>
            </button>

            {/* Word Bank Button */}
            <button
              onClick={onOpenWordBank}
              title="Gespeichertes Vokabelheft"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <BookmarkCheck className="w-4 h-4 text-amber-400" />
            </button>

            {/* German Assistance Toggle */}
            <button
              onClick={onToggleGermanAssistance}
              title={
                germanAssistance
                  ? 'Hilfe auf Deutsch aktiviert (German assistance ON)'
                  : 'Hilfe auf Deutsch aktivieren (German assistance OFF)'
              }
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                germanAssistance
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span className="text-[10px] font-bold">DE</span>
            </button>

            {/* Voice Speed Toggle */}
            <button
              onClick={onToggleVoiceSpeed}
              title={`Coach Voice Speed: ${voiceSpeed}`}
              className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors hidden lg:block"
            >
              {voiceSpeed === 'slow' ? '🐢 Slow' : '⚡ 1.0x'}
            </button>

            {/* Auto-Play Audio Toggle */}
            <button
              onClick={onToggleAutoPlay}
              title={autoPlayAudio ? 'Voice narration active' : 'Voice narration muted'}
              className={`p-1.5 rounded-lg border transition-colors ${
                autoPlayAudio
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {autoPlayAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Finish Session / Report Button */}
            {isSessionActive && (
              <button
                onClick={onFinishSession}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
              >
                End Session
              </button>
            )}

            {/* Reset Session */}
            <button
              onClick={onResetSession}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
