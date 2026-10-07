import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Heart,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Scissors,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Award,
  Zap,
  ChevronRight,
  Maximize2,
  Eye,
  Info,
  Glasses,
  Droplet,
  SunMedium,
  CheckSquare,
  Square,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OT_PROCEDURES, OT_INSTRUMENTS } from '../data/otSimulationData';
import { OTProcedure, OTSurgicalStep, OTInstrument } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';
import { useOwner } from '../context/OwnerContext';
import { CLINICAL_IMAGE_ASSETS } from '../data/animeGuidesData';
import { AnimeStudySquad } from './AnimeStudySquad';
import { EcgMonitorCanvas } from './EcgMonitorCanvas';

interface VirtualOTSimulatorProps {
  initialProcedureId?: string;
}

export const VirtualOTSimulator: React.FC<VirtualOTSimulatorProps> = ({ initialProcedureId }) => {
  const { addXP, soundEnabled, setSoundEnabled } = useTheme();
  const { procedures } = useOwner();

  const activeProcedures = procedures && procedures.length > 0 ? procedures : OT_PROCEDURES;

  // Selected procedure
  const [selectedProc, setSelectedProc] = useState<OTProcedure>(() => {
    if (initialProcedureId) {
      const match = activeProcedures.find((p) => p.id === initialProcedureId);
      if (match) return match;
    }
    return activeProcedures[0];
  });

  // Simulation flow phase: 'scrub' | 'operative' | 'complication' | 'debrief'
  const [phase, setPhase] = useState<'scrub' | 'operative' | 'complication' | 'debrief'>('scrub');

  // VR Immersion HUD mode
  const [isVrMode, setIsVrMode] = useState<boolean>(false);
  const [surgicalVisualEffect, setSurgicalVisualEffect] = useState<string | null>(null);

  // Suction unit state
  const [suctionVolume, setSuctionVolume] = useState<number>(180);
  const [isSuctioning, setIsSuctioning] = useState<boolean>(false);

  // Anesthesia & IV resuscitation
  const [ivFluidTotal, setIvFluidTotal] = useState<number>(500);
  const [isOxytocinGiven, setIsOxytocinGiven] = useState<boolean>(false);

  // Circulating & Scrub Nurse count board
  const [spongeCountVerified, setSpongeCountVerified] = useState<boolean>(true);
  const [needleCountVerified, setNeedleCountVerified] = useState<boolean>(true);
  const [instrumentCountVerified, setInstrumentCountVerified] = useState<boolean>(true);

  // Scrub check items
  const [scrubSteps, setScrubSteps] = useState({
    handScrub: false,
    gowningGloving: false,
    patientIdentification: false,
    surgicalSiteMarked: false,
    allergyAndConsentChecked: false,
  });

  // Operative state
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);
  const [activeComplication, setActiveComplication] = useState<any | null>(null);
  const [surgicalErrors, setSurgicalErrors] = useState<number>(0);
  const [stepFeedback, setStepFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [procedureScore, setProcedureScore] = useState<number>(100);

  // Dynamic vitals
  const [currentVitals, setCurrentVitals] = useState(selectedProc.patientProfile.initialVitals);

  // Reset when procedure changes
  useEffect(() => {
    setPhase('scrub');
    setCurrentStepIdx(0);
    setSelectedInstrumentId(null);
    setActiveComplication(null);
    setSurgicalErrors(0);
    setStepFeedback(null);
    setProcedureScore(100);
    setCurrentVitals(selectedProc.patientProfile.initialVitals);
    setSuctionVolume(180);
    setIvFluidTotal(500);
    setIsOxytocinGiven(false);
    setSurgicalVisualEffect(null);
    setScrubSteps({
      handScrub: false,
      gowningGloving: false,
      patientIdentification: false,
      surgicalSiteMarked: false,
      allergyAndConsentChecked: false,
    });
  }, [selectedProc]);

  // Heart monitor audio rhythm in operative phase
  useEffect(() => {
    if (phase !== 'operative' || !soundEnabled) return;
    const intervalTime = Math.max(400, Math.min(1200, (60 / (currentVitals.hr || 80)) * 1000));
    const monitorInterval = setInterval(() => {
      audioSynth.playMonitorBeep(currentVitals.hr > 115 ? 980 : 840, 0.05);
    }, intervalTime);
    return () => clearInterval(monitorInterval);
  }, [phase, currentVitals.hr, soundEnabled]);

  const allScrubbed =
    scrubSteps.handScrub &&
    scrubSteps.gowningGloving &&
    scrubSteps.patientIdentification &&
    scrubSteps.surgicalSiteMarked &&
    scrubSteps.allergyAndConsentChecked;

  const handleStartSurgery = () => {
    if (!allScrubbed) return;
    audioSynth.playSuccessChime();
    setPhase('operative');
  };

  const handleExecuteAction = (choiceText?: string) => {
    const step = selectedProc.steps[currentStepIdx];
    const textToCompare = choiceText || step.correctChoiceText;
    const isCorrectChoice = textToCompare === step.correctChoiceText;
    const isCorrectInstrument = selectedInstrumentId === step.requiredInstrumentId;

    if (isCorrectChoice && isCorrectInstrument) {
      // Trigger realistic surgical sound based on tool
      if (step.requiredInstrumentId.includes('scalpel') || step.requiredInstrumentId.includes('scissors')) {
        audioSynth.playCut();
        setSurgicalVisualEffect('cut');
      } else if (step.requiredInstrumentId.includes('suction')) {
        audioSynth.playSuction();
        setSuctionVolume((p) => Math.max(40, p - 60));
        setSurgicalVisualEffect('suction');
      } else if (step.requiredInstrumentId.includes('ambu')) {
        audioSynth.playBabyCry();
        setSurgicalVisualEffect('baby');
      } else if (step.requiredInstrumentId.includes('needle') || step.requiredInstrumentId.includes('suture')) {
        audioSynth.playMetallicClink();
        setSurgicalVisualEffect('suture');
      } else {
        audioSynth.playMetallicClink();
        setSurgicalVisualEffect('clamp');
      }

      setTimeout(() => setSurgicalVisualEffect(null), 1800);
      audioSynth.playSuccessChime();
      addXP(20);

      setStepFeedback({
        isCorrect: true,
        message: `Sterile surgical execution verified! ${step.clinicalTip}`,
      });

      // Update vitals
      if (step.vitalsImpact) {
        setCurrentVitals((prev) => ({
          ...prev,
          hr: prev.hr + (step.vitalsImpact?.hrDelta || 0),
          bp: step.vitalsImpact?.bpDelta || prev.bp,
          spo2: Math.min(100, prev.spo2 + (step.vitalsImpact?.spo2Delta || 0)),
        }));
      }

      // Check if complication triggers
      const complication = selectedProc.criticalComplications?.find(
        (c) => c.triggerAtStep === currentStepIdx + 1
      );

      if (complication) {
        setTimeout(() => {
          audioSynth.playAlarmTone();
          setActiveComplication(complication);
          setSuctionVolume((prev) => Math.min(1200, prev + 350));
          setCurrentVitals((prev) => ({
            ...prev,
            hr: 130,
            bp: '82/50 mmHg',
            spo2: 91,
          }));
        }, 1200);
      }
    } else {
      audioSynth.playErrorBuzz();
      setSurgicalErrors((prev) => prev + 1);
      setProcedureScore((prev) => Math.max(20, prev - 15));

      let errReason = '';
      if (!isCorrectInstrument) {
        const reqInst = OT_INSTRUMENTS.find((i) => i.id === step.requiredInstrumentId);
        errReason = `Incorrect instrument in hand! Pick up "${reqInst?.name}" from the Mayo tray. `;
      }
      if (!isCorrectChoice) {
        errReason += 'Incorrect surgical technique selected. Review patient safety protocol.';
      }

      setStepFeedback({
        isCorrect: false,
        message: errReason,
      });
    }
  };

  const handleAspirateSuctionPedal = () => {
    audioSynth.playSuction();
    setIsSuctioning(true);
    setSuctionVolume((prev) => Math.max(0, prev - 80));
    setTimeout(() => setIsSuctioning(false), 900);
    addXP(5);
  };

  const handleBolusIVFluid = () => {
    audioSynth.playClick();
    setIvFluidTotal((prev) => prev + 250);
    setCurrentVitals((prev) => ({
      ...prev,
      bp: prev.bp.startsWith('8') ? '104/68 mmHg' : prev.bp,
      hr: Math.max(76, prev.hr - 6),
    }));
  };

  const handleOxytocinBolus = () => {
    audioSynth.playSuccessChime();
    setIsOxytocinGiven(true);
    addXP(10);
  };

  const handleResolveComplication = () => {
    audioSynth.playSuccessChime();
    setActiveComplication(null);
    setCurrentVitals((prev) => ({
      ...prev,
      hr: 92,
      bp: '116/76 mmHg',
      spo2: 98,
    }));
    setStepFeedback({
      isCorrect: true,
      message: 'Code Crimson emergency successfully controlled! Maternal hemodynamics stabilized.',
    });
  };

  const handleNextStep = () => {
    setStepFeedback(null);
    setSelectedInstrumentId(null);
    if (currentStepIdx + 1 < selectedProc.steps.length) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setPhase('debrief');
      addXP(80);
      confetti({ particleCount: 90, spread: 70 });
    }
  };

  const currentStep = selectedProc.steps[currentStepIdx];
  const requiredInstObj = OT_INSTRUMENTS.find((i) => i.id === currentStep?.requiredInstrumentId);

  return (
    <div id="virtual-ot-container" className="space-y-6">
      {/* OT Header & Procedure Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Virtual Operating Theatre & Labor Room Suite
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive sterile scrub, live monitor, instrument handling, and emergency code management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {OT_PROCEDURES.map((proc) => (
              <button
                key={proc.id}
                onClick={() => setSelectedProc(proc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedProc.id === proc.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {proc.category}: {proc.title.split(':')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              audioSynth.playClick();
              setIsVrMode(!isVrMode);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              isVrMode
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg animate-pulse'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle Immersive Virtual Reality OT HUD"
          >
            <Glasses className="w-4 h-4" />
            <span>{isVrMode ? 'VR HUD Active' : 'VR View'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
            title={soundEnabled ? 'Mute OT Monitor Beeps' : 'Enable OT Monitor Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Visual Operating Theatre Environment Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 h-44 sm:h-52">
        <img
          src={CLINICAL_IMAGE_ASSETS.virtualOtSuite}
          alt="Virtual Sterile Operating Theatre Suite"
          className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur text-white uppercase tracking-wider">
              Sterile Field Active • HEPA Laminar Airflow 99.97%
            </span>
            <h3 className="text-base sm:text-lg font-bold drop-shadow mt-1">
              Operation Theatre #03 — {selectedProc.title}
            </h3>
          </div>
          <span className="text-[11px] text-teal-200 font-mono hidden sm:inline-block">
            WHO Safe Surgery Guidelines
          </span>
        </div>
      </div>

      {/* Anime Study Squad Mentors Guidance */}
      <AnimeStudySquad compact contextFilter="ot" />

      {/* PHASE 0: SCRUB-IN & WHO SURGICAL SAFETY CHECKLIST */}
      {phase === 'scrub' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Phase 1: Surgical Scrub & WHO Sign-In
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedProc.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedProc.patientProfile.name}</span> ({selectedProc.patientProfile.gravidaPara}, {selectedProc.patientProfile.gestationalAge})
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Indication</span>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 max-w-xs text-right">
                {selectedProc.indication}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Hand Scrubbing & PPE */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-teal-600" />
                Aseptic Prep & PPE Gowning
              </h4>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-teal-400 transition">
                <input
                  type="checkbox"
                  checked={scrubSteps.handScrub}
                  onChange={(e) => setScrubSteps((p) => ({ ...p, handScrub: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-teal-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    1. Surgical Hand Scrub with 4% Chlorhexidine Gluconate
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Wash hands and forearms for 3 minutes from fingertip to 2 inches above elbow.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-teal-400 transition">
                <input
                  type="checkbox"
                  checked={scrubSteps.gowningGloving}
                  onChange={(e) => setScrubSteps((p) => ({ ...p, gowningGloving: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-teal-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    2. Sterile Surgical Gowning & Closed Gloving Technique
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Don sterile gown without hands extending past cuff; slide sterile surgical gloves over cuffs.
                  </span>
                </div>
              </label>
            </div>

            {/* Step 2: WHO Surgical Safety Checklist */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                WHO Surgical Safety Sign-In / Time-Out
              </h4>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-teal-400 transition">
                <input
                  type="checkbox"
                  checked={scrubSteps.patientIdentification}
                  onChange={(e) => setScrubSteps((p) => ({ ...p, patientIdentification: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-teal-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    1. Patient Identity & Procedure Confirmed
                  </span>
                  <span className="text-slate-500 text-[11px]">Check wristband ID, MRN, and verify intended procedure aloud.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-teal-400 transition">
                <input
                  type="checkbox"
                  checked={scrubSteps.surgicalSiteMarked}
                  onChange={(e) => setScrubSteps((p) => ({ ...p, surgicalSiteMarked: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-teal-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    2. Surgical Site Marked & Pulse Oximeter Attached
                  </span>
                  <span className="text-slate-500 text-[11px]">Confirm functional SpO2 monitor and IV venous access established.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-teal-400 transition">
                <input
                  type="checkbox"
                  checked={scrubSteps.allergyAndConsentChecked}
                  onChange={(e) => setScrubSteps((p) => ({ ...p, allergyAndConsentChecked: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-teal-600 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    3. Blood Loss Risk, Drug Allergy & Informed Consent Verified
                  </span>
                  <span className="text-slate-500 text-[11px]">4 units PRBC crossmatched; anesthesia airway risk checked.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              {allScrubbed ? 'All sterile checkpoints fulfilled! Ready to enter operative field.' : 'Complete all 5 checkboxes to unlock Operating Theatre entry.'}
            </span>

            <button
              id="btn-enter-ot"
              disabled={!allScrubbed}
              onClick={handleStartSurgery}
              className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-white" />
              Enter Sterile Field & Begin Procedure
            </button>
          </div>
        </div>
      )}

      {/* PHASE 1: OPERATIVE 3D-STYLE STAGE & INSTRUMENT MAYO TRAY */}
      {phase === 'operative' && (
        <div className="space-y-6">
          {/* Top Multi-Parameter Anaesthesia Monitor with Oscilloscope ECG Canvas */}
          <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 border border-slate-800 shadow-xl font-mono">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Mindray Anesthesia & Vital Signs Oscilloscope
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span>PATIENT: {selectedProc.patientProfile.name.toUpperCase()}</span>
                <span className="text-slate-500">|</span>
                <span>GA: {selectedProc.patientProfile.gestationalAge}</span>
                <span className="text-slate-500">|</span>
                <span className={activeComplication ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-500'}>
                  {activeComplication ? 'CRITICAL ALARM' : 'STATUS: STABLE'}
                </span>
              </div>
            </div>

            {/* Live Oscilloscope Sweep: Lead II ECG & Pleth Waveform */}
            <div className="pt-3">
              <EcgMonitorCanvas
                heartRate={currentVitals.hr}
                spo2={currentVitals.spo2}
                isAlarm={!!activeComplication}
              />
            </div>

            {/* Vital parameters readouts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> HR (Lead II)
                  </span>
                  <span className="text-[10px]">bpm</span>
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{currentVitals.hr}</div>
                <div className="h-1 w-full bg-emerald-950 mt-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 animate-pulse w-3/4" />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>NIBP Cuff</span>
                  <span className="text-[10px]">mmHg</span>
                </div>
                <div className="text-2xl font-black text-cyan-300 mt-1">{currentVitals.bp}</div>
                <div className="text-[10px] text-cyan-500/80 mt-1">MAP: ~88 mmHg</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>SpO2 (Pulse-Ox)</span>
                  <span className="text-[10px]">%</span>
                </div>
                <div className="text-2xl font-black text-amber-300 mt-1">{currentVitals.spo2}%</div>
                <div className="text-[10px] text-amber-500/80 mt-1">Pleth: Synchronous</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{currentVitals.fhr ? 'FHR (Doppler)' : 'Core TEMP'}</span>
                  <span className="text-[10px]">{currentVitals.fhr ? 'bpm' : '°C'}</span>
                </div>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  {currentVitals.fhr ? `${currentVitals.fhr} bpm` : currentVitals.temp}
                </div>
                <div className="text-[10px] text-rose-500/80 mt-1">
                  {currentVitals.fhr ? 'Baseline CTG: Reactive' : 'Normothermia'}
                </div>
              </div>
            </div>

            {/* Nurse Anesthesia & Fluid Management Interactive Bar */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Resuscitation & Suction Unit:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBolusIVFluid}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 text-[11px] font-bold flex items-center gap-1 transition"
                  title="Infuse 250mL Ringer Lactate via rapid pressure infusor bag"
                >
                  <Droplet className="w-3 h-3 text-cyan-400" />
                  +250mL Warm RL ({ivFluidTotal}mL infused)
                </button>

                <button
                  onClick={handleOxytocinBolus}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition border ${
                    isOxytocinGiven
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-700/60'
                  }`}
                  title="Administer Oxytocin 10 IU slow IV bolus for uterine tone"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  {isOxytocinGiven ? 'Oxytocin 10 IU Active' : 'Oxytocin 10 IU IV Push'}
                </button>

                <button
                  onClick={handleAspirateSuctionPedal}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition border ${
                    isSuctioning
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700'
                  }`}
                  title="Step on surgical foot pedal to aspirate fluid & blood from field"
                >
                  <Activity className="w-3 h-3 text-amber-400" />
                  Suction Pedal ({suctionVolume}mL in canister)
                </button>
              </div>
            </div>
          </div>

          {/* Complication Modal / Alert */}
          <AnimatePresence>
            {activeComplication && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-2xl bg-rose-600 text-white shadow-2xl space-y-4 border-2 border-white animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-amber-300 shrink-0" />
                  <div>
                    <h3 className="text-base sm:text-lg font-black tracking-wide">
                      {activeComplication.alertTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
                      {activeComplication.description}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-400/50 text-xs">
                  <span className="font-bold uppercase tracking-wider text-amber-300 block mb-1">
                    Nurse Emergency Action Protocol:
                  </span>
                  <p className="leading-relaxed font-mono">{activeComplication.immediateAction}</p>
                </div>

                <button
                  id="btn-resolve-complication"
                  onClick={handleResolveComplication}
                  className="px-5 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs sm:text-sm shadow-md transition"
                >
                  Execute Emergency Protocol & Stabilize Patient →
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Operative Field & Mayo Tray Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Surgical Field Visualizer (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-teal-500 animate-ping" />
                    Step {currentStepIdx + 1} of {selectedProc.steps.length}: {currentStep.title}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Errors: <span className={surgicalErrors > 0 ? 'text-rose-500 font-bold' : 'text-emerald-500'}>{surgicalErrors}</span>
                    </span>
                    <button
                      onClick={() => setIsVrMode(true)}
                      className="px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-300 text-[11px] font-semibold border border-teal-500/30 flex items-center gap-1 transition"
                    >
                      <Glasses className="w-3 h-3" /> Full VR Focus
                    </button>
                  </div>
                </div>

                {/* Simulated Operating Stage Canvas - Direct Interactive Incision Target */}
                <div
                  onClick={() => handleExecuteAction()}
                  className="relative h-72 rounded-xl bg-gradient-to-b from-teal-950 via-slate-950 to-slate-950 border-4 border-teal-800/60 flex items-center justify-center p-4 shadow-inner overflow-hidden cursor-pointer group select-none"
                  title="Click directly to perform surgical maneuver with selected instrument"
                >
                  {/* Sterile blue surgical drape frame */}
                  <div className="absolute inset-2 border-2 border-dashed border-teal-500/40 rounded-lg pointer-events-none" />

                  {/* Scialytic Overhead Lamp Glare */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-teal-300/10 via-transparent to-transparent pointer-events-none" />

                  {/* Surgical Action Visual Flash */}
                  <AnimatePresence>
                    {surgicalVisualEffect && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-teal-500/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
                      >
                        <div className="px-4 py-2 rounded-xl bg-slate-950/90 border border-teal-400 text-teal-300 font-mono text-sm font-bold shadow-2xl flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                          {surgicalVisualEffect === 'cut' && 'SCALPEL INCISION PERFORMED'}
                          {surgicalVisualEffect === 'suction' && 'FIELD ASPIRATED & DRIED'}
                          {surgicalVisualEffect === 'baby' && 'INFANT DELIVERED & SUCTIONED'}
                          {surgicalVisualEffect === 'suture' && 'HEMOSTATIC SUTURE SECURED'}
                          {surgicalVisualEffect === 'clamp' && 'VASCULAR CLAMP LOCKED'}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Anatomical Surgical Target Center */}
                  <div className="text-center space-y-3 z-10 transition-transform group-hover:scale-105">
                    <div className="w-28 h-28 rounded-full bg-teal-900/60 border-2 border-teal-400/80 flex items-center justify-center mx-auto shadow-2xl relative group">
                      <div className="absolute inset-2 rounded-full border border-teal-400/30 animate-ping opacity-30" />
                      <Scissors className="w-10 h-10 text-teal-200 group-hover:rotate-45 transition-transform duration-300" />
                      <span className="absolute -bottom-2.5 px-2.5 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono text-teal-300 border border-teal-500/50 shadow">
                        {currentStep.targetArea}
                      </span>
                    </div>

                    <div className="max-w-md bg-black/70 backdrop-blur-md p-3 rounded-xl border border-teal-500/40 text-teal-100 text-xs text-center leading-relaxed">
                      {currentStep.instruction}
                    </div>

                    <div className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-full inline-block shadow">
                      {selectedInstrumentId
                        ? `Ready: Click to execute with ${requiredInstObj?.name || 'tool'}`
                        : 'Select instrument on right Mayo stand first'}
                    </div>
                  </div>

                  {/* Ambient OR telemetry badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] text-teal-300 font-mono bg-teal-950/80 px-2 py-1 rounded border border-teal-800">
                    <SunMedium className="w-3 h-3 text-amber-400" /> OR Lux: 120,000 lx
                  </div>
                  <div className="absolute top-3 right-3 text-[10px] text-teal-300 font-mono bg-teal-950/80 px-2 py-1 rounded border border-teal-800">
                    Laminar Air: 0.45 m/s
                  </div>
                  <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 font-mono bg-black/60 px-2 py-0.5 rounded">
                    Tool In Hand: {selectedInstrumentId ? requiredInstObj?.name : 'None (Gloved)'}
                  </div>
                </div>

                {/* Surgical Decision Choices */}
                <div className="space-y-2 mt-5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Confirm Surgical Maneuver & Protocol:
                  </span>

                  <div className="space-y-2">
                    {[currentStep.correctChoiceText, ...currentStep.distractorChoices]
                      .sort()
                      .map((choice, cIdx) => (
                        <button
                          key={cIdx}
                          disabled={!!stepFeedback}
                          onClick={() => handleExecuteAction(choice)}
                          className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between group disabled:opacity-50"
                        >
                          <span>{choice}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition" />
                        </button>
                      ))}
                  </div>
                </div>

                {/* Step Feedback Banner */}
                {stepFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${
                      stepFeedback.isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {stepFeedback.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <span>{stepFeedback.message}</span>
                    </div>

                    {stepFeedback.isCorrect && (
                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shrink-0 transition"
                      >
                        Advance Step →
                      </button>
                    )}
                  </motion.div>
                )}

                {/* WHO Surgical Safety Checklist: Sponge & Instrument Count Board */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Scrub & Circulating Nurse Count Verification:
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      WHO Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div
                      onClick={() => setSpongeCountVerified(!spongeCountVerified)}
                      className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>Sponges: 10/10</span>
                      {spongeCountVerified ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <div
                      onClick={() => setNeedleCountVerified(!needleCountVerified)}
                      className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>Needles: 4/4</span>
                      {needleCountVerified ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <div
                      onClick={() => setInstrumentCountVerified(!instrumentCountVerified)}
                      className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <span>Instruments: 24/24</span>
                      {instrumentCountVerified ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instrument Mayo Stand / Tray (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-teal-600" />
                    Sterile Mayo Instrument Stand
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tap to pick up the exact tool required for Step {currentStepIdx + 1}
                  </p>
                </div>
                {selectedInstrumentId && (
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    Tool In Hand
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {OT_INSTRUMENTS.filter((i) => selectedProc.availableInstruments.includes(i.id)).map(
                  (instrument) => {
                    const isSelected = selectedInstrumentId === instrument.id;
                    return (
                      <button
                        key={instrument.id}
                        onClick={() => {
                          audioSynth.playClick();
                          setSelectedInstrumentId(instrument.id);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-sm text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{instrument.name}</span>
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {instrument.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                            {instrument.clinicalUse}
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Clinical Tip: Pick up the matching instrument, then click the central surgical incision target or the action button.
                </span>
              </div>
            </div>
          </div>

          {/* VR IMMERSION MODE OVERLAY */}
          <AnimatePresence>
            {isVrMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col justify-between p-6 backdrop-blur-md overflow-hidden select-none"
              >
                {/* VR Headset Curved Visor Vignette effect */}
                <div className="pointer-events-none absolute inset-0 ring-inset ring-[40px] ring-black/80 rounded-[40px]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.85)_100%)]" />

                {/* VR HUD Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-teal-500/30 pb-4 text-teal-400 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <Glasses className="w-6 h-6 text-teal-300 animate-pulse" />
                    <div>
                      <span className="font-bold text-white text-sm">VR HEADSET IMMERSION HUD</span>
                      <p className="text-[10px] text-teal-400">SURGICAL THEATRE #03 • STERILE FIELD DEPTH TRACKING</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded bg-teal-950 border border-teal-500/40 text-teal-300">
                      LEAD II: {currentVitals.hr} BPM | SpO2: {currentVitals.spo2}% | NIBP: {currentVitals.bp}
                    </span>
                    <button
                      onClick={() => setIsVrMode(false)}
                      className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold transition text-xs"
                    >
                      Exit VR HUD ✕
                    </button>
                  </div>
                </div>

                {/* Central VR 3D Surgical Field View */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-6">
                  {/* Aiming Reticle Crosshair */}
                  <div className="relative w-72 h-72 rounded-full border-2 border-dashed border-teal-400/40 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border border-teal-500/60 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_12px_#2dd4bf]" />
                    </div>
                    {/* Crosshair ticks */}
                    <div className="absolute top-0 w-0.5 h-6 bg-teal-400" />
                    <div className="absolute bottom-0 w-0.5 h-6 bg-teal-400" />
                    <div className="absolute left-0 h-0.5 w-6 bg-teal-400" />
                    <div className="absolute right-0 h-0.5 w-6 bg-teal-400" />

                    {/* Target Incision Zone in VR */}
                    <button
                      onClick={() => handleExecuteAction()}
                      className="absolute inset-8 rounded-full bg-teal-950/80 hover:bg-teal-900/80 border border-teal-400/60 flex flex-col items-center justify-center p-3 text-white transition active:scale-95 shadow-2xl"
                    >
                      <Scissors className="w-8 h-8 text-teal-300 mb-1" />
                      <span className="text-xs font-bold text-teal-200">{currentStep.targetArea}</span>
                      <span className="text-[10px] text-slate-300 mt-1">
                        {selectedInstrumentId ? `Operate with ${requiredInstObj?.name}` : 'Select tool on Mayo stand'}
                      </span>
                    </button>
                  </div>

                  <div className="mt-4 max-w-lg bg-black/80 backdrop-blur-md p-3.5 rounded-xl border border-teal-500/40 text-teal-100 text-xs">
                    <span className="text-teal-400 font-bold block mb-1">CURRENT SURGICAL DIRECTIVE:</span>
                    {currentStep.instruction}
                  </div>
                </div>

                {/* VR HUD Bottom Control Bar */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-teal-500/30 pt-4 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Mayo Instrument Quick-Select:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl">
                      {OT_INSTRUMENTS.filter((i) => selectedProc.availableInstruments.includes(i.id)).map(
                        (tool) => (
                          <button
                            key={tool.id}
                            onClick={() => {
                              audioSynth.playClick();
                              setSelectedInstrumentId(tool.id);
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition border ${
                              selectedInstrumentId === tool.id
                                ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            {tool.name}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAspirateSuctionPedal}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition"
                    >
                      Aspirate Field ({suctionVolume}mL)
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!stepFeedback?.isCorrect}
                      className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition disabled:opacity-40"
                    >
                      Next Step →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* PHASE 2: DEBRIEF & CLINICAL SCORECARD */}
      {phase === 'debrief' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
              Surgical Procedure Debriefing Report
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {selectedProc.title} Successfully Completed!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Patient: {selectedProc.patientProfile.name} is stable and transferred to Post-Anesthesia Care Unit (PACU).
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Proficiency Score</span>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">{procedureScore}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Surgical Errors</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{surgicalErrors}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">XP Awarded</span>
              <p className="text-xl font-bold text-amber-500 mt-0.5">+80 XP</p>
            </div>
          </div>

          <div className="text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">Preceptor Feedback:</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Sterile precautions and WHO surgical checklist were executed diligently. Prompt recognition of complications and accurate instrument handoffs demonstrated strong clinical decision-making. Keep practicing the 4 Ts of PPH and neonatal resuscitation golden-minute protocols!
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setPhase('scrub');
                setCurrentStepIdx(0);
                setSelectedInstrumentId(null);
                setSurgicalErrors(0);
                setStepFeedback(null);
                setProcedureScore(100);
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
            >
              Re-run Procedure
            </button>
            <button
              onClick={() => {
                const nextIdx = (OT_PROCEDURES.findIndex((p) => p.id === selectedProc.id) + 1) % OT_PROCEDURES.length;
                setSelectedProc(OT_PROCEDURES[nextIdx]);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-black text-white font-semibold text-xs transition"
            >
              Next OT Case →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
