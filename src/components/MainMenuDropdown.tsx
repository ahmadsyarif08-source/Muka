import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Code,
  Compass,
  Tent,
  Award,
  HelpCircle,
  Building2,
  Users,
  BookOpen,
  Banknote,
  FileText,
  ChevronDown,
  Check,
  X,
  Menu,
  Shield,
  Layers,
  Music,
} from 'lucide-react';

export type MainTabType =
  | 'dashboard'
  | 'filosofi'
  | 'sandi'
  | 'pionering'
  | 'kompas'
  | 'kemah'
  | 'sku_tkk'
  | 'quiz'
  | 'kuis_lagu'
  | 'sekolah'
  | 'siswa'
  | 'kegiatan'
  | 'materi'
  | 'honor'
  | 'laporan';

export interface MenuItemConfig {
  id: MainTabType;
  title: string;
  subtitle: string;
  category: 'Utama' | 'Panduan & Keterampilan' | 'Administrasi Pangkalan';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  colorClass: string; // Icon container classes (bg, text, border)
  iconColor: string; // Plain text icon color
  badgeColor: string; // Badge badge background & text
  borderHover: string; // Card or button border hover class
  accentBg: string; // Active or highlighted background accent
}

export const MAIN_MENU_ITEMS: MenuItemConfig[] = [
  // Utama
  {
    id: 'dashboard',
    title: 'Dashboard Utama',
    subtitle: 'Ikhtisar pangkalan, statistik anggota, & jalan pintas modul',
    category: 'Utama',
    icon: LayoutDashboard,
    badge: 'Beranda',
    colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
    borderHover: 'hover:border-amber-400 dark:hover:border-amber-500',
    accentBg: 'bg-amber-500',
  },

  // Panduan & Keterampilan
  {
    id: 'filosofi',
    title: 'Dasar & Filosofi',
    subtitle: 'Dasa Darma (1-10), Tri Satya, Tunas Kelapa, & Audio Peluit/Tepuk',
    category: 'Panduan & Keterampilan',
    icon: Sparkles,
    badge: 'Dasa Darma',
    colorClass: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badgeColor: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700',
    borderHover: 'hover:border-orange-400 dark:hover:border-orange-500',
    accentBg: 'bg-orange-500',
  },
  {
    id: 'sandi',
    title: 'Keterampilan Sandi',
    subtitle: 'Morse audio/senter, Semaphore 360°, Sandi Kotak SVG, & Rumput',
    category: 'Panduan & Keterampilan',
    icon: Code,
    badge: 'Morse & Senter',
    colorClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    iconColor: 'text-sky-600 dark:text-sky-400',
    badgeColor: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700',
    borderHover: 'hover:border-sky-400 dark:hover:border-sky-500',
    accentBg: 'bg-sky-500',
  },
  {
    id: 'pionering',
    title: 'Tali & Pionering',
    subtitle: '10 Simpul & Ikatan alur SVG serta panduan Tandu Darurat Dragbar',
    category: 'Panduan & Keterampilan',
    icon: Layers,
    badge: 'Tandu & Simpul',
    colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
    borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    accentBg: 'bg-emerald-500',
  },
  {
    id: 'kompas',
    title: 'Kompas & Menaksir',
    subtitle: 'Dial 360°, Azimut & Back-Azimut, Tinggi Pohon tongkat 160cm',
    category: 'Panduan & Keterampilan',
    icon: Compass,
    badge: '360° & Azimut',
    colorClass: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    badgeColor: 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
    borderHover: 'hover:border-yellow-400 dark:hover:border-yellow-500',
    accentBg: 'bg-yellow-500',
  },
  {
    id: 'kemah',
    title: 'Manajemen Kemah',
    subtitle: 'Rundown Persami interaktif, Struktur Regu, & Checklist Ransel',
    category: 'Panduan & Keterampilan',
    icon: Tent,
    badge: 'Persami & Camp',
    colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
    iconColor: 'text-teal-600 dark:text-teal-400',
    badgeColor: 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700',
    borderHover: 'hover:border-teal-400 dark:hover:border-teal-500',
    accentBg: 'bg-teal-500',
  },
  {
    id: 'sku_tkk',
    title: 'Buku SKU & TKK',
    subtitle: 'Lembar uji butir Ramu + penguji, Katalog TKK 5 Bidang & 3 Tingkat',
    category: 'Panduan & Keterampilan',
    icon: Shield,
    badge: 'SKU & TKK',
    colorClass: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800',
    iconColor: 'text-violet-600 dark:text-violet-400',
    badgeColor: 'bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-700',
    borderHover: 'hover:border-violet-400 dark:hover:border-violet-500',
    accentBg: 'bg-violet-500',
  },
  {
    id: 'quiz',
    title: 'Kuis & Cerdas Cermat AI',
    subtitle: 'Kuis interaktif bersuara benar/salah, edit bank soal, & buat soal baru dengan AI',
    category: 'Panduan & Keterampilan',
    icon: HelpCircle,
    badge: 'Kuis AI & Suara',
    colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badgeColor: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
    borderHover: 'hover:border-rose-400 dark:hover:border-rose-500',
    accentBg: 'bg-rose-500',
  },
  {
    id: 'kuis_lagu',
    title: 'Panduan P3K & Lagu Pramuka',
    subtitle: 'Koleksi penanganan darurat P3K dan pemutar lagu Pramuka synthesizer melodi',
    category: 'Panduan & Keterampilan',
    icon: Music,
    badge: 'P3K & Melodi',
    colorClass: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/60 border-fuchsia-200 dark:border-fuchsia-800',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    badgeColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/60 text-fuchsia-800 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-700',
    borderHover: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-500',
    accentBg: 'bg-fuchsia-500',
  },

  // Administrasi Pangkalan
  {
    id: 'sekolah',
    title: 'Data Sekolah & Gudep',
    subtitle: 'Profil pangkalan, kepala sekolah, & pembina gudep',
    category: 'Administrasi Pangkalan',
    icon: Building2,
    badge: 'Pangkalan',
    colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    badgeColor: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700',
    borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-500',
    accentBg: 'bg-indigo-500',
  },
  {
    id: 'siswa',
    title: 'Anggota & Presensi',
    subtitle: 'Buku induk, KTA digital, statistik, & presensi latihan',
    category: 'Administrasi Pangkalan',
    icon: Users,
    badge: 'Siswa',
    colorClass: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/60 border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    badgeColor: 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700',
    borderHover: 'hover:border-green-400 dark:hover:border-green-500',
    accentBg: 'bg-green-500',
  },
  {
    id: 'kegiatan',
    title: 'Jurnal Latihan',
    subtitle: 'Pencatatan materi mingguan, presensi, & dokumentasi',
    category: 'Administrasi Pangkalan',
    icon: BookOpen,
    badge: 'Mingguan',
    colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
    borderHover: 'hover:border-blue-400 dark:hover:border-blue-500',
    accentBg: 'bg-blue-500',
  },
  {
    id: 'materi',
    title: 'Bank Materi Siaga',
    subtitle: 'Silabus 1 tahun (36 pertemuan) & 100 butir SKU Siaga',
    category: 'Administrasi Pangkalan',
    icon: Award,
    badge: 'Siaga 36 Pertemuan',
    colorClass: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badgeColor: 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700',
    borderHover: 'hover:border-purple-400 dark:hover:border-purple-500',
    accentBg: 'bg-purple-500',
  },
  {
    id: 'honor',
    title: 'Honor Pelatih',
    subtitle: 'Perhitungan honor per pertemuan & status pembayaran',
    category: 'Administrasi Pangkalan',
    icon: Banknote,
    badge: 'Keuangan',
    colorClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700',
    borderHover: 'hover:border-cyan-400 dark:hover:border-cyan-500',
    accentBg: 'bg-cyan-500',
  },
  {
    id: 'laporan',
    title: 'Laporan Resmi A4',
    subtitle: 'Cetak jurnal, presensi, honor ke Word, Excel, & PDF',
    category: 'Administrasi Pangkalan',
    icon: FileText,
    badge: 'Cetak A4',
    colorClass: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    badgeColor: 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700',
    borderHover: 'hover:border-red-400 dark:hover:border-red-500',
    accentBg: 'bg-red-500',
  },
];

interface MainMenuDropdownProps {
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  isDark?: boolean;
}

export const MainMenuDropdown: React.FC<MainMenuDropdownProps> = ({
  activeTab,
  onSelectTab,
  isDark = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = MAIN_MENU_ITEMS.find((m) => m.id === activeTab) || MAIN_MENU_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-2xs ${
          isDark
            ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
        }`}
        title="Buka Menu Dropdown"
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border shrink-0 ${activeItem.colorClass}`}>
            <ActiveIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60 leading-none">
              Menu Aktif:
            </span>
            <span className="leading-snug">{activeItem.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800 ml-1">
          <span
            className={`hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {activeItem.badge}
          </span>
          <ChevronDown
            className={`w-4 h-4 opacity-70 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150 text-slate-800 dark:text-slate-100">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Menu PramukaHub
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {MAIN_MENU_ITEMS.length} Modul Kegiatan & Administrasi
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto">
            {MAIN_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-2xs'
                      : `border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 ${item.borderHover}`
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl border shrink-0 transition-transform ${
                      isSelected
                        ? `${item.colorClass} shadow-xs scale-105 ring-2 ring-amber-400/50`
                        : item.colorClass
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
