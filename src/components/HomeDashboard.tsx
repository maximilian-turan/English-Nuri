import React from 'react';
import {
  Mic,
  BookOpen,
  Sparkles,
  BarChart3,
  BookmarkCheck,
  Clock,
  ArrowRight,
  Sliders,
  Volume2,
  CheckCircle2,
  Headphones,
  Award,
  Shield,
  Layers,
  Eye,
} from 'lucide-react';
import { CEFRLevel, LearnerProfile } from '../types';

// Asset image imports (processed and hashed by Vite for production)
import vocabImg from '../assets/images/vocab_1000_words_1791113160279.jpg';
import speakImg from '../assets/images/nextlumen_speak_1791112093906.jpg';
import readImg from '../assets/images/nextlumen_read_1791112103707.jpg';
import soundImg from '../assets/images/nextlumen_sound_1791112115528.jpg';
import skillsImg from '../assets/images/nextlumen_skills_1791112127131.jpg';
import { ImageWithFallback } from './ImageWithFallback';

interface HomeDashboardProps {
  currentLevel: CEFRLevel;
  onSelectLevel: (lvl: CEFRLevel) => void;
  currentTopic: string;
  learnerProfile: LearnerProfile;
  learnerRatio: number;
  savedWordsCount: number;
  onStartSpeaking: () => void;
  onOpenClassics: (level?: CEFRLevel) => void;
  onOpenVocab: (level?: CEFRLevel | 'ALL') => void;
  onOpenSoundLab: () => void;
  onOpenSkills: () => void;
  onOpenWordBank: () => void;
  onOpenTopicPicker: () => void;
  onTriggerFinalChallenge: () => void;
  onPlayGreetingVoice?: () => void;
  isGreetingPlaying?: boolean;
  onOpenMirror?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentLevel,
  onSelectLevel,
  currentTopic,
  learnerProfile,
  learnerRatio,
  savedWordsCount,
  onStartSpeaking,
  onOpenClassics,
  onOpenVocab,
  onOpenSoundLab,
  onOpenSkills,
  onOpenWordBank,
  onOpenTopicPicker,
  onTriggerFinalChallenge,
  onPlayGreetingVoice,
  isGreetingPlaying = false,
  onOpenMirror,
}) => {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Welcome Bar for Family Turan & Kids (10–15 Jahre) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-amber-500/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 font-sans">
                  NextLumen English Academy
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Coach Aktiv & Bereit
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  ⚡ 100% Ohne API (Sehen & Hören lokal)
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs text-slate-300 font-sans">
                  Speziell für Schüler & Jugendliche (10–15 Jahre)
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>Hello <span className="text-amber-300 underline decoration-amber-400/60 decoration-wavy decoration-1">Family Turan</span>!</span>
                <span className="text-2xl animate-bounce">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1">
                Herzlich willkommen! Trainiert flüssiges Sprechen, entdeckt die 1.000 wichtigsten Wörter und taucht in englische Weltklassiker ein.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {onPlayGreetingVoice && (
              <button
                onClick={onPlayGreetingVoice}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                  isGreetingPlaying
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
                title="Hello Family Turan laut abspielen"
              >
                <Volume2 className="w-4 h-4 text-slate-950" />
                <span>{isGreetingPlaying ? 'Begrüßung spricht...' : '"Hello Family Turan" anhören 🔊'}</span>
              </button>
            )}

            {onOpenMirror && (
              <button
                onClick={onOpenMirror}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/40 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="Aussprache-Mundspiegel öffnen: Sieh deine Mundstellung live"
              >
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Mund-Spiegel (Sehen) 📹</span>
              </button>
            )}

            <button
              onClick={onStartSpeaking}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mic className="w-4 h-4" />
              <span>Mit dem Coach reden</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. ERSTE STELLE / REIH: DIE 1.000 MEISTGENUTZTEN ENGLISCHEN WÖRTER (Speziell leserlich & freundlich für 10-15 Jährige) */}
        <div className="rounded-2xl bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500/60 overflow-hidden shadow-xl transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Bildspalte */}
            <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[280px] overflow-hidden bg-slate-950">
              <ImageWithFallback
                src={vocabImg}
                fallbackSrc="/assets/images/vocab_1000_words_1791113160279.jpg"
                alt="1.000 meistgenutzte englische Wörter - NextLumen für Jugendliche"
                theme="vocab"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>★ Nummer 1 Wortschatz-Programm</span>
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                <span className="font-semibold text-white">5 Stufen · Je 200 Wörter</span>
                <span className="font-mono bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-700 text-emerald-300 font-bold tabular-nums">
                  1.000 Wörter Total
                </span>
              </div>
            </div>

            {/* Inhaltsspalte (Große Schrift, leserlich & freundlich für 10–15 Jahre) */}
            <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Die 1.000 meistgenutzten Wörter
                  </h2>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    A1 bis C1
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                  Mit diesen 1.000 Wörtern verstehst du über 85% aller englischen Gespräche, Videos und Schultexte! Jedes Wort hat deutsche Übersetzung, Lautschrift, Vertonung und Beispielsätze zum Nachsprechen.
                </p>

                {/* Stufen-Schnellwahl (Freundlich mit Icons für Schüler 10–15 Jahre) */}
                <div className="pt-1">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide block mb-2 font-sans">
                    Wähle dein Level zum Üben:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { lvl: 'A1', label: '🌟 Basis & Schule', range: '#1–200', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20' },
                      { lvl: 'A2', label: '🚀 Alltag & Hobbys', range: '#201–400', color: 'border-teal-500/50 bg-teal-500/10 text-teal-200 hover:bg-teal-500/20' },
                      { lvl: 'B1', label: '🎯 Storys & Schule', range: '#401–600', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20' },
                      { lvl: 'B2', label: '💡 Wissen & Medien', range: '#601–800', color: 'border-amber-500/50 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20' },
                      { lvl: 'C1', label: '🏆 Profi & Meister', range: '#801–1000', color: 'border-rose-500/50 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20' },
                    ].map((item) => (
                      <button
                        key={item.lvl}
                        onClick={() => onOpenVocab(item.lvl as CEFRLevel)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer shadow-sm ${item.color}`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-mono font-bold text-xs">{item.lvl}</span>
                          <span className="text-[10px] opacity-80 font-mono tabular-nums">{item.range}</span>
                        </div>
                        <span className="text-xs font-semibold block truncate font-sans">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auffällige, kinderfreundliche Haupt-Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenVocab('ALL')}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Alle 1.000 Wörter öffnen & trainieren</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenVocab('A1')}
                  className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-white border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Karteikarten-Drill</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Professional Visual Cards (2x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Speak & Aussprechen */}
          <div className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                <ImageWithFallback
                  src={speakImg}
                  fallbackSrc="/assets/images/nextlumen_speak_1791112093906.jpg"
                  alt="NextLumen Speak & Aussprechen - English Speaking Coaching"
                  theme="speak"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 text-white border border-slate-700 backdrop-blur-sm flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Hauptbereich: Speak</span>
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                  <span className="font-medium text-slate-300 truncate max-w-[200px]">Thema: {currentTopic}</span>
                  <span className="font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 text-indigo-300 font-bold">
                    Stufe {currentLevel}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-100 tracking-tight">
                  Speak & Sprach-Coach
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Echtes Englisch frei sprechen! Der Coach unterhält sich mit dir über Hobbys, Schule und Abenteuer. Wenn du einen Fehler machst, hilft er dir sofort freundlich weiter.
                </p>

                {/* Level Quick Switcher inside Speak card */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-sans">
                    Sprechstufe (CEFR) wählen:
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {levels.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => onSelectLevel(lvl)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          currentLevel === lvl
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <button
                onClick={onStartSpeaking}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Konversation auf Stufe {currentLevel} starten</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Read & Weltklassiker */}
          <div className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 overflow-hidden shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                <ImageWithFallback
                  src={readImg}
                  fallbackSrc="/assets/images/nextlumen_read_1791112103707.jpg"
                  alt="NextLumen Read & Weltklassiker - World Classics Library"
                  theme="read"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-2.5 py-1 rounded bg-slate-950/85 text-amber-300 border border-amber-500/30 backdrop-blur-sm text-xs font-medium flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hauptbereich: Read</span>
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium text-slate-200">50 Weltklassiker</span>
                  <span className="font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-amber-300 font-semibold tabular-nums">
                    ≥ 2.000 Wörter je Buch
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-100 tracking-tight">
                  Read & Weltklassiker
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  50 spannende Geschichten auf Englisch: Peter Pan, Sherlock Holmes, Der Zauberer von Oz & mehr! Mit Vorlese-Audio und Schattenlesen-Mikrofon.
                </p>

                {/* Level Quick Jump inside Read card */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-sans">
                    Direkt zu Klassikern der Stufe:
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {levels.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => onOpenClassics(lvl)}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-all"
                      >
                        {lvl} (10 Bücher)
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <button
                onClick={() => onOpenClassics()}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                <span>Weltklassiker Lesesaal öffnen (50 Bücher)</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>

          {/* Card 3: Pronunciation Sound Lab */}
          <div className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 overflow-hidden shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                <ImageWithFallback
                  src={soundImg}
                  fallbackSrc="/assets/images/nextlumen_sound_1791112115528.jpg"
                  alt="NextLumen Pronunciation Sound Lab"
                  theme="sound"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-2.5 py-1 rounded bg-slate-950/85 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm text-xs font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Aussprache-Labor</span>
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium text-slate-200">Phonetische Artikulation</span>
                  <span className="font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-emerald-400 font-semibold">
                    TH, R, W/V, Vokale
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-100 tracking-tight">
                  Pronunciation Sound Lab
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Einfache Tricks für knifflige englische Laute: Zunge für das 'TH' (/θ/, /ð/), Rachen für das American 'R', Unterschied zwischen 'W' und 'V' sowie '-ED' Endungen.
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-slate-950/50 text-slate-300 border border-slate-800 font-mono">/θ/ & /ð/ (TH)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950/50 text-slate-300 border border-slate-800 font-mono">/r/ (American R)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950/50 text-slate-300 border border-slate-800 font-mono">W vs V</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950/50 text-slate-300 border border-slate-800 font-mono">-ED Endungen</span>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <button
                onClick={onOpenSoundLab}
                className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700/80 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Sound Lab & Laut-Training öffnen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 4: Skill Matrix & Profile */}
          <div className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 overflow-hidden shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                <ImageWithFallback
                  src={skillsImg}
                  fallbackSrc="/assets/images/nextlumen_skills_1791112127131.jpg"
                  alt="NextLumen Learner Skill Matrix"
                  theme="skills"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-2.5 py-1 rounded bg-slate-950/85 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm text-xs font-medium flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lern-Fortschritt</span>
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium text-slate-200">6 Sprach-Fähigkeiten</span>
                  <span className="font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-semibold tabular-nums">
                    CEFR Diagnostik
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-100 tracking-tight">
                  Dein Englisch-Level & Fortschritt
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Sieh genau, wie du dich verbesserst: Freies Sprechen, Aussprache, Vokabeln und Textverständnis werden separat gemessen und gefördert.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-medium">Speaking</span>
                    <span className="font-semibold text-indigo-300 font-mono text-sm">{learnerProfile.speaking}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-medium">Pronunciation</span>
                    <span className="font-semibold text-emerald-300 font-mono text-sm">{learnerProfile.pronunciation}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-medium">Reading</span>
                    <span className="font-semibold text-amber-300 font-mono text-sm">{learnerProfile.reading}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0">
              <button
                onClick={onOpenSkills}
                className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700/80 transition-all cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Skills Matrix ansehen & anpassen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Quick-Access Tools Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Tool 1: Themen-Bibliothek */}
          <div
            onClick={onOpenTopicPicker}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 cursor-pointer transition-all flex items-center gap-3.5 group shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-slate-950 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                Themen-Bibliothek
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                50+ kuratierte Sprechmodule (A1–C1)
              </p>
            </div>
          </div>

          {/* Tool 2: Wortschatz-Heft */}
          <div
            onClick={onOpenWordBank}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 cursor-pointer transition-all flex items-center gap-3.5 group shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-slate-950 text-amber-400 border border-amber-500/20">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                Wortschatz-Heft
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                {savedWordsCount} gespeicherte Wörter mit Lautschrift
              </p>
            </div>
          </div>

          {/* Tool 3: 60s Monolog-Challenge */}
          <div
            onClick={onTriggerFinalChallenge}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 cursor-pointer transition-all flex items-center gap-3.5 group shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-slate-950 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                60s Monolog-Challenge
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Flüssigkeitstest ohne Unterbrechung
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
