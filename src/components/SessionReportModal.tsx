import React, { useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  Award,
  Sparkles,
  BookmarkPlus,
  ArrowRight,
  ArrowLeft,
  Home,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  PieChart,
} from 'lucide-react';
import { SessionReportData, CEFRLevel } from '../types';
import { audioService } from '../utils/audio';

interface SessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  report: SessionReportData | null;
  isLoading: boolean;
  onStartNextTopic: (level: CEFRLevel, topic: string) => void;
  onSaveWordToBank: (word: string, ipa: string, tip: string) => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  report,
  isLoading,
  onStartNextTopic,
  onSaveWordToBank,
}) => {
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleSaveWord = (word: string, ipa: string, tip: string) => {
    onSaveWordToBank(word, ipa, tip);
    setSavedWords((prev) => new Set(prev).add(word));
  };

  const playSentenceAudio = async (text: string) => {
    await audioService.playCoachSpeech(text, { speed: 'slow', voice: 'Kore' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-indigo-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">End-of-Session Performance Report</h2>
              <p className="text-xs text-slate-400">
                Independent skill evaluation, pronunciation error diagnosis & targeted drills
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

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Evaluating Your Session...</h3>
              <p className="text-xs text-slate-400">
                Analyzing pronunciation mechanics, grammar accuracy, speaking ratio, and fluency.
              </p>
            </div>
          </div>
        ) : report ? (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Speaking Ratio & Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Coach Assessment
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {report.performanceSummary}
                </p>
              </div>

              {/* Speaking Ratio Badge */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0 text-center sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Speaking Ratio
                </span>
                <div className="text-sm font-bold text-white">
                  Learner: <span className="text-emerald-400">{report.speakingRatioEstimate.learnerPercentage}%</span>
                </div>
                <div className="text-xs text-slate-400">
                  Coach: {report.speakingRatioEstimate.coachPercentage}%
                </div>
              </div>
            </div>

            {/* 1. Speaking Performance Grid (A1-C1 per skill) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>1. Speaking Performance (CEFR Breakdown)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { label: 'Pronunciation', value: report.speakingPerformance.pronunciation, color: 'text-emerald-400' },
                  { label: 'Grammar', value: report.speakingPerformance.grammar, color: 'text-violet-400' },
                  { label: 'Vocabulary', value: report.speakingPerformance.vocabulary, color: 'text-amber-400' },
                  { label: 'Fluency', value: report.speakingPerformance.fluency, color: 'text-indigo-400' },
                  { label: 'Listening', value: report.speakingPerformance.listening, color: 'text-sky-400' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center space-y-1"
                  >
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {item.label}
                    </span>
                    <div className={`text-xl font-black font-mono ${item.color}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Main Pronunciation Problems */}
            {report.mainPronunciationProblems && report.mainPronunciationProblems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>2. Main Pronunciation Problems (Top Focus)</span>
                </h3>

                <div className="space-y-2.5">
                  {report.mainPronunciationProblems.map((prob, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-400 bg-rose-900/40 px-2 py-0.5 rounded border border-rose-800/50">
                          {prob.sound}
                        </span>
                        <span className="font-semibold text-slate-200">{prob.description}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pt-1">
                        <strong className="text-emerald-400">How to fix: </strong>
                        {prob.howToFix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Words to Practice */}
            {report.wordsToPractice && report.wordsToPractice.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>3. Words to Practice (Up to 5 Words)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {report.wordsToPractice.map((w, idx) => {
                    const isSaved = savedWords.has(w.word);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{w.word}</span>
                            <span className="font-mono text-emerald-400 font-semibold">{w.ipa}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{w.mouthTip}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => playSentenceAudio(w.word)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Listen"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSaveWord(w.word, w.ipa, w.mouthTip)}
                            disabled={isSaved}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSaved
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-700'
                            }`}
                            title={isSaved ? 'Saved in Word Bank' : 'Save to Word Bank'}
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Sentences to Repeat */}
            {report.sentencesToRepeat && report.sentencesToRepeat.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" />
                  <span>4. Sentences to Repeat (Practice Rhythm & Intonation)</span>
                </h3>

                <div className="space-y-2">
                  {report.sentencesToRepeat.map((sent, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="font-medium text-slate-200 italic">"{sent}"</span>
                      <button
                        onClick={() => playSentenceAudio(sent)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Next Recommendation */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4" />
                  <span>5. Coach Next Recommendation</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-indigo-600 text-white">
                  Target Level: {report.nextRecommendation.recommendedLevel}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  Recommended Topic: {report.nextRecommendation.recommendedTopic}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {report.nextRecommendation.rationale}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() =>
                    onStartNextTopic(
                      report.nextRecommendation.recommendedLevel,
                      report.nextRecommendation.recommendedTopic
                    )
                  }
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Start Recommended Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">
            No report available yet. Have a short conversation first!
          </div>
        )}
      </div>
    </div>
  );
};
