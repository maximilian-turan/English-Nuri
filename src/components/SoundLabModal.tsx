import React, { useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Languages,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { SOUND_GUIDES } from '../data/soundGuides';
import { SoundGuide } from '../types';
import { audioService } from '../utils/audio';

interface SoundLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  voiceSpeed: 'normal' | 'slow';
  onSelectPracticeWord?: (word: string) => void;
}

export const SoundLabModal: React.FC<SoundLabModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  voiceSpeed,
  onSelectPracticeWord,
}) => {
  const [selectedSoundId, setSelectedSoundId] = useState<string>(SOUND_GUIDES[0].id);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isListening, setIsListening] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState('');
  const [repeatResult, setRepeatResult] = useState<{
    success: boolean;
    feedback: string;
  } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const currentSound = SOUND_GUIDES.find((s) => s.id === selectedSoundId) || SOUND_GUIDES[0];

  const filteredSounds = SOUND_GUIDES.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  const playAudio = async (text: string, speed: 'normal' | 'slow' = voiceSpeed) => {
    setIsPlayingAudio(true);
    await audioService.playCoachSpeech(text, {
      speed,
      voice: 'Kore',
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleStartPractice = (targetText: string) => {
    if (isListening) {
      audioService.stopListening();
      setIsListening(false);
      return;
    }

    setUserSpokenText('');
    setRepeatResult(null);

    audioService.startListening(
      (text, isFinal) => {
        setUserSpokenText(text);
        if (isFinal) {
          audioService.stopListening();
          setIsListening(false);
          evaluatePractice(text, targetText);
        }
      },
      (error) => {
        setIsListening(false);
        setRepeatResult({
          success: false,
          feedback: `Microphone issue: ${error}. Try again or check permissions.`,
        });
      },
      (listening) => setIsListening(listening)
    );
  };

  const evaluatePractice = (spoken: string, target: string) => {
    const cleanSpoken = spoken.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

    if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
      setRepeatResult({
        success: true,
        feedback: `Excellent pronunciation! You clearly pronounced "${target}".`,
      });
    } else {
      setRepeatResult({
        success: false,
        feedback: `You said "${spoken}". Listen closely to the model sound and try once more!`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-slate-100 tracking-tight">
                Pronunciation Lab & Sound Studio
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Master difficult English sounds with exact physical mouth mechanics and repetition drills
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Zurück Button */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Zurück zum vorherigen Menü"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>Zurück</span>
            </button>

            {/* Home Button */}
            <button
              onClick={onGoHome || onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Zurück zur Startseite (Coach)"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Sounds' },
            { id: 'consonants', label: 'Key Consonants (TH, R, W, V)' },
            { id: 'vowels', label: 'Vowels (Short vs Long)' },
            { id: 'endings', label: 'Past Tense & Endings (-ED, -S)' },
            { id: 'stress_and_flow', label: 'Rhythm & Stress' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Sounds List Column */}
          <div className="md:col-span-4 border-r border-slate-800 p-3 overflow-y-auto space-y-1.5 max-h-[300px] md:max-h-full">
            {filteredSounds.map((sound) => {
              const isSelected = sound.id === currentSound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => {
                    setSelectedSoundId(sound.id);
                    setUserSpokenText('');
                    setRepeatResult(null);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/50 text-white shadow-sm'
                      : 'bg-slate-800/30 border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {sound.symbol}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{sound.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {sound.difficulty} • {sound.category.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sound Detail & Training Column */}
          <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto space-y-5">
            {/* Sound Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                  {currentSound.symbol}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{currentSound.name}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{currentSound.mouthGuide.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => playAudio(currentSound.name + '. ' + currentSound.exampleWords[0]?.word)}
                  disabled={isPlayingAudio}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Model Sound</span>
                </button>
                <button
                  onClick={() => playAudio(currentSound.name + '. ' + currentSound.exampleWords[0]?.word, 'slow')}
                  disabled={isPlayingAudio}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Slow pronunciation"
                >
                  🐢 Slow
                </button>
              </div>
            </div>

            {/* Physical Mouth Placement Guide (HOW to produce the sound) */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>👄 Physical Mouth & Tongue Guide</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">👅 Tongue:</span>
                  <p className="text-slate-400 leading-relaxed">{currentSound.mouthGuide.tongue}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">👄 Teeth & Lips:</span>
                  <p className="text-slate-400 leading-relaxed">{currentSound.mouthGuide.teethAndLips}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">🔊 Voice Box:</span>
                  <p className="text-slate-400 leading-relaxed">{currentSound.mouthGuide.vocalCords}</p>
                </div>
              </div>
            </div>

            {/* German Learner Tip if present */}
            {currentSound.germanTip && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
                <Languages className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-amber-300 block mb-0.5">
                    Tipp für Deutschsprachige:
                  </span>
                  <p className="leading-relaxed text-amber-200/90">{currentSound.germanTip}</p>
                </div>
              </div>
            )}

            {/* Example Words */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Practice Words
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentSound.exampleWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.word}</div>
                      <div className="text-[10px] font-mono text-emerald-400">{item.ipa}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => playAudio(item.word)}
                        title="Listen"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartPractice(item.word)}
                        title="Test pronunciation"
                        className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-600"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimal Pairs Section */}
            {currentSound.minimalPairs && currentSound.minimalPairs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Minimal Pairs (Listen to the subtle difference!)
                </h4>
                <div className="space-y-2">
                  {currentSound.minimalPairs.map((pair, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => playAudio(pair.wordA)}
                          className="px-3 py-1.5 rounded-lg font-bold bg-slate-700 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>{pair.wordA}</span>
                        </button>
                        <span className="text-slate-500 font-bold">vs</span>
                        <button
                          onClick={() => playAudio(pair.wordB)}
                          className="px-3 py-1.5 rounded-lg font-bold bg-slate-700 text-white hover:bg-indigo-600 transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3 text-indigo-400" />
                          <span>{pair.wordB}</span>
                        </button>
                      </div>
                      <span className="text-slate-400 text-[11px] italic">{pair.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Sentence Repetition Practice */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Target Sentence Drill
                </h4>
                <button
                  onClick={() => playAudio(currentSound.practiceSentence)}
                  className="text-xs text-indigo-300 hover:text-white flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Coach</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm font-medium text-white italic">
                "{currentSound.practiceSentence}"
              </div>

              {/* Practice Recording Button & Feedback */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStartPractice(currentSound.practiceSentence)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? 'Listening... Speak Now' : 'Speak Sentence'}</span>
                </button>

                {userSpokenText && (
                  <div className="text-xs text-slate-300 truncate">
                    Heard: <span className="font-semibold text-white">"{userSpokenText}"</span>
                  </div>
                )}
              </div>

              {repeatResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in ${
                    repeatResult.success
                      ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-800/50 text-rose-300'
                  }`}
                >
                  {repeatResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block mb-0.5">
                      {repeatResult.success ? 'Great Pronunciation!' : 'Keep Practicing'}
                    </span>
                    <p className="leading-relaxed">{repeatResult.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>Zurück</span>
            </button>
            <button
              onClick={onGoHome || onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home / Startseite</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline font-medium">
            Laut: <strong className="text-emerald-400">{currentSound.name}</strong> ({currentSound.symbol})
          </span>
        </div>
      </div>
    </div>
  );
};
