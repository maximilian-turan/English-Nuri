import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Clock,
  Sparkles,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ArrowLeft,
  Home,
  X,
} from 'lucide-react';
import { audioService } from '../utils/audio';

interface FinalSpeakingChallengeProps {
  topic: string;
  level: string;
  onComplete: (spokenText: string) => void;
  onCancel: () => void;
  onGoHome?: () => void;
}

export const FinalSpeakingChallenge: React.FC<FinalSpeakingChallengeProps> = ({
  topic,
  level,
  onComplete,
  onCancel,
  onGoHome,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      handleFinish();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft]);

  const handleStartSpeaking = () => {
    setHasStarted(true);
    setIsActive(true);
    setTranscript('');
    setSecondsLeft(60);

    audioService.startListening(
      (text, isFinal) => {
        setTranscript((prev) => {
          if (isFinal) {
            return prev ? `${prev} ${text}` : text;
          }
          return prev;
        });
      },
      (error) => {
        console.warn('Speech error in challenge:', error);
      }
    );
  };

  const handleFinish = () => {
    setIsActive(false);
    audioService.stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    onComplete(transcript || 'I spoke about the topic.');
  };

  const elapsedSeconds = 60 - secondsLeft;
  const progressPercent = (elapsedSeconds / 60) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center relative">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Zurück zum Coach"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>Zurück</span>
            </button>
            <button
              onClick={onGoHome || onCancel}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Zurück zur Startseite"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage 6: Final Speaking Challenge</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Speak for 30–60 Seconds
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Topic: <strong className="text-indigo-400 font-semibold">{topic}</strong> ({level})
          </p>
        </div>

        {/* Guidance Prompt */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left text-xs space-y-2">
          <span className="font-bold text-slate-200 block">💡 Tips for your monologue:</span>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>Start with a simple opening: "Today I want to share my thoughts on {topic}..."</li>
            <li>Give 2 or 3 reasons, personal examples, or memories.</li>
            <li>Don't worry about minor mistakes—focus on speaking continuously!</li>
            <li>Aim for at least 30 seconds of continuous speech.</li>
          </ul>
        </div>

        {/* Circular / Progress Timer */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Background ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="62"
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                className={`transition-all duration-1000 ${
                  elapsedSeconds >= 30 ? 'text-emerald-500' : 'text-indigo-500'
                }`}
                strokeWidth="8"
                strokeDasharray={389.5}
                strokeDashoffset={389.5 - (389.5 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black font-mono text-white">
                {secondsLeft}s
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {elapsedSeconds >= 30 ? 'Target Reached!' : 'Remaining'}
              </span>
            </div>
          </div>

          {elapsedSeconds >= 30 && (
            <div className="mt-3 text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Great job! You passed the 30-second speaking target!</span>
            </div>
          )}
        </div>

        {/* Live Transcript Box */}
        {hasStarted && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-left text-xs max-h-24 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Live Speech Transcript:
            </span>
            <p className="text-slate-200 italic leading-relaxed">
              {transcript || (isActive ? 'Listening to your speech...' : 'No speech recorded yet.')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {!isActive ? (
            <button
              onClick={handleStartSpeaking}
              className="px-6 py-3 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Mic className="w-5 h-5" />
              <span>{hasStarted ? 'Restart 60s Challenge' : 'Start Speaking Now'}</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-3 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Finish & Get Coach Evaluation</span>
            </button>
          )}

          <button
            onClick={onCancel}
            className="px-4 py-3 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
