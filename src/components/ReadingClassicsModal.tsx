import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  BookmarkPlus,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Languages,
  ArrowRight,
  ArrowLeft,
  Home,
  Sliders,
  Type,
  Maximize2,
  HelpCircle,
  MessageSquare,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { CLASSICS_DATA, ClassicBook } from '../data/classics';
import { audioService } from '../utils/audio';

interface ReadingClassicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  onStartDiscussion: (topic: string, question: string) => void;
  onSaveWord: (word: string, ipa: string, tip: string) => void;
  savedWordsList: string[];
  initialLevelFilter?: string;
}

export const ReadingClassicsModal: React.FC<ReadingClassicsModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  onStartDiscussion,
  onSaveWord,
  savedWordsList,
  initialLevelFilter = 'ALL',
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'reader'>('grid');
  const [selectedBook, setSelectedBook] = useState<ClassicBook>(CLASSICS_DATA[0]);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>(initialLevelFilter || 'ALL');

  useEffect(() => {
    if (initialLevelFilter && isOpen) {
      setSelectedLevelFilter(initialLevelFilter);
      const firstOfLevel =
        initialLevelFilter === 'ALL'
          ? CLASSICS_DATA[0]
          : CLASSICS_DATA.find((b) => b.cefrLevel === initialLevelFilter) || CLASSICS_DATA[0];
      setSelectedBook(firstOfLevel);
      setViewMode('grid');
    }
  }, [initialLevelFilter, isOpen]);
  const [activeTab, setActiveTab] = useState<'text' | 'vocabulary' | 'discussion'>('text');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [themeMode, setThemeMode] = useState<'dark' | 'sepia' | 'slate'>('dark');

  // Audio Playback
  const [playingParagraphIndex, setPlayingParagraphIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow'>('normal');

  // Read-Aloud / Shadowing Mic Practice
  const [practicingParagraphIndex, setPracticingParagraphIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<{
    accuracy: number;
    feedback: string;
    matchedWordsCount: number;
    totalTargetWords: number;
    problemSounds: string[];
  } | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const filteredBooks = CLASSICS_DATA.filter(
    (b) => selectedLevelFilter === 'ALL' || b.cefrLevel === selectedLevelFilter
  );

  const handleOpenBook = (book: ClassicBook) => {
    setSelectedBook(book);
    setViewMode('reader');
    setPlayingParagraphIndex(null);
    setPracticingParagraphIndex(null);
    setEvaluationResult(null);
    setSpokenText('');
    setActiveTab('text');
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const handlePlayParagraph = async (index: number, text: string) => {
    if (playingParagraphIndex === index) {
      audioService.stopSpeaking();
      setPlayingParagraphIndex(null);
      return;
    }

    setPlayingParagraphIndex(index);
    await audioService.playCoachSpeech(text, {
      speed: playbackSpeed,
      voice: 'Kore',
      onEnd: () => setPlayingParagraphIndex(null),
    });
  };

  const handleStartReadAloud = (index: number, targetParagraphText: string) => {
    if (isListening && practicingParagraphIndex === index) {
      audioService.stopListening();
      setIsListening(false);
      return;
    }

    audioService.stopSpeaking();
    setPlayingParagraphIndex(null);
    setPracticingParagraphIndex(index);
    setSpokenText('');
    setEvaluationResult(null);

    audioService.startListening(
      (text, isFinal) => {
        setSpokenText(text);
        if (isFinal) {
          audioService.stopListening();
          setIsListening(false);
          evaluateReadAloud(text, targetParagraphText);
        }
      },
      (error) => {
        setIsListening(false);
        setEvaluationResult({
          accuracy: 0,
          feedback: `Microphone issue: ${error}. Please check permissions and speak clearly.`,
          matchedWordsCount: 0,
          totalTargetWords: targetParagraphText.split(/\s+/).length,
          problemSounds: [],
        });
      },
      (listening) => setIsListening(listening)
    );
  };

  const evaluateReadAloud = (userSpeech: string, targetText: string) => {
    const cleanUser = userSpeech.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const cleanTarget = targetText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    let matchCount = 0;
    const userWordsSet = new Set(cleanUser);

    cleanTarget.forEach((word) => {
      if (userWordsSet.has(word)) {
        matchCount++;
      }
    });

    const accuracy = Math.min(100, Math.round((matchCount / Math.max(1, cleanTarget.length)) * 100));

    // Detect key target sounds in this passage
    const problemSounds: string[] = [];
    if (/th/i.test(targetText)) problemSounds.push('TH sounds (/θ/ & /ð/)');
    if (/r/i.test(targetText)) problemSounds.push('R pronunciation');
    if (/w|v/i.test(targetText)) problemSounds.push('W vs V distinction');
    if (/ed\b/i.test(targetText)) problemSounds.push('Past-tense -ED endings');

    let feedback = '';
    if (accuracy >= 80) {
      feedback = `Outstanding read-aloud fluency! You pronounced approximately ${accuracy}% of the words accurately and kept good rhythmic pace.`;
    } else if (accuracy >= 55) {
      feedback = `Good spoken attempt (${accuracy}% match)! You captured the main phrasing. Listen once to the Coach audio model above and repeat to refine the rhythm.`;
    } else {
      feedback = `Keep going (${accuracy}% match)! Classic literary English can be dense. Break it down sentence by sentence and listen to the Coach model first.`;
    }

    setEvaluationResult({
      accuracy,
      feedback,
      matchedWordsCount: matchCount,
      totalTargetWords: cleanTarget.length,
      problemSounds,
    });
  };

  const currentThemeClasses =
    themeMode === 'sepia'
      ? 'bg-[#1e1b18] text-[#e8dfd5] border-[#38312a]'
      : themeMode === 'slate'
      ? 'bg-slate-900 text-slate-100 border-slate-800'
      : 'bg-slate-950 text-slate-100 border-slate-850';

  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950 text-amber-400 border border-amber-500/30 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-slate-100 tracking-tight">
                  {viewMode === 'grid' ? 'Weltklassiker Lesesaal' : selectedBook.title}
                </h2>
                <span className="text-xs text-amber-300/90 font-mono font-medium">
                  {viewMode === 'grid' ? '50 Klassiker · A1–C1' : `Stufe ${selectedBook.cefrLevel}`}
                </span>
                <span className="text-xs text-slate-400 font-sans hidden sm:inline">
                  {viewMode === 'grid' ? '· ≥ 2.000 Wörter pro Buch' : `· von ${selectedBook.author} (${selectedBook.year})`}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block mt-0.5 font-sans">
                {viewMode === 'grid'
                  ? '5 Stufen (A1–C1) mit je genau 10 ungekürzten Meisterwerken, Audio-Vorleser und Schattenlesen-Mikrofon.'
                  : `${selectedBook.wordCount.toLocaleString()} Wörter · Vertonter Lesesaal mit Absatz-Audio & Schattenlesen`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zurück Button */}
            <button
              onClick={() => {
                if (viewMode === 'reader') {
                  setViewMode('grid');
                } else {
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title={viewMode === 'reader' ? 'Zurück zur Klassiker-Auswahl' : 'Zurück zum Coach'}
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>{viewMode === 'reader' ? 'Zurück zur Auswahl' : 'Zurück'}</span>
            </button>

            {/* Home Button */}
            <button
              onClick={onGoHome || onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Zurück zur Startseite (Coach)"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            {/* Speed toggle for reader */}
            {viewMode === 'reader' && (
              <button
                onClick={() => setPlaybackSpeed(playbackSpeed === 'normal' ? 'slow' : 'normal')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors hidden sm:flex items-center gap-1 cursor-pointer"
                title="Voice narration speed"
              >
                {playbackSpeed === 'slow' ? '🐢 Slow' : '⚡ 1.0x'}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level Tabs Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 font-semibold mr-1">Stufe (Level):</span>
            {[
              { id: 'ALL', label: 'Alle 50 Klassiker' },
              { id: 'A1', label: 'A1 (10 Klassiker)' },
              { id: 'A2', label: 'A2 (10 Klassiker)' },
              { id: 'B1', label: 'B1 (10 Klassiker)' },
              { id: 'B2', label: 'B2 (10 Klassiker)' },
              { id: 'C1', label: 'C1 (10 Klassiker)' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => {
                  setSelectedLevelFilter(lvl.id);
                  const firstOfLevel =
                    lvl.id === 'ALL'
                      ? CLASSICS_DATA[0]
                      : CLASSICS_DATA.find((b) => b.cefrLevel === lvl.id) || CLASSICS_DATA[0];
                  setSelectedBook(firstOfLevel);
                  setPlayingParagraphIndex(null);
                  setPracticingParagraphIndex(null);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedLevelFilter === lvl.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-emerald-400 font-bold hidden md:inline">
            ✓ 100% verifiziert: Alle 50 Klassiker besitzen ≥ 2.000 Wörter
          </span>
        </div>

        {/* VIEW 1: LIBRARY GRID MODE */}
        {viewMode === 'grid' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-950/40">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book, idx) => (
                <div
                  key={book.id}
                  onClick={() => handleOpenBook(book)}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer group shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded font-mono font-semibold text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {book.cefrLevel}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 tabular-nums flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {book.wordCount.toLocaleString()} Wörter
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-100 group-hover:text-amber-300 transition-colors tracking-tight">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        von {book.author} ({book.year}) · {book.genre}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {book.synopsis}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      ca. {book.estimatedReadTimeMinutes} Min.
                    </span>
                    <span className="font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                      Jetzt lesen & sprechen <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: READER MODE */}
        {viewMode === 'reader' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Book Details Sub-Header */}
            <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{selectedBook.title}</h3>
                  <span className="text-slate-400">by {selectedBook.author} ({selectedBook.year})</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                    {selectedBook.cefrLevel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    {selectedBook.wordCount.toLocaleString()} Wörter
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{selectedBook.subtitle}</p>
              </div>

              {/* Reader Preferences Bar */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                {/* Font Size Selector */}
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                  <button
                    onClick={() => setFontSize('sm')}
                    className={`px-2 py-1 rounded text-xs ${fontSize === 'sm' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('base')}
                    className={`px-2 py-1 rounded text-xs ${fontSize === 'base' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    className={`px-2 py-1 rounded text-xs ${fontSize === 'lg' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setFontSize('xl')}
                    className={`px-2 py-1 rounded text-xs ${fontSize === 'xl' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    A++
                  </button>
                </div>

                {/* Font Family Selector */}
                <button
                  onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700 font-semibold"
                >
                  {fontFamily === 'serif' ? 'Serif' : 'Sans'}
                </button>

                {/* Theme Mode */}
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`px-2 py-1 rounded ${themeMode === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setThemeMode('sepia')}
                    className={`px-2 py-1 rounded ${themeMode === 'sepia' ? 'bg-amber-700 text-white' : 'text-slate-400'}`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setThemeMode('slate')}
                    className={`px-2 py-1 rounded ${themeMode === 'slate' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  >
                    Slate
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Text / Vocabulary / Discussion) */}
            <div className="px-5 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Text ({selectedBook.paragraphs.length} Absätze • {selectedBook.wordCount.toLocaleString()} Wörter)</span>
                </button>

                <button
                  onClick={() => setActiveTab('vocabulary')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'vocabulary'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Wortschatz & Aussprache ({selectedBook.vocabulary.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'discussion'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Sprechübungen & Diskussion ({selectedBook.discussionQuestions.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                💡 Tipp: Klicke auf 'Listen' oder 'Speak Aloud' für interaktives Shadowing
              </span>
            </div>

            {/* Reader Content Body */}
            <div
              ref={contentRef}
              className={`flex-1 p-5 sm:p-8 overflow-y-auto ${currentThemeClasses} ${
                fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            >
              {/* TAB 1: TEXT */}
              {activeTab === 'text' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Title Banner inside reader */}
                  <div className="text-center pb-6 border-b border-slate-800/60 font-sans">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {selectedBook.genre} • Stufe {selectedBook.cefrLevel}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3 font-serif">
                      {selectedBook.title}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 italic">
                      by {selectedBook.author} ({selectedBook.year})
                    </p>
                    <p className="text-xs text-emerald-400 mt-2 font-mono font-bold">
                      ✓ Vollständiger Text: {selectedBook.wordCount.toLocaleString()} Wörter (≥ 2.000 Wörter Mindestanforderung erfüllt)
                    </p>
                  </div>

                  {/* Paragraphs with interactive tools */}
                  {selectedBook.paragraphs.map((pText, pIndex) => {
                    const isPlaying = playingParagraphIndex === pIndex;
                    const isPracticing = practicingParagraphIndex === pIndex;

                    return (
                      <div
                        key={pIndex}
                        className={`group relative p-4 rounded-2xl transition-all border ${
                          isPlaying
                            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                            : isPracticing
                            ? 'bg-emerald-950/40 border-emerald-500/50'
                            : 'border-transparent hover:border-slate-800 hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Audio & Speaking Action Toolbar for Paragraph */}
                        <div className="flex items-center gap-2 mb-2 font-sans">
                          <button
                            onClick={() => handlePlayParagraph(pIndex, pText)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              isPlaying
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                            }`}
                            title="Listen to paragraph spoken by coach"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{isPlaying ? 'Pause' : 'Listen'}</span>
                          </button>

                          <button
                            onClick={() => handleStartReadAloud(pIndex, pText)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              isPracticing && isListening
                                ? 'bg-rose-600 text-white animate-pulse'
                                : isPracticing
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                            }`}
                            title="Speak this paragraph aloud to practice pronunciation"
                          >
                            {isPracticing && isListening ? (
                              <>
                                <MicOff className="w-3.5 h-3.5" />
                                <span>Listening...</span>
                              </>
                            ) : (
                              <>
                                <Mic className="w-3.5 h-3.5" />
                                <span>Speak Aloud</span>
                              </>
                            )}
                          </button>

                          <span className="text-[11px] text-slate-500 ml-auto font-mono">
                            § {pIndex + 1}
                          </span>
                        </div>

                        {/* Paragraph Text */}
                        <p className={fontSizes[fontSize]}>{pText}</p>

                        {/* Speech Shadowing Feedback Box */}
                        {isPracticing && (
                          <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 font-sans text-xs space-y-2">
                            {spokenText && (
                              <div>
                                <span className="text-slate-400 font-semibold block text-[11px]">
                                  Your spoken speech:
                                </span>
                                <p className="text-white italic">"{spokenText}"</p>
                              </div>
                            )}

                            {evaluationResult && (
                              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-amber-400" />
                                    Read-Aloud Accuracy: {evaluationResult.accuracy}%
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {evaluationResult.matchedWordsCount} of {evaluationResult.totalTargetWords} words
                                  </span>
                                </div>
                                <p className="text-slate-300">{evaluationResult.feedback}</p>

                                {evaluationResult.problemSounds.length > 0 && (
                                  <div className="text-[11px] text-amber-300">
                                    <strong>Target Sounds in this section:</strong>{' '}
                                    {evaluationResult.problemSounds.join(' • ')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: VOCABULARY & PRONUNCIATION */}
              {activeTab === 'vocabulary' && (
                <div className="max-w-2xl mx-auto space-y-4 font-sans">
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
                    <span className="font-bold text-indigo-300">Target Vocabulary for {selectedBook.title}:</span>{' '}
                    Practice these key literary words with precise phonetic transcriptions and mouth mechanics.
                  </div>

                  <div className="space-y-3">
                    {selectedBook.vocabulary.map((vocab, vIdx) => {
                      const isSaved = savedWordsList.includes(vocab.word);

                      return (
                        <div
                          key={vIdx}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white">{vocab.word}</h4>
                              <span className="px-2 py-0.5 rounded font-mono text-xs bg-slate-800 text-indigo-300">
                                {vocab.ipa}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  audioService.playCoachSpeech(vocab.word, {
                                    speed: 'slow',
                                    voice: 'Kore',
                                  })
                                }
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Listen to pronunciation"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() =>
                                  onSaveWord(
                                    vocab.word,
                                    vocab.ipa,
                                    `${vocab.definition} (DE: ${vocab.germanTranslation})`
                                  )
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                  isSaved
                                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }`}
                              >
                                {isSaved ? (
                                  <>
                                    <BookmarkCheck className="w-3.5 h-3.5" />
                                    <span>Saved</span>
                                  </>
                                ) : (
                                  <>
                                    <BookmarkPlus className="w-3.5 h-3.5" />
                                    <span>Save to Bank</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="text-xs space-y-1">
                            <p className="text-slate-300">
                              <strong className="text-slate-400">Bedeutung:</strong> {vocab.definition}
                            </p>
                            <p className="text-amber-300/90">
                              <strong className="text-amber-400">Deutsch:</strong> {vocab.germanTranslation}
                            </p>
                            <p className="text-slate-400 italic pt-1 border-t border-slate-800">
                              "{vocab.contextSentence}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: DISCUSSION QUESTIONS */}
              {activeTab === 'discussion' && (
                <div className="max-w-2xl mx-auto space-y-4 font-sans">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200">
                    <span className="font-bold text-emerald-300">Speaking Practice & Comprehension:</span>{' '}
                    Answer these questions out loud to develop spoken fluency, narrative expression, and confidence!
                  </div>

                  <div className="space-y-3">
                    {selectedBook.discussionQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {qIdx + 1}
                          </span>
                          <p className="text-sm font-semibold text-white leading-relaxed">{q}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => audioService.playCoachSpeech(q, { voice: 'Kore' })}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Frage anhören</span>
                          </button>

                          <button
                            onClick={() => onStartDiscussion(selectedBook.title, q)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Mit Coach diskutieren</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
