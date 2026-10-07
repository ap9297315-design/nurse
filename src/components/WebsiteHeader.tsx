import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  FileText,
  Activity,
  Award,
  Sparkles,
  Presentation,
  Volume2,
  VolumeX,
  Palette,
  ShieldCheck,
  Search,
  Menu,
  X,
  Bell,
  Sliders,
  Gamepad2,
  GraduationCap,
  Lock,
  Unlock,
  UploadCloud,
} from 'lucide-react';
import { ActiveTab, ThemeMode } from '../types';
import { useOwner } from '../context/OwnerContext';
import { useTheme } from '../context/ThemeContext';
import { audioSynth } from '../utils/audioSynthesizer';

interface WebsiteHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
}) => {
  const { ownerSettings, isOwnerMode } = useOwner();
  const { theme, setTheme, soundEnabled, setSoundEnabled, userXP, nurseRank } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissAnnouncement, setDismissAnnouncement] = useState(false);

  const toggleThemeCycle = () => {
    audioSynth.playClick();
    const themes: ThemeMode[] = ['clinical', 'night', 'surgical', 'warm'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioSynth.setEnabled(next);
    if (next) audioSynth.playSuccessChime();
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'syllabus', label: 'Curriculum', icon: BookOpen },
    { id: 'textbook', label: 'Clinical Textbook', icon: FileText },
    { id: 'virtual-ot', label: 'Virtual OT & LR', icon: Activity, badge: 'VR Suite' },
    { id: 'pdf-notes', label: 'PDF Notes & Solved Q&A', icon: UploadCloud, badge: 'AI Vision' },
    { id: 'quiz', label: 'NCLEX Quiz', icon: Award },
    { id: 'diagrams-excel', label: 'Excel & Flowcharts', icon: Sliders },
    { id: 'presentation', label: 'Slide Deck Maker', icon: Presentation },
    { id: 'games', label: 'Game Arena', icon: Gamepad2 },
    { id: 'owner', label: 'Owner Studio', icon: ShieldCheck, badge: isOwnerMode ? 'Admin' : 'Owner' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* Top Announcement Bar (Configured by Owner) */}
      {ownerSettings.isAnnouncementActive && !dismissAnnouncement && (
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-800 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-5xl truncate mx-auto">
            <Bell className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-bounce" />
            <span className="truncate">{ownerSettings.announcementBanner}</span>
          </div>
          <button
            onClick={() => setDismissAnnouncement(true)}
            className="text-teal-200 hover:text-white transition ml-2 p-0.5"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={() => {
              setActiveTab('syllabus');
              audioSynth.playClick();
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-teal-500/20 relative">
              <GraduationCap className="w-6 h-6" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {ownerSettings.portalTitle}
                </h1>
                {isOwnerMode && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                    OWNER
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                {ownerSettings.instituteName}
              </p>
            </div>
          </div>

          {/* Center Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isOwnerTab = item.id === 'owner';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    audioSynth.playClick();
                    setActiveTab(item.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative whitespace-nowrap ${
                    isActive
                      ? isOwnerTab
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-teal-600 text-white shadow-sm'
                      : isOwnerTab && isOwnerMode
                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        item.badge === 'AI Vision'
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : item.badge === 'VR Suite'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities Dock */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => {
                audioSynth.playClick();
                onOpenSearch();
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Search Topics & Procedures (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline text-[11px] text-slate-400">Ctrl+K</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl transition ${
                soundEnabled
                  ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={soundEnabled ? 'Synthesizer Audio Enabled' : 'Audio Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Cycle */}
            <button
              onClick={toggleThemeCycle}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs capitalize"
              title={`Current Theme: ${theme}. Click to cycle.`}
            >
              <Palette className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="hidden lg:inline text-[11px]">{theme}</span>
            </button>

            {/* XP and Rank Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900 dark:text-white">{userXP} XP</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                {nurseRank}
              </span>
            </div>

            {/* Owner Mode Quick Toggle */}
            <button
              onClick={() => {
                audioSynth.playClick();
                setActiveTab('owner');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isOwnerMode
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Access Owner Customization Studio"
            >
              {isOwnerMode ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isOwnerMode ? 'Owner Studio' : 'Owner'}</span>
            </button>

            {/* Mobile Burger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    audioSynth.playClick();
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
