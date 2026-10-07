import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { OwnerProvider, useOwner } from './context/OwnerContext';
import { ActiveTab } from './types';

// Components
import { WebsiteHeader } from './components/WebsiteHeader';
import { WebsiteFooter } from './components/WebsiteFooter';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SyllabusBookReader } from './components/SyllabusBookReader';
import { VirtualOTSimulator } from './components/VirtualOTSimulator';
import { GameCenter } from './components/GameCenter';
import { QuizArena } from './components/QuizArena';
import { ExcelTopicViewer } from './components/ExcelTopicViewer';
import { PresentationMaker } from './components/PresentationMaker';
import { PdfNotesExtractor } from './components/PdfNotesExtractor';
import { OwnerStudio } from './components/OwnerStudio';
import { AiAssistantChat } from './components/AiAssistantChat';
import { AnimeStudySquad } from './components/AnimeStudySquad';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { audioSynth } from './utils/audioSynthesizer';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('syllabus');
  const [navigationContextId, setNavigationContextId] = useState<string | undefined>(undefined);
  const [externalAiPrompt, setExternalAiPrompt] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleTabSwitch = (tab: ActiveTab, contextId?: string) => {
    audioSynth.playClick();
    setNavigationContextId(contextId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuizForTopic = (subjectName: string, topicName: string) => {
    audioSynth.playClick();
    setActiveTab('quiz');
  };

  const handleAskAiPreceptor = (query: string) => {
    setExternalAiPrompt(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Modern Multi-Functional Website Header */}
      <WebsiteHeader
        activeTab={activeTab}
        setActiveTab={(tab) => handleTabSwitch(tab)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Website Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {(activeTab === 'syllabus' || activeTab === 'textbook') && (
            <motion.div
              key={`syllabus-${navigationContextId || 'default'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <SyllabusBookReader
                initialSubjectId={navigationContextId}
                initialChapterId={navigationContextId}
                onStartQuizForTopic={handleStartQuizForTopic}
                onAskAiPreceptor={handleAskAiPreceptor}
              />
            </motion.div>
          )}

          {activeTab === 'virtual-ot' && (
            <motion.div
              key={`virtual-ot-${navigationContextId || 'default'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <VirtualOTSimulator initialProcedureId={navigationContextId} />
            </motion.div>
          )}

          {activeTab === 'pdf-notes' && (
            <motion.div
              key="pdf-notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <PdfNotesExtractor onAskAiPreceptor={handleAskAiPreceptor} />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <QuizArena />
            </motion.div>
          )}

          {activeTab === 'diagrams-excel' && (
            <motion.div
              key="diagrams-excel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <ExcelTopicViewer />
            </motion.div>
          )}

          {activeTab === 'presentation' && (
            <motion.div
              key="presentation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <PresentationMaker />
            </motion.div>
          )}

          {activeTab === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <GameCenter />
            </motion.div>
          )}

          {activeTab === 'anime-squad' && (
            <motion.div
              key="anime-squad"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <AnimeStudySquad />
            </motion.div>
          )}

          {activeTab === 'owner' && (
            <motion.div
              key="owner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
            >
              <OwnerStudio
                onNavigateToSyllabus={() => handleTabSwitch('syllabus')}
                onNavigateToOt={() => handleTabSwitch('virtual-ot')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Institutional Website Footer */}
      <WebsiteFooter onNavigate={(tab) => handleTabSwitch(tab)} />

      {/* Global Quick Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab, id) => handleTabSwitch(tab, id)}
      />

      {/* Universal Always-On Clinical AI Preceptor Chat Widget with PDF Upload Support */}
      <AiAssistantChat
        externalPrompt={externalAiPrompt}
        onClearExternalPrompt={() => setExternalAiPrompt(null)}
        onOpenPdfExtractor={() => handleTabSwitch('pdf-notes')}
      />

      {/* PWA & Offline Support */}
      <PWAInstallButton variant="banner" />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <OwnerProvider>
        <AppContent />
      </OwnerProvider>
    </ThemeProvider>
  );
}
