import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  Lightbulb,
  MessageCircle,
  HelpCircle,
  Stethoscope,
  Volume2,
  Smile,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import { ANIME_STUDY_GUIDES, AnimeGuide, CLINICAL_IMAGE_ASSETS } from '../data/animeGuidesData';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';

interface AnimeStudySquadProps {
  contextFilter?: 'ot' | 'quiz' | 'syllabus' | 'games' | 'general';
  compact?: boolean;
}

export const AnimeStudySquad: React.FC<AnimeStudySquadProps> = ({
  contextFilter = 'general',
  compact = false,
}) => {
  const { addXP } = useTheme();
  const [selectedGuide, setSelectedGuide] = useState<AnimeGuide>(ANIME_STUDY_GUIDES[0]);
  const [tipIndex, setTipIndex] = useState(0);

  const handleSelectGuide = (guide: AnimeGuide) => {
    audioSynth.playClick();
    setSelectedGuide(guide);
    setTipIndex(0);
    addXP(10);
  };

  const activeTip =
    selectedGuide.primaryTips.find((t) => t.context === contextFilter) ||
    selectedGuide.primaryTips[0];

  const handleNextTip = () => {
    audioSynth.playClick();
    setTipIndex((prev) => (prev + 1) % selectedGuide.primaryTips.length);
  };

  if (compact) {
    return (
      <div
        id="anime-study-companion-compact"
        className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-rose-50/90 to-amber-50/90 dark:from-slate-900/90 dark:via-slate-850/90 dark:to-slate-900/90 border border-teal-200/80 dark:border-teal-900/60 shadow-md backdrop-blur-md"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              Anime Clinical Study Squad
            </h4>
          </div>
          <div className="flex items-center gap-1.5">
            {ANIME_STUDY_GUIDES.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSelectGuide(g)}
                className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                  selectedGuide.id === g.id
                    ? 'border-teal-500 scale-110 shadow-md ring-2 ring-teal-400/30'
                    : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                }`}
                title={`${g.name} - ${g.role}`}
              >
                <img
                  src={g.avatar}
                  alt={g.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
          <img
            src={selectedGuide.avatar}
            alt={selectedGuide.name}
            className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-teal-500 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                {selectedGuide.name}
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-normal">
                  ({selectedGuide.role})
                </span>
              </span>
              <button
                onClick={handleNextTip}
                className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-0.5"
              >
                Next Tip <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic">
              "{activeTip?.dialogue}"
            </p>
            {activeTip?.mnemonic && (
              <div className="mt-1 px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold text-[10px] flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{activeTip.mnemonic}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="anime-study-squad-full" className="space-y-6">
      {/* Hero Banner with Doraemon, Nobita, Shizuka, Shinchan */}
      <div className="relative rounded-3xl overflow-hidden border border-teal-200 dark:border-teal-900 shadow-lg bg-slate-900">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src={CLINICAL_IMAGE_ASSETS.squadBanner}
            alt="Doraemon, Nobita, Shizuka, and Shinchan as Nursing Guides"
            className="w-full h-full object-cover object-center filter brightness-95 hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-500/80 backdrop-blur-md text-white border border-teal-400/40 uppercase tracking-wider inline-flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" /> Official Anime Mentorship Squad
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">
                Doraemon, Nobita, Shizuka & Shinchan Study Companions
              </h2>
              <p className="text-xs sm:text-sm text-teal-100 drop-shadow max-w-2xl mt-0.5">
                Your friendly hospital clinical guides providing high-yield mnemonics, sterile OT tips, exam motivation, and stress-busting clinical humor!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Character Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ANIME_STUDY_GUIDES.map((guide) => {
          const isSelected = selectedGuide.id === guide.id;
          return (
            <button
              key={guide.id}
              onClick={() => handleSelectGuide(guide)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-teal-50 to-white dark:from-slate-800 dark:to-slate-900 border-teal-500 shadow-lg ring-2 ring-teal-500/30 -translate-y-1'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md shrink-0">
                  <img
                    src={guide.avatar}
                    alt={guide.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isSelected && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-teal-500 ring-2 ring-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {guide.name}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${guide.badgeColor}`}>
                    {guide.role.split('&')[0]}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 mt-auto">
                "{guide.tagline}"
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Guide Interactive Guidance Station */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedGuide.avatar}
              alt={selectedGuide.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedGuide.name}’s Clinical Ward Station
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedGuide.badgeColor}`}>
                  {selectedGuide.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedGuide.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioSynth.playSuccessChime();
              addXP(15);
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            Cheer Up & Add 15 XP
          </button>
        </div>

        {/* Guide's Clinical Wisdom & Mnemonics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedGuide.primaryTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  {tip.context.toUpperCase()} CLINICAL FOCUS
                </span>
                <span className="text-[11px] text-slate-400">Card #{idx + 1}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                "{tip.dialogue}"
              </p>

              {tip.mnemonic && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong className="font-bold">Mnemonic / Formula:</strong> {tip.mnemonic}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
