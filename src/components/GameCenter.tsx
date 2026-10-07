import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  Activity,
  Droplets,
  HeartPulse,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';
import { AnimeStudySquad } from './AnimeStudySquad';

interface TriageCase {
  id: string;
  scenario: string;
  respirations: string;
  perfusion: string;
  mentalStatus: string;
  correctTag: 'red' | 'yellow' | 'green' | 'black';
  rationale: string;
}

interface DoseQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface WasteItem {
  id: string;
  name: string;
  category: string;
  correctBin: 'yellow' | 'red' | 'white' | 'blue';
  explanation: string;
}

const TRIAGE_CASES: TriageCase[] = [
  {
    id: 't1',
    scenario: '24-year-old victim of bus collision. Compound femur fracture, crying in pain. Respirations 22/min, radial pulse palpable (88 bpm), obeys commands.',
    respirations: '22 breaths/min',
    perfusion: 'Radial pulse present, Cap refill 1.5s',
    mentalStatus: 'Alert, obeys simple commands',
    correctTag: 'yellow',
    rationale: 'Breathing is normal (<30), perfusion is intact, and patient obeys commands, but has severe injuries requiring urgent hospital treatment (Priority 2 - Delayed / Yellow).',
  },
  {
    id: 't2',
    scenario: '40-year-old female trapped in collapsed building. Unconscious with severe stridor. Respirations 36/min, weak thready radial pulse.',
    respirations: '36 breaths/min (Tachypneic > 30)',
    perfusion: 'Capillary refill 3.5 seconds',
    mentalStatus: 'Unresponsive to verbal commands',
    correctTag: 'red',
    rationale: 'Respirations > 30/min, capillary refill > 2 sec, and unconsciousness meet criteria for Immediate Life-Threatening Priority 1 (RED).',
  },
  {
    id: 't3',
    scenario: '19-year-old walking around disaster scene holding a bleeding laceration on forearm. Oriented and answering questions.',
    respirations: '18 breaths/min',
    perfusion: 'Radial pulse strong, Cap refill 1s',
    mentalStatus: 'Fully alert and oriented',
    correctTag: 'green',
    rationale: 'All walking wounded who can ambulate independently are initially categorized as GREEN (Minor / Priority 3).',
  },
  {
    id: 't4',
    scenario: '55-year-old male with massive open head trauma and brain tissue evisceration. Apneic. Airway repositioned; still no spontaneous breathing.',
    respirations: 'Apneic (0/min) after head tilt',
    perfusion: 'No carotid pulse',
    mentalStatus: 'Flaccid, fixed dilated pupils',
    correctTag: 'black',
    rationale: 'If patient does not breathe spontaneously even after opening airway, classify as Expectant / Deceased (BLACK).',
  },
  {
    id: 't5',
    scenario: '32-year-old pregnant mother in active disaster. Bleeding heavily from pelvic trauma. Respirations 28/min, absent radial pulse, HR 135 bpm.',
    respirations: '28 breaths/min',
    perfusion: 'Absent radial pulse, Cap refill > 3s',
    mentalStatus: 'Confused, anxious',
    correctTag: 'red',
    rationale: 'Absent radial pulse with hemodynamic instability mandates Immediate Priority 1 (RED) tag.',
  },
];

const DOSE_QUESTIONS: DoseQuestion[] = [
  {
    id: 'd1',
    prompt: 'Infuse 1000 mL Normal Saline over 8 hours using a standard macro-drip IV infusion set with drop factor of 15 drops/mL. What is the correct drip rate in drops/minute?',
    options: ['31 drops/min', '42 drops/min', '21 drops/min', '50 drops/min'],
    correctIndex: 0,
    explanation: 'Formula: (Volume in mL × Drop Factor) / (Time in hours × 60) = (1000 × 15) / (8 × 60) = 15,000 / 480 ≈ 31.25 -> 31 drops/minute.',
  },
  {
    id: 'd2',
    prompt: 'A pediatric patient weighing 12 kg is prescribed IV Paracetamol at 15 mg/kg per dose. The vial concentration is 10 mg/mL. How many mL should the nurse draw up?',
    options: ['18 mL (180 mg)', '12 mL (120 mg)', '24 mL (240 mg)', '15 mL (150 mg)'],
    correctIndex: 0,
    explanation: 'Total dose = 12 kg × 15 mg/kg = 180 mg. Volume = 180 mg / 10 mg/mL = 18 mL.',
  },
  {
    id: 'd3',
    prompt: 'Administer 500 mL D5W over 6 hours using a micro-drip pediatric set (drop factor = 60 drops/mL). What is the drip rate in microdrops/minute?',
    options: ['83 microdrops/min', '60 microdrops/min', '45 microdrops/min', '100 microdrops/min'],
    correctIndex: 0,
    explanation: 'For microdrip (60 gtt/mL), drops/min equals mL/hour. 500 mL / 6 hours = 83.33 -> 83 microdrops/min.',
  },
  {
    id: 'd4',
    prompt: 'A doctor prescribes Amoxicillin oral suspension 250 mg TID for a child. The pharmacy supplies 125 mg in 5 mL. How many mL should be administered per dose?',
    options: ['10 mL', '5 mL', '7.5 mL', '15 mL'],
    correctIndex: 0,
    explanation: 'Dose required / Stock on hand × Volume = (250 mg / 125 mg) × 5 mL = 2 × 5 = 10 mL.',
  },
];

const WASTE_ITEMS: WasteItem[] = [
  { id: 'w1', name: 'Human Placenta & Fetal Membranes', category: 'Obstetric Ward', correctBin: 'yellow', explanation: 'Human anatomical waste must be incinerated (Yellow bag).' },
  { id: 'w2', name: 'Used Disposable Plastic Syringe (Needle Removed)', category: 'Injection Room', correctBin: 'red', explanation: 'Recyclable contaminated plastic goes into RED bag for autoclaving and recycling.' },
  { id: 'w3', name: 'Used Scalpel Blade #10 and Syringe Needle', category: 'Operating Theatre', correctBin: 'white', explanation: 'Sharps and blades must be discarded into puncture-proof, tamper-proof WHITE container.' },
  { id: 'w4', name: 'Broken Glass Ampoule of Oxytocin', category: 'Labor Room', correctBin: 'blue', explanation: 'Contaminated glassware, medicine vials, and ampoules go into BLUE box/container.' },
  { id: 'w5', name: 'Gauze Swabs & Laparotomy Sponge soaked with Blood', category: 'OT & Ward', correctBin: 'yellow', explanation: 'Soiled cotton dressings soaked in blood or body fluids are incinerable (Yellow bag).' },
  { id: 'w6', name: 'Used Intravenous (IV) Tubing & Foley Urine Bag', category: 'ICU / Ward', correctBin: 'red', explanation: 'Plastic tubing, urine bags, and catheter plastic are classified under RED category.' },
];

export const GameCenter: React.FC = () => {
  const { addXP } = useTheme();
  const [activeGame, setActiveGame] = useState<'triage' | 'drip' | 'waste'>('triage');

  // Triage state
  const [triageIndex, setTriageIndex] = useState(0);
  const [triageScore, setTriageScore] = useState(0);
  const [triageStreak, setTriageStreak] = useState(0);
  const [triageFeedback, setTriageFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [triageGameOver, setTriageGameOver] = useState(false);

  // Drip state
  const [dripIndex, setDripIndex] = useState(0);
  const [dripScore, setDripScore] = useState(0);
  const [dripSelected, setDripSelected] = useState<number | null>(null);
  const [dripFeedback, setDripFeedback] = useState<string | null>(null);

  // Waste state
  const [wasteIndex, setWasteIndex] = useState(0);
  const [wasteScore, setWasteScore] = useState(0);
  const [wasteFeedback, setWasteFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Triage timer
  useEffect(() => {
    if (activeGame !== 'triage' || triageGameOver || triageFeedback) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          audioSynth.playErrorBuzz();
          handleTriageAnswer('black', true); // timeout
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, triageIndex, triageFeedback, triageGameOver]);

  const handleTriageAnswer = (tag: 'red' | 'yellow' | 'green' | 'black', isTimeout = false) => {
    const currentCase = TRIAGE_CASES[triageIndex];
    const isCorrect = !isTimeout && tag === currentCase.correctTag;

    if (isCorrect) {
      audioSynth.playSuccessChime();
      setTriageScore((prev) => prev + 100 + triageStreak * 25);
      setTriageStreak((prev) => prev + 1);
      addXP(30);
      setTriageFeedback({
        isCorrect: true,
        text: `Correct! ${currentCase.rationale}`,
      });
    } else {
      audioSynth.playErrorBuzz();
      setTriageStreak(0);
      setTriageFeedback({
        isCorrect: false,
        text: isTimeout
          ? `Time expired! Correct triage was ${currentCase.correctTag.toUpperCase()}: ${currentCase.rationale}`
          : `Incorrect! Correct triage was ${currentCase.correctTag.toUpperCase()}: ${currentCase.rationale}`,
      });
    }
  };

  const nextTriageCase = () => {
    setTriageFeedback(null);
    setTimeLeft(15);
    if (triageIndex + 1 < TRIAGE_CASES.length) {
      setTriageIndex((prev) => prev + 1);
    } else {
      setTriageGameOver(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleDripAnswer = (selectedIdx: number) => {
    if (dripSelected !== null) return;
    setDripSelected(selectedIdx);
    const q = DOSE_QUESTIONS[dripIndex];
    if (selectedIdx === q.correctIndex) {
      audioSynth.playSuccessChime();
      setDripScore((prev) => prev + 100);
      addXP(25);
      setDripFeedback(`Correct! ${q.explanation}`);
    } else {
      audioSynth.playErrorBuzz();
      setDripFeedback(`Incorrect. ${q.explanation}`);
    }
  };

  const nextDripQuestion = () => {
    setDripSelected(null);
    setDripFeedback(null);
    if (dripIndex + 1 < DOSE_QUESTIONS.length) {
      setDripIndex((prev) => prev + 1);
    } else {
      setDripIndex(0);
      confetti({ particleCount: 60, spread: 60 });
    }
  };

  const handleWasteSort = (chosenBin: 'yellow' | 'red' | 'white' | 'blue') => {
    const item = WASTE_ITEMS[wasteIndex];
    if (chosenBin === item.correctBin) {
      audioSynth.playSuccessChime();
      setWasteScore((prev) => prev + 50);
      addXP(20);
      setWasteFeedback({
        isCorrect: true,
        text: `Spot on! ${item.explanation}`,
      });
    } else {
      audioSynth.playErrorBuzz();
      setWasteFeedback({
        isCorrect: false,
        text: `Incorrect bin! ${item.name} belongs in ${item.correctBin.toUpperCase()} container. ${item.explanation}`,
      });
    }
  };

  const nextWasteItem = () => {
    setWasteFeedback(null);
    if (wasteIndex + 1 < WASTE_ITEMS.length) {
      setWasteIndex((prev) => prev + 1);
    } else {
      setWasteIndex(0);
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  return (
    <div id="game-center-container" className="space-y-6">
      {/* Top Game Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Clinical Gaming Arena
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gamified rapid triage drills, drip math sprints, and biomedical sorting challenges
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            id="tab-game-triage"
            onClick={() => setActiveGame('triage')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeGame === 'triage'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Rapid Triage Rush
          </button>
          <button
            id="tab-game-drip"
            onClick={() => setActiveGame('drip')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeGame === 'drip'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            IV Drip Sprint
          </button>
          <button
            id="tab-game-waste"
            onClick={() => setActiveGame('waste')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeGame === 'waste'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-emerald-500" />
            Waste Bin Blitz
          </button>
        </div>
      </div>

      {/* Anime Study Squad Mentors Guidance */}
      <AnimeStudySquad compact contextFilter="games" />

      {/* GAME 1: Rapid Triage Rush */}
      {activeGame === 'triage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Trophy className="w-4 h-4" /> Score: {triageScore}
              </span>
              <span className="flex items-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" /> Streak: {triageStreak}x
              </span>
              <span>Case {triageIndex + 1} of {TRIAGE_CASES.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              <div className="w-28 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${timeLeft > 6 ? 'bg-teal-500' : 'bg-red-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{timeLeft}s</span>
            </div>
          </div>

          {!triageGameOver ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Mass Casualty Case</span>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {TRIAGE_CASES[triageIndex].scenario}
                </p>
              </div>

              {/* Assessment Triad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase">Respirations</span>
                  <p className="text-sm font-semibold text-blue-950 dark:text-blue-100 mt-0.5">{TRIAGE_CASES[triageIndex].respirations}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Perfusion</span>
                  <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100 mt-0.5">{TRIAGE_CASES[triageIndex].perfusion}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40">
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase">Mental Status</span>
                  <p className="text-sm font-semibold text-purple-950 dark:text-purple-100 mt-0.5">{TRIAGE_CASES[triageIndex].mentalStatus}</p>
                </div>
              </div>

              {/* Triage Tag Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <button
                  id="btn-triage-red"
                  disabled={!!triageFeedback}
                  onClick={() => handleTriageAnswer('red')}
                  className="p-4 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow active:scale-95 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <span className="text-xs uppercase tracking-wider opacity-80">Immediate</span>
                  <span className="text-lg">RED TAG</span>
                </button>
                <button
                  id="btn-triage-yellow"
                  disabled={!!triageFeedback}
                  onClick={() => handleTriageAnswer('yellow')}
                  className="p-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow active:scale-95 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <span className="text-xs uppercase tracking-wider opacity-80">Delayed</span>
                  <span className="text-lg">YELLOW TAG</span>
                </button>
                <button
                  id="btn-triage-green"
                  disabled={!!triageFeedback}
                  onClick={() => handleTriageAnswer('green')}
                  className="p-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-95 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <span className="text-xs uppercase tracking-wider opacity-80">Minor</span>
                  <span className="text-lg">GREEN TAG</span>
                </button>
                <button
                  id="btn-triage-black"
                  disabled={!!triageFeedback}
                  onClick={() => handleTriageAnswer('black')}
                  className="p-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-sm hover:shadow active:scale-95 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <span className="text-xs uppercase tracking-wider opacity-80">Expectant</span>
                  <span className="text-lg">BLACK TAG</span>
                </button>
              </div>

              {/* Feedback Banner */}
              <AnimatePresence>
                {triageFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                      triageFeedback.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {triageFeedback.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm font-medium leading-relaxed">{triageFeedback.text}</p>
                    </div>

                    <button
                      id="btn-next-triage"
                      onClick={nextTriageCase}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shrink-0 transition"
                    >
                      Next Patient →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <Award className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Triage Simulation Complete!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You scored <span className="font-bold text-teal-600 dark:text-teal-400">{triageScore} Points</span> with START Disaster Triage accuracy.
              </p>
              <button
                onClick={() => {
                  setTriageIndex(0);
                  setTriageScore(0);
                  setTriageStreak(0);
                  setTriageGameOver(false);
                  setTimeLeft(15);
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: IV Drip Sprint */}
      {activeGame === 'drip' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Question {dripIndex + 1} of {DOSE_QUESTIONS.length}
            </span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Score: {dripScore}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {DOSE_QUESTIONS[dripIndex].prompt}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOSE_QUESTIONS[dripIndex].options.map((opt, idx) => {
              const isSelected = dripSelected === idx;
              const isCorrect = idx === DOSE_QUESTIONS[dripIndex].correctIndex;
              let btnStyle = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100';

              if (dripSelected !== null) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleDripAnswer(idx)}
                  disabled={dripSelected !== null}
                  className={`p-3.5 rounded-xl border text-sm text-left transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {dripFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
            >
              <span>{dripFeedback}</span>
              <button
                onClick={nextDripQuestion}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shrink-0"
              >
                Next Math Problem →
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* GAME 3: Waste Bin Blitz */}
      {activeGame === 'waste' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Waste Item {wasteIndex + 1} of {WASTE_ITEMS.length}
            </span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Score: {wasteScore}
            </span>
          </div>

          <div className="p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-center space-y-1">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase">Incoming Clinical Waste Item</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {WASTE_ITEMS[wasteIndex].name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generated at: {WASTE_ITEMS[wasteIndex].category}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleWasteSort('yellow')}
              disabled={!!wasteFeedback}
              className="p-4 rounded-xl border-2 border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs sm:text-sm flex flex-col items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center font-black text-amber-950">Y</div>
              <span>YELLOW BAG</span>
              <span className="text-[10px] font-normal opacity-80">Incinerable / Anatomical</span>
            </button>

            <button
              onClick={() => handleWasteSort('red')}
              disabled={!!wasteFeedback}
              className="p-4 rounded-xl border-2 border-red-500 bg-red-100 hover:bg-red-200 text-red-950 font-bold text-xs sm:text-sm flex flex-col items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center font-black text-white">R</div>
              <span>RED BAG</span>
              <span className="text-[10px] font-normal opacity-80">Recyclable Plastic</span>
            </button>

            <button
              onClick={() => handleWasteSort('white')}
              disabled={!!wasteFeedback}
              className="p-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm flex flex-col items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-slate-400 text-slate-900 flex items-center justify-center font-black">W</div>
              <span>WHITE CONTAINER</span>
              <span className="text-[10px] font-normal opacity-80">Puncture-Proof Sharps</span>
            </button>

            <button
              onClick={() => handleWasteSort('blue')}
              disabled={!!wasteFeedback}
              className="p-4 rounded-xl border-2 border-blue-400 bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold text-xs sm:text-sm flex flex-col items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-black text-white">B</div>
              <span>BLUE CONTAINER</span>
              <span className="text-[10px] font-normal opacity-80">Glassware & Ampoules</span>
            </button>
          </div>

          {wasteFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${
                wasteFeedback.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              }`}
            >
              <span>{wasteFeedback.text}</span>
              <button
                onClick={nextWasteItem}
                className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-black text-white text-xs font-semibold shrink-0"
              >
                Next Item →
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
