import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  BookOpen,
  FileText,
  Activity,
  ArrowRight,
  HelpCircle,
  Pill,
} from 'lucide-react';
import { useOwner } from '../context/OwnerContext';
import { ActiveTab } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab, contextId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { subjects, chapters, procedures } = useOwner();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedSubjects = q
    ? subjects.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      )
    : subjects.slice(0, 3);

  const matchedChapters = q
    ? chapters.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          c.definition.toLowerCase().includes(q) ||
          c.pathophysiology.toLowerCase().includes(q)
      )
    : chapters.slice(0, 3);

  const matchedProcedures = q
    ? procedures.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.indication.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : procedures.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nursing subjects, chapters, PPH, NRP, eclampsia, OT steps..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Textbook Chapters */}
          {matchedChapters.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Textbook Chapters & Clinical Modules
              </span>
              <div className="space-y-1">
                {matchedChapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      onNavigate('textbook', ch.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition">
                          {ch.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{ch.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Virtual OT Procedures */}
          {matchedProcedures.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Virtual OT Simulation Procedures
              </span>
              <div className="space-y-1">
                {matchedProcedures.map((proc) => (
                  <button
                    key={proc.id}
                    onClick={() => {
                      onNavigate('virtual-ot', proc.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                          {proc.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{proc.indication}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {proc.steps.length} Steps
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus Subjects */}
          {matchedSubjects.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Curriculum Subjects
              </span>
              <div className="space-y-1">
                {matchedSubjects.map((subj) => (
                  <button
                    key={subj.id}
                    onClick={() => {
                      onNavigate('syllabus', subj.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                          {subj.code}: {subj.title}
                        </h5>
                        <p className="text-[11px] text-slate-500">{subj.semester}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedChapters.length === 0 && matchedProcedures.length === 0 && matchedSubjects.length === 0 && (
            <div className="text-center py-8 text-slate-400 space-y-1">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs">No clinical topics found matching "{query}"</p>
              <p className="text-[11px] text-slate-500">Try searching for "PPH", "Labor", "OT", or "Pediatrics"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Indian Nursing Council (INC) Clinical Search</span>
          <span>Press ESC to close</span>
        </div>
      </motion.div>
    </div>
  );
};
