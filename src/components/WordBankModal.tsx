import React, { useState } from 'react';
import { X, Volume2, Trash2, BookmarkCheck, Sparkles, ArrowLeft, Home } from 'lucide-react';
import { audioService } from '../utils/audio';

export interface SavedWord {
  id: string;
  word: string;
  ipa: string;
  mouthTip: string;
  timestamp: number;
}

interface WordBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  savedWords: SavedWord[];
  onRemoveWord: (id: string) => void;
}

export const WordBankModal: React.FC<WordBankModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  savedWords,
  onRemoveWord,
}) => {
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const filtered = savedWords.filter(
    (w) =>
      w.word.toLowerCase().includes(filterText.toLowerCase()) ||
      w.mouthTip.toLowerCase().includes(filterText.toLowerCase())
  );

  const playWord = async (word: string) => {
    await audioService.playCoachSpeech(word, { speed: 'slow', voice: 'Kore' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-slate-100 tracking-tight">Saved Practice Words</h2>
              <p className="text-xs text-slate-400 font-sans">
                Your personal vocabulary & pronunciation drill notebook ({savedWords.length} words)
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

        {/* Filter input */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/40">
          <input
            type="text"
            placeholder="Search saved words or sound tips..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Word List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">No saved practice words yet.</p>
              <p className="text-xs">
                Words with tricky pronunciation can be saved directly from correction cards and end-of-session reports!
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{item.word}</span>
                    <span className="font-mono text-emerald-400 font-semibold">{item.ipa}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.mouthTip}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => playWord(item.word)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveWord(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
