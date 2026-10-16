export type AppThemeId = 'pramuka' | 'emerald' | 'navy' | 'merah_putih' | 'wosm' | 'dark';

export interface AppTheme {
  id: AppThemeId;
  name: string;
  subtitle: string;
  badgeBg: string;
  badgeText: string;
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  primaryLightBg: string;
  primaryLightText: string;
  primaryBorder: string;
  activeTabBorder: string;
  activeTabText: string;
  headerBg: string;
  pageBg: string;
  previewColor: string; // Hex for swatch
  secondaryColor: string;
  isDark?: boolean;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'pramuka',
    name: 'Pramuka Coklat (Pandu)',
    subtitle: 'Warna resmi Praja Muda Karana coklat khas seragam pramuka',
    badgeBg: 'bg-[#5c3a21]',
    badgeText: 'text-amber-300',
    primaryBg: 'bg-[#5c3a21]',
    primaryHover: 'hover:bg-[#482c18]',
    primaryText: 'text-white',
    primaryLightBg: 'bg-amber-100/70',
    primaryLightText: 'text-[#5c3a21]',
    primaryBorder: 'border-amber-700/30',
    activeTabBorder: 'border-[#5c3a21]',
    activeTabText: 'text-[#5c3a21]',
    headerBg: 'bg-white',
    pageBg: 'bg-[#faf7f2]',
    previewColor: '#5c3a21',
    secondaryColor: '#d97706',
  },
  {
    id: 'emerald',
    name: 'Hijau Rimba (Alam)',
    subtitle: 'Nuansa hijau perkemahan & penjelajahan alam terbuka',
    badgeBg: 'bg-emerald-800',
    badgeText: 'text-amber-300',
    primaryBg: 'bg-emerald-800',
    primaryHover: 'hover:bg-emerald-900',
    primaryText: 'text-white',
    primaryLightBg: 'bg-emerald-50',
    primaryLightText: 'text-emerald-900',
    primaryBorder: 'border-emerald-700/30',
    activeTabBorder: 'border-emerald-800',
    activeTabText: 'text-emerald-800',
    headerBg: 'bg-white',
    pageBg: 'bg-slate-50',
    previewColor: '#065f46',
    secondaryColor: '#10b981',
  },
  {
    id: 'navy',
    name: 'Navy Kemendikbud',
    subtitle: 'Nuansa biru resmi instansi pendidikan & kedinasan',
    badgeBg: 'bg-blue-900',
    badgeText: 'text-sky-300',
    primaryBg: 'bg-blue-900',
    primaryHover: 'hover:bg-blue-950',
    primaryText: 'text-white',
    primaryLightBg: 'bg-blue-50',
    primaryLightText: 'text-blue-900',
    primaryBorder: 'border-blue-700/30',
    activeTabBorder: 'border-blue-900',
    activeTabText: 'text-blue-900',
    headerBg: 'bg-white',
    pageBg: 'bg-slate-50',
    previewColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
  },
  {
    id: 'wosm',
    name: 'WOSM Ungu Pandu Dunia',
    subtitle: 'Warna ungu lambang kepanduan internasional (WOSM)',
    badgeBg: 'bg-purple-900',
    badgeText: 'text-purple-200',
    primaryBg: 'bg-purple-900',
    primaryHover: 'hover:bg-purple-950',
    primaryText: 'text-white',
    primaryLightBg: 'bg-purple-50',
    primaryLightText: 'text-purple-900',
    primaryBorder: 'border-purple-700/30',
    activeTabBorder: 'border-purple-900',
    activeTabText: 'text-purple-900',
    headerBg: 'bg-white',
    pageBg: 'bg-[#faf8fd]',
    previewColor: '#581c87',
    secondaryColor: '#9333ea',
  },
  {
    id: 'merah_putih',
    name: 'Merah Putih Semangat',
    subtitle: 'Kombinasi warna bendera kacu leher Merah Putih',
    badgeBg: 'bg-rose-800',
    badgeText: 'text-white',
    primaryBg: 'bg-rose-800',
    primaryHover: 'hover:bg-rose-900',
    primaryText: 'text-white',
    primaryLightBg: 'bg-rose-50',
    primaryLightText: 'text-rose-900',
    primaryBorder: 'border-rose-700/30',
    activeTabBorder: 'border-rose-800',
    activeTabText: 'text-rose-800',
    headerBg: 'bg-white',
    pageBg: 'bg-slate-50',
    previewColor: '#9f1239',
    secondaryColor: '#f43f5e',
  },
  {
    id: 'dark',
    name: 'Mode Gelap (Perkemahan)',
    subtitle: 'Suasana malam api unggun dengan kontras ramah mata',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-slate-950',
    primaryBg: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-700',
    primaryText: 'text-slate-950',
    primaryLightBg: 'bg-slate-800',
    primaryLightText: 'text-amber-400',
    primaryBorder: 'border-slate-700',
    activeTabBorder: 'border-amber-400',
    activeTabText: 'text-amber-400',
    headerBg: 'bg-slate-900 border-slate-800 text-slate-100',
    pageBg: 'bg-slate-950 text-slate-100',
    previewColor: '#0f172a',
    secondaryColor: '#d97706',
    isDark: true,
  },
];

const THEME_STORAGE_KEY = 'sipramuka_theme_v1';

export const loadSavedTheme = (): AppTheme => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppThemeId;
    if (saved) {
      const found = APP_THEMES.find((t) => t.id === saved);
      if (found) return found;
    }
  } catch (e) {
    // fallback
  }
  return APP_THEMES[0]; // Default to Pramuka Coklat
};

export const saveTheme = (themeId: AppThemeId) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (e) {
    // ignore
  }
};
