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
} from 'lucide-react';
import { CEFRLevel, LearnerProfile } from '../types';

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
}) => {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Welcome Executive Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span className="font-semibold tracking-wider uppercase text-amber-400/90 text-[11px] font-sans">
                  NextLumen Academy
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>
                  Aktive Stufe: <strong className="text-slate-200 font-mono font-medium">{currentLevel}</strong>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>
                  Sprechanteil: <strong className="text-emerald-400 font-mono font-medium">70–80% Ziel</strong>
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-100 tracking-tight leading-tight">
                Willkommen bei <span className="font-normal italic text-amber-400">NextLumen</span>, Master Nuri
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Professionelles Englisch-Sprech- und Aussprache-Training auf Hochschulniveau. Wähle deinen Schwerpunkt für die heutige Session:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                onClick={onStartSpeaking}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Sprech-Session starten</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onPlayGreetingVoice && (
                <button
                  onClick={onPlayGreetingVoice}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Coach-Begrüßung anhören"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Begrüßung anhören</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FEATURE HIGHLIGHT: 1.000 Meistgenutzte Englische Wörter (5 Stufen × 200 Wörter) */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 overflow-hidden shadow-lg transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Image Column */}
            <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[260px] overflow-hidden bg-slate-950">
              <img
                src="/src/assets/images/vocab_1000_words_1791113160279.jpg"
                alt="1.000 meistgenutzte englische Wörter - NextLumen"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 rounded bg-slate-950/85 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm text-xs font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Wortschatz-Datenbank</span>
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                <span className="font-medium text-slate-200">5 Stufen · 200 Wörter je Stufe</span>
                <span className="font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-emerald-400 font-semibold tabular-nums">
                  1.000 Wörter Total
                </span>
              </div>
            </div>

            {/* Info & Action Column */}
            <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-100 tracking-tight">
                    Die 1.000 meistgenutzten Wörter
                  </h2>
                  <span className="text-xs text-amber-400/90 font-mono font-medium">
                    A1–C1
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Strukturiert in 5 Schwierigkeitsstufen mit exakt 200 Wörtern pro Level. Jedes Wort verfügt über authentische IPA-Lautschrift, deutsche Übersetzung, Aussprache-Tipps und zwei vollständig vertonte Beispielsätze mit Mikrofon-Sofortfeedback.
                </p>

                {/* Level Quick Jump Buttons */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-sans">
                    Direkt zu einem Level springen (je 200 Wörter):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { lvl: 'A1', label: 'Anfänger', range: '#1–200', color: 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10' },
                      { lvl: 'A2', label: 'Alltag', range: '#201–400', color: 'border-teal-500/30 text-teal-300 hover:bg-teal-500/10' },
                      { lvl: 'B1', label: 'Beruf', range: '#401–600', color: 'border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10' },
                      { lvl: 'B2', label: 'Business', range: '#601–800', color: 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10' },
                      { lvl: 'C1', label: 'Rhetorik', range: '#801–1000', color: 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10' },
                    ].map((item) => (
                      <button
                        key={item.lvl}
                        onClick={() => onOpenVocab(item.lvl as CEFRLevel)}
                        className={`p-2 rounded-xl bg-slate-950/40 border text-left transition-all cursor-pointer ${item.color}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs">{item.lvl}</span>
                          <span className="text-[10px] opacity-75 font-mono tabular-nums">{item.range}</span>
                        </div>
                        <span className="text-[11px] text-slate-300 block truncate font-sans">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenVocab('ALL')}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Alle 1.000 Wörter öffnen & trainieren</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenVocab('A1')}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-white border border-slate-700/80 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
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
                <img
                  src="/src/assets/images/nextlumen_speak_1791112093906.jpg"
                  alt="NextLumen Speak & Aussprechen - English Speaking Coaching"
                  referrerPolicy="no-referrer"
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
                  Speak & Aussprechen
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Interaktiver Dialog mit direktem phonetischen Feedback. Du übernimmst 70–80% der Redezeit und wirst bei Aussprache- oder Grammatikfehlern sofort gezielt korrigiert.
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
                <img
                  src="/src/assets/images/nextlumen_read_1791112103707.jpg"
                  alt="NextLumen Read & Weltklassiker - World Classics Library"
                  referrerPolicy="no-referrer"
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
                  50 ungekürzte Meisterwerke der Weltliteratur, aufgeteilt in A1 bis C1 (exakt 10 pro Stufe). Ausgestattet mit Audio-Vorleser, Schattenlesen-Mikrofon und Vokabelhilfen.
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
                <img
                  src="/src/assets/images/nextlumen_sound_1791112115528.jpg"
                  alt="NextLumen Pronunciation Sound Lab"
                  referrerPolicy="no-referrer"
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
                  Präzise Anleitung für englische Problem-Laute: Zungenposition zwischen den Zähnen für TH (/θ/, /ð/), Rachenform für American R, W vs V Unterscheidung und -ED Endungen.
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
                <img
                  src="/src/assets/images/nextlumen_skills_1791112127131.jpg"
                  alt="NextLumen Learner Skill Matrix"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-2.5 py-1 rounded bg-slate-950/85 text-cyan-300 border border-cyan-500/30 backdrop-blur-sm text-xs font-medium flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Kompetenz-Profil</span>
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium text-slate-200">CEFR Diagnostics</span>
                  <span className="font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 font-semibold tabular-nums">
                    6 Fertigkeiten
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-100 tracking-tight">
                  Learner Skill Matrix
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Deine Sprachfertigkeiten werden unabhängig bewertet. Leseverständnis (B1) und freies Sprechen (A1) werden separat getrackt und fließen in die Übungen ein.
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
