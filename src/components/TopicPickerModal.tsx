import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Check, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { TOPICS_DATA } from '../data/topics';
import { CEFRLevel, TopicItem } from '../types';

interface TopicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  currentLevel: CEFRLevel;
  currentTopic: string;
  onSelectTopic: (topic: TopicItem) => void;
}

export const TopicPickerModal: React.FC<TopicPickerModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  currentLevel,
  currentTopic,
  onSelectTopic,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(currentLevel);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTopics = TOPICS_DATA.filter((t) => {
    const matchesLevel = t.level === selectedLevel;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-slate-100 tracking-tight">Conversation Topics Library</h2>
              <p className="text-xs text-slate-400 font-sans">
                Choose from structured topic modules tailored from beginner A1 to advanced C1
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

        {/* Level Filter Tabs */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {lvl} {lvl === 'A1' ? 'Beginner' : lvl === 'B1' ? 'Intermediate' : lvl === 'C1' ? 'Advanced' : ''}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Topics Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {filteredTopics.map((item) => {
            const isSelected = item.title === currentTopic;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectTopic(item);
                  onClose();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold font-mono text-indigo-400">{item.level}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="text-slate-400 italic text-[11px] truncate max-w-[200px]">
                    "{item.starterQuestion}"
                  </span>
                  <span className="text-indigo-400 font-semibold flex items-center gap-1 shrink-0">
                    Practice <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
