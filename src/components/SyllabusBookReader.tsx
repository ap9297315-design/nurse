import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Bookmark,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  HelpCircle,
  Activity,
  Layers,
  Award,
  ExternalLink,
  Pill,
  FileHeart,
} from 'lucide-react';
import { SYLLABUS_SUBJECTS, TEXTBOOK_CHAPTERS } from '../data/syllabusData';
import { SyllabusSubject, SyllabusUnit, TextbookChapter } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';
import { useOwner } from '../context/OwnerContext';
import { CLINICAL_IMAGE_ASSETS } from '../data/animeGuidesData';
import { AnimeStudySquad } from './AnimeStudySquad';

interface SyllabusBookReaderProps {
  onStartQuizForTopic?: (subjectName: string, topicName: string) => void;
  onAskAiPreceptor?: (query: string) => void;
  initialSubjectId?: string;
  initialChapterId?: string;
}

export const SyllabusBookReader: React.FC<SyllabusBookReaderProps> = ({
  onStartQuizForTopic,
  onAskAiPreceptor,
  initialSubjectId,
  initialChapterId,
}) => {
  const { addXP } = useTheme();
  const { subjects, chapters } = useOwner();

  const activeSubjects = subjects && subjects.length > 0 ? subjects : SYLLABUS_SUBJECTS;
  const activeChapters = chapters && chapters.length > 0 ? chapters : TEXTBOOK_CHAPTERS;

  const [selectedSubject, setSelectedSubject] = useState<SyllabusSubject>(() => {
    if (initialSubjectId) {
      const match = activeSubjects.find((s) => s.id === initialSubjectId);
      if (match) return match;
    }
    return activeSubjects[0];
  });

  const [expandedUnitId, setExpandedUnitId] = useState<string>(
    activeSubjects[0]?.units[0]?.id || ''
  );

  // Filter chapters belonging to the currently selected subject
  const subjectChapters = activeChapters.filter((ch) => ch.subjectId === selectedSubject.id);
  const [selectedChapter, setSelectedChapter] = useState<TextbookChapter | null>(() => {
    if (initialChapterId) {
      const match = activeChapters.find((c) => c.id === initialChapterId);
      if (match) return match;
    }
    return subjectChapters[0] || activeChapters[0] || null;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubjectChange = (subject: SyllabusSubject) => {
    audioSynth.playClick();
    setSelectedSubject(subject);
    setExpandedUnitId(subject.units[0]?.id || '');
    const firstCh = activeChapters.find((ch) => ch.subjectId === subject.id) || null;
    setSelectedChapter(firstCh);
  };

  const handleSelectChapter = (chapter: TextbookChapter) => {
    audioSynth.playClick();
    setSelectedChapter(chapter);
    addXP(15);
  };

  const filteredChapters = subjectChapters.filter(
    (ch) =>
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.authorReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="syllabus-book-reader-container" className="space-y-6">
      {/* Top Header & Subject Tabs */}
      <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              Syllabus & Clinical Textbook Library
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Indian Nursing Council (INC) syllabus aligned with DC Dutta, Ghai, Park, and Polit & Beck textbooks
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters, drugs, algorithms..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* 4 Primary Subjects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {SYLLABUS_SUBJECTS.map((sub) => {
            const isSelected = selectedSubject.id === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubjectChange(sub)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-teal-100' : 'text-teal-600 dark:text-teal-400'}`}>
                    {sub.code}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                    {sub.credits.theory}T / {sub.credits.clinical || 0}C Credits
                  </span>
                </div>
                <h4 className="text-xs font-bold leading-snug line-clamp-1">{sub.title}</h4>
                <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                  {sub.textbooks[0]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anime Study Squad Mentors Guidance */}
      <AnimeStudySquad compact contextFilter="syllabus" />

      {/* Main Content Layout: Left Unit Explorer (5 cols), Right Detailed Textbook Content (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Units & Textbook Chapters List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Syllabus Unit Accordions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                INC Prescribed Units
              </h3>
              <span className="text-[11px] text-slate-400">
                {selectedSubject.units.length} Modules
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedSubject.units.map((unit) => {
                const isExpanded = expandedUnitId === unit.id;
                return (
                  <div
                    key={unit.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-850/50"
                  >
                    <button
                      onClick={() => setExpandedUnitId(isExpanded ? '' : unit.id)}
                      className="w-full p-3 text-left flex items-center justify-between gap-2 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                            {unit.unitNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {unit.theoryHours}h Theory • {unit.practicalHours || 0}h Practical
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {unit.title}
                        </h4>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                        >
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Content Outline:
                          </span>
                          <ul className="space-y-1">
                            {unit.contentOutline.map((t, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>

                          {unit.learningOutcomes && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">
                                Learning Outcomes:
                              </span>
                              <div className="space-y-1">
                                {unit.learningOutcomes.map((lo, lIdx) => (
                                  <div
                                    key={lIdx}
                                    className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-teal-500 shrink-0" />
                                    <span>{lo}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Textbook Chapters List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-teal-600" />
                Textbook Chapter Readings
              </h3>
              <span className="text-[11px] text-slate-400">
                {filteredChapters.length} Available
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredChapters.map((ch) => {
                const isSelected = selectedChapter?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-sm text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {ch.authorReference}
                      </span>
                      <h4 className="text-xs font-bold leading-snug">{ch.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{ch.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Textbook Reader Detail */}
        <div className="lg:col-span-7 space-y-4">
          {selectedChapter ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              {/* Chapter Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
                  <span>{selectedChapter.authorReference}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedChapter.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedChapter.subtitle}
                </p>
              </div>

              {/* Definition */}
              <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider block mb-1">
                  Clinical Definition:
                </span>
                <p className="text-xs sm:text-sm text-teal-950 dark:text-teal-100 leading-relaxed font-medium">
                  {selectedChapter.definition}
                </p>
              </div>

              {/* High Quality Topic Anatomy / Clinical Diagram */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 h-44 sm:h-52">
                <img
                  src={
                    selectedChapter.id.includes('pph') || selectedChapter.title.toLowerCase().includes('hemorrhage') || selectedChapter.title.toLowerCase().includes('labor')
                      ? CLINICAL_IMAGE_ASSETS.pphDiagram
                      : selectedChapter.id.includes('lscs') || selectedChapter.title.toLowerCase().includes('operative')
                      ? CLINICAL_IMAGE_ASSETS.virtualOtSuite
                      : selectedChapter.subjectId === 'sub-child' || selectedChapter.title.toLowerCase().includes('resuscitation')
                      ? CLINICAL_IMAGE_ASSETS.neonatalCareNrp
                      : CLINICAL_IMAGE_ASSETS.squadBanner
                  }
                  alt={selectedChapter.title}
                  className="w-full h-full object-cover filter brightness-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold drop-shadow">
                    Textbook Visual Plate: {selectedChapter.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 backdrop-blur border border-white/20">
                    High Resolution Medical Atlas
                  </span>
                </div>
              </div>

              {/* Pathophysiology & Etiology */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Etiology & Disease Mechanisms:
                </span>
                <ul className="space-y-1.5">
                  {selectedChapter.etiologyAndRiskFactors.map((et, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                      <span>{et}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Emergency Drugs Section */}
              {selectedChapter.emergencyDrugs && selectedChapter.emergencyDrugs.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-rose-600" />
                    Essential Emergency Medications & Dosage:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedChapter.emergencyDrugs.map((drug, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="font-bold text-slate-900 dark:text-white">{drug.name}</strong>
                          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                            {drug.dose} ({drug.route})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          {drug.action}
                        </p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                          Alert: {drug.criticalPrecautions}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nursing Care Plan (NANDA) */}
              {selectedChapter.nursingCarePlan && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileHeart className="w-4 h-4 text-teal-600" />
                    Nursing Care Plan: {selectedChapter.nursingCarePlan.nursingDiagnosis}
                  </span>
                  <div className="space-y-2">
                    {selectedChapter.nursingCarePlan.interventions.map((inv, iIdx) => (
                      <div
                        key={iIdx}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2"
                      >
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 shrink-0">
                          {inv.priority}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{inv.action}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Rationale: {inv.rationale}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Pearls & High-Yield Points */}
              {selectedChapter.clinicalPearls && selectedChapter.clinicalPearls.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/40 space-y-2">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Bedside Clinical Pearls & Exam High-Yield Points:
                  </span>
                  <ul className="space-y-1.5">
                    {selectedChapter.clinicalPearls.map((cp, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-amber-950 dark:text-amber-100 flex items-start gap-2 leading-relaxed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{cp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Actions for this Chapter */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onStartQuizForTopic?.(selectedSubject.title, selectedChapter.title)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <HelpCircle className="w-4 h-4" />
                  Practice Quiz on this Chapter
                </button>

                <button
                  onClick={() =>
                    onAskAiPreceptor?.(
                      `Explain clinical guidelines, drug doses and viva questions for: ${selectedChapter.title} (${selectedChapter.authorReference})`
                    )
                  }
                  className="px-4 py-2 rounded-xl border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask AI Preceptor about this Chapter
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Select a chapter from the left to begin reading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
