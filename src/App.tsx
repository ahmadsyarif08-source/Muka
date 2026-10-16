import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Sekolah, Siswa, Kegiatan, StatusAbsensi, PembayaranHonor } from './types';
import { loadState, saveState } from './utils/storage';
import { AppTheme, loadSavedTheme, saveTheme, APP_THEMES } from './utils/theme';
import { DashboardTab } from './components/DashboardTab';
import { FilosofiTab } from './components/FilosofiTab';
import { SandiTab } from './components/SandiTab';
import { PioneringTab } from './components/PioneringTab';
import { KompasTab } from './components/KompasTab';
import { KemahTab } from './components/KemahTab';
import { SkuTkkTab } from './components/SkuTkkTab';
import { QuizTab } from './components/QuizTab';
import { KuisLaguTab } from './components/KuisLaguTab';
import { SekolahTab } from './components/SekolahTab';
import { SiswaTab } from './components/SiswaTab';
import { KegiatanTab } from './components/KegiatanTab';
import { MateriTab } from './components/MateriTab';
import { HonorTab } from './components/HonorTab';
import { LaporanTab } from './components/LaporanTab';
import { BackupModal } from './components/BackupModal';
import { ThemeModal } from './components/ThemeModal';
import { SidebarNav } from './components/SidebarNav';
import { MainTabType, MAIN_MENU_ITEMS, MainMenuDropdown } from './components/MainMenuDropdown';
import { MateriSiapPakai } from './data/materiBank';
import {
  Menu,
  Printer,
  Palette,
  Sun,
  Moon,
  Database,
  Building2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [theme, setTheme] = useState<AppTheme>(() => loadSavedTheme());
  const [activeTab, setActiveTab] = useState<MainTabType>('dashboard');
  const [selectedMateriToApply, setSelectedMateriToApply] = useState<MateriSiapPakai | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(() => {
    return localStorage.getItem('sipramuka_sidebar_minimized') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebarMinimize = () => {
    setIsSidebarMinimized((prev) => {
      const next = !prev;
      localStorage.setItem('sipramuka_sidebar_minimized', String(next));
      return next;
    });
  };

  // Sync HTML dark class
  useEffect(() => {
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme.isDark]);

  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    saveTheme(newTheme.id);
  };

  const handleToggleDarkMode = () => {
    if (theme.isDark) {
      const lightTheme = APP_THEMES.find((t) => !t.isDark) || APP_THEMES[0];
      handleSelectTheme(lightTheme);
    } else {
      const darkTheme = APP_THEMES.find((t) => t.isDark) || APP_THEMES[5];
      handleSelectTheme(darkTheme);
    }
  };

  // Auto-save whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Active School helper
  const sekolahAktif = useMemo(() => {
    return state.daftarSekolah.find((s) => s.id === state.sekolahAktifId) || state.daftarSekolah[0];
  }, [state.daftarSekolah, state.sekolahAktifId]);

  // Counts per school for dashboard
  const jumlahSiswaMap = useMemo(() => {
    const map: Record<string, number> = {};
    state.siswa.forEach((s) => {
      map[s.sekolahId] = (map[s.sekolahId] || 0) + 1;
    });
    return map;
  }, [state.siswa]);

  const jumlahKegiatanMap = useMemo(() => {
    const map: Record<string, number> = {};
    state.kegiatan.forEach((k) => {
      map[k.sekolahId] = (map[k.sekolahId] || 0) + 1;
    });
    return map;
  }, [state.kegiatan]);

  // Attendance count getter for any date
  const getAttendanceCountForDate = (skId: string, tgl: string): number => {
    let count = 0;
    const prefix = `${skId}_${tgl}_`;
    Object.entries(state.absensi).forEach(([k, status]) => {
      if (k.startsWith(prefix) && status === 'H') {
        count++;
      }
    });
    return count;
  };

  // State Mutators
  const handleSelectSekolahAktif = (id: string) => {
    setState((prev) => ({ ...prev, sekolahAktifId: id }));
  };

  const handleAddSekolah = (newSekolah: Sekolah) => {
    setState((prev) => ({
      ...prev,
      daftarSekolah: [...prev.daftarSekolah, newSekolah],
      sekolahAktifId: prev.sekolahAktifId || newSekolah.id,
    }));
  };

  const handleUpdateSekolah = (updated: Sekolah) => {
    setState((prev) => ({
      ...prev,
      daftarSekolah: prev.daftarSekolah.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const handleDeleteSekolah = (id: string) => {
    setState((prev) => {
      const nextList = prev.daftarSekolah.filter((s) => s.id !== id);
      const nextActiveId = prev.sekolahAktifId === id ? (nextList[0]?.id || '') : prev.sekolahAktifId;
      return {
        ...prev,
        daftarSekolah: nextList,
        sekolahAktifId: nextActiveId,
        siswa: prev.siswa.filter((s) => s.sekolahId !== id),
        kegiatan: prev.kegiatan.filter((k) => k.sekolahId !== id),
        honor: prev.honor.filter((h) => h.sekolahId !== id),
      };
    });
  };

  // Pembina Management Mutators
  const handleAddPembinaToSekolah = (sekolahId: string, namaPembina: string) => {
    setState((prev) => ({
      ...prev,
      daftarSekolah: prev.daftarSekolah.map((s) => {
        if (s.id !== sekolahId) return s;
        const currentList = s.daftarPembina && s.daftarPembina.length > 0 
          ? [...s.daftarPembina] 
          : (s.pembina ? [s.pembina] : []);
        if (currentList.includes(namaPembina.trim())) return s;
        return {
          ...s,
          daftarPembina: [...currentList, namaPembina.trim()],
          pembina: s.pembina || namaPembina.trim(),
        };
      }),
    }));
  };

  const handleRemovePembinaFromSekolah = (sekolahId: string, namaPembina: string) => {
    setState((prev) => ({
      ...prev,
      daftarSekolah: prev.daftarSekolah.map((s) => {
        if (s.id !== sekolahId) return s;
        const currentList = s.daftarPembina && s.daftarPembina.length > 0 
          ? [...s.daftarPembina] 
          : (s.pembina ? [s.pembina] : []);
        const filtered = currentList.filter((p) => p !== namaPembina);
        return {
          ...s,
          daftarPembina: filtered,
          pembina: s.pembina === namaPembina ? (filtered[0] || '') : s.pembina,
        };
      }),
    }));
  };

  // Student Mutators
  const handleAddSiswa = (newSiswa: Siswa) => {
    setState((prev) => ({ ...prev, siswa: [...prev.siswa, newSiswa] }));
  };

  const handleAddBatchSiswa = (newSiswaList: Siswa[]) => {
    setState((prev) => ({ ...prev, siswa: [...prev.siswa, ...newSiswaList] }));
  };

  const handleReplaceSiswa = (sekolahId: string, newSiswaList: Siswa[]) => {
    setState((prev) => ({
      ...prev,
      siswa: [...prev.siswa.filter((s) => s.sekolahId !== sekolahId), ...newSiswaList],
    }));
  };

  const handleUpdateSiswa = (updated: Siswa) => {
    setState((prev) => ({
      ...prev,
      siswa: prev.siswa.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const handleDeleteSiswa = (id: string) => {
    setState((prev) => {
      const newAbsensi = { ...prev.absensi };
      Object.keys(newAbsensi).forEach((k) => {
        if (k.endsWith(`_${id}`)) {
          delete newAbsensi[k];
        }
      });
      return {
        ...prev,
        siswa: prev.siswa.filter((s) => s.id !== id),
        absensi: newAbsensi,
      };
    });
  };

  // Attendance Mutators
  const handleUpdateAbsensi = (
    sekolahId: string,
    tanggal: string,
    siswaId: string,
    status: StatusAbsensi | null
  ) => {
    const key = `${sekolahId}_${tanggal}_${siswaId}`;
    setState((prev) => {
      const copy = { ...prev.absensi };
      if (status === null) {
        delete copy[key];
      } else {
        copy[key] = status;
      }
      return { ...prev, absensi: copy };
    });
  };

  const handleBatchSetAbsensi = (sekolahId: string, tanggal: string, status: StatusAbsensi) => {
    setState((prev) => {
      const copy = { ...prev.absensi };
      const targets = prev.siswa.filter((s) => s.sekolahId === sekolahId);
      targets.forEach((s) => {
        const key = `${sekolahId}_${tanggal}_${s.id}`;
        copy[key] = status;
      });
      return { ...prev, absensi: copy };
    });
  };

  // Kegiatan Mutators
  const handleAddKegiatan = (newKegiatan: Kegiatan) => {
    setState((prev) => ({
      ...prev,
      kegiatan: [newKegiatan, ...prev.kegiatan],
    }));
  };

  const handleUpdateKegiatan = (updated: Kegiatan) => {
    setState((prev) => ({
      ...prev,
      kegiatan: prev.kegiatan.map((k) => (k.id === updated.id ? updated : k)),
    }));
  };

  const handleDeleteKegiatan = (id: string) => {
    setState((prev) => ({
      ...prev,
      kegiatan: prev.kegiatan.filter((k) => k.id !== id),
    }));
  };

  // Honor Mutators
  const handleAddHonor = (newHonor: PembayaranHonor) => {
    setState((prev) => ({
      ...prev,
      honor: [newHonor, ...prev.honor],
    }));
  };

  const handleUpdateHonor = (updated: PembayaranHonor) => {
    setState((prev) => ({
      ...prev,
      honor: prev.honor.map((h) => (h.id === updated.id ? updated : h)),
    }));
  };

  const handleDeleteHonor = (id: string) => {
    setState((prev) => ({
      ...prev,
      honor: prev.honor.filter((h) => h.id !== id),
    }));
  };

  const handleRestoreState = (newState: AppState) => {
    setState(newState);
  };

  // Fixed Direct Print Trigger
  const handleTriggerPrint = () => {
    if (activeTab !== 'laporan') {
      setActiveTab('laporan');
      setTimeout(() => {
        window.focus();
        window.print();
      }, 300);
    } else {
      window.focus();
      window.print();
    }
  };

  // Current active menu item configuration
  const currentMenuItem = useMemo(() => {
    return MAIN_MENU_ITEMS.find((m) => m.id === activeTab) || MAIN_MENU_ITEMS[0];
  }, [activeTab]);

  return (
    <div className={`min-h-screen flex ${theme.pageBg} ${theme.isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      {/* ============================================================== */}
      {/* COLLAPSIBLE SIDEBAR ON THE LEFT */}
      {/* ============================================================== */}
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        daftarSekolah={state.daftarSekolah}
        sekolahAktif={sekolahAktif}
        onSelectSekolah={handleSelectSekolahAktif}
        isMinimized={isSidebarMinimized}
        onToggleMinimize={handleToggleSidebarMinimize}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        theme={theme}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenBackupModal={() => setIsBackupOpen(true)}
        onTriggerPrint={handleTriggerPrint}
      />

      {/* ============================================================== */}
      {/* MAIN VIEWPORT (HEADER + CONTENT + FOOTER) */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header
          className={`sticky top-0 z-30 ${theme.headerBg} border-b ${
            theme.isDark ? 'border-slate-800' : 'border-slate-200'
          } shadow-2xs no-print`}
        >
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger & Section breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Buka Menu Samping"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                {/* Active Menu Icon with its distinctive color container and glow */}
                <div
                  className={`p-2 rounded-xl border ${currentMenuItem.colorClass} shadow-xs ring-2 ring-black/5 dark:ring-white/10 flex items-center justify-center shrink-0 transition-transform hover:scale-105`}
                  title={`${currentMenuItem.title} - ${currentMenuItem.category}`}
                >
                  <currentMenuItem.icon className="w-5 h-5" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">PramukaHub</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${currentMenuItem.badgeColor}`}>
                      {currentMenuItem.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      {currentMenuItem.title}
                    </h1>
                    <span className={`hidden sm:inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${currentMenuItem.badgeColor}`}>
                      {currentMenuItem.badge}
                    </span>
                  </div>
                </div>

                {/* Dropdown Menu Switcher in Header */}
                <div className="hidden xl:block ml-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                  <MainMenuDropdown
                    activeTab={activeTab}
                    onSelectTab={setActiveTab}
                    isDark={theme.isDark}
                  />
                </div>
              </div>
            </div>

            {/* Right: Active School Badge & Quick Utilities */}
            <div className="flex items-center gap-2">
              {sekolahAktif && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                    {sekolahAktif.nama}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">
                    {sekolahAktif.tingkat}
                  </span>
                </div>
              )}

              {/* Quick Dark Mode Toggle */}
              <button
                onClick={handleToggleDarkMode}
                title={theme.isDark ? 'Mode Terang' : 'Mode Gelap'}
                className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  theme.isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {theme.isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Theme Selector */}
              <button
                onClick={() => setIsThemeModalOpen(true)}
                title="Ganti Tema Warna"
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  theme.isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">{theme.name.split(' ')[0]}</span>
              </button>

              {/* Backup */}
              <button
                onClick={() => setIsBackupOpen(true)}
                title="Cadangan & Pemulihan Data"
                className={`p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  theme.isDark
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Database className="w-4 h-4 text-slate-500" />
              </button>

              {/* Print Report */}
              <button
                onClick={handleTriggerPrint}
                title="Cetak Laporan / Simpan PDF"
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold ${theme.primaryText} ${theme.primaryBg} ${theme.primaryHover} rounded-xl shadow-xs transition-colors cursor-pointer`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 print:p-0 print:m-0 print:max-w-none print:w-full print:block max-w-7xl w-full mx-auto">
          {/* TAB 1: Main Menu Dashboard Awal */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              sekolah={sekolahAktif}
              daftarSekolah={state.daftarSekolah}
              onSelectSekolahAktif={handleSelectSekolahAktif}
              siswaList={state.siswa}
              kegiatanList={state.kegiatan}
              honorList={state.honor}
              absensi={state.absensi}
              onNavigateTab={setActiveTab}
              theme={theme}
            />
          )}

          {/* TAB PANDUAN: Dasar & Filosofi */}
          {activeTab === 'filosofi' && <FilosofiTab />}

          {/* TAB PANDUAN: Keterampilan Sandi */}
          {activeTab === 'sandi' && <SandiTab />}

          {/* TAB PANDUAN: Tali & Pionering */}
          {activeTab === 'pionering' && <PioneringTab />}

          {/* TAB PANDUAN: Kompas & Menaksir */}
          {activeTab === 'kompas' && <KompasTab />}

          {/* TAB PANDUAN: Manajemen Kemah */}
          {activeTab === 'kemah' && <KemahTab />}

          {/* TAB PANDUAN: Buku Saku SKU & TKK Digital */}
          {activeTab === 'sku_tkk' && <SkuTkkTab />}

          {/* TAB PANDUAN: Kuis Cerdas Cermat AI & Suara */}
          {activeTab === 'quiz' && <QuizTab />}

          {/* TAB PANDUAN: Panduan P3K & Lagu Pramuka */}
          {activeTab === 'kuis_lagu' && <KuisLaguTab />}

          {/* TAB ADMINISTRASI: Data Sekolah */}
          {activeTab === 'sekolah' && (
            <SekolahTab
              daftarSekolah={state.daftarSekolah}
              sekolahAktifId={state.sekolahAktifId}
              onSelectSekolahAktif={handleSelectSekolahAktif}
              onAddSekolah={handleAddSekolah}
              onUpdateSekolah={handleUpdateSekolah}
              onDeleteSekolah={handleDeleteSekolah}
              onAddPembinaToSekolah={handleAddPembinaToSekolah}
              onRemovePembinaFromSekolah={handleRemovePembinaFromSekolah}
              jumlahSiswaMap={jumlahSiswaMap}
              jumlahKegiatanMap={jumlahKegiatanMap}
            />
          )}

          {/* TAB 3: Anggota & Presensi */}
          {activeTab === 'siswa' && (
            <SiswaTab
              sekolah={sekolahAktif}
              daftarSekolah={state.daftarSekolah}
              sekolahAktifId={state.sekolahAktifId}
              onSelectSekolahAktif={handleSelectSekolahAktif}
              siswaList={state.siswa}
              absensi={state.absensi}
              onUpdateAbsensi={handleUpdateAbsensi}
              onBatchSetAbsensi={handleBatchSetAbsensi}
              onAddSiswa={handleAddSiswa}
              onAddBatchSiswa={handleAddBatchSiswa}
              onReplaceSiswa={handleReplaceSiswa}
              onUpdateSiswa={handleUpdateSiswa}
              onDeleteSiswa={handleDeleteSiswa}
              onSyncWithJurnal={() => {
                setActiveTab('kegiatan');
              }}
            />
          )}

          {/* TAB 4: Jurnal Latihan */}
          {activeTab === 'kegiatan' && (
            <KegiatanTab
              sekolah={sekolahAktif}
              daftarSekolah={state.daftarSekolah}
              sekolahAktifId={state.sekolahAktifId}
              onSelectSekolahAktif={handleSelectSekolahAktif}
              kegiatanList={state.kegiatan}
              onAddKegiatan={handleAddKegiatan}
              onUpdateKegiatan={handleUpdateKegiatan}
              onDeleteKegiatan={handleDeleteKegiatan}
              onAddPembinaToSekolah={handleAddPembinaToSekolah}
              onGetAttendanceCountForDate={getAttendanceCountForDate}
              initialMateriPrefill={selectedMateriToApply}
              onClearMateriPrefill={() => setSelectedMateriToApply(null)}
              onOpenBankMateriTab={() => setActiveTab('materi')}
            />
          )}

          {/* TAB 5: Bank Materi & SKU */}
          {activeTab === 'materi' && (
            <MateriTab
              sekolahAktif={sekolahAktif}
              onGunakanMateriDiJurnal={(materi) => {
                setSelectedMateriToApply(materi);
                setActiveTab('kegiatan');
              }}
            />
          )}

          {/* TAB 6: Honor Pelatih */}
          {activeTab === 'honor' && (
            <HonorTab
              daftarSekolah={state.daftarSekolah}
              sekolahAktifId={state.sekolahAktifId}
              onSelectSekolahAktif={handleSelectSekolahAktif}
              kegiatanList={state.kegiatan}
              honorList={state.honor}
              onAddHonor={handleAddHonor}
              onUpdateHonor={handleUpdateHonor}
              onDeleteHonor={handleDeleteHonor}
            />
          )}

          {/* TAB 7: Laporan Resmi */}
          {activeTab === 'laporan' && (
            <LaporanTab
              daftarSekolah={state.daftarSekolah}
              sekolahAktifId={state.sekolahAktifId}
              onSelectSekolahAktif={handleSelectSekolahAktif}
              siswaList={state.siswa}
              kegiatanList={state.kegiatan}
              absensi={state.absensi}
              honorList={state.honor}
              onUpdateSekolah={handleUpdateSekolah}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 PramukaHub · Portal Kegiatan &amp; Panduan Kepramukaan Indonesia</p>
            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
              <span>Siaga, Penggalang, Penegak, &amp; Pandega</span>
              <span>·</span>
              <span>Offline-first Storage</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        state={state}
        onRestoreState={handleRestoreState}
      />

      {/* Theme Selector Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={theme.id}
        onSelectTheme={handleSelectTheme}
      />
    </div>
  );
}
