import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Home,
  Sparkles,
  ChevronDown,
  ChevronRight,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Play,
  Layers,
  List,
  Grid,
  CreditCard,
  Shuffle,
  Volume1,
  Award
} from 'lucide-react';
import { CEFRLevel } from '../types';
import {
  VocabWord,
  VocabPartOfSpeech,
  TOP_1000_WORDS,
  VOCAB_BY_LEVEL,
  LEVEL_STATS
} from '../data/vocabulary/top1000Words';
import { audioService } from '../utils/audio';

interface Top1000WordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  initialLevel?: CEFRLevel | 'ALL';
  savedWords?: Array<{ word: string }>;
  onSaveWord?: (word: string, ipa: string, tip: string) => void;
}

type ViewMode = 'cards' | 'table' | 'flashcards';

export const Top1000WordsModal: React.FC<Top1000WordsModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  initialLevel = 'ALL',
  savedWords = [],
  onSaveWord
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>(initialLevel);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);

  // Flashcards mode state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('nextlumen_mastered_words');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Interactive speech recognition practice state
  const [practicingWordId, setPracticingWordId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [spokenFeedback, setSpokenFeedback] = useState<{
    wordId: string;
    text: string;
    score: number;
    match: boolean;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialLevel) {
      setSelectedLevel(initialLevel);
    }
  }, [initialLevel]);

  // Sync mastered words to localStorage
  const toggleMastered = (wordId: string) => {
    setMasteredWords((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      try {
        localStorage.setItem('nextlumen_mastered_words', JSON.stringify([...next]));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  // Filter words
  const filteredWords = useMemo(() => {
    let list: VocabWord[] =
      selectedLevel === 'ALL' ? TOP_1000_WORDS : VOCAB_BY_LEVEL[selectedLevel] || [];

    if (selectedPos !== 'all') {
      list = list.filter((w) => w.partOfSpeech === selectedPos);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.meaningDe.toLowerCase().includes(q) ||
          w.ipa.toLowerCase().includes(q) ||
          w.phoneticSpelling.toLowerCase().includes(q) ||
          w.examples.some((ex) => ex.en.toLowerCase().includes(q) || ex.de.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedLevel, selectedPos, searchQuery]);

  // Pagination for grid/table to maintain high performance
  const [visibleCount, setVisibleCount] = useState(40);

  useEffect(() => {
    setVisibleCount(40);
    setFlashcardIndex(0);
    setIsCardFlipped(false);
  }, [selectedLevel, selectedPos, searchQuery]);

  if (!isOpen) return null;

  // Audio player helper
  const playSpeech = async (id: string, text: string, speed: 'normal' | 'slow' = 'normal') => {
    try {
      setPlayingAudioId(id);
      await audioService.playCoachSpeech(text, { speed, voice: 'Kore' });
    } catch (e) {
      console.warn('Speech playback failed:', e);
    } finally {
      setPlayingAudioId(null);
    }
  };

  // Microphone Speech Recognition Practice
  const handleStartSpeakingPractice = (wordItem: VocabWord, targetText: string, practiceKey: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Spracherkennung wird in diesem Browser nicht unterstützt. Bitte nutze Chrome oder Edge.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      setPracticingWordId(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setPracticingWordId(practiceKey);
        setSpokenFeedback(null);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.trim().toLowerCase();
        const targetClean = targetText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        const spokenClean = spoken.replace(/[^a-z0-9 ]/g, '').trim();

        const isExact = spokenClean === targetClean;
        const contains = spokenClean.includes(targetClean) || targetClean.includes(spokenClean);
        const match = isExact || contains;
        const score = isExact ? 100 : contains ? 85 : 45;

        setSpokenFeedback({
          wordId: practiceKey,
          text: event.results[0][0].transcript,
          score,
          match
        });
      };

      recognition.onerror = () => {
        setIsListening(false);
        setPracticingWordId(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setPracticingWordId(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start failed', err);
      setIsListening(false);
      setPracticingWordId(null);
    }
  };

  // Pos labels in German
  const posLabels: Record<string, string> = {
    all: 'Alle Wortarten',
    verb: 'Verben',
    noun: 'Substantive',
    adjective: 'Adjektive',
    adverb: 'Adverbien',
    pronoun: 'Pronomen',
    preposition: 'Präpositionen',
    conjunction: 'Konjunktionen',
    phrase: 'Ausdrücke & Phrasen'
  };

  const levelColorMap: Record<CEFRLevel, { bg: string; text: string; border: string }> = {
    A1: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    A2: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/40' },
    B1: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40' },
    B2: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
    C1: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40' }
  };

  // Current flashcard word
  const currentFlashcard = filteredWords[flashcardIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-slate-100 tracking-tight">
                  1.000 Meistgenutzte Wörter
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  5 Stufen · 200 Wörter je Stufe
                </span>
                <span className="text-xs text-amber-300/80 font-sans">
                  · Mit Aussprache & Beispielsätzen
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Exakte CEFR-Einteilung nach Häufigkeit & Schwierigkeit. Jedes Wort mit IPA-Lautschrift, Sound-Tipp und zwei vertonten Sätzen.
              </p>
            </div>
          </div>

          {/* Action buttons: Zurück, Home, Close */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Zurück zum vorherigen Menü"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>Zurück</span>
            </button>

            <button
              onClick={onGoHome || onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Zurück zur Startseite (Dashboard)"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level Tabs (All, A1, A2, B1, B2, C1) */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 overflow-x-auto shrink-0 no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedLevel('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                selectedLevel === 'ALL'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
              }`}
            >
              Alle 1.000 Wörter
            </button>

            {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => {
              const isActive = selectedLevel === lvl;
              const color = levelColorMap[lvl];
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? `${color.bg} ${color.text} ${color.border} shadow-sm ring-1 ring-white/10`
                      : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/80'
                  }`}
                >
                  <span className="font-mono">{lvl}</span>
                  <span className="text-[10px] opacity-80">(200)</span>
                </button>
              );
            })}
          </div>

          {/* View mode toggle (Cards, Table, Flashcards) */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kartenansicht mit Beispielen"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Karten</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kompakte Listenansicht"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabelle</span>
            </button>

            <button
              onClick={() => setViewMode('flashcards')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'flashcards'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Karteikarten-Trainer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Karteikarten</span>
            </button>
          </div>
        </div>

        {/* Search, POS Filter & Stats Banner */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Wort, deutsche Übersetzung, IPA oder Beispielsatz suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Part of speech dropdown filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden lg:inline">Wortart:</span>
            <select
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {Object.entries(posLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <div className="text-xs text-slate-400 font-mono bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/60 shrink-0">
              <strong className="text-white">{filteredWords.length}</strong> Treffer
            </div>
          </div>
        </div>

        {/* Level Description Info Header (if single level chosen) */}
        {selectedLevel !== 'ALL' && LEVEL_STATS[selectedLevel] && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${levelColorMap[selectedLevel].bg} ${levelColorMap[selectedLevel].text}`}>
                {selectedLevel} (Rang {LEVEL_STATS[selectedLevel].startRank}–{LEVEL_STATS[selectedLevel].endRank})
              </span>
              <span>{LEVEL_STATS[selectedLevel].deDescription}</span>
            </div>
            <span className="font-mono text-slate-400 shrink-0 hidden md:inline">200 Wörter</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* FLASHCARD MODE */}
          {viewMode === 'flashcards' && (
            <div className="max-w-2xl mx-auto py-4 flex flex-col items-center justify-center min-h-[500px]">
              {filteredWords.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  <p>Keine Wörter gefunden für diesen Filter.</p>
                </div>
              ) : currentFlashcard ? (
                <div className="w-full space-y-4">
                  {/* Flashcard Counter & Controls */}
                  <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">
                        Karte {flashcardIndex + 1} von {filteredWords.length}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${levelColorMap[currentFlashcard.level].bg} ${levelColorMap[currentFlashcard.level].text}`}>
                        {currentFlashcard.level} • #{currentFlashcard.rank}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMastered(currentFlashcard.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          masteredWords.has(currentFlashcard.id)
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{masteredWords.has(currentFlashcard.id) ? 'Gelernt ✓' : 'Als gelernt markieren'}</span>
                      </button>

                      <button
                        onClick={() => {
                          const rand = Math.floor(Math.random() * filteredWords.length);
                          setFlashcardIndex(rand);
                          setIsCardFlipped(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                        title="Zufällige Karte"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Interactive Flip Card */}
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="w-full min-h-[320px] rounded-3xl bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-750 p-6 sm:p-8 flex flex-col justify-between shadow-2xl cursor-pointer hover:border-indigo-500/50 transition-all select-none relative group"
                  >
                    <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-500 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />
                      <span>Klicken zum Umdrehen</span>
                    </div>

                    {!isCardFlipped ? (
                      /* FRONT: English Word & Audio */
                      <div className="flex flex-col items-center justify-center my-auto py-6 space-y-4 text-center">
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                          Rang #{currentFlashcard.rank} • {posLabels[currentFlashcard.partOfSpeech] || currentFlashcard.partOfSpeech}
                        </span>

                        <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                          {currentFlashcard.word}
                        </h3>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base sm:text-lg text-emerald-400 font-semibold px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            {currentFlashcard.ipa}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            [{currentFlashcard.phoneticSpelling}]
                          </span>
                        </div>

                        {/* Audio buttons */}
                        <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => playSpeech(`fc-${currentFlashcard.id}`, currentFlashcard.word, 'normal')}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>Aussprache (Normal)</span>
                          </button>

                          <button
                            onClick={() => playSpeech(`fc-slow-${currentFlashcard.id}`, currentFlashcard.word, 'slow')}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            title="Langsame Aussprache (0.75x)"
                          >
                            <Volume1 className="w-4 h-4 text-amber-400" />
                            <span>Langsam</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* BACK: German Meaning, Tips & Example Sentences */
                      <div className="space-y-4 my-auto py-2">
                        <div className="text-center pb-2 border-b border-slate-800">
                          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                            Deutsche Bedeutung:
                          </span>
                          <p className="text-2xl font-bold text-amber-300">
                            {currentFlashcard.meaningDe}
                          </p>
                          <p className="text-xs text-emerald-400 font-mono mt-1">
                            Aussprache-Tipp: <span className="text-slate-300 font-sans">{currentFlashcard.soundTip}</span>
                          </p>
                        </div>

                        {/* Examples */}
                        <div className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                            Beispielsätze im Kontext:
                          </span>
                          {currentFlashcard.examples.map((ex, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <p className="text-white font-medium">{ex.en}</p>
                                <p className="text-slate-400 text-[11px] italic">{ex.de}</p>
                              </div>

                              <button
                                onClick={() => playSpeech(`fc-ex-${currentFlashcard.id}-${i}`, ex.en)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                                title="Satz anhören"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-center pt-2 text-[11px] text-slate-500">
                      Tipp: Klicke auf die Karte, um zwischen englischem Wort und Übersetzung zu wechseln.
                    </div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => {
                        setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : filteredWords.length - 1));
                        setIsCardFlipped(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Vorheriges Wort</span>
                    </button>

                    <button
                      onClick={() => {
                        setFlashcardIndex((prev) => (prev < filteredWords.length - 1 ? prev + 1 : 0));
                        setIsCardFlipped(false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                    >
                      <span>Nächstes Wort</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-14">Rang</th>
                      <th className="py-3 px-4 w-16">Stufe</th>
                      <th className="py-3 px-4">Wort</th>
                      <th className="py-3 px-4">Lautschrift (IPA)</th>
                      <th className="py-3 px-4">Wortart</th>
                      <th className="py-3 px-4">Bedeutung (DE)</th>
                      <th className="py-3 px-4 text-center">Audio</th>
                      <th className="py-3 px-4 text-center">Sätze</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredWords.slice(0, visibleCount).map((word) => {
                      const isExpanded = expandedWordId === word.id;
                      const isSaved = savedWords.some((w) => w.word.toLowerCase() === word.word.toLowerCase());
                      const isPlaying = playingAudioId === word.id;

                      return (
                        <React.Fragment key={word.id}>
                          <tr className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-500">#{word.rank}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${levelColorMap[word.level].bg} ${levelColorMap[word.level].text}`}>
                                {word.level}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-white text-sm">
                              {word.word}
                            </td>
                            <td className="py-3 px-4 font-mono text-emerald-400">
                              {word.ipa}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {posLabels[word.partOfSpeech] || word.partOfSpeech}
                            </td>
                            <td className="py-3 px-4 font-medium text-amber-200">
                              {word.meaningDe}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => playSpeech(word.id, word.word, 'normal')}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isPlaying
                                      ? 'bg-indigo-600 text-white border-indigo-400'
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                  }`}
                                  title="Aussprache anhören"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => playSpeech(`slow-${word.id}`, word.word, 'slow')}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer"
                                  title="Langsame Aussprache (0.75x)"
                                >
                                  <Volume1 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setExpandedWordId(isExpanded ? null : word.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                  isExpanded
                                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                                }`}
                              >
                                {isExpanded ? 'Verbergen' : '2 Beispielsätze'}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded row with sentences and sound tips */}
                          {isExpanded && (
                            <tr className="bg-slate-900/90">
                              <td colSpan={8} className="p-4 border-b border-slate-800">
                                <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-emerald-400" />
                                      <span className="text-xs font-bold text-emerald-300">Phonetischer Tipp:</span>
                                      <span className="text-xs text-slate-300">{word.soundTip}</span>
                                    </div>

                                    {onSaveWord && (
                                      <button
                                        onClick={() => onSaveWord(word.word, word.ipa, word.soundTip || '')}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                          isSaved
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                        }`}
                                      >
                                        <Bookmark className="w-3.5 h-3.5" />
                                        <span>{isSaved ? 'Im Wortschatz-Heft ✓' : 'Im Wortschatz-Heft speichern'}</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                    {word.examples.map((ex, i) => (
                                      <div
                                        key={i}
                                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                                      >
                                        <div className="space-y-1">
                                          <p className="font-semibold text-white">{ex.en}</p>
                                          <p className="text-slate-400 italic text-[11px]">{ex.de}</p>
                                        </div>
                                        <button
                                          onClick={() => playSpeech(`ex-${word.id}-${i}`, ex.en)}
                                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                                          title="Satz anhören"
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredWords.length > visibleCount && (
                <div className="p-4 text-center border-t border-slate-800 bg-slate-900/80">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 40)}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    Weitere 40 Wörter laden ({filteredWords.length - visibleCount} verbleibend)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GRID CARDS VIEW */}
          {viewMode === 'cards' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWords.slice(0, visibleCount).map((word) => {
                  const isSaved = savedWords.some((w) => w.word.toLowerCase() === word.word.toLowerCase());
                  const isPlayingWord = playingAudioId === word.id;
                  const isPlayingSlow = playingAudioId === `slow-${word.id}`;
                  const isSpeakingThis = practicingWordId === word.id && isListening;
                  const hasSpokenFeedback = spokenFeedback?.wordId === word.id;

                  return (
                    <div
                      key={word.id}
                      className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 p-5 flex flex-col justify-between shadow-md transition-all space-y-4"
                    >
                      {/* Top Bar: Rank, Level, POS, Save Bookmark */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md font-mono font-extrabold text-xs ${levelColorMap[word.level].bg} ${levelColorMap[word.level].text} border ${levelColorMap[word.level].border}`}>
                            {word.level}
                          </span>
                          <span className="font-mono text-xs text-slate-500 font-semibold">
                            #{word.rank}
                          </span>
                          <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                            {posLabels[word.partOfSpeech] || word.partOfSpeech}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onSaveWord && (
                            <button
                              onClick={() => onSaveWord(word.word, word.ipa, word.soundTip || '')}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isSaved
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
                              }`}
                              title={isSaved ? 'Im Wortschatz-Heft gespeichert' : 'Im Wortschatz-Heft speichern'}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Word, IPA & German Translation */}
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
                            {word.word}
                          </h3>
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {word.ipa}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              [{word.phoneticSpelling}]
                            </span>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-amber-300">
                          {word.meaningDe}
                        </p>
                      </div>

                      {/* Audio & Speaking Practice Controls */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {/* Normal Audio */}
                        <button
                          onClick={() => playSpeech(word.id, word.word, 'normal')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                            isPlayingWord
                              ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                              : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                          }`}
                          title="Normales Tempo anhören"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Aussprache</span>
                        </button>

                        {/* Slow Audio */}
                        <button
                          onClick={() => playSpeech(`slow-${word.id}`, word.word, 'slow')}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                            isPlayingSlow
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                          }`}
                          title="Langsame Aussprache (0.75x für perfektes Hören)"
                        >
                          <Volume1 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Langsam</span>
                        </button>

                        {/* Microphone practice */}
                        <button
                          onClick={() => handleStartSpeakingPractice(word, word.word, word.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                            isSpeakingThis
                              ? 'bg-red-500 text-white animate-pulse border-red-400'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          }`}
                          title="Sprich das Wort ins Mikrofon für Sofort-Bewertung"
                        >
                          {isSpeakingThis ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-400" />}
                          <span>{isSpeakingThis ? 'Höre zu...' : 'Nachsprechen'}</span>
                        </button>
                      </div>

                      {/* Microphone Feedback Result (if spoken) */}
                      {hasSpokenFeedback && spokenFeedback && (
                        <div
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                            spokenFeedback.match
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold">
                              {spokenFeedback.match ? 'Exzellent! ' : 'Verbesserungstipp: '}
                            </span>
                            <span>Erkannt: &ldquo;{spokenFeedback.text}&rdquo;</span>
                          </div>
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900/60">
                            {spokenFeedback.score}%
                          </span>
                        </div>
                      )}

                      {/* Phonetic Tip Badge */}
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong className="text-emerald-300">Aussprache-Tipp: </strong>
                          {word.soundTip}
                        </p>
                      </div>

                      {/* 2 Contextual Example Sentences with Audio */}
                      <div className="space-y-2 pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Beispielsätze im Kontext (mit Audio):
                        </span>

                        {word.examples.map((example, idx) => {
                          const exKey = `ex-${word.id}-${idx}`;
                          const isPlayingEx = playingAudioId === exKey;

                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-850/80 border border-slate-750 flex items-start justify-between gap-2.5 text-xs hover:border-slate-700 transition-colors"
                            >
                              <div className="space-y-0.5">
                                <p className="text-slate-100 font-medium leading-relaxed">
                                  {example.en}
                                </p>
                                <p className="text-slate-400 text-[11px] italic">
                                  {example.de}
                                </p>
                              </div>

                              <button
                                onClick={() => playSpeech(exKey, example.en, 'normal')}
                                className={`p-2 rounded-lg border transition-all shrink-0 cursor-pointer ${
                                  isPlayingEx
                                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                }`}
                                title="Beispielsatz vorlesen lassen"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredWords.length > visibleCount && (
                <div className="text-center py-6">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 40)}
                    className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Weitere 40 Wörter anzeigen ({filteredWords.length - visibleCount} weitere)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              Wortschatz-Datenbank: <strong className="text-white">1.000 Wörter</strong> (A1: 200, A2: 200, B1: 200, B2: 200, C1: 200)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Gelernt: <strong className="text-emerald-400">{masteredWords.size}</strong> / 1.000</span>
            <button
              onClick={() => {
                setViewMode('flashcards');
                setFlashcardIndex(0);
              }}
              className="text-amber-300 hover:text-white font-semibold underline cursor-pointer"
            >
              Karteikarten-Drill starten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
