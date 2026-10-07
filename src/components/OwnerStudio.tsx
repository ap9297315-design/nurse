import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Settings,
  BookOpen,
  FileText,
  Activity,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Check,
  Bell,
  Building,
  Key,
  Save,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { useOwner } from '../context/OwnerContext';
import { SyllabusSubject, TextbookChapter, OTProcedure } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

export const OwnerStudio: React.FC = () => {
  const {
    isOwnerMode,
    toggleOwnerMode,
    ownerSettings,
    updateOwnerSettings,
    subjects,
    updateSubject,
    addSubject,
    deleteSubject,
    chapters,
    updateChapter,
    addChapter,
    deleteChapter,
    procedures,
    exportAllDataAsJson,
    importDataFromJson,
    resetToIncDefaults,
  } = useOwner();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'syllabus' | 'chapters' | 'ot' | 'backup'>('settings');
  const [saveToast, setSaveToast] = useState(false);

  // Editing states
  const [editingSubject, setEditingSubject] = useState<SyllabusSubject | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingChapter, setEditingChapter] = useState<TextbookChapter | null>(null);
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  // Settings form state
  const [formData, setFormData] = useState({ ...ownerSettings });

  const triggerSaveSuccess = () => {
    audioSynth.playSuccessChime();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = toggleOwnerMode(pinInput);
    if (success) {
      audioSynth.playSuccessChime();
      setPinError(false);
      setPinInput('');
    } else {
      audioSynth.playWarningAlert();
      setPinError(true);
    }
  };

  const handleLock = () => {
    toggleOwnerMode();
    audioSynth.playClick();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateOwnerSettings(formData);
    triggerSaveSuccess();
  };

  // Export JSON file
  const handleExportJson = () => {
    const json = exportAllDataAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nursesphere_custom_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audioSynth.playSuccessChime();
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const ok = importDataFromJson(content);
      if (ok) {
        audioSynth.playSuccessChime();
        alert('Customization backup restored successfully! All syllabus and settings are updated.');
      } else {
        alert('Invalid backup file format. Please check the JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  // Handle Reset to Defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all syllabus subjects, chapters, and settings back to official INC guidelines?'
      )
    ) {
      resetToIncDefaults();
      setFormData({ ...ownerSettings });
      audioSynth.playSuccessChime();
    }
  };

  // Render Lock Screen if not authenticated
  if (!isOwnerMode) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Owner & Administration Studio
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your Owner PIN to customize the syllabus, create new textbook modules, broadcast announcements, and modify website settings.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Owner Security PIN:
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Default PIN: 1234"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 ${
                  pinError
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                }`}
              />
            </div>
            {pinError && (
              <span className="text-[11px] text-rose-500 font-semibold block">
                Incorrect PIN. (Default owner PIN is 1234)
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Owner Customization Mode</span>
          </button>
        </form>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-[11px] text-slate-500 text-left border border-slate-200 dark:border-slate-800 flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>
            <strong>Preceptor Note:</strong> As the owner, any modifications you make will update live across
            all student views and persist safely in your browser storage. Default PIN is <strong>1234</strong>.
          </span>
        </div>
      </div>
    );
  }

  // Authenticated Owner View
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-teal-800/40">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Owner Mode Active
              </span>
              <span className="text-xs text-slate-300">Administrative Access Granted</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Website Owner & Curriculum Control Center
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              Make changes directly to syllabus subjects, textbook chapters, clinical competencies, broadcast banners,
              and branding. All changes take effect immediately across the website.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
              title="Download backup file"
            >
              <Download className="w-3.5 h-3.5" /> Export Backup
            </button>
            <button
              onClick={handleLock}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Lock Studio
            </button>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {saveToast && (
        <div className="p-3 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 max-w-md">
          <Check className="w-4 h-4" />
          <span>Changes saved successfully! The live website is now updated.</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'settings'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> Portal Settings & Banner
        </button>

        <button
          onClick={() => setActiveSubTab('syllabus')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'syllabus'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Syllabus & Subjects ({subjects.length})
        </button>

        <button
          onClick={() => setActiveSubTab('chapters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'chapters'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Textbook Modules ({chapters.length})
        </button>

        <button
          onClick={() => setActiveSubTab('ot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'ot'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> OT Procedures ({procedures.length})
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'backup'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Backup, Restore & Reset
        </button>
      </div>

      {/* Tab 1: Portal Settings & Announcements */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Website Branding & Announcements
              </h3>
              <p className="text-xs text-slate-500">
                Customize titles, college information, and the top announcement banner shown to students.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" /> Save All Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Portal Brand Name:
              </label>
              <input
                type="text"
                value={formData.portalTitle}
                onChange={(e) => setFormData({ ...formData, portalTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Institute / College Name:
              </label>
              <input
                type="text"
                value={formData.instituteName}
                onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Portal Subtitle & Academic Tagline:
              </label>
              <input
                type="text"
                value={formData.portalSubtitle}
                onChange={(e) => setFormData({ ...formData, portalSubtitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Broadcast Announcement Bar to All Students:</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAnnouncementActive}
                    onChange={(e) => setFormData({ ...formData, isAnnouncementActive: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Show Announcement</span>
                </label>
              </div>
              <textarea
                rows={2}
                value={formData.announcementBanner}
                onChange={(e) => setFormData({ ...formData, announcementBanner: e.target.value })}
                placeholder="e.g. 📢 Notice: Obstetrics practical OSCE viva begins this Friday at 9:00 AM..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Owner Security PIN (to unlock this Studio):
              </label>
              <input
                type="text"
                value={formData.ownerPin}
                onChange={(e) => setFormData({ ...formData, ownerPin: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Preceptor / Support Email:
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Syllabus & Subjects Manager */}
      {activeSubTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Syllabus Curriculum Subjects ({subjects.length})
              </h3>
              <p className="text-xs text-slate-500">
                Add new subjects, edit codes, theory/practical credits, and curriculum units.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingSubject(true);
                setEditingSubject({
                  id: `subject-${Date.now()}`,
                  title: 'New Clinical Subject',
                  code: 'N-CLN-01',
                  semester: 'Semester VI',
                  credits: { theory: 3, practicalLab: 1, clinical: 2 },
                  theoryHours: 60,
                  practicalHours: 120,
                  description: 'Comprehensive clinical competencies and nursing interventions.',
                  recommendedTextbooks: ['Textbook Reference 1', 'Clinical Guide 2'],
                  units: [],
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Subject
            </button>
          </div>

          {/* Subject Editor Modal / Card */}
          {editingSubject && (
            <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border-2 border-teal-500 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                  {isAddingSubject ? 'Add New Subject' : `Edit Subject: ${editingSubject.title}`}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isAddingSubject) {
                        addSubject(editingSubject);
                      } else {
                        updateSubject(editingSubject);
                      }
                      setEditingSubject(null);
                      setIsAddingSubject(false);
                      triggerSaveSuccess();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Subject
                  </button>
                  <button
                    onClick={() => {
                      setEditingSubject(null);
                      setIsAddingSubject(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Subject Title:
                  </label>
                  <input
                    type="text"
                    value={editingSubject.title}
                    onChange={(e) => setEditingSubject({ ...editingSubject, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Subject Code:
                  </label>
                  <input
                    type="text"
                    value={editingSubject.code}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Semester / Year:
                  </label>
                  <input
                    type="text"
                    value={editingSubject.semester}
                    onChange={(e) => setEditingSubject({ ...editingSubject, semester: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Course Description:
                  </label>
                  <input
                    type="text"
                    value={editingSubject.description || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subjects List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        {subj.code} • {subj.semester}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {subj.title}
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {subj.units?.length || 0} Units
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {subj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Theory: {subj.theoryHours}h • Practical: {subj.practicalHours}h
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingSubject(subj);
                        setIsAddingSubject(false);
                      }}
                      className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete subject "${subj.title}"?`)) {
                          deleteSubject(subj.id);
                          triggerSaveSuccess();
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Textbook Chapters Manager */}
      {activeSubTab === 'chapters' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Interactive Textbook Chapters & Clinical Modules ({chapters.length})
              </h3>
              <p className="text-xs text-slate-500">
                Add, edit, or customize full textbook chapters with clinical pearls, drug cards, and care plans.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingChapter(true);
                setEditingChapter({
                  id: `ch-${Date.now()}`,
                  subjectId: subjects[0]?.id || 'midwifery-2',
                  unitId: 'unit-1',
                  title: 'New Clinical Chapter',
                  subtitle: 'Clinical manifestations, pharmacology & nursing management',
                  authorReference: 'D.C. Dutta / Ghai Essentials',
                  definition: 'Clinical definition and pathophysiological mechanism.',
                  etiologyAndRiskFactors: ['Primary etiology', 'Secondary clinical risk factor'],
                  pathophysiology: 'Pathological cascade from cellular insult to clinical decompensation.',
                  clinicalManifestations: ['Cardinal sign 1', 'Clinical symptom 2'],
                  diagnosticEvaluation: ['Primary diagnostic lab', 'Imaging / Ultrasound'],
                  nursingManagement: {
                    immediateAssessment: ['Immediate ABC check', 'Vital signs cycling'],
                    priorityInterventions: ['Oxygenation', 'Vascular access'],
                    monitoringProtocol: 'Continuous monitoring every 15 minutes.',
                  },
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Chapter
            </button>
          </div>

          {/* Chapter Edit Form */}
          {editingChapter && (
            <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border-2 border-teal-500 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                  {isAddingChapter ? 'Add New Chapter' : `Edit: ${editingChapter.title}`}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isAddingChapter) {
                        addChapter(editingChapter);
                      } else {
                        updateChapter(editingChapter);
                      }
                      setEditingChapter(null);
                      setIsAddingChapter(false);
                      triggerSaveSuccess();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Chapter
                  </button>
                  <button
                    onClick={() => {
                      setEditingChapter(null);
                      setIsAddingChapter(false);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Chapter Title:
                  </label>
                  <input
                    type="text"
                    value={editingChapter.title}
                    onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Author / Textbook Reference:
                  </label>
                  <input
                    type="text"
                    value={editingChapter.authorReference}
                    onChange={(e) => setEditingChapter({ ...editingChapter, authorReference: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Subtitle:
                  </label>
                  <input
                    type="text"
                    value={editingChapter.subtitle}
                    onChange={(e) => setEditingChapter({ ...editingChapter, subtitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Clinical Definition:
                  </label>
                  <textarea
                    rows={2}
                    value={editingChapter.definition}
                    onChange={(e) => setEditingChapter({ ...editingChapter, definition: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Pathophysiology Summary:
                  </label>
                  <textarea
                    rows={3}
                    value={editingChapter.pathophysiology}
                    onChange={(e) => setEditingChapter({ ...editingChapter, pathophysiology: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Chapters List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((ch) => (
              <div
                key={ch.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {ch.authorReference}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ch.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {ch.definition}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Subject: {ch.subjectId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingChapter(ch);
                        setIsAddingChapter(false);
                      }}
                      className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                      title="Edit Chapter"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete chapter "${ch.title}"?`)) {
                          deleteChapter(ch.id);
                          triggerSaveSuccess();
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: OT Procedures Overview */}
      {activeSubTab === 'ot' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Virtual Operating Theatre Simulation Procedures ({procedures.length})
            </h3>
            <p className="text-xs text-slate-500">
              High-fidelity clinical procedures configured in the interactive VR simulation engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procedures.map((proc) => (
              <div
                key={proc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {proc.category} • {proc.difficulty}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {proc.title}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                    {proc.steps.length} Steps
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {proc.indication}
                </p>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <span>Patient: {proc.patientProfile.name} ({proc.patientProfile.gravidaPara})</span>
                  <span>Initial HR: {proc.patientProfile.initialVitals.hr} bpm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Backup, Restore & Reset */}
      {activeSubTab === 'backup' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Site Reset
            </h3>
            <p className="text-xs text-slate-500">
              Export all your custom changes as a standalone JSON file, restore on any device, or reset back to official INC guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export */}
            <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-3">
              <Download className="w-6 h-6 text-teal-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Export All Data</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Save all customized syllabus subjects, chapters, notes, and site settings to a single JSON file.
                </p>
              </div>
              <button
                onClick={handleExportJson}
                className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
              >
                Download JSON Backup
              </button>
            </div>

            {/* Restore */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
              <Upload className="w-6 h-6 text-indigo-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Restore from Backup</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload a previously exported JSON backup file to instantly apply all your custom curriculum content.
                </p>
              </div>
              <label className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm block text-center cursor-pointer">
                <span>Select JSON Backup File</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>

            {/* Reset */}
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <RotateCcw className="w-6 h-6 text-rose-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reset to Official INC</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Clear all local customizations and restore standard Indian Nursing Council syllabus and data.
                </p>
              </div>
              <button
                onClick={handleResetDefaults}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
              >
                Reset to INC Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
