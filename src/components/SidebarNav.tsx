import React, { useState, useRef, useEffect } from 'react';
import {
  MAIN_MENU_ITEMS,
  MainTabType,
  MenuItemConfig,
} from './MainMenuDropdown';
import { Sekolah } from '../types';
import { AppTheme } from '../utils/theme';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Database,
  Palette,
  Sun,
  Moon,
  Printer,
  Sparkles,
  Menu,
  X,
  Compass,
  Check,
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  daftarSekolah: Sekolah[];
  sekolahAktif: Sekolah | undefined;
  onSelectSekolah: (id: string) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  theme: AppTheme;
  onToggleDarkMode: () => void;
  onOpenThemeModal: () => void;
  onOpenBackupModal: () => void;
  onTriggerPrint: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  daftarSekolah,
  sekolahAktif,
  onSelectSekolah,
  isMinimized,
  onToggleMinimize,
  isMobileOpen,
  onCloseMobile,
  theme,
  onToggleDarkMode,
  onOpenThemeModal,
  onOpenBackupModal,
  onTriggerPrint,
}) => {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = MAIN_MENU_ITEMS.find((m) => m.id === activeTab) || MAIN_MENU_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (tab: MainTabType) => {
    onSelectTab(tab);
    setIsDropdownMenuOpen(false);
    onCloseMobile();
  };

  const categories = ['Utama', 'Panduan & Keterampilan', 'Administrasi Pangkalan'] as const;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none no-print border-r ${
          theme.isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        } ${
          /* Mobile visibility */
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop width toggle */
          isMinimized ? 'lg:w-[72px]' : 'lg:w-64 xl:w-72'
        }`}
      >
        {/* ============================================================== */}
        {/* TOP BRAND & MINIMIZE CONTROLS */}
        {/* ============================================================== */}
        <div
          className={`h-16 flex items-center px-3.5 border-b shrink-0 justify-between ${
            theme.isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          {/* Logo & Name */}
          <div
            onClick={() => handleItemClick('dashboard')}
            className={`flex items-center gap-2.5 cursor-pointer overflow-hidden ${
              isMinimized ? 'lg:justify-center w-full' : ''
            }`}
            title="PramukaHub — Portal Kegiatan & Panduan Kepramukaan Indonesia"
          >
            <div
              className={`w-9 h-9 rounded-xl ${theme.badgeBg} flex items-center justify-center ${theme.badgeText} font-bold text-base shadow-xs shrink-0 transition-transform hover:scale-105`}
            >
              <span>⚜</span>
            </div>

            {(!isMinimized || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                  PramukaHub
                </span>
                <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 tracking-wider leading-none">
                  Portal Panduan & Giat
                </span>
              </div>
            )}
          </div>

          {/* Minimize / Collapse Desktop Button */}
          <div className="hidden lg:flex items-center">
            <button
              type="button"
              onClick={onToggleMinimize}
              title={isMinimized ? 'Perluas Menu Samping' : 'Kecilkan / Minimize Menu Samping'}
              className={`p-1.5 rounded-lg border text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer ${
                theme.isDark
                  ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isMinimized ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Close button for Mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* DROPDOWN MENU SELECTOR (QUICK ACCESSIBLE POPUP) */}
        {/* ============================================================== */}
        <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80 relative" ref={dropdownRef}>
          {/* Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDropdownMenuOpen(!isDropdownMenuOpen)}
            className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              isDarkDropdown(theme.isDark)
            } ${isMinimized ? 'lg:justify-center lg:px-2' : ''}`}
            title="Pilih Menu Dropdown"
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`p-1 rounded-md shrink-0 ${activeItem.colorClass}`}>
                <ActiveIcon className="w-3.5 h-3.5" />
              </div>
              {(!isMinimized || isMobileOpen) && (
                <div className="text-left truncate">
                  <span className="block text-[9px] uppercase tracking-wider font-semibold opacity-60 leading-none">
                    Menu Aktif
                  </span>
                  <span className="truncate leading-tight block text-slate-900 dark:text-white">
                    {activeItem.title}
                  </span>
                </div>
              )}
            </div>

            {(!isMinimized || isMobileOpen) && (
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 opacity-60 transition-transform duration-200 ${
                  isDropdownMenuOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Floating Dropdown Overlay */}
          {isDropdownMenuOpen && (
            <div
              className={`absolute top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-150 ${
                isMinimized ? 'left-2 w-72' : 'left-2.5 right-2.5'
              }`}
            >
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Daftar Menu Dropdown
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                  {MAIN_MENU_ITEMS.length} Modul
                </span>
              </div>

              <div className="p-1.5 space-y-0.5 max-h-80 overflow-y-auto">
                {MAIN_MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${item.colorClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold shrink-0 ml-1 ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SCHOOL QUICK SELECTOR IN SIDEBAR (WHEN EXPANDED) */}
        {/* ============================================================== */}
        {(!isMinimized || isMobileOpen) && sekolahAktif && (
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1 flex items-center justify-between">
              <span>Pangkalan / Sekolah</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">
                {sekolahAktif.tingkat}
              </span>
            </div>
            <select
              value={sekolahAktif.id}
              onChange={(e) => onSelectSekolah(e.target.value)}
              className="w-full text-xs font-semibold py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {daftarSekolah.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.gudep || 'Gudep'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ============================================================== */}
        {/* MAIN NAVIGATION LIST WITH CATEGORIES */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
          {categories.map((cat) => {
            const catItems = MAIN_MENU_ITEMS.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                {(!isMinimized || isMobileOpen) && (
                  <div className="px-2 pt-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {cat}
                  </div>
                )}

                {catItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      title={item.title}
                      className={`w-full group relative flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? `${theme.primaryBg} ${theme.primaryText} shadow-xs font-bold`
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 shadow-2xs ${
                          isSelected ? 'bg-white/20 text-white' : item.colorClass
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Title & Badge (when expanded) */}
                      {(!isMinimized || isMobileOpen) && (
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate leading-tight">{item.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold shrink-0 ${
                                isSelected
                                  ? 'bg-black/20 text-white'
                                  : item.badgeColor
                              }`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] truncate mt-0.5 ${
                              isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {item.subtitle}
                          </p>
                        </div>
                      )}

                      {/* Tooltip on Minimized Desktop Hover */}
                      {isMinimized && (
                        <div className="hidden lg:group-hover:flex absolute left-full ml-3 z-50 whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 items-center gap-2 pointer-events-none">
                          <span className="font-bold">{item.title}</span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/20">
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* FOOTER ACTIONS (QUICK TOOLS) */}
        {/* ============================================================== */}
        <div
          className={`p-2.5 border-t shrink-0 space-y-1.5 ${
            theme.isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          {/* Quick Print Button */}
          <button
            onClick={onTriggerPrint}
            title="Cetak Laporan / Simpan PDF"
            className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              theme.isDark
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            } ${isMinimized ? 'lg:justify-center' : ''}`}
          >
            <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            {(!isMinimized || isMobileOpen) && <span>Cetak Laporan</span>}
          </button>

          {/* Quick Row for Dark Mode, Theme, Backup */}
          <div
            className={`flex items-center gap-1.5 ${
              isMinimized ? 'lg:flex-col' : 'justify-between'
            }`}
          >
            <button
              onClick={onToggleDarkMode}
              title={theme.isDark ? 'Mode Terang' : 'Mode Gelap'}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer flex-1 flex items-center justify-center"
            >
              {theme.isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>

            <button
              onClick={onOpenThemeModal}
              title="Ganti Tema Warna"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer flex-1 flex items-center justify-center"
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
            </button>

            <button
              onClick={onOpenBackupModal}
              title="Cadangan & Pemulihan Data"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer flex-1 flex items-center justify-center"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

function isDarkDropdown(isDark?: boolean) {
  return isDark
    ? 'bg-slate-800 hover:bg-slate-750 text-slate-100 border-slate-700'
    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200';
}
