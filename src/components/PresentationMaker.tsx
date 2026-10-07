import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Presentation,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  FileText,
  Play,
  RotateCcw,
  BookOpen,
  Layers,
  HelpCircle,
  Clock,
  User,
} from 'lucide-react';
import { PresentationDeck, Slide } from '../types';
import { generatePresentationWithGemini } from '../services/geminiService';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';

const PRESET_DECKS: PresentationDeck[] = [
  {
    id: 'deck-pph',
    topic: 'Postpartum Hemorrhage (PPH) - The 4 Ts & Management Protocol',
    targetAudience: '4th Year B.Sc Nursing Students & Clinical Interns',
    estimatedMinutes: 20,
    slides: [
      {
        slideNumber: 1,
        title: 'Postpartum Hemorrhage: Definition, Classification & Epidemiology',
        contentBullets: [
          'Primary PPH: Blood loss >= 500 mL following vaginal delivery or >= 1000 mL following Caesarean section within the first 24 hours postpartum.',
          'Secondary PPH: Excessive abnormal lochial bleeding occurring between 24 hours and 6 weeks post-delivery.',
          'Leading cause of maternal mortality worldwide, accounting for 27% of all maternal deaths.',
          'Preventable in over 60% of cases through Active Management of the Third Stage of Labor (AMTSL).',
        ],
        speakerNotes:
          'Welcome colleagues. Today we review the highest cause of maternal mortality in our obstetrics wards. Emphasize that clinical visual estimation typically underestimates blood loss by 30 to 50 percent.',
        diagramType: 'pph',
      },
      {
        slideNumber: 2,
        title: 'Etiological Classification: The 4 Ts Framework',
        contentBullets: [
          'Tone (70%): Uterine atony due to overdistension (twins, polyhydramnios), prolonged labor, or chorioamnionitis.',
          'Trauma (20%): Cervical lacerations, vaginal vault tears, episiotomy extensions, or uterine rupture.',
          'Tissue (10%): Retained placenta, succenturiate lobe, or adherent placenta (accreta/increta/percreta).',
          'Thrombin (1%): Pre-existing or acquired coagulopathies, DIC in abruptio placentae or severe pre-eclampsia.',
        ],
        speakerNotes:
          'Immediately upon identifying hemorrhage, palpate the uterine fundus. A soft, boggy fundus points to Tone. A firm contracted fundus with continuous dark red bleeding points to Trauma.',
        diagramType: 'pph',
      },
      {
        slideNumber: 3,
        title: 'Medical & Pharmacological Management Algorithm',
        contentBullets: [
          'First Line: Oxytocin 10-20 IU in 500 mL Ringer Lactate at 40-60 drops/min.',
          'Tranexamic Acid (TXA): 1 g IV slowly over 10 minutes, administered within 3 hours of bleeding onset.',
          'Methylergometrine: 0.2 mg IM (Strictly contraindicated in hypertension/pre-eclampsia).',
          'Prostaglandins: Misoprostol 800 mcg sublingually/rectally; Carboprost (PGF2a) 250 mcg deep IM (contraindicated in bronchial asthma).',
        ],
        speakerNotes:
          'Stress the WOMAN trial findings: TXA must be given as early as possible within 3 hours. Never give ergometrine IV push.',
      },
      {
        slideNumber: 4,
        title: 'Mechanical Tamponade & Surgical Escalation',
        contentBullets: [
          'Intrauterine Balloon Tamponade: Bakri balloon filled with 300 to 500 mL sterile warm saline. Positive tamponade test indicates control within 5 minutes.',
          'External Aortic Compression: Bimanual uterine compression while preparing surgical theater.',
          'Surgical Devascularization: B-Lynch uterine compression brace sutures, bilateral uterine/hypogastric artery ligation.',
          'Last Resort: Emergency peripartum subtotal or total hysterectomy to preserve maternal life.',
        ],
        speakerNotes:
          'Bakri balloon should remain in place for 12 to 24 hours with continuous prophylactic antibiotic cover.',
      },
      {
        slideNumber: 5,
        title: 'Nursing Role, Monitoring & SBAR Documentation',
        contentBullets: [
          'Immediate dual 16G large-bore IV access and warm crystalloid resuscitation.',
          'Foley catheter insertion with hourly urometer measurement (> 30 mL/hr target).',
          'Gravimetric blood loss quantification (weighing all blood-soaked pads and sponges: 1 gram = 1 mL).',
          'Structured SBAR communication during obstetric handoff to anesthesia and pediatric teams.',
        ],
        speakerNotes:
          'Conclude with the vital importance of clinical teamwork, non-judgmental debriefing, and empathetic support for the patient and family.',
      },
    ],
  },
  {
    id: 'deck-nrp',
    topic: 'Neonatal Resuscitation & The Golden Minute (NRP 8th Edition)',
    targetAudience: 'Child Health Nursing & Pediatric Posting Students',
    estimatedMinutes: 15,
    slides: [
      {
        slideNumber: 1,
        title: 'Introduction & The Concept of The Golden Minute',
        contentBullets: [
          'First 60 seconds after birth are decisive in establishing pulmonary respiration and preventing hypoxic encephalopathy.',
          'Approximately 10% of newborns require some assistance to breathe; 1% require intensive resuscitation.',
          'Core physiological transition: Clearing fluid from alveoli and establishing functional residual capacity.',
        ],
        speakerNotes:
          'Emphasize that ventilation of the lungs is the single most important and effective action in neonatal resuscitation.',
        diagramType: 'nrp',
      },
      {
        slideNumber: 2,
        title: 'Rapid Initial Evaluation & Temperature Management',
        contentBullets: [
          '3 Baseline Questions: Term gestation? Good tone? Breathing or crying?',
          'If yes: Baby stays on maternal chest for Skin-to-Skin Contact (KMC) and early breastfeeding.',
          'If no: Place immediately under pre-warmed Radiant Warmer (maintain 36.5 - 37.5°C).',
          'Position head in "sniffing position" to avoid hyperextension or airway collapse.',
        ],
        speakerNotes:
          'Cold stress dramatically increases oxygen consumption and precipitates metabolic acidosis.',
      },
      {
        slideNumber: 3,
        title: 'Positive Pressure Ventilation (PPV) & MR. SOPA',
        contentBullets: [
          'Indication: Apneic, gasping, or Heart Rate < 100 bpm at 60 seconds.',
          'Deliver 40 to 60 breaths per minute ("Breathe, two, three"). Room air (21%) for term; 21-30% for preterm.',
          'MR. SOPA corrective ventilation steps if chest fails to rise adequately: Mask, Reposition, Suction, Open mouth, Pressure increase, Alternative airway.',
        ],
        speakerNotes:
          'Pre-ductal pulse oximeter probe must always be attached to the RIGHT wrist or palm.',
        diagramType: 'nrp',
      },
    ],
  },
];

export const PresentationMaker: React.FC = () => {
  const { addXP } = useTheme();

  const [decks, setDecks] = useState<PresentationDeck[]>(PRESET_DECKS);
  const [selectedDeck, setSelectedDeck] = useState<PresentationDeck>(PRESET_DECKS[0]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // Custom AI generation form
  const [topicInput, setTopicInput] = useState('');
  const [numSlides, setNumSlides] = useState(5);
  const [audienceInput, setAudienceInput] = useState('B.Sc Nursing Students & Clinical Preceptors');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const generated = await generatePresentationWithGemini(topicInput.trim(), numSlides, audienceInput);
      setDecks((prev) => [generated, ...prev]);
      setSelectedDeck(generated);
      setCurrentSlideIdx(0);
      addXP(40);
      audioSynth.playSuccessChime();
      setTopicInput('');
    } catch (err) {
      console.error(err);
      audioSynth.playErrorBuzz();
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSlide: Slide | undefined = selectedDeck.slides[currentSlideIdx];

  const handleCopyOutline = () => {
    const text = `PRESENTATION: ${selectedDeck.topic}\nAudience: ${selectedDeck.targetAudience}\n\n` +
      selectedDeck.slides
        .map(
          (s) =>
            `SLIDE ${s.slideNumber}: ${s.title}\n` +
            s.contentBullets.map((b) => `• ${b}`).join('\n') +
            `\nSPEAKER NOTES: ${s.speakerNotes}\n`
        )
        .join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="presentation-maker-container" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Presentation className="w-5 h-5 text-teal-600" />
            Clinical Seminar & Presentation Maker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Instant AI-generated academic slide decks with speaker notes, clinical evidence, and viva talking points
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyOutline}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            {copied ? 'Copied Outline' : 'Copy Slide Deck'}
          </button>
        </div>
      </div>

      {/* AI Presentation Generator Form */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Generate Nursing Seminar Slides with AI Assistant
          </h3>
        </div>

        <form onSubmit={handleGenerateDeck} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Biomedical Waste Management Rules or Tetralogy of Fallot in Pediatrics..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={numSlides}
              onChange={(e) => setNumSlides(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={3}>3 Slides (Quick 5-min Viva)</option>
              <option value={5}>5 Slides (Standard Seminar)</option>
              <option value={7}>7 Slides (Full Case Presentation)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isGenerating || !topicInput.trim()}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Drafting Slides...
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4" />
                  Generate Deck
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Available Slide Decks Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Decks:
        </span>
        {decks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => {
              setSelectedDeck(deck);
              setCurrentSlideIdx(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDeck.id === deck.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
            }`}
          >
            {deck.topic.slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Main Slide Deck Presentation Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Slide Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg min-h-[440px] flex flex-col justify-between relative overflow-hidden">
            {/* Top Slide Meta Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {selectedDeck.topic}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                Slide {currentSlideIdx + 1} / {selectedDeck.slides.length}
              </span>
            </div>

            {/* Slide Body */}
            {currentSlide && (
              <div className="my-auto py-6 space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                  {currentSlide.title}
                </h3>

                <ul className="space-y-3 pt-2">
                  {currentSlide.contentBullets.map((bullet, bIdx) => (
                    <motion.li
                      key={bIdx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: bIdx * 0.08 }}
                      className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed"
                    >
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2" />
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Slide Footer Navigation */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                disabled={currentSlideIdx === 0}
                onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1.5">
                {selectedDeck.slides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentSlideIdx(dotIdx)}
                    className={`h-2 rounded-full transition-all ${
                      dotIdx === currentSlideIdx
                        ? 'w-6 bg-teal-600'
                        : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={currentSlideIdx === selectedDeck.slides.length - 1}
                onClick={() => setCurrentSlideIdx((prev) => Math.min(selectedDeck.slides.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-40 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Notes & Presentation Guide (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                Speaker Notes (Viva & Clinical Delivery)
              </h4>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-[11px] text-teal-600 hover:underline font-semibold"
              >
                {showNotes ? 'Hide' : 'Show'}
              </button>
            </div>

            {showNotes && currentSlide && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                <span className="font-bold text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                  What to say during this slide:
                </span>
                <p>{currentSlide.speakerNotes}</p>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <User className="w-3.5 h-3.5" /> Target Audience
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDeck.targetAudience}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> Presentation Time
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">~{selectedDeck.estimatedMinutes} Mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
