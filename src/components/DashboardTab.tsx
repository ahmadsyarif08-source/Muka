import React, { useMemo } from 'react';
import { Sekolah, Siswa, Kegiatan, PembayaranHonor, AbsensiMap } from '../types';
import { MainTabType } from './MainMenuDropdown';
import { AppTheme } from '../utils/theme';
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  Award,
  Banknote,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass,
  Code,
  Tent,
  Shield,
  HelpCircle,
  Music,
  Layers,
  Volume2,
  HeartPulse,
  Bot,
} from 'lucide-react';

interface DashboardTabProps {
  sekolah: Sekolah | undefined;
  daftarSekolah: Sekolah[];
  onSelectSekolahAktif: (id: string) => void;
  siswaList: Siswa[];
  kegiatanList: Kegiatan[];
  honorList: PembayaranHonor[];
  absensi: AbsensiMap;
  onNavigateTab: (tab: MainTabType) => void;
  theme?: AppTheme;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  sekolah,
  daftarSekolah,
  onSelectSekolahAktif,
  siswaList,
  kegiatanList,
  honorList,
  absensi,
  onNavigateTab,
}) => {
  // Current school students
  const filteredSiswa = useMemo(() => {
    if (!sekolah) return [];
    return siswaList.filter((s) => s.sekolahId === sekolah.id);
  }, [siswaList, sekolah]);

  // Current school activities
  const filteredKegiatan = useMemo(() => {
    if (!sekolah) return [];
    return kegiatanList
      .filter((k) => k.sekolahId === sekolah.id)
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [kegiatanList, sekolah]);

  // Current school honors
  const filteredHonor = useMemo(() => {
    if (!sekolah) return [];
    return honorList.filter((h) => h.sekolahId === sekolah.id);
  }, [honorList, sekolah]);

  // Gender breakdown
  const statsGender = useMemo(() => {
    const putra = filteredSiswa.filter((s) => s.jenisKelamin === 'L').length;
    const putri = filteredSiswa.filter((s) => s.jenisKelamin === 'P').length;
    return { putra, putri };
  }, [filteredSiswa]);

  // Regu/Barung breakdown
  const reguMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSiswa.forEach((s) => {
      const reguName = s.regu?.trim() || 'Tanpa Regu';
      map[reguName] = (map[reguName] || 0) + 1;
    });
    return map;
  }, [filteredSiswa]);

  // Overall attendance rate
  const attendanceRate = useMemo(() => {
    if (!sekolah || filteredKegiatan.length === 0 || filteredSiswa.length === 0) return 0;
    let totalPossible = 0;
    let totalPresent = 0;

    filteredKegiatan.forEach((keg) => {
      filteredSiswa.forEach((sis) => {
        const key = `${sekolah.id}_${keg.tanggal}_${sis.id}`;
        const status = absensi[key];
        totalPossible++;
        if (status === 'H') totalPresent++;
      });
    });

    if (totalPossible === 0) return 0;
    return Math.round((totalPresent / totalPossible) * 100);
  }, [sekolah, filteredKegiatan, filteredSiswa, absensi]);

  // Financial summary
  const financialSummary = useMemo(() => {
    const totalHonor = filteredHonor.reduce((acc, h) => acc + (h.totalHonor || 0), 0);
    const lunas = filteredHonor
      .filter((h) => h.statusBayar === 'Lunas')
      .reduce((acc, h) => acc + (h.totalHonor || 0), 0);
    const belumLunas = totalHonor - lunas;
    return { totalHonor, lunas, belumLunas };
  }, [filteredHonor]);

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* HERO BANNER & GREETING */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-r from-amber-700 via-amber-800 to-amber-900 text-white shadow-xl p-6 sm:p-8">
        {/* Decorative scout background watermark */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none text-[180px] leading-none font-bold">
          ⚜
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/60 backdrop-blur-md text-amber-200 text-xs font-semibold border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Satyaku Kudharmakan, Dharmaku Kubaktikan</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Selamat Datang di <span className="text-amber-300">PramukaHub</span>
            </h1>

            <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
              Portal Kegiatan &amp; Panduan Kepramukaan Indonesia. Lengkap dengan materi filosofi, keterampilan sandi &amp; morse, tali-temali, kompas bidik, manajemen perkemahan, lembar SKU-TKK, dan administrasi pangkalan.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-amber-200">
              <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                {todayFormatted}
              </span>
              {sekolah && (
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  Latihan: {sekolah.hariLatihan || 'Belum diatur'} ({sekolah.jamLatihan || '-'})
                </span>
              )}
            </div>
          </div>

          {/* School Switcher Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl md:w-80 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs text-amber-200">
              <span className="font-semibold uppercase tracking-wider">Pangkalan Aktif</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-[11px] font-bold">
                {sekolah?.tingkat || 'Pramuka'}
              </span>
            </div>

            <select
              value={sekolah?.id || ''}
              onChange={(e) => onSelectSekolahAktif(e.target.value)}
              className="w-full bg-slate-900/80 text-white border border-white/30 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {daftarSekolah.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.nama} ({s.gudep || 'Gudep'})
                </option>
              ))}
            </select>

            <div className="text-xs text-amber-100/90 leading-tight space-y-1">
              <div className="truncate">
                <span className="opacity-75">Pembina:</span>{' '}
                <strong className="text-white">
                  {sekolah?.pembina || sekolah?.daftarPembina?.[0] || 'Belum diatur'}
                </strong>
              </div>
              <div className="truncate">
                <span className="opacity-75">Gugus Depan:</span>{' '}
                <strong className="text-white">{sekolah?.gudep || '-'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* QUICK KPI STATISTICS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Siswa */}
        <div
          onClick={() => onNavigateTab('siswa')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-green-400 dark:hover:border-green-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Anggota Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {filteredSiswa.length}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-green-600 dark:text-green-400 font-semibold">
                ♂ {statsGender.putra} Pa
              </span>
              <span>•</span>
              <span className="text-pink-600 dark:text-pink-400 font-semibold">
                ♀ {statsGender.putri} Pi
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Kegiatan */}
        <div
          onClick={() => onNavigateTab('kegiatan')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Jurnal Latihan
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {filteredKegiatan.length}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <span>Pertemuan tercatat</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: Kehadiran */}
        <div
          onClick={() => onNavigateTab('siswa')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tingkat Hadir
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {attendanceRate}%
            </div>
            <div className="mt-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, attendanceRate))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Honor */}
        <div
          onClick={() => onNavigateTab('honor')}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-cyan-400 dark:hover:border-cyan-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Honor Pelatih
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
              {formatRupiah(financialSummary.totalHonor)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
              {financialSummary.belumLunas > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  Belum: {formatRupiah(financialSummary.belumLunas)}
                </span>
              ) : (
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                  ✓ Semua lunas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PANDUAN & KETERAMPILAN KEPRAMUKAAN (FITUR UTAMA) */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Panduan &amp; Keterampilan Kepramukaan
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Materi teknik kepanduan, sandi, kompas, &amp; perkemahan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Dasar & Filosofi */}
          <div
            onClick={() => onNavigateTab('filosofi')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Volume2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                  Audio Nyata
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                Dasar &amp; Filosofi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Dasa Darma 1–10 filosofis, Tri Satya, Tunas Kelapa 1961, serta simulasi suara Tepuk &amp; Peluit Pramuka.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
              <span>Buka Materi Filosofi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Keterampilan Sandi (Sky) */}
          <div
            onClick={() => onNavigateTab('sandi')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Code className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700">
                  Interaktif Sinyal
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Keterampilan Sandi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Penerjemah Morse &amp; senter sinyal, Simulator Semaphore 360°, Sandi Kotak I/II SVG, Sandi Rumput, &amp; AN/AZ.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400">
              <span>Buka Laboratorium Sandi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Tali & Pionering (Emerald) */}
          <div
            onClick={() => onNavigateTab('pionering')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                  Tandu P3K
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Tali &amp; Pionering
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Panduan 10 simpul &amp; ikatan dengan diagram alur tali SVG, serta panduan lengkap pembuatan Tandu Darurat Dragbar.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Buka Tali &amp; Pionering</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Kompas & Menaksir (Yellow) */}
          <div
            onClick={() => onNavigateTab('kompas')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-yellow-400 dark:hover:border-yellow-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                  360° &amp; Kalkulator
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                Kompas &amp; Menaksir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Dial kompas grafis 360° 16 arah mata angin, Azimut/Back-Azimut, serta kalkulator menaksir tinggi pohon &amp; lebar sungai.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-yellow-600 dark:text-yellow-400">
              <span>Buka Kompas &amp; Menaksir</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Manajemen Kemah (Teal) */}
          <div
            onClick={() => onNavigateTab('kemah')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Tent className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                  Persami &amp; Camp
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Manajemen Kemah
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Timeline Rundown Persami (Sabtu-Minggu), manajemen struktur regu, adat perkemahan, &amp; checklist perlengkapan ransel.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
              <span>Buka Manajemen Kemah</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Buku SKU & TKK (Violet) */}
          <div
            onClick={() => onNavigateTab('sku_tkk')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
                  Ramu &amp; 5 Bidang
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                Buku SKU &amp; TKK Digital
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Lembar uji butir SKU Penggalang Ramu dengan validasi penguji, serta katalog TKK 5 bidang warna dan 3 tingkatan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-violet-600 dark:text-violet-400">
              <span>Buka SKU &amp; TKK</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 7: Kuis Cerdas Cermat AI (Rose) */}
          <div
            onClick={() => onNavigateTab('quiz')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                    Excel
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700 flex items-center gap-1">
                    <Bot className="w-3 h-3 text-amber-500" />
                    Kuis AI &amp; Suara
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Kuis Cerdas Cermat AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Kuis interaktif dengan audio umpan balik bunyi benar (chime) &amp; salah (buzz), import Excel (.xlsx), edit bank soal, &amp; generator AI!
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
              <span>Buka Kuis AI &amp; Import Excel</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 8: Panduan P3K & Lagu (Fuchsia) */}
          <div
            onClick={() => onNavigateTab('kuis_lagu')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Music className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-fuchsia-100 dark:bg-fuchsia-900/60 text-fuchsia-800 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-700">
                  P3K &amp; Melodi
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                Panduan P3K &amp; Lagu Pramuka
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Protokol medis P3K lapangan (metode RICE, luka bakar, hipotermia), serta lirik lagu Pramuka dengan pemutar synthesizer melodi nada.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400">
              <span>Buka P3K &amp; Lagu</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* QUICK MODULE ACCESS / MAIN MENU CARDS (ADMINISTRASI GUGUS DEPAN) */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Administrasi &amp; Manajemen Pangkalan
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pengelolaan gugus depan, anggota, presensi, &amp; laporan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Modul 1: Pangkalan (Indigo) */}
          <div
            onClick={() => onNavigateTab('sekolah')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                  {daftarSekolah.length} Sekolah
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Data Sekolah &amp; Pangkalan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Kelola profil gugus depan, kepala sekolah, daftar pembina, jadwal latihan mingguan, dan tarif honor.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Buka Data Sekolah</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Modul 2: Siswa & Presensi (Green) */}
          <div
            onClick={() => onNavigateTab('siswa')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-green-400 dark:hover:border-green-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                  {filteredSiswa.length} Anggota
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Anggota &amp; Presensi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Buku induk anggota, input presensi per latihan, cetak Kartu Tanda Anggota (KTA), dan import file Excel.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-green-600 dark:text-green-400">
              <span>Buka Presensi Siswa</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Modul 3: Jurnal Latihan (Blue) */}
          <div
            onClick={() => onNavigateTab('kegiatan')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                  {filteredKegiatan.length} Jurnal
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Jurnal Latihan Mingguan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Catatan agenda latihan, materi yang disampaikan, nama pelatih bertugas, kendala lapangan, &amp; foto dokumentasi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Buka Jurnal Latihan</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Modul 4: Bank Materi & SKU (Purple) */}
          <div
            onClick={() => onNavigateTab('materi')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                  36 Pertemuan + SKU
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Bank Materi &amp; SKU Siaga
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Silabus 1 tahun lengkap (36 pertemuan latihan) dan 100 butir Syarat Kecakapan Umum (Mula, Bantu, Tata).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
              <span>Buka Silabus &amp; SKU</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Modul 5: Honor Pelatih (Cyan) */}
          <div
            onClick={() => onNavigateTab('honor')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <Banknote className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700">
                  Keuangan Kas
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Honor &amp; Pembayaran
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Perhitungan otomatis honor pelatih berdasarkan jumlah kehadiran latihan, slip honor, dan bukti kwitansi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              <span>Buka Honor Pelatih</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Modul 6: Laporan Resmi (Red) */}
          <div
            onClick={() => onNavigateTab('laporan')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 group-hover:scale-105 transition-transform shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700">
                  Cetak A4 / SPJ
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Laporan Pertanggungjawaban
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Format standar A4 lengkap dengan kop pangkalan, tanda tangan Kepsek &amp; Pembina. Ekspor langsung ke Word, Excel, &amp; PDF.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
              <span>Buka Laporan Resmi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TWO-COLUMN DETAILS: RECENT ACTIVITIES & ROSTER SUMMARY */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Jurnal Latihan */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Jurnal Latihan Terbaru
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('kegiatan')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredKegiatan.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Belum ada jurnal latihan untuk pangkalan ini
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Catat materi latihan pertama Anda sekarang.
              </p>
              <button
                onClick={() => onNavigateTab('kegiatan')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Catat Latihan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKegiatan.slice(0, 4).map((keg, idx) => (
                <div
                  key={keg.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono">
                        {keg.tanggal}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                        {keg.kategoriMateri}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {keg.materi}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span>Pelatih: {keg.pelatih || '-'}</span>
                      <span>•</span>
                      <span>Hadir: {keg.peserta} Siswa</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {keg.statusPelaksanaan || 'Selesai'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Regu / Barung Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Sebaran Regu / Barung
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
              {Object.keys(reguMap).length} Regu
            </span>
          </div>

          {Object.keys(reguMap).length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
              Belum ada data anggota pada pangkalan ini.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {Object.entries(reguMap).map(([regu, count]) => {
                const percentage = Math.round((count / (filteredSiswa.length || 1)) * 100);
                return (
                  <div
                    key={regu}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {regu}
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {count} Siswa ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigateTab('siswa')}
              className="w-full py-2 px-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition-colors cursor-pointer"
            >
              Kelola Buku Induk Siswa →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
