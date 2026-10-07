import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Filter,
  Trophy,
  Flame,
  ChevronRight,
  BookMarked,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';
import { COMPREHENSIVE_QUIZ_BANK } from '../data/quizBank';
import { generateQuizWithGemini } from '../services/geminiService';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';
import { AnimeStudySquad } from './AnimeStudySquad';

export const QuizArena: React.FC = () => {
  const { addXP } = useTheme();

  const [questions, setQuestions] = useState<QuizQuestion[]>(COMPREHENSIVE_QUIZ_BANK);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showRationale, setShowRationale] = useState(false);

  // Dynamic AI Question Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSubject, setGenSubject] = useState('Midwifery and Obstetrical Nursing - II (DC Dutta)');
  const [genTopic, setGenTopic] = useState('Active Management of Third Stage of Labor (AMTSL) & PPH');
  const [genDifficulty, setGenDifficulty] = useState<'Medium' | 'Hard' | 'NCLEX'>('NCLEX');

  const currentQ: QuizQuestion | undefined = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedAnswerIdx !== null || !currentQ) return;
    setSelectedAnswerIdx(idx);
    setShowRationale(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      audioSynth.playSuccessChime();
      setScore((prev) => prev + 100 + streak * 20);
      setStreak((prev) => prev + 1);
      addXP(25);
    } else {
      audioSynth.playErrorBuzz();
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedAnswerIdx(null);
    setShowRationale(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswerIdx(null);
    setShowRationale(false);
    setScore(0);
    setStreak(0);
  };

  const handleGenerateFreshQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const freshQuestions = await generateQuizWithGemini(genSubject, genTopic, 5, genDifficulty);
      if (freshQuestions && freshQuestions.length > 0) {
        setQuestions(freshQuestions);
        setCurrentIdx(0);
        setSelectedAnswerIdx(null);
        setShowRationale(false);
        addXP(30);
        audioSynth.playSuccessChime();
      }
    } catch (err) {
      console.error(err);
      audioSynth.playErrorBuzz();
    } finally {
      setIsGenerating(false);
    }
  };

  const isComplete = currentIdx >= questions.length - 1 && selectedAnswerIdx !== null;

  return (
    <div id="quiz-arena-container" className="space-y-6">
      {/* Header & Dynamic Generator */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            Dynamic Clinical Vignette & NCLEX/NORCET Arena
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Book-aligned clinical scenarios with rationales, citations, and instant AI question generation
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-amber-500 font-bold">
            <Trophy className="w-4 h-4" /> Score: {score}
          </span>
          <span className="flex items-center gap-1.5 text-orange-500 font-bold">
            <Flame className="w-4 h-4" /> Streak: {streak}x
          </span>
        </div>
      </div>

      {/* AI Dynamic Question Generator Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Generate Brand New Questions from Textbook Content (Always Fresh)
          </h3>
        </div>

        <form onSubmit={handleGenerateFreshQuestions} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <select
              value={genSubject}
              onChange={(e) => setGenSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="Midwifery and Obstetrical Nursing - II (DC Dutta)">Midwifery / OBG-II (DC Dutta)</option>
              <option value="Child Health Nursing - II (Ghai Pediatrics)">Child Health-II (Ghai Pediatrics)</option>
              <option value="Community Health Nursing - II (Park PSM)">Community Health-II (Park PSM)</option>
              <option value="Nursing Research and Statistics (Polit & Beck)">Research & Stats (Polit & Beck)</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <input
              type="text"
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              placeholder="e.g. Magnesium Sulfate Pritchard Regimen, IMNCI, PICO..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              value={genDifficulty}
              onChange={(e) => setGenDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="NCLEX">NCLEX-RN</option>
              <option value="Hard">Hard / NORCET</option>
              <option value="Medium">Standard</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isGenerating || !genTopic.trim()}
              className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              {isGenerating ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate 5 New</span>
            </button>
          </div>
        </form>
      </div>

      {/* Anime Study Squad Mentors Guidance */}
      <AnimeStudySquad compact contextFilter="quiz" />

      {/* Main Question Card */}
      {currentQ && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Progress Bar & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {currentQ.difficulty || 'NCLEX'}
              </span>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Topic: <span className="text-slate-800 dark:text-slate-200 font-semibold">{currentQ.topic}</span>
            </span>
          </div>

          {/* Vignette Text */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswerIdx === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let choiceStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:bg-slate-50 text-slate-800 dark:text-slate-200';

              if (selectedAnswerIdx !== null) {
                if (isCorrect) {
                  choiceStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold ring-2 ring-emerald-500/20';
                } else if (isSelected) {
                  choiceStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-100 font-semibold ring-2 ring-rose-500/20';
                } else {
                  choiceStyle = 'opacity-50 border-slate-200 dark:border-slate-700';
                }
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={idx}
                  disabled={selectedAnswerIdx !== null}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 disabled:cursor-default ${choiceStyle}`}
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {letters[idx]}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>

                  {selectedAnswerIdx !== null && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {selectedAnswerIdx !== null && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Clinical Rationale & Reference Box */}
          <AnimatePresence>
            {showRationale && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  <BookMarked className="w-4 h-4" />
                  Clinical Rationale & Evidence
                </div>

                <p className="text-xs sm:text-sm text-teal-950 dark:text-teal-100 leading-relaxed">
                  {currentQ.rationale}
                </p>

                {currentQ.clinicalTip && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">Bedside Clinical Pearl:</strong> {currentQ.clinicalTip}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Reference Citation: {currentQ.reference}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              onClick={handleRestart}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Quiz
            </button>

            {selectedAnswerIdx !== null && (
              <button
                id="btn-next-quiz-q"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <span>{currentIdx + 1 < questions.length ? 'Next Clinical Question' : 'View Results'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
