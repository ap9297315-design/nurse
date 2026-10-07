import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  currentTheme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  userXP: number;
  xp: number;
  level: number;
  addXP: (amount: number) => void;
  nurseRank: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nursesphere_theme');
    return (saved as ThemeMode) || 'clinical';
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('nursesphere_sound') !== 'false';
  });

  const [userXP, setUserXP] = useState<number>(() => {
    const saved = localStorage.getItem('nursesphere_xp');
    return saved ? parseInt(saved, 10) : 180;
  });

  useEffect(() => {
    localStorage.setItem('nursesphere_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-clinical', 'theme-night', 'theme-surgical', 'theme-warm', 'dark');

    if (theme === 'night') {
      root.classList.add('dark', 'theme-night');
    } else {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    const themes: ThemeMode[] = ['clinical', 'night', 'surgical', 'warm'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('nursesphere_sound', enabled ? 'true' : 'false');
  };

  const addXP = (amount: number) => {
    setUserXP((prev) => {
      const next = prev + amount;
      localStorage.setItem('nursesphere_xp', next.toString());
      return next;
    });
  };

  const getNurseRank = (xp: number) => {
    if (xp < 300) return 'Student Nurse (Year IV)';
    if (xp < 800) return 'Junior Staff Nurse';
    if (xp < 1600) return 'Senior Clinical Specialist';
    if (xp < 2500) return 'Ward Sister / In-Charge';
    if (xp < 4000) return 'Nurse Practitioner (NP)';
    return 'Chief Nursing Officer (CNO)';
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme: theme,
        setTheme,
        toggleTheme,
        soundEnabled,
        setSoundEnabled,
        userXP,
        xp: userXP,
        level: Math.floor(userXP / 200) + 1,
        addXP,
        nurseRank: getNurseRank(userXP),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
