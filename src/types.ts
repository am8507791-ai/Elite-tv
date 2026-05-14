export interface Channel {
  id: string;
  name: string;
  logo?: string;
  streamUrl: string;
}

export interface CompletedMatch {
  id: string;
  title: string;
  thumbnail?: string;
  hindiLink?: string;
  englishLink?: string;
  createdAt?: any;
}

export interface Recommendation {
  id: string;
  title: string;
  logo?: string;
  thumbnail?: string;
  type: 'live' | 'completed';
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'theme-orange' | 'theme-indigo' | 'theme-emerald' | 'theme-rose' | 'theme-amber';

export interface ThemeState {
  theme: ThemeMode;
  accent: AccentColor;
}
