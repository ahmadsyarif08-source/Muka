import React from 'react';
import { MainTabType, MAIN_MENU_ITEMS, MenuItemConfig } from './MainMenuDropdown';
import {
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  Compass,
  Tent,
  Code,
  Volume2,
  Users,
  Building2,
  BookOpen,
  Award,
  Banknote,
  FileText,
  HelpCircle,
  Music,
  CheckCircle2,
} from 'lucide-react';

export interface HeaderBadge {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'highlight' | 'accent' | 'emerald';
}

interface MainModuleHeaderProps {
  tabId: MainTabType;
  titleOverride?: string;
  subtitleOverride?: string;
  customBadges?: HeaderBadge[];
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

// Module Theme Configuration (15 Unique Distinct Themes)
export const MODULE_HEADER_THEMES: Record<
  MainTabType,
  {
    gradientClass: string;
    iconBoxBg: string;
    iconColor: string;
    accentPillBg: string;
    accentPillText: string;
    watermark: string;
    tagline: string;
    glowColor: string;
  }
> = {
  dashboard: {
    gradientClass: 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950',
    iconBoxBg: 'bg-amber-500/20 border-amber-400/30',
    iconColor: 'text-amber-300',
    accentPillBg: 'bg-amber-600/60 border-amber-500/40',
    accentPillText: 'text-amber-200',
    watermark: '⚜',
    tagline: 'Satyaku Kudharmakan, Dharmaku Kubaktikan',
    glowColor: 'shadow-amber-900/30',
  },
  filosofi: {
    gradientClass: 'bg-gradient-to-r from-orange-700 via-orange-800 to-amber-950',
    iconBoxBg: 'bg-orange-500/20 border-orange-400/30',
    iconColor: 'text-orange-300',
    accentPillBg: 'bg-orange-600/60 border-orange-500/40',
    accentPillText: 'text-orange-200',
    watermark: '⚜',
    tagline: 'Pondasi Moral & Karakter Bangsa',
    glowColor: 'shadow-orange-900/30',
  },
  sandi: {
    gradientClass: 'bg-gradient-to-r from-sky-700 via-sky-800 to-blue-950',
    iconBoxBg: 'bg-sky-500/20 border-sky-400/30',
    iconColor: 'text-sky-300',
    accentPillBg: 'bg-sky-600/60 border-sky-500/40',
    accentPillText: 'text-sky-200',
    watermark: '•• -',
    tagline: 'Komunikasi Rahasia & Senter Sinyal',
    glowColor: 'shadow-sky-900/30',
  },
  pionering: {
    gradientClass: 'bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-950',
    iconBoxBg: 'bg-emerald-500/20 border-emerald-400/30',
    iconColor: 'text-emerald-300',
    accentPillBg: 'bg-emerald-600/60 border-emerald-500/40',
    accentPillText: 'text-emerald-200',
    watermark: '☍',
    tagline: 'Ketangkasan Simpul, Ikatan, & Tandu Darurat',
    glowColor: 'shadow-emerald-900/30',
  },
  kompas: {
    gradientClass: 'bg-gradient-to-r from-yellow-600 via-amber-700 to-amber-950',
    iconBoxBg: 'bg-yellow-500/20 border-yellow-400/30',
    iconColor: 'text-yellow-300',
    accentPillBg: 'bg-yellow-600/60 border-yellow-500/40',
    accentPillText: 'text-yellow-200',
    watermark: '🧭',
    tagline: 'Orientasi Medan 360° & Kalkulator Menaksir',
    glowColor: 'shadow-yellow-900/30',
  },
  kemah: {
    gradientClass: 'bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-950',
    iconBoxBg: 'bg-teal-500/20 border-teal-400/30',
    iconColor: 'text-teal-300',
    accentPillBg: 'bg-teal-600/60 border-teal-500/40',
    accentPillText: 'text-teal-200',
    watermark: '⛺',
    tagline: 'Perkemahan Sabtu-Minggu (Persami) & Regu',
    glowColor: 'shadow-teal-900/30',
  },
  sku_tkk: {
    gradientClass: 'bg-gradient-to-r from-violet-800 via-purple-900 to-indigo-950',
    iconBoxBg: 'bg-violet-500/20 border-violet-400/30',
    iconColor: 'text-violet-300',
    accentPillBg: 'bg-violet-600/60 border-violet-500/40',
    accentPillText: 'text-violet-200',
    watermark: '🛡',
    tagline: 'Syarat Kecakapan Umum & Khusus Digital',
    glowColor: 'shadow-violet-900/30',
  },
  quiz: {
    gradientClass: 'bg-gradient-to-r from-rose-700 via-pink-800 to-red-950',
    iconBoxBg: 'bg-rose-500/20 border-rose-400/30',
    iconColor: 'text-rose-300',
    accentPillBg: 'bg-rose-600/60 border-rose-500/40',
    accentPillText: 'text-rose-200',
    watermark: '❓',
    tagline: 'Cerdas Cermat AI & Audio Nyata Benar/Salah',
    glowColor: 'shadow-rose-900/30',
  },
  kuis_lagu: {
    gradientClass: 'bg-gradient-to-r from-fuchsia-700 via-pink-800 to-purple-950',
    iconBoxBg: 'bg-fuchsia-500/20 border-fuchsia-400/30',
    iconColor: 'text-fuchsia-300',
    accentPillBg: 'bg-fuchsia-600/60 border-fuchsia-500/40',
    accentPillText: 'text-fuchsia-200',
    watermark: '♫',
    tagline: 'Protokol Medis P3K & Synthesizer Lagu Pramuka',
    glowColor: 'shadow-fuchsia-900/30',
  },
  sekolah: {
    gradientClass: 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-950',
    iconBoxBg: 'bg-indigo-500/20 border-indigo-400/30',
    iconColor: 'text-indigo-300',
    accentPillBg: 'bg-indigo-600/60 border-indigo-500/40',
    accentPillText: 'text-indigo-200',
    watermark: '🏫',
    tagline: 'Basis Administrasi Pangkalan & Gugus Depan',
    glowColor: 'shadow-indigo-900/30',
  },
  siswa: {
    gradientClass: 'bg-gradient-to-r from-green-700 via-emerald-800 to-teal-950',
    iconBoxBg: 'bg-green-500/20 border-green-400/30',
    iconColor: 'text-green-300',
    accentPillBg: 'bg-green-600/60 border-green-500/40',
    accentPillText: 'text-green-200',
    watermark: '👥',
    tagline: 'Buku Induk Anggota, KTA Digital, & Presensi',
    glowColor: 'shadow-green-900/30',
  },
  kegiatan: {
    gradientClass: 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-950',
    iconBoxBg: 'bg-blue-500/20 border-blue-400/30',
    iconColor: 'text-blue-300',
    accentPillBg: 'bg-blue-600/60 border-blue-500/40',
    accentPillText: 'text-blue-200',
    watermark: '📖',
    tagline: 'Jurnal Acara Latihan & Dokumentasi Mingguan',
    glowColor: 'shadow-blue-900/30',
  },
  materi: {
    gradientClass: 'bg-gradient-to-r from-purple-700 via-purple-800 to-violet-950',
    iconBoxBg: 'bg-purple-500/20 border-purple-400/30',
    iconColor: 'text-purple-300',
    accentPillBg: 'bg-purple-600/60 border-purple-500/40',
    accentPillText: 'text-purple-200',
    watermark: '🎖',
    tagline: 'Silabus 36 Pertemuan Siaga & Bank Materi',
    glowColor: 'shadow-purple-900/30',
  },
  honor: {
    gradientClass: 'bg-gradient-to-r from-cyan-700 via-teal-800 to-slate-950',
    iconBoxBg: 'bg-cyan-500/20 border-cyan-400/30',
    iconColor: 'text-cyan-300',
    accentPillBg: 'bg-cyan-600/60 border-cyan-500/40',
    accentPillText: 'text-cyan-200',
    watermark: '💵',
    tagline: 'Perhitungan Honor Pertemuan & Slip Pembayaran',
    glowColor: 'shadow-cyan-900/30',
  },
  laporan: {
    gradientClass: 'bg-gradient-to-r from-red-700 via-rose-800 to-amber-950',
    iconBoxBg: 'bg-red-500/20 border-red-400/30',
    iconColor: 'text-red-300',
    accentPillBg: 'bg-red-600/60 border-red-500/40',
    accentPillText: 'text-red-200',
    watermark: '📑',
    tagline: 'Cetak Laporan Pertanggungjawaban Resmi A4',
    glowColor: 'shadow-red-900/30',
  },
};

export const MainModuleHeader: React.FC<MainModuleHeaderProps> = ({
  tabId,
  titleOverride,
  subtitleOverride,
  customBadges,
  rightAction,
  children,
}) => {
  const itemConfig = MAIN_MENU_ITEMS.find((m) => m.id === tabId) || MAIN_MENU_ITEMS[0];
  const theme = MODULE_HEADER_THEMES[tabId] || MODULE_HEADER_THEMES.dashboard;
  const Icon = itemConfig.icon;

  const title = titleOverride || itemConfig.title;
  const subtitle = subtitleOverride || itemConfig.subtitle;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl ${theme.gradientClass} text-white shadow-xl ${theme.glowColor} p-5 sm:p-7 lg:p-8 animate-in fade-in duration-200 select-none`}
    >
      {/* Decorative scout background watermark */}
      <div className="absolute -right-6 -bottom-10 opacity-10 pointer-events-none select-none text-[160px] sm:text-[200px] leading-none font-bold">
        {theme.watermark}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {/* Top category & tagline pill */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.accentPillBg} backdrop-blur-md ${theme.accentPillText} text-xs font-semibold border`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{theme.tagline}</span>
            </div>

            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/20 text-white/90 border border-white/10 font-medium">
              {itemConfig.category}
            </span>
          </div>

          {/* Icon + Title block */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            <div
              className={`p-3 sm:p-3.5 rounded-2xl ${theme.iconBoxBg} ${theme.iconColor} border shadow-inner backdrop-blur-md shrink-0 transition-transform hover:scale-105`}
            >
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/15 text-white/90">
                  {itemConfig.badge}
                </span>
                <span className="text-xs text-white/70 hidden sm:inline">•</span>
                <span className="text-xs text-white/80 hidden sm:inline">
                  PramukaHub Portal Indonesia
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-2xl pt-0.5">
            {subtitle}
          </p>

          {/* Dynamic Badges / Info Chips */}
          {customBadges && customBadges.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {customBadges.map((badge, idx) => {
                const BadgeIcon = badge.icon || CheckCircle2;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10 text-white/95 text-xs font-medium"
                  >
                    <BadgeIcon className="w-3.5 h-3.5 opacity-90" />
                    <span>{badge.label}</span>
                  </span>
                );
              })}
            </div>
          )}

          {children}
        </div>

        {/* Right action area */}
        {rightAction && (
          <div className="shrink-0 flex items-center lg:self-center gap-2 pt-2 lg:pt-0">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
};
