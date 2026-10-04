import React, { useState } from 'react';
import {
  Volume2,
  Mic,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Languages,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Correction } from '../types';
import { audioService } from '../utils/audio';

interface CorrectionCardProps {
  correction: Correction;
  onRepeatClick?: (targetText: string) => void;
  isListening?: boolean;
  voiceSpeed?: 'normal' | 'slow';
  showGermanDefault?: boolean;
}

export const CorrectionCard: React.FC<CorrectionCardProps> = ({
  correction,
  onRepeatClick,
  isListening = false,
  voiceSpeed = 'normal',
  showGermanDefault = false,
}) => {
  const [showGerman, setShowGerman] = useState(showGermanDefault);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playCorrectAudio = async (speed: 'normal' | 'slow' = 'normal') => {
    setIsPlayingAudio(true);
    await audioService.playCoachSpeech(correction.correctVersion, {
      speed,
      voice: 'Kore',
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const playDrillPart = async (text: string) => {
    await audioService.playCoachSpeech(text, {
      speed: 'slow',
      voice: 'Kore',
    });
  };

  // LEVEL 1: Gentle Correction
  if (correction.level === 1) {
    return (
      <div className="my-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Coaching Tip:
          </span>
          <button
            onClick={() => playCorrectAudio('slow')}
            title="Listen slowly"
            className="text-amber-300 hover:text-white flex items-center gap-1 text-[11px]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Listen</span>
          </button>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {correction.explanation || `Say "${correction.correctVersion}" instead of "${correction.learnerSaid}".`}
        </p>
      </div>
    );
  }

  // LEVEL 2 & LEVEL 3: Focused Correction & Pronunciation Drill
  return (
    <div
      className={`my-3 p-4 rounded-2xl border shadow-lg space-y-3.5 transition-all ${
        correction.level === 3
          ? 'bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-500/40'
          : 'bg-slate-800/80 border-slate-700/80'
      }`}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              correction.level === 3
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            {correction.level === 3 ? 'Level 3: Pronunciation Drill' : 'Level 2: Focused Correction'}
          </span>
          {correction.pronunciationGuide?.targetSound && (
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Sound: {correction.pronunciationGuide.targetSound}
            </span>
          )}
        </div>

        {/* German Help Toggle */}
        {correction.germanExplanation && (
          <button
            onClick={() => setShowGerman(!showGerman)}
            className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors ${
              showGerman
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{showGerman ? 'Deutsch aktiv' : 'Hilfe auf Deutsch'}</span>
          </button>
        )}
      </div>

      {/* 1. What the learner said vs 2. Correct version */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-900/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
            1. You said:
          </span>
          <div className="text-slate-300 font-medium italic line-through decoration-rose-500/60">
            "{correction.learnerSaid}"
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-900/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              2. Correct version:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => playCorrectAudio('normal')}
                disabled={isPlayingAudio}
                title="Normal speed"
                className="text-emerald-400 hover:text-white p-0.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => playCorrectAudio('slow')}
                disabled={isPlayingAudio}
                title="Slow speed"
                className="text-slate-400 hover:text-emerald-300 text-[10px] font-semibold"
              >
                🐢
              </button>
            </div>
          </div>
          <div className="text-emerald-300 font-bold">"{correction.correctVersion}"</div>
        </div>
      </div>

      {/* 3. Explanation in simple language */}
      <div className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
          3. Why:
        </span>
        <p className="leading-relaxed">{correction.explanation}</p>

        {showGerman && correction.germanExplanation && (
          <div className="mt-2 pt-2 border-t border-slate-800 text-amber-200/90 text-xs">
            <span className="font-semibold text-amber-300">🇩🇪 Erklärung: </span>
            {correction.germanExplanation}
          </div>
        )}
      </div>

      {/* 4. Pronunciation Sound & Mouth Placement (if applicable) */}
      {correction.pronunciationGuide && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span>4. Pronunciation Guide:</span>
              {correction.pronunciationGuide.problemWord && (
                <span className="text-white font-mono bg-indigo-900/60 px-1.5 py-0.5 rounded">
                  {correction.pronunciationGuide.problemWord}
                </span>
              )}
            </span>
            {correction.pronunciationGuide.ipa && (
              <span className="font-mono text-emerald-400 font-bold">
                {correction.pronunciationGuide.ipa}
              </span>
            )}
          </div>

          <p className="text-slate-300 leading-relaxed">
            <strong className="text-indigo-200">How to produce: </strong>
            {correction.pronunciationGuide.howToProduce}
          </p>

          {correction.pronunciationGuide.minimalPair && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="font-semibold text-slate-300">Contrast pair: </span>
              <span className="text-emerald-300 font-bold">
                {correction.pronunciationGuide.minimalPair}
              </span>
            </div>
          )}

          {/* Level 3 Drill Steps: Sound -> Word -> Short Phrase -> Sentence */}
          {correction.pronunciationGuide.drillSteps &&
            correction.pronunciationGuide.drillSteps.length > 0 && (
              <div className="mt-2 pt-2 border-t border-indigo-900/60 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Step-by-Step Sound Drill:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {correction.pronunciationGuide.drillSteps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => playDrillPart(step)}
                      className="p-1.5 rounded-lg bg-indigo-900/30 hover:bg-indigo-900/60 border border-indigo-700/40 text-left text-xs text-indigo-200 flex items-center justify-between transition-colors"
                    >
                      <span className="truncate">{step}</span>
                      <Volume2 className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* 5. Repeat Command & Action */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
            5. Repeat Now:
          </span>
          <p className="text-xs text-slate-200 font-medium">
            {correction.repeatPrompt || 'Now say the whole sentence again!'}
          </p>
        </div>

        {onRepeatClick && (
          <button
            onClick={() => onRepeatClick(correction.correctVersion)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isListening ? 'Listening...' : 'Repeat Sentence'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
