import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, AccentColor, ThemeState } from '../types';

interface ThemeContextType extends ThemeState {
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ACCENT_MAP: Record<AccentColor, string> = {
  'theme-orange': '#f06225',
  'theme-indigo': '#6366f1',
  'theme-emerald': '#10b981',
  'theme-rose': '#f43f5e',
  'theme-amber': '#f59e0b',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme-mode') as ThemeMode) || 'dark';
  });
  
  const [accent, setAccent] = useState<AccentColor>(() => {
    return (localStorage.getItem('theme-accent') as AccentColor) || 'theme-orange';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme-mode', theme);

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--primary', ACCENT_MAP[accent]);
    // Also set hex values for Tailwind if needed via data attribute or similar
    root.setAttribute('data-accent', accent);
    localStorage.setItem('theme-accent', accent);
  }, [accent]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
