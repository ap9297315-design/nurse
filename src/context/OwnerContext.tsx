import React, { createContext, useContext, useState, useEffect } from 'react';
import { SyllabusSubject, TextbookChapter, OTProcedure, OwnerSettings, PdfDocumentNote } from '../types';
import { SYLLABUS_SUBJECTS, TEXTBOOK_CHAPTERS } from '../data/syllabusData';
import { OT_PROCEDURES } from '../data/otSimulationData';

interface OwnerContextType {
  isOwnerMode: boolean;
  toggleOwnerMode: (pin?: string) => boolean;
  setOwnerModeDirectly: (active: boolean) => void;
  ownerSettings: OwnerSettings;
  updateOwnerSettings: (newSettings: Partial<OwnerSettings>) => void;
  // Custom Syllabus Subjects
  subjects: SyllabusSubject[];
  updateSubject: (updated: SyllabusSubject) => void;
  addSubject: (newSubject: SyllabusSubject) => void;
  deleteSubject: (subjectId: string) => void;
  // Custom Textbook Chapters
  chapters: TextbookChapter[];
  updateChapter: (updated: TextbookChapter) => void;
  addChapter: (newChapter: TextbookChapter) => void;
  deleteChapter: (chapterId: string) => void;
  // Custom Procedures
  procedures: OTProcedure[];
  updateProcedure: (updated: OTProcedure) => void;
  addProcedure: (newProc: OTProcedure) => void;
  // Saved Notes from PDF & AI Assistant
  savedPdfNotes: PdfDocumentNote[];
  savePdfNote: (note: Omit<PdfDocumentNote, 'id' | 'createdAt'>) => PdfDocumentNote;
  deletePdfNote: (id: string) => void;
  // Backup and Restore
  exportAllDataAsJson: () => string;
  importDataFromJson: (jsonStr: string) => boolean;
  resetToIncDefaults: () => void;
}

const DEFAULT_OWNER_SETTINGS: OwnerSettings = {
  portalTitle: 'NurseSphere Clinical Academy',
  portalSubtitle: 'Advanced B.Sc Nursing Portal & Virtual Operating Suite (INC Aligned)',
  announcementBanner: '📢 Welcome Students: 2026 INC Clinical OSCE & Virtual OT Modules are Live! Upload your textbook PDFs in AI Assistant for instant notes & exam answers.',
  isAnnouncementActive: true,
  instituteName: 'College of Nursing & Health Sciences',
  contactEmail: 'preceptor@nursesphere.edu.in',
  allowGuestSubmissions: true,
  showAnimeSquad: true,
  customLogoText: 'NurseSphere',
  ownerPin: '1234',
};

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'nursesphere_owner_settings',
  OWNER_AUTH: 'nursesphere_is_owner_authenticated',
  SUBJECTS: 'nursesphere_custom_subjects',
  CHAPTERS: 'nursesphere_custom_chapters',
  PROCEDURES: 'nursesphere_custom_procedures',
  PDF_NOTES: 'nursesphere_saved_pdf_notes',
};

export const OwnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.OWNER_AUTH) === 'true';
  });

  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_OWNER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_OWNER_SETTINGS;
    } catch {
      return DEFAULT_OWNER_SETTINGS;
    }
  });

  const [subjects, setSubjects] = useState<SyllabusSubject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return saved ? JSON.parse(saved) : SYLLABUS_SUBJECTS;
    } catch {
      return SYLLABUS_SUBJECTS;
    }
  });

  const [chapters, setChapters] = useState<TextbookChapter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
      return saved ? JSON.parse(saved) : TEXTBOOK_CHAPTERS;
    } catch {
      return TEXTBOOK_CHAPTERS;
    }
  });

  const [procedures, setProcedures] = useState<OTProcedure[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
      return saved ? JSON.parse(saved) : OT_PROCEDURES;
    } catch {
      return OT_PROCEDURES;
    }
  });

  const [savedPdfNotes, setSavedPdfNotes] = useState<PdfDocumentNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PDF_NOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(ownerSettings));
  }, [ownerSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
  }, [procedures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PDF_NOTES, JSON.stringify(savedPdfNotes));
  }, [savedPdfNotes]);

  const toggleOwnerMode = (pin?: string): boolean => {
    if (isOwnerMode) {
      setIsOwnerMode(false);
      localStorage.setItem(STORAGE_KEYS.OWNER_AUTH, 'false');
      return false;
    }
    // Check PIN if provided or allow default '1234'
    const validPin = ownerSettings.ownerPin || '1234';
    if (!pin || pin.trim() === validPin.trim()) {
      setIsOwnerMode(true);
      localStorage.setItem(STORAGE_KEYS.OWNER_AUTH, 'true');
      return true;
    }
    return false;
  };

  const setOwnerModeDirectly = (active: boolean) => {
    setIsOwnerMode(active);
    localStorage.setItem(STORAGE_KEYS.OWNER_AUTH, active ? 'true' : 'false');
  };

  const updateOwnerSettings = (newSettings: Partial<OwnerSettings>) => {
    setOwnerSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Subjects Management
  const updateSubject = (updated: SyllabusSubject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const addSubject = (newSubject: SyllabusSubject) => {
    setSubjects((prev) => [newSubject, ...prev]);
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  // Chapters Management
  const updateChapter = (updated: TextbookChapter) => {
    setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const addChapter = (newChapter: TextbookChapter) => {
    setChapters((prev) => [newChapter, ...prev]);
  };

  const deleteChapter = (chapterId: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
  };

  // Procedures Management
  const updateProcedure = (updated: OTProcedure) => {
    setProcedures((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const addProcedure = (newProc: OTProcedure) => {
    setProcedures((prev) => [...prev, newProc]);
  };

  // Saved Notes Management
  const savePdfNote = (noteData: Omit<PdfDocumentNote, 'id' | 'createdAt'>): PdfDocumentNote => {
    const newNote: PdfDocumentNote = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toLocaleString(),
    };
    setSavedPdfNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const deletePdfNote = (id: string) => {
    setSavedPdfNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Export & Import
  const exportAllDataAsJson = (): string => {
    const bundle = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      ownerSettings,
      subjects,
      chapters,
      procedures,
      savedPdfNotes,
    };
    return JSON.stringify(bundle, null, 2);
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.ownerSettings) setOwnerSettings(parsed.ownerSettings);
      if (Array.isArray(parsed.subjects)) setSubjects(parsed.subjects);
      if (Array.isArray(parsed.chapters)) setChapters(parsed.chapters);
      if (Array.isArray(parsed.procedures)) setProcedures(parsed.procedures);
      if (Array.isArray(parsed.savedPdfNotes)) setSavedPdfNotes(parsed.savedPdfNotes);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  };

  const resetToIncDefaults = () => {
    setSubjects(SYLLABUS_SUBJECTS);
    setChapters(TEXTBOOK_CHAPTERS);
    setProcedures(OT_PROCEDURES);
    setOwnerSettings(DEFAULT_OWNER_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.CHAPTERS);
    localStorage.removeItem(STORAGE_KEYS.PROCEDURES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <OwnerContext.Provider
      value={{
        isOwnerMode,
        toggleOwnerMode,
        setOwnerModeDirectly,
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
        updateProcedure,
        addProcedure,
        savedPdfNotes,
        savePdfNote,
        deletePdfNote,
        exportAllDataAsJson,
        importDataFromJson,
        resetToIncDefaults,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwner = () => {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error('useOwner must be used within OwnerProvider');
  }
  return context;
};
