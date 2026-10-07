import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  UploadCloud,
  Search,
  CheckCircle2,
  AlertCircle,
  GitMerge,
  Download,
  Sparkles,
  ChevronRight,
  Filter,
  Eye,
  Layers,
  FileText,
  Activity,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { UploadedTopicRow, ClinicalAlgorithm } from '../types';
import { DEFAULT_EXCEL_TOPICS, CLINICAL_ALGORITHMS } from '../data/diagramsData';
import { analyzeTopicWithGemini } from '../services/geminiService';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';
import { CLINICAL_IMAGE_ASSETS } from '../data/animeGuidesData';
import { AnimeStudySquad } from './AnimeStudySquad';
import * as XLSX from 'xlsx';

export const ExcelTopicViewer: React.FC = () => {
  const { addXP } = useTheme();

  const [topics, setTopics] = useState<UploadedTopicRow[]>(DEFAULT_EXCEL_TOPICS);
  const [selectedTopic, setSelectedTopic] = useState<UploadedTopicRow>(DEFAULT_EXCEL_TOPICS[0]);
  const [activeAlgorithm, setActiveAlgorithm] = useState<ClinicalAlgorithm>(CLINICAL_ALGORITHMS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // New topic AI generation
  const [customTopicName, setCustomTopicName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // File upload state
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // APGAR Calculator interactive state
  const [apgarScores, setApgarScores] = useState({
    appearance: 2,
    pulse: 2,
    grimace: 2,
    activity: 2,
    respiration: 2,
  });

  const totalApgar =
    apgarScores.appearance +
    apgarScores.pulse +
    apgarScores.grimace +
    apgarScores.activity +
    apgarScores.respiration;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const parsedRows: UploadedTopicRow[] = [];

      if (rawRows.length > 0) {
        rawRows.forEach((row, i) => {
          const keys = Object.keys(row);
          const findVal = (terms: string[]) => {
            for (const term of terms) {
              const matchedKey = keys.find((k) => k.toLowerCase().includes(term));
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const topicName =
            findVal(['topic', 'name', 'title', 'subject matter']) ||
            (row[keys[0]] ? String(row[keys[0]]).trim() : `Topic ${i + 1}`);

          const subject =
            findVal(['subject', 'course', 'discipline']) || 'B.Sc Nursing Curriculum';

          const unit =
            findVal(['unit', 'chapter', 'module', 'sem']) || 'Unit I';

          const notes =
            findVal(['note', 'clinical', 'desc', 'summary', 'detail', 'content']) ||
            'Detailed notes extracted from spreadsheet.';

          const answers =
            findVal(['answer', 'solution', 'model', 'ans', 'rationale', 'management']) ||
            `Comprehensive Clinical Answer for ${topicName}: Review clinical presentation, standard diagnostic criteria, priority nursing interventions (airway, breathing, circulation, monitoring), and pharmacological protocols according to Indian Nursing Council (INC) and WHO guidelines.`;

          const keyPointsRaw =
            findVal(['point', 'high yield', 'key', 'pearls', 'important', 'bullet']) || '';

          const keyPoints = keyPointsRaw
            ? keyPointsRaw.split(/[;\n•|]/).map((s) => s.trim()).filter(Boolean)
            : ['High-yield examination point', 'Bedside nursing priority intervention', 'Pharmacology & antidote safety check'];

          // Determine relevant diagram
          let diagramType: 'pph' | 'nrp' | 'bmw' | 'amtsl' | 'eclampsia' | 'lscs' | 'apgar' | 'bishop' = 'pph';
          const combinedText = `${topicName} ${notes} ${answers}`.toLowerCase();
          if (combinedText.includes('neonat') || combinedText.includes('nrp') || combinedText.includes('resuscitat') || combinedText.includes('baby') || combinedText.includes('pediatric')) {
            diagramType = 'nrp';
          } else if (combinedText.includes('waste') || combinedText.includes('bin') || combinedText.includes('biomedical') || combinedText.includes('bmw') || combinedText.includes('disposal')) {
            diagramType = 'bmw';
          } else if (combinedText.includes('eclampsia') || combinedText.includes('mgso4') || combinedText.includes('magnesium') || combinedText.includes('seizure') || combinedText.includes('pritchard') || combinedText.includes('zuspan')) {
            diagramType = 'eclampsia';
          } else if (combinedText.includes('amtsl') || combinedText.includes('third stage') || combinedText.includes('active management') || combinedText.includes('oxytocin')) {
            diagramType = 'amtsl';
          } else if (combinedText.includes('cesarean') || combinedText.includes('lscs') || combinedText.includes('c-section') || combinedText.includes('incision')) {
            diagramType = 'lscs';
          } else if (combinedText.includes('apgar')) {
            diagramType = 'apgar';
          } else if (combinedText.includes('bishop') || combinedText.includes('cervix') || combinedText.includes('ripening') || combinedText.includes('induction')) {
            diagramType = 'bishop';
          }

          parsedRows.push({
            id: `uploaded-${Date.now()}-${i}`,
            topicName,
            subject,
            unit,
            notes,
            answers,
            keyPoints,
            diagramType,
            parsedDate: new Date().toISOString().split('T')[0],
          });
        });
      }

      if (parsedRows.length > 0) {
        setTopics((prev) => [...parsedRows, ...prev]);
        setSelectedTopic(parsedRows[0]);
        setUploadSuccessMsg(`Successfully imported ${parsedRows.length} topics from "${file.name}" with full answers and diagrams!`);
        addXP(50);
        audioSynth.playSuccessChime();
        setTimeout(() => setUploadSuccessMsg(null), 6000);
      } else {
        const newRow: UploadedTopicRow = {
          id: `uploaded-${Date.now()}`,
          topicName: file.name.replace(/\.[^/.]+$/, ''),
          subject: 'Uploaded Syllabus',
          unit: 'Custom Notes',
          notes: 'Imported file content into NurseSphere.',
          answers: 'Complete clinical answers available with diagrams and preceptor guidance.',
          keyPoints: ['Imported spreadsheet entry', 'Auto-synchronized with NurseSphere'],
          diagramType: 'pph',
          parsedDate: new Date().toISOString().split('T')[0],
        };
        setTopics((prev) => [newRow, ...prev]);
        setSelectedTopic(newRow);
        setUploadSuccessMsg(`Successfully imported "${file.name}"!`);
        audioSynth.playSuccessChime();
        setTimeout(() => setUploadSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('File parsing error', err);
      audioSynth.playErrorBuzz();
      setUploadSuccessMsg('Could not read file. Please ensure it is a valid .xlsx, .xls, or .csv spreadsheet.');
    }
  };

  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'Topic Name': 'Postpartum Hemorrhage (PPH) & 4 Ts',
        'Subject': 'Midwifery / OBG Nursing - II',
        'Unit': 'Unit II (Abnormal Labour)',
        'Clinical Notes': 'Blood loss >= 500 mL in normal delivery or >= 1000 mL in LSCS. 4 Ts: Tone (70%), Trauma (20%), Tissue (10%), Thrombin (1%).',
        'Model Answers': 'Step 1: Massage fundus & catheterize bladder. Step 2: Oxytocin 10-20 IU in 500 mL RL at 40-60 drops/min. Step 3: TXA 1g IV within 3 hrs. Step 4: Misoprostol 800 mcg rectal or Carboprost 250 mcg deep IM. Step 5: Bakri balloon tamponade.',
        'Key High Yield Points': 'Tone is #1 cause; Avoid ergometrine in hypertension/PIH; Bakri balloon inflated with 300-500 mL saline; Weigh pads (1g = 1mL)',
      },
      {
        'Topic Name': 'Neonatal Resuscitation & The Golden Minute (NRP)',
        'Subject': 'Child Health Nursing - II',
        'Unit': 'Unit I (High Risk Newborn)',
        'Clinical Notes': 'Initial steps within 60 seconds: Warm, clear airway (mouth then nose), dry, stimulate. If HR < 100 or apneic/gasping -> start PPV with room air (21% O2).',
        'Model Answers': 'MR. SOPA for corrective steps: Mask adjustment, Reposition airway, Suction mouth & nose, Open mouth, Pressure increase, Alternative airway (ETT/LMA). Chest compressions (3:1 ratio) if HR < 60 bpm despite 30s effective PPV.',
        'Key High Yield Points': 'Initiate PPV with 21% O2 in term infants; 3:1 compression-to-ventilation ratio (90 compressions + 30 breaths = 120 events/min); Epinephrine dose 0.02 mg/kg (0.2 mL/kg of 1:10,000)',
      },
      {
        'Topic Name': 'Bio-Medical Waste Management (BMW 2016 Rules)',
        'Subject': 'Community Health Nursing & Nursing Foundations',
        'Unit': 'Infection Control & Safety',
        'Clinical Notes': 'Yellow: Human anatomical waste, soiled dressings, expired drugs. Red: Contaminated recyclable plastics (tubings, IV bottles, catheters). White translucent: Sharps, needles. Blue: Broken glassware, ampoules, metallic implants.',
        'Model Answers': 'Never recap needles; Sharps destroyed in puncture-proof white container; Placenta always goes in Yellow non-chlorinated bag; Autoclaving/shredding for Red plastics.',
        'Key High Yield Points': 'Placenta -> Yellow; Blood bag -> Yellow; IV tubing & catheters -> Red; Needles & scalpels -> White puncture proof; Glass vials & ampoules -> Blue',
      },
      {
        'Topic Name': 'Eclampsia & Magnesium Sulfate Regimen',
        'Subject': 'Midwifery / OBG Nursing - II',
        'Unit': 'Unit I (High-Risk Pregnancy)',
        'Clinical Notes': 'Pritchard Regimen: Loading dose 4g IV (20% solution over 5-10 min) PLUS 10g IM (5g 50% in each buttock with 1mL 2% lignocaine). Maintenance: 5g IM 50% every 4 hours alternating buttocks.',
        'Model Answers': 'Monitor 3 clinical signs prior to every dose: Patellar (knee-jerk) reflex present, Respiratory rate >= 12/min, Urine output >= 30 mL/hr (> 100 mL in 4 hours). Antidote: 10 mL 10% Calcium Gluconate IV over 10 minutes.',
        'Key High Yield Points': 'Therapeutic serum Mg level: 4-7 mEq/L; Patellar reflex lost at 8-10 mEq/L; Respiratory arrest at 12 mEq/L; Cardiac arrest at >15 mEq/L',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nursing Topics & Answers');
    XLSX.writeFile(workbook, 'NurseSphere_Nursing_Topics_Syllabus_Template.xlsx');
    audioSynth.playSuccessChime();
  };

  const handleAnalyzeCustomTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopicName.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeTopicWithGemini(customTopicName.trim());
      const newTopic: UploadedTopicRow = {
        id: `ai-topic-${Date.now()}`,
        topicName: customTopicName.trim(),
        subject: res.subject || 'Clinical Nursing',
        unit: res.unit || 'High-Yield Clinical',
        notes: res.detailedNotes,
        answers: res.modelAnswer,
        keyPoints: res.highYieldPoints,
        diagramType: (res.diagramType as any) || 'pph',
        parsedDate: new Date().toISOString().split('T')[0],
      };
      setTopics((prev) => [newTopic, ...prev]);
      setSelectedTopic(newTopic);
      setCustomTopicName('');
      addXP(30);
      audioSynth.playSuccessChime();
    } catch (err) {
      console.error(err);
      audioSynth.playErrorBuzz();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || t.subject.toLowerCase().includes(subjectFilter.toLowerCase());
    return matchesSearch && matchesSubject;
  });

  return (
    <div id="excel-topic-viewer-container" className="space-y-6">
      {/* Header & Excel Upload Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Excel Syllabus Topics, Answers & Flowchart Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload your class Excel sheets or browse pre-loaded topics with clinical algorithms & diagrams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadExcelTemplate}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition"
            title="Download formatted Excel workbook with sample topics, answers, and syllabus columns"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Download Excel Template (.xlsx)
          </button>

          <label className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition active:scale-95">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Topics File (.xlsx, .csv)</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Success Alert */}
      <AnimatePresence>
        {uploadSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-100"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{uploadSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Topic Expander Form */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleAnalyzeCustomTopic} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customTopicName}
            onChange={(e) => setCustomTopicName(e.target.value)}
            placeholder="Add any topic (e.g., Eclampsia MgSO4 Protocol, KMC frog position, or Chi-Square formula)..."
            className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !customTopicName.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
          >
            {isAnalyzing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Analyze & Diagram Topic</span>
          </button>
        </form>
      </div>

      {/* Anime Study Squad Mentors Guidance */}
      <AnimeStudySquad compact contextFilter="syllabus" />

      {/* Main Grid: Left Topics List (4 cols), Right Detail + Interactive Flowchart (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, answers, keywords..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="all">All Subjects</option>
              <option value="midwifery">Midwifery / OBG</option>
              <option value="child">Child Health</option>
              <option value="community">Community Health</option>
              <option value="research">Research & Stats</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    audioSynth.playClick();
                    setSelectedTopic(topic);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 dark:text-emerald-100 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {topic.subject}
                      </span>
                      <span className="text-[10px] text-slate-400">{topic.unit}</span>
                    </div>
                    <h4 className="text-xs font-bold leading-snug">{topic.topicName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {topic.notes}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Topic Details & Interactive Flowchart */}
        <div className="lg:col-span-7 space-y-6">
          {/* Topic Detail Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {selectedTopic.subject} • {selectedTopic.unit}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedTopic.topicName}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Date: {selectedTopic.parsedDate}</span>
            </div>

            {/* Model Notes & Answers */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Clinical Theory & Core Concepts:
                </span>
                <p className="text-slate-700 dark:text-slate-300">{selectedTopic.notes}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                  Model Exam Answer & Clinical Management:
                </span>
                <p className="text-emerald-950 dark:text-emerald-100">{selectedTopic.answers}</p>
              </div>
            </div>

            {/* High Yield Key Points */}
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">
                High-Yield Viva & Exam Bullet Points:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedTopic.keyPoints.map((pt, pIdx) => (
                  <li
                    key={pIdx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Clinical Algorithms & Flowchart Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-emerald-600" />
                  Clinical Algorithm Flowcharts & Triage Trees
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Evidence-based step-by-step decision algorithms with branch logic
                </p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto max-w-xs sm:max-w-md">
                {CLINICAL_ALGORITHMS.map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => setActiveAlgorithm(algo)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                      activeAlgorithm.id === algo.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {algo.category}
                  </button>
                ))}
              </div>
            </div>

            {/* Algorithm Info */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {activeAlgorithm.title}
                </span>
                <span className="text-[10px] text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {activeAlgorithm.sourceGuideline}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {activeAlgorithm.summary}
              </p>
            </div>

            {/* Dynamic High Quality Clinical Topic Illustration */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900">
              <div className="h-44 sm:h-56 w-full relative">
                <img
                  src={
                    activeAlgorithm.id.includes('pph') || activeAlgorithm.id.includes('amtsl')
                      ? CLINICAL_IMAGE_ASSETS.pphDiagram
                      : activeAlgorithm.id.includes('bmw')
                      ? CLINICAL_IMAGE_ASSETS.biomedicalWasteBins
                      : CLINICAL_IMAGE_ASSETS.neonatalCareNrp
                  }
                  alt={activeAlgorithm.title}
                  className="w-full h-full object-cover filter brightness-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold drop-shadow">
                    Clinical Diagram Reference: {activeAlgorithm.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 backdrop-blur border border-white/20">
                    High Resolution Medical Atlas
                  </span>
                </div>
              </div>
            </div>

            {/* SPECIAL INTERACTIVE APGAR CALCULATOR if APGAR is selected */}
            {activeAlgorithm.id === 'apgar-matrix' && (
              <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                    Interactive Live APGAR Calculator
                  </span>
                  <span className="text-sm font-black px-3 py-1 rounded-full bg-teal-600 text-white">
                    Score: {totalApgar} / 10 (
                    {totalApgar >= 7
                      ? 'Normal Transition'
                      : totalApgar >= 4
                      ? 'Moderate Distress'
                      : 'Severe Depression'}
                    )
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  {/* Appearance */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Appearance</span>
                    <select
                      value={apgarScores.appearance}
                      onChange={(e) => setApgarScores((p) => ({ ...p, appearance: Number(e.target.value) }))}
                      className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value={0}>0: Blue/Pale all over</option>
                      <option value={1}>1: Acrocyanosis (Pink body, blue hands)</option>
                      <option value={2}>2: Completely pink</option>
                    </select>
                  </div>

                  {/* Pulse */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Pulse (HR)</span>
                    <select
                      value={apgarScores.pulse}
                      onChange={(e) => setApgarScores((p) => ({ ...p, pulse: Number(e.target.value) }))}
                      className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value={0}>0: Absent</option>
                      <option value={1}>1: &lt; 100 bpm</option>
                      <option value={2}>2: &gt;= 100 bpm</option>
                    </select>
                  </div>

                  {/* Grimace */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Grimace (Reflex)</span>
                    <select
                      value={apgarScores.grimace}
                      onChange={(e) => setApgarScores((p) => ({ ...p, grimace: Number(e.target.value) }))}
                      className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value={0}>0: Flaccid / No response</option>
                      <option value={1}>1: Grimace / weak motion</option>
                      <option value={2}>2: Cry, cough, sneeze</option>
                    </select>
                  </div>

                  {/* Activity */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Activity (Tone)</span>
                    <select
                      value={apgarScores.activity}
                      onChange={(e) => setApgarScores((p) => ({ ...p, activity: Number(e.target.value) }))}
                      className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value={0}>0: Limp</option>
                      <option value={1}>1: Some extremity flexion</option>
                      <option value={2}>2: Active spontaneous motion</option>
                    </select>
                  </div>

                  {/* Respiration */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Respiration</span>
                    <select
                      value={apgarScores.respiration}
                      onChange={(e) => setApgarScores((p) => ({ ...p, respiration: Number(e.target.value) }))}
                      className="w-full p-1.5 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value={0}>0: Absent (Apnea)</option>
                      <option value={1}>1: Slow / Irregular</option>
                      <option value={2}>2: Vigorous good cry</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step-by-Step Flowchart Nodes */}
            <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {activeAlgorithm.steps.map((st, sIdx) => (
                <div key={st.id} className="relative pl-10">
                  <div className="absolute left-2 top-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center -translate-x-1/2">
                    {sIdx + 1}
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs shadow-sm">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      {st.title}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300">{st.description}</p>

                    <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-medium">
                      <span className="font-bold text-[10px] uppercase text-emerald-800 dark:text-emerald-300 block">
                        Action Required:
                      </span>
                      {st.actionRequired}
                    </div>

                    {st.criticalNote && (
                      <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-medium text-[11px] border border-amber-200/60 dark:border-amber-900/40">
                        <span className="font-bold text-[10px] uppercase text-amber-800 dark:text-amber-400 block">
                          Critical Safety Note:
                        </span>
                        {st.criticalNote}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
