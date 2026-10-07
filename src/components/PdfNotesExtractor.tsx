import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Bookmark,
  Trash2,
  BookOpen,
  HelpCircle,
  Zap,
  GitFork,
  ArrowRight,
  AlertCircle,
  Loader2,
  FileCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { analyzePdfWithGemini } from '../services/geminiService';
import { useOwner } from '../context/OwnerContext';
import { audioSynth } from '../utils/audioSynthesizer';
import { useTheme } from '../context/ThemeContext';

interface PdfNotesExtractorProps {
  onSendToPresentation?: (topicText: string) => void;
  onAskInAiChat?: (prompt: string) => void;
}

type AnalysisMode = 'study-notes' | 'exam-qa' | 'flashcards' | 'algorithm' | 'custom';

interface SampleDoc {
  title: string;
  fileName: string;
  size: string;
  description: string;
  sampleText: string;
}

const SAMPLE_CLINICAL_DOCS: SampleDoc[] = [
  {
    title: 'DC Dutta: Management of Postpartum Hemorrhage (PPH)',
    fileName: 'Dutta_Obstetrics_Ch29_PPH_Protocol.pdf',
    size: '1.4 MB',
    description: 'Active third-stage labor management, Uterine Atony, 4 Ts, Oxytocin, Carboprost & Balloon Tamponade.',
    sampleText: `Postpartum Hemorrhage (PPH) is blood loss >500 mL following vaginal birth or >1000 mL post-cesarean. Primary etiology: The 4 Ts - Tone (uterine atony 70%), Trauma (perineal lacerations 20%), Tissue (retained placenta 10%), Thrombin (coagulopathy 1%). First line treatment: Oxytocin 10-20 IU IV infusion in 500 mL Ringer Lactate. Second line: Methylergometrine 0.2 mg IM (contraindicated in pre-eclampsia/hypertension). Third line: Carboprost (PGF2a) 250 mcg IM (contraindicated in bronchial asthma). Misoprostol 800 mcg sublingually/rectally. Surgical hemostasis includes Bakri balloon tamponade (fill with 300-500 mL warm saline) and B-Lynch compression sutures.`,
  },
  {
    title: 'Neonatal Resuscitation Program (NRP) Golden Minute',
    fileName: 'NRP_Neonatal_Resuscitation_9thEd.pdf',
    size: '2.1 MB',
    description: 'Triage at birth, PPV, MR. SOPA corrective ventilation steps, Chest compressions & Epinephrine.',
    sampleText: `The Golden Minute for newborn resuscitation: Assess Term gestation, Muscle Tone, and Breathing/Crying. If non-vigorous: Warm, Dry, Stimulate, Position airway (Sniffing position). Clear secretions only if obstructed (Mouth then Nose). If heart rate <100 bpm or gasping/apneic: Initiate Positive Pressure Ventilation (PPV) with 21% O2 at 40-60 breaths/min within 60 seconds. If heart rate fails to rise, execute MR. SOPA: Mask adjustment, Reposition airway, Suction mouth/nose, Open mouth, Pressure increase (up to 30 cm H2O), Alternative airway (ETT/LMA). If HR <60 bpm despite 30s effective PPV: 100% O2 and initiate coordinated 3:1 chest compressions to ventilations (90 compressions, 30 breaths per minute). Epinephrine 1:10,000 IV/IO 0.01-0.03 mg/kg.`,
  },
  {
    title: 'Eclampsia & Magnesium Sulfate Regimens (Pritchard vs Zuspan)',
    fileName: 'Eclampsia_Emergency_MgSO4_Guidelines.pdf',
    size: '1.2 MB',
    description: 'Convulsion management, loading dose, maintenance protocol, toxicity triad & Calcium Gluconate.',
    sampleText: `Eclampsia: Occurrence of generalized tonic-clonic convulsions in pre-eclampsia not attributable to other cerebral conditions. Drug of choice: Magnesium Sulfate (MgSO4). Pritchard Regimen: Loading dose of 4g IV (20% solution over 5-10 min) PLUS 10g IM (50% solution, 5g in each buttock with 1 mL 2% lidocaine). Maintenance dose: 5g IM (50% solution) every 4 hours in alternating buttocks. Critical clinical checks prior to each maintenance dose: 1. Patellar / Knee-jerk reflex present, 2. Respiratory rate ≥ 16/min (minimum 12/min), 3. Hourly urine output ≥ 30 mL/hr over preceding 4 hours. Toxicity Triad: Loss of deep tendon reflexes (8-10 mg/dL), Respiratory depression (<12/min at 12 mg/dL), Cardiac arrest (>25 mg/dL). Bedside Antidote: 10 mL of 10% Calcium Gluconate IV given slowly over 10 minutes.`,
  },
];

export const PdfNotesExtractor: React.FC<PdfNotesExtractorProps> = ({
  onSendToPresentation,
  onAskInAiChat,
}) => {
  const { savedPdfNotes, savePdfNote, deletePdfNote } = useOwner();
  const { addXP } = useTheme();

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    base64?: string;
    textSnippet?: string;
  } | null>(null);

  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('study-notes');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'saved'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (isPdf) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = reader.result as string;
        setUploadedFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          base64: base64Data,
        });
        audioSynth.playClick();
      };
    } else {
      // Plain text, markdown, or doc
      reader.readAsText(file);
      reader.onload = () => {
        const text = reader.result as string;
        setUploadedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          textSnippet: text.slice(0, 5000),
        });
        audioSynth.playClick();
      };
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectSample = (sample: SampleDoc) => {
    audioSynth.playClick();
    setUploadedFile({
      name: sample.fileName,
      size: sample.size,
      textSnippet: sample.sampleText,
    });
  };

  // Generate Notes Action
  const handleGenerateNotes = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setGeneratedNotes(null);
    setOfflineNotice(null);
    setIsSaved(false);
    audioSynth.playClick();

    try {
      const response = await analyzePdfWithGemini({
        pdfBase64: uploadedFile.base64,
        textExtraction: uploadedFile.textSnippet,
        fileName: uploadedFile.name,
        mode: selectedMode,
        customQuery: customQuestion.trim() || undefined,
      });

      setGeneratedNotes(response.notes);
      if (response.offlineNotice) {
        setOfflineNotice(response.offlineNotice);
      }
      audioSynth.playSuccessChime();
      addXP(45);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setGeneratedNotes('Unable to generate notes. Please try another file or select a clinical sample.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    audioSynth.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Markdown file
  const handleDownload = () => {
    if (!generatedNotes || !uploadedFile) return;
    const blob = new Blob([generatedNotes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${uploadedFile.name.replace(/\.[^/.]+$/, '')}_${selectedMode}_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
    audioSynth.playSuccessChime();
  };

  // Save to My Notes
  const handleSaveToMyNotes = () => {
    if (!generatedNotes || !uploadedFile) return;
    savePdfNote({
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      mode: selectedMode,
      content: generatedNotes,
      summary: `High-yield clinical ${selectedMode} extracted from ${uploadedFile.name}`,
      tags: ['Clinical Nursing', selectedMode, 'INC Syllabus'],
    });
    setIsSaved(true);
    audioSynth.playSuccessChime();
  };

  const filteredSavedNotes = savedPdfNotes.filter(
    (n) =>
      n.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-teal-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Multimodal Document Engine
              </span>
              <span className="text-xs text-slate-300">Powered by Gemini 3.8 Flash</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              PDF Textbook Notes & Exam Answers Generator
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              Upload your own nursing textbook chapter, research paper, or clinical hospital protocol PDF.
              The AI will read the entire document, extract key competencies, and generate comprehensive
              study notes, model university exam answers, and flashcards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> New Analysis
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> My Saved Notes ({savedPdfNotes.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & Options (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer relative ${
                uploadedFile
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs mx-auto">
                    {uploadedFile.name}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Size: {uploadedFile.size} • Ready for AI Analysis
                  </span>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                    Click to choose a different file
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Upload Your Nursing PDF or Document
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Drag and drop your PDF here, or click to browse from device
                  </p>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Supports .PDF, .TXT, .DOCX (Up to 15 MB)
                  </span>
                </div>
              )}
            </div>

            {/* Quick Sample Clinical PDFs */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Or Try with Instant Clinical PDF Samples:
              </span>
              <div className="space-y-2">
                {SAMPLE_CLINICAL_DOCS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-start justify-between gap-2 ${
                      uploadedFile?.name === sample.fileName
                        ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-950 dark:text-teal-100'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span>{sample.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {sample.description}
                      </p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                      {sample.size}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Extraction Mode Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Generation Target:
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedMode('study-notes')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedMode === 'study-notes'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mb-1" />
                  <span className="text-xs font-bold">Comprehensive Study Notes</span>
                  <span className={`text-[10px] ${selectedMode === 'study-notes' ? 'text-teal-100' : 'text-slate-400'}`}>
                    Full unit summary & pearls
                  </span>
                </button>

                <button
                  onClick={() => setSelectedMode('exam-qa')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedMode === 'exam-qa'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mb-1" />
                  <span className="text-xs font-bold">University Exam Q&A</span>
                  <span className={`text-[10px] ${selectedMode === 'exam-qa' ? 'text-teal-100' : 'text-slate-400'}`}>
                    10M, 5M & 2M Solved Answers
                  </span>
                </button>

                <button
                  onClick={() => setSelectedMode('flashcards')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedMode === 'flashcards'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-4 h-4 mb-1 text-amber-400" />
                  <span className="text-xs font-bold">Rapid Flashcards</span>
                  <span className={`text-[10px] ${selectedMode === 'flashcards' ? 'text-teal-100' : 'text-slate-400'}`}>
                    High-yield facts & values
                  </span>
                </button>

                <button
                  onClick={() => setSelectedMode('algorithm')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedMode === 'algorithm'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <GitFork className="w-4 h-4 mb-1" />
                  <span className="text-xs font-bold">Clinical Algorithm</span>
                  <span className={`text-[10px] ${selectedMode === 'algorithm' ? 'text-teal-100' : 'text-slate-400'}`}>
                    Step-by-step decision tree
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Question or Focus Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Custom Question or Specific Focus (Optional):</span>
                <span className="text-[10px] text-slate-400">e.g. Nursing Care Plan</span>
              </label>
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g. Focus on nursing interventions for uterine atony and dosage of oxytocin..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Generate Button */}
            <button
              id="btn-generate-pdf-notes"
              onClick={handleGenerateNotes}
              disabled={!uploadedFile || isProcessing}
              className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing PDF & Generating Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Notes & Solved Answers</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Generated Notes Viewer (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[560px] flex flex-col justify-between space-y-4">
              {/* Header with Title and Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {uploadedFile ? uploadedFile.name : 'Generated Clinical Notes Preview'}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      Mode: {selectedMode.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {generatedNotes && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition"
                      title="Download Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>

                    <button
                      onClick={handleSaveToMyNotes}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isSaved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                      title="Save note to My Saved Notes list"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isSaved ? 'Saved to Portal' : 'Save Note'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto max-h-[540px] pr-2 space-y-4">
                {isProcessing ? (
                  <div className="h-96 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 border-2 border-teal-500/40 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Gemini AI is reading "{uploadedFile?.name}"...
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Extracting core pathologies, pharmacological regimens, priority nursing diagnoses, and examination questions.
                      </p>
                    </div>
                  </div>
                ) : generatedNotes ? (
                  <div className="space-y-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {offlineNotice && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>{offlineNotice}</span>
                      </div>
                    )}

                    {/* Formatted Markdown Display */}
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans">
                      {generatedNotes}
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No Document Analyzed Yet
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                        Upload your textbook PDF on the left or select a pre-loaded clinical sample, then click "Generate Notes & Solved Answers".
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick-Action Shortcuts */}
              {generatedNotes && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 text-[11px]">Next Steps:</span>
                  <div className="flex items-center gap-2">
                    {onSendToPresentation && (
                      <button
                        onClick={() => onSendToPresentation(uploadedFile?.name || 'Clinical Topic')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold hover:bg-indigo-100 transition flex items-center gap-1"
                      >
                        <span>Convert to Slide Deck →</span>
                      </button>
                    )}

                    {onAskInAiChat && (
                      <button
                        onClick={() =>
                          onAskInAiChat(
                            `Review these clinical notes from ${uploadedFile?.name || 'my document'} and quiz me on the key nursing actions:`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold hover:bg-teal-100 transition flex items-center gap-1"
                      >
                        <span>Quiz Me in AI Assistant →</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Saved Notes Tab */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved clinical notes & answers..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-xs text-slate-500">
              {filteredSavedNotes.length} saved document {filteredSavedNotes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>

          {filteredSavedNotes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Saved Notes Found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                When you analyze a PDF document, click "Save Note" to store it in your personal clinical library.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow transition"
              >
                Analyze a Document Now →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSavedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">
                          {note.fileName}
                        </h4>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {note.mode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {note.content.replace(/[#*`]/g, '').slice(0, 200)}...
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">{note.createdAt}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setGeneratedNotes(note.content);
                          setUploadedFile({ name: note.fileName, size: note.fileSize || 'PDF' });
                          setSelectedMode(note.mode);
                          setActiveTab('upload');
                        }}
                        className="px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 transition"
                      >
                        Open Note
                      </button>
                      <button
                        onClick={() => deletePdfNote(note.id)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
