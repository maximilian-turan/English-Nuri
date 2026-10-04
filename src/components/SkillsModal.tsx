import React from 'react';
import { X, Check, Award, BookOpen, Ear, Mic, Volume2, Sparkles, SpellCheck, ArrowLeft, Home } from 'lucide-react';
import { CEFRLevel, LearnerProfile } from '../types';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  profile: LearnerProfile;
  onUpdateProfile: (profile: LearnerProfile) => void;
}

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

const SKILL_CONFIG = [
  {
    key: 'speaking' as const,
    label: 'Speaking (Fluency & Production)',
    icon: Mic,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    description: 'Ability to answer questions verbally, formulate sentences without long pauses, and express ideas.',
    defaultTarget: 'A1 - Beginner (Target of this practice)',
  },
  {
    key: 'pronunciation' as const,
    label: 'Pronunciation & Phonetics',
    icon: Volume2,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Mastery of English sounds (TH, R, W/V, vowels), word stress, and past-tense endings.',
    defaultTarget: 'A1 - Priority focus area',
  },
  {
    key: 'listening' as const,
    label: 'Listening Comprehension',
    icon: Ear,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    description: 'Understanding spoken questions at conversational speed without needing repetition.',
    defaultTarget: 'A2 - Elementary',
  },
  {
    key: 'grammar' as const,
    label: 'Spoken Grammar',
    icon: SpellCheck,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    description: 'Correct tenses (past/present/future), word order, prepositions, and natural sentence structures.',
    defaultTarget: 'A2 - Elementary',
  },
  {
    key: 'vocabulary' as const,
    label: 'Active Vocabulary',
    icon: Sparkles,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Variety and precision of words used when speaking about daily routines, work, and topics.',
    defaultTarget: 'B1 - Intermediate',
  },
  {
    key: 'reading' as const,
    label: 'Reading & Comprehension',
    icon: BookOpen,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    description: 'Reading written text, articles, and instructions (typically stronger than speaking).',
    defaultTarget: 'B1 - Intermediate (Estimated Baseline)',
  },
];

export const SkillsModal: React.FC<SkillsModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  profile,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const handleLevelChange = (skillKey: keyof LearnerProfile, newLevel: CEFRLevel) => {
    onUpdateProfile({
      ...profile,
      [skillKey]: newLevel,
    });
  };

  const resetToDiagnosticDefault = () => {
    onUpdateProfile({
      reading: 'B1',
      listening: 'A2',
      speaking: 'A1',
      pronunciation: 'A1',
      vocabulary: 'B1',
      grammar: 'A2',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-slate-100 tracking-tight">Learner Skill Matrix</h2>
              <p className="text-xs text-slate-400 font-sans">
                Skills are evaluated and tracked independently across CEFR A1 to C1
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 leading-relaxed">
            <span className="font-semibold text-indigo-300">Learner Profile Note:</span> You understand written English around <strong className="text-white">B1 level</strong>, while speaking and pronunciation are close to beginner (<strong className="text-white">A1</strong>). The coach automatically tailors practice to address this exact gap!
          </div>

          <div className="space-y-3.5">
            {SKILL_CONFIG.map((skill) => {
              const Icon = skill.icon;
              const currentLvl = profile[skill.key];
              const currentIndex = CEFR_ORDER.indexOf(currentLvl);

              return (
                <div
                  key={skill.key}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${skill.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{skill.label}</h3>
                        <p className="text-xs text-slate-400">{skill.description}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-700 text-emerald-400 border border-slate-600">
                      {currentLvl}
                    </span>
                  </div>

                  {/* Level Selection Pills */}
                  <div className="grid grid-cols-5 gap-1.5 mt-3">
                    {CEFR_ORDER.map((lvl, idx) => {
                      const isSelected = currentLvl === lvl;
                      const isLower = idx < currentIndex;
                      return (
                        <button
                          key={lvl}
                          onClick={() => handleLevelChange(skill.key, lvl)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                              : isLower
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <span>{lvl}</span>
                          <span className="text-[10px] font-normal opacity-80">
                            {lvl === 'A1'
                              ? 'Beginner'
                              : lvl === 'A2'
                              ? 'Elem'
                              : lvl === 'B1'
                              ? 'Inter'
                              : lvl === 'B2'
                              ? 'Upper'
                              : 'Adv'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
          <button
            onClick={resetToDiagnosticDefault}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            Reset to default B1 reading / A1 speaking profile
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Save & Continue Practice
          </button>
        </div>
      </div>
    </div>
  );
};
